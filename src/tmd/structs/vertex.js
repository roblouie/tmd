import { Struct } from '@binary-files/structjs'

const vertexStruct = new Struct(
  Struct.Int16('x'),
  Struct.Int16('y'),
  Struct.Int16('z'),
  Struct.Int16('unused')
);

export default vertexStruct;