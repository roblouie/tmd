import { SectionHeaderData, sectionHeaderStruct } from "./structs/section-header.struct";
import { timHeaderStruct, TimHeaderData } from "./structs/header.struct";
import { TIMPixelMode } from "./tim-pixel-modes.enum";
import { PSXColor } from "../core/psx-color";

export class TIM {
  static FileID = 0x00000010;

  static FourBitMultiplier = 4;
  static EightBitMultiplier = 2;
  static TwentyFourBitMultiplier = 2/3;

  header: TimHeaderData;
  clutHeader: SectionHeaderData;
  clutPixels: PSXColor[];
  pixelDataHeader: SectionHeaderData;
  pixelData: Uint16Array;

  private _byteLength: number;

  constructor(arrayBuffer: ArrayBuffer, startOffset = 0) {
    this.header = timHeaderStruct.createObject<TimHeaderData>(arrayBuffer, startOffset, true);

    let pixelDataStart = this.header.nextOffset;

    if (this.hasCLUT) {
      this.clutHeader = sectionHeaderStruct.createObject<SectionHeaderData>(arrayBuffer, this.header.nextOffset, true);

      pixelDataStart = this.clutHeader.nextOffset + this.clutHeader.dataWidth * this.clutHeader.dataHeight * 2;
      
      this.clutPixels = [];
      const dataView = new DataView(arrayBuffer);
      for (let i = this.clutHeader.nextOffset; i < pixelDataStart; i += 2) {
        const clutPixel = PSXColor.FromSixteenBitValue(dataView.getUint16(i, true));
        this.clutPixels.push(clutPixel);
      }
    }

    this.pixelDataHeader = sectionHeaderStruct.createObject<SectionHeaderData>(arrayBuffer, pixelDataStart, true);
    const pixelDataSizeInBytes = this.pixelDataHeader.dataWidth * this.pixelDataHeader.dataHeight * 2;
    const pixelDataEnd = this.pixelDataHeader.nextOffset + pixelDataSizeInBytes;
    this.pixelData = new Uint16Array(arrayBuffer.slice(this.pixelDataHeader.nextOffset, pixelDataEnd));
    this._byteLength = pixelDataEnd - startOffset;
  }

  get pixelMode(): TIMPixelMode {
    return this.header.flag & 0b111;
  }

  get hasCLUT(): boolean {
    return (this.header.flag & 0b1000) >> 3 === 1;
  }

  get byteLength(): number {
    return this._byteLength;
  }

  createImageData(): ImageData {
    if (this.hasCLUT && this.clutHeader.dataWidth === 16) {
      return this.create4BitImageData();
    }

    else if (this.hasCLUT && this.clutHeader.dataWidth === 256) {
      return this.create8BitImageData();
    }

    else if (!this.hasCLUT && this.pixelMode === TIMPixelMode.FIFTEEN_BIT_CLUT) {
      return this.create16BitImageData();
    }

    else if (!this.hasCLUT && this.pixelMode === TIMPixelMode.TWENTY_FOUR_BIT_CLUT) {
      return this.create24BitImageData();
    }

    else {
      console.error(`Error, couldn't open file with pixel mode: ${this.pixelMode}`);
    }
  }


  private create4BitImageData(): ImageData {
    const imageData = new ImageData(this.pixelDataHeader.dataWidth * TIM.FourBitMultiplier, this.pixelDataHeader.dataHeight);
    this.pixelData.forEach((pixelData, index) => {
      const imageDataIndex = index * 16;
      const firstColorIndex = pixelData & 0b1111;
      const secondColorIndex = pixelData >> 4 & 0b1111;
      const thirdColorIndex = pixelData >> 8 & 0b1111;
      const fourthColorIndex = pixelData >> 12 & 0b1111;

      this.setImageDataPixel(imageData, imageDataIndex, this.clutPixels[firstColorIndex]);
      this.setImageDataPixel(imageData, imageDataIndex + 4, this.clutPixels[secondColorIndex]);
      this.setImageDataPixel(imageData, imageDataIndex + 8, this.clutPixels[thirdColorIndex]);
      this.setImageDataPixel(imageData, imageDataIndex + 12, this.clutPixels[fourthColorIndex]);
    });

    return imageData;
  }

  private create8BitImageData(): ImageData {
    const imageData = new ImageData(this.pixelDataHeader.dataWidth * TIM.EightBitMultiplier, this.pixelDataHeader.dataHeight);
    this.pixelData.forEach((pixelData, index) => {
      const imageDataIndex = index * 8;
      const firstColorIndex = pixelData & 0b11111111;
      const secondColorIndex = pixelData >> 8;

      this.setImageDataPixel(imageData, imageDataIndex, this.clutPixels[firstColorIndex]);
      this.setImageDataPixel(imageData, imageDataIndex + 4, this.clutPixels[secondColorIndex]);
    });

    return imageData;
  }

  private create16BitImageData(): ImageData {
    const imageData = new ImageData(this.pixelDataHeader.dataWidth, this.pixelDataHeader.dataHeight);
    this.pixelData.forEach((pixelData, index) => {
      const imageDataIndex = index * 4;
      const color = PSXColor.FromSixteenBitValue(pixelData);
      this.setImageDataPixel(imageData, imageDataIndex, color);
    });

    return imageData;
  }

  private create24BitImageData(): ImageData {
    const imageData = new ImageData(this.pixelDataHeader.dataWidth * TIM.TwentyFourBitMultiplier, this.pixelDataHeader.dataHeight);
    let imageDataIndex = 0;
    for (let i = 0; i < this.pixelData.length; i += 3) {
      const firstRedGreen = this.pixelData[i];
      const firstBlueSecondRed = this.pixelData[i + 1];
      const secondGreenBlue = this.pixelData[i + 2];

      const firstBlue = firstBlueSecondRed & 0b11111111;
      const secondRed = firstBlueSecondRed >> 8;

      const firstPixel = PSXColor.FromTwentyFourBitValue(firstRedGreen + (firstBlue << 16));
      const secondPixel = PSXColor.FromTwentyFourBitValue(secondRed + (secondGreenBlue << 8));
      this.setImageDataPixel(imageData, imageDataIndex, firstPixel);
      this.setImageDataPixel(imageData, imageDataIndex, secondPixel);
      imageDataIndex+= 2;
    }

    return imageData;
  }

  private setImageDataPixel(imageData: ImageData, imageDataIndex: number, color: PSXColor) {
    imageData.data[imageDataIndex] = color.red;
    imageData.data[imageDataIndex + 1] = color.green;
    imageData.data[imageDataIndex + 2] = color.blue;
    imageData.data[imageDataIndex + 3] = color.alpha;
  }
}