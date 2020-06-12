import { TIM } from "../tim/tim";
import { TIMPixelMode } from '../tim/tim-pixel-modes.enum';

// TIM assets are often packed together in one file, either in one .tim file with multiple tims inside,
// or in larger packaged data. This class will pull multiple tims out of those files.
export class TIMLoader {
  private readonly MinimumTIMSize = 16;
  private readonly MaxFlagValue = 0b1111;

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
    
    const dataView = new DataView(arrayBuffer);
    let offset = 0;

    while (offset < arrayBuffer.byteLength - this.MinimumTIMSize) {
      const foundTIM = this.checkForTIM(dataView, offset);

      if (foundTIM) {
        tims.push(foundTIM);
        offset += foundTIM.byteLength;
      } else {
        offset++;
      }
    }

    return tims;
  }

  checkForTIM(dataView: DataView, offset: number): TIM | undefined {
    const hasID = TIM.FileID === dataView.getUint32(offset, true);

    if (hasID) {
      try {
        const tim = new TIM(dataView.buffer, offset);

        const hasValidPixels = tim.pixelData.byteLength > 0 && tim.pixelDataHeader.dataHeight <= 512;
        const hasValidTexturePage = hasValidPixels && tim.texturePage < 32;

        if (hasValidPixels && hasValidTexturePage) {
          return tim;
        }
      } catch (error) {
        //console.error(error);
        // Errors parsing means this probably isn't a valid TIM
      }
    }
  }
}

export const timLoader = new TIMLoader();