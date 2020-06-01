import { Struct, StructData } from '@binary-files/structjs'

export interface VertexData extends StructData {
  x: number;
  y: number;
  z: number;
}

export const vertexStruct = new Struct(
  Struct.Int16('x'),
  Struct.Int16('y'),
  Struct.Int16('z'),
  Struct.Int16('unused')
);
