import { TableConfig } from "../../form/core/TableConfig";
import type { CellInfo } from "../../form/data/CellInfo";
import type { Column } from "../../form/data/column/Column";
import { TextDrawFormat } from "../../form/data/format/draw/TextDrawFormat";
import { DrawUtils } from "../../form/utils/DrawUtils";
import { Paint, Rect, type Canvas, Align, CanvasImpl } from "../../form/utils/temp";
import { Icon, TextAlign, type Cell } from "../bean/Cell";
import { CellCache } from "../bean/CellCache";
import type { HecomTable } from "../HecomTable";
import type Locker from "../lock/Locker";

interface IDrawFormat<T> {
    measureWidth(column: Column<T>, position: number, config: TableConfig): number;
    measureHeight(column: Column<T>, position: number, config: TableConfig): number;
    draw(c: Canvas, rect: Rect, cellInfo: CellInfo<T>, config: TableConfig): void;
}

export class HecomTextDrawFormat extends TextDrawFormat<Cell> {

    locker: Locker;

    lockIcon: Icon = new Icon();

    drawPadding: number = 2;

    constructor() {
        super();
    }

    measureWidth(column: Column<Cell>, position: number, config: TableConfig): number {
        const result: CellCache = this.getCellCache(column, position, config);
        return Math.floor(result.getWidth());
    }

    measureHeight(column: Column<Cell>, position: number, config: TableConfig): number {
        const result: CellCache = this.getCellCache(column, position, config);
        return result.getHeight();
    }

    draw(c: Canvas, rect: Rect, cellInfo: CellInfo<Cell>, config: TableConfig): void {
        const icon: Icon = this.getIcon(cellInfo.column, cellInfo.row);

        rect.left +=  (this.getPaddingLeft(cellInfo.data, config) * config.getZoom());
        rect.right -=  (this.getPaddingRight(cellInfo.data, config) * config.getZoom());
        rect.top +=  (this.getPaddingTop(cellInfo.data, config) * config.getZoom());
        rect.bottom -= (this.getPaddingBottom(cellInfo.data, config) * config.getZoom());
        if (!icon) {
            this._hecomdrawText(c, rect, cellInfo, config);
            return;
        } else {

            const imgWidth = icon.getWidth() * config.getZoom();
            const imgHeight = icon.getHeight() * config.getZoom();
    
            let textWidth = 0;
            let drawPadding = 0;
            if (cellInfo.value.trim()?.length > 0) {
                drawPadding = this.drawPadding * config.getZoom();
            }
            let textAlign: TextAlign = TextAlign.CENTER;
            if (cellInfo.data.getTextAlignment() != undefined) {
                textAlign = cellInfo.data.getTextAlignment();
            }
            let imgRight = 0;
            let imgLeft = 0;
            let textRect;

            switch (icon.getDirection()) {//单元格icon的相对位置
                case Icon.LEFT:
                    textRect = new Rect(rect.left + (imgWidth + drawPadding), rect.top, rect.right,
                            rect.bottom);
                    this._hecomdrawText(c, textRect, cellInfo, config);
                    textWidth = (this.getDrawWidth(cellInfo) - icon.getWidth()) * config.getZoom();
                    switch (textAlign) { //单元格内容的对齐方式
                        case TextAlign.CENTER:
                            imgRight = Math.min(textRect.right,
                                    (textRect.right + textRect.left - textWidth) / 2) - drawPadding;
                            break;
                        case TextAlign.LEFT:
                            imgRight = textRect.left - drawPadding;
                            break;
                        case TextAlign.RIGHT:
                            imgRight = textRect.right - textWidth - drawPadding;
                            break;
                    }
                    textRect.set(imgRight - imgWidth, rect.top, imgRight, rect.bottom);
                    this.drawImg(c, textRect, cellInfo, config);
                    break;
                case Icon.RIGHT:
                    textRect = new Rect(rect.left, rect.top, rect.right - (imgWidth + drawPadding),
                            rect.bottom);
                    this._hecomdrawText(c, textRect, cellInfo, config);
                    textWidth = (this.getDrawWidth(cellInfo) - icon.getWidth()) * config.getZoom();
                    switch (textAlign) { //单元格内容的对齐方式
                        case TextAlign.CENTER:
                            imgLeft = Math.min(textRect.right,
                                    (textRect.right + textRect.left + textWidth) / 2) + drawPadding;
                            break;
                        case TextAlign.LEFT:
                            imgLeft = textRect.left + textWidth + drawPadding;
                            break;
                        case TextAlign.RIGHT:
                            imgLeft = textRect.right + drawPadding;
                            break;
                    }
                    textRect.set(imgLeft, rect.top, imgLeft + imgWidth, rect.bottom);
                    this.drawImg(c, textRect, cellInfo, config);
                    break;
                case Icon.TOP:
                    textRect = new Rect(rect.left, rect.top + (imgHeight + drawPadding) / 2, rect.right,
                            rect.bottom);
                    this._hecomdrawText(c, textRect, cellInfo, config);
                    const imgBottom: number = (rect.top + rect.bottom) / 2 - this.getDrawHeight(cellInfo) / 2 + drawPadding;
                    textRect.set(rect.left, imgBottom - imgHeight, rect.right, imgBottom);
                    this.drawImg(c, textRect, cellInfo, config);
                    break;
                case Icon.BOTTOM:
                    textRect = new Rect(rect.left, rect.top, rect.right, rect.bottom - (imgHeight +
                            drawPadding) / 2);
                    this._hecomdrawText(c, textRect, cellInfo, config);
                    const imgTop: number = (rect.top + rect.bottom) / 2 + this.getDrawHeight(cellInfo) / 2 - drawPadding;
                    textRect.set(rect.left, imgTop, rect.right, imgTop + imgHeight);
                    this.drawImg(c, textRect, cellInfo, config);
                    break;
    
            }
        }

    }

