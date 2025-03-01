import { Cell } from '../Cell';
import { CellRange } from '../CellRange';
import { TableInfo } from '../TableInfo';
import { Column } from '../column/Column';
import { ColumnInfo } from '../column/ColumnInfo';
import type { ISequenceFormat } from '../format/sequence/ISequenceFormat';
import { LetterSequenceFormat } from '../format/sequence/LetterSequenceFormat';
import { NumberSequenceFormat } from '../format/sequence/NumberSequenceFormat';
import type { ITitleDrawFormat } from '../format/title/ITitleDrawFormat';
import { TitleDrawFormat } from '../format/title/TitleDrawFormat';

export class TableData<T> {
    private tableName: string;
    private columns: Column[];
    private t: T[];
    private childColumns: Column[];
    private tableInfo: TableInfo = new TableInfo();
    private columnInfos: ColumnInfo[];
    private childColumnInfos: ColumnInfo[];
    private sortColumn: Column;
    private showCount: boolean; // 显示统计
    private titleDrawFormat: ITitleDrawFormat;
    private XSequenceFormat: ISequenceFormat;
    private YSequenceFormat: ISequenceFormat;
    // 用户设置的 不能清除
    private userSetRangeAddress: CellRange[];
    private onItemClickListener: OnItemClickListener<T>;
    private onRowClickListener: OnRowClickListener<T>;
    private onColumnClickListener: OnColumnClickListener<any>;

    /**
     * @param tableName 表名
     * @param t 数据
     * @param columns 列列表
     */
    constructor(tableName: string, t: T[], columns: Column[], titleDrawFormat: ITitleDrawFormat) {
        this.tableName = tableName;
        this.columns = columns;
        this.t = t;
        this.tableInfo.setLineSize(t.length);
        this.childColumns = [];
        this.columnInfos = [];
        this.childColumnInfos = [];
        this.titleDrawFormat = titleDrawFormat || new TitleDrawFormat();
    }

    /**
     * 获取表名
     * @return 表名
     */
    public getTableName(): string {
        return this.tableName;
    }

    /**
     * 设置表名
     */
    public setTableName(tableName: string): void {
        this.tableName = tableName;
    }

    /**
     * 获取所有列
     * @return 所有列
     */
    public getColumns(): Column[] {
        return this.columns;
    }

    /**
     * 设置新列列表
     */
    public setColumns(columns: Column[]): void {
        this.columns = columns;
    }

    /**
     * 获取解析数据
     * @return 解析数据
     */
    public getT(): T[] {
        return this.t;
    }

    /**
     * 设置解析数据
     */
    public setT(t: T[]): void {
        this.t = t;
        this.tableInfo.setLineSize(t.length);
    }

    /**
     * 获取所有需要显示列数据的列
     * isParent true的列不包含
     * @return 所有需要显示列数据的列
     */
    public getChildColumns(): Column[] {
        return this.childColumns;
    }

    /**
     * 获取表格信息
     * @return 表格信息tableInfo
     */
    public getTableInfo(): TableInfo {
        return this.tableInfo;
    }

    /**
     * 设置表格信息
     * 一般情况下不会使用到这个方法
     */
    public setTableInfo(tableInfo: TableInfo): void {
        this.tableInfo = tableInfo;
    }

    /**
     * 获取列信息列表
     * @return 列信息列表
     */
    public getColumnInfos(): ColumnInfo[] {
        return this.columnInfos;
    }

    /**
     * 获取isParent false列(子列)信息列表
     * @return 子列信息列表
     */
    public getChildColumnInfos(): ColumnInfo[] {
        return this.childColumnInfos;
    }

    /**
     * 设置子列信息列表
     */
    public setChildColumnInfos(childColumnInfos: ColumnInfo[]): void {
        this.childColumnInfos = childColumnInfos;
    }

