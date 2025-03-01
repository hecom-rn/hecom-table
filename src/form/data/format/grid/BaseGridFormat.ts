import type { CellInfo } from '../../CellInfo';
import { BaseAbstractGridFormat } from './BaseAbstractGridFormat';

/**
 * Created by huang on 2018/3/9.
 * 通用绘制网格格式化抽象类
 */
export class BaseGridFormat extends BaseAbstractGridFormat {
    protected isShowVerticalLine(col: number, row: number, cellInfo: CellInfo): boolean {
        return true;
    }

    protected isShowHorizontalLine(col: number, row: number, cellInfo: CellInfo): boolean {
        return true;
    }
}
