import { ExpandedTexturePage } from './expanded-texture-page';
import { TIM } from '../tim/tim';
import { PSXColor } from '../core/psx-color';

export class ExpandedVRAM {
  texturePages: ExpandedTexturePage[];

  constructor() {
    this.texturePages = [];

    for (let i = 0; i < 32; i++) {
      this.texturePages.push(new ExpandedTexturePage(i));
    }
  }

  writeTo(pageNumber: number, tim: TIM) {
    this.texturePages[pageNumber].drawTo(tim);

    if (tim.bitsPerPixel === 8 && pageNumber < 32) {
      this.texturePages[pageNumber + 1].drawTo(tim);
    }
  }

  clearPage(pageNumber: number) {
    this.texturePages[pageNumber].clear()
  }
}