    /**
     * 设置列信息列表
     */
    public setColumnInfos(columnInfos: ColumnInfo[]): void {
        this.columnInfos = columnInfos;
    }

    /**
     * 设置子���
     */
    public setChildColumns(childColumns: Column[]): void {
        this.childColumns = childColumns;
    }

    /**
     * 获取需要根据排序的列
     * @return 排序的列
     */
    public getSortColumn(): Column {
        return this.sortColumn;
    }

    /**
     * 设置需要根据排序的列
     */
    public setSortColumn(sortColumn: Column): void {
        this.sortColumn = sortColumn;
    }

    /**
     * 判断是否需要显示统计行
     * @return 是否需要显示统计行
     */
    public isShowCount(): boolean {
        return this.showCount;
    }

    /**
     * 设置是否显示统计总数
     * @param showCount 显示统计总数
     */
    public setShowCount(showCount: boolean): void {
        this.showCount = showCount;
    }

    /**
     * 获取列标题绘制格式化
     * @return 列标题绘制格式化
     */
    public getTitleDrawFormat(): ITitleDrawFormat {
        return this.titleDrawFormat;
    }

    /**
     * 设置列标题绘制格式化
     * 通过这个方法可以对列名进行格式化
     */
    public setTitleDrawFormat(titleDrawFormat: ITitleDrawFormat): void {
        this.titleDrawFormat = titleDrawFormat;
    }

    /**
     * 获取X序号行文字格式化
     * @return X行文字格式化
     */
    public getXSequenceFormat(): ISequenceFormat {
        if (!this.XSequenceFormat) {
            this.XSequenceFormat = new LetterSequenceFormat();
        }
        return this.XSequenceFormat;
    }

    /**
     * 设置X序号行文字格式化
     */
    public setXSequenceFormat(XSequenceFormat: ISequenceFormat): void {
        this.XSequenceFormat = XSequenceFormat;
    }

    /**
     * 获取Y序号列文字格式化
     * @return Y序号列文字格式化
     */
    public getYSequenceFormat(): ISequenceFormat {
        if (!this.YSequenceFormat) {
            this.YSequenceFormat = new NumberSequenceFormat();
        }
        return this.YSequenceFormat;
    }

    /**
     * 设置Y序号列文字格式化
     */
    public setYSequenceFormat(YSequenceFormat: ISequenceFormat): void {
        this.YSequenceFormat = YSequenceFormat;
    }

    /**
     * 获取包含ID的子列
     * @param id 列ID
     * @return 包含ID的子列
     */
    public getColumnByID(id: number): Column | null {
        return this.childColumns.find((column) => column.getId() === id) || null;
    }

    /**
     * 获取包含fieldName的子列
     * @param fieldName 列Name
     * @return 包含ID的子列
     */
    public getColumnByFieldName(fieldName: string): Column | null {
        return this.childColumns.find((column) => column.getFieldName() === fieldName) || null;
    }

    /**
     * 获取行数
     * @return 行数
     */
    public getLineSize(): number {
        return this.tableInfo.getLineHeightArray().length;
    }

    private _addCellRange(firstRow: number, lastRow: number, firstCol: number, lastCol: number): void {
        const tableCells = this.tableInfo.getRangeCells();
        let realCell: Cell | null = null;
        if (tableCells) {
            for (let i = firstRow; i <= lastRow; i++) {
                if (i < tableCells.length) {
                    for (let j = firstCol; j <= lastCol; j++) {
                        if (j < tableCells[i].length) {
                            if (i === firstRow && j === firstCol) {
                                const rowCount = Math.min(lastRow + 1, tableCells.length) - firstRow;
                                const colCount = Math.min(lastCol + 1, tableCells[i].length) - firstCol;
                                realCell = new Cell(colCount, rowCount);
                                tableCells[i][j] = realCell;
                                continue;
                            }
                            tableCells[i][j] = new Cell(realCell);
                        }
                    }
                }
            }
        }
    }

