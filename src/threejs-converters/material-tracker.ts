import * as THREE from 'three';
import { Primitive } from '../tmd/primitive';
import { VRAM } from '../vram/vram';
import { TIM } from '../tim/tim';

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
    if (primitive.isTextured) {
      const textureImageData = this.getTextureFromVRAM(vram, primitive);
      this.setTexturedMaterial(primitive, textureImageData);
    } else {
      this.setNonTexturedMaterial(primitive);
    }

    return this.getMaterialIndex(primitive);
  }

  createMaterialFromTIMAndGetIndex(primitive: Primitive, tims: TIM[]): number {
    if (primitive.isTextured) {
      const textureImageData = this.getTextureFromTIMs(tims, primitive);
      this.setTexturedMaterial(primitive, textureImageData);
    } else {
      this.setNonTexturedMaterial(primitive);
    }
    
    return this.getMaterialIndex(primitive);
  }

  private setNonTexturedMaterial(primitive: Primitive) {
    if (!this.nonTexturedIndex) {
      this.nonTexturedIndex = this.materials.length;

      if (primitive.isLightCalculated) {
        this.materials.push(new THREE.MeshStandardMaterial({ vertexColors: true }));
      } else {
        this.materials.push(new THREE.MeshBasicMaterial({ vertexColors: true }));
      }
      
    }
  }

  private setTexturedMaterial(primitive: Primitive, textureImageData: ImageData) {
    if (this.texturePages[primitive.texturePage].bitsPerPixelToMaterialIndex.get(primitive.textureBitsPerPixel) === undefined) {
      
      var texture = new THREE.DataTexture(textureImageData.data, textureImageData.width, textureImageData.height, THREE.RGBAFormat);
      const nextMaterialIndex = this.materials.length;
      this.texturePages[primitive.texturePage].bitsPerPixelToMaterialIndex.set(primitive.textureBitsPerPixel, nextMaterialIndex);

      let material: THREE.Material;
      if (primitive.isLightCalculated) {
        material = new THREE.MeshStandardMaterial({ vertexColors: true, map: texture });
      } else {
        material = new THREE.MeshBasicMaterial({ vertexColors: true, map: texture });
      }

      this.materials.push(material);
    } 
  }

  private getTextureFromVRAM(vram: VRAM, primitive: Primitive): ImageData {
    return vram.getTexturePageImageData(primitive.textureBitsPerPixel, primitive.texturePage, primitive.textureCLUTXPosition, primitive.textureCLUTYPosition);
  }

  private getTextureFromTIMs(tims: TIM[], primitive: Primitive): ImageData {
    const timToUse = tims.find(tim => tim.texturePage === primitive.texturePage);
    const textureImageData = timToUse.createImageData(primitive.textureCLUTXPosition, primitive.textureCLUTYPosition);
    return textureImageData;
  }

  private getMaterialIndex(primitive: Primitive): number {
    if (primitive.isTextured) {
      return this.texturePages[primitive.texturePage].bitsPerPixelToMaterialIndex.get(primitive.textureBitsPerPixel);
    } else {
      return this.nonTexturedIndex;
    }
  }
}