import type { TableConfig } from '../core/TableConfig';
import { CellInfo } from '../data/CellInfo';
import type { Column } from '../data/column/Column';
import type { ColumnInfo } from '../data/column/ColumnInfo';
import type { IDrawOver } from '../data/format/selected/IDrawOver';
import type { ITip } from '../data/format/tip/ITip';
import type { TableData } from '../data/table/TableData';
import type { OnColumnClickListener } from '../listener/OnColumnClickListener';
import type { TableClickObserver } from '../listener/TableClickObserver';
import { type Canvas, PointF, Rect } from '../utils/temp';
import { GridDrawer } from './GridDrawer';
import { SelectionOperation } from './SelectionOperation';
import { DrawUtils } from '../utils/DrawUtils';
import type { ISelectFormat } from '../data/format/selected/ISelectFormat';
import type { MatrixHelper } from '../matrix/MatrixHelper';

/**
 * Created by huang on 2017/11/1. 表格内容绘制
 */
export class TableProvider<T> implements TableClickObserver {
    private scaleRect: Rect;
    private showRect: Rect;
    private config: TableConfig;
    private clickPoint: PointF;
    private clickColumnInfo: ColumnInfo;
    private isClickPoint: boolean;
    private onColumnClickListener: OnColumnClickListener;
    private operation: SelectionOperation;
    private tableData: TableData<T>;
    private tip: ITip<Column, any>;
    private clipRect: Rect;
    private tempRect: Rect;
    private tipColumn: Column;
    private tipPosition: number;
    private gridDrawer: GridDrawer<T>;
    private tipPoint: PointF = new PointF();
    private drawOver: IDrawOver;
    private cellInfo: CellInfo = new CellInfo();
    private mMatrixHelper: MatrixHelper;
    private singleClickItem: boolean = false;

    constructor() {
        this.clickPoint = new PointF(-1, -1);
        this.clipRect = new Rect();
        this.tempRect = new Rect();
        this.operation = new SelectionOperation();
        this.gridDrawer = new GridDrawer<T>();
    }

    public onDraw(canvas: Canvas, scaleRect: Rect, showRect: Rect, tableData: TableData<T>, config: TableConfig): void {
        this.setData(scaleRect, showRect, tableData, config);
        canvas.clear();
        canvas.save();
        canvas.clipRect(this.showRect);
        this.drawColumnTitle(canvas, config);
        this.drawCount(canvas);
        this.drawContent(canvas, false);
        this.drawContent(canvas, true);
        this.operation.draw(canvas, showRect, config);
        if (this.drawOver) this.drawOver.draw(canvas, scaleRect, showRect, config);
        canvas.restore();
        if (this.isClickPoint && this.clickColumnInfo) {
            this.onColumnClickListener(this.clickColumnInfo);
        }
        if (this.tipColumn) {
            this.drawTip(canvas, this.tipPoint.x, this.tipPoint.y, this.tipColumn, this.tipPosition);
        }
    }

    private setData(scaleRect: Rect, showRect: Rect, tableData: TableData<T>, config: TableConfig): void {
        this.isClickPoint = false;
        this.clickColumnInfo = null;
        this.tipColumn = null;
        this.operation.reset();
        this.scaleRect = scaleRect;
        this.showRect = showRect;
        this.config = config;
        this.tableData = tableData;
        this.gridDrawer.setTableData(tableData);
    }

    private drawColumnTitle(canvas: Canvas, config: TableConfig): void {
        if (config.isShowColumnTitle()) {
            if (config.isFixedTitle()) {
                this.drawTitle(canvas);
                canvas.restore();
                canvas.save();
                canvas.clipRect(this.showRect);
            } else {
                this.drawTitle(canvas);
            }
        }
    }

