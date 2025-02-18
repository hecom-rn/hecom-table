import { Rect } from '../utils/Rect';
import type { ISelectFormat } from '../data/format/selected/ISelectFormat';
import { TableConfig } from '../core/TableConfig';
import type { OnInterceptListener } from '../matrix/MatrixHelper';
import type { Canvas } from '../utils/temp';

export class SelectionOperation implements OnInterceptListener {
  private static readonly INVALID = -1; // Invalid coordinate
  private selectionRect: Rect;
  private selectFormat: ISelectFormat | null = null;
  private selectRow: number = SelectionOperation.INVALID;
  private selectColumn: number = SelectionOperation.INVALID;
  private isShow: boolean = false;

  constructor() {
    this.selectionRect = new Rect(0, 0, 0, 0);
  }

  reset(): void {
    this.isShow = false;
  }

  setSelectionRect(selectColumn: number, selectRow: number, rect: Rect): void {
    this.selectRow = selectRow;
    this.selectColumn = selectColumn;
    this.selectionRect.set(rect);
    this.isShow = true;
  }

  isSelectedPoint(selectColumn: number, selectRow: number): boolean {
    return selectRow === this.selectRow && selectColumn === this.selectColumn;
  }

  checkSelectedPoint(selectColumn: number, selectRow: number, rect: Rect): void {
    if (this.isSelectedPoint(selectColumn, selectRow)) {
      this.selectionRect.set(rect);
      this.isShow = true;
    }
  }

  draw(canvas: Canvas, showRect: Rect, config: TableConfig): void {
    if (this.selectFormat && this.isShow) {
      this.selectFormat.draw(canvas, this.selectionRect, showRect, config);
    }
  }

  getSelectFormat(): ISelectFormat | null {
    return this.selectFormat;
  }

  setSelectFormat(selectFormat: ISelectFormat): void {
    this.selectFormat = selectFormat;
  }

  isIntercept(e1: MouseEvent, distanceX: number, distanceY: number): boolean {
    return false;
  }
}
