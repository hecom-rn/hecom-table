import type { TableConfig } from '../../../core/TableConfig';
import { DrawUtils } from '../../../utils/DrawUtils';
import { Align, type Canvas, type Rect } from '../../../utils/temp';
import type { ISequenceFormat } from './ISequenceFormat';

/**
 * Created by huang on 2018/3/21.
 */
export abstract class BaseSequenceFormat implements ISequenceFormat {
  public draw(canvas: Canvas, sequence: number, rect: Rect, config: TableConfig): void {
    //字体缩放
    const paint = config.getPaint();
    paint.setTextSize(paint.getTextSize() * (config.getZoom() > 1 ? 1 : config.getZoom()));
    paint.setTextAlign(Align.CENTER);
    canvas.drawText(this.format(sequence + 1), rect.centerX, DrawUtils.getTextCenterY(rect.centerY, paint), paint);
  }

  abstract format(sequence: number): string;
}
