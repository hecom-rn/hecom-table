import { TableConfig } from '../../form/core/TableConfig';
import { FontStyle } from '../../form/data/style/FontStyle';
import type { Paint } from '../../form/utils/Paint';

export class HecomStyle extends FontStyle {
    private _isOverstriking: boolean = false;
    private backgroundColor: string = TableConfig.INVALID_COLOR; // 假设 INVALID_COLOR 是一个字符串常量
    private lineColor: string = TableConfig.INVALID_COLOR;
    private paddingHorizontal: number = 0;

    public getPaddingHorizontal(): number {
        return this.paddingHorizontal;
    }

    public setPaddingHorizontal(paddingHorizontal: number): void {
        this.paddingHorizontal = paddingHorizontal;
    }

    public getLineColor(): string {
        return this.lineColor;
    }

    public setLineColor(lineColor: string): void {
        this.lineColor = lineColor;
    }

    public isOverstriking(): boolean {
        return this._isOverstriking;
    }

    public setOverstriking(overstriking: boolean): void {
        this._isOverstriking = overstriking;
    }

    public getBackgroundColor(): string {
        return this.backgroundColor;
    }

    public setBackgroundColor(backgroundColor: string): void {
        this.backgroundColor = backgroundColor;
    }

    /**
     * 填充画笔样式
     * @param context Canvas 2D 上下文
     */
    public fillPaint(paint: Paint): void {
        super.fillPaint(paint); // 假设 FontStyle 也有类似方法
    }
}
