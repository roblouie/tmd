import * as THREE from 'three';
import { Primitive } from '../tmd/primitive';
import { VRAM } from '../vram/vram';
import { TIM } from '../tim/tim';
import { ExpandedTexturePage } from './expanded-texture-page';

export class MaterialTracker {
  private materials: THREE.Material[];
  private texturePages: { bitsPerPixelToMaterialIndex: Map<number, number> }[];
  private nonTexturedIndex: number;

  constructor() {
    this.materials = [];
    this.texturePages = [];

    for (let i = 0; i < 32; i++) {
      this.texturePages.push({
        bitsPerPixelToMaterialIndex: new Map()
      });
    }
  }

  get objectMaterials(): THREE.Material[] {
    return this.materials
  }

  // Used to still populate materials when no textures are provided. This lets textured models be rendered
  // without having to provide a vram snapshot or tim files.
  createMaterialWithoutTexture(primitive: Primitive) {
    this.setNonTexturedMaterial(primitive);
    return this.nonTexturedIndex; // Right now we just get back the one index, could be improved to account for lighting differences
  }

  createMaterialFromVRAMAndGetIndex(primitive: Primitive, vram: VRAM): number {
    if (primitive.isTextured && vram.vramData.length > 0) {
      if (!this.isTextureAlreadySet(primitive.texturePage!, primitive.textureBitsPerPixel!)) {
        const textureImageData = this.getTextureFromVRAM(vram, primitive);
        this.setTexturedMaterial(primitive, textureImageData);
      }
    } else {
      this.setNonTexturedMaterial(primitive);
    }

    return this.getMaterialIndex(primitive);
  }

  createMaterialFromExpandedTexturePageAndGetIndex(primitive: Primitive, expandedTexturePages: ExpandedTexturePage[]) {
    if (primitive.isTextured && expandedTexturePages.length > 0) {
      if (!this.isTextureAlreadySet(primitive.texturePage!, primitive.textureBitsPerPixel!)) {
        const textureImageData = this.getTextureFromExpandedTexturePages(expandedTexturePages, primitive);
        this.setTexturedMaterial(primitive, textureImageData!);
      }
    } else {
      this.setNonTexturedMaterial(primitive);
    }

    return this.getMaterialIndex(primitive);
  }

  createMaterialFromTIMAndGetIndex(primitive: Primitive, tims: TIM[]): number {
    if (primitive.isTextured && tims.length > 0) {
      if (!this.isTextureAlreadySet(primitive.texturePage!, primitive.textureBitsPerPixel!)) {
        const textureImageData = this.getTextureFromTIMs(tims, primitive);
        this.setTexturedMaterial(primitive, textureImageData!);
      }
    } else {
      this.setNonTexturedMaterial(primitive);
    }

    return this.getMaterialIndex(primitive);
  }

  private setNonTexturedMaterial(primitive: Primitive) {
    if (this.nonTexturedIndex === undefined) {
      this.nonTexturedIndex = this.materials.length;

      if (primitive.isLightCalculated) {
        this.materials.push(new THREE.MeshStandardMaterial({ vertexColors: true }));
      } else {
        this.materials.push(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true }));
      }

    }
  }

  private setTexturedMaterial(primitive: Primitive, textureImageData: ImageData) {
    if (this.texturePages[primitive.texturePage!]?.bitsPerPixelToMaterialIndex.get(primitive.textureBitsPerPixel!) === undefined) {

      var texture = new THREE.DataTexture(textureImageData.data, textureImageData.width, textureImageData.height, THREE.RGBAFormat);
      const nextMaterialIndex = this.materials.length;
      this.texturePages[primitive.texturePage!].bitsPerPixelToMaterialIndex.set(primitive.textureBitsPerPixel!, nextMaterialIndex);

      let material: THREE.Material;
      if (primitive.isLightCalculated) {
        material = new THREE.MeshStandardMaterial({ vertexColors: true, map: texture, transparent: true, alphaTest: 0.3 });
      } else {
        material = new THREE.MeshBasicMaterial({ vertexColors: true, map: texture, transparent: true, alphaTest: 0.3 });
      }

      this.materials.push(material);
    }
  }

  private getTextureFromVRAM(vram: VRAM, primitive: Primitive): ImageData {
    console.log(`Texture Page: ${primitive.texturePage}, CLUT X: ${primitive.textureCLUTXPosition}, CLUT Y: ${primitive.textureCLUTYPosition}`);
    return vram.getTexturePageImageData(primitive.textureBitsPerPixel!, primitive.texturePage!, primitive.textureCLUTXPosition, primitive.textureCLUTYPosition)!;
  }

  private getTextureFromTIMs(tims: TIM[], primitive: Primitive): ImageData | undefined {
    const timToUse = tims.find(tim => tim.texturePage === primitive.texturePage);
    const textureImageData = timToUse?.createImageData(primitive.textureCLUTXPosition, primitive.textureCLUTYPosition);
    return textureImageData;
  }

  private getTextureFromExpandedTexturePages(expandedTexturePages: ExpandedTexturePage[], primitive: Primitive): ImageData {
    const tpageToUse = expandedTexturePages.find(tpage => tpage.texturePage === primitive.texturePage);
    return tpageToUse?.canvasContext.getImageData(0, 0, 256, 256)!;
  }

  private getMaterialIndex(primitive: Primitive): number {
    if (primitive.isTextured) {
      return this.texturePages[primitive.texturePage!].bitsPerPixelToMaterialIndex.get(primitive.textureBitsPerPixel!)!;
    } else {
      return this.nonTexturedIndex;
    }
  }

  private isTextureAlreadySet(texturePage: number, bitsPerPixel: number) {
    return this.texturePages[texturePage]?.bitsPerPixelToMaterialIndex.get(bitsPerPixel) !== undefined;
  }
}