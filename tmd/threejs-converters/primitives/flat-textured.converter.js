import { conversionUtil } from '../conversion-util.js';

export const FlatNoTextureSolidConverter = {

  GetMesh(tmdObject, textureImageData) {
    var texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    const material = THREE.MeshStandardMaterial({ vertexColors: true, map: texture });
    const geometry = new THREE.Geometry();

    geometry.vertices = tmdObject.vertices.map(vertex => new THREE.Vector3(vertex.x, -vertex.y, vertex.z));

    geometry.faces = tmdObject.primitives.map(primitive => {
      const normal = conversionUtil.getNormalFromIndex(tmdObject, primitive.packetData.normal0)
      const rawColor = conversionUtil.combineRGBBytes(primitive.packetData.red, primitive.packetData.green, primitive.packetData.blue);
      const color = new THREE.Color(rawColor);

      return new THREE.Face3(primitive.packetData.vertex0, primitive.packetData.vertex1, primitive.packetData.vertex2, normal, color, materialIndex);
    });

    return new THREE.Mesh(geometry, material);
  }

}
