import type { Cell } from './Cell';
import { ArrayColumn } from './column/ArrayColumn';
import { Column } from './column/Column';
import { ColumnNode } from './column/ColumnNode';
import type { Rect } from '../utils/temp';

export class TableInfo {
  private topHeight: number = 0;
  private titleHeight: number = 0;
  private tableTitleSize: number = 0;
  private yAxisWidth: number = 0;
  private countHeight: number = 0;
  private titleDirection: number = 0;
  /**
   * 表格实际区域
   * @private
   */
  private tableRect?: Rect;
  private maxLevel: number = 1;
  private columnSize: number = 0;
  private lineHeightArray: number[];
  private zoom: number = 1;
  private rangeCells: Cell[][];
  private lineSize: number = 0;
  private topNode: ColumnNode;
  private arrayLineSize?: number[];
  private isHasArrayColumn: boolean = false;

  public getMaxLevel(): number {
    return this.maxLevel;
  }

  public setMaxLevel(maxLevel: number): void {
    this.maxLevel = maxLevel;
  }

  public getColumnSize(): number {
    return this.columnSize;
  }

  public setColumnSize(columnSize: number): void {
    this.columnSize = columnSize;
    this.rangeCells = new Array(this.lineSize).fill(null).map(() => new Array(columnSize));
  }

  public getTopHeight(): number {
    return this.topHeight;
  }

  public getTopHeightWithZoom(zoom: number): number {
    return this.topHeight * zoom;
  }

  public setTopHeight(topHeight: number): void {
    this.topHeight = topHeight;
  }

  public getTitleHeight(): number {
    return this.titleHeight * this.zoom;
  }

  public setTitleHeight(titleHeight: number): void {
    this.titleHeight = titleHeight;
  }

  public getTableRect(): Rect {
    return this.tableRect;
  }

  public setTableRect(tableRect: Rect): void {
    this.tableRect = tableRect;
  }

  public getYAxisWidth(): number {
    return this.yAxisWidth;
  }

  public setYAxisWidth(yAxisWidth: number): void {
    this.yAxisWidth = yAxisWidth;
  }

  public setLineSize(lineSize: number): void {
    this.lineSize = lineSize;
    this.lineHeightArray = new Array(lineSize);
  }

  public addLine(count: number, isFoot: boolean): void {
    this.lineSize += count;
    const size = this.lineHeightArray.length;
    const tempArray = new Array(size + count);
    if (isFoot) {
      this.lineHeightArray.forEach((val, index) => (tempArray[index] = val));
    } else {
      this.lineHeightArray.forEach((val, index) => (tempArray[index + count] = val));
    }
    this.lineHeightArray = tempArray;
    if (!this.isHasArrayColumn) {
      if (size === this.rangeCells.length) {
        const tempRangeCells = new Array<Cell[]>(size + count).map(() => new Array<Cell>(this.columnSize));
        for (let i = 0; i < size; i++) {
          tempRangeCells[i + (isFoot ? 0 : count)] = this.rangeCells[i];
        }
        this.rangeCells = tempRangeCells;
      }
    }
  }

  public getCountHeight(): number {
    return this.zoom * this.countHeight;
  }

  public setCountHeight(countHeight: number): void {
    this.countHeight = countHeight;
  }

  public getLineHeightArray(): number[] {
    return this.lineHeightArray;
  }

  public getZoom(): number {
    return this.zoom;
  }

  public setZoom(zoom: number): void {
    this.zoom = zoom;
  }

  public getTableTitleSize(): number {
    return this.tableTitleSize;
  }

  public setTableTitleSize(tableTitleSize: number): void {
    this.tableTitleSize = tableTitleSize;
  }

  public getTitleDirection(): number {
    return this.titleDirection;
  }

  public setTitleDirection(titleDirection: number): void {
    this.titleDirection = titleDirection;
  }

  public getRangeCells(): Cell[][] {
    return this.rangeCells;
  }

  public clear(): void {
    this.rangeCells = null;
    this.lineHeightArray = null;
    this.tableRect = null;
    this.topNode = null;
  }

  public getTopNode(): ColumnNode {
    return this.topNode;
  }

  public setTopNode(topNode: ColumnNode): void {
    this.topNode = topNode;
    if (this.topNode != null) {
      this.isHasArrayColumn = true;
      this.rangeCells = null;
    }
  }

  public countTotalLineSize(bottomColumn: ArrayColumn): void {
    if (this.topNode != null) {
      this.arrayLineSize = new Array(this.lineSize);
      let totalSize = 0;
      for (let i = 0; i < this.lineSize; i++) {
        this.arrayLineSize[i] = bottomColumn.getStructure().getLevelCellSize(-1, i);
        totalSize += this.arrayLineSize[i];
      }
      this.lineHeightArray = new Array(totalSize);
      this.rangeCells = null;
    }
  }

  public getSeizeCellSize(column: Column, position: number): number {
    if (this.topNode != null) {
      return column.getSeizeCellSize(this, position);
    }
    return 1;
  }

  public getArrayLineSize(): number[] {
    return this.arrayLineSize;
  }
}