    private drawCount(canvas: Canvas): void {
        if (this.tableData.isShowCount()) {
            let left = this.scaleRect.left;
            let bottom = this.config.isFixedCountRow()
                ? Math.min(this.scaleRect.bottom, this.showRect.bottom)
                : this.scaleRect.bottom;
            let countHeight = this.tableData.getTableInfo().getCountHeight();
            let top = bottom - countHeight;
            if (this.config.getCountBackground()) {
                this.tempRect.set(left, top, this.showRect.right, bottom);
                this.config.getCountBackground().drawBackground(canvas, this.tempRect, this.config.getPaint());
            }
            let childColumnInfos = this.tableData.getChildColumnInfos();
            if (DrawUtils.isVerticalMixRect(this.showRect, top, bottom)) {
                let columns = this.tableData.getChildColumns();
                let columnSize = columns.length;
                let isPerColumnFixed = false;
                this.clipRect.set(this.showRect);
                let clipCount = 0;
                for (let i = 0; i < columnSize; i++) {
                    let column = columns[i];
                    let tempLeft = left;
                    let width = column.getComputeWidth() * this.config.getZoom();
                    if (childColumnInfos[i].getTopParent().column.isFixed()) {
                        if (left < this.clipRect.left) {
                            left = this.clipRect.left;
                            this.clipRect.left += width;
                            isPerColumnFixed = true;
                        }
                    } else if (isPerColumnFixed) {
                        canvas.save();
                        clipCount++;
                        canvas.clipRect(
                            this.clipRect.left,
                            this.showRect.bottom - countHeight,
                            this.showRect.right,
                            this.showRect.bottom
                        );
                    }
                    this.tempRect.set(left, top, left + width, bottom);
                    this.drawCountText(canvas, column, i, this.tempRect, column.getTotalNumString(), this.config);
                    left = tempLeft;
                    left += width;
                }
                for (let i = 0; i < clipCount; i++) {
                    canvas.restore();
                }
            }
        }
    }

    private drawTitle(canvas: Canvas): void {
        let dis = this.showRect.top - this.scaleRect.top;
        let tableInfo = this.tableData.getTableInfo();
        let titleHeight = tableInfo.getTitleHeight() * tableInfo.getMaxLevel();
        let clipHeight = this.config.isFixedTitle() ? titleHeight : Math.max(0, titleHeight - dis);
        if (this.config.getColumnTitleBackground()) {
            this.tempRect.set(
                this.showRect.left,
                this.showRect.top,
                this.showRect.right,
                this.showRect.top + clipHeight
            );
            this.config.getColumnTitleBackground().drawBackground(canvas, this.tempRect, this.config.getPaint());
        }
        this.clipRect.set(this.showRect);
        let columnInfoList = this.tableData.getColumnInfos();
        let zoom = this.config.getZoom();
        let isPerColumnFixed = false;
        let clipCount = 0;
        let parentColumnInfo: ColumnInfo = null;
        for (let info of columnInfoList) {
            let left = info.left * zoom + this.scaleRect.left;
            if (info.top === 0 && info.column.isFixed()) {
                if (left < this.clipRect.left) {
                    parentColumnInfo = info;
                    left = this.clipRect.left;
                    this.fillColumnTitle(canvas, info, left);
                    this.clipRect.left += info.width * zoom;
                    isPerColumnFixed = true;
                    continue;
                }
            } else if (isPerColumnFixed && info.top !== 0) {
                left = this.clipRect.left - info.width * zoom;
                left += info.left - parentColumnInfo.left;
            } else if (isPerColumnFixed) {
                canvas.save();
                canvas.clipRect(
                    this.clipRect.left,
                    this.showRect.top,
                    this.showRect.right,
                    this.showRect.top + clipHeight
                );
                isPerColumnFixed = false;
                clipCount++;
            }
            this.fillColumnTitle(canvas, info, left);
        }
        for (let i = 0; i < clipCount; i++) {
            canvas.restore();
        }
        if (this.config.isFixedTitle()) {
            this.scaleRect.top += titleHeight;
            this.showRect.top += titleHeight;
        } else {
            this.showRect.top += clipHeight;
            this.scaleRect.top += titleHeight;
        }
    }

    private fillColumnTitle(canvas: Canvas, info: ColumnInfo, left: number): void {
        let top =
            info.top * this.config.getZoom() + (this.config.isFixedTitle() ? this.showRect.top : this.scaleRect.top);
        let right = left + info.width * this.config.getZoom();
        let bottom = top + info.height * this.config.getZoom();
        if (DrawUtils.isMixRect(this.showRect, left, top, right, bottom)) {
            if (!this.isClickPoint && this.onColumnClickListener) {
                if (DrawUtils.isClick(this.clickPoint, left, top, right, bottom)) {
                    this.isClickPoint = true;
                    this.clickColumnInfo = info;
                    this.clickPoint.set(-1, -1);
                }
            }
            let paint = this.config.getPaint();
            this.tempRect.set(left, top, right, bottom);
            if (this.config.getTableGridFormat()) {
                this.config.getColumnTitleGridStyle().fillPaint(paint);
                let position = this.tableData.getChildColumns().indexOf(info.column);
                this.config
                    .getTableGridFormat()
                    .drawColumnTitleGrid(canvas, this.tempRect, info.column, position, paint);
            }
            this.tableData.getTitleDrawFormat().draw(canvas, info.column, this.tempRect, this.config);
        }
    }

