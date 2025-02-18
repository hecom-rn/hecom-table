import { type Canvas, Paint, Rect } from '../../../utils/temp';
import { CellInfo } from '../../CellInfo';
import type { IGridFormat } from './IGridFormat';
import { Column } from '../../column/Column';

/**
 * 简单的绘制边界
 */
export class SimpleGridFormat implements IGridFormat {
  drawContentGrid(canvas: Canvas, col: number, row: number, rect: Rect, cellInfo: CellInfo, paint: Paint): void {
    canvas.drawRect(rect, paint);
  }

  drawXSequenceGrid(canvas: Canvas, col: number, rect: Rect, paint: Paint): void {
    canvas.drawRect(rect, paint);
  }

  drawYSequenceGrid(canvas: Canvas, row: number, rect: Rect, paint: Paint): void {
    canvas.drawRect(rect, paint);
  }

  drawCountGrid(canvas: Canvas, col: number, rect: Rect, column: Column, paint: Paint): void {
    canvas.drawRect(rect, paint);
  }

  drawColumnTitleGrid(canvas: Canvas, rect: Rect, column: Column, col: number, paint: Paint): void {
    canvas.drawRect(rect, paint);
  }

  drawTableBorderGrid(canvas: Canvas, left: number, top: number, right: number, bottom: number, paint: Paint): void {
    canvas.drawRect(left, top, right, bottom, paint);
  }

  drawLeftAndTopGrid(canvas: Canvas, rect: Rect, paint: Paint): void {
    canvas.drawRect(rect, paint);
  }
}
