export class ThreeJSConverter {
  
  static CombineRGBBytes(red, green, blue) {
    return red << 16 | green << 8 | blue;
  }
}