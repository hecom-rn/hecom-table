import type { TableConfig } from '../../../core/TableConfig';
import type { Canvas, Rect } from '../../../utils/temp';

/**
 */
export interface IDrawOver {
  draw(canvas: Canvas, scaleRect: Rect, showRect: Rect, config: TableConfig): void;
}
