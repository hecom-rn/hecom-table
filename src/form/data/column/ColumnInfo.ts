import { Column } from './Column';
/**
 * Column information class
 * Used to save the calculated column information
 */
export class ColumnInfo {
    /**
     * Column width
     */
    public width: number;
    /**
     * Column height
     */
    public height: number;
    /**
     * Column left
     */
    public left: number;
    /**
     * Column top
     */
    public top: number;
    /**
     * Value
     */
    public value: string;
    /**
     * Column
     */
    public column: Column;
    /**
     * Parent column data
     * Convenient for recursive search
     */
    private parent: ColumnInfo | null;

    constructor() {
        this.width = 0;
        this.height = 0;
        this.left = 0;
        this.top = 0;
        this.value = '';
        this.column = new Column();
        this.parent = null;
    }

    /**
     * Get the top-level column information
     *
     * @return Top-level column information
     */
    public getTopParent(): ColumnInfo {
        return this.getParent(this);
    }

    /**
     * Recursively find the top level
     * @param column
     * @return
     */
    private getParent(column?: ColumnInfo): ColumnInfo {
        if (column) {
            if (column.getParent() != null) {
                return this.getParent(column.getParent()!);
            }
            return column;
        } else {
            return this.parent!;
        }
    }

    /**
     * Set the parent column
     */
    public setParent(parent: ColumnInfo): void {
        this.parent = parent;
    }
}
