import Struct from "../../../lib/struct.js";

export default new Struct(
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
