import Locker from './Locker';
import { HecomTableData } from '../HecomTableData';
import HecomTable from '../HecomTable'; // 假设存在对应类型定义
import { Column } from '../../form/data/column/Column'; // 假设存在对应类型定义

export class PermutableLock extends Locker {
    private fixedColumns: number[] = [];

    constructor(table: HecomTable) {
        super(table);
    }

    override getRawCol(col: number): number {
        return this.table.getTableData().columns[col].column;
    }

    private findColumn(list: Column[], targetCol: number): Column | undefined {
        return list.find((col) => col.column === targetCol);
    }

    override update(): void {
        const tableData = this.table.getTableData() as HecomTableData;
        const rawColumns = [...tableData.columns];
        const newColumns: Column[] = [];

        // 处理固定列
        for (let i = 0; i < rawColumns.length; i++) {
            if (i < this.frozenColumns) {
                newColumns[i] = rawColumns[i];
            } else if (i < this.fixedColumns.length + this.frozenColumns) {
                const targetIndex = i - this.frozenColumns;
                const found = this.findColumn(rawColumns, this.fixedColumns[targetIndex]);
                if (found) newColumns[i] = found;
            }
        }

        // 处理剩余可排序列
        const remainingColumns = rawColumns.slice(this.frozenColumns).sort((a, b) => a.column - b.column);

        // 过滤已固定的列
        const filteredColumns = remainingColumns.filter((col) => !this.fixedColumns.includes(col.column));

        // 构建最终列顺序
        tableData.columns = [...newColumns.filter(Boolean), ...filteredColumns] as Column[];
    }

    protected override updateLock(col: number): void {
        const column = this.table.getTableData().columns[col];
        const columnId = column.column;

        if (column.fixed) {
            this.fixedColumns = this.fixedColumns.filter((id) => id !== columnId);
        } else {
            this.fixedColumns.push(columnId);
        }

        column.fixed = !column.fixed;
        this.update();
    }

    protected override needShowLockCol(col: number): boolean {
        return col >= this.frozenColumns;
    }
}
