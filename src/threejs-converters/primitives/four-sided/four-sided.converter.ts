import { NoLightTexturedSolidData } from '@/psx/tmd/structs/primitives/four-sided/no-light-textured-solid.struct';
import { conversionUtil } from '../../conversion-util';
import { Face3, Color } from 'three';
import { FourSidedFlatTexturedNoColorData } from '@/psx/tmd/structs/primitives/four-sided/flat-textured-no-color.struct';
import { FourSidedNoLightNoTextureSolidData } from '@/psx/tmd/structs/primitives/four-sided/no-light-no-texture-solid.struct';


export default class FourSidedConverter {

  static NoLightTexturedSolid(packetData: NoLightTexturedSolidData, materialIndex: number) {
    const rawColor = conversionUtil.combineRGBBytes(packetData.red, packetData.green, packetData.blue);
    const color = new Color(0xffffff) //new THREE.Color(rawColor);
    const face1 = new Face3(packetData.vertex0, packetData.vertex1, packetData.vertex2, undefined, color, materialIndex);
    const face2 = new Face3(packetData.vertex1, packetData.vertex3, packetData.vertex2, undefined, color, materialIndex);
    return [face1, face2];
  }

  static FlatTexturedNoColor(packetData: FourSidedFlatTexturedNoColorData, materialIndex: number) {
    const color = new Color(0xffffff);
    const face1 = new Face3(packetData.vertex0, packetData.vertex1, packetData.vertex2, undefined, color, materialIndex);
    const face2 = new Face3(packetData.vertex1, packetData.vertex3, packetData.vertex2, undefined, color, materialIndex);
    return [face1, face2];
  }

  static NoLightNoTextureSolid(packetData: FourSidedNoLightNoTextureSolidData, materialIndex: number) {
    const rawColor = conversionUtil.combineRGBBytes(packetData.red, packetData.green, packetData.blue);
    const color = new Color(rawColor);
    const face1 = new Face3(packetData.vertex0, packetData.vertex1, packetData.vertex2, undefined, color, materialIndex);
    const face2 = new Face3(packetData.vertex1, packetData.vertex3, packetData.vertex2, undefined, color, materialIndex);
    return [face1, face2];
  }
}