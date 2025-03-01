import { type Canvas, Rect, Style } from '../utils/temp';
import { type IComponent } from './IComponent';
import { TableData } from '../data/table/TableData';
import { TableConfig } from '../core/TableConfig';
import { DrawUtils } from '../utils/DrawUtils';
import type { ISequenceFormat } from '../data/format/sequence/ISequenceFormat';

export class YSequence<T> implements IComponent<TableData<T>> {
    private rect: Rect;
    private width: number;
    private clipWidth: number;
    private scaleRect: Rect;
    private format: ISequenceFormat;
    private tempRect: Rect; // 临时使用

    constructor() {
        this.rect = new Rect();
        this.tempRect = new Rect();
    }

    public onMeasure(scaleRect: Rect, showRect: Rect, config: TableConfig): void {
        this.scaleRect = scaleRect;
        const scaleWidth = Math.floor(this.width * (config.getZoom() > 1 ? 1 : config.getZoom()));
        const fixed = config.isFixedYSequence();
        this.rect.top = scaleRect.top;
        this.rect.bottom = scaleRect.bottom;
        this.rect.left = fixed ? showRect.left : scaleRect.left;
        this.rect.right = this.rect.left + scaleWidth;
        if (fixed) {
            scaleRect.left += scaleWidth;
            showRect.left += scaleWidth;
            this.clipWidth = scaleWidth;
        } else {
            const disX = showRect.left - scaleRect.left;
            this.clipWidth = Math.max(0, scaleWidth - disX);
            showRect.left += this.clipWidth;
            scaleRect.left += scaleWidth;
        }
    }

    public onDraw(canvas: Canvas, showRect: Rect, tableData: TableData<T>, config: TableConfig): void {
        this.format = tableData.getYSequenceFormat();
        const hZoom = config.getZoom() > 1 ? 1 : config.getZoom();
        const totalSize = tableData.getLineSize();
        const info = tableData.getTableInfo();
        const topHeight = info.getTopHeight(hZoom);
        let top = this.rect.top + topHeight;
        const showLeft = showRect.left - this.clipWidth;
        const isFixTop = config.isFixedXSequence();
        const showTop = isFixTop ? showRect.top + topHeight : showRect.top;
        let num = 0;
        let tempTop = top;
        const isFixedTitle = config.isFixedTitle();
        const isFixedCount = config.isFixedCountRow();
        if (isFixedTitle) {
            let clipHeight;
            if (isFixTop) {
                clipHeight = info.getTopHeight(hZoom);
            } else {
                const disY = showRect.top - this.scaleRect.top;
                clipHeight = Math.max(0, topHeight - disY);
            }
            tempTop = showRect.top + clipHeight;
        }

        this.tempRect.set(showLeft, tempTop - topHeight, showRect.left, tempTop);
        this.drawLeftAndTop(canvas, showRect, this.tempRect, config);
        canvas.save();
        canvas.clipRect(showLeft, showTop, showRect.left, showRect.bottom);
        this.drawBackground(canvas, showRect, config, showLeft, showTop);
        if (config.isShowColumnTitle()) {
            for (let i = 0; i < info.getMaxLevel(); i++) {
                num++;
                const bottom = tempTop + info.getTitleHeight();
                if (DrawUtils.isVerticalMixRect(showRect, top, bottom)) {
                    this.tempRect.set(this.rect.left, tempTop, this.rect.right, bottom);
                    this.draw(canvas, this.tempRect, num, config);
                }
                tempTop = bottom;
                top += info.getTitleHeight();
            }
        }
        let tempBottom = showRect.bottom;
        if (tableData.isShowCount() && isFixedCount) {
            const bottom = Math.min(showRect.bottom, this.scaleRect.bottom);
            tempBottom = bottom - info.getCountHeight();
            this.tempRect.set(this.rect.left, tempBottom, this.rect.right, bottom);
            this.draw(canvas, this.tempRect, num + totalSize + 1, config);
        }
        if (isFixedTitle || isFixedCount) {
            canvas.save();
            canvas.clipRect(showLeft, tempTop, showRect.left, tempBottom);
        }
        for (let i = 0; i < totalSize; i++) {
            num++;
            const bottom = top + info.getLineHeightArray()[i] * config.getZoom();
            if (showRect.bottom >= this.rect.top) {
                if (DrawUtils.isVerticalMixRect(showRect, top, bottom)) {
                    this.tempRect.set(this.rect.left, top, this.rect.right, bottom);
                    this.draw(canvas, this.tempRect, num, config);
                }
            } else {
                break;
            }
            top = bottom;
        }
        if (tableData.isShowCount() && !isFixedCount) {
            num++;
            const bottom = top + info.getCountHeight();
            if (DrawUtils.isVerticalMixRect(showRect, top, bottom)) {
                this.tempRect.set(this.rect.left, top, this.rect.right, bottom);
                this.draw(canvas, this.rect, num, config);
            }
        }
        if (isFixedTitle || isFixedCount) {
            canvas.restore();
        }
        canvas.restore();
    }

    protected drawBackground(
        canvas: Canvas,
        showRect: Rect,
        config: TableConfig,
        showLeft: number,
        showTop: number
    ): void {
        if (config.getYSequenceBackground() != null) {
            this.tempRect.set(
                showLeft,
                Math.max(this.scaleRect.top, showTop),
                showRect.left,
                Math.min(this.scaleRect.bottom, showRect.bottom)
            );
            config.getYSequenceBackground().drawBackground(canvas, this.tempRect, config.getPaint());
        }
    }

    private drawLeftAndTop(canvas: Canvas, showRect: Rect, rect: Rect, config: TableConfig): void {
        canvas.save();
        canvas.clipRect(Math.max(this.rect.left, rect.left), showRect.top, showRect.left, rect.bottom);
        const paint = config.getPaint();
        if (config.getLeftAndTopBackgroundColor() !== TableConfig.INVALID_COLOR) {
            paint.setStyle(Style.FILL);
            paint.setColor(config.getLeftAndTopBackgroundColor());
            canvas.drawRect(rect, paint);
        }
        if (config.getTableGridFormat() != null) {
            config.getSequenceGridStyle().fillPaint(paint);
            config.getTableGridFormat().drawLeftAndTopGrid(canvas, rect, paint);
        }
        const format = config.getLeftTopDrawFormat();
        if (format != null) {
            format.setImageSize(rect.width, rect.height);
            config.getLeftTopDrawFormat().draw(canvas, rect, null, config);
        }
        canvas.restore();
    }

    private draw(canvas: Canvas, rect: Rect, position: number, config: TableConfig): void {
        const paint = config.getPaint();
        const backgroundFormat = config.getYSequenceCellBgFormat();
        let textColor = TableConfig.INVALID_COLOR;
        if (backgroundFormat != null) {
            backgroundFormat.drawBackground(canvas, rect, position, config.getPaint());
            textColor = backgroundFormat.getTextColor(position);
        }
        if (config.getTableGridFormat() != null) {
            config.getSequenceGridStyle().fillPaint(paint);
            config.getTableGridFormat().drawYSequenceGrid(canvas, position, rect, paint);
        }
        config.getYSequenceStyle().fillPaint(paint);

        if (textColor != TableConfig.INVALID_COLOR) {
            paint.setColor(textColor);
        }
        this.format.draw(canvas, position - 1, rect, config);
    }

    public getWidth(): number {
        return this.width;
    }

    public setWidth(width: number): void {
        this.width = width;
    }

    public getRect(): Rect {
        return this.rect;
    }
}
