import { PSXColor } from "../core/psx-color";

export class VRAM {
  static readonly BEETLE_PSX_VRAM_OFFSET = 0x20AA19;

  static readonly VRAM_NATIVE_WIDTH = 1024;
  static readonly VRAM_NATIVE_HEIGHT = 512;

  static readonly VRAM_BYTE_WIDTH = 2048;
  static readonly VRAM_BYTE_HEIGHT = 512;

  static readonly TEXTURE_PAGE_NATIVE_WIDTH = 64;
  static readonly TEXTURE_PAGE_NATIVE_HEIGHT = 256;

  static readonly ACCESSIBLE_TEXTURE_WIDTH = 256;
  static readonly ACCESSIBLE_TEXTURE_HEIGHT = 256;

  vramData: Uint16Array;

  constructor(vramArrayBuffer: ArrayBuffer) {
    this.vramData = new Uint16Array(vramArrayBuffer);
  }

  static fromBeetlePSXSaveState(arrayBuffer: ArrayBuffer): VRAM {
    const endOfVRAM = VRAM.BEETLE_PSX_VRAM_OFFSET + VRAM.VRAM_BYTE_WIDTH * VRAM.VRAM_BYTE_HEIGHT;
    return new VRAM(arrayBuffer.slice(VRAM.BEETLE_PSX_VRAM_OFFSET, endOfVRAM));
  }

  getTexturePageData(texturePage: number) {
    let xPos: number;
    let yPos: number;

    if (texturePage < 16) {
      xPos = texturePage * VRAM.TEXTURE_PAGE_NATIVE_WIDTH;
      yPos = 0;
    } else {
      xPos = (texturePage - 16) * VRAM.TEXTURE_PAGE_NATIVE_WIDTH;
      yPos = 256;
    }

    let rawTexturePageData = new Uint16Array(VRAM.TEXTURE_PAGE_NATIVE_WIDTH * VRAM.TEXTURE_PAGE_NATIVE_HEIGHT);

    let dataIndex = xPos + yPos * VRAM.VRAM_NATIVE_WIDTH;
    let currentRow = 1;
    for (let i = 0; i < rawTexturePageData.length; i++) {
      rawTexturePageData[i] = this.vramData[dataIndex];

      dataIndex++;
      if (i === VRAM.TEXTURE_PAGE_NATIVE_WIDTH * currentRow - 1) {
        dataIndex += VRAM.VRAM_NATIVE_WIDTH - VRAM.TEXTURE_PAGE_NATIVE_WIDTH;
        currentRow++;
      }
    }
    return rawTexturePageData;
  }

  getTexturePageImageData(bitsPerPixel: number, texturePage: number, clutX?: number, clutY?: number) {
    let xPos: number;
    let yPos: number;

    if (texturePage < 16) {
      xPos = texturePage * 64;
      yPos = 0;
    } else {
      xPos = (texturePage - 16) * 64;
      yPos = 256;
    }

    let dataIndex = xPos + yPos * VRAM.VRAM_NATIVE_WIDTH;

    if (bitsPerPixel === 4) {
      const clutColors = this.getClutColors(clutX, clutY, bitsPerPixel);
      return this.getFourBitTexture(dataIndex, clutColors);
    }
    
    if (bitsPerPixel === 8) {
      const clutColors = this.getClutColors(clutX, clutY, bitsPerPixel);
      return this.getEightBitTexture(dataIndex, clutColors);
    }

    if (bitsPerPixel === 16) {
      return this.getSixteenBitTexture(dataIndex);
    }

    if (bitsPerPixel === 24) {
      return this.getTwentyFourBitTexture(dataIndex);
    }
    
  }

  getFourBitTexture(dataIndex: number, clutColors: PSXColor[]): ImageData {
    // One texture page is 64 16-bit units across, or 256 4-bit units. Since we are dealing with
    // an 4-bit texture here, we're dealing with 256 final pixels. Since this is the full accessible
    // width, we only fetch one texture page.

    const imageData = new ImageData(VRAM.ACCESSIBLE_TEXTURE_WIDTH, VRAM.ACCESSIBLE_TEXTURE_HEIGHT);

    let currentRow = 1;
    let currentPixel = 0;
    for (let i = 0; i < imageData.data.length; i += 16) {
      const pixelData = this.vramData[dataIndex];
      const firstColorIndex = pixelData & 0b1111;
      const secondColorIndex = pixelData >> 4 & 0b1111;
      const thirdColorIndex = pixelData >> 8 & 0b1111;
      const fourthColorIndex = pixelData >> 12 & 0b1111;

      this.setImageDataPixel(imageData, i, clutColors[firstColorIndex]);
      this.setImageDataPixel(imageData, i + 4, clutColors[secondColorIndex]);
      this.setImageDataPixel(imageData, i + 8, clutColors[thirdColorIndex]);
      this.setImageDataPixel(imageData, i + 12, clutColors[fourthColorIndex]);

      dataIndex++;
      currentPixel += 4;
      if (currentPixel === VRAM.ACCESSIBLE_TEXTURE_WIDTH * currentRow) {
        dataIndex += VRAM.VRAM_NATIVE_WIDTH - VRAM.TEXTURE_PAGE_NATIVE_WIDTH;
        currentRow++;
      }
    }

    return imageData;
  }

