import Struct from "../../../lib/struct";

export default new Struct(
  Struct.Uint8('u0'),
  Struct.Uint8('v0'),
  Struct.Uint16('clutPosInVram'),
  Struct.Uint8('u1'),
  Struct.Uint8('v1'),
  Struct.Uint16('textureInfoInVram'),
  Struct.Uint8('u2'),
  Struct.Uint8('v2'),
  Struct.Uint16('unused0'),
  Struct.Uint8('red0'),
  Struct.Uint8('green0'),
  Struct.Uint8('blue0'),
  Struct.Uint8('unused1'),
  Struct.Uint8('red1'),
  Struct.Uint8('green1'),
  Struct.Uint8('blue1'),
  Struct.Uint8('unused0'),
  Struct.Uint8('red2'),
  Struct.Uint8('green2'),
  Struct.Uint8('blue2'),
  Struct.Uint8('unused1'),
  Struct.Uint16('vertex0'),
  Struct.Uint16('vertex1'),
  Struct.Uint16('vertex2'),
  Struct.Uint16('unused2')
)
