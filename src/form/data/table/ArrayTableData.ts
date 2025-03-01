import { Column } from '../column/Column';
import type { IFormat } from '../format/IFormat';
import type { IDrawFormat } from '../format/draw/IDrawFormat';
import { TableData } from './TableData';
import { SmartTable } from '../../core/SmartTable';

/**
 * Array TableData
 */
export class ArrayTableData<T> extends TableData<T> {
    protected data: T[][] = [[]];
    protected arrayColumns: Column<T>[];

    /**
     * Provide a method to transform an array [col][row] to an array [row][col]
     * because usually the 2D array we provide is in rows.
     * @param rowArray Array [row][col]
     * @return Array [col][row]
     */
    public static transformColumnArray<T>(rowArray: T[][]): T[][] {
        let newData: T[][] = [];
        let row: T[] | null = null;
        if (rowArray != null) {
            let maxLength = 0;
            rowArray.forEach((t) => {
                if (t != null && t.length > maxLength) {
                    maxLength = t.length;
                    row = t;
                }
            });
            if (row != null) {
                rowArray.forEach((tempRow, i) => {
                    tempRow.forEach((tempCol, j) => {
                        if (newData[j] == null) {
                            newData[j] = [];
                        }
                        newData[j][i] = tempCol;
                    });
                });
            }
        }
        return newData;
    }

    /**
     * Create 2D array table data
     * If the data is not an array [row][col], you can use the transformColumnArray method to convert it
     * @param tableName Table name
     * @param titleNames Column names
     * @param data Data array [row][col]
     * @param drawFormat Data format
     * @return Created 2D array table data
     */
    public static create<T>(
        tableName: string,
        titleNames: string[],
        data: T[][],
        drawFormat: IDrawFormat<T>
    ): ArrayTableData<T> {
        const columns: Column<T>[] = [];
        data.forEach((dataArray, i) => {
            const column = new Column<T>(titleNames == null ? '' : titleNames[i] || '', null, null, drawFormat);
            column.setDatas(dataArray);
            columns.push(column);
        });
        const arrayList = Array.from(data[0] as T[]);
        const tableData = new ArrayTableData<T>(tableName, arrayList, columns);
        tableData.setData(data);
        return tableData;
    }

    /**
     * Create 2D array table data without column names
     * If the data is not an array [row][col], you can use the transformColumnArray method to convert it
     * @param tableName Table name
     * @param data Data array [row][col]
     * @param drawFormat Data format
     * @return Created 2D array table data
     */
    public static createWithoutColumnNames<T>(
        table: SmartTable,
        tableName: string,
        data: T[][],
        drawFormat: IDrawFormat<T>
    ): ArrayTableData<T> {
        table.getConfig().setShowColumnTitle(false);
        return this.create(tableName, null, data, drawFormat);
    }

    /**
     * Set default format
     */
    public setFormat(format: IFormat<T>): void {
        for (const column of this.arrayColumns) {
            column.setFormat(format);
        }
    }

    /**
     * Set draw format
     */
    public setDrawFormat(format: IDrawFormat<T>): void {
        for (const column of this.arrayColumns) {
            column.setDrawFormat(format);
        }
    }

    /**
     * Set minimum width
     */
    public setMinWidth(minWidth: number): void {
        for (const column of this.arrayColumns) {
            column.setMinWidth(minWidth);
        }
    }

    /**
     * Set minimum height
     */
    public setMinHeight(minHeight: number): void {
        for (const column of this.arrayColumns) {
            column.setMinHeight(minHeight);
        }
    }

    /**
     * Constructor for 2D array
     * @param tableName Table name
     * @param t Data
     * @param columns Columns
     */
    protected constructor(tableName: string, t: T[], columns: Column<T>[]) {
        super(tableName, t, columns);
        this.arrayColumns = columns;
    }

    /**
     * Get current columns
     */
    public getArrayColumns(): Column<T>[] {
        return this.arrayColumns;
    }

    /**
     * Get 2D array data
     */
    public getData(): T[][] {
        return this.data;
    }

    /**
     * Set 2D array data
     */
    public setData(data: T[][]): void {
        this.data = data;
    }
}
