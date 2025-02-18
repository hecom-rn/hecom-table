import { type Canvas, Rect, Paint } from '../../../utils/temp';

/**
 * 绘制格子背景格式化
 */
export interface ICellBackgroundFormat<T> {
  /**
   * 绘制背景
   */
  drawBackground(canvas: Canvas, rect: Rect, t: T, paint: Paint): void;

  /**
   *当背景颜色改变字体也需要跟随变化
   */
  getTextColor(t: T): string;
}
