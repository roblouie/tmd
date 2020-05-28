import * as THREE from 'three';
import { conversionUtil } from '../conversion-util';
import { TMDObject } from '../../tmd';
import { FlatTexturedData } from '../../structs/primitives/flat-textured.js';
import { NormalData } from '../../structs/normal';

export const FlatTexturedConverter = {

  GetFace(packetData: FlatTexturedData, normals: NormalData[], materialIndex: number) {
    const rawNormal = normals[packetData.normal0];
    const normal = new THREE.Vector3(rawNormal.x, -rawNormal.y, rawNormal.z);
    const color = new THREE.Color(0xffffff);
    return new THREE.Face3(packetData.vertex0, packetData.vertex1, packetData.vertex2, normal, color, materialIndex);
  }
}
