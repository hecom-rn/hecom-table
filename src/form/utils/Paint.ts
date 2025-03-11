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
    }

    splitTextWithMaxWidth(text: string, maxWidth: number): string[] {
        const result: string[] = [];
        // 预处理：按换行符拆分成段落
        const paragraphs = text.split('\n');

        for (const paragraph of paragraphs) {
            let lineBuffer = '';
            let lineWidth = 0;

            for (const char of paragraph) {
                // 获取字符宽度（优先查表，默认逻辑：全角=2，半角=1）
                const charWidth = this.measureText(char);

                // 触发换行条件
                if (lineWidth + charWidth > maxWidth) {
                    // 寻找最近的切割点（空格/标点）
                    const lastSpaceIndex = Math.max(
                        lineBuffer.lastIndexOf(' '),
                        lineBuffer.lastIndexOf(','),
                        lineBuffer.lastIndexOf('。')
                    );

                    if (lastSpaceIndex > 0) { // 找到自然分割点
                        result.push(lineBuffer.slice(0, lastSpaceIndex + 1));
                        lineBuffer = lineBuffer.slice(lastSpaceIndex + 1);
                        lineWidth = [...lineBuffer].reduce((sum, c) => 
                            sum + this.measureText(c), 0);
                    } else { // 强制截断
                        result.push(lineBuffer);
                        lineBuffer = '';
                        lineWidth = 0;
                    }
                }

                lineBuffer += char;
                lineWidth += charWidth;
            }

            if (lineBuffer) result.push(lineBuffer);
        }

        return result;
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
