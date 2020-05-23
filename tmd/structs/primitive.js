import Struct from '../../lib/struct.js'

const primitiveStruct = new Struct(
  Struct.Uint8('olen'),
  Struct.Uint8('ilen'),
  Struct.Uint8('flag'),
  Struct.Uint8('mode')
);

export default primitiveStruct;