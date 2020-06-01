import * as THREE from 'three';

import { conversionUtil } from '../conversion-util';
import { NormalData } from '../../tmd/structs/normal.struct';
import { FlatNoTextureGradientData } from '../../tmd/structs/primitives/flat-no-texture-gradient.struct';

export const FlatNoTextureGradientConverter = {

  GetFace(packetData: FlatNoTextureGradientData, normals: NormalData[], materialIndex: number) {
    const normal = conversionUtil.getThreeJSNormalFromIndex(normals, packetData.normal0);
    const rawColor0 = conversionUtil.combineRGBBytes(packetData.red0, packetData.green0, packetData.blue0);
    const rawColor1 = conversionUtil.combineRGBBytes(packetData.red1, packetData.green1, packetData.blue1);
    const rawColor2 = conversionUtil.combineRGBBytes(packetData.red2, packetData.green2, packetData.blue2);
    const color0 = new THREE.Color(rawColor0);
    const color1 = new THREE.Color(rawColor1);
    const color2 = new THREE.Color(rawColor2);

    return new THREE.Face3(packetData.vertex0, packetData.vertex1, packetData.vertex2, normal, [color0, color1, color2], materialIndex);
  }
}