    private drawContent(canvas: Canvas, onlyDrawFrozenRows: boolean): void {
        let top: number;
        let left = this.scaleRect.left;
        let columns = this.tableData.getChildColumns();
        this.clipRect.set(this.showRect);
        let info = this.tableData.getTableInfo();
        let columnSize = columns.length;
        let dis = this.config.isFixedCountRow()
            ? info.getCountHeight()
            : this.showRect.bottom + info.getCountHeight() - this.scaleRect.bottom;
        let fillBgBottom = this.showRect.bottom - Math.max(dis, 0);
        if (this.config.getContentBackground()) {
            this.tempRect.set(this.showRect.left, this.showRect.top, this.showRect.right, fillBgBottom);
            this.config.getContentBackground().drawBackground(canvas, this.tempRect, this.config.getPaint());
        }
        if (this.config.isFixedCountRow()) {
            canvas.save();
            canvas.clipRect(
                this.showRect.left,
                this.showRect.top,
                this.showRect.right,
                this.showRect.bottom - info.getCountHeight()
            );
        }
        let childColumnInfo = this.tableData.getChildColumnInfos();
        let isPerFixed = false;
        let clipCount = 0;
        let correctCellRect: Rect;
        let tableInfo = this.tableData.getTableInfo();
        let mMinFixedWidth = 0;
        let totalFixedWidth = 0;
        for (let columnIndex = 0; columnIndex < columnSize; columnIndex++) {
            let column = columns[columnIndex];
            if (column.isFixed()) {
                mMinFixedWidth = column.getComputeWidth() * this.config.getZoom();
                totalFixedWidth += mMinFixedWidth;
            } else {
                break;
            }
        }
        let fixedReactLeftInit = false;
        let mFixedReactLeft = 0,
            mFixedReactRight = 0;
        let mFixedTranslateX = this.mMatrixHelper.mFixedTranslateX;
        if (mFixedTranslateX > totalFixedWidth - mMinFixedWidth) {
            mFixedTranslateX = totalFixedWidth - mMinFixedWidth;
            this.mMatrixHelper.mFixedTranslateX = mFixedTranslateX;
        }
        if (mFixedTranslateX < 0) {
            mFixedTranslateX = 0;
            this.mMatrixHelper.mFixedTranslateX = mFixedTranslateX;
        }
        let isFixedTranslateX = mFixedTranslateX > 0;
        if (isFixedTranslateX) {
            this.clipRect.left -= mFixedTranslateX;
        }
        let fixedRowHeight = this.showRect.top;
        for (let k = 0; k < this.config.getFixedLines(); k++) {
            let lineHeight = info.getLineHeightArray()[k];
            fixedRowHeight += lineHeight * this.config.getZoom();
        }
        for (let i = 0; i < columnSize; i++) {
            top = onlyDrawFrozenRows ? 0 : this.scaleRect.top;
            let column = columns[i];
            let width = column.getComputeWidth() * this.config.getZoom();
            let tempLeft = left;
            let topColumn = childColumnInfo[i].getTopParent().column;
            canvas.clipRect(this.clipRect);
            if (topColumn.isFixed()) {
                isPerFixed = false;
                if (tempLeft < this.clipRect.left) {
                    left = this.clipRect.left;
                    this.clipRect.left += width;
                    isPerFixed = true;
                }
            } else if (isPerFixed) {
                canvas.save();
                canvas.clipRect(this.clipRect);
                isPerFixed = false;
                clipCount++;
            }
            let right = left + width;
            if (left < this.showRect.right) {
                let size = column.getDatas().length;
                let realPosition = 0;
                if (column.isFixed()) {
                    if (!fixedReactLeftInit) {
                        mFixedReactLeft = left;
                        fixedReactLeftInit = true;
                    }
                    mFixedReactRight = right;
                }
                for (let j = 0; j < size; j++) {
                    let value = column.format(j);
                    let skip = tableInfo.getSeizeCellSize(column, j);
                    let totalLineHeight = 0;
                    for (let k = realPosition; k < realPosition + skip; k++) {
                        totalLineHeight += info.getLineHeightArray()[k];
                    }
                    realPosition += skip;
                    let bottom = top + totalLineHeight * this.config.getZoom();
                    this.tempRect.set(left, top, right, bottom);
                    correctCellRect = this.gridDrawer.correctCellRect(j, i, this.tempRect, this.config.getZoom());
                    if (correctCellRect) {
                        if (correctCellRect.top < this.showRect.bottom) {
                            if (
                                correctCellRect.left < this.showRect.right &&
                                correctCellRect.right > this.showRect.left &&
                                correctCellRect.bottom > this.showRect.top
                            ) {
                                let data = column.getDatas()[j];
                                if (
                                    this.singleClickItem &&
                                    ((onlyDrawFrozenRows && this.clickPoint.y < fixedRowHeight) ||
                                        (!onlyDrawFrozenRows && this.clickPoint.y >= fixedRowHeight)) &&
                                    DrawUtils.isClick(this.clickPoint, correctCellRect)
                                ) {
                                    this.operation.setSelectionRect(i, j, correctCellRect);
                                    this.tipPoint.x = (left + right) / 2;
                                    this.tipPoint.y = (top + bottom) / 2;
                                    this.tipColumn = column;
                                    this.tipPosition = j;
                                    this.singleClickItem = false;
                                    this.clickColumn(column, j, value, data);
                                    this.isClickPoint = true;
                                    this.clickPoint.set(-Number.MAX_VALUE, -Number.MAX_VALUE);
                                    this.singleClickItem = false;
                                }
                                this.operation.checkSelectedPoint(i, j, correctCellRect);
                                this.cellInfo.set(column, data, value, i, j);
                                if (onlyDrawFrozenRows && j < this.config.getFixedLines()) {
                                    this.drawContentCell(canvas, this.cellInfo, correctCellRect, this.config);
                                } else if (!onlyDrawFrozenRows && j >= this.config.getFixedLines()) {
                                    if (correctCellRect.top >= fixedRowHeight) {
                                        correctCellRect.bottom = Math.min(correctCellRect.bottom, this.showRect.bottom);
                                        this.drawContentCell(canvas, this.cellInfo, correctCellRect, this.config);
                                    } else if (correctCellRect.bottom > fixedRowHeight) {
                                        correctCellRect.top = fixedRowHeight;
                                        correctCellRect.bottom = Math.min(correctCellRect.bottom, this.showRect.bottom);
                                        this.drawContentCell(canvas, this.cellInfo, correctCellRect, this.config);
                                    }
                                }
                            }
                        } else {
                            break;
                        }
                    }
                    top = bottom;
                }
                left = tempLeft + width;
            } else {
                break;
            }
        }
        for (let i = 0; i < clipCount; i++) {
            canvas.restore();
        }
        if (this.config.isFixedCountRow()) {
            canvas.restore();
        }
        this.mMatrixHelper.setFixedReactLeft(mFixedReactLeft);
        this.mMatrixHelper.setFixedReactRight(mFixedReactRight);
    }

