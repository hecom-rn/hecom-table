import { type Canvas, Rect, Paint } from '../../../utils/temp';

export interface IBackgroundFormat {
  /**
   * 绘制背景
   */
  drawBackground(canvas: Canvas, rect: Rect, paint: Paint): void;
}
