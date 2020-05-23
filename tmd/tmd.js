import headerStruct from './structs/header.js';
import objectTableStruct from './structs/object-table.js';
import vertexStruct from './structs/vertex.js';
import { Primitive } from './primitive.js';
import primitiveStruct from './structs/primitive.js';

export class TMD {
  constructor(arrayBuffer) {
    this.header = headerStruct.createObject(arrayBuffer, 0, true);
    this.objectTables = objectTableStruct.createArray(arrayBuffer, headerStruct.byteLength, this.header.numberOfObjects, true);

    let totalOffset = this.header.byteLength + this.objectTables.length * objectTableStruct.byteLength;

    this.objects = [];

    this.objectTables.forEach(objectTable => {
      const object = {};

      object.primitives = [];

      // TODO: Flatten all this out and just populate primitives, vertices, and normals separately using their offsets
      for (let i = 0; i < objectTable.primitivesCount; i++) {
        const primitiveData = primitiveStruct.createObject(arrayBuffer, totalOffset, true);
        object.primitives.push(new Primitive(primitiveData));
        // Convert word length of the packet secction to byte length and skip forward by that amount.
        totalOffset += primitiveStruct.byteLength + primitiveData.ilen * 4;
      }
      
      object.vertices = vertexStruct.createArray(arrayBuffer, objectTable.verticesStart + this.header.byteLength, objectTable.verticesCount, true);
      this.objects.push(object);
    })
  }

  packetDataForPrimitiveType(primitive, arrayBuffer) {

  }
}