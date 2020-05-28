import { Struct, StructObject } from '@rlouie/structjs'

export interface ObjectTableData extends StructObject {
  verticesStart: number;
  verticesCount: number;
  normalsStart: number;
  normalsCount: number;
  primitivesStart: number;
  primitivesCount: number;
  scale: number;
}

export const objectTableStruct = new Struct(
  Struct.Uint32('verticesStart'),
  Struct.Uint32('verticesCount'),
  Struct.Uint32('normalsStart'),
  Struct.Uint32('normalsCount'),
  Struct.Uint32('primitivesStart'),
  Struct.Uint32('primitivesCount'),
  Struct.Int32('scale'),
);
