import { Align, type Canvas, Paint, Rect } from '../../../utils/temp';
import { TableConfig } from '../../../core/TableConfig';
import { CellInfo } from '../../CellInfo';
import { Column } from '../../column/Column';
import { DrawUtils } from '../../../utils/DrawUtils';
import type { IDrawFormat } from './IDrawFormat';
import { Cell, TextAlign } from '../../../../table/bean/Cell';

export class TextDrawFormat<T> implements IDrawFormat<T> {
    protected valueMap: Map<string, string[]>;

    constructor() {
        this.valueMap = new Map();
    }

    measureWidth(column: Column<T>, position: number, config: TableConfig): number {
        const paint = config.getPaint();
        config.getContentStyle().fillPaint(paint);
        return DrawUtils.getMultiTextWidth(paint, this.getSplitString(column.format(position)));
    }

    measureHeight(column: Column<T>, position: number, config: TableConfig): number {
        const paint = config.getPaint();
        config.getContentStyle().fillPaint(paint);
        return DrawUtils.getMultiTextHeight(paint, this.getSplitString(column.format(position)));
    }

    draw(c: Canvas, rect: Rect, cellInfo: CellInfo<T>, config: TableConfig): void {
        const paint = config.getPaint();
        this.setTextPaint(config, cellInfo, paint);
        if (cellInfo.column.getTextAlign() != null) {
            paint.setTextAlign(cellInfo.column.getTextAlign());
        }
        this.drawText(c, cellInfo.value, rect, paint);
    }

    protected drawText(c: Canvas, value: string, rect: Rect, paint: Paint): void {
        DrawUtils.drawMultiText(c, paint, rect, this.getSplitString(value));
    }

    setTextPaint(config: TableConfig, cellInfo: CellInfo<T>, paint: Paint): void {
        config.getContentStyle().fillPaint(paint);
        const backgroundFormat = config.getContentCellBackgroundFormat();
        if (backgroundFormat != null && backgroundFormat.getTextColor(cellInfo) !== TableConfig.INVALID_COLOR) {
            paint.setColor(backgroundFormat.getTextColor(cellInfo));
        }
        if (cellInfo.data instanceof Cell) {
            switch ((cellInfo.data as Cell).getTextAlignment()) {
                case TextAlign.LEFT:
                    paint.setTextAlign(Align.LEFT);
                    break;
                case TextAlign.RIGHT:
                    paint.setTextAlign(Align.RIGHT);
                    break;
                case TextAlign.CENTER:
                    paint.setTextAlign(Align.CENTER);
                    break;
            }
            
        }
        paint.setTextSize(paint.getTextSize() * config.getZoom());
    }

    protected getSplitString(val: string): string[] {
        let values = this.valueMap.get(val);
        if (values == null) {
            values = val.split('\n');
            this.valueMap.set(val, values);
        }
        return values;
    }
}
