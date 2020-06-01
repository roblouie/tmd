import * as THREE from 'three';
import { NoLightTexturedSolidData } from '../../tmd/structs/primitives/no-light-textured-solid.struct';

export const NoLightNoTextureSolidConverter = {

  GetFace(packetData: NoLightTexturedSolidData, materialIndex: number) {
    const color = new THREE.Color(0xffffff);
    return new THREE.Face3(packetData.vertex0, packetData.vertex1, packetData.vertex2, null, color, materialIndex);
  }
}
