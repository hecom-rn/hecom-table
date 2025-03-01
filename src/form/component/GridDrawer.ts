import { Cell } from '../data/Cell';
import type { TableData } from '../data/table/TableData';
import { Rect } from '../utils/temp';

export class GridDrawer<T> {
    private tableData: TableData<T>;
    private rangePoints: Cell[][];

    constructor() {
        this.rangePoints = [];
    }

    public setTableData(tableData: TableData<T>): void {
        this.tableData = tableData;
        this.rangePoints = tableData.getTableInfo().getRangeCells();
    }

    // 矫正格子大小
    public correctCellRect(row: number, col: number, oriRect: Rect, zoom: number): Rect | null {
        const rect = new Rect(oriRect);
        if (this.rangePoints && this.rangePoints.length > row) {
            const point = this.rangePoints[row][col];
            if (point) {
                if (point.col !== Cell.INVALID && point.row !== Cell.INVALID) {
                    const childColumns = this.tableData.getChildColumns();
                    const lineHeights = this.tableData.getTableInfo().getLineHeightArray();
                    let width = 0,
                        height = 0;
                    for (let i = col; i < Math.min(childColumns.length, col + point.col); i++) {
                        width += childColumns[i].getComputeWidth();
                    }
                    for (let i = row; i < Math.min(lineHeights.length, row + point.row); i++) {
                        height += lineHeights[i];
                    }
                    rect.right = Math.round(rect.left + width * zoom);
                    rect.bottom = Math.round(rect.top + height * zoom);
                    return rect;
                }
                return null;
            }
        }
        return rect;
    }
}
