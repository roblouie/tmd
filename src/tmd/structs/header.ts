import { Struct, StructData } from '@binary-files/structjs'

export interface HeaderData extends StructData {
  id: number;
  flags: number;
  numberOfObjects: number;
}

export const headerStruct = new Struct(
  Struct.Uint32('id'),
  Struct.Uint32('flags'),
  Struct.Uint32('numberOfObjects'),
);
