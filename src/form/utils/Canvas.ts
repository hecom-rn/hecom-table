/* eslint-disable no-dupe-class-members */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Rect, type Bitmap, type Paint, type Path } from './temp';
import ZRect from 'zrender/lib/graphic/shape/Rect';
import Text from 'zrender/lib/graphic/Text';
import Line from 'zrender/lib/graphic/shape/Line';
import type { ZRenderType } from 'zrender/lib/zrender';

export interface Canvas {
    drawTextOnPath(text: string, path: Path, hOffset: number, vOffset: number, paint: Paint): void;

    save(): void;

    clipRect(rect: Rect): void;

    clipRect(left: number, top: number, right: number, bottom: number): void;

    restore(): void;

    drawRect(left: number, top: number, right: number, bottom: number, paint: Paint): void;

    drawRect(rect: Rect, paint: Paint): void;

    drawBitmap(bitmap: Bitmap, imgRect: Rect, drawRect: Rect, paint: Paint): void;

    drawText(string: string, textCenterX: number, textCenterY: number, paint: Paint): void;

    getSaveCount(): number;

    translate(width: number, number: number): void;

    restoreToCount(saveCount: number): void;

    drawPath(path: Path, paint: Paint): void;

    drawLine(startX: number, startY: number, endX: number, endY: number, paint: Paint): void;

    clear(): void;
}

export class CanvasImpl implements Canvas {
    zrender: ZRenderType;

    constructor(zrender: ZRenderType) {
        this.zrender = zrender;
    }
    clear(): void {
        this.zrender?.clear();
    }

    drawPath(path: Path, paint: Paint) {
        this.drawLine(path.startX, path.startY, path.endX, path.endY, paint);
    }

    drawLine(startX: number, startY: number, endX: number, endY: number, paint: Paint) {
        const line = new Line({
            shape: {
                x1: startX,
                y1: startY,
                x2: endX,
                y2: endY,
            },
            style: {
                stroke: paint.getColor(),
                lineWidth: 2,
            },
        });
        this.zrender.add(line);
    }

    drawTextOnPath(text: string, path: Path, hOffset: number, vOffset: number, paint: Paint): void {
        throw new Error('Method not implemented.');
    }

    restoreToCount(saveCount: number): void {
        throw new Error('Method not implemented.');
    }

    save(): void {
        // console.log('save');
        // throw new Error('Method not implemented.');
    }

    clipRect(rect: Rect): void;
    clipRect(left: number, top: number, right: number, bottom: number): void;
    clipRect(leftOrRect: number | Rect, top?: number, right?: number, bottom?: number): void {
        // console.log('clipRect', leftOrRect, top, right, bottom);
        // throw new Error('Method not implemented.');
    }

    restore(): void {
        // console.log('restore');
        // throw new Error('Method not implemented.');
    }

    drawRect(...args: any[]): void {
        if (args?.length === 2) {
            this.drawRect1(args[0], args[1]);
        } else if (args?.length === 5) {
            this.drawRect2(args[0], args[1], args[2], args[3], args[4]);
        }
    }

    drawRect1(rect: Rect, paint: Paint) {
        this.drawRect2(rect.left, rect.top, rect.right, rect.bottom, paint);
    }

    drawRect2(left: number, top: number, right: number, bottom: number, paint: Paint): void {
        console.log('drawRect', left, top, right, bottom, paint);
        const rect = new ZRect({
            shape: {
                x: left,
                y: top,
                width: right - left,
                height: bottom - top,
            },
            style: {
                fill: paint.getColor(),
            },
        });
        this.zrender.add(rect);
        // throw new Error('Method not implemented.');
    }

    drawBitmap(bitmap: Bitmap, imgRect: Rect, drawRect: Rect, paint: Paint): void {
        throw new Error('Method not implemented.');
    }

    drawText(string: string, textCenterX: number, textCenterY: number, paint: Paint): void {
        const cell = new Text({
            // draggable: true,
            x: textCenterX,
            y: textCenterY, // 根据偏移量调整 Y 坐标
            style: {
                text: string,
                fill: paint.getColor(),
                fontSize: paint.getTextSize(),
                textAlign: paint.getTextAlign(),
            },
        });
        this.zrender.add(cell);
        // throw new Error('Method not implemented.');
    }

    getSaveCount(): number {
        throw new Error('Method not implemented.');
    }

    translate(width: number, number: number): void {
        throw new Error('Method not implemented.');
    }
}