    protected drawContentCell(canvas: Canvas, cellInfo: CellInfo<T>, rect: Rect, config: TableConfig): void {
        if (config.getContentCellBackgroundFormat()) {
            config.getContentCellBackgroundFormat().drawBackground(canvas, rect, cellInfo, config.getPaint());
        }
        if (config.getTableGridFormat()) {
            config.getContentGridStyle().fillPaint(config.getPaint());
            config
                .getTableGridFormat()
                .drawContentGrid(canvas, cellInfo.col, cellInfo.row, rect, cellInfo, config.getPaint());
        }
        rect.left += config.getTextLeftOffset();
        cellInfo.column.getDrawFormat().draw(canvas, rect, cellInfo, config);
    }

    private clickColumn(column: Column, position: number, value: string, data: any): void {
        if (!this.isClickPoint && column.getOnColumnItemClickListener()) {
            column.getOnColumnItemClickListener()(column, value, data, position);
        }
    }

    private drawTip(canvas: Canvas, x: number, y: number, column: Column, position: number): void {
        if (this.tip) {
            this.tip.drawTip(canvas, x, y, this.showRect, column, position);
        }
    }

    private drawCountText(
        canvas: Canvas,
        column: Column,
        position: number,
        rect: Rect,
        text: string,
        config: TableConfig
    ): void {
        let paint = config.getPaint();
        let backgroundFormat = config.getCountBgCellFormat();
        if (backgroundFormat) {
            backgroundFormat.drawBackground(canvas, rect, column, config.getPaint());
        }
        if (config.getTableGridFormat()) {
            config.getContentGridStyle().fillPaint(paint);
            config.getTableGridFormat().drawCountGrid(canvas, position, rect, column, paint);
        }
        config.getCountStyle().fillPaint(paint);
        if (backgroundFormat && backgroundFormat.getTextColor(column) !== TableConfig.INVALID_COLOR) {
            paint.setColor(backgroundFormat.getTextColor(column));
        }
        paint.setTextSize(paint.getTextSize() * config.getZoom());
        if (column.getTextAlign()) {
            paint.setTextAlign(column.getTextAlign());
        }
        canvas.drawText(
            text,
            DrawUtils.getTextCenterX(rect.left, rect.right, paint),
            DrawUtils.getTextCenterY(rect.centerY, paint),
            paint
        );
    }

