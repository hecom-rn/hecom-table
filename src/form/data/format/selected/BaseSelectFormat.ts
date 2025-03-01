import type { TableConfig } from '../../../core/TableConfig';
import { type Canvas, Rect, Style } from '../../../utils/temp';
import type { ISelectFormat } from './ISelectFormat';

/**
 * 选中操作格式化
 */
export class BaseSelectFormat implements ISelectFormat {
    public draw(canvas: Canvas, rect: Rect, showRect: Rect, config: TableConfig): void {
        const paint = config.getPaint();
        paint.setColor('#3A5FCD');
        paint.setStyle(Style.STROKE);
        paint.setStrokeWidth(3);
        canvas.drawRect(rect, paint);
        paint.setStyle(Style.FILL);
        canvas.drawRect(rect.left - 10, rect.top - 10, rect.left + 10, rect.top + 10, paint);
        canvas.drawRect(rect.right - 10, rect.bottom - 10, rect.right + 10, rect.bottom + 10, paint);
    }
}
