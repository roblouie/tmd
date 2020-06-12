import { Struct } from '@binary-files/structjs';

const gouradShadingGradientPigmentStruct = new Struct(
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
  Struct.Uint16('normal1'),
  Struct.Uint16('vertex1'),
  Struct.Uint16('normal2'),
  Struct.Uint16('vertex2')
)

export default gouradShadingGradientPigmentStruct;
