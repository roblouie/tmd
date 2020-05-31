import { PMDHeaderData, pmdHeaderStruct } from "./data-definitions/header.def";

// Unfinished, need to find examples of files as documentation is lacking
class PMD {
  header: PMDHeaderData;

  constructor(arrayBuffer: ArrayBuffer, startOffset = 0) {
    this.header = pmdHeaderStruct.createObject<PMDHeaderData>(arrayBuffer, startOffset, true);
  }
}