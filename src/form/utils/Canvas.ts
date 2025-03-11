/* eslint-disable no-dupe-class-members */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Align, Point, Rect, type Bitmap, type Paint } from './temp';
import ZRect from 'zrender/lib/graphic/shape/Rect';
import Text from 'zrender/lib/graphic/Text';
import Line from 'zrender/lib/graphic/shape/Line';
import Group from 'zrender/lib/graphic/Group';
import { createFromString } from 'zrender/lib/tool/path.js';
import { ZRender } from 'zrender/lib/zrender';
import Path from 'zrender/lib/graphic/Path.js';
import Image from 'zrender/lib/graphic/Image.js';
import { PixelRatio, Platform } from 'react-native';

class LineObj {
    start: Point;
    end: Point;

    constructor(startX: number, startY: number, endX: number, endY: number) {
        this.start = new Point(startX, startY);
        this.end = new Point(endX, endY);
    }
}

export interface Canvas {
    drawTextOnPath(text: string, path: Path, hOffset: number, vOffset: number, paint: Paint): void;

    save(): void;

    clipRect(rect: Rect): void;

    clipRect(left: number, top: number, right: number, bottom: number): void;

    restore(): void;

    drawRect(left: number, top: number, right: number, bottom: number, paint: Paint): void;

    drawRect(rect: Rect, paint: Paint): void;

    drawRoundRect(rect: Rect, rX: number, rY: number, paint: Paint): void;

    drawBitmap(bitmap: Bitmap, imgRect: Rect, drawRect: Rect, paint: Paint): void;

    drawImage(imgPath: string, imgRect: Rect, drawRect: Rect, paint: Paint): void;

    drawText(string: string, textCenterX: number, textCenterY: number, paint: Paint): void;

    drawTextInRect(string: string, rect: Rect, paint: Paint): void;

    getSaveCount(): number;

    translate(width: number, number: number): void;

    restoreToCount(saveCount: number): void;

    drawPath(path: Path, paint: Paint): void;

    drawLine(startX: number, startY: number, endX: number, endY: number, paint: Paint): void;

    clear(): void;
}

export class CanvasImpl implements Canvas {
    static IMAGEMAP = {
        collapsedIcon: require('../../img/collapsedIcon.png'),
        copy_disable: require('../../img/copy_disable.png'),
        copy: require('../../img/copy.png'),
        dot_delete: require('../../img/dot_delete.png'),
        dot_edit: require('../../img/dot_edit.png'),
        dot_new: require('../../img/dot_new.png'),
        dot_readonly: require('../../img/dot_readonly.png'),
        dot_select: require('../../img/dot_select.png'),
        dot_white: require('../../img/dot_white.png'),
        down: require('../../img/down.png'),
        edit_disable: require('../../img/edit_disable.png'),
        edit: require('../../img/edit.png'),
        expandedIcon: require('../../img/expandedIcon.png'),
        icon_lock: require('../../img/icon_lock.png'),
        icon_unlock: require('../../img/icon_unlock.png'),
        normal: require('../../img/normal.png'),
        portal_icon: require('../../img/portal_icon.png'),
        revert: require('../../img/revert.png'),
        selected: require('../../img/selected.png'),
        selectedIcon: require('../../img/selectedIcon.png'),
        trash_disable: require('../../img/trash_disable.png'),
        trash: require('../../img/trash.png'),
        unselected_disable: require('../../img/unselected_disable.png'),
        unselected: require('../../img/unselected.png'),
        unSelectIcon: require('../../img/unSelectIcon.png'),
        up: require('../../img/up.png'),
    }

    zrender: ZRender;

    rootGroup: Group;

    clipRectPath: Path;

    clipRectObj: Rect;

    dp: number = Platform.OS === 'harmony' ? PixelRatio.get() : 1;

    constructor(zrender: ZRender) {
        this.zrender = zrender;
        this.rootGroup = new Group();
        this.clipRectObj = new Rect(0, 0, 0, 0);
        this.zrender.add(this.rootGroup);
    }
    clear(): void {
        this.rootGroup?.removeAll();
    }

    drawPath(path: Path, paint: Paint) {
        path?.points?.forEach((arr) => {
            for (let i = 0; i < arr?.length - 1; ++i) {
                this.drawLine(arr[i]?.x, arr[i]?.y, arr[i + 1]?.x, arr[i + 1]?.y, paint);
            }
        });
    }

