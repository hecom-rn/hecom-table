/**
 * 合并单元格配置类
 */
export class MergeBean {
    private mergeRow: boolean;
    private mergeColumn: boolean;
    private startColum: number;
    private endColum: number;
    private startRow: number;
    private endRow: number;

    constructor() {
        this.mergeRow = false;
        this.mergeColumn = false;
        this.startColum = -1;
        this.endColum = -1;
        this.startRow = -1;
        this.endRow = -1;
    }

    public isMergeRow(): boolean {
        return this.mergeRow;
    }

    public setMergeRow(mergeRow: boolean): void {
        this.mergeRow = mergeRow;
    }

    public isMergeColumn(): boolean {
        return this.mergeColumn;
    }

    public setMergeColumn(mergeColumn: boolean): void {
        this.mergeColumn = mergeColumn;
    }

    public getStartColum(): number {
        return this.startColum;
    }

    public setStartColum(startColum: number): void {
        this.startColum = startColum;
    }

    public getEndColum(): number {
        return this.endColum;
    }

    public setEndColum(endColum: number): void {
        this.endColum = endColum;
    }

    public getStartRow(): number {
        return this.startRow;
    }

    public setStartRow(startRow: number): void {
        this.startRow = startRow;
    }

    public getEndRow(): number {
        return this.endRow;
    }

    public setEndRow(endRow: number): void {
        this.endRow = endRow;
    }

    /**
     * 清空合并配置
     */
    public clear(): void {
        this.setStartColum(-1);
        this.setEndColum(-1);
        this.setStartRow(-1);
        this.setEndRow(-1);
        this.setMergeColumn(false);
        this.setMergeRow(false);
    }
}
