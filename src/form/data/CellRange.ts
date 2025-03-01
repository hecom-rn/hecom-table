/**
 * Merged cell range
 */
export class CellRange {
    private cellRange: number[];

    /**
     * Merged cell constructor
     * @param firstRow First row of the merge
     * @param lastRow Last row of the merge
     * @param firstCol First column of the merge
     * @param lastCol Last column of the merge
     */
    constructor(firstRow: number, lastRow: number, firstCol: number, lastCol: number) {
        this.cellRange = [firstRow, lastRow, firstCol, lastCol];
    }

    public getFirstRow(): number {
        return this.cellRange[0];
    }

    public setFirstRow(firstRow: number): void {
        this.cellRange[0] = firstRow;
    }

    public getLastRow(): number {
        return this.cellRange[1];
    }

    public setLastRow(lastRow: number): void {
        this.cellRange[1] = lastRow;
    }

    public getFirstCol(): number {
        return this.cellRange[2];
    }

    public setFirstCol(firstCol: number): void {
        this.cellRange[2] = firstCol;
    }

    public getLastCol(): number {
        return this.cellRange[3];
    }

    public setLastCol(lastCol: number): void {
        this.cellRange[3] = lastCol;
    }

    public getCellRange(): number[] {
        return this.cellRange;
    }

    /**
     * Check if the merged cell contains a specific cell
     * @param row Row
     * @param col Column
     * @return Whether it contains the cell
     */
    public contain(row: number, col: number): boolean {
        return (
            this.cellRange[0] <= row && this.cellRange[1] >= row && this.cellRange[2] <= col && this.cellRange[3] >= col
        );
    }

    /**
     * Check if the cell is at the top-left corner of the merged cell
     * @param row Row
     * @param col Column
     * @return Whether it is at the top-left corner
     */
    public isLeftAndTop(row: number, col: number): boolean {
        return this.cellRange[0] === row && this.cellRange[2] === col;
    }

    public toString(): string {
        return `CellRange{cellRange=${this.cellRange.toString()}}`;
    }
}
