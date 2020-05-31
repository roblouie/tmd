import { TIM } from "./tim";

// TIM assets are often packed together in one file, either in one .tim file with multiple tims inside,
// or in larger packaged data. This class will pull multiple tims out of those files.
export class TIMLoader {
  private readonly MinimumTIMSize = 16;

  getTIMsFromTIMFile(arrayBuffer: ArrayBuffer): TIM[] {
    const tims: TIM[] = [];

    const firstTIM = new TIM(arrayBuffer);
    let nextOffset = firstTIM.byteLength;
    tims.push(firstTIM);

    while (nextOffset < arrayBuffer.byteLength - this.MinimumTIMSize) {
      const tim = new TIM(arrayBuffer, nextOffset);
      tims.push(tim);
      nextOffset += tim.byteLength;
    }
    return tims;
  }

  scanForTIMs(arrayBuffer: ArrayBuffer): TIM[] {
    const tims: TIM[] = [];
    const maxFlagValue = 0b1111;
    
    const dataView = new DataView(arrayBuffer);
    let offset = 0;

    while (offset < arrayBuffer.byteLength - this.MinimumTIMSize) {
      const hasTIMHeader = TIM.FileID === dataView.getUint32(offset, true);
      const hasValidFlag = dataView.getUint32(offset + 4, true) <= maxFlagValue;

      if (hasTIMHeader && hasValidFlag) {
        try {
          const tim = new TIM(arrayBuffer, offset);

          // As long as we found some actual pixels but not too many, add to TIM array. Helps eliminate false positives.
          if (tim.pixelData.byteLength > 0 && tim.pixelDataHeader.dataHeight <= 256 && tim.texturePage < 32 && Number.isInteger(tim.texturePage)) {
            tims.push(tim);
          }

          offset += tim.byteLength;
        } catch(error) {
          offset++;
        }

      } else {
        offset++;
      }
    }

    return tims;
  }

}

export const timLoader = new TIMLoader();