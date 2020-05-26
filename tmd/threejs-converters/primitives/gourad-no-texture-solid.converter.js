import { conversionUtil } from '../conversion-util.js';

export const GouradNoTextureSolidConverter = {

  GetMesh(object) {
    const geometry = new THREE.Geometry();

    geometry.vertices = object.vertices.map(vertex => new THREE.Vector3(vertex.x, -vertex.y, vertex.z));

    geometry.faces = object.primitives.map(primitive => {
      const normal0 = conversionUtil.getNormalFromIndex(object, primitive.packetData.normal0);
      const normal1 = conversionUtil.getNormalFromIndex(object, primitive.packetData.normal1);
      const normal2 = conversionUtil.getNormalFromIndex(object, primitive.packetData.normal2);
      const normals = [normal0, normal1, normal2];
      const rawColor = conversionUtil.combineRGBBytes(primitive.packetData.red, primitive.packetData.green, primitive.packetData.blue);
      const color = new THREE.Color(rawColor);
      const materialIndex = conversionUtil.getMaterialIndex(primitive);
      
      return new THREE.Face3(primitive.packetData.vertex0, primitive.packetData.vertex1, primitive.packetData.vertex2, normals, color, materialIndex);
    });

    return new THREE.Mesh(geometry, conversionUtil.multiMaterial);
  }

}
