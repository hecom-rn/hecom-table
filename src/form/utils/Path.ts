export class Path {
    public startX: number;
    public startY: number;
    public endX: number;
    public endY: number;
    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
    }

    lineTo(x: number, y: number): void {
        this.endX = x;
        this.endY = y;
    }

    moveTo(x: number, y: number): void {
        this.startX = x;
        this.startY = y;
    }

    rewind() {}
}

export class PathEffect {}
