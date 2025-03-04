import { Point } from './temp';

export class Path {
    public points: Array<Array<Point>> = [];
    constructor() {}

    lineTo(x: number, y: number): void {
        const l = this.points.length;
        if (l > 0) {
            this.points[l - 1]?.push(new Point(x, y));
        }
    }

    moveTo(x: number, y: number): void {
        const arr: Array<Point> = [];
        arr.push(new Point(x, y));
        this.points.push(arr);
    }

    rewind() {
        this.points = [];
    }
}

export class PathEffect {}
