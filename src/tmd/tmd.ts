import { headerStruct, HeaderData }  from './structs/header.struct';
import { objectTableStruct, ObjectTableData } from './structs/object-table.struct';
import { Primitive } from './primitive';
import { primitiveStruct, PrimitiveData } from './structs/primitive.struct';
import { normalStruct, NormalData } from './structs/normal.struct';
import { vertexStruct, VertexData } from './structs/vertex.struct';

export interface TMDObject {
  primitives: Primitive[];
  vertices: VertexData[];
  normals: NormalData[];
}

export class TMD {
  static FileID = 0x00000041;

  header: HeaderData;
  objectInfos: ObjectTableData[];
  objects: TMDObject[];

  private _byteLength: number;

  private readonly MaxPrimitivesAllowed = 10000;
  private readonly MaxVerticesAllowed = 40000;
  private readonly MaxNormalsAllowed = 40000;

  constructor(arrayBuffer: ArrayBuffer, startOffset = 0) {
    this.header = headerStruct.createObject<HeaderData>(arrayBuffer, startOffset, true);
    this.objectInfos = objectTableStruct.createArray<ObjectTableData>(arrayBuffer, this.header.nextOffset, this.header.numberOfObjects, true);

    this.checkObjectTableAccuracy();

    this.objects = [];

    this.objectInfos.forEach(objectInfo => {
      const object: TMDObject = {
        primitives: this.getPrimitives(objectInfo, arrayBuffer),
        vertices: vertexStruct.createArray<VertexData>(arrayBuffer, objectInfo.verticesStart + this.header.nextOffset, objectInfo.verticesCount, true),
        normals: normalStruct.createArray<NormalData>(arrayBuffer, objectInfo.normalsStart + this.header.nextOffset, objectInfo.normalsCount, true)
      };

      this.objects.push(object);
    });

    const lastObject = this.objects[this.objects.length - 1];
    const offsetToLastFileEntry = lastObject?.normals[lastObject.normals.length - 1].offsetTo.unused;
    this._byteLength = offsetToLastFileEntry + 2 - startOffset; // add byte length of final file entry
  }

  get byteLength(): number {
    return this._byteLength;
  }

  private getPrimitives(object: ObjectTableData, arrayBuffer: ArrayBuffer): Primitive[] {
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

  private checkObjectTableAccuracy() {
    this.objectInfos.forEach(objectInfo => {
      if (objectInfo.primitivesCount > this.MaxPrimitivesAllowed) {
        throw new Error(`Invalid Primitive Count: ${objectInfo.primitivesCount}`);
      }

      if (objectInfo.verticesCount > this.MaxVerticesAllowed) {
        throw new Error(`Invalid Vertices Count: ${objectInfo.verticesCount}`);
      }

      if (objectInfo.normalsCount > this.MaxNormalsAllowed) {
        throw new Error(`Invalid Normals Count: ${objectInfo.normalsCount}`);
      }
    })
  }
}