    drawLine(startX: number, startY: number, endX: number, endY: number, paint: Paint) {
        const points = this.findLineRectIntersection(
            new Point(startX, startY),
            new Point(endX, endY),
            this.clipRectObj
        );
        if (points?.length === 2) {
            const line = new Line({
                shape: {
                    x1: points[0].x,
                    y1: points[0].y,
                    x2: points[1].x,
                    y2: points[1].y,
                },
                style: {
                    stroke: paint.getColor(),
                    lineWidth: 1,
                },
            });
            this.rootGroup.add(line);
        }
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
        if (leftOrRect instanceof Rect) {
            this.clipRectObj = new Rect(leftOrRect);
        } else {
            this.clipRectObj = new Rect(leftOrRect, top, right, bottom);
        }
    }

    restore(): void {
        this.clipRectObj = new Rect(0, 0, 0, 0);
    }

    drawRect(...args: any[]): void {
        if (args?.length === 2) {
            this.drawRect1(args[0], args[1]);
        } else if (args?.length === 5) {
            this.drawRect2(args[0], args[1], args[2], args[3], args[4]);
        }
    }

    drawRoundRect(rect: Rect, rX: number, rY: number, paint: Paint) {
        this.drawRect1(rect, paint);
    }

    drawRect1(rect: Rect, paint: Paint) {
        this.drawRect2(rect.left, rect.top, rect.right, rect.bottom, paint);
    }

