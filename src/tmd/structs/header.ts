import { Struct, StructObject } from '@rlouie/structjs'

export interface HeaderData extends StructObject {
  id: number;
  flags: number;
  numberOfObjects: number;
}

export const headerStruct = new Struct(
  Struct.Uint32('id'),
  Struct.Uint32('flags'),
  Struct.Uint32('numberOfObjects'),
);
