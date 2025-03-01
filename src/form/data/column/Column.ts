import type { IFormat } from '../format/IFormat';
import type { ICountFormat } from '../format/count/ICountFormat';
import { NumberCountFormat } from '../format/count/NumberCountFormat';
import { StringCountFormat } from '../format/count/StringCountFormat';
import type { IDrawFormat } from '../format/draw/IDrawFormat';
import { TextDrawFormat } from '../format/draw/TextDrawFormat';
import FastTextDrawFormat from '../format/draw/FastTextDrawFormat';
import MultiLineDrawFormat from '../format/draw/MultiLineDrawFormat';
import type { OnColumnItemClickListener } from '../../listener/OnColumnItemClickListener';
import { TableInfo } from '../TableInfo';
import { type Align } from '../../utils/temp';

interface Comparable<T> {
    compareTo(o1: T): number;
}

interface Comparator<T> {
    compare(o1: T, o2: T): number;
}

export class Column<T = any> implements Comparable<Column<T>> {
    public static readonly INVAL_VALUE: string = '';
    private columnName: string;
    private children: Column<T>[];
    private _format: IFormat<T>;
    private drawFormat: IDrawFormat<T>;
    private fieldName: string;
    private datas: T[];
    private _isFixed: boolean;
    private computeWidth: number;
    private level: number;
    private comparator: Comparator<T>;
    private countFormat: ICountFormat<T>;
    private _isReverseSort: boolean;
    private onColumnItemClickListener: OnColumnItemClickListener<T>;
    private textAlign: Align;
    private titleAlign: Align;
    private _isAutoCount: boolean = false;
    private _isAutoMerge: boolean = false;
    private maxMergeCount: number = Number.MAX_VALUE;
    private id: number;
    private _isParent: boolean = false;
    private ranges: number[][];
    private _isFast: boolean;
    private minWidth: number = 20;
    private minHeight: number = 5;
    private width: number;
    private column: number = 0;

    constructor();
    constructor(columnName: string, children?: Column<T>[]);
    constructor(columnName: string, fieldName: string | null, format?: IFormat<T>, drawFormat?: IDrawFormat<T>);
    constructor(columnName?: string, arg2?: any, arg3?: any, arg4?: any) {
        this.columnName = columnName;
        if (Array.isArray(arg2)) {
            this.children = arg2;
            this._isParent = true;
        } else {
            this.fieldName = arg2;
            this._format = arg3;
            this.drawFormat = arg4;
            this.datas = [];
        }
    }

    public getColumnName(): string {
        return this.columnName;
    }

    public setColumnName(columnName: string): void {
        this.columnName = columnName;
    }

    public getFormat(): IFormat<T> {
        return this._format;
    }

    public setFormat(format: IFormat<T>): void {
        this._format = format;
    }

    public getFieldName(): string {
        return this.fieldName;
    }

    public setFieldName(fieldName: string): void {
        this.fieldName = fieldName;
    }

    public setChildren(children: Column<T>[]): void {
        this.children = children;
    }

    public getDrawFormat(): IDrawFormat<T> {
        if (!this.drawFormat) {
            this.drawFormat = this._isFast ? new FastTextDrawFormat<T>() : new TextDrawFormat<T>();
        }
        return this.drawFormat;
    }

    public setDrawFormat(drawFormat: IDrawFormat<T>): void {
        this.drawFormat = drawFormat;
    }

    public isParent(): boolean {
        return this._isParent;
    }

    public setParent(isParent: boolean): void {
        this._isParent = isParent;
    }

    public getDatas(): T[] {
        return this.datas;
    }

    public setDatas(datas: T[]): void {
        this.datas = datas;
    }

    public getData(o: any): T | null {
        const fieldNames = this.fieldName.split('.');
        let child = o;
        for (const fieldName of fieldNames) {
            if (!child) return null;
            const childField = child[fieldName];
            if (!childField) return null;
            child = childField;
        }
        return child as T;
    }

    public fillData(objects: any[]): void {
        if (this.countFormat) this.countFormat.clearCount();
        for (const obj of objects) {
            const data = this.getData(obj);
            this.addData(data, true);
            this.countColumnValue(data);
        }
    }

    public addData(objects: any[], startPosition: number, isFoot: boolean): void {
        if (objects.length + startPosition === this.datas.length) return;
        for (const obj of objects) {
            const data = this.getData(obj);
            this.addData(data, isFoot);
            this.countColumnValue(data);
        }
    }

    public format(position: number): string {
        if (position >= 0 && position < this.datas.length) {
            return this.formatData(this.datas[position]);
        }
        return Column.INVAL_VALUE;
    }

