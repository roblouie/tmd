import { Struct, StructData } from '@binary-files/structjs';

export interface PrimitiveData extends StructData {
  olen: number,
  ilen: number,
  flag: number,
  mode: number
}

export const primitiveStruct = new Struct(
  Struct.Uint8('olen'),
  Struct.Uint8('ilen'),
  Struct.Uint8('flag'),
  Struct.Uint8('mode')
);