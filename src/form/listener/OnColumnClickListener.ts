import type { ColumnInfo } from '../data/column/ColumnInfo';

export interface OnColumnClickListener {
    (columnInfo: ColumnInfo): void;
}
