import { TableConfig } from '../core/TableConfig';
import type { TableData } from '../data/table/TableData';
import type { IComponent } from './IComponent';
import type { ISequenceFormat } from '../data/format/sequence/ISequenceFormat';
import { Rect, type Canvas } from '../utils/temp';
import { DrawUtils } from '../utils/DrawUtils';

export class XSequence<T> implements IComponent<TableData<T>> {
  private rect: Rect;
  private height: number;
  private clipHeight: number;
  private format: ISequenceFormat;
  private clipRect: Rect;
  private tempRect: Rect; // Temporary use
  private scaleRect: Rect;

  constructor() {
    this.rect = new Rect();
    this.clipRect = new Rect();
    this.tempRect = new Rect();
  }

  onMeasure(scaleRect: Rect, showRect: Rect, config: TableConfig): void {
    const fixed = config.isFixedXSequence();
    const scaleHeight = (config.getZoom() > 1 ? 1 : config.getZoom()) * this.height;
    this.rect.top = fixed ? showRect.top : scaleRect.top;
    this.rect.bottom = this.rect.top + scaleHeight;
    this.rect.left = scaleRect.left;
    this.rect.right = scaleRect.right;

    if (fixed) {
      scaleRect.top += scaleHeight;
      showRect.top += scaleHeight;
      this.clipHeight = scaleHeight;
    } else {
      const dis = showRect.top - scaleRect.top;
      this.clipHeight = Math.max(0, scaleHeight - dis);
      showRect.top += this.clipHeight;
      scaleRect.top += scaleHeight;
    }
    this.scaleRect = scaleRect;
  }

  onDraw(canvas: Canvas, showRect: Rect, tableData: TableData<T>, config: TableConfig): void {
    this.format = tableData.getXSequenceFormat();
    const columns = tableData.getChildColumns();
    const columnSize = columns.length;
    let left = this.rect.left;
    const showTop = showRect.top - this.clipHeight;

    canvas.save();
    canvas.clipRect(showRect.left, showTop, showRect.right, showRect.top);
    this.drawBackground(canvas, showRect, config, showTop);

    this.clipRect.set(showRect);
    let isPerColumnFixed = false;
    let clipCount = 0;
    const childColumnInfos = tableData.getChildColumnInfos();

    for (let i = 0; i < columnSize; i++) {
      const column = columns[i];
      const width = column.getComputeWidth() * config.getZoom();
      const right = left + width;

      if (childColumnInfos[i].getTopParent().column.isFixed()) {
        if (left < this.clipRect.left) {
          isPerColumnFixed = true;
          this.showTextNum(canvas, showRect, config, this.clipRect.left, i, this.clipRect.left + width);
          this.clipRect.left += width;
          left += width;
          continue;
        }
      } else if (isPerColumnFixed) {
        isPerColumnFixed = false;
        clipCount++;
        canvas.save();
        canvas.clipRect(this.clipRect.left, this.rect.top, showRect.right, this.rect.bottom);
      }

      if (showRect.right >= left) {
        left = this.showTextNum(canvas, showRect, config, left, i, right);
      } else {
        break;
      }
    }

    for (let i = 0; i < clipCount; i++) {
      canvas.restore();
    }
    canvas.restore();
  }

  protected drawBackground(canvas: Canvas, showRect: Rect, config: TableConfig, showTop: number): void {
    if (config.getXSequenceBackground() !== null) {
      this.tempRect.set(
        Math.max(this.scaleRect.left, showRect.left),
        showTop,
        Math.min(showRect.right, this.scaleRect.right),
        showRect.top
      );
      config.getXSequenceBackground().drawBackground(canvas, this.tempRect, config.getPaint());
    }
  }

  private showTextNum(
    canvas: Canvas,
    showRect: Rect,
    config: TableConfig,
    left: number,
    i: number,
    right: number
  ): number {
    if (DrawUtils.isMixHorizontalRect(showRect, left, right)) {
      this.draw(canvas, left, this.rect.top, right, this.rect.bottom, i, config);
    }
    return right;
  }

  private draw(
    canvas: Canvas,
    left: number,
    top: number,
    right: number,
    bottom: number,
    position: number,
    config: TableConfig
  ): void {
    const paint = config.getPaint();
    this.tempRect.set(left, top, right, bottom);

    const backgroundFormat = config.getXSequenceCellBgFormat();
    if (backgroundFormat !== null) {
      backgroundFormat.drawBackground(canvas, this.tempRect, position, paint);
    }

    if (config.getTableGridFormat() !== null) {
      config.getSequenceGridStyle().fillPaint(paint);
      config.getTableGridFormat().drawXSequenceGrid(canvas, position, this.tempRect, paint);
    }

    config.getXSequenceStyle().fillPaint(paint);

    if (backgroundFormat !== null && backgroundFormat.getTextColor(position) !== TableConfig.INVALID_COLOR) {
      paint.setColor(backgroundFormat.getTextColor(position));
    }

    this.format.draw(canvas, position, this.tempRect, config);
  }

  getRect(): Rect {
    return this.rect;
  }

  getHeight(): number {
    return this.height;
  }

  setHeight(height: number): void {
    this.height = height;
  }
}
