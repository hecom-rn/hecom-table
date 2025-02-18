import type { Align } from '../../utils/Paint';

export interface IForm {
  getSpanWidthSize(): number;

  getSpanHeightSize(): number;

  getAlign(): Align;
}
