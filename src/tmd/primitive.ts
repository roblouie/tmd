import { flatNoTextureSolidStruct } from './structs/primitives/flat-no-texture-solid.struct';
import { flatNoTextureGradientStruct, FlatNoTextureGradientData } from './structs/primitives/flat-no-texture-gradient.struct';
import { gouradNoTextureSolidStruct } from './structs/primitives/gourad-no-texture-solid.struct';
import { flatTexturedStruct, FlatTexturedData } from './structs/primitives/flat-textured';
import { PrimitiveData } from './structs/primitive.struct';
import { PrimitiveType } from './primitive-type.enum';
import { gouradTexturedStruct, GouradTexturedData } from './structs/primitives/gourad-textured';
import { lineSolidStruct, LineSolidData } from './structs/primitives/lines/line-solid.struct';
import { lineGradientStruct, LineGradientData } from './structs/primitives/lines/line-gradient';
import { noLightNoTextureSolidStruct, NoLightNoTextureSolidData } from './structs/primitives/no-light-no-texture-solid.struct';
import { noLightTexturedSolidStruct, NoLightTexturedSolidData } from './structs/primitives/no-light-textured-solid.struct';

export class Primitive {
  primitiveData: PrimitiveData;
  packetDataLength: number;
  totalByteLength: number;

  isLightCalculated: boolean;
  faces: number;
  colorMode: 'Solid' | 'Gradient';
  codeType: 'Polygon' | 'Line' | 'Sprite';

  isLightCalculatedAtTexture: boolean;
  isTranslucent: boolean;
  isTextured: boolean;
  numberOfSides: number;
  shading: string;

  packetData: any;
  packetDataType: PrimitiveType | string;

  constructor(primitiveData: PrimitiveData) {
    this.primitiveData = primitiveData;

    // convert word length to byte length to store packet data length in bytes
    this.packetDataLength = primitiveData.ilen * 4;

    // total byte length of primitive with packet data
    this.totalByteLength = primitiveData.byteLength + this.packetDataLength;

    // Parse flag info
    const lightCalculationFlagBitmask = 0b00000001;
    const polygonFaceCountFlagBitmask = 0b00000010;
    const polygonColorFlagBitmask =     0b00000100;
    
    this.isLightCalculated = (primitiveData.flag & lightCalculationFlagBitmask) === 0;
    this.faces = ((primitiveData.flag & polygonFaceCountFlagBitmask) >> 1) + 1;
    this.colorMode = (primitiveData.flag & polygonColorFlagBitmask) >> 2 === 1 ? 'Gradient' : 'Solid';

    // Parse code info
    const codeBitmask = 0b11100000;
    const undocumentedPolygonCode = 0;
    const polygonCode = 0b001;
    const lineCode = 0b010;
    const spriteCode = 0b011;
    const code = (primitiveData.mode & codeBitmask) >> 5;

    if (code === polygonCode || code === undocumentedPolygonCode) {
      this.codeType = 'Polygon';
    } else if (code === lineCode) {
      this.codeType = 'Line';
    } else if (code === spriteCode) {
      this.codeType = 'Sprite';
    }

    // Parse option Info
    const optionBitmask = 0b00011111;
    const isLightCalculatedAtTextureFlagBitmask = 0b00000001;
    const isTranslucenctFlagBitmask = 0b00000010;
    const isTexturedFlagBitmask = 0b00000100;
    const isFourSidedPolygonFlagBitmask = 0b00001000;
    const isGouradShadedFlagBitmask = 0b00010000;
    const option = (primitiveData.mode & optionBitmask);

    this.isLightCalculatedAtTexture = (option & isLightCalculatedAtTextureFlagBitmask) === 1;
    this.isTranslucent = (option & isTranslucenctFlagBitmask) >> 1 === 1;
    this.isTextured = (option & isTexturedFlagBitmask) >> 2 === 1;
    this.numberOfSides = (option & isFourSidedPolygonFlagBitmask) >> 3 === 1 ? 4 : 3;
    this.shading = (option & isGouradShadedFlagBitmask) >> 4 === 1 ? 'Gourad' : 'Flat';
  }

