import { SectionHeaderData, sectionHeaderStruct } from "./structs/section-header.struct";
import { timHeaderStruct, TimHeaderData } from "./structs/header.struct";
import { TIMPixelMode } from "./tim-pixel-modes.enum";
import { FifteenBitColor } from "../core/FifteenBitColor";

export class TIM {
  header: TimHeaderData;
  clutHeader: SectionHeaderData;
  clutPixels: FifteenBitColor[];
  pixelDataHeader: SectionHeaderData;
  pixelData: Uint16Array;

  constructor(arrayBuffer: ArrayBuffer) {
    this.header = timHeaderStruct.createObject<TimHeaderData>(arrayBuffer, 0, true);

    let pixelDataStart = this.header.nextOffset;

    if (this.hasCLUT) {
      this.clutHeader = sectionHeaderStruct.createObject<SectionHeaderData>(arrayBuffer, this.header.nextOffset, true);

      pixelDataStart = this.clutHeader.nextOffset + this.clutHeader.dataWidth * this.clutHeader.dataHeight * 2;
      
      this.clutPixels = [];
      const dataView = new DataView(arrayBuffer);
      for (let i = this.clutHeader.nextOffset; i < pixelDataStart; i += 2) {
        const clutPixel = new FifteenBitColor(dataView.getUint16(i, true));
        this.clutPixels.push(clutPixel);
      }
    }

    this.pixelDataHeader = sectionHeaderStruct.createObject<SectionHeaderData>(arrayBuffer, pixelDataStart, true);
    const pixelDataSizeInBytes = this.pixelDataHeader.dataWidth * this.pixelDataHeader.dataHeight * 2;
    const pixelDataEnd = this.pixelDataHeader.nextOffset + pixelDataSizeInBytes;
    this.pixelData = new Uint16Array(arrayBuffer.slice(this.pixelDataHeader.nextOffset, pixelDataEnd));
  }

  get pixelMode(): TIMPixelMode {
    return this.header.flag & 0b111;
  }

  get hasCLUT(): boolean {
    return (this.header.flag & 0b1000) >> 3 === 1;
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


  create4BitImageData(): ImageData {
    throw new Error("Method not implemented.");
  }

  create8BitImageData(): ImageData {
    const imageData = new ImageData(this.pixelDataHeader.dataWidth * 2, this.pixelDataHeader.dataHeight);
    this.pixelData.forEach((pixelData, index) => {
      const imageDataIndex = index * 8;
      const firstColorIndex = pixelData & 0b11111111;
      const secondColorIndex = pixelData >> 8;

      imageData.data[imageDataIndex] = this.clutPixels[firstColorIndex].red;
      imageData.data[imageDataIndex + 1] = this.clutPixels[firstColorIndex].green;
      imageData.data[imageDataIndex + 2] = this.clutPixels[firstColorIndex].blue;
      imageData.data[imageDataIndex + 3] = this.clutPixels[firstColorIndex].alpha;

      imageData.data[imageDataIndex + 4] = this.clutPixels[secondColorIndex].red;
      imageData.data[imageDataIndex + 5] = this.clutPixels[secondColorIndex].green;
      imageData.data[imageDataIndex + 6] = this.clutPixels[secondColorIndex].blue;
      imageData.data[imageDataIndex + 7] = this.clutPixels[secondColorIndex].alpha;
    });

    return imageData;
  }

  create16BitImageData(): ImageData {
    const imageData = new ImageData(this.pixelDataHeader.dataWidth, this.pixelDataHeader.dataHeight);
    this.pixelData.forEach((pixelData, index) => {
      const imageDataIndex = index * 4;
      const color = new FifteenBitColor(pixelData);
      imageData.data[imageDataIndex] = color.red;
      imageData.data[imageDataIndex + 1] = color.green;
      imageData.data[imageDataIndex + 2] = color.blue;
      imageData.data[imageDataIndex + 3] = color.alpha;
    });

    return imageData;
  }

  create24BitImageData(): ImageData {
    throw new Error("Method not implemented.");
  }
}