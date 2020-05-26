export class VRAM {
  static BEETLE_PSX_VRAM_OFFSET = 0x20AA19;

  static VRAM_NATIVE_WIDTH = 1024;
  static VRAM_NATIVE_HEIGHT = 512;

  static VRAM_BYTE_WIDTH = 2048;
  static VRAM_BYTE_HEIGHT = 512;

  static TEXTURE_PAGE_NATIVE_WIDTH = 64;
  static TEXTURE_PAGE_NATIVE_HEIGHT = 256;

  static TEXTURE_PAGE_BYTE_WIDTH = 128;
  static TEXTURE_PAGE_BYTE_HEIGHT = 256;

  constructor(vramArrayBuffer) {
    this.arrayBuffer = vramArrayBuffer;
  }

  static fromBeetlePSXSaveState(arrayBuffer) {
    const endOfVRAM = VRAM.BEETLE_PSX_VRAM_OFFSET + VRAM.VRAM_BYTE_WIDTH * VRAM.VRAM_BYTE_HEIGHT;
    return new VRAM(arrayBuffer.slice(VRAM.BEETLE_PSX_VRAM_OFFSET, endOfVRAM));
  }

  getTextureImageData(bitsPerPixel, texturePage, clutX, clutY) {
    const texturePageData = this.getTextureImageData(texturePage);

    if (bitsPerPixel === 4) {
      const clutColors = this.getClutColors(clutX, clutY, bitsPerPixel);
      this.getFourBitTexture(texturePageData, clutColors);
    }
  }

  getTexturePageData(texturePage) {
    let xPos;
    let yPos;

    if (texturePage < 16) {
      xPos = texturePage * 128;
      yPos = 0;
    } else {
      xPos = (texturePage - 16) * 128;
      yPos = 256;
    }

    const texturePageBytes = new Uint8Array(VRAM.TEXTURE_PAGE_BYTE_WIDTH * VRAM.TEXTURE_PAGE_BYTE_HEIGHT);
    let dataIndex = xPos + yPos * VRAM.TEXTURE_PAGE_BYTE_WIDTH;
    let currentRow = 1;
    
    for (let i = 0; i < texturePageBytes.length; i++) {
      if (i === (VRAM.TEXTURE_PAGE_BYTE_WIDTH * currentRow)) {
        dataIndex += VRAM.TEXTURE_PAGE_BYTE_WIDTH;
        currentRow++;
      }

      texturePageBytes[i] = this.arrayBuffer[dataIndex];
    }

    return texturePageBytes;
  }

  getFourBitTexture(texturePageData, clutColors) {
    console.log(clutData);
  }

  getClutColors(clutX, clutY, bitsPerPixel) {
    const numberOfColors = bitsPerPixel === 4 ? 16 : 256;
    const clut16BitPos = clutX + clutY * VRAM.VRAM_NATIVE_WIDTH;
    const clutData = new Uint16Array(this.arrayBuffer).slice(clut16BitPos, clut16BitPos + numberOfColors);
    
    const dataView = new DataView(clutData.buffer);
    const colors = [];

    for (let i = 0; i < clutData.length; i++) {
      const colorData = dataView.getUint16(i * 2, true);
      colors.push(this.getRGBFrom16Bit(colorData));
    }

    return colors;
  }

  getRGBFrom16Bit(sixteenBitColorData) {
    const redBitmask =   0b0000000000011111;
    const greenBitmask = 0b0000001111100000;
    const blueBitmask =  0b0111110000000000;
    
    const red16Bit = sixteenBitColorData & redBitmask;
    const green16Bit = (sixteenBitColorData & greenBitmask) >> 5;
    const blue16Bit = (sixteenBitColorData & blueBitmask) >> 10;

    const red = red16Bit * 8.225;
    const green = green16Bit * 8.225;
    const blue = blue16Bit * 8.225;

    return {
      red: Math.round(red),
      green: Math.round(green),
      blue: Math.round(blue),
    };
  }
}