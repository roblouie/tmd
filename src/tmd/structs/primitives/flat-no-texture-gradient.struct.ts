import { Struct, StructData } from '@binary-files/structjs';

export interface FlatNoTextureGradientData extends StructData {
  red0: number;
  green0: number;
  blue0: number;
  
  mode: number;
  
  red1: number;
  green1: number;
  blue1: number;

  red2: number;
  green2: number;
  blue2: number;

  normal0: number;
  vertex0: number;
  vertex1: number;
  vertex2: number;
}

export const flatNoTextureGradientStruct = new Struct(
  Struct.Uint8('red0'),
  Struct.Uint8('green0'),
  Struct.Uint8('blue0'),
  Struct.Uint8('mode'),
  Struct.Uint8('red1'),
  Struct.Uint8('green1'),
  Struct.Uint8('blue1'),
  Struct.Uint8('unused0'),
  Struct.Uint8('red2'),
  Struct.Uint8('green2'),
  Struct.Uint8('blue2'),
  Struct.Uint8('unused1'),
  Struct.Uint16('normal0'),
  Struct.Uint16('vertex0'),
  Struct.Uint16('vertex1'),
  Struct.Uint16('vertex2')
);
