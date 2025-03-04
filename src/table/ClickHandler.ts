import { NativeEventEmitter, NativeModules } from 'react-native';
import HecomTable from './HecomTable';
import Locker from './lock/Locker';
import { Cell } from './bean/Cell';
import { Column } from '../form/data/column/Column';
import type { OnItemClickListener } from '../form/data/table/TableData';

type ClickEventParams = {
    keyIndex: number;
    rowIndex: number;
    columnIndex: number;
};

export class ClickHandler implements OnItemClickListener<Cell> {
    private table: HecomTable;
    private locker?: Locker;
    private eventEmitter = new NativeEventEmitter(NativeModules.RCTEventEmitter);

    constructor(table: HecomTable) {
        this.table = table;
    }

    setLocker(locker: Locker): void {
        this.locker = locker;
    }

    onClick(column: Column<Cell>, value: string, cell: Cell, col: number, row: number): void {
        const isLockItem = this.locker?.needShowLockRowAndCol(row, col) ?? false;

        // 处理列锁定逻辑
        if (isLockItem && this.locker) {
            this.locker.onClick(row, col);
            this.table.notifyDataChanged();
            return;
        }

        // 发送 React Native 事件
        try {
            const eventParams: ClickEventParams = {
                keyIndex: cell.getKeyIndex(),
                rowIndex: row,
                columnIndex: this.locker?.getRawCol(col) ?? col,
            };
            console.log('ClickEventParams eventParams = ', eventParams);

            // this.eventEmitter.emit('onClickEvent', {
            //     nativeEvent: eventParams,
            //     target: this.table.getNativeHandle(), // 假设 HecomTable 有获取原生句柄的方法
            // });
        } catch (error) {
            console.error('点击事件处理异常:', error instanceof Error ? error.message : error);
        }
    }
}
