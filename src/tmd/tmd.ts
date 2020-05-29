import { headerStruct, HeaderData }  from './structs/header';
import { objectTableStruct, ObjectTableData } from './structs/object-table';
import vertexStruct from './structs/vertex.js';
import { Primitive } from './primitive';
import { primitiveStruct, PrimitiveData } from './structs/primitive';
import { normalStruct, NormalData } from './structs/normal';

export interface TMDObject {
  primitives: Primitive[];
  vertices: any[];
  normals: NormalData[];
}

export class TMD {
  static FileID = 0x00000041;

  header: HeaderData;
  objectInfos: ObjectTableData[];
  objects: TMDObject[];

  constructor(arrayBuffer: ArrayBuffer, startOffset = 0) {
    this.header = headerStruct.createObject<HeaderData>(arrayBuffer, startOffset, true);
    this.objectInfos = objectTableStruct.createArray<ObjectTableData>(arrayBuffer, this.header.nextOffset, this.header.numberOfObjects, true);
    this.objects = [];

    this.objectInfos.forEach(objectInfo => {
      const object: TMDObject = {
        primitives: this.getPrimitives(objectInfo, arrayBuffer),
        vertices: vertexStruct.createArray(arrayBuffer, objectInfo.verticesStart + this.header.nextOffset, objectInfo.verticesCount, true),
        normals: normalStruct.createArray(arrayBuffer, objectInfo.normalsStart + this.header.nextOffset, objectInfo.normalsCount, true)
      };

      this.objects.push(object);
    });
  }

  getPrimitives(object: ObjectTableData, arrayBuffer: ArrayBuffer) {
    const objectPrimitives = [];
    let offset = this.header.nextOffset + object.primitivesStart;

    for (let i = 0; i < object.primitivesCount; i++) {
      const primitiveData = primitiveStruct.createObject<PrimitiveData>(arrayBuffer, offset, true);
      const primitive = new Primitive(primitiveData);
      primitive.setPacketData(arrayBuffer);
      objectPrimitives.push(primitive);
      offset += primitive.totalByteLength;
    }

    return objectPrimitives;
  }
}