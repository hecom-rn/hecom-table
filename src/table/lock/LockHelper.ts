import HecomTable from '../HecomTable';
import Locker from './Locker';
import { CommonLock } from './CommonLock';
import { PermutableLock } from './PermutableLock'; // 假设存在这个类
import { HecomTableData } from '../HecomTableData';

export class LockHelper extends Locker {
    private locker: Locker;

    constructor(table: HecomTable) {
        super(table);
        this.locker = new CommonLock(table);
    }

    public setPermutable(permutable: boolean): void {
        if (permutable) {
            this.locker = new PermutableLock(this.table);
            this.locker.setFrozenColumns(this.frozenColumns);
        }
    }

    public override update(): void {
        this.locker.update();
    }

    public override setFrozenColumns(frozenColumns: number): void {
        super.setFrozenColumns(frozenColumns);
        this.locker.setFrozenColumns(frozenColumns);
    }

    public override setIgnores(ignores: Set<number>): void {
        super.setIgnores(ignores);
        this.locker.setIgnores(ignores);
    }

    protected override updateLock(column: number): void {
        if (this.locker) {
            this.locker?.updateLock(column);
        }
    }

    protected override needShowLockCol(col: number): boolean {
        return this.locker?.needShowLockCol(col) ?? false;
    }

    public override getRawCol(col: number): number {
        return this.locker.getRawCol(col);
    }

    public setPoint(point: number): void {
        if (this.locker instanceof CommonLock) {
            (this.locker as CommonLock).frozenPoint = point;
        }
    }

    public setCount(count: number): void {
        if (this.locker instanceof CommonLock) {
            (this.locker as CommonLock).frozenCount = count;
        }
    }

    public reLock(newData: HecomTableData): void {
        const oldData = this.table.getTableData() as HecomTableData;
        const arrayColumnSize = newData.columns.length;

        // 应用新的固定列
        for (let i = 0; i < this.frozenColumns && i < arrayColumnSize; i++) {
            newData.columns[i]?.setFixed(true);
        }

        // 迁移旧的锁定状态
        if (oldData?.arrayColumns) {
            for (let i = 0; i < arrayColumnSize; i++) {
                const oldColumn = oldData.arrayColumns[i];
                if (oldColumn?.fixed) {
                    newData.arrayColumns[i]?.setFixed(true);
                }
            }
        }
    }
}
