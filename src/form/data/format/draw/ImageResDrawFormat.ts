import { BitmapFactory, type Bitmap, type Context, Options } from '../../../utils/temp';
import { BitmapDrawFormat } from './BitmapDrawFormat';

/**
 * 图片资源绘制格式化
 */
export abstract class ImageResDrawFormat<T> extends BitmapDrawFormat<T> {
  private options: Options = new Options();
  //使用缓存
  private cache: Map<number, Bitmap>;

  public constructor(imageWidth: number, imageHeight: number, options?: Options) {
    super(imageWidth, imageHeight);
    this.options = options;
    this.cache = new Map<number, Bitmap>();
  }

  getBitmap(t: T, value: string, position: number): Bitmap {
    const resID: number = this.getResourceID(t, value, position);
    let bitmap: Bitmap = this.cache.get(resID);
    if (bitmap == null) {
      bitmap = BitmapFactory.decodeResource(this.getContext().getResources(), resID, this.options);
      if (bitmap != null) {
        this.cache.set(resID, bitmap);
      }
    }
    return bitmap;
  }

  protected abstract getContext(): Context;

  protected abstract getResourceID(t: T, value: string, position: number): number;
}
