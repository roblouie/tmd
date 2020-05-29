import { TIM } from "./tim";

// TIM assets are often packed together in one file, either in one .tim file with multiple tims inside,
// or in larger packaged data. This class will pull multiple tims out of those files.
export class TIMLoader {

  getTIMsFromTIMFile(arrayBuffer: ArrayBuffer): TIM[] {
    const tims: TIM[] = [];

    const firstTIM = new TIM(arrayBuffer);
    let nextOffset = firstTIM.byteLength;
    tims.push(firstTIM);

    while (nextOffset < arrayBuffer.byteLength) {
      const tim = new TIM(arrayBuffer, nextOffset);
      tims.push(tim);
      nextOffset += tim.byteLength;
    }
    return tims;
  }

}

export const timLoader = new TIMLoader();