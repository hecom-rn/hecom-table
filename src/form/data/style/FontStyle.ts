import { Paint, Align, Style } from '../../utils/temp';

export class FontStyle {
    private static defaultFontSize: number = 12;
    private static defaultFontColor: string = '#636363';
    private static defaultAlign: Align = Align.CENTER;
    private textSize: number;
    private textColor: string;
    private align: Align;

    constructor(textSize?: number, textColor?: string) {
        this.textSize = textSize || FontStyle.defaultFontSize;
        this.textColor = textColor || FontStyle.defaultFontColor;
    }
    public static setDefaultTextSize(defaultTextSize: number): void {
        FontStyle.defaultFontSize = defaultTextSize;
    }

    public static setDefaultTextAlign(align: Align): void {
        FontStyle.defaultAlign = align;
    }

    public static setDefaultTextColor(defaultTextColor: string): void {
        FontStyle.defaultFontColor = defaultTextColor;
    }

    public getAlign(): Align {
        return this.align || FontStyle.defaultAlign;
    }

    public setAlign(align: Align): FontStyle {
        this.align = align;
        return this;
    }

    public getTextSize(): number {
        return this.textSize || FontStyle.defaultFontSize;
    }

    public setTextSize(textSize: number): FontStyle {
        this.textSize = textSize;
        return this;
    }

    public getTextColor(): string {
        return this.textColor || FontStyle.defaultFontColor;
    }

    public setTextColor(textColor: string): FontStyle {
        this.textColor = textColor;
        return this;
    }

    public fillPaint(paint: Paint): void {
        paint.setColor(this.getTextColor());
        paint.setTextAlign(this.getAlign());
        paint.setTextSize(this.getTextSize());
        paint.setStyle(Style.FILL);
    }
}
