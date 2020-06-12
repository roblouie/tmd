// TODO: Refactor to just be color or playstation color, and have static fromFifteenBit, from 24bit.
export class PSXColor {
  rawColorValue: number;
  red: number;
  green: number;
  blue: number;
  alpha: number;
  type: '15-bit' | '24-bit';

  static FromSixteenBitValue(sixteenBitColorValue: number): PSXColor {
    const color = new PSXColor();
    color.rawColorValue = sixteenBitColorValue;
    color.type = '15-bit';

    const red = sixteenBitColorValue & 0b11111;
    const green = (sixteenBitColorValue & 0b1111100000) >> 5;
    const blue = (sixteenBitColorValue & 0b111110000000000) >> 10;
    const alphaFlag = (sixteenBitColorValue & 0b1000000000000000) >> 15;

    color.red = Math.round(red * 8.225);
    color.green = Math.round(green * 8.225);
    color.blue = Math.round(blue * 8.225);

    // TODO: Right now just does 100% alpha or 0. PSX supports semi transparency too, which should be revisited.
    if (alphaFlag === 0 && red === 0 && green === 0 && blue === 0) {
      color.alpha = 0;
    } else {
      color.alpha = 255;
    }

    return color;
  }

  static FromTwentyFourBitValue(twentyFourBitValue: number): PSXColor {
    const color = new PSXColor();
    color.rawColorValue = twentyFourBitValue;
    color.type = '24-bit';

    const singleColorBitmask = 0b11111111;
    color.red = twentyFourBitValue & singleColorBitmask;
    color.green = twentyFourBitValue >> 8 & singleColorBitmask;
    color.blue = twentyFourBitValue >> 16 & singleColorBitmask;
    color.alpha = 255;

    return color;
  }

  static IsValueTransparent(sixteenBitColorValue: number) {
    const red = sixteenBitColorValue & 0b11111;
    const green = (sixteenBitColorValue & 0b1111100000) >> 5;
    const blue = (sixteenBitColorValue & 0b111110000000000) >> 10;
    const alphaFlag = (sixteenBitColorValue & 0b1000000000000000) >> 15;

    // TODO: Right now just does 100% alpha or 0. PSX supports semi transparency too, which should be revisited.
    return alphaFlag === 0 && red === 0 && green === 0 && blue === 0;
  }
}