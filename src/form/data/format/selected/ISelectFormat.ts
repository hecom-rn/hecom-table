import type { TableConfig } from '../../../core/TableConfig';
import type { Canvas, Rect } from '../../../utils/temp';

/**
 * 选中操作格式化
 */
export interface ISelectFormat {
    draw(canvas: Canvas, rect: Rect, showRect: Rect, config: TableConfig): void;
}
