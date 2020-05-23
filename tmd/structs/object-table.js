import Struct from '../../lib/struct.js'

const objectTableStruct = new Struct(
  Struct.Uint32('verticesStart'),
  Struct.Uint32('verticesCount'),
  Struct.Uint32('normalsStart'),
  Struct.Uint32('normalsCount'),
  Struct.Uint32('primitivesStart'),
  Struct.Uint32('primitivesCount'),
  Struct.Int32('scale'),
);

export default objectTableStruct