import type { TableConfig } from '../../../core/TableConfig';
import type { Canvas, Rect } from '../../../utils/temp';
import type { IFormat } from '../IFormat';

/**
 *
 *序号格式化
 */
export interface ISequenceFormat extends IFormat<number> {
  draw(canvas: Canvas, sequence: number, rect: Rect, config: TableConfig): void;
}
