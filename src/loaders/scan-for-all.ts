import { TMD } from "../tmd/tmd";
import { TIM } from "../tim/tim";
import { tmdLoader } from "./tmd-loader";
import { timLoader } from "./tim-loader";

export interface ScanForAllResults {
  tmds: TMD[],
  tims: TIM[]
}

export class ScanForAll {

  static Scan(arrayBuffer: ArrayBuffer, progressCallback?: Function): ScanForAllResults {
    const results: ScanForAllResults = {
      tmds: [],
      tims: []
    }

    const dataView = new DataView(arrayBuffer);
    const minimumScanabbleFileSize = 16;
    let offset = 0;
    let lastProgressReportOffset = 0;
    const progressReportInterval = 1000;
    while (offset < arrayBuffer.byteLength - minimumScanabbleFileSize) {
      // TMD
      const foundTMD = tmdLoader.checkForTMD(dataView, offset);
      if (foundTMD) {
        results.tmds.push(foundTMD);
        offset += foundTMD.byteLength;
      }

      // TIM
      let foundTIM;
      if (offset < arrayBuffer.byteLength - minimumScanabbleFileSize) {
        foundTIM = timLoader.checkForTIM(dataView, offset);
        if (foundTIM) {
          results.tims.push(foundTIM);
          offset += foundTIM.byteLength;
        }
      }


      // Nothing Found
      if (!foundTIM && !foundTMD) {
        offset++;
      }

      if (progressCallback !== undefined && offset - lastProgressReportOffset > progressReportInterval) {
        progressCallback({
          percentComplete: (offset / arrayBuffer.byteLength) * 100,
          timsFound: results.tims.length,
          tmdsFound: results.tmds.length
        })
      }
    }

    return results;
  }

  static ScanBetter(arrayBuffer: ArrayBuffer, finishedCallback: Function, progressCallback?: Function) {
    const results: ScanForAllResults = {
      tmds: [],
      tims: []
    }

    const dataView = new DataView(arrayBuffer);
    const minimumScanabbleFileSize = 16;
    const chunkSize = 100000;
    let offset = 0;

    const processChunk = () => {
      let count = chunkSize;

      while (count >= 0 && offset < arrayBuffer.byteLength - minimumScanabbleFileSize) {
        // TMD
        const foundTMD = tmdLoader.checkForTMD(dataView, offset);
        if (foundTMD) {
          results.tmds.push(foundTMD);
          offset += foundTMD.byteLength;
          count -= foundTMD.byteLength;
        }

        // TIM
        let foundTIM;
        if (offset < arrayBuffer.byteLength - minimumScanabbleFileSize) {
          foundTIM = timLoader.checkForTIM(dataView, offset);
          if (foundTIM) {
            results.tims.push(foundTIM);
            offset += foundTIM.byteLength;
            count -+ foundTIM.byteLength;
          }
        }


        // Nothing Found
        if (!foundTIM && !foundTMD) {
          offset++;
          count--;
        }
      } // end while loop for current chunk

      if (offset < arrayBuffer.byteLength - minimumScanabbleFileSize) {
        setTimeout(processChunk, 0);
        if (progressCallback) {
          progressCallback({
            percentComplete: (offset / arrayBuffer.byteLength) * 100,
            timsFound: results.tims.length,
            tmdsFound: results.tmds.length
          })
        }
      } else { // Processing complete!
        finishedCallback(results);
        if (progressCallback) {
          progressCallback({
            percentComplete: 100,
            timsFound: results.tims.length,
            tmdsFound: results.tmds.length
          })
        }
      }
    }

    processChunk();

    return results;
  }
  

}