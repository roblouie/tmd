import * as THREE from 'three';
import { NoLightTexturedSolidData } from '../../../tmd/structs/primitives/three-sided/no-light-textured-solid.struct';
import { conversionUtil } from '../../conversion-util';

export const NoLightTexturedSolidConverter = {

  GetFace(packetData: NoLightTexturedSolidData, materialIndex: number) {
    const rawColor = conversionUtil.combineRGBBytes(packetData.red, packetData.green, packetData.blue);
    const color = new THREE.Color(0xffffff) //new THREE.Color(rawColor);
    return new THREE.Face3(packetData.vertex0, packetData.vertex1, packetData.vertex2, undefined, color, materialIndex);
  }
}
