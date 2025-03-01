import { TableConfig } from '../../form/core/TableConfig';

export class ProgressStyle {
    private colors?: string[]; // 横向渐变
    private height: number; // 高度，居中显示
    private radius: number; // 圆角半径
    private marginHorizontal: number; // 左右边距
    private startRatio: number; // 开始比例
    private endRatio: number; // 结束比例
    private antsLineStyle?: AntsLineStyle; // 蚂蚁线样式

    constructor(
        colors?: string[],
        height: number = 0,
        radius: number = 0,
        marginHorizontal: number = 0,
        startRatio: number = 0,
        endRatio: number = 0,
        antsLineStyle?: AntsLineStyle
    ) {
        this.colors = colors;
        this.height = height;
        this.radius = radius;
        this.marginHorizontal = marginHorizontal;
        this.startRatio = startRatio;
        this.endRatio = endRatio;
        this.antsLineStyle = antsLineStyle;
    }

    public getColors(): string[] | undefined {
        return this.colors;
    }

    public setColors(colors: string[]): void {
        this.colors = colors;
    }

    public getHeight(): number {
        return this.height;
    }

    public setHeight(height: number): void {
        this.height = height;
    }

    public getRadius(): number {
        return this.radius;
    }

    public setRadius(radius: number): void {
        this.radius = radius;
    }

    public getMarginHorizontal(): number {
        return this.marginHorizontal;
    }

    public setMarginHorizontal(marginHorizontal: number): void {
        this.marginHorizontal = marginHorizontal;
    }

    public getStartRatio(): number {
        return this.startRatio;
    }

    public setStartRatio(startRatio: number): void {
        this.startRatio = startRatio;
    }

    public getEndRatio(): number {
        return this.endRatio;
    }

    public setEndRatio(endRatio: number): void {
        this.endRatio = endRatio;
    }

    public getAntsLineStyle(): AntsLineStyle | undefined {
        return this.antsLineStyle;
    }

    public setAntsLineStyle(antsLineStyle: AntsLineStyle): void {
        this.antsLineStyle = antsLineStyle;
    }
}

/**
 * 蚂蚁线样式
 */
export class AntsLineStyle {
    private color: string = TableConfig.INVALID_COLOR; // 颜色
    private width: number; // 宽度
    private dashPattern?: number[]; // 虚线样式
    private ratio: number; // 位置比例

    constructor(
        color: string = TableConfig.INVALID_COLOR,
        width: number = 0,
        dashPattern?: number[],
        ratio: number = 0
    ) {
        this.color = color;
        this.width = width;
        this.dashPattern = dashPattern;
        this.ratio = ratio;
    }

    public getColor(): string {
        return this.color;
    }

    public setColor(color: string): void {
        this.color = color;
    }

    public getWidth(): number {
        return this.width;
    }

    public setWidth(width: number): void {
        this.width = width;
    }

    public getDashPattern(): number[] | undefined {
        return this.dashPattern;
    }

    public setDashPattern(dashPattern: number[]): void {
        this.dashPattern = dashPattern;
    }

    public getRatio(): number {
        return this.ratio;
    }

    public setRatio(ratio: number): void {
        this.ratio = ratio;
    }
}
