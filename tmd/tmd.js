import headerStruct from './structs/header.js';
import objectTableStruct from './structs/object-table.js';
import vertexStruct from './structs/vertex.js';
import { Primitive } from './primitive.js';
import primitiveStruct from './structs/primitive.js';
import normalStruct from './structs/normal.js';

export class TMD {
  constructor(arrayBuffer) {
    this.header = headerStruct.createObject(arrayBuffer, 0, true);
    this.objectInfos = objectTableStruct.createArray(arrayBuffer, headerStruct.byteLength, this.header.numberOfObjects, true);
    this.objects = [];

    this.objectInfos.forEach(objectInfo => {
      const object = {};

      object.primitives = this.getPrimitives(objectInfo, arrayBuffer);
      object.vertices = vertexStruct.createArray(arrayBuffer, objectInfo.verticesStart + this.header.byteLength, objectInfo.verticesCount, true);
      object.normals = normalStruct.createArray(arrayBuffer, objectInfo.normalsStart + this.header.byteLength, objectInfo.normalsCount, true);
      this.objects.push(object);
    });
  }

  getPrimitives(object, arrayBuffer) {
    const objectPrimitives = [];
    let offset = this.header.byteLength + object.primitivesStart;

    for (let i = 0; i < object.primitivesCount; i++) {
      const primitiveData = primitiveStruct.createObject(arrayBuffer, offset, true);
      const primitive = new Primitive(primitiveData);
      primitive.setPacketData(arrayBuffer);
      objectPrimitives.push(primitive);
      offset += primitive.totalByteLength;
    }

    return objectPrimitives;
  }

}