    drawRect2(left: number, top: number, right: number, bottom: number, paint: Paint): void {
        const pathStr = `M ${this.clipRectObj.left} ${this.clipRectObj.top} h ${this.clipRectObj.width} v ${this.clipRectObj.height} h ${-this.clipRectObj.width} Z`;
        const clipRectPath = createFromString(pathStr);
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
            clipPath: clipRectPath,
        });
        this.rootGroup.add(rect);
    }

    drawBitmap(bitmap: Bitmap, imgRect: Rect, drawRect: Rect, paint: Paint): void {
        throw new Error('Method not implemented.');
    }

    drawImage(imgName: string, imgRect: Rect, drawRect: Rect, paint: Paint): void {
        const pathStr = `M ${this.clipRectObj.left} ${0} h ${this.clipRectObj.width} v ${this.clipRectObj.height} h ${-this.clipRectObj.width} Z`;
        const clipRectPath = createFromString(pathStr);

        const image = new Image({
            style: {
                image : CanvasImpl.IMAGEMAP[imgName], x:imgRect.left, y:imgRect.top, width:imgRect.width, height:imgRect.height,

            },
            clipPath: clipRectPath,
        });
        this.rootGroup.add(image);
    }

    private getTextSize(paint: Paint): number {
        return paint.getTextSize() * this.dp;
    }

    drawText(string: string, textCenterX: number, textCenterY: number, paint: Paint): void {
        const pathStr = `M ${Math.max(0, this.clipRectObj.left - textCenterX)} ${0} h ${this.clipRectObj.width} v ${this.clipRectObj.height} h ${-this.clipRectObj.width} Z`;
        const clipRectPath = createFromString(pathStr);
        const cell = new Text({
            // draggable: true,
            x: textCenterX,
            y: textCenterY, // 根据偏移量调整 Y 坐标
            style: {
                text: string,
                fill: paint.getColor(),
                fontSize: this.getTextSize(paint),
                textAlign: paint.getTextAlign(),
            },
            clipPath: clipRectPath,
        });
        this.rootGroup.add(cell);
    }

    drawTextInRect(string: string, rect: Rect, paint: Paint): void {
        const pathStr = `M ${Math.max(rect.left, this.clipRectObj.left)} ${0} h ${this.clipRectObj.width} v ${this.clipRectObj.height} h ${-this.clipRectObj.width} Z`;
        const clipRectPath = createFromString(pathStr);
        let x = 0;
        switch(paint.getTextAlign()) {
            case Align.LEFT:
                x = rect.left;
                break;
            case Align.CENTER:
                x = rect.centerX;
                break;
            case Align.RIGHT:
                x = rect.right;
                break;
        }

        const cell = new Text({
            style: {
                x,
                y: rect.top,
                text: string,
                fill: paint.getColor(),
                fontSize: this.getTextSize(paint),
                align: paint.getTextAlign(),
            },
            clipPath: clipRectPath,
        });
        this.rootGroup.add(cell);
    }

    getSaveCount(): number {
        throw new Error('Method not implemented.');
    }

    translate(width: number, number: number): void {
        throw new Error('Method not implemented.');
    }

    // 主函数实现
    findLineRectIntersection(start: Point, end: Point, rect: Rect): Point[] {
        // 1. 处理矩形标准化（确保min/max正确）
        const [left, right] = [Math.min(rect.left, rect.right), Math.max(rect.left, rect.right)];
        const [top, bottom] = [Math.min(rect.top, rect.bottom), Math.max(rect.top, rect.bottom)];

        // 2. 检查端点是否在矩形内[1,3](@ref)
        const startInside = this.isPointInRect(start, new Rect(left, top, right, bottom));
        const endInside = this.isPointInRect(end, new Rect(left, top, right, bottom));

        if (startInside && endInside) {
            return [start, end];
        }

        // 3. 检查与四条边的交点
        const edges = [
            new LineObj(left, bottom, left, top), // 左边
            new LineObj(right, bottom, right, top), // 右边
            new LineObj(left, top, right, top), // 上边
            new LineObj(left, bottom, right, bottom), // 下边
        ];

        const intersections: Point[] = [];

        // 4. 计算与各边的有效交点[5,6](@ref)
        for (const edge of edges) {
            const intersectPoint = this.getLineIntersection(start, end, edge);
            if (intersectPoint && this.isPointOnEdge(intersectPoint, edge)) {
                intersections.push(intersectPoint);
            }
        }

        // 5. 合并端点和交点，排序后返回结果
        const points = [];
        if (startInside) points.push(start);
        if (endInside) points.push(end);
        points.push(...intersections);

        // 按线段方向排序[4](@ref)
        return points.sort((a, b) => this.distance(start, a) - this.distance(start, b));
    }

    // 判断点是否在线段上的方法
    isPointOnEdge(point: Point, edge: LineObj, epsilon = 1): boolean {
        const A = edge.start;
        const B = edge.end;
        const P = point;

        // 1. 检查是否线段退化为点
        if (Math.abs(A.x - B.x) < epsilon && Math.abs(A.y - B.y) < epsilon) {
            return Math.abs(P.x - A.x) < epsilon && Math.abs(P.y - A.y) < epsilon;
        }

        // 2. 检查点是否在线段延长线上（叉积为0）
        const crossProduct = (B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x);
        if (Math.abs(crossProduct) > epsilon) return false;

        // 3. 检查点是否在线段坐标范围内（点积判断）
        const dotProduct = (P.x - A.x) * (B.x - A.x) + (P.y - A.y) * (B.y - A.y);
        if (dotProduct < -epsilon) return false;

        const squaredLengthBA = (B.x - A.x) ** 2 + (B.y - A.y) ** 2;
        if (dotProduct > squaredLengthBA + epsilon) return false;

        return true;
    }

    // 辅助函数：判断点是否在矩形内[1](@ref)
    isPointInRect(p: Point, rect: Rect): boolean {
        return p.x >= rect.left && p.x <= rect.right && p.y >= rect.top && p.y <= rect.bottom;
    }

    // 辅助函数：计算线段交点（向量叉乘法）[5,6](@ref)
    getLineIntersection(start: Point, end: Point, l2: LineObj): Point | undefined {
        const a1 = end.y - start.y;
        const b1 = start.x - end.x;
        const c1 = a1 * start.x + b1 * start.y;

        const a2 = l2.end.y - l2.start.y;
        const b2 = l2.start.x - l2.end.x;
        const c2 = a2 * l2.start.x + b2 * l2.start.y;

        const denominator = a1 * b2 - a2 * b1;
        if (denominator === 0) return undefined; // 平行或重合

        const x = (b2 * c1 - b1 * c2) / denominator;
        const y = (a1 * c2 - a2 * c1) / denominator;

        // 检查交点是否在两条线段范围内
        if (
            this.isBetween(x, start.x, end.x) &&
            this.isBetween(y, start.y, end.y) &&
            this.isBetween(x, l2.start.x, l2.end.x) &&
            this.isBetween(y, l2.start.y, l2.end.y)
        ) {
            return new Point(x, y);
        }
        return undefined;
    }

    // 辅助函数：判断值是否在区间内
    isBetween(value: number, a: number, b: number): boolean {
        const min = Math.min(a, b);
        const max = Math.max(a, b);
        return value >= min - 1e-6 && value <= max + 1e-6;
    }

    // 辅助函数：计算两点距离
    distance(p1: Point, p2: Point): number {
        return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }
}
