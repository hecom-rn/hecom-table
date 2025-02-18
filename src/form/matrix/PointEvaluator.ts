import { Point } from '../utils/temp';

export class PointEvaluator implements TypeEvaluator<Point> {
  private point: Point = new Point(0, 0);

  evaluate(fraction: number, startValue: Point, endValue: Point): Point {
    const x = Math.round(startValue.x + fraction * (endValue.x - startValue.x));
    const y = Math.round(startValue.y + fraction * (endValue.y - startValue.y));
    this.point.x = x;
    this.point.y = y;
    return this.point;
  }
}
