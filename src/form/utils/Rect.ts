export class Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;

  constructor();
  constructor(showRect: Rect);
  constructor(left: number, top: number, right: number, bottom: number);

  constructor(left?: number | Rect, top?: number, right?: number, bottom?: number) {
    if (left instanceof Rect) {
      this.left = left.left || 0;
      this.top = left.top;
      this.right = left.right;
      this.bottom = left.bottom;
    } else {
      this.left = left || 0;
      this.top = top || 0;
      this.right = right || 0;
      this.bottom = bottom || 0;
    }
  }

  get width() {
    return this.right - this.left;
  }

  get height() {
    return this.bottom - this.top;
  }

  get centerX() {
    return (this.left + this.right) / 2;
  }

  get centerY() {
    return (this.top + this.bottom) / 2;
  }

  get center() {
    return {
      x: this.centerX,
      y: this.centerY,
    };
  }

  clone() {
    return new Rect(this.left, this.top, this.right, this.bottom);
  }

  contains(x: number, y: number) {
    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
  }

  containRect(rect: Rect) {
    return rect.left >= this.left && rect.right <= this.right && rect.top >= this.top && rect.bottom <= this.bottom;
  }

  set(showRect: Rect): void;

  set(left: number, top: number, right: number, bottom: number): void;

  set(leftOrShowRect: number | Rect, top?: number, right?: number, bottom?: number) {
    if (leftOrShowRect instanceof Rect) {
      this.left = leftOrShowRect.left;
      this.top = leftOrShowRect.top;
      this.right = leftOrShowRect.right;
      this.bottom = leftOrShowRect.bottom;
    } else {
      this.left = leftOrShowRect;
      this.top = top!;
      this.right = right!;
      this.bottom = bottom!;
    }
  }
}
