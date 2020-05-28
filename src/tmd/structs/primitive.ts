import { Struct, StructObject } from '@rlouie/structjs';

export interface PrimitiveData extends StructObject {
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