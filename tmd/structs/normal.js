import Struct from '../../lib/struct.js'

const normalStruct = new Struct(
  Struct.Int16('x'),
  Struct.Int16('y'),
  Struct.Int16('z'),
  Struct.Int16('unused')
);

export default normalStruct;