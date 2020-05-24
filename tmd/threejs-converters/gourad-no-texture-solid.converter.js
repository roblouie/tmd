import { ThreeJSConverter } from './threejs.converter.js';

// TODO: Fix to same format as flat no texture
export class GouradNoTextureSolidConverter {

  static GetVertices(object) {
    return object.vertices.map(vertex => new THREE.Vector3(vertex.x, -vertex.y, vertex.z));
  }

  static GetFace3(object) {
    return object.primitives.map(primitive => {
      const normalIndex = primitive.packetData.normal0;
      const sourceNormal = object.normals[normalIndex];
      const normal = new THREE.Vector3(sourceNormal.x, -sourceNormal.y, sourceNormal.z);
      const rawColor = ThreeJSConverter.CombineRGBBytes(primitive.packetData.red, primitive.packetData.green, primitive.packetData.blue);
      const color = new THREE.Color(rawColor);
      const face = new THREE.Face3(primitive.packetData.vertex0, primitive.packetData.vertex1, primitive.packetData.vertex2, normal, color);
      return face;
    });
  }
}