    public parseRanges(): number[][] {
        if (this._isAutoMerge && this.maxMergeCount > 1 && this.datas) {
            this.ranges = [];
            let perVal: string = null;
            let rangeStartPosition: number = -1;
            let rangeCount: number = 1;
            for (let i = 0; i < this.datas.length; i++) {
                const val = this.formatData(this.datas[i]);
                if (rangeCount < this.maxMergeCount && perVal && val && val.length && val === perVal) {
                    if (rangeStartPosition === -1) rangeStartPosition = i - 1;
                    rangeCount++;
                    if (i === this.datas.length - 1) {
                        this.ranges.push([rangeStartPosition, i]);
                        rangeStartPosition = -1;
                        rangeCount = 1;
                    }
                } else {
                    if (rangeStartPosition !== -1) {
                        this.ranges.push([rangeStartPosition, i - 1]);
                        rangeStartPosition = -1;
                        rangeCount = 1;
                    }
                }
                perVal = val;
            }
        }
        return this.ranges;
    }

    public formatData(t: T): string {
        return this._format ? this._format.format(t) : t ? t.toString() : Column.INVAL_VALUE;
    }

    protected countColumnValue(t: T): void {
        if (t && this._isAutoCount && !this.countFormat) {
            if (typeof t === 'number') {
                this.countFormat = new NumberCountFormat<T>();
            } else {
                this.countFormat = new StringCountFormat<T>(this);
            }
        }
        if (this.countFormat) this.countFormat.count(t);
    }

    protected addData(t: T, isFoot: boolean): void {
        if (isFoot) {
            this.datas.push(t);
        } else {
            this.datas.unshift(t);
        }
    }

    public getLevel(): number {
        return this.level;
    }

    public setLevel(level: number): void {
        this.level = level;
    }

    public getComputeWidth(): number {
        return this.computeWidth;
    }

    public setComputeWidth(computeWidth: number): void {
        this.computeWidth = computeWidth;
    }

    public getTotalNumString(): string {
        return this.countFormat ? this.countFormat.getCountString() : '';
    }

    public getChildren(): Column<T>[] {
        return this.children;
    }

    public addChildren(column: Column<T>): void {
        this.children.push(column);
    }

    public getComparator(): Comparator<T> {
        return this.comparator;
    }

    public setComparator(comparator: Comparator<T>): void {
        this.comparator = comparator;
    }

    public getCountFormat(): ICountFormat<T> {
        return this.countFormat;
    }

    public setCountFormat(countFormat: ICountFormat<T>): void {
        this.countFormat = countFormat;
    }

    public getId(): number {
        return this.id;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public compareTo(o: Column<T>): number {
        return this.id - o.getId();
    }

    public isAutoCount(): boolean {
        return this._isAutoCount;
    }

    public setAutoCount(autoCount: boolean): void {
        this._isAutoCount = autoCount;
    }

    public isReverseSort(): boolean {
        return this._isReverseSort;
    }

    public setReverseSort(reverseSort: boolean): void {
        this._isReverseSort = reverseSort;
    }

    public getOnColumnItemClickListener(): OnColumnItemClickListener<T> {
        return this.onColumnItemClickListener;
    }

    public setOnColumnItemClickListener(onColumnItemClickListener: OnColumnItemClickListener<T>): void {
        this.onColumnItemClickListener = onColumnItemClickListener;
    }

    public isFixed(): boolean {
        return this._isFixed;
    }

    public setFixed(fixed: boolean): void {
        this._isFixed = fixed;
    }

    public getTextAlign(): Align {
        return this.textAlign;
    }

    public setTextAlign(textAlign: Align): void {
        this.textAlign = textAlign;
    }

    public isAutoMerge(): boolean {
        return this._isAutoMerge;
    }

    public setAutoMerge(autoMerge: boolean): void {
        this._isAutoMerge = autoMerge;
    }

    public getMaxMergeCount(): number {
        return this.maxMergeCount;
    }

    public setMaxMergeCount(maxMergeCount: number): void {
        this.maxMergeCount = maxMergeCount;
    }

    public isFast(): boolean {
        return this._isFast;
    }

    public setFast(fast: boolean): void {
        this._isFast = fast;
        this.drawFormat = this._isFast ? new FastTextDrawFormat<T>() : new TextDrawFormat<T>();
    }

    public getSeizeCellSize(tableInfo: TableInfo, position: number): number {
        return tableInfo.getArrayLineSize()[position];
    }

    public getMinWidth(): number {
        return this.minWidth;
    }

    public setMinWidth(minWidth: number): void {
        this.minWidth = minWidth;
    }

    public getMinHeight(): number {
        return this.minHeight;
    }

    public setMinHeight(minHeight: number): void {
        this.minHeight = minHeight;
    }

    public getTitleAlign(): Align {
        return this.titleAlign;
    }

    public setTitleAlign(titleAlign: Align): void {
        this.titleAlign = titleAlign;
    }

    public setWidth(width: number): void {
        if (width > 0) {
            this.width = width;
            this.setDrawFormat(new MultiLineDrawFormat<T>(width));
        }
    }

    public getWidth(): number {
        return this.width === 0 ? this.computeWidth : this.width;
    }

    public getRanges(): number[][] {
        return this.ranges;
    }

    public setRanges(ranges: number[][]): void {
        this.ranges = ranges;
    }

    public setColumn(column: number): void {
        this.column = column;
    }

    public getColumn(): number {
        return this.column;
    }
}
