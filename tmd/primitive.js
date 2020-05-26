import { flatNoTextureSolidStruct } from './structs/primitives/flat-no-texture-solid.struct.js';
import { flatNoTextureGradientStruct } from './structs/primitives/flat-no-texture-gradient.struct.js';
import { gouradNoTextureSolidStruct } from './structs/primitives/gourad-no-texture-solid.struct.js';
import flatTextured from './structs/primitives/flat-textured.js';

export class Primitive {
  constructor(primitiveData) {
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
    this.noTextureColorMode = (primitiveData.flag & polygonColorFlagBitmask) >> 2 === 1 ? 'Gradiation' : 'Solid';

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
  get textureCLUTXPosition() {
    if (this.isTextured && this.packetData) {
      return (this.packetData.cba & 0b1111111111) << 4;
    }
  }

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
      const method = this.packetData.tsb & 0b0000000001100000;

      switch (method) {
        case 0: 
          return '50 % background + 50 % polygon';
        case 1:
          return '100 % background + 100 % polygon';
        case 2: 
          return '2 - 100 % background - 100 % polygon';
        case 3:
          return '100 % background + 25 % polygon';
      }
    }
  }

  get textureColorMode() {
    if (this.isTextured && this.packetData) {
      const colorMore = this.packetData.tsb & 0b0000000001100000;
      if (colorMode === 0) {
        return '4-bit'
      }

      if (colorMode === 1) {
        return '8-bit';
      }

      if (colorMore === 2) {
        return '15-bit';
      }
    }
  }
  // End texture helpers

  setPacketData(arrayBuffer) {

    // --- 3 Vertex Polygon with Light Source Calculation ---
    if (this.codeType === 'Polygon' && this.numberOfSides === 3 && this.isLightCalculated) {
      
      // Flat shading no texture solid color
      if (this.shading === 'Flat' && !this.isTextured && this.noTextureColorMode === 'Solid') {
        this.packetDataType = '3_SIDED_FLAT_NO_TEXTURE_SOLID';
        this.packetData = flatNoTextureSolidStruct.createObject(arrayBuffer, this.primitiveData.endPosition + 1, true);
      }

      // Gourad shading no texture solid color
      else if (this.shading === 'Gourad' && !this.isTextured && this.noTextureColorMode === 'Solid') {
        this.packetDataType = '3_SIDED_GOURAD_NO_TEXTURE_SOLID';
        this.packetData = gouradNoTextureSolidStruct.createObject(arrayBuffer, this.primitiveData.endPosition + 1, true);
      }

      // Flat shading no texture gradient color
      else if (this.shading === 'Flat' && !this.isTextured && this.noTextureColorMode === 'Gradient') {
        this.packetDataType = '3_SIDED_FLAT_NO_TEXTURE_GRADIENT';
        this.packetData = flatNoTextureGradientStruct.createObject(arrayBuffer, this.primitiveData.endPosition + 1, true);
      }

      // Gourad shading no texture gradient color
      else if (this.shading === 'Gourad' && !this.isTextured && this.noTextureColorMode === 'Gradient') {
        this.packetDataType = '3_SIDED_GOURAD_NO_TEXTURE_GRADIENT';
      }

      // Flat shading texture no color
      else if (this.shading === 'Flat' && this.isTextured) {
        this.packetDataType = '3_SIDED_FLAT_TEXTURE';
        this.packetData = flatTextured.createObject(arrayBuffer, this.primitiveData.endPosition + 1, true);
      }

      // Gourad shading texture no color
      else if (this.shading === 'Gourad' && this.isTextured) {
        this.packetDataType = '3_SIDED_GOURAD_TEXTURE';
      }


    // --- 4 Vertex polygon with Light Source Calculation ---
    } else if (this.codeType === 'Polygon' && this.numberOfSides === 4 && this.isLightCalculated) {

      // Flat shading no texture solid color
      if (this.shading === 'Flat' && !this.isTextured && this.noTextureColorMode === 'Solid') {
        this.packetDataType = '4_SIDED_FLAT_NO_TEXTURE_SOLID';
      }

      // Gourad shading no texture solid color
      else if (this.shading === 'Gourad' && !this.isTextured && this.noTextureColorMode === 'Solid') {
        this.packetDataType = '4_SIDED_GOURAD_NO_TEXTURE_SOLID';
      }

      // Flat shading no texture gradient color
      else if (this.shading === 'Flat' && !this.isTextured && this.noTextureColorMode === 'Gradient') {
        this.packetDataType = '4_SIDED_FLAT_NO_TEXTURE_GRADIENT';
      }

      // Gourad shading no texture gradient color
      else if (this.shading === 'Gourad' && !this.isTextured && this.noTextureColorMode === 'Gradient') {
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
      if (!this.isTextured && this.noTextureColorMode === 'Solid') {
        this.packetDataType = '3_SIDED_NO_TEXTURE_SOLID';
      }

      // Gradient no texture
      else if (!this.isTextured && this.noTextureColorMode === 'Gradient') {
        this.packetDataType = '3_SIDED_NO_TEXTURE_GRADIENT';
      }

      // Solid texture
      else if (this.noTextureColorMode === 'Solid' && this.isTextured) {
        this.packetDataType = '3_SIDED_TEXTURE_SOLID';
      }

      // Gradient texture
      else if (this.noTextureColorMode === 'Gradient' && this.isTextured) {
        this.packetDataType = '3_SIDED_TEXTURE_GRADIENT';
      }


    // --- 4 Vertex Polygon with No Light Source Calculation ---
    } else if (this.codeType === 'Polygon' && this.numberOfSides === 4 && !this.isLightCalculated) {

      // Solid no texture
      if (!this.isTextured && this.noTextureColorMode === 'Solid') {
        this.packetDataType = '3_SIDED_NO_TEXTURE_SOLID';
      }

      // Gradient no texture
      else if (!this.isTextured && this.noTextureColorMode === 'Gradient') {
        this.packetDataType = '3_SIDED_NO_TEXTURE_GRADIENT';
      }

      // Solid texture
      else if (this.noTextureColorMode === 'Solid' && this.isTextured) {
        this.packetDataType = '3_SIDED_TEXTURE_SOLID';
      }

      // Gradient texture
      else if (this.noTextureColorMode === 'Gradient' && this.isTextured) {
        this.packetDataType = '3_SIDED_TEXTURE_GRADIENT';
      }


    // --- Straight Line ---
    } else if (this.codeType === 'Line') {
      // No Gradient

      // Gradient

    // --- 3 Dimensional Sprite ---
    } else if (this.codeType === 'Sprite') {
      // Unknown, this changes how the options work though, so possible refactor to options when type is sprite
    }

  }
}