import type { TableConfig } from '../../../core/TableConfig';
import type { Canvas, Rect } from '../../../utils/temp';
import type { Column } from '../../column/Column';

export interface ITitleDrawFormat {
    /**
     * 测量宽
     */
    measureWidth(column: Column, config: TableConfig): number;

    /**
     * 测量高
     */
    measureHeight(config: TableConfig): number;

    /**
     * 绘制
     * @param c 画笔
     * @param column 列信息
     */
    draw(c: Canvas, column: Column, rect: Rect, config: TableConfig): void;
}