  // Texture helpers, consider moving into packet data types or something...not sure these belong direclty in primitive
  getTextureXYPositionInVRAM() {
    if (this.isTextured && this.packetData) {
      if (this.texturePage < 16) {
        return { 
          x: this.texturePage * 64,
          y: 0
        }
      } else {
        return {
          x: (this.texturePage - 16) * 64,
          y: 256
        }
      }
    }
  }

  get textureCLUTXPosition() {
    if (this.isTextured && this.packetData) {
      return (this.packetData.cba & 0b0000000000111111) << 4;
    }
  }

  get textureCLUTYPosition() {
    if (this.isTextured && this.packetData) {
      return (this.packetData.cba & 0b0111111111000000) >> 6;
    }
  }

  get texturePage() {
    if (this.isTextured && this.packetData) {
      return this.packetData.tsb & 0b0000000000011111;
    }
  }

  get textureSemiTransparencyMethod() {
    if (this.isTextured && this.packetData) {
      const method = (this.packetData.tsb & 0b0000000001100000) >> 5;

      switch (method) {
        case 0: 
          return '50 % background + 50 % polygon';
        case 1:
          return '100 % background + 100 % polygon';
        case 2: 
          return '100 % background - 100 % polygon';
        case 3:
          return '100 % background + 25 % polygon';
      }
    }
  }

  get textureBitsPerPixel() {
    if (this.isTextured && this.packetData) {
      const colorMode = (this.packetData.tsb & 0b0000000110000000) >> 7;
      if (colorMode === 0) {
        return 4;
      }

      if (colorMode === 1) {
        return 8;
      }

      if (colorMode === 2) {
        return 16;
      }
    }
  }
  // End texture helpers

