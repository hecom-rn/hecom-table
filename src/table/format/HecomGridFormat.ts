import type { SmartTable } from '../../form/core/SmartTable';
import type { CellInfo } from '../../form/data/CellInfo';
import { BaseGridFormat } from '../../form/data/format/grid/BaseGridFormat';
import type { Canvas } from '../../form/utils/Canvas';
import { Color, Paint, Style } from '../../form/utils/Paint';
import type { Rect } from '../../form/utils/temp';
import type { Cell } from '../bean/Cell';

export class HecomGridFormat extends BaseGridFormat {
    static readonly NORMAL = 0;
    static readonly TOP = 1;
    static readonly RIGHT = 2;
    static readonly BOTTOM = 4;
    static readonly LEFT = 8;

    private table: SmartTable<any>;

    /**
     * 特殊边标记，0代表无特殊颜色，非零代表有特殊颜色，四个数值依次代表上、右、下、左。
     */
    private mGridType: number[] = [
        HecomGridFormat.NORMAL,
        HecomGridFormat.NORMAL,
        HecomGridFormat.NORMAL,
        HecomGridFormat.NORMAL,
    ];
    private mClassificationLineColor: string = Color.BLACK;
    private mBoxLineColor: string = Color.BLACK;
    private mForbidden: boolean | null = null;
    private mBoxLinePaint: Paint;
    private mGridPaint: Paint;

    constructor(table: SmartTable<any>) {
        super();
        this.table = table;
        this.mBoxLinePaint = new Paint('');
        this.mBoxLinePaint.setStyle(Style.STROKE);
        this.mGridPaint = new Paint('');
        this.mGridPaint.setStyle(Style.STROKE);
    }

    public drawContentGrid(canvas: Canvas, col: number, row: number, rect: Rect, cellInfo: CellInfo): void {
        this.fillGridType(cellInfo);
        const defColor = this.table.getConfig().getContentGridStyle().getColor();
        const gridPaint = this.createPaint(
            this.mGridPaint,
            defColor,
            this.table.getConfig().getContentGridStyle().getWidth()
        );

        if (this.needDraw()) {
            const spColor = this.mClassificationLineColor;

            gridPaint.setColor(this.mGridType[0] !== HecomGridFormat.NORMAL ? spColor : defColor);
            canvas.drawLine(rect.left, rect.top, rect.right, rect.top, gridPaint);

            gridPaint.setColor(this.mGridType[1] !== HecomGridFormat.NORMAL ? spColor : defColor);
            canvas.drawLine(rect.right, rect.top, rect.right, rect.bottom, gridPaint);

            gridPaint.setColor(this.mGridType[2] !== HecomGridFormat.NORMAL ? spColor : defColor);
            canvas.drawLine(rect.right, rect.bottom, rect.left, rect.bottom, gridPaint);

            gridPaint.setColor(this.mGridType[3] !== HecomGridFormat.NORMAL ? spColor : defColor);
            canvas.drawLine(rect.left, rect.bottom, rect.left, rect.top, gridPaint);
        } else {
            if (this.mClassificationLineColor !== Color.BLACK) {
                gridPaint.setColor(this.mClassificationLineColor);
            }
            super.drawContentGrid(canvas, col, row, rect, cellInfo, gridPaint);
        }

        if (this.mForbidden !== null && this.mForbidden) {
            canvas.drawLine(rect.left, rect.top, rect.right, rect.bottom, this.mGridPaint);
        }

        if (this.mBoxLineColor !== Color.BLACK) {
            const boxPaint = this.createPaint(this.mBoxLinePaint, this.mBoxLineColor, gridPaint.getLineWidth() * 4);
            const strokeWidth = gridPaint.getLineWidth();
            canvas.drawLine(
                rect.left + strokeWidth,
                rect.top + strokeWidth,
                rect.width - strokeWidth * 2,
                rect.height - strokeWidth * 2,
                boxPaint
            );
        }
    }

    public drawTableBorderGrid(ctx: Canvas, left: number, top: number, right: number, bottom: number): void {
        const gridPaint = this.createPaint(
            this.mGridPaint,
            this.table.getConfig().getContentGridStyle().getColor(),
            this.table.getConfig().getContentGridStyle().getWidth()
        );
        super.drawTableBorderGrid(ctx, left, top, right, bottom, gridPaint);
    }

    private getColor(): string {
        return '#00FF00'; // this.table.getHecomStyle().getLineColor();
    }

    private fillGridType(cellInfo: CellInfo): void {
        const bean = cellInfo.data as Cell;
        const position = bean.getClassificationLinePosition();
        this.mForbidden = bean.isForbidden();
        this.mClassificationLineColor = bean.getClassificationLineColor();
        this.mBoxLineColor = bean.getBoxLineColor();
        this.mGridType[0] = position & HecomGridFormat.TOP;
        this.mGridType[1] = position & HecomGridFormat.RIGHT;
        this.mGridType[2] = position & HecomGridFormat.BOTTOM;
        this.mGridType[3] = position & HecomGridFormat.LEFT;
    }

    private needDraw(): boolean {
        return this.mGridType.some((type) => type !== HecomGridFormat.NORMAL);
    }

    private createPaint(paint: Paint, color: string, lineWidth: number): Paint {
        paint.setColor(color);
        paint.setStrokeWidth(lineWidth);
        return paint;
    }
}
