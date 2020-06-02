import { TMD } from "../tmd/tmd";

class TMDLoader {
  readonly MinimumFMDSize = 40;

  scanForTMDs(arrayBuffer: ArrayBuffer): TMD[] {
    const tmds: TMD[] = [];

    const dataView = new DataView(arrayBuffer);
    let offset = 0;

    while (offset < arrayBuffer.byteLength - this.MinimumFMDSize) {
      const foundTMD = this.checkForTMD(dataView, offset);

      if (foundTMD) {
        tmds.push(foundTMD);
        offset += foundTMD.byteLength;
      } else {
        offset++;
      }
    }

    return tmds;
  }

  checkForTMD(dataView: DataView, offset: number) {
    const hasID = TMD.FileID === dataView.getUint32(offset, true);
    const hasValidFlag = dataView.getUint32(offset + 4, true) <= 1;
    const hasValidNumberOfObjects = dataView.getUint32(offset + 8, true) <= 5000;

    if (hasID && hasValidFlag && hasValidNumberOfObjects) {
      try {
        const tmd = new TMD(dataView.buffer, offset);

        if (tmd.objects.length > 0) {
          return tmd;
        }

      } catch (error) {
        // If error parsing, probably not a valid TMD
      }

    }
  }
}

export const tmdLoader = new TMDLoader();