  setPacketData(arrayBuffer: ArrayBuffer) {

    // --- 3 Vertex Polygon with Light Source Calculation ---
    if (this.codeType === 'Polygon' && this.numberOfSides === 3 && this.isLightCalculated) {
      
      // Flat shading no texture solid color
      if (this.shading === 'Flat' && !this.isTextured && this.colorMode === 'Solid') {
        this.packetDataType = PrimitiveType.THREE_SIDED_FLAT_NO_TEXTURE_SOLID;
        this.packetData = flatNoTextureSolidStruct.createObject(arrayBuffer, this.primitiveData.endPosition + 1, true);
      }

      // Gourad shading no texture solid color
      else if (this.shading === 'Gourad' && !this.isTextured && this.colorMode === 'Solid') {
        this.packetDataType = PrimitiveType.THREE_SIDED_GOURAD_NO_TEXTURE_SOLID;
        this.packetData = gouradNoTextureSolidStruct.createObject(arrayBuffer, this.primitiveData.endPosition + 1, true);
      }

      // Flat shading no texture gradient color
      else if (this.shading === 'Flat' && !this.isTextured && this.colorMode === 'Gradient') {
        this.packetDataType = PrimitiveType.THREE_SIDED_FLAT_NO_TEXTURE_GRADIENT;
        this.packetData = flatNoTextureGradientStruct.createObject<FlatNoTextureGradientData>(arrayBuffer, this.primitiveData.endPosition + 1, true);
      }

      // Gourad shading no texture gradient color
      else if (this.shading === 'Gourad' && !this.isTextured && this.colorMode === 'Gradient') {
        this.packetDataType = '3_SIDED_GOURAD_NO_TEXTURE_GRADIENT';
      }

      // Flat shading texture no color
      else if (this.shading === 'Flat' && this.isTextured) {
        this.packetDataType = PrimitiveType.THREE_SIDED_FLAT_TEXTURE;
        this.packetData = flatTexturedStruct.createObject<FlatTexturedData>(arrayBuffer, this.primitiveData.endPosition + 1, true);
      }

      // Gourad shading texture no color
      else if (this.shading === 'Gourad' && this.isTextured) {
        this.packetDataType = PrimitiveType.THREE_SIDED_GOURAD_TEXTURE;
        this.packetData = gouradTexturedStruct.createObject<GouradTexturedData>(arrayBuffer, this.primitiveData.endPosition + 1, true);
      }


    // --- 4 Vertex polygon with Light Source Calculation ---
    } else if (this.codeType === 'Polygon' && this.numberOfSides === 4 && this.isLightCalculated) {

      // Flat shading no texture solid color
      if (this.shading === 'Flat' && !this.isTextured && this.colorMode === 'Solid') {
        this.packetDataType = '4_SIDED_FLAT_NO_TEXTURE_SOLID';
      }

      // Gourad shading no texture solid color
      else if (this.shading === 'Gourad' && !this.isTextured && this.colorMode === 'Solid') {
        this.packetDataType = '4_SIDED_GOURAD_NO_TEXTURE_SOLID';
      }

      // Flat shading no texture gradient color
      else if (this.shading === 'Flat' && !this.isTextured && this.colorMode === 'Gradient') {
        this.packetDataType = '4_SIDED_FLAT_NO_TEXTURE_GRADIENT';
      }

      // Gourad shading no texture gradient color
      else if (this.shading === 'Gourad' && !this.isTextured && this.colorMode === 'Gradient') {
        this.packetDataType = '4_SIDED_GOURAD_NO_TEXTURE_GRADIENT';
      }

      // Flat shading texture no color
      else if (this.shading === 'Flat' && this.isTextured) {
        this.packetDataType = '4_SIDED_FLAT_TEXTURE';
      }

      // Gourad shading texture no color
      else if (this.shading === 'Gourad' && this.isTextured) {
        this.packetDataType = '4_SIDED_GOURAD_TEXTURE';
      }
    

    // --- 3 Vertex Polygon with No Light Source Calculation ---
    } else if (this.codeType === 'Polygon' && this.numberOfSides === 3 && !this.isLightCalculated) {
      
      // Solid no texture
      if (!this.isTextured && this.colorMode === 'Solid') {
        this.packetDataType = PrimitiveType.THREE_SIDED_NO_LIGHT_NO_TEXTURE_SOLID;
        this.packetData = noLightNoTextureSolidStruct.createObject<NoLightNoTextureSolidData>(arrayBuffer, this.primitiveData.nextOffset, true);
      }

      // Gradient no texture
      else if (!this.isTextured && this.colorMode === 'Gradient') {
        this.packetDataType = '3_SIDED_NO_LIGHT_NO_TEXTURE_GRADIENT';
      }

      // Solid texture
      else if (this.colorMode === 'Solid' && this.isTextured) {
        this.packetDataType = PrimitiveType.THREE_SIDED_NO_LIGHT_TEXTURE_SOLID;
        this.packetData = noLightTexturedSolidStruct.createObject<NoLightTexturedSolidData>(arrayBuffer, this.primitiveData.nextOffset, true);
      }

      // Gradient texture
      else if (this.colorMode === 'Gradient' && this.isTextured) {
        this.packetDataType = '3_SIDED_NO_LIGHT_TEXTURE_GRADIENT';
      }


    // --- 4 Vertex Polygon with No Light Source Calculation ---
    } else if (this.codeType === 'Polygon' && this.numberOfSides === 4 && !this.isLightCalculated) {

      // Solid no texture
      if (!this.isTextured && this.colorMode === 'Solid') {
        this.packetDataType = '4_SIDED_NO_TEXTURE_SOLID';
      }

      // Gradient no texture
      else if (!this.isTextured && this.colorMode === 'Gradient') {
        this.packetDataType = '4_SIDED_NO_TEXTURE_GRADIENT';
      }

      // Solid texture
      else if (this.colorMode === 'Solid' && this.isTextured) {
        this.packetDataType = '4_SIDED_TEXTURE_SOLID';
      }

      // Gradient texture
      else if (this.colorMode === 'Gradient' && this.isTextured) {
        this.packetDataType = '4_SIDED_TEXTURE_GRADIENT';
      }


    // --- Straight Line ---
    } else if (this.codeType === 'Line') {
      // No Gradient
      if (this.colorMode === 'Solid') {
        this.packetDataType = PrimitiveType.LINE_SOLID;
        this.packetData = lineSolidStruct.createObject<LineSolidData>(arrayBuffer, this.primitiveData.nextOffset, true);
      }

      // Gradient
      else if (this.colorMode === 'Gradient') {
        this.packetDataType = PrimitiveType.LINE_GRADIENT;
        this.packetData = lineGradientStruct.createObject<LineGradientData>(arrayBuffer, this.primitiveData.nextOffset, true);
      }
    // --- 3 Dimensional Sprite ---
    } else if (this.codeType === 'Sprite') {
      // Unknown, this changes how the options work though, so possible refactor to options when type is sprite
    }

  }
}