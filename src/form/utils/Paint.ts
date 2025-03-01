import { PathEffect } from './Path';

export class Paint {
    static ANTI_ALIAS_FLAG: string = 'ANTI_ALIAS_FLAG';

    private color: string = Color.WHITE;

    private style: Style = Style.FILL;

    private strokeWidth: number = 0;

    private pathEffect: PathEffect = new PathEffect();

    private align: Align = Align.CENTER;

    private textSize: number = 12;

    private lineWidth: number = 1;

    constructor(flag: string) {}

    measureText(text: string): number {
        // TODO 需要替换成真实的计算方法
        return text.length;
    }

    getColor(): string {
        return this.color;
    }

    setColor(textColor: string) {
        this.color = textColor;
    }

    setTextAlign(align: Align) {
        this.align = align;
    }

    setTextSize(textSize: number) {
        this.textSize = textSize;
    }

    getStyle(): Style {
        return this.style;
    }

    setStyle(style: Style) {
        this.style = style;
    }

    setStrokeWidth(width: number) {
        this.strokeWidth = width;
    }

    getStrokeWidth(): number {
        return this.strokeWidth;
    }

    setPathEffect(effect: PathEffect) {
        this.pathEffect = effect;
    }

    getPathEffect(): PathEffect {
        return this.pathEffect;
    }

    getTextSize() {
        return this.textSize;
    }

    getFontMetrics() {
        return {
            descent: 0,
            ascent: 0,
        };
    }

    descent() {
        return 0;
    }

    ascent() {
        return 0;
    }

    getTextAlign() {
        return this.align;
    }

    getLineWidth() {
        return this.lineWidth;
    }
}

export class TextPaint extends Paint {}

export enum Color {
    BLACK = '#000',
    WHITE = '#FFF',
}

export enum Style {
    FILL = 'fill',
    STROKE = 'stroke',
}

export enum Align {
    CENTER = 'center',
    LEFT = 'left',
    RIGHT = 'right',
}
