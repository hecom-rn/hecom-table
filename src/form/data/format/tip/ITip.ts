import type { Canvas, Rect } from '../../../utils/temp';

export interface ITip<C, S> {
  /**
   * Draw the tip on the canvas
   * @param canvas The canvas to draw on
   * @param x The x-coordinate
   * @param y The y-coordinate
   * @param rect The rectangle area
   * @param content The content to draw
   * @param position The position of the content
   */
  drawTip(canvas: Canvas, x: number, y: number, rect: Rect, content: C, position: number): void;

  /**
   * Check if the tip should be shown
   * @param content The content to check
   * @param position The position of the content
   * @return Whether the tip should be shown
   */
  isShowTip(content: C, position: number): boolean;

  /**
   * Format the content
   * @param content The content to format
   * @param position The position of the content
   * @return The formatted content
   */
  format(content: C, position: number): S;
}
