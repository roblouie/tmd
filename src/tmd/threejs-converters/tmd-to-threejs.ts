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

  convertWithTMDAndVRAM(tmd: TMD, vram: VRAM) {
    return tmd.objects.map(object => this.objectToMeshWithVRAM(object, vram))
  }

  convertWithTMDOnly(tmd: TMD) {
    const meshArray = [];

    tmd.objects.forEach(object => {
      const geometry = new THREE.Geometry();
      const materialTracker = new MaterialTracker();
      materialTracker.objectMaterials.push(new THREE.MeshStandardMaterial({ color: 0xffffff }));
      geometry.vertices = object.vertices.map(vertex => new THREE.Vector3(vertex.x, -vertex.y, vertex.z));

      object.primitives.forEach(primitive => {
        this.populateGeometry(primitive, geometry, object, 0, materialTracker);
      });

      // Clear the UVs that were brought over from PS1 since we don't have a texture;
      geometry.faceVertexUvs[0] = [];
      meshArray.push(new THREE.Mesh(geometry, materialTracker.objectMaterials));
    });

    return meshArray;
  }

  private objectToMeshWithVRAM(object: TMDObject, vram: VRAM) {

    // convert lines separately, this should be improved upon.
    if (object.primitives[0].codeType === 'Line') {
      return this.convertLines(object);
    }

    const materialTracker = new MaterialTracker();
    const geometry = new THREE.Geometry();

    geometry.vertices = object.vertices.map(vertex => new THREE.Vector3(vertex.x, -vertex.y, vertex.z));

    object.primitives.forEach(primitive => {
      const materialIndex = materialTracker.createMaterialFromVRAMAndGetIndex(primitive, vram);

      this.populateGeometry(primitive, geometry, object, materialIndex, materialTracker);
    });

    return new THREE.Mesh(geometry, materialTracker.objectMaterials);
  }

  private populateGeometry(primitive: Primitive, geometry: THREE.Geometry, object: TMDObject, materialIndex: number, materialTracker: MaterialTracker) {
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
  }

  private getUVs(materialTracker: MaterialTracker, materialIndex: number, primitive: Primitive) {
    const { u0, v0, u1, v1, u2, v2 } = primitive.packetData;
    const uv0 = new THREE.Vector2(u0 / VRAM.ACCESSIBLE_TEXTURE_WIDTH, v0 / VRAM.ACCESSIBLE_TEXTURE_HEIGHT);
    const uv1 = new THREE.Vector2(u1 / VRAM.ACCESSIBLE_TEXTURE_WIDTH, v1 / VRAM.ACCESSIBLE_TEXTURE_HEIGHT);
    const uv2 = new THREE.Vector2(u2 / VRAM.ACCESSIBLE_TEXTURE_WIDTH, v2 / VRAM.ACCESSIBLE_TEXTURE_HEIGHT);
    return [uv0, uv1, uv2];
  }

  private convertLines(object: TMDObject): THREE.Line {
    const points = [];
    object.primitives.forEach(primitive => {
      if (points.length === 0) {
        const vertex0 = object.vertices[primitive.packetData.vertex0];
        points.push(new THREE.Vector3(vertex0.x, vertex0.y, vertex0.z));
      }

      const vertex1 = object.vertices[primitive.packetData.vertex1];
      points.push(new THREE.Vector3(vertex1.x, vertex1.y, vertex1.z));
    });
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
  }
}