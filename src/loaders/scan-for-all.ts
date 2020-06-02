import { TMD } from "../tmd/tmd";
import { TIM } from "../tim/tim";
import { tmdLoader } from "./tmd-loader";
import { timLoader } from "./tim-loader";

export interface ScanForAllResults {
  tmds: TMD[],
  tims: TIM[]
}

export class ScanForAll {

  static Scan(arrayBuffer: ArrayBuffer): ScanForAllResults {
    const results: ScanForAllResults = {
      tmds: [],
      tims: []
    }

    const dataView = new DataView(arrayBuffer);
    const minimumScanabbleFileSize = 16;
    let offset = 0;

    while (offset < arrayBuffer.byteLength - minimumScanabbleFileSize) {
      // TMD
      const foundTMD = tmdLoader.checkForTMD(dataView, offset);
      if (foundTMD) {
        results.tmds.push(foundTMD);
        offset += foundTMD.byteLength;
      }

      // TIM
      const foundTIM = timLoader.checkForTIM(dataView, offset);
      if (foundTIM) {
        results.tims.push(foundTIM);
        offset += foundTIM.byteLength;
      }

      // Nothing Found
      if (!foundTIM && !foundTMD) {
        offset++;
      }
    }

    return results;
  }

}