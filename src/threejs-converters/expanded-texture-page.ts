import { TIM } from '../tim/tim';
import { VRAM } from '../vram/vram';
import { TIMPixelMode } from '../tim/tim-pixel-modes.enum';

export class ExpandedTexturePage {
  private _texturePage: number;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private _imageDataURL: string = '';

  constructor(texturePageNumber: number) {
    this._texturePage = texturePageNumber;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 256;
    this.canvas.height = 256;

    this.context = this.canvas.getContext('2d')!;
    this.clear();
  }

  drawTo(tim: TIM): void;
  drawTo(tims: TIM[]): void;
  drawTo(value: TIM | TIM[]) {
    if (Array.isArray(value)) {
      value.forEach(tim => this.drawTIM(tim));
    } else {
      this.drawTIM(value);
    }

    this._imageDataURL = this.canvas.toDataURL();
  }

  clear() {
    this.context.rect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = 'white';
    this.context.fill();
    this._imageDataURL = this.canvas.toDataURL();
  }

  get texturePage(): number {
    return this._texturePage;
  }

  get canvasElement(): HTMLCanvasElement {
    return this.canvas;
  }

  get canvasContext(): CanvasRenderingContext2D {
    return this.context;
  }

  get imageDataURL(): string {
    return this._imageDataURL;
  }

  // TODO: Also draw to the next one(s) based on bit depth. Can be done by simply shifting the image over by half the width
  // on the put image data call. IE for RE1, place texture in page 0, then also place it in page 1, but at position X -128
  private drawTIM(tim: TIM) {
    const tpagePosition = VRAM.VRAMCoordinatesFromTexturePage(this.texturePage);
    let xPos = tim.pixelDataHeader.vramX - tpagePosition.x;
    if (tim.pixelMode === TIMPixelMode.FOUR_BIT_CLUT) {
      xPos *= 4;
    }

    if (tim.pixelMode === TIMPixelMode.EIGHT_BIT_CLUT) {
      xPos *= 2;
    }
    
    this.context.putImageData(tim.createImageData()!, xPos, tim.pixelDataHeader.vramY - tpagePosition.y);
  }

}