    public onClick(x: number, y: number): void {
        this.clickPoint.x = x;
        this.clickPoint.y = y;
        this.singleClickItem = true;
    }

    public getOnColumnClickListener(): OnColumnClickListener {
        return this.onColumnClickListener;
    }

    public setOnColumnClickListener(onColumnClickListener: OnColumnClickListener): void {
        this.onColumnClickListener = onColumnClickListener;
    }

    public getTip(): ITip<Column, any> {
        return this.tip;
    }

    public setTip(tip: ITip<Column, any>): void {
        this.tip = tip;
    }

    public setSelectFormat(selectFormat: ISelectFormat): void {
        this.operation.setSelectFormat(selectFormat);
    }

    public getGridDrawer(): GridDrawer<T> {
        return this.gridDrawer;
    }

    public setGridDrawer(gridDrawer: GridDrawer<T>): void {
        this.gridDrawer = gridDrawer;
    }

    /**
     * 计算任何point在View的位置
     *
     * @param row 列
     * @param col 行
     */
    public getPointLocation(row: number, col: number): number[] {
        const childColumns = this.tableData.getChildColumns();
        const lineHeights = this.tableData.getTableInfo().getLineHeightArray();
        let x = 0,
            y = 0;
        const columnSize = childColumns.length;
        for (let i = 0; i <= (columnSize > col + 1 ? col + 1 : columnSize - 1); i++) {
            const w = childColumns[i].getComputeWidth();
            if (i === Math.floor(col) + 1) {
                x += w * (col - Math.floor(col));
            } else {
                x += w;
            }
        }
        for (let i = 0; i <= (lineHeights.length > row + 1 ? row + 1 : lineHeights.length - 1); i++) {
            const h = lineHeights[i];
            if (i === Math.floor(row) + 1) {
                y += h * (row - Math.floor(row));
            } else {
                y += h;
            }
        }
        x *= this.config.getZoom();
        y *= this.config.getZoom();
        x += this.scaleRect.left;
        y += this.scaleRect.top;
        return [x, y];
    }

    /**
     * 计算任何point在View的大小
     *
     * @param row 列
     * @param col 行
     */
    public getPointSize(row: number, col: number): number[] {
        const childColumns = this.tableData.getChildColumns();
        const lineHeights = this.tableData.getTableInfo().getLineHeightArray();
        col = col < childColumns.length ? col : childColumns.length - 1; // 列
        row = row < lineHeights.length ? row : lineHeights.length; // 行
        col = col < 0 ? 0 : col;
        row = row < 0 ? 0 : row;
        return [
            Math.round(childColumns[col].getComputeWidth() * this.config.getZoom()),
            Math.round(lineHeights[row] * this.config.getZoom()),
        ];
    }

    /**
     * 设置表面绘制
     */
    public setDrawOver(drawOver: IDrawOver): void {
        this.drawOver = drawOver;
    }

    public getOperation(): SelectionOperation {
        return this.operation;
    }

    public setMatrixHelper(matrixHelper: MatrixHelper): void {
        this.mMatrixHelper = matrixHelper;
    }
}
