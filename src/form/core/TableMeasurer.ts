import { Rect } from '../utils/temp';
import type OnMeasureListener from '../listener/OnMeasureListener';
import type { TableData } from '../data/table/TableData';
import type { TableConfig } from './TableConfig';
import type { TableInfo } from '../data/TableInfo';
import type { ITableTitle } from '../component/ITableTitle';
import { Direction } from '../component/IComponent';
import { DrawUtils } from '../utils/DrawUtils';
import { ArrayColumn } from '../data/column/ArrayColumn';
import { Cell } from '../data/Cell';
import type { Column } from '../data/column/Column';
import { ColumnInfo } from '../data/column/ColumnInfo';

export class TableMeasurer<T> {
    private isReMeasure: boolean = false;
    private listener: OnMeasureListener | null = null;

    public measure(tableData: TableData<T>, config: TableConfig): TableInfo {
        this.isReMeasure = true;
        const tableInfo = tableData.getTableInfo();
        const width = this.getTableWidth(tableData, config);
        const height = this.getTableHeight(tableData, config);
        this.onMeasure(tableInfo, width, height);
        tableInfo.setTableRect(new Rect(0, 0, width, height));
        this.measureColumnSize(tableData);
        if (this.listener) {
            this.listener.onDidLayout();
        }
        return tableInfo;
    }

    private onMeasure(tableInfo: TableInfo, width: number, height: number): void {
        if (this.listener) {
            const tableRect = tableInfo.getTableRect();
            if (!tableRect) {
                this.listener.onContentSizeChanged(width, height);
            } else {
                const oldWidth = tableRect.width;
                const oldHeight = tableRect.height;
                if (oldHeight !== height || oldWidth !== width) {
                    this.listener.onContentSizeChanged(width, height);
                }
            }
        }
    }

    public measureTableTitle(tableData: TableData<T>, tableTitle: ITableTitle, showRect: Rect): void {
        const tableInfo = tableData.getTableInfo();
        const tableRect = tableInfo.getTableRect();
        if (this.isReMeasure) {
            this.isReMeasure = false;
            const size = tableTitle.getSize();
            tableInfo.setTitleDirection(tableTitle.getDirection());
            tableInfo.setTableTitleSize(size);
            if (tableTitle.getDirection() === Direction.TOP || tableTitle.getDirection() === Direction.BOTTOM) {
                const height = size;
                tableRect.bottom += height;
                this.reSetShowRect(showRect, tableRect);
            } else {
                const width = size;
                tableRect.right += width;
                this.reSetShowRect(showRect, tableRect);
            }
        } else {
            this.reSetShowRect(showRect, tableRect);
        }
    }

    public reSetShowRect(showRect: Rect, tableRect: Rect): void {
        if (showRect.bottom > tableRect.bottom) {
            showRect.bottom = tableRect.bottom;
        }
        if (showRect.right > tableRect.right) {
            showRect.right = tableRect.right;
        }
    }

    public addTableHeight(tableData: TableData<T>, config: TableConfig): void {
        const tableInfo = tableData.getTableInfo();
        const width = this.getTableWidth(tableData, config);
        const height = this.getTableHeight(tableData, config);
        tableInfo.setTableRect(new Rect(0, 0, width, height));
    }

    private getTableHeight(tableData: TableData<T>, config: TableConfig): number {
        const paint = config.getPaint();
        let topHeight = 0;
        if (config.isShowXSequence()) {
            topHeight =
                DrawUtils.getTextHeight(paint, config.getXSequenceStyle()) + 2 * config.getSequenceVerticalPadding();
        }
        const titleHeight = config.isShowColumnTitle()
            ? tableData.getTitleDrawFormat().measureHeight(config) + 2 * config.getColumnTitleVerticalPadding()
            : 0;
        const tableInfo = tableData.getTableInfo();
        tableInfo.setTitleHeight(titleHeight);
        tableInfo.setTopHeight(topHeight);
        let totalContentHeight = 0;
        for (const height of tableInfo.getLineHeightArray()) {
            totalContentHeight += height;
        }
        const totalTitleHeight = titleHeight * tableInfo.getMaxLevel();
        let totalHeight = topHeight + totalTitleHeight + totalContentHeight;
        if (tableData.isShowCount()) {
            const countHeight =
                DrawUtils.getTextHeight(paint, config.getCountStyle()) + 2 * config.getVerticalPadding();
            tableInfo.setCountHeight(countHeight);
            totalHeight += countHeight;
        }
        return totalHeight;
    }

