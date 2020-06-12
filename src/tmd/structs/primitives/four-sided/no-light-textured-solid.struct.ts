import { Struct, StructData } from '@binary-files/structjs';

export interface NoLightTexturedSolidData extends StructData {
  u0: number;
  v0: number;
  cba: number;
  u1: number;
  v1: number;
  tsb: number;
  u2: number;
  v2: number;
  u3: number;
  v3: number;
  red: number;
  green: number;
  blue: number;
  vertex0: number;
  vertex1: number;
  vertex2: number;
  vertex3: number;
}

export const noLightTexturedSolidStruct = new Struct(
  Struct.Uint8('u0'),
  Struct.Uint8('v0'),
  Struct.Uint16('cba'), //clut info
  Struct.Uint8('u1'),
  Struct.Uint8('v1'),
  Struct.Uint16('tsb'), // texture page info
  Struct.Uint8('u2'),
  Struct.Uint8('v2'),
  Struct.Uint16('unused0'),
  Struct.Uint8('u3'),
  Struct.Uint8('v3'),
  Struct.Uint16('unused1'),
  Struct.Uint8('red'),
  Struct.Uint8('green'),
  Struct.Uint8('blue'),
  Struct.Uint8('unused2'),
  Struct.Uint16('vertex0'),
  Struct.Uint16('vertex1'),
  Struct.Uint16('vertex2'),
  Struct.Uint16('vertex3')
);