    /**
     * 获取所有合并规则，包括自定义和自动合并规则
     * 请不要使用该方法来添加合并单元格
     * 而是通过设置setUserCellRange来添加
     * @return
     */
    public addCellRange(range: CellRange): void {
        this._addCellRange(range.getFirstRow(), range.getLastRow(), range.getFirstCol(), range.getLastCol());
    }

    /**
     * 清除自动合并的规则
     */
    public clearCellRangeAddresses(): void {
        if (this.userSetRangeAddress) {
            for (const range of this.userSetRangeAddress) {
                this.addCellRange(range);
            }
        }
    }

    /**
     * 提供添加自定义合并规则
     * @return
     */
    public setUserCellRange(userCellRange: CellRange[]): void {
        this.userSetRangeAddress = userCellRange;
    }

    /**
     * 获取自定义合并规则
     * @return
     */
    public getUserCellRange(): CellRange[] {
        return this.userSetRangeAddress;
    }

    public clear(): void {
        if (this.t) {
            this.t.length = 0;
            this.t = undefined;
        }
        if (this.childColumns) {
            this.childColumns.length = 0;
            this.childColumns = undefined;
        }
        if (this.columns) {
            this.columns = undefined;
        }
        if (this.childColumnInfos) {
            this.childColumnInfos.length = 0;
            this.childColumnInfos = undefined;
        }
        if (this.userSetRangeAddress) {
            this.userSetRangeAddress.length = 0;
            this.userSetRangeAddress = undefined;
        }
        if (this.tableInfo) {
            this.tableInfo.clear();
            this.tableInfo = undefined;
        }
        this.sortColumn = undefined;
        this.titleDrawFormat = undefined;
        this.XSequenceFormat = undefined;
        this.YSequenceFormat = undefined;
    }

    /**
     * 获取表格单元格Cell点击事件
     */
    public getOnItemClickListener(): OnItemClickListener<T> {
        return this.onItemClickListener;
    }

    /**
     * 设置表格单元格Cell点击事件
     * @param onItemClickListener 点击事件
     */
    public setOnItemClickListener(onItemClickListener: OnItemClickListener<T>): void {
        this.onItemClickListener = onItemClickListener;
        for (const column of this.columns) {
            if (!column.isParent()) {
                column.setOnColumnItemClickListener((column, value, t, position) => {
                    if (this.onItemClickListener) {
                        const index = this.childColumns.indexOf(column);
                        this.onItemClickListener(column, value, t, index, position);
                    }
                });
            }
        }
    }

    /**
     * 设置表格行点击事件
     * @param onRowClickListener 行点击事件
     */
    public setOnRowClickListener(onRowClickListener: OnRowClickListener<T>): void {
        this.onRowClickListener = onRowClickListener;
        if (this.onRowClickListener) {
            this.setOnItemClickListener((column, value, o, col, row) => {
                this.onRowClickListener(column, this.t[row], col, row);
            });
        }
    }

    /**
     * 设置表格列点击事件
     */
    public setOnColumnClickListener(onColumnClickListener: OnColumnClickListener<any>): void {
        this.onColumnClickListener = onColumnClickListener;
        if (this.onRowClickListener) {
            this.setOnItemClickListener((column, value, o, col, row) => {
                this.onColumnClickListener(column, column.getDatas(), col, row);
            });
        }
    }

    public getOnRowClickListener(): OnRowClickListener<T> {
        return this.onRowClickListener;
    }
}

/**
 * 表格单元格Cell点击事件接口
 */
export interface OnItemClickListener<T> {
    (column: Column<T>, value: string, t: T, col: number, row: number): void;
}

/**
 * 表格行点击事件接口
 */
export interface OnRowClickListener<T> {
    (column: Column, t: T, col: number, row: number): void;
}

export interface OnColumnClickListener<T> {
    (column: Column, t: T[], col: number, row: number): void;
}
