import * as THREE from 'three';
import { Primitive } from '../primitive';
import { VRAM } from '../../vram/vram';

export class MaterialTracker {
  private materials: THREE.MeshStandardMaterial[];
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

  get objectMaterials(): THREE.MeshStandardMaterial[] {
    return this.materials
  }

  createMaterialAndGetIndex(primitive: Primitive, vram: VRAM): number {
    this.setMaterial(primitive, vram);
    return this.getMaterialIndex(primitive);
  }

  private setMaterial(primitive: Primitive, vram: VRAM) {
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
      const nextMaterialIndex = this.materials.length
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