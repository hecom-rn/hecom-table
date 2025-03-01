import { Paint, Style, PathEffect } from '../../utils/temp';
import type { IStyle } from './IStyle';

export class LineStyle implements IStyle {
    private width: number = -1;
    private color: string = '';
    private _isFill: boolean = false;
    private effect: PathEffect = new PathEffect();
    private static defaultLineSize: number = 2;
    private static defaultLineColor: string = '#e6e6e6';

    constructor(width?: number, color?: string) {
        if (width !== undefined) this.width = width;
        if (color !== undefined) this.color = color;
    }

    public static setDefaultLineSize(width: number): void {
        LineStyle.defaultLineSize = width;
    }

    public static setDefaultLineColor(color: string): void {
        LineStyle.defaultLineColor = color;
    }

    public getWidth(): number {
        return this.width === -1 ? LineStyle.defaultLineSize : this.width;
    }

    public setWidth(width: number): LineStyle {
        this.width = width;
        return this;
    }

    public getColor(): string {
        return this.color === '' ? LineStyle.defaultLineColor : this.color;
    }

    public setColor(color: string): LineStyle {
        this.color = color;
        return this;
    }

    public isFill(): boolean {
        return this._isFill;
    }

    public setFill(fill: boolean): LineStyle {
        this._isFill = fill;
        return this;
    }

    public setEffect(effect: PathEffect): LineStyle {
        this.effect = effect;
        return this;
    }

    public fillPaint(paint: Paint): void {
        paint.setColor(this.getColor());
        paint.setStyle(this._isFill ? Style.FILL : Style.STROKE);
        paint.setStrokeWidth(this.getWidth());
        paint.setPathEffect(this.effect);
    }
}
