import { type Canvas, Paint, Path, Rect } from '../../../utils/temp';
import { CellInfo } from '../../CellInfo';
import { Column } from '../../column/Column';
import type { IGridFormat } from './IGridFormat';

/**
 * Created by huang on 2018/3/9.
 * General drawing grid formatting abstract class
 */
export abstract class BaseAbstractGridFormat implements IGridFormat {
    private path: Path = new Path();

    /**
     * Whether to draw the vertical direction of the content grid
     * @param col Column
     * @param row Row
     * @param cellInfo Cell information
     * @return Whether to draw
     */
    protected abstract isShowVerticalLine(col: number, row: number, cellInfo: CellInfo<any>): boolean;

    /**
     * Whether to draw the horizontal direction of the content grid
     * @param col Column
     * @param row Row
     * @param cellInfo Cell information
     * @return Whether to draw
     */
    protected abstract isShowHorizontalLine(col: number, row: number, cellInfo: CellInfo<any>): boolean;

    /**
     * Whether to draw the vertical direction of the count row
     * @param col Column
     * @return Whether to draw
     */
    protected isShowCountVerticalLine(col: number, column: Column<any>): boolean {
        return true;
    }

    /**
     * Whether to draw the horizontal direction of the count row
     * @param col Column
     * @return Whether to draw
     */
    protected isShowCountHorizontalLine(col: number, column: Column<any>): boolean {
        return true;
    }

    /**
     * Whether to draw the vertical direction of the column title
     * @param col Column
     * @return Whether to draw
     */
    protected isShowColumnTitleVerticalLine(col: number, column: Column<any>): boolean {
        return true;
    }

    /**
     * Whether to draw the horizontal direction of the column title
     * @param col Column
     * @return Whether to draw
     */
    protected isShowColumnTitleHorizontalLine(col: number, column: Column<any>): boolean {
        return true;
    }

    /**
     * Whether to draw the vertical direction of the X sequence row
     * @param col Column
     * @return Whether to draw
     */
    protected isShowXSequenceVerticalLine(col: number): boolean {
        return true;
    }

    /**
     * Whether to draw the horizontal direction of the X sequence row
     * @param col Column
     * @return Whether to draw
     */
    protected isShowXSequenceHorizontalLine(col: number): boolean {
        return true;
    }

    /**
     * Whether to draw the vertical direction of the Y sequence row
     * @param row Row
     * @return Whether to draw
     */
    protected isShowYSequenceVerticalLine(row: number): boolean {
        return true;
    }

    /**
     * Whether to draw the horizontal direction of the Y sequence row
     * @param row Row
     * @return Whether to draw
     */
    protected isShowYSequenceHorizontalLine(row: number): boolean {
        return true;
    }

    /**
     * Draw the content grid
     * @param canvas Canvas
     * @param col Column
     * @param row Row
     * @param rect Rect
     * @param cellInfo Cell information
     * @param paint Paint
     */
    public drawContentGrid(
        canvas: Canvas,
        col: number,
        row: number,
        rect: Rect,
        cellInfo: CellInfo<any>,
        paint: Paint
    ): void {
        this.drawGridPath(
            canvas,
            rect,
            paint,
            this.isShowHorizontalLine(col, row, cellInfo),
            this.isShowVerticalLine(col, row, cellInfo)
        );
    }

    /**
     * Draw the X sequence grid
     * @param canvas Canvas
     * @param col Column
     * @param rect Rect
     * @param paint Paint
     */
    public drawXSequenceGrid(canvas: Canvas, col: number, rect: Rect, paint: Paint): void {
        this.drawGridPath(
            canvas,
            rect,
            paint,
            this.isShowXSequenceHorizontalLine(col),
            this.isShowXSequenceVerticalLine(col)
        );
    }

    /**
     * Draw the Y sequence grid
     * @param canvas Canvas
     * @param row Row
     * @param rect Rect
     * @param paint Paint
     */
    public drawYSequenceGrid(canvas: Canvas, row: number, rect: Rect, paint: Paint): void {
        this.drawGridPath(
            canvas,
            rect,
            paint,
            this.isShowYSequenceHorizontalLine(row),
            this.isShowYSequenceVerticalLine(row)
        );
    }

    /**
     * Draw the count grid
     * @param canvas Canvas
     * @param col Column
     * @param rect Rect
     * @param column Column
     * @param paint Paint
     */
    public drawCountGrid(canvas: Canvas, col: number, rect: Rect, column: Column<any>, paint: Paint): void {
        this.drawGridPath(
            canvas,
            rect,
            paint,
            this.isShowCountHorizontalLine(col, column),
            this.isShowCountVerticalLine(col, column)
        );
    }

    /**
     * Draw the column title grid
     * @param canvas Canvas
     * @param rect Rect
     * @param column Column
     * @param col Column
     * @param paint Paint
     */
    public drawColumnTitleGrid(canvas: Canvas, rect: Rect, column: Column<any>, col: number, paint: Paint): void {
        this.drawGridPath(
            canvas,
            rect,
            paint,
            this.isShowColumnTitleHorizontalLine(col, column),
            this.isShowColumnTitleVerticalLine(col, column)
        );
    }

    /**
     * Draw the table border grid
     * @param canvas Canvas
     * @param left Left
     * @param top Top
     * @param right Right
     * @param bottom Bottom
     * @param paint Paint
     */
    public drawTableBorderGrid(
        canvas: Canvas,
        left: number,
        top: number,
        right: number,
        bottom: number,
        paint: Paint
    ): void {
        canvas.drawRect(left, top, right, bottom, paint);
    }

    /**
     * Draw the left and top grid
     * @param canvas Canvas
     * @param rect Rect
     * @param paint Paint
     */
    public drawLeftAndTopGrid(canvas: Canvas, rect: Rect, paint: Paint): void {
        canvas.drawRect(rect, paint);
    }

    /**
     * Draw the grid path
     * @param canvas Canvas
     * @param rect Rect
     * @param paint Paint
     * @param isShowHorizontal Whether to show horizontal
     * @param isShowVertical Whether to show vertical
     */
    protected drawGridPath(
        canvas: Canvas,
        rect: Rect,
        paint: Paint,
        isShowHorizontal: boolean,
        isShowVertical: boolean
    ): void {
        this.path.rewind();
        if (isShowHorizontal) {
            this.path.moveTo(rect.left, rect.top);
            this.path.lineTo(rect.right, rect.top);
        }
        if (isShowVertical) {
            if (!isShowHorizontal) {
                this.path.moveTo(rect.right, rect.top);
            }
            this.path.lineTo(rect.right, rect.bottom);
        }
        if (isShowHorizontal || isShowVertical) {
            canvas.drawPath(this.path, paint);
        }
    }
}
