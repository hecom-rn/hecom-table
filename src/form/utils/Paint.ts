import { PathEffect } from './Path';
import Text from 'zrender/lib/graphic/Text';
import { platformApi } from 'zrender/lib/core/platform.js';

const WidthMap = new Map<String, number>();

export class Paint {
    isFakeBoldText: boolean = false;
    isStrikeThruText: boolean;
    copyFrom(paint: TextPaint) {
        const p = new Paint();
        p.setColor(paint.getColor());
        p.setStyle(paint.getStyle());
        p.setStrokeWidth(paint.getStrokeWidth());
        p.setPathEffect(paint.getPathEffect());
        p.setTextAlign(paint.getTextAlign());
        p.setTextSize(paint.getTextSize());
        p.setLineWidth(paint.getLineWidth());
        return p;
    }
    static ANTI_ALIAS_FLAG: string = 'ANTI_ALIAS_FLAG';

    private color: string = Color.WHITE;

    private style: Style = Style.FILL;

    private strokeWidth: number = 0;

    private pathEffect: PathEffect = new PathEffect();

    private align: Align = Align.LEFT;

    private textSize: number = 12;

    private lineWidth: number = 1;

    constructor(flag?: string) {}

    measureText(text: string): number {
        if (WidthMap.has(text)) {
            return WidthMap.get(text) || text.length;
        } else {
            const { width } = platformApi.measureText(text, `${this.getTextSize()}px sans-serif`);
            console.log('text = ', text, ', width = ', width);
            WidthMap.set(text, width);
            return width;
        }
        // TODO 需要替换成真实的计算方法
        // return text.length * 4;
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
            descent: this.textSize,
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

    setLineWidth(lineWidth: number) {
        this.lineWidth = lineWidth;
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
