import type { IStyle } from './IStyle';
import { Paint, Style } from '../../utils/temp';

export default class PointStyle implements IStyle {
  public static readonly CIRCLE: number = 0;
  public static readonly SQUARE: number = 1;
  public static readonly RECT: number = 2;

  private width: number = 0;
  private color: string = '';
  private shape: number = PointStyle.CIRCLE;
  private style: Style = Style.FILL;
  private static defaultPointSize: number = 10;
  private static defaultPointColor: string = '#888888';
  private _isDraw: boolean = true;

  constructor(width?: number, color?: string) {
    if (width !== undefined) this.width = width;
    if (color !== undefined) this.color = color;
  }

  public static setDefaultPointSize(width: number): void {
    PointStyle.defaultPointSize = width;
  }

  public static setDefaultPointColor(color: string): void {
    PointStyle.defaultPointColor = color;
  }

  public getWidth(): number {
    return this.width === 0 ? PointStyle.defaultPointSize : this.width;
  }

  public setWidth(width: number): void {
    this.width = width;
  }

  public getColor(): string {
    return this.color === '' ? PointStyle.defaultPointColor : this.color;
  }

  public setColor(color: string): void {
    this.color = color;
  }

  public getShape(): number {
    return this.shape;
  }

  public setShape(shape: number): void {
    this.shape = shape;
  }

  public getStyle(): Style {
    return this.style;
  }

  public setStyle(style: Style): void {
    this.style = style;
  }

  public isDraw(): boolean {
    return this._isDraw;
  }

  public setDraw(draw: boolean): void {
    this._isDraw = draw;
  }

  public fillPaint(paint: Paint): void {
    paint.setColor(this.getColor());
    paint.setStyle(this.getStyle());
    paint.setStrokeWidth(this.getWidth());
  }
}
