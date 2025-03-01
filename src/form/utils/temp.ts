export * from './Rect';
export * from './Canvas';
export * from './Paint';
export * from './Path';

export class Point {
    x: number;
    y: number;

    constructor();
    constructor(x: number, y: number);
    constructor(x?: number, y?: number) {
        this.x = x || -1;
        this.y = y || -1;
    }
    set(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
}

export { Point as PointF };

export class Options {}

export interface Context {
    getResources(): any;
}

export class BitmapFactory {
    static decodeResource(context: Context, resID: number, options: Options): Bitmap {
        return null;
    }
}

export interface Bitmap {
    getWidth(): number;

    getHeight(): number;
}
