export class Cell {
  public static readonly INVALID: number = -1;

  public col: number;
  public row: number;
  public realCell: Cell;
  public width: number;
  public height: number;

  constructor(col: number, row: number);
  constructor(realCell: Cell);
  constructor(colOrRealCell: number | Cell, row?: number) {
    if (typeof colOrRealCell === 'number') {
      this.col = colOrRealCell;
      this.row = row!;
      this.realCell = this;
    } else {
      this.col = Cell.INVALID;
      this.row = Cell.INVALID;
      this.realCell = colOrRealCell;
    }
  }
}