    private getTableWidth(tableData: TableData<T>, config: TableConfig): number {
        let totalWidth = 0;
        const paint = config.getPaint();
        config.getYSequenceStyle().fillPaint(paint);
        const totalSize = tableData.getLineSize();
        if (config.isShowYSequence()) {
            const yAxisWidth =
                paint.measureText(tableData.getYSequenceFormat().format(totalSize)) +
                2 * config.getSequenceHorizontalPadding();
            tableData.getTableInfo().setYAxisWidth(yAxisWidth);
            totalWidth += yAxisWidth;
        }
        let columnPos = 0;
        let contentWidth = 0;
        const lineHeightArray = tableData.getTableInfo().getLineHeightArray();
        const tableInfo = tableData.getTableInfo();
        for (const column of tableData.getChildColumns()) {
            const columnNameWidth =
                tableData.getTitleDrawFormat().measureWidth(column, config) +
                config.getColumnTitleHorizontalPadding() * 2;
            let columnWidth = 0;
            const size = column.getDatas().length;
            let currentPosition = 0;
            const isArrayColumn = column instanceof ArrayColumn;
            const rangeCells = tableData.getTableInfo().getRangeCells();
            for (let position = 0; position < size; position++) {
                let width = column.getDrawFormat().measureWidth(column, position, config);
                this.measureRowHeight(config, lineHeightArray, column, currentPosition, position);
                const skipPosition = tableInfo.getSeizeCellSize(column, position);
                currentPosition += skipPosition;
                if (!isArrayColumn && rangeCells) {
                    const cell = rangeCells[position][columnPos];
                    if (cell) {
                        if (cell.row !== Cell.INVALID && cell.col !== Cell.INVALID) {
                            cell.width = width;
                            width = width / cell.col;
                        } else if (cell.realCell) {
                            width = cell.realCell.width / cell.realCell.col;
                        }
                    }
                }
                if (columnWidth < width) {
                    columnWidth = width;
                }
            }
            let width = Math.max(columnNameWidth, columnWidth + 2 * config.getHorizontalPadding());
            if (tableData.isShowCount()) {
                const totalCountWidth = column.getCountFormat() ? paint.measureText(column.getTotalNumString()) : 0;
                width = Math.max(totalCountWidth + 2 * config.getHorizontalPadding(), width);
            }
            width = Math.max(column.getMinWidth(), width);
            column.setComputeWidth(width);
            contentWidth += width;
            columnPos++;
        }
        const minWidth = config.getMinTableWidth();
        if (minWidth === -1 || minWidth - totalWidth < contentWidth) {
            totalWidth += contentWidth;
        } else {
            const remainingWidth = minWidth - totalWidth;
            const widthScale = remainingWidth / contentWidth;
            for (const column of tableData.getChildColumns()) {
                column.setComputeWidth(Math.floor(widthScale * column.getComputeWidth()));
            }
            totalWidth += remainingWidth;
        }
        return totalWidth;
    }

    private measureRowHeight(
        config: TableConfig,
        lineHeightArray: number[],
        column: Column,
        currentPosition: number,
        position: number
    ): void {
        let height = 0;
        if (column.getRanges() && column.getRanges().length > 0) {
            for (const range of column.getRanges()) {
                if (range && range.length === 2) {
                    if (range[0] <= position && range[1] >= position) {
                        height =
                            (column.getDrawFormat().measureHeight(column, range[0], config) +
                                2 * config.getVerticalPadding()) /
                            (range[1] - range[0] + 1);
                    }
                }
            }
        }
        if (height === 0) {
            height = column.getDrawFormat().measureHeight(column, position, config) + 2 * config.getVerticalPadding();
        }
        height = Math.max(column.getMinHeight(), height);
        if (height > lineHeightArray[currentPosition]) {
            lineHeightArray[currentPosition] = height;
        }
    }

    private measureColumnSize(tableData: TableData<T>): void {
        const columnList = tableData.getColumns();
        let left = 0;
        const maxLevel = tableData.getTableInfo().getMaxLevel();
        tableData.getColumnInfos().length = 0;
        tableData.getChildColumnInfos().length = 0;
        for (const column of columnList) {
            const top = 0;
            const columnInfo = this.getColumnInfo(tableData, column, null, left, top, maxLevel);
            left += columnInfo.width;
        }
    }

    public getColumnInfo(
        tableData: TableData<T>,
        column: Column,
        parent: ColumnInfo | null,
        left: number,
        top: number,
        overLevel: number
    ): ColumnInfo {
        const tableInfo = tableData.getTableInfo();
        const columnInfo = new ColumnInfo();
        columnInfo.value = column.getColumnName();
        columnInfo.column = column;
        columnInfo.setParent(parent);
        tableData.getColumnInfos().push(columnInfo);
        if (!column.isParent()) {
            columnInfo.width = column.getComputeWidth();
            columnInfo.top = top;
            columnInfo.height = tableInfo.getTitleHeight() * overLevel;
            tableData.getChildColumnInfos().push(columnInfo);
            columnInfo.left = left;
            return columnInfo;
        } else {
            const children = column.getChildren();
            const size = children.length;
            const level = column.getLevel();
            const height = (level === 2 ? overLevel - 1 : 1) * tableInfo.getTitleHeight();
            overLevel = level === 2 ? 1 : overLevel - 1;
            columnInfo.left = left;
            columnInfo.top = top;
            columnInfo.height = height;
            top += height;
            let width = 0;
            for (const child of children) {
                const childInfo = this.getColumnInfo(tableData, child, columnInfo, left, top, overLevel);
                width += childInfo.width;
                left += childInfo.width;
            }
            columnInfo.width = width;
        }
        return columnInfo;
    }

    public setOnMeasureListener(listener: OnMeasureListener): void {
        this.listener = listener;
    }
}
