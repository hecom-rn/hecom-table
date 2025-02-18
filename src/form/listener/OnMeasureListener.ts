export default interface OnMeasureListener {
  onContentSizeChanged(width: number, height: number): void;

  onDidLayout(): void;
}
