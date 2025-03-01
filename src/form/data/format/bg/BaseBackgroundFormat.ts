import { type Canvas, Paint, Rect, Style } from '../../../utils/temp';
import { TableConfig } from '../../../core/TableConfig';
import { type IBackgroundFormat } from './IBackgroundFormat';

export class BaseBackgroundFormat implements IBackgroundFormat {
    private backgroundColor: string;

    constructor(backgroundColor: string) {
        this.backgroundColor = backgroundColor;
    }

    public drawBackground(canvas: Canvas, rect: Rect, paint: Paint): void {
        if (this.backgroundColor !== TableConfig.INVALID_COLOR) {
            paint.setColor(this.backgroundColor);
            paint.setStyle(Style.FILL);
            canvas.drawRect(rect, paint);
        }
    }
}
