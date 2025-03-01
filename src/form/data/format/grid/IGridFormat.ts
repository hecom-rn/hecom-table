import { Paint, Rect, type Canvas } from '../../../utils/temp';
import { CellInfo } from '../../CellInfo';
import { Column } from '../../column/Column';

/**
 * 表格网格绘制格式化
 */
export interface IGridFormat {
    /**
     * 绘制内容格子网格
     * @param canvas 画布
     * @param col 列
     * @param row 行
     * @param rect 方位
     * @param cellInfo 格子信息
     * @param paint 画笔
     */
    drawContentGrid(canvas: Canvas, col: number, row: number, rect: Rect, cellInfo: CellInfo, paint: Paint): void;

    /**
     * 绘制X序列格子网格
     * @param canvas 画布
     * @param col 列
     * @param rect 方位
     * @param paint 画笔
     */
    drawXSequenceGrid(canvas: Canvas, col: number, rect: Rect, paint: Paint): void;

    /**
     * 绘制Y序列格子网格
     * @param canvas 画布
     * @param row 行
     * @param rect 方位
     * @param paint 画笔
     */
    drawYSequenceGrid(canvas: Canvas, row: number, rect: Rect, paint: Paint): void;

    /**
     * 绘制统计行格子网格
     * @param canvas 画布
     * @param col 列
     * @param rect 方位
     * @param column
     * @param paint 画笔
     */
    drawCountGrid(canvas: Canvas, col: number, rect: Rect, column: Column, paint: Paint): void;

    /**
     * 绘制列标题网格
     * @param canvas 画布
     * @param rect 方位
     * @param column
     * @param col
     * @param paint 画笔
     */
    drawColumnTitleGrid(canvas: Canvas, rect: Rect, column: Column, col: number, paint: Paint): void;

    /**
     * 绘制表格边框网格
     * @param canvas 画布
     * @param left
     * @param top
     * @param right
     * @param bottom
     * @param paint 画笔
     */
    drawTableBorderGrid(canvas: Canvas, left: number, top: number, right: number, bottom: number, paint: Paint): void;

    /**
     * 绘制左上角空隙网格
     * @param canvas 画布
     * @param rect 方位
     * @param paint 画笔
     */
    drawLeftAndTopGrid(canvas: Canvas, rect: Rect, paint: Paint): void;
}
