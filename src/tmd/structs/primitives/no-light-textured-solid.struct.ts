// {
//   u_char  U0, V0; - X and Y coordinate of texture for Vertex0
//  u_short CBA; - position of CLUT for texture in VRAM(see earlier)
//  u_char  U1, V1; - X and Y coordinate of texture for Vertex1
//  u_short TSB; - information about texture in VRAM(see earlier)
//   u_char  U2, V2; - X and Y coordinate of texture for Vertex2
//  u_short pad1; - ignored
//   u_char  R, G, B; - pigment of polygon
//   u_char  pad2; - ignored
//   u_short Vertex0; - index value of vertex element
//   u_short Vertex1;
//   u_short Vertex2;
//   u_short pad; - ignored
// }

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
  red: number;
  green: number;
  blue: number;
  vertex0: number;
  vertex1: number;
  vertex2: number;
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
  Struct.Uint8('red'),
  Struct.Uint8('green'),
  Struct.Uint8('blue'),
  Struct.Uint8('unused1'),
  Struct.Uint16('vertex0'),
  Struct.Uint16('vertex1'),
  Struct.Uint16('vertex2'),
  Struct.Uint16('unused2')
);
