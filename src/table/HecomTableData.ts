import { MergeBean } from './bean/MergeBean';
import type { TableConfigBean } from './bean/TableConfigBean';
import { CellRange } from '../form/data/CellRange';
import { Column } from '../form/data/column/Column';
import type { Cell } from './bean/Cell';
import { ArrayTableData } from '../form/data/table/ArrayTableData';

export class HecomTableData extends ArrayTableData<Cell> {
    constructor(t: Cell[], columns: Column<Cell>[]) {
        super('null', t, columns);
    }

    static initData(json: string): Cell[][] {
        if (!json) {
            return [];
        }
        try {
            const tabArr: Cell[][] = JSON.parse(json);
            return tabArr || [];
        } catch (e) {
            console.error('HecomTableData', e);
            return [];
        }
    }

    static mergeTable(tabArr: Cell[][], mergeList: CellRange[]): void {
        const mergeKeyMap: Set<number> = new Set();
        try {
            const rowLength = tabArr.length;
            const mergeBean = new MergeBean();
            for (let rowIndex = 0; rowIndex < rowLength; rowIndex++) {
                const columnArr = tabArr[rowIndex];
                if (!columnArr) {
                    continue;
                }
                const colLength = columnArr?.length || 0;
                for (let columnIndex = 0; columnIndex < colLength; columnIndex++) {
                    const rowObj = columnArr?.[columnIndex] || undefined;
                    const uniqueKeyValue = rowObj?.getKeyIndex() || undefined;
                    if (uniqueKeyValue === undefined) {
                        continue;
                    }
                    mergeBean.clear();
                    mergeBean.setStartColum(columnIndex);
                    this.mergeColumn(uniqueKeyValue, columnIndex, columnArr, mergeBean);
                    mergeBean.setStartRow(rowIndex);
                    this.mergeRow(uniqueKeyValue, rowIndex, columnIndex, tabArr, mergeBean);

                    if (mergeBean.isMergeColumn()) {
                        columnIndex = mergeBean.getEndColum();
                    }

                    if (!mergeKeyMap.has(uniqueKeyValue)) {
                        const cellRange = new CellRange(-1, -1, -1, -1);
                        const isMerge = mergeBean.isMergeColumn() || mergeBean.isMergeRow();
                        if (isMerge) {
                            if (mergeBean.isMergeColumn()) {
                                cellRange.setFirstCol(mergeBean.getStartColum());
                                cellRange.setLastCol(mergeBean.getEndColum());
                            } else {
                                cellRange.setFirstCol(mergeBean.getStartColum());
                                cellRange.setLastCol(mergeBean.getStartColum());
                            }
                            if (mergeBean.isMergeRow()) {
                                cellRange.setFirstRow(mergeBean.getStartRow());
                                cellRange.setLastRow(mergeBean.getEndRow());
                            } else {
                                cellRange.setFirstRow(mergeBean.getStartRow());
                                cellRange.setLastRow(mergeBean.getStartRow());
                            }
                            mergeList.push(cellRange);
                            mergeKeyMap.add(uniqueKeyValue);
                        }
                    }
                }
            }
        } catch (e) {
            console.error('table------合并异常了----------', e);
        }
    }

    private static mergeRow(
        uniqueKeyValue: number,
        searchRowIndex: number,
        searchColumnIndex: number,
        array: Cell[][],
        mergeBean: MergeBean
    ): void {
        if (!array) return;
        let index = searchRowIndex + 1;
        const length = array.length;
        let needMerge = false;
        for (; index < length; index++) {
            const rowArr = array[index];
            if (!rowArr) {
                continue;
            }
            const object = rowArr[searchColumnIndex];
            if (!object) {
                continue;
            }
            const keyValue = object.getKeyIndex();
            if (uniqueKeyValue === keyValue) {
                needMerge = true;
            } else {
                if (needMerge) {
                    mergeBean.setMergeRow(true);
                    mergeBean.setEndRow(index - 1);
                }
                break;
            }
        }
        if (needMerge && index === length) {
            mergeBean.setMergeRow(true);
            mergeBean.setEndRow(index - 1);
        }
    }

    private static mergeColumn(
        uniqueKeyValue: number,
        searchColumnIndex: number,
        columnArr: Cell[],
        mergeBean: MergeBean
    ): void {
        if (!columnArr) return;
        let index = searchColumnIndex + 1;
        const length = columnArr.length;
        let needMerge = false;
        for (; index < length; index++) {
            const object = columnArr[index];
            if (!object) {
                continue;
            }
            const keyValue = object.getKeyIndex();
            if (uniqueKeyValue === keyValue) {
                needMerge = true;
            } else {
                if (needMerge) {
                    mergeBean.setMergeColumn(true);
                    mergeBean.setEndColum(index - 1);
                }
                break;
            }
        }
        if (needMerge && index === length) {
            mergeBean.setMergeColumn(true);
            mergeBean.setEndColum(index - 1);
        }
    }

    static create(rawData: Cell[][], format: any, drawFormat: any): HecomTableData {
        const mergeList: CellRange[] = [];
        this.mergeTable(rawData, mergeList);
        const data = this.transformColumnArray(rawData);

        const columns: Column<Cell>[] = [];
        const dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            const dataArray = data[i];
            const column = new Column<Cell>('', '', format, drawFormat);
            const ranges: number[][] = [];
            for (const cellRange of mergeList) {
                if (cellRange.getFirstCol() === i && cellRange.getFirstRow() !== cellRange.getLastRow()) {
                    ranges.push([cellRange.getFirstRow(), cellRange.getLastRow()]);
                }
            }
            column.setColumn(i);
            column.setDatas(dataArray || []);
            column.setRanges(ranges);
            columns.push(column);
        }

        const arrayList = data?.[0] || [];
        const result = new HecomTableData(arrayList, columns);
        result.setUserCellRange(mergeList);
        return result;
    }

    setLimit(config: TableConfigBean): void {
        for (let i = 0; i < this.arrayColumns.length; i++) {
            const column = this.arrayColumns[i];
            if (!column) {
                continue;
            }
            if (config.getMinWidth() > 0) column.setMinWidth(config.getMinWidth());
            if (config.getMinHeight() > 0) column.setMinHeight(config.getMinHeight());
            const cellConfig = config.getColumnConfigMap()?.get(i);
            if (cellConfig && cellConfig.minWidth > 0) {
                column.setMinWidth(cellConfig.minWidth);
            }
        }
    }
}
