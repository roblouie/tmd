import { Struct, StructData } from '@binary-files/structjs'

export interface NormalData extends StructData {
  x: number;
  y: number;
  z: number;
}

export const normalStruct = new Struct(
  Struct.Int16('x'),
  Struct.Int16('y'),
  Struct.Int16('z'),
  Struct.Int16('unused')
);
