import { Struct } from '@binary-files/structjs';

export interface FlatNoTextureSolidData {
  red: number;
  green: number;
  blue: number;
  mode: number;
  normal0: number;
  vertex0: number;
  vertex1: number;
  vertex2: number;
}

export const flatNoTextureSolidStruct = new Struct(
  Struct.Uint8('red'),
  Struct.Uint8('green'),
  Struct.Uint8('blue'),
  Struct.Uint8('mode'),
  Struct.Uint16('normal0'),
  Struct.Uint16('vertex0'),
  Struct.Uint16('vertex1'),
  Struct.Uint16('vertex2')
);
