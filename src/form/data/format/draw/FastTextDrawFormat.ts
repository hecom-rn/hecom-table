import { TextDrawFormat } from './TextDrawFormat';
import type { Column } from '../../column/Column';
import type { TableConfig } from '../../../core/TableConfig';
import { DrawUtils } from '../../../utils/DrawUtils';
import type { Canvas, Rect, Paint } from '../../../utils/temp';

/**
 * 快速字体格式化
 * 当解析数目大，且字体大小和单行时，这个更快可以测量出来，节省加载时间
 */
export default class FastTextDrawFormat<T> extends TextDrawFormat<T> {
  private height: number;
  private width: number;
  private maxLengthValue: number;

  measureHeight(column: Column<T>, position: number, config: TableConfig): number {
    if (this.height == 0) {
      const paint = config.getPaint();
      config.getContentStyle().fillPaint(paint);
      this.height = DrawUtils.getTextHeight(paint);
    }
    return this.height;
  }

  measureWidth(column: Column<T>, position: number, config: TableConfig): number {
    const value: string = column.format(position);
    if (value.length > this.maxLengthValue) {
      this.maxLengthValue = value.length;
      const paint = config.getPaint();
      config.getContentStyle().fillPaint(paint);
      this.width = paint.measureText(value);
    }
    return this.width;
  }

  drawText(c: Canvas, value: string, rect: Rect, paint: Paint) {
    DrawUtils.drawSingleText(c, paint, rect, value);
  }
}
