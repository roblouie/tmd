import { Struct, StructData } from "@binary-files/structjs";

export interface SectionHeaderData extends StructData {
  sectionByteLength: number;
  vramX: number;
  vramY: number;
  dataHeight: number;
  dataWidth: number;
}

export const sectionHeaderStruct = new Struct(
  Struct.Uint32('sectionByteLength'),
  Struct.Uint16('vramX'),
  Struct.Uint16('vramY'),
  Struct.Uint16('dataWidth'),
  Struct.Uint16('dataHeight')
);