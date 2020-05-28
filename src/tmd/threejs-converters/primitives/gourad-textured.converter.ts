import * as THREE from 'three';
import { conversionUtil } from '../conversion-util';
import { NormalData } from '../../structs/normal';
import { GouradTexturedData } from '../../structs/primitives/gourad-textured';

export const GouradTexturedConverter = {

  GetFace(packetData: GouradTexturedData, normals: NormalData[], materialIndex: number) {
    const normal0 = conversionUtil.getThreeJSNormalFromIndex(normals, packetData.normal0);
    const normal1 = conversionUtil.getThreeJSNormalFromIndex(normals, packetData.normal1);
    const normal2 = conversionUtil.getThreeJSNormalFromIndex(normals, packetData.normal2);
    const faceNormals = [normal0, normal1, normal2];

    const color = new THREE.Color(0xffffff);

    return new THREE.Face3(packetData.vertex0, packetData.vertex1, packetData.vertex2, faceNormals, color, materialIndex);
  }

}
