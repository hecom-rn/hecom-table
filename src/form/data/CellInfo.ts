import type { Column } from './column/Column';

export class CellInfo<T = any> {
  /**
   * 数据
   */
  public data: T | null;
  /**
   * 所在行位置
   */
  public row: number;
  /**
   * 所在列位置
   */
  public col: number;
  /**
   * 所在列
   */
  public column: Column<T> | null;
  /**
   * 显示的值
   */
  public value: string;

  constructor() {
    this.data = null;
    this.row = 0;
    this.col = 0;
    this.column = null;
    this.value = '';
  }

  public set(column: Column<T>, data: T, value: string, col: number, row: number): void {
    this.column = column;
    this.value = value;
    this.data = data;
    this.row = row;
    this.col = col;
  }
}
