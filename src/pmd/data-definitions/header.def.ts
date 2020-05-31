import { Struct, StructData } from "@binary-files/structjs";

export interface PMDHeaderData extends StructData {
  id: number;
  pimPoint: number;
  vertPoint: number;
}

export const pmdHeaderStruct = new Struct(
  Struct.Uint32('id'),
  Struct.Uint32('primPoint'),
  Struct.Uint32('vertPoint')
)