import { TableConfig } from '../core/TableConfig';
import { FontStyle } from '../data/style/FontStyle';
import { type Canvas, Paint, Align, Style, Rect, TextPaint } from './temp';

interface PointF {
    x: number;
    y: number;
}

export class DrawUtils {
    public static getTextHeight(paint: Paint, style?: FontStyle): number {
        style && style.fillPaint(paint);
        const fontMetrics = paint.getFontMetrics();
        return fontMetrics.descent - fontMetrics.ascent;
    }

    public static getTextCenterY(centerY: number, paint: Paint): number {
        return centerY - (paint.descent() + paint.ascent()) / 2;
    }

    public static getTextCenterX(left: number, right: number, paint: Paint): number {
        const align = paint.getTextAlign();
        if (align === Align.RIGHT) {
            return right;
        } else if (align === Align.LEFT) {
            return left;
        } else {
            return (right + left) / 2;
        }
    }

    public static isMixRect(rect: Rect, left: number, top: number, right: number, bottom: number): boolean {
        return rect.bottom >= top && rect.right >= left && rect.top < bottom && rect.left < right;
    }

    public static isClick(clickPoint: PointF, left: number, top: number, right: number, bottom: number): boolean;
    public static isClick(clickPoint: PointF, rect: Rect): boolean;

    public static isClick(
        clickPoint: PointF,
        rectOrLeft: Rect | number,
        top: number,
        right: number,
        bottom: number
    ): boolean {
        if (rectOrLeft instanceof Rect) {
            return rectOrLeft.contains(clickPoint.x, clickPoint.y);
        } else {
            return clickPoint.x >= rectOrLeft && clickPoint.x <= right && clickPoint.y >= top && clickPoint.y <= bottom;
        }
    }

    public static fillBackground(
        canvas: Canvas,
        left: number,
        top: number,
        right: number,
        bottom: number,
        bgColor: string,
        paint: Paint
    ): void {
        if (bgColor !== TableConfig.INVALID_COLOR) {
            paint.setColor(bgColor);
            paint.setStyle(Style.FILL);
            canvas.drawRect(left, top, right, bottom, paint);
        }
    }

    public static isMixHorizontalRect(rect: Rect, left: number, right: number): boolean {
        return rect.right >= left && rect.left <= right;
    }

    public static isVerticalMixRect(rect: Rect, top: number, bottom: number): boolean {
        return rect.bottom >= top && rect.top <= bottom;
    }

    public static getMultiTextHeight(paint: Paint, values: string[]): number {
        return DrawUtils.getTextHeight(paint) * values.length;
    }

    public static getMultiTextWidth(paint: Paint, values: string[]): number {
        const longestString = this.findLongestString(values);
        return paint.measureText(longestString);
    }

    public static findLongestString(strings: string[]): string {
        let longest = strings[0] || '';
        for (let i = 1; i < strings.length; i++) {
            if (strings[i] && strings[i].length > longest.length) {
                longest = strings[i];
            }
        }
        return longest;
    }

    public static drawMultiText(canvas: Canvas, paint: Paint, rect: Rect, values: string[]): void {
        for (let i = 0; i < values.length; i++) {
            const centerY =
                (rect.bottom + rect.top) / 2 + (values.length / 2 - i - 0.5) * DrawUtils.getTextHeight(paint);
            canvas.drawText(
                values[values.length - i - 1],
                this.getTextCenterX(rect.left, rect.right, paint),
                this.getTextCenterY(centerY, paint),
                paint
            );
        }
    }

    public static drawMultiTextSpannable(canvas: Canvas, paint: Paint, rect: Rect, spannableString: string): void {
        const saveCount = canvas.getSaveCount();
        canvas.save();
        const builder = StaticLayout.Builder.obtain(
            spannableString,
            0,
            spannableString.length,
            new TextPaint(paint),
            rect.width
        );
        let dx = 0;
        switch (paint.getTextAlign()) {
            case Align.LEFT:
                break;
            case Align.CENTER:
                dx = rect.centerX - rect.left;
                break;
            case Align.RIGHT:
                dx = rect.width;
                break;
        }
        const staticLayout = builder.build();
        const dy = (rect.height - staticLayout.getHeight()) / 2;
        canvas.translate(rect.left + dx, rect.top + dy);
        staticLayout.draw(canvas);
        canvas.restoreToCount(saveCount);
    }

    public static drawSingleText(canvas: Canvas, paint: Paint, rect: Rect, value: string): void {
        canvas.drawText(
            value,
            this.getTextCenterX(rect.left, rect.right, paint),
            this.getTextCenterY(rect.centerY, paint),
            paint
        );
    }
}
