// TODO: Refactor to just be color or playstation color, and have static fromFifteenBit, from 24bit.
export class FifteenBitColor {
  rawColorWord: number;
  red: number;
  green: number;
  blue: number;
  alpha: number;

  constructor(sixteenBitColorValue: number) {
    this.rawColorWord = sixteenBitColorValue;
    const red = sixteenBitColorValue & 0b11111;
    const green = (sixteenBitColorValue & 0b1111100000) >> 5;
    const blue = (sixteenBitColorValue & 0b111110000000000) >> 10;
    const alphaFlag = (sixteenBitColorValue & 0b1000000000000000) >> 15;

    this.red = Math.round(red * 8.225);
    this.green = Math.round(green * 8.225);
    this.blue = Math.round(blue * 8.225);

    // TODO: Right now just does 100% alpha or 0. PSX supports semi transparency too, which should be revisited.
    if (alphaFlag === 0 && red === 0 && green === 0 && blue === 0) {
      this.alpha = 0;
    } else {
      this.alpha = 255;
    }
  }
}