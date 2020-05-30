import * as THREE from 'three';
import { LineSolidData } from '../../../structs/primitives/lines/line-solid.struct';

// TODO: Delete? Probably not needed due to simplicity of lines. Should revisit after
// figuring out better overall object with multiple primitive type conversion.

export const LineSolidConverter = {

  GetFace(packetData: LineSolidData) {
    return new THREE.Vector3(packetData.vertex0, packetData.vertex1, );
  }
}
