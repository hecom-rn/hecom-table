import { TableConfig } from '../core/TableConfig';
import { Rect, type Canvas } from '../utils/temp';

export enum Direction {
  LEFT,
  TOP,
  RIGHT,
  BOTTOM,
}

/** 图表组件
 * Created by huang on 2017/10/26.
 */

export interface IComponent<T> {
  /**
   * 计算组件Rect
   */
  onMeasure(scaleRect: Rect, showRect: Rect, config: TableConfig): void;

  /**
   * 绘制组件
   * @param showRect
   * @param  t 数据
   * @param config
   */
  onDraw(canvas: Canvas, showRect: Rect, t: T, config: TableConfig): void;
}
