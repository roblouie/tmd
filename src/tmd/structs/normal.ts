import { Struct, StructObject } from '@rlouie/structjs'

export interface NormalData extends StructObject {
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
