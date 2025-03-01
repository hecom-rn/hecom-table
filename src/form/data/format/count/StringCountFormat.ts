import type { ICountFormat } from './ICountFormat';
import { Column } from '../../column/Column';

/**
 * 文本总计格式化
 */
export class StringCountFormat<T> implements ICountFormat<T> {
    private valueSet: Set<string>;
    private _count: number = 0;
    private column: Column<T>;

    public constructor(column: Column<T>) {
        this.column = column;
        this.valueSet = new Set<string>();
    }

    public count(t: T): void {
        let value: string;
        if (this.column.getFormat() != null) {
            value = this.column.getFormat().format(t);
        } else {
            value = t == null ? '' : t.toString();
        }
        if (value != null && !this.valueSet.has(value) && value != '') {
            this._count++;
            this.valueSet.add(value);
        }
    }

    public getCount() {
        return this._count;
    }

    public getCountString(): string {
        return String(this._count);
    }

    public clearCount(): void {
        this.valueSet.clear();
        this._count = 0;
    }
}
