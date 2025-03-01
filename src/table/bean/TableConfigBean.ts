import type { CellConfig } from './CellConfig';

export class TableConfigBean {
    private minWidth: number;
    private maxWidth: number;
    private minHeight: number;
    private columnConfigMap?: Map<number, CellConfig>;

    constructor(minWidth: number, maxWidth: number, minHeight: number) {
        this.minWidth = minWidth;
        this.maxWidth = maxWidth;
        this.minHeight = minHeight;
    }

    public getMinWidth(): number {
        return this.minWidth;
    }

    public getMaxWidth(): number {
        return this.maxWidth;
    }

    public getMinHeight(): number {
        return this.minHeight;
    }

    public setColumnConfigMap(columnConfigMap: Map<number, CellConfig>): void {
        this.columnConfigMap = columnConfigMap;
    }

    public getColumnConfigMap(): Map<number, CellConfig> | undefined {
        return this.columnConfigMap;
    }
}