    _hecomdrawText(c: Canvas, rect: Rect, cellInfo: CellInfo<Cell>, config: TableConfig): void {
        const paint = config.getPaint();
        this.setTextPaint(config, cellInfo, paint);
        if (cellInfo.column.getTextAlign() != null) {
            paint.setTextAlign(cellInfo.column.getTextAlign());
        }
        // this.drawText(c, cellInfo.value, rect, paint);
        DrawUtils.drawMultiText(c, paint, rect, cellInfo.data?.getCache()?.getStrArr() || []);
    }

    drawImg(c: Canvas, rect: Rect, cellInfo: CellInfo<Cell>, config: TableConfig): void {
        const icon: Icon = this.getIcon(cellInfo.column, cellInfo.row);
        c.drawImage(icon.getResourceName(), rect, rect, config.getPaint());
    }

    getIcon(column: Column, position: number): Icon {
        if (this.locker?.needShowLockRowAndCol(position, column.getColumn())) {
            this.lockIcon.setWidth(16);
            this.lockIcon.setHeight(16);
            this.lockIcon.setDirection(Icon.RIGHT);
            if (column.isFixed()) {
                this.lockIcon.setResourceName('icon_lock');
            } else {
                this.lockIcon.setResourceName('icon_unlock');
            }
            return this.lockIcon;
        } else {
            const tmp = column.getDatas()[position].getIcon();
            if (!tmp) {
                return undefined;
            }
            const icon: Icon = new Icon();
            icon.setResourceName(tmp.name);
            icon.setWidth(tmp.width);
            icon.setHeight(tmp.height);
            icon.setName(tmp.name);
            if (tmp.imageAlignment === 0) {
                icon.setDirection(Icon.LEFT);
            } else if (tmp.imageAlignment === 2) {
                icon.setDirection(Icon.RIGHT);
            } else if (tmp.imageAlignment === 1) {
                icon.setDirection(Icon.TOP);
            }
            return icon;
        }
    }

