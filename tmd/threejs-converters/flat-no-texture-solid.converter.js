import { ConversionUtil } from './conversion-util.js';

export class FlatNoTextureSolidConverter {

  static GetMesh(object) {
    var material = new THREE.MeshStandardMaterial({ vertexColors: true });
    var geometry = new THREE.Geometry();

    geometry.vertices = object.vertices.map(vertex => new THREE.Vector3(vertex.x, -vertex.y, vertex.z));
    geometry.faces = object.primitives.map(primitive => {
      const normal = ConversionUtil.GetNormalFromIndex(object, primitive.packetData.normal0)
      const rawColor = ConversionUtil.CombineRGBBytes(primitive.packetData.red, primitive.packetData.green, primitive.packetData.blue);
      const color = new THREE.Color(rawColor);
      const face = new THREE.Face3(primitive.packetData.vertex0, primitive.packetData.vertex1, primitive.packetData.vertex2, normal, color);
      return face;
    });

    return new THREE.Mesh(geometry, material)
  }
  
}

