import { conversionUtil } from '../conversion-util.js';

export const FlatNoTextureSolidConverter = {

  GetMesh(object) {
    const geometry = new THREE.Geometry();

    geometry.vertices = object.vertices.map(vertex => new THREE.Vector3(vertex.x, -vertex.y, vertex.z));
    
    geometry.faces = object.primitives.map(primitive => {
      const normal = conversionUtil.getNormalFromIndex(object, primitive.packetData.normal0)
      const rawColor = conversionUtil.combineRGBBytes(primitive.packetData.red, primitive.packetData.green, primitive.packetData.blue);
      const color = new THREE.Color(rawColor);
      const materialIndex = conversionUtil.getMaterialIndex(primitive);
      
      return new THREE.Face3(primitive.packetData.vertex0, primitive.packetData.vertex1, primitive.packetData.vertex2, normal, color, materialIndex);
    });

    return new THREE.Mesh(geometry, conversionUtil.materials);
  }
  
}
