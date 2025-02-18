import type { IDrawFormat } from './IDrawFormat';
import { Rect, type Canvas, type Bitmap, Paint, Color, Style } from '../../../utils/temp';
import type { TableConfig } from '../../../core/TableConfig';
import type { CellInfo } from '../../CellInfo';
import { Column } from '../../column/Column';

/**
 * Bitmap绘制格式化
 */
export abstract class BitmapDrawFormat<T> implements IDrawFormat<T> {
  private imageWidth: number;
  private imageHeight: number;
  private readonly imgRect: Rect;
  private readonly drawRect: Rect;

  constructor(imageWidth: number, imageHeight: number) {
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.imgRect = new Rect();
    this.drawRect = new Rect();
  }

  measureHeight(column: Column<T>, position: number, config: TableConfig): number {
    return this.imageHeight;
  }

  measureWidth(column: Column<T>, position: number, config: TableConfig): number {
    return this.imageWidth;
  }

  /**
   * 获取bitmap
   * @param t 数据
   * @param value 值
   * @param position 位置
   * @return Bitmap 占位图
   */
  protected abstract getBitmap(t: T, value: string, position: number): Bitmap;

  draw(c: Canvas, rect: Rect, cellInfo: CellInfo<T>, config: TableConfig): void {
    const paint: Paint = config.getPaint();
    const bitmap: Bitmap =
      cellInfo == null ? this.getBitmap(null, null, 0) : this.getBitmap(cellInfo.data, cellInfo.value, cellInfo.row);
    if (bitmap != null) {
      paint.setColor(Color.BLACK);
      paint.setStyle(Style.FILL);
      let width = bitmap.getWidth();
      let height = bitmap.getHeight();
      this.imgRect.set(0, 0, width, height);
      const scaleX = width / this.imageWidth;
      const scaleY = height / this.imageHeight;
      if (scaleX > 1 || scaleY > 1) {
        if (scaleX > scaleY) {
          width = width / scaleX;
          height = this.imageHeight;
        } else {
          height = height / scaleY;
          width = this.imageWidth;
        }
      }
      width = width * config.getZoom();
      height = height * config.getZoom();
      const disX = (rect.right - rect.left - width) / 2;
      const disY = (rect.bottom - rect.top - height) / 2;
      this.drawRect.left = rect.left + disX;
      this.drawRect.top = rect.top + disY;
      this.drawRect.right = rect.right - disX;
      this.drawRect.bottom = rect.bottom - disY;
      c.drawBitmap(bitmap, this.imgRect, this.drawRect, paint);
    }
  }

  public getImageWidth(): number {
    return this.imageWidth;
  }

  public setImageWidth(imageWidth: number): void {
    this.imageWidth = imageWidth;
  }

  public getImageHeight(): number {
    return this.imageHeight;
  }

  public setImageHeight(imageHeight: number): void {
    this.imageHeight = imageHeight;
  }
}
