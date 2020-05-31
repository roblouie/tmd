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

  createMaterialFromVRAMAndGetIndex(primitive: Primitive, vram: VRAM): number {
    this.setMaterialFromVRAM(primitive, vram);
    return this.getMaterialIndex(primitive);
  }

  createMaterialFromTIMAndGetIndex(primitive: Primitive, tims: TIM[]): number {
    this.setMaterialFromTIM(primitive, tims);
    return this.getMaterialIndex(primitive);
  }

  // TODO: Consider refactoring setMaterialFromVRAM and setMaterialFromTIM as they both are almost the same
  // Probabaly have setMaterial and then detect tim vs vram and run the corresponding code to generate the
  // image data.
  private setMaterialFromVRAM(primitive: Primitive, vram: VRAM) {
    if (!primitive.isTextured) {
      if (!this.nonTexturedIndex) {
        this.nonTexturedIndex = this.materials.length;
        this.materials.push(new THREE.MeshStandardMaterial({ vertexColors: true }));
      }
      
      return;
    }

    if (this.texturePages[primitive.texturePage].bitsPerPixelToMaterialIndex.get(primitive.textureBitsPerPixel) === undefined) {
      const textureImageData = vram.getTexturePageImageData(primitive.textureBitsPerPixel, primitive.texturePage, primitive.textureCLUTXPosition, primitive.textureCLUTYPosition);
      var texture = new THREE.DataTexture(textureImageData.data, textureImageData.width, textureImageData.height, THREE.RGBAFormat);
      const nextMaterialIndex = this.materials.length;
      this.texturePages[primitive.texturePage].bitsPerPixelToMaterialIndex.set(primitive.textureBitsPerPixel, nextMaterialIndex);
      this.materials.push(new THREE.MeshStandardMaterial({ vertexColors: true, map: texture }));
    } 
  }

  private setMaterialFromTIM(primitive: Primitive, tims: TIM[]) {
    if (!primitive.isTextured) {
      if (!this.nonTexturedIndex) {
        this.nonTexturedIndex = this.materials.length;
        this.materials.push(new THREE.MeshStandardMaterial({ vertexColors: true }));
      }

      return;
    }

    if (this.texturePages[primitive.texturePage].bitsPerPixelToMaterialIndex.get(primitive.textureBitsPerPixel) === undefined) {
      const timToUse = tims.find(tim => tim.texturePage === primitive.texturePage);
      const textureImageData = timToUse.createImageData();
      var texture = new THREE.DataTexture(textureImageData.data, textureImageData.width, textureImageData.height, THREE.RGBAFormat);
      const nextMaterialIndex = this.materials.length;
      this.texturePages[primitive.texturePage].bitsPerPixelToMaterialIndex.set(primitive.textureBitsPerPixel, nextMaterialIndex);
      this.materials.push(new THREE.MeshStandardMaterial({ vertexColors: true, map: texture }));
    }
  }

  private getMaterialIndex(primitive: Primitive): number {
    if (primitive.isTextured) {
      return this.texturePages[primitive.texturePage].bitsPerPixelToMaterialIndex.get(primitive.textureBitsPerPixel);
    } else {
      return this.nonTexturedIndex;
    }
  }
}