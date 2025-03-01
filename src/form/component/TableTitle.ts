import type { ITableTitle } from './ITableTitle';
import { Direction } from './IComponent';
import { type Canvas, Paint, Path, Rect } from '../utils/temp';
import type { TableConfig } from '../core/TableConfig';
import { DrawUtils } from '../utils/DrawUtils';

/**
 * Created by huang on 2017/9/29.
 * 绘制标题
 */
export class TableTitle implements ITableTitle {
    private size: number = 100;
    private rect: Rect = new Rect();
    protected direction: Direction = Direction.TOP;

    onDraw(canvas: Canvas, showRect: Rect, tableName: string, config: TableConfig): void {
        const paint: Paint = config.getPaint();
        config.getTableTitleStyle().fillPaint(paint);
        const rect: Rect = this.getRect();
        const startX: number = rect.centerX;
        const path: Path = new Path();
        switch (this.direction) {
            case Direction.TOP:
            case Direction.BOTTOM:
                DrawUtils.drawMultiText(canvas, paint, rect, tableName.split('\n'));
                break;
            case Direction.LEFT:
            case Direction.RIGHT:
                const textWidth: number = paint.measureText(tableName);
                path.moveTo(startX, rect.top);
                path.lineTo(startX, rect.bottom);
                canvas.drawTextOnPath(tableName, path, textWidth / 2, 0, paint);
                break;
        }
    }

    onMeasure(scaleRect: Rect, showRect: Rect, config: TableConfig): void {
        this.rect.left = showRect.left;
        this.rect.right = showRect.right;
        this.rect.top = showRect.top;
        this.rect.bottom = Math.min(showRect.bottom, scaleRect.bottom);
        const h: number = this.size;
        const w: number = this.size;
        switch (this.direction) {
            case Direction.TOP:
                this.rect.bottom = this.rect.top + h;
                scaleRect.top += h;
                showRect.top += h;
                break;
            case Direction.LEFT:
                this.rect.right = this.rect.left + w;
                scaleRect.left += w;
                showRect.left += w;
                break;
            case Direction.RIGHT:
                this.rect.left = this.rect.right - w;
                scaleRect.right -= w;
                showRect.right -= w;
                break;
            case Direction.BOTTOM:
                this.rect.top = this.rect.bottom - h;
                scaleRect.bottom -= h;
                showRect.bottom -= h;
                break;
        }
    }

    getSize(): number {
        return this.size;
    }

    setSize(size: number): void {
        this.size = size;
    }

    getRect(): Rect {
        return this.rect;
    }

    setRect(rect: Rect): void {
        this.rect = rect;
    }

    getDirection(): number {
        return this.direction;
    }

    setDirection(direction: number): void {
        this.direction = direction;
    }
}
