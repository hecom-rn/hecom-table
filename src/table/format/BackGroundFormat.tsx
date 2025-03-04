import { TableConfig } from '../../form/core/TableConfig';
import type { CellInfo } from '../../form/data/CellInfo';
import { BaseCellBackgroundFormat } from '../../form/data/format/bg/BaseCellBackgroundFormat';
import type { Canvas } from '../../form/utils/Canvas';
import { Paint, Style } from '../../form/utils/Paint';
import { Rect } from '../../form/utils/Rect';
import type { Cell } from '../bean/Cell';
import type { AntsLineStyle } from '../bean/ProgressStyle';
import type { HecomTable } from '../HecomTable';

// 具体实现类
export class BackgroundFormat extends BaseCellBackgroundFormat<CellInfo> {
    private readonly table: HecomTable;
    private readonly bgPaint: Paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private readonly progressPaint: Paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private readonly antsLinePaint: Paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private readonly progress: Rect = new Rect();

    constructor(table: HecomTable) {
        super();
        this.table = table;
        this.bgPaint.setStyle(Style.FILL);
        this.progressPaint.setStyle(Style.FILL);
    }

    override getBackGroundColor(cellInfo: CellInfo): string {
        const tableBean = cellInfo.data as Cell;
        const color = tableBean.getBackgroundColor();
        return color !== TableConfig.INVALID_COLOR ? color : this.table?.getHecomStyle()?.getBackgroundColor() || '';
    }

    override drawBackground(canvas: Canvas, rect: Rect, t: CellInfo, paint: Paint): void {
        const color = this.getBackGroundColor(t);
        if (color !== TableConfig.INVALID_COLOR) {
            this.bgPaint.setColor(color);
            canvas.drawRect(rect, this.bgPaint);
        }
        this.drawProgress(canvas, rect, t);
    }

    private drawProgress(canvas: Canvas, rect: Rect, t: CellInfo): void {
        const cell = t.data as Cell;
        const style = cell.getProgressStyle();

        if (style) {
            const defStyle = this.table.getProgressStyle();
            const marginHor = style.getMarginHorizontal() || defStyle?.getMarginHorizontal() || 0;
            const radius = style.getRadius() || defStyle?.getRadius() || 0;
            const width = rect.width - 2 * marginHor;
            const height = style.getHeight() || defStyle?.getHeight() || 0;

            if (width <= 0) return;

            this.progress.left = rect.left + marginHor + width * style.getStartRatio();
            this.progress.right = rect.left + marginHor + width * style.getEndRatio();
            this.progress.top = rect.centerY - height / 2;
            this.progress.bottom = rect.centerY + height / 2;

            // const linearGradient = new LinearGradient(
            //     this.progress.left,
            //     this.progress.top,
            //     this.progress.right,
            //     this.progress.top,
            //     style.getColors(),
            //     null,
            //     TileMode.CLAMP
            // );
            // this.progressPaint.setShader(linearGradient);
            canvas.drawRoundRect(this.progress, radius, radius, this.progressPaint);
            this.drawAntsLine(canvas, rect, style.getAntsLineStyle(), marginHor);
        }
    }

    private drawAntsLine(canvas: Canvas, rect: Rect, style: AntsLineStyle | undefined, marginHor: number): void {
        if (!style) return;

        const defStyle = this.table.getProgressStyle()?.getAntsLineStyle();
        this.antsLinePaint.setColor(
            style.getColor() !== TableConfig.INVALID_COLOR ? style.getColor() : defStyle!.getColor()
        );
        this.antsLinePaint.setStrokeWidth(style.getWidth() || defStyle!.getWidth());
        this.antsLinePaint.setStyle(Style.STROKE);
        // this.antsLinePaint.setPathEffect(new DashPathEffect(style.getDashPattern() ?? defStyle!.getDashPattern(), 0));

        const startX = rect.left + marginHor + (rect.width - 2 * marginHor) * style.getRatio();
        canvas.drawLine(startX, rect.top, startX, rect.bottom, this.antsLinePaint);
    }

    override getTextColor(cellInfo: CellInfo): string {
        return TableConfig.INVALID_COLOR;
    }
}
