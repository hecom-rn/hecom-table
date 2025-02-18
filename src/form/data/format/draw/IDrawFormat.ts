import { TableConfig } from '../../../core/TableConfig';
import { type Canvas, Rect } from '../../../utils/temp';
import { CellInfo } from '../../CellInfo';
import { Column } from '../../column/Column';

/**
 * 绘制格式化
 */
export interface IDrawFormat<T> {
  /**
   *测量宽
   */
  measureWidth(column: Column<T>, position: number, config: TableConfig): number;

  /**
   *测量高
   */
  measureHeight(column: Column<T>, position: number, config: TableConfig): number;

  draw(c: Canvas, rect: Rect, cellInfo: CellInfo<T>, config: TableConfig): void;
}
