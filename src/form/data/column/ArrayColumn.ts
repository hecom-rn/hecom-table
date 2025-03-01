import { Column } from './Column';
import { ColumnNode } from './ColumnNode';
import { ArrayStructure } from '../ArrayStructure';
import { TableInfo } from '../TableInfo';
import type { IFormat } from '../format/IFormat';
import type { IDrawFormat } from '../format/draw/IDrawFormat';

export class ArrayColumn<T> extends Column<T> {
    public static readonly ARRAY: number = 1;
    public static readonly LIST: number = 2;
    private node: ColumnNode;
    private structure: ArrayStructure;
    private arrayType: number;
    private _isThoroughArray: boolean = false;

    constructor(
        columnName: string,
        fieldName: string,
        isThoroughArray: boolean = true,
        format?: IFormat<T>,
        drawFormat?: IDrawFormat<T>
    ) {
        super(columnName, fieldName, format, drawFormat);
        this.structure = new ArrayStructure();
        this._isThoroughArray = isThoroughArray;
    }

    public fillData(objects: any[]): void {
        this.structure.clear();
        this.structure.setMaxLevel(this.getLevel());
        if (this.getCountFormat()) {
            this.getCountFormat().clearCount();
        }
        if (objects.length > 0) {
            const fieldNames = this.getFieldName().split('.');
            if (fieldNames.length > 0) {
                for (const obj of objects) {
                    this.getFieldData(fieldNames, 0, obj, 0, true);
                }
            }
        }
    }

    public addData(objects: any[], startPosition: number, isFoot?: boolean): void {
        if (objects.length > 0) {
            const fieldNames = this.getFieldName().split('.');
            if (fieldNames.length > 0) {
                for (const obj of objects) {
                    this.getFieldData(fieldNames, 0, obj, 0, isFoot);
                }
            }
        }
    }

    protected getFieldData(fieldNames: string[], start: number, child: any, level: number, isFoot: boolean): void {
        for (let i = start; i < fieldNames.length; i++) {
            if (!child) {
                this.addData(null, isFoot);
                this.countColumnValue(null);
                this.structure.putNull(level, isFoot);
                break;
            }
            const childField = child[fieldNames[i]];
            if (!ArrayColumn.isList(childField)) {
                if (i === fieldNames.length - 1) {
                    if (!childField) {
                        this.structure.putNull(level, isFoot);
                    }
                    const t = childField as T;
                    this.addData(t, true);
                    this.countColumnValue(t);
                }
            } else {
                level++;
                if (Array.isArray(childField)) {
                    this.arrayType = ArrayColumn.ARRAY;
                    for (const d of childField) {
                        if (i === fieldNames.length - 1) {
                            this.addData(d as T, true);
                        } else {
                            this.getFieldData(fieldNames, i + 1, d, level, true);
                        }
                    }
                    this.structure.put(level - 1, childField.length, isFoot);
                } else {
                    const data = childField as any[];
                    this.arrayType = ArrayColumn.LIST;
                    for (const d of data) {
                        if (i === fieldNames.length - 1) {
                            this.addData(d as T, true);
                        } else {
                            this.getFieldData(fieldNames, i + 1, d, level, true);
                        }
                    }
                    this.structure.put(level - 1, data.length, isFoot);
                }
                break;
            }
        }
    }

    public static isList(o: any): boolean {
        return o != null && (Array.isArray(o) || o instanceof Array);
    }

    public getLevel(): number {
        return ColumnNode.getLevel(this.node, 0) - 1;
    }

    public getNode(): ColumnNode {
        return this.node;
    }

    public setNode(node: ColumnNode): void {
        this.node = node;
    }

    public getArrayType(): number {
        return this.arrayType;
    }

    public setArrayType(arrayType: number): void {
        this.arrayType = arrayType;
    }

    public getStructure(): ArrayStructure {
        return this.structure;
    }

    public setStructure(structure: ArrayStructure): void {
        this.structure = structure;
    }

    public isThoroughArray(): boolean {
        return this._isThoroughArray;
    }

    public setThoroughArray(thoroughArray: boolean): void {
        this._isThoroughArray = thoroughArray;
    }

    public getSeizeCellSize(tableInfo: TableInfo, position: number): number {
        return this.structure.getCellSizes()[position];
    }
}
