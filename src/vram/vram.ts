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

  arrayBuffer: ArrayBuffer;

  constructor(vramArrayBuffer: ArrayBuffer) {
    this.arrayBuffer = vramArrayBuffer;
  }

  static fromBeetlePSXSaveState(arrayBuffer: ArrayBuffer): VRAM {
    const endOfVRAM = VRAM.BEETLE_PSX_VRAM_OFFSET + VRAM.VRAM_BYTE_WIDTH * VRAM.VRAM_BYTE_HEIGHT;
    return new VRAM(arrayBuffer.slice(VRAM.BEETLE_PSX_VRAM_OFFSET, endOfVRAM));
  }

  // TODO: Refactore "texture overrun" logic to be less bad.

  getTexturePageImageData(bitsPerPixel: number, texturePage: number, clutX: number, clutY: number) {
    
    // TODO: Add four bit textrure page data fetcher and reenable
    // if (bitsPerPixel === 4) {
    //   const clutColors = this.getClutColors(clutX, clutY, bitsPerPixel);
    //   return this.getFourBitTexture(texturePageData, clutColors);
    // }

    if (bitsPerPixel === 8) {
      const texturePageData = this.getEightBitTexturePageData(texturePage);
      const clutColors = this.getClutColors(clutX, clutY, bitsPerPixel);
      return this.getEightBitTexture(texturePageData, clutColors);
    }

    if (bitsPerPixel === 16) {
      const texturePageData = this.getSixteenBitTexturePageData(texturePage);
      return this.getSixteenBitTexture(texturePageData);
    }

    if (bitsPerPixel === 24) {
      console.log('Not yet supported');
      return null;
    }
  }

  getEightBitTexturePageData(texturePage) {
    let xPos;
    let yPos;

    if (texturePage < 16) {
      xPos = texturePage * 128;
      yPos = 0;
    } else {
      xPos = (texturePage - 16) * 128;
      yPos = 256;
    }

    // For 8-bit textures the playstation can "overread" into the next texture page. To allow for this we need to grab
    // two texture pages if the selected page isn't 15 or 31, as those are the ends of the tpage rows and can't be overread.
    let nextPageMultiplier = 1;
    if (texturePage !== 15 && texturePage !== 31) {
      nextPageMultiplier = 2;
    }

    const texturePageBytes = new Uint8Array(VRAM.TEXTURE_PAGE_BYTE_WIDTH * VRAM.TEXTURE_PAGE_BYTE_HEIGHT * nextPageMultiplier);
    const dataView = new DataView(this.arrayBuffer);

    let dataIndex = xPos + yPos * VRAM.VRAM_BYTE_WIDTH;
    let currentRow = 1;

    for (let i = 0; i < texturePageBytes.length; i++) {
      texturePageBytes[i] = dataView.getUint8(dataIndex);
      dataIndex++;

      if (i === (VRAM.TEXTURE_PAGE_BYTE_WIDTH * currentRow * nextPageMultiplier - 1)) {
        dataIndex += VRAM.VRAM_BYTE_WIDTH - VRAM.TEXTURE_PAGE_BYTE_WIDTH * nextPageMultiplier;
        currentRow++;
      }
    }
    console.log(texturePageBytes.length);
    return texturePageBytes;
  }

  getSixteenBitTexturePageData(texturePage) {
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
    const dataView = new DataView(this.arrayBuffer);

    let dataIndex = xPos + yPos * VRAM.TEXTURE_PAGE_BYTE_WIDTH;
    let currentRow = 1;
    
    for (let i = 0; i < texturePageBytes.length; i++) {
      texturePageBytes[i] = dataView.getUint8(dataIndex);
      dataIndex++;

      if (i === (VRAM.TEXTURE_PAGE_BYTE_WIDTH * currentRow - 1)) {
        dataIndex += VRAM.VRAM_BYTE_WIDTH - VRAM.TEXTURE_PAGE_BYTE_WIDTH;
        currentRow++;
      }
    }

    return texturePageBytes;
  }

  getFourBitTexture(texturePageData, clutColors) {
    const imageData = new ImageData(VRAM.TEXTURE_PAGE_NATIVE_WIDTH * 4, VRAM.TEXTURE_PAGE_NATIVE_HEIGHT);

    let byteIndex = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
      const currentByte = texturePageData[byteIndex];
      const currentNibble = (i / 4) % 2;

      let paletteIndex;

      if (currentNibble === 0) {
        paletteIndex = currentByte & 0xF; // get first nibble from byte value
      } else {
        paletteIndex = currentByte >> 4;  // get second nibble from byte value
      }

      const color = clutColors[paletteIndex];
      imageData.data[i] = color.red;
      imageData.data[i + 1] = color.green;
      imageData.data[i + 2] = color.blue;
      imageData.data[i + 3] = 255;

      if (currentNibble === 1) {
        byteIndex++;
      }
    }

    return imageData;
  }

  getEightBitTexture(texturePageData, clutColors) {
    const imageData = new ImageData(VRAM.TEXTURE_PAGE_BYTE_WIDTH * 2, VRAM.TEXTURE_PAGE_NATIVE_HEIGHT);

    let byteIndex = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
      const paletteIndex = texturePageData[byteIndex]
      const color = clutColors[paletteIndex];
      imageData.data[i] = color.red;
      imageData.data[i + 1] = color.green;
      imageData.data[i + 2] = color.blue;
      imageData.data[i + 3] = 255;

      byteIndex++;
    }

    return imageData;
  }

  getSixteenBitTexture(texturePageData) {
    const imageData = new ImageData(VRAM.TEXTURE_PAGE_NATIVE_WIDTH, VRAM.TEXTURE_PAGE_NATIVE_HEIGHT);
    const sixteenBitView = new Uint16Array(texturePageData.buffer);
    let colorIndex = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
      const color = this.getRGBFrom16Bit(sixteenBitView[colorIndex]);
      imageData.data[i] = color.red;
      imageData.data[i + 1] = color.green;
      imageData.data[i + 2] = color.blue;
      imageData.data[i + 3] = 255;

      colorIndex++;
    }

    return imageData;
  }

  getTwentyFourBitTexture(texturePageData) {
    const imageData = new ImageData(VRAM.TEXTURE_PAGE_BYTE_WIDTH / 3, VRAM.TEXTURE_PAGE_NATIVE_HEIGHT);
    let byteIndex = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = texturePageData[byteIndex];
      imageData.data[i + 1] = texturePageData[byteIndex + 1];
      imageData.data[i + 2] = texturePageData[byteIndex + 2];
      imageData.data[i + 3] = 255;

      byteIndex += 3;
    }

    return imageData;
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