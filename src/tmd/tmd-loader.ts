import { TMD } from "./tmd";

class TMDLoader {
  readonly MinimumFMDSize = 40;

  scanForTMDs(arrayBuffer: ArrayBuffer): TMD[] {
    const tmds: TMD[] = [];

    const dataView = new DataView(arrayBuffer);
    let offset = 0;

    while (offset < arrayBuffer.byteLength - this.MinimumFMDSize) {
      const hasID = TMD.FileID === dataView.getUint32(offset, true);
      const hasValidFlag = dataView.getUint32(offset + 4, true) <= 1;
      const hasValidNumberOfObjects = dataView.getUint32(offset + 8, true) <= 5000;

      if (hasID && hasValidFlag && hasValidNumberOfObjects) {
        try {
          const tmd = new TMD(arrayBuffer, offset);

          if (tmd.objects.length > 0) {
            tmds.push(tmd);
            offset += tmd.byteLength;
          } else {
            offset++;
          }
        } catch (error) {
          offset++;
        }
        
      } else {
        offset++;
      }
    }

    return tmds;
  }
}

export const tmdLoader = new TMDLoader();