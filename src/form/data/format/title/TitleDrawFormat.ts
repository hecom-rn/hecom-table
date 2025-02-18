import { type Canvas, Paint, Rect } from '../../../utils/temp';
import { Column } from '../../column/Column';
import { TableConfig } from '../../../core/TableConfig';
import { DrawUtils } from '../../../utils/DrawUtils';
import { type ITitleDrawFormat } from './ITitleDrawFormat';

export class TitleDrawFormat implements ITitleDrawFormat {
  private _isDrawBg: boolean = false;

  public measureWidth(column: Column, config: TableConfig): number {
    const paint = config.getPaint();
    config.getColumnTitleStyle().fillPaint(paint);
    return Math.floor(paint.measureText(column.getColumnName()));
  }

  public measureHeight(config: TableConfig): number {
    const paint = config.getPaint();
    config.getColumnTitleStyle().fillPaint(paint);
    return DrawUtils.getTextHeight(config.getPaint(), config.getColumnTitleStyle());
  }

  public draw(canvas: Canvas, column: Column, rect: Rect, config: TableConfig): void {
    const paint = config.getPaint();
    const isDrawBg = this.drawBackground(canvas, column, rect, config);
    config.getColumnTitleStyle().fillPaint(paint);
    const backgroundFormat = config.getColumnCellBackgroundFormat();

    paint.setTextSize(paint.getTextSize() * config.getZoom());
    if (isDrawBg && backgroundFormat.getTextColor(column) !== TableConfig.INVALID_COLOR) {
      paint.setColor(backgroundFormat.getTextColor(column));
    }
    this.drawText(canvas, column, rect, paint);
  }

  private drawText(canvas: Canvas, column: Column, rect: Rect, paint: Paint): void {
    if (column.getTitleAlign() != null) {
      paint.setTextAlign(column.getTitleAlign());
    }
    canvas.drawText(
      column.getColumnName(),
      DrawUtils.getTextCenterX(rect.left, rect.right, paint),
      DrawUtils.getTextCenterY((rect.bottom + rect.top) / 2, paint),
      paint
    );
  }

  public drawBackground(canvas: Canvas, column: Column, rect: Rect, config: TableConfig): boolean {
    const backgroundFormat = config.getColumnCellBackgroundFormat();
    if (this._isDrawBg && backgroundFormat != null) {
      backgroundFormat.drawBackground(canvas, rect, column, config.getPaint());
      return true;
    }
    return false;
  }

  public isDrawBg(): boolean {
    return this._isDrawBg;
  }

  public setDrawBg(drawBg: boolean): void {
    this._isDrawBg = drawBg;
  }
}
