import { TableConfig } from "../../form/core/TableConfig";
import type { CellInfo } from "../../form/data/CellInfo";
import type { Column } from "../../form/data/column/Column";
import { TextDrawFormat } from "../../form/data/format/draw/TextDrawFormat";
import { Paint, Rect, type Canvas, Align } from "../../form/utils/temp";
import { Icon, type Cell } from "../bean/Cell";
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
        if (!icon) {
            super.draw(c, rect, cellInfo, config);
            return;
        } else {
            const imgRect = new Rect(rect.centerX - icon.getWidth()/2, rect.centerY - icon.getHeight()/2, rect.centerX + icon.getWidth()/2, rect.centerY + icon.getHeight()/2);
            c.drawImage(icon.getResourceName(), imgRect, rect, config.getPaint());
        }

    }

    getIcon(column: Column, position: number): Icon {
        if (this.locker?.needShowLockRowAndCol(position, column.getColumn())) {
            this.lockIcon.setWidth(16);
            this.lockIcon.setHeight(16);
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
            return icon;
        }
    }

    // private drawText(c: Canvas, cellInfo: CellInfo<Cell>, rect: Rect, config: TableConfig): number {
    //     this.setTextPaint(config, cellInfo.data, this.mTextPaint, true);
    //     const result: CellCache = this.getCellCache(cellInfo.column, cellInfo.row, this.mTextPaint, config);
    //     const saveCount: number = c.saveCount;
    //     c.save();
        
    //     const textAlign: PaintAlign = this.mTextPaint.textAlign;
    //     this.mTextPaint.textAlign = PaintAlign.Left;

    //     let align: LayoutAlignment;
    //     switch (textAlign) {
    //         case Align.LEFT:
    //         default:
    //             align = LayoutAlignment.ALIGN_NORMAL;
    //             break;
    //         case Align.CENTER:
    //             align = LayoutAlignment.ALIGN_CENTER;
    //             break;
    //         case Align.RIGHT:
    //             align = LayoutAlignment.ALIGN_OPPOSITE;
    //             break;
    //     }

    //     const layout: StaticLayout = new StaticLayout(
    //         result.text,
    //         this.mTextPaint,
    //         rect.width(),
    //         align,
    //         1.0,
    //         0.0,
    //         false
    //     );

    //     const dy: number = (rect.height() - layout.height) / 2;
    //     c.clipRect(rect);
    //     c.translate(rect.left, rect.top + dy);
    //     layout.draw(c);
    //     c.restoreToCount(saveCount);

    //     return layout.lineWidths.reduce((max, curr) => Math.max(max, curr), 0);
    // }

    // private setTextPaint(config: TableConfig, cell: Cell, paint: Paint, onDraw: boolean): void {
    //     config.getContentStyle().fillPaint(paint);
    //     paint.setTextSize(this.getFontSize(config, cell) * (onDraw ? config.getZoom() : 1));
        
    //     if (cell.getTextColor() !== TableConfig.INVALID_COLOR) {
    //         paint.setColor(cell.getTextColor());
    //     }
        
    //     paint.isFakeBoldText = cell.isOverstriking();
    //     if (cell.getTextAlignment()) {
    //         paint.setTextAlign(cell.getTextAlignment());
    //     }
    //     paint.isStrikeThruText = cell.isStrikethrough();
    // }

    private getCellCache(column: Column<Cell>, position: number, config: TableConfig): CellCache {
        const cell: Cell = column.getDatas()?.[position];
        if (!cell.getCache()) {
            cell.setCache( this.measureText(column, position, config));
        }
        return cell.getCache();
    }

    private measureText(column: Column<Cell>, position: number, config: TableConfig): CellCache {
        const cell: Cell = column.getDatas()?.[position];
        // const maxWidth: number = this.cellDrawFormat.getMaxTextWidth(column, position, config);
        // const charSequence: SpannableStringBuilder = this.getSpan(cell, config, paint, maxWidth);
        
        const charSequence = cell.getTitle();
        const width = 60;
        const height = 30;

        return new CellCache(charSequence, width, height);
    }

}