import * as THREE from 'three';
import { NormalData } from '../tmd/structs/normal.struct';
import { TMDObject } from '../tmd/tmd';
import { Primitive } from '../tmd/primitive';

export const conversionUtil = {
  materials: [
    new THREE.MeshStandardMaterial({ vertexColors: true }), 
    new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.5 })
  ],

  getMaterialIndex(primitive: Primitive) {
    return primitive.isTranslucent ? 1 : 0;
  },

  combineRGBBytes(red: number, green: number, blue: number) {
    return red << 16 | green << 8 | blue;
  },

  getVertices(object: TMDObject) {
    return object.vertices.map(vertex => new THREE.Vector3(vertex.x, vertex.y, vertex.z));
  },

  getThreeJSNormalFromIndex(normals: NormalData[], index: number) {
    const normal = normals[index];
    return new THREE.Vector3(normal.x, normal.y, normal.z);
  },
}