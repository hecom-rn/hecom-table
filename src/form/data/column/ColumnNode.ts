import { ArrayColumn } from './ArrayColumn';

export class ColumnNode {
    private name: string;
    private children: ColumnNode[];
    private arrayColumn: ArrayColumn<any> | null;
    private parent: ColumnNode | null;

    constructor(name: string, parent: ColumnNode | null, arrayColumn?: ArrayColumn<any>) {
        this.name = name;
        this.parent = parent;
        this.children = [];
        this.arrayColumn = arrayColumn || null;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getChildren(): ColumnNode[] {
        return this.children;
    }

    public getArrayColumn(): ArrayColumn<any> | null {
        return this.arrayColumn;
    }

    public setArrayColumn(arrayColumn: ArrayColumn<any>): void {
        this.arrayColumn = arrayColumn;
    }

    public getParent(): ColumnNode | null {
        return this.parent;
    }

    public setParent(parent: ColumnNode): void {
        this.parent = parent;
    }

    public static getLevel(node: ColumnNode, level: number): number {
        if (node.arrayColumn != null && !node.arrayColumn.isThoroughArray()) {
            level++;
        }
        if (node.getParent() != null) {
            if (node.getParent()!.arrayColumn == null) {
                level++;
            }
            return ColumnNode.getLevel(node.getParent()!, level);
        }
        return level - 1;
    }
}
