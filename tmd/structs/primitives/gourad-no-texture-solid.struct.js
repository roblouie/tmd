import Struct from "../../../lib/struct.js";

export const gouradNoTextureSolidStruct = new Struct(
  Struct.Uint8('red'),
  Struct.Uint8('green'),
  Struct.Uint8('blue'),
  Struct.Uint8('mode'),
  Struct.Uint16('normal0'),
  Struct.Uint16('vertex0'),
  Struct.Uint16('normal1'),
  Struct.Uint16('vertex1'),
  Struct.Uint16('normal2'),
  Struct.Uint16('vertex2')
);
