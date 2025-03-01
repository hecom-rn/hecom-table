export class CellConfig {
    private _minWidth: number;
    private _maxWidth: number;

    constructor(minWidth: number = 0, maxWidth: number = 0) {
        this._minWidth = minWidth;
        this._maxWidth = maxWidth;
    }

    public get minWidth(): number {
        return this._minWidth;
    }

    public set minWidth(value: number) {
        this._minWidth = value;
    }

    public get maxWidth(): number {
        return this._maxWidth;
    }

    public set maxWidth(value: number) {
        this._maxWidth = value;
    }
}
