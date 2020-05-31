import * as THREE from 'three';
import { NormalData } from '../tmd/structs/normal';

export const conversionUtil = {
  materials: [
    new THREE.MeshStandardMaterial({ vertexColors: true }), 
    new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.5 })
  ],

  getMaterialIndex(primitive) {
    return primitive.isTranslucent ? 1 : 0;
  },

  combineRGBBytes(red, green, blue) {
    return red << 16 | green << 8 | blue;
  },

  getVertices(object) {
    return object.vertices.map(vertex => new THREE.Vector3(vertex.x, -vertex.y, vertex.z));
  },

  getThreeJSNormalFromIndex(normals: NormalData[], index: number) {
    const normal = normals[index];
    return new THREE.Vector3(normal.x, -normal.y, normal.z);
  },
}