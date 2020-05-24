export class ConversionUtil {

  static CombineRGBBytes(red, green, blue) {
    return red << 16 | green << 8 | blue;
  }

  static GetVertices(object) {
    return object.vertices.map(vertex => new THREE.Vector3(vertex.x, -vertex.y, vertex.z));
  }

  static GetNormalFromIndex(object, index) {
    const normal = object.normals[index];
    return new THREE.Vector3(normal.x, -normal.y, normal.z);
  }
}