  getEightBitTexture(dataIndex: number, clutColors: PSXColor[]): ImageData {
    // One texture page is 64 16-bit units across, or 128 8-bit units. Since we are dealing with
    // an 8-bit texture here, we're dealing with 128 pixel width. PS1 allows accessing texture
    // coordinates up to 256, so in 8-bit mode we actually fetch 2 texture pages, the one
    // specified by the asset, plus one more, this gives us the full 256 pixel width the PS1
    // is capable of accessing.
    const texturePagesToFetch = 2;

    const imageData = new ImageData(VRAM.ACCESSIBLE_TEXTURE_WIDTH, VRAM.ACCESSIBLE_TEXTURE_WIDTH);

    let currentRow = 1;
    let currentPixel = 0;
    for (let i = 0; i < imageData.data.length; i+= 8) {
      const pixelData = this.vramData[dataIndex];
      const firstColorIndex = pixelData & 0b11111111;
      const secondColorIndex = pixelData >> 8;

      this.setImageDataPixel(imageData, i, clutColors[firstColorIndex]);
      this.setImageDataPixel(imageData, i + 4, clutColors[secondColorIndex]);

      dataIndex++;
      currentPixel += 2;
      if (currentPixel === VRAM.ACCESSIBLE_TEXTURE_WIDTH * currentRow) {
        dataIndex += VRAM.VRAM_NATIVE_WIDTH - VRAM.TEXTURE_PAGE_NATIVE_WIDTH * texturePagesToFetch;
        currentRow++;
      }
    }

    return imageData;
  }

  getSixteenBitTexture(dataIndex: number): ImageData {
    // One texture page is 64 16-bit units across. Since we are dealing with
    // a 16-bit texture here, we're dealing with 64 pixel width. PS1 allows accessing texture
    // coordinates up to 256, so in 16-bit mode we actually fetch 4 texture pages, the one
    // specified by the asset, plus 3 more, this gives us the full 256 pixel width the PS1
    // is capable of accessing.
    const texturePagesToFetch = 4;

    const imageData = new ImageData(VRAM.ACCESSIBLE_TEXTURE_WIDTH, VRAM.ACCESSIBLE_TEXTURE_HEIGHT);

    let currentRow = 1;
    let currentPixel = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixelData = this.vramData[dataIndex];

      const color = PSXColor.FromSixteenBitValue(pixelData);
      this.setImageDataPixel(imageData, i, color);

      dataIndex++;
      currentPixel++
      if (currentPixel === VRAM.ACCESSIBLE_TEXTURE_WIDTH * currentRow) {
        dataIndex += VRAM.VRAM_NATIVE_WIDTH - VRAM.TEXTURE_PAGE_NATIVE_WIDTH * texturePagesToFetch;
        currentRow++;
      }
    }

    return imageData;
  }

  getTwentyFourBitTexture(dataIndex: number): ImageData {
    // Presently only grabs one texture page, as I've never seen even a 16-bit texture
    // let alone a 24-bit one. May need to be revisited.
    const imageData = new ImageData(VRAM.ACCESSIBLE_TEXTURE_WIDTH, VRAM.ACCESSIBLE_TEXTURE_HEIGHT);

    let currentRow = 1;
    let currentPixel = 0;
    for (let i = 0; i < imageData.data.length; i += 8) {
      const firstRedGreen = this.vramData[dataIndex];
      const firstBlueSecondRed = this.vramData[dataIndex + 1];
      const secondGreenBlue = this.vramData[dataIndex + 2];

      const firstBlue = firstBlueSecondRed & 0b11111111;
      const secondRed = firstBlueSecondRed >> 8;

      const firstPixel = PSXColor.FromTwentyFourBitValue(firstRedGreen + (firstBlue << 16));
      const secondPixel = PSXColor.FromTwentyFourBitValue(secondRed + (secondGreenBlue << 8));
      this.setImageDataPixel(imageData, i, firstPixel);
      this.setImageDataPixel(imageData, i + 4, secondPixel);

      dataIndex+= 3;
      currentPixel += 2;
      if (currentPixel === VRAM.ACCESSIBLE_TEXTURE_WIDTH * currentRow) {
        dataIndex += VRAM.VRAM_NATIVE_WIDTH - VRAM.TEXTURE_PAGE_NATIVE_WIDTH;
        currentRow++;
      }
    }

    return imageData;
  }

  getClutColors(clutX: number, clutY: number, bitsPerPixel: number) {
    const numberOfColors = bitsPerPixel === 4 ? 16 : 256;
    const clut16BitPos = clutX + clutY * VRAM.VRAM_NATIVE_WIDTH;
    const clutData = this.vramData.slice(clut16BitPos, clut16BitPos + numberOfColors);
    
    const dataView = new DataView(clutData.buffer);
    const colors = [];

    for (let i = 0; i < clutData.length; i++) {
      const colorData = dataView.getUint16(i * 2, true);
      colors.push(PSXColor.FromSixteenBitValue(colorData));
    }

    return colors;
  }

  private setImageDataPixel(imageData: ImageData, imageDataIndex: number, color: PSXColor) {
    imageData.data[imageDataIndex] = color.red;
    imageData.data[imageDataIndex + 1] = color.green;
    imageData.data[imageDataIndex + 2] = color.blue;
    imageData.data[imageDataIndex + 3] = color.alpha;
  }

}