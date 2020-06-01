import * as THREE from 'three';
import { FlatTexturedData } from '../../tmd/structs/primitives/flat-textured';
import { NormalData } from '../../tmd/structs/normal.struct';

export const FlatTexturedConverter = {

  GetFace(packetData: FlatTexturedData, normals: NormalData[], materialIndex: number) {
    const rawNormal = normals[packetData.normal0];
    const normal = new THREE.Vector3(rawNormal.x, -rawNormal.y, rawNormal.z);
    const color = new THREE.Color(0xffffff);
    return new THREE.Face3(packetData.vertex0, packetData.vertex1, packetData.vertex2, normal, color, materialIndex);
  }
}
