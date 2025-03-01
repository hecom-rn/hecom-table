import type { TableConfig } from '../../../core/TableConfig';
import { type Canvas, Rect } from '../../../utils/temp';
import type { CellInfo } from '../../CellInfo';
import { ImageResDrawFormat } from './ImageResDrawFormat';

/**
 * 左上角格式化
 */
export abstract class LeftTopDrawFormat extends ImageResDrawFormat<string> {
    public constructor() {
        super(20, 20);
    }

    protected getResourceID(s: string, value: string, position: number): number {
        return this.getResourceID();
    }

    protected abstract getResourceID(): number;

    public setImageSize(w: number, h: number): void {
        this.setImageWidth(w);
        this.setImageHeight(h);
    }

    draw(c: Canvas, rect: Rect, cellInfo: CellInfo<string>, config: TableConfig): void {
        //为了保持三角形不变形，不跟随缩放
        const zoom = config.getZoom();
        config.setZoom(zoom > 1 ? 1 : zoom);
        super.draw(c, rect, cellInfo, config);
        config.setZoom(zoom);
    }
}
