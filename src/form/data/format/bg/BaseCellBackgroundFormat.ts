import type { ICellBackgroundFormat } from './ICellBackgroundFormat';
import { type Canvas, Rect, Paint, Style } from '../../../utils/temp';
import { TableConfig } from '../../../core/TableConfig';

/**
 * 通用绘制Rect格子背景绘制
 */
export abstract class BaseCellBackgroundFormat<T> implements ICellBackgroundFormat<T> {
  public drawBackground(canvas: Canvas, rect: Rect, t: T, paint: Paint): void {
    const color = this.getBackGroundColor(t);
    if (color != TableConfig.INVALID_COLOR) {
      paint.setColor(color);
      paint.setStyle(Style.FILL);
      canvas.drawRect(rect, paint);
    }
  }

  /**
   * 获取背景颜色
   */
  public abstract getBackGroundColor(t: T): string;

  /**
   * 默认字体颜色不跟随背景变化，
   * 当有需要多种字体颜色，请重写该方法
   * @param t
   * @return
   */
  public getTextColor(t: T): string {
    return TableConfig.INVALID_COLOR;
  }
}
