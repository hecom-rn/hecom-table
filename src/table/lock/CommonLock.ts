// lock.ts
import HecomTable from '../HecomTable'; // 假设存在对应类型定义
import { TableData } from '../../form/data/table/TableData'; // 假设存在对应类型定义
import { Column } from '../../form/data/column/Column'; // 假设存在对应类型定义
import { CellRange } from '../../form/data/CellRange'; // 假设存在对应类型定义
import Locker from './Locker'; // 基类类型定义

export class CommonLock extends Locker {
    public frozenCount: number = 0;
    public frozenPoint: number = 0;
    private firstColMaxMerge: number = -1;
    private curFixedColumnIndex: number = -1;

    constructor(table: HecomTable) {
        super(table);
    }

    private getFirstColMaxMerge(): number {
        if (this.firstColMaxMerge === -1) {
            const tableData: TableData = this.table.getTableData();
            let maxColumn: number = -1;
            const list: CellRange[] = tableData.getUserCellRange();

            for (const cellRange of list) {
                if (cellRange.getFirstCol() === 0 && cellRange.getFirstRow() === 0 && cellRange.getLastCol() > 0) {
                    maxColumn = Math.max(maxColumn, cellRange.getLastCol());
                }
            }
            this.firstColMaxMerge = maxColumn;
        }
        return this.firstColMaxMerge;
    }

    private changeLock(columns: Column[], index: number, lock: boolean): void {
        if (!this.ignore(index)) {
            columns?.[index].setFixed(lock);
        }
    }

    protected updateLock(col: number): void {
        const columns: Column[] = this.table.getTableData().getColumns();
        const firstColumnMaxMerge: number = this.getFirstColMaxMerge();
        const frozenIndex: number = this.frozenColumns || 0;

        if (firstColumnMaxMerge > 0) {
            // 处理合并列逻辑
            if (this.curFixedColumnIndex === -1 || col > this.curFixedColumnIndex) {
                for (let i = 0; i <= firstColumnMaxMerge; i++) {
                    this.changeLock(columns, i, true);
                }
                this.curFixedColumnIndex = col;
            } else if (col < this.curFixedColumnIndex) {
                for (let i = col + 1; i <= firstColumnMaxMerge; i++) {
                    this.changeLock(columns, i, false);
                }
                this.curFixedColumnIndex = col;
            } else {
                for (let i = frozenIndex; i <= firstColumnMaxMerge; i++) {
                    this.changeLock(columns, i, false);
                }
                this.curFixedColumnIndex = -1;
            }
            return;
        }

        // 常规列锁定逻辑
        if (this.curFixedColumnIndex === -1 || col > this.curFixedColumnIndex) {
            for (let i = 0; i <= col; i++) {
                this.changeLock(columns, i, true);
            }
            this.curFixedColumnIndex = col;
        } else if (col < this.curFixedColumnIndex) {
            for (let i = col + 1; i <= this.curFixedColumnIndex; i++) {
                this.changeLock(columns, i, false);
            }
            this.curFixedColumnIndex = col;
        } else {
            for (let i = frozenIndex; i <= col; i++) {
                this.changeLock(columns, i, false);
            }
            this.curFixedColumnIndex = -1;
        }
    }

    public needShowLockCol(col: number): boolean {
        let isLockItem: boolean;
        const firstColumnMaxMerge: number = this.getFirstColMaxMerge();

        if (this.frozenPoint > 0) {
            if (col === 0 && firstColumnMaxMerge > 0) {
                col = firstColumnMaxMerge;
            }
            isLockItem = col === this.frozenPoint - 1;
        } else if (this.frozenCount > 0) {
            isLockItem = col < this.frozenCount;
        } else {
            isLockItem = false;
        }
        return isLockItem;
    }

    public getRawCol(col: number): number {
        return col;
    }

    // 假设基类需要实现的方法
    protected ignore(index: number): boolean {
        // 实现具体逻辑
        return false;
    }
}
