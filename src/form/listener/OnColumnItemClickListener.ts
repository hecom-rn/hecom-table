import type { Column } from '../data/column/Column';

export interface OnColumnItemClickListener<T> {
    (column: Column<T>, value: string, t: T, position: number): void;
}
