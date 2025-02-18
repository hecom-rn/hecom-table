export class Paint {
  static ANTI_ALIAS_FLAG: string = 'ANTI_ALIAS_FLAG';

  constructor(flag: string) {}

  measureText(text: string): number {
    return 0;
  }

  setColor(textColor: string) {}

  setTextAlign(align: Align) {}

  setTextSize(textSize: number) {}

  setStyle(style: Style) {}

  setStrokeWidth(width: number) {}

  setPathEffect(effect: PathEffect) {}

  getTextSize() {
    return 0;
  }

  getFontMetrics() {
    return {
      descent: 0,
      ascent: 0,
    };
  }

  descent() {
    return 0;
  }

  ascent() {
    return 0;
  }

  getTextAlign() {
    return Align.CENTER;
  }
}

export class TextPaint extends Paint {}

export enum Color {
  BLACK = '#000',
}

export enum Style {
  FILL = 'fill',
  STROKE = 'stroke',
}

export enum Align {
  CENTER = 'center',
  LEFT = 'left',
  RIGHT = 'right',
}
