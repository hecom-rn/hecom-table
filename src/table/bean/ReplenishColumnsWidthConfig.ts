export class ReplenishColumnsWidthConfig {
    private showNumber: number;
    /**
     * 列数从1开始
     */
    private ignoreColumns?: Set<number>;

    constructor(showNumber: number = 0, ignoreColumns?: Set<number>) {
        this.showNumber = showNumber;
        this.ignoreColumns = ignoreColumns;
    }

    /**
     * 检查是否忽略指定列
     * @param col 列索引（从0开始）
     * @returns 是否忽略该列
     */
    public ignore(col: number): boolean {
        return this.ignoreColumns !== undefined && this.ignoreColumns.has(col + 1);
    }

    public getShowNumber(): number {
        return this.showNumber;
    }

    public setShowNumber(showNumber: number): void {
        this.showNumber = showNumber;
    }

    public getIgnoreColumns(): Set<number> | undefined {
        return this.ignoreColumns;
    }

    public setIgnoreColumns(ignoreColumns: Set<number>): void {
        this.ignoreColumns = ignoreColumns;
    }
}
