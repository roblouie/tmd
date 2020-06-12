import { Struct, StructData } from '@binary-files/structjs';

export interface FourSidedNoLightNoTextureSolidData extends StructData {
  red: number;
  green: number;
  blue: number;
  mode: number;
  vertex0: number;
  vertex1: number;
  vertex2: number;
  vertex3: number;
}

export const fourSidedNoLightNoTextureSolidStruct = new Struct(
  Struct.Uint8('red'),
  Struct.Uint8('green'),
  Struct.Uint8('blue'),
  Struct.Uint8('mode'),
  Struct.Uint16('vertex0'),
  Struct.Uint16('vertex1'),
  Struct.Uint16('vertex2'),
  Struct.Uint16('vertex3')
);