    private getDrawWidth(cellInfo: CellInfo<Cell> ): number {
        return cellInfo.data?.getCache()?.getWidth() || 0;
    }

    private getDrawHeight(cellInfo: CellInfo<Cell> ): number {
        return cellInfo.data?.getCache()?.getHeight() || 0;
    }

    private getCellCache(column: Column<Cell>, position: number, config: TableConfig): CellCache {
        const cell: Cell = column.getDatas()?.[position];
        if (!cell.getCache()) {
            cell.setCache( this.measureText(column, position, config));
        }
        return cell.getCache();
    }

    private measureText(column: Column<Cell>, position: number, config: TableConfig): CellCache {
        const icon: Icon = this.getIcon(column, position);
        const cell: Cell = column.getDatas()?.[position];
        const charSequence: string = cell.getTitle();
        const textWidth: number = config.getPaint().measureText(charSequence);
        const paddingHorizontal: number = this.getPaddingLeft(cell, config) + this.getPaddingRight(cell,
                // 由于TableMeasure中计算宽度时会默认加上全局的水平padding，所以这里需要减去
                config) - config.getHorizontalPadding() * 2;
        let width = 0;
        if (!icon) {
            width = textWidth + paddingHorizontal;
        } else if (icon.getDirection() == Icon.LEFT || icon.getDirection() == Icon.RIGHT) {
            width = icon.getWidth() + textWidth + this.drawPadding + paddingHorizontal;
        } else {
            width = Math.max(icon.getWidth(), textWidth) + paddingHorizontal;
        }
        const height = config.getPaint().getTextSize() + 4; // 临时计算高度，后续需要替换
        const MAX_WIDTH = 120 + Math.max(0, cell?.getTextPaddingLeft() || 0) + Math.max(0, cell?.getTextPaddingRight() || 0); // 临时固定一个最大宽度，后续适配换行等功能
        if (width > MAX_WIDTH) {
            const maxTextWidth = this.getMaxTextWidth(icon, paddingHorizontal, MAX_WIDTH);
            const stringArr: string[] = config.getPaint().splitTextWithMaxWidth(charSequence, maxTextWidth);
            return new CellCache(charSequence, stringArr, MAX_WIDTH, height * stringArr?.length);
        } else {
            width = Math.min(width, MAX_WIDTH); 
            return new CellCache(charSequence, [charSequence], width, height);
        }
    }

    private getMaxTextWidth(icon: Icon, paddingHorizontal: number, maxWidth: number): number {
        if (!icon) {
            return maxWidth - paddingHorizontal;
        } else if (icon.getDirection() == Icon.LEFT || icon.getDirection() == Icon.RIGHT) {
            return maxWidth - icon.getWidth() - this.drawPadding - paddingHorizontal;
        } else {
            return maxWidth - paddingHorizontal;
        }
    }

    private getPaddingLeft( cell: Cell,  config: TableConfig): number {
        if (cell.getTextPaddingLeft() >= 0) {
            return cell.getTextPaddingLeft();
        }
        if (cell.getTextPaddingHorizontal() >= 0) {
            return cell.getTextPaddingHorizontal();
        }
        return config.getHorizontalPadding();
    }

    private getPaddingRight( cell: Cell,  config: TableConfig): number  {
        if (cell.getTextPaddingRight() >= 0) {
            return cell.getTextPaddingRight();
        }
        if (cell.getTextPaddingHorizontal() >= 0) {
            return cell.getTextPaddingHorizontal();
        }
        return config.getHorizontalPadding();
    }

    private getPaddingTop( cell: Cell,  config: TableConfig): number {
        return config.getVerticalPadding();
    }

    private getPaddingBottom( cell: Cell,  config: TableConfig): number  {
        return config.getVerticalPadding();
    }
}