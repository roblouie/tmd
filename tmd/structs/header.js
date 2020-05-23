import Struct from '../../lib/struct.js'

const headerStruct = new Struct(
  Struct.Uint32('id'),
  Struct.Uint32('flags'),
  Struct.Uint32('numberOfObjects'),
);

export default headerStruct;