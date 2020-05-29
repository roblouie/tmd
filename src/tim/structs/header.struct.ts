import { Struct, StructData } from "@binary-files/structjs";

export interface TimHeaderData extends StructData {
  id: number;
  flag: number;
}

export const timHeaderStruct = new Struct(
  Struct.Uint32('id'),
  Struct.Uint32('flag')
);