import { Struct, StructData } from '@binary-files/structjs';

export interface LineGradientData extends StructData {
  red0: number;
  green0: number;
  blue0: number;
  mode: number;
  red1: number;
  green1: number;
  blue1: number;
  vertex0: number;
  vertex1: number;
}

export const lineGradientStruct = new Struct(
  Struct.Uint8('red0'),
  Struct.Uint8('green0'),
  Struct.Uint8('blue0'),
  Struct.Uint8('mode'),
  Struct.Uint8('red1'),
  Struct.Uint8('green1'),
  Struct.Uint8('blue1'),
  Struct.Uint8('unused0'),
  Struct.Uint16('vertex0'),
  Struct.Uint16('vertex1')
);
