import { TMD, TMDObject } from "../tmd";
import { VRAM } from "../../vram/vram";
import * as THREE from 'three';
import { MaterialTracker } from "./material-tracker";
import { Primitive } from "../primitive";
import { PrimitiveType } from "../primitive-type.enum";
import { NormalData } from "../structs/normal";
import { FlatTexturedConverter } from "./primitives/flat-textured.converter";
import { FlatNoTextureSolidConverter } from "./primitives/flat-no-texture-solid.converter";
import { GouradNoTextureSolidConverter } from "./primitives/gourad-no-texture-solid.converter";
import { GouradTexturedConverter } from "./primitives/gourad-textured.converter";
export class TMDToThreeJS {

  convertWithTMDAndVRAM(tmd: TMD, vram: VRAM): THREE.Mesh[] {
    return tmd.objects.map(object => this.convertObject(object, vram))
  }

  private convertObject(object: TMDObject, vram: VRAM): THREE.Mesh {
    const materialTracker = new MaterialTracker();
    const geometry = new THREE.Geometry();
    geometry.vertices = object.vertices.map(vertex => new THREE.Vector3(vertex.x, -vertex.y, vertex.z));

    object.primitives.forEach(primitive => {
      const materialIndex = materialTracker.createMaterialAndGetIndex(primitive, vram);

      switch (primitive.packetDataType) {

        case PrimitiveType.THREE_SIDED_FLAT_NO_TEXTURE_SOLID:
          geometry.faces.push(FlatNoTextureSolidConverter.GetFace(primitive.packetData, object.normals, materialIndex));
          break;

        case PrimitiveType.THREE_SIDED_GOURAD_NO_TEXTURE_SOLID:
          geometry.faces.push(GouradNoTextureSolidConverter.GetFace(primitive.packetData, object.normals, materialIndex));
          break;

        case PrimitiveType.THREE_SIDED_FLAT_TEXTURE:
          geometry.faces.push(FlatTexturedConverter.GetFace(primitive.packetData, object.normals, materialIndex));
          geometry.faceVertexUvs[0].push(this.getUVs(materialTracker, materialIndex, primitive));
          break;

        case PrimitiveType.THREE_SIDED_GOURAD_TEXTURE:
          geometry.faces.push(GouradTexturedConverter.GetFace(primitive.packetData, object.normals, materialIndex));
          geometry.faceVertexUvs[0].push(this.getUVs(materialTracker, materialIndex, primitive));
          break;
      }
    });

    return new THREE.Mesh(geometry, materialTracker.objectMaterials);
  }

  private getUVs(materialTracker: MaterialTracker, materialIndex: number, primitive: Primitive) {
    const textureImageData = materialTracker.objectMaterials[materialIndex].map.image;
    const { u0, v0, u1, v1, u2, v2 } = primitive.packetData;
    const uv0 = new THREE.Vector2(u0 / textureImageData.width, v0 / textureImageData.height);
    const uv1 = new THREE.Vector2(u1 / textureImageData.width, v1 / textureImageData.height);
    const uv2 = new THREE.Vector2(u2 / textureImageData.width, v2 / textureImageData.height);
    return [uv0, uv1, uv2];
  }
}