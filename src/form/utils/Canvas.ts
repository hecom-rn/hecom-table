/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Bitmap, Paint, Path, Rect } from './temp';
import type { ZRenderType } from 'zrender/lib/zrender';

export interface Canvas {
  drawTextOnPath(text: string, path: Path, hOffset: number, vOffset: number, paint: Paint): void;

  save(): void;

  clipRect(rect: Rect): void;

  clipRect(left: number, top: number, right: number, bottom: number): void;

  restore(): void;

  drawRect(left: number, top: number, right: number, bottom: number, paint: Paint): void;

  drawRect(rect: Rect, paint: Paint): void;

  drawBitmap(bitmap: Bitmap, imgRect: Rect, drawRect: Rect, paint: Paint): void;

  drawText(string: string, textCenterX: number, textCenterY: number, paint: Paint): void;

  getSaveCount(): number;

  translate(width: number, number: number): void;

  restoreToCount(saveCount: number): void;

  drawPath(path: Path, paint: Paint): void;
}

export class CanvasImpl implements Canvas {
  zrender: ZRenderType;

  constructor(zrender: ZRenderType) {
    this.zrender = zrender;
  }

  drawPath(path: Path, paint: Paint): void {
    throw new Error('Method not implemented.');
  }

  drawTextOnPath(text: string, path: Path, hOffset: number, vOffset: number, paint: Paint): void {
    throw new Error('Method not implemented.');
  }

  restoreToCount(saveCount: number): void {
    throw new Error('Method not implemented.');
  }

  save(): void {
    throw new Error('Method not implemented.');
  }

  clipRect(rect: Rect): void;
  clipRect(left: number, top: number, right: number, bottom: number): void;
  clipRect(leftOrRect: number | Rect, top?: number, right?: number, bottom?: number): void {
    throw new Error('Method not implemented.');
  }

  restore(): void {
    throw new Error('Method not implemented.');
  }

  drawRect(left: number, top: number, right: number, bottom: number, paint: Paint): void;
  drawRect(rect: Rect, paint: Paint): void;
  drawRect(left: unknown, top: unknown, right?: unknown, bottom?: unknown, paint?: unknown): void {
    throw new Error('Method not implemented.');
  }

  drawBitmap(bitmap: Bitmap, imgRect: Rect, drawRect: Rect, paint: Paint): void {
    throw new Error('Method not implemented.');
  }

  drawText(string: string, textCenterX: number, textCenterY: number, paint: Paint): void {
    throw new Error('Method not implemented.');
  }

  getSaveCount(): number {
    throw new Error('Method not implemented.');
  }

  translate(width: number, number: number): void {
    throw new Error('Method not implemented.');
  }
}
