import type HecomTable from '../HecomTable';

export default abstract class Locker {
    protected frozenColumns: number = 0;
    protected ignores?: Set<number>;
    protected table: HecomTable;

    constructor(table: HecomTable) {
        this.table = table;
    }

    public getFrozenColumns(): number {
        return this.frozenColumns;
    }

    public setFrozenColumns(frozenColumns: number): void {
        this.frozenColumns = frozenColumns;
    }

    public getIgnores(): Set<number> | undefined {
        return this.ignores;
    }

    public setIgnores(ignores: Set<number>): void {
        this.ignores = ignores;
    }

    protected ignore(col: number): boolean {
        return !!this.ignores?.has(col + 1);
    }

    public onClick(row: number, col: number): void {
        if (row === 0 && !this.ignore(col)) {
            this.updateLock(col);
        }
    }

    /**
     * 更新数据后调用，根据锁定状态更新列排序
     */
    public update(): void {
        // 具体实现由子类完成
    }

    public needShowLockRowAndCol(row: number, col: number): boolean {
        if (row === 0 && !this.ignore(col)) {
            return this.needShowLockCol(col);
        }
        return false;
    }

    protected abstract updateLock(column: number): void;
    protected abstract needShowLockCol(col: number): boolean;
    public abstract getRawCol(col: number): number;
}
