import { type Canvas, Paint, Rect } from '../../../utils/temp';
import { DrawUtils } from '../../../utils/DrawUtils';
import { TableConfig } from '../../../core/TableConfig';
import { CellInfo } from '../../CellInfo';
import { Column } from '../../column/Column';
import { TextDrawFormat } from './TextDrawFormat';
import { TextPaint } from '../../../utils/Paint';

export default class MultiLineDrawFormat<T> extends TextDrawFormat<T> {
  private width: number;
  private textPaint: TextPaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);

  constructor(width: number) {
    super();
    this.width = width;
  }

  measureWidth(column: Column<T>, position: number, config: TableConfig): number {
    return this.width;
  }

  measureHeight(column: Column<T>, position: number, config: TableConfig): number {
    config.getContentStyle().fillPaint(this.textPaint);
    const staticLayout = new StaticLayout(
      column.format(position),
      this.textPaint,
      this.width,
      StaticLayout.Alignment.ALIGN_NORMAL,
      1.0,
      0.0,
      false
    );
    return staticLayout.getHeight();
  }

  draw(c: Canvas, rect: Rect, cellInfo: CellInfo<T>, config: TableConfig): void {
    this.setTextPaint(config, cellInfo, this.textPaint);
    if (cellInfo.column.getTextAlign() != null) {
      this.textPaint.setTextAlign(cellInfo.column.getTextAlign());
    }
    const hPadding = config.getHorizontalPadding() * config.getZoom();
    const realWidth = rect.width - 2 * hPadding;
    const staticLayout = new StaticLayout(
      cellInfo.column.format(cellInfo.row),
      this.textPaint,
      realWidth,
      StaticLayout.Alignment.ALIGN_NORMAL,
      1.0,
      0.0,
      false
    );
    c.save();
    c.translate(
      DrawUtils.getTextCenterX(rect.left + hPadding, rect.right - hPadding, this.textPaint),
      rect.top + (rect.height - staticLayout.getHeight()) / 2
    );
    staticLayout.draw(c);
    c.restore();
  }
}
