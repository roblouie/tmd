import { Struct, StructObject } from '@rlouie/structjs';

export interface FlatTexturedData extends StructObject {
  u0: number;
  v0: number;
  cba: number;
  u1: number;
  v1: number;
  tsb: number;
  u2: number;
  v2: number;
  unused: number;
  normal0: number;
  vertex0: number;
  vertex1: number;
  vertex2: number;
}

export const flatTexturedStruct = new Struct(
  Struct.Uint8('u0'),
  Struct.Uint8('v0'),
  Struct.Uint16('cba'), //clut info
  Struct.Uint8('u1'),
  Struct.Uint8('v1'),
  Struct.Uint16('tsb'), // texture page info
  Struct.Uint8('u2'),
  Struct.Uint8('v2'),
  Struct.Uint16('unused'),
  Struct.Uint16('normal0'),
  Struct.Uint16('vertex0'),
  Struct.Uint16('vertex1'),
  Struct.Uint16('vertex2')
);
