import { Paint } from '../utils/Paint';
import { FontStyle } from '../data/style/FontStyle';
import { LineStyle } from '../data/style/LineStyle';
import type { IBackgroundFormat } from '../data/format/bg/IBackgroundFormat';
import type { ICellBackgroundFormat } from '../data/format/bg/ICellBackgroundFormat';
import type { IGridFormat } from '../data/format/grid/IGridFormat';
import { SimpleGridFormat } from '../data/format/grid/SimpleGridFormat';
import { LeftTopDrawFormat } from '../data/format/draw/LeftTopDrawFormat';
import { CellInfo } from '../data/CellInfo';
import { Column } from '../data/column/Column';

export class TableConfig {
  private static readonly defaultFontStyle: FontStyle = new FontStyle();
  private static readonly defaultGridStyle: LineStyle = new LineStyle();
  public static readonly INVALID_COLOR: string = '';

  public dp10?: number;

  private contentStyle: FontStyle;
  private YSequenceStyle: FontStyle;
  private XSequenceStyle: FontStyle;
  private columnTitleStyle: FontStyle;
  private tableTitleStyle: FontStyle;
  private countStyle: FontStyle;
  private columnTitleGridStyle?: LineStyle;
  private SequenceGridStyle?: LineStyle;
  private contentGridStyle?: LineStyle;
  private verticalPadding: number = 10;
  private sequenceVerticalPadding: number = 10;
  private textLeftOffset: number = 0;
  private sequenceHorizontalPadding: number = 40;
  private columnTitleVerticalPadding: number = 10;
  private columnTitleHorizontalPadding: number = 40;
  private horizontalPadding: number = 40;
  private columnTitleBackground?: IBackgroundFormat;
  private contentBackground?: IBackgroundFormat;
  private countBackground?: IBackgroundFormat;
  private YSequenceBackground?: IBackgroundFormat;
  private XSequenceBackground?: IBackgroundFormat;
  private tableGridFormat: IGridFormat = new SimpleGridFormat();
  private _isShowXSequence: boolean = true;
  private _isShowYSequence: boolean = true;
  private _isShowTableTitle: boolean = true;
  private _isShowColumnTitle: boolean = true;
  private contentCellBackgroundFormat?: ICellBackgroundFormat<CellInfo>;
  private columnCellBackgroundFormat?: ICellBackgroundFormat<Column>;
  private XSequenceCellBgFormat?: ICellBackgroundFormat<number>;
  private YSequenceCellBgFormat?: ICellBackgroundFormat<number>;
  private countBgCellFormat?: ICellBackgroundFormat<Column>;
  private fixedYSequence: boolean = false;
  private fixedXSequence: boolean = false;
  private fixedTitle: boolean = true;
  private fixedFirstColumn: boolean = true;
  private fixedCountRow: boolean = true;
  private leftAndTopBackgroundColor: string;
  private leftTopDrawFormat?: LeftTopDrawFormat;
  private minTableWidth: number = -1;
  private paint: Paint;
  private zoom: number = 1;
  private fixedLines: number = 0;

  public getContentStyle(): FontStyle {
    return this.contentStyle || TableConfig.defaultFontStyle;
  }

  public setContentStyle(contentStyle: FontStyle): TableConfig {
    this.contentStyle = contentStyle;
    return this;
  }

  public getYSequenceStyle(): FontStyle {
    return this.YSequenceStyle || TableConfig.defaultFontStyle;
  }

  public setYSequenceStyle(YSequenceStyle: FontStyle): TableConfig {
    this.YSequenceStyle = YSequenceStyle;
    return this;
  }

  public getXSequenceStyle(): FontStyle {
    return this.XSequenceStyle || TableConfig.defaultFontStyle;
  }

  public setXSequenceStyle(XSequenceStyle: FontStyle): TableConfig {
    this.XSequenceStyle = XSequenceStyle;
    return this;
  }

  public getColumnTitleStyle(): FontStyle {
    return this.columnTitleStyle || TableConfig.defaultFontStyle;
  }

  public setColumnTitleStyle(columnTitleStyle: FontStyle): TableConfig {
    this.columnTitleStyle = columnTitleStyle;
    return this;
  }

  public getVerticalPadding(): number {
    return this.verticalPadding;
  }

  public setVerticalPadding(verticalPadding: number): TableConfig {
    this.verticalPadding = verticalPadding;
    return this;
  }

  public getHorizontalPadding(): number {
    return this.horizontalPadding;
  }

  public setHorizontalPadding(horizontalPadding: number): TableConfig {
    this.horizontalPadding = horizontalPadding;
    return this;
  }

  public getPaint(): Paint {
    return this.paint;
  }

  public setPaint(paint: Paint): void {
    this.paint = paint;
  }

  public getContentGridStyle(): LineStyle {
    return this.contentGridStyle || TableConfig.defaultGridStyle;
  }

  public setContentGridStyle(contentGridStyle: LineStyle): TableConfig {
    this.contentGridStyle = contentGridStyle;
    return this;
  }

  public getColumnTitleGridStyle(): LineStyle {
    return this.columnTitleGridStyle || TableConfig.defaultGridStyle;
  }

  public setColumnTitleGridStyle(columnTitleGridStyle: LineStyle): TableConfig {
    this.columnTitleGridStyle = columnTitleGridStyle;
    return this;
  }

  public isFixedYSequence(): boolean {
    return this.fixedYSequence;
  }

  public setFixedYSequence(fixedYSequence: boolean): TableConfig {
    this.fixedYSequence = fixedYSequence;
    return this;
  }

  public isFixedXSequence(): boolean {
    return this.fixedXSequence;
  }

  public setFixedXSequence(fixedXSequence: boolean): TableConfig {
    this.fixedXSequence = fixedXSequence;
    return this;
  }

  public isFixedTitle(): boolean {
    return this.fixedTitle;
  }

  public setFixedTitle(fixedTitle: boolean): TableConfig {
    this.fixedTitle = fixedTitle;
    return this;
  }

  public isFixedFirstColumn(): boolean {
    return this.fixedFirstColumn;
  }

  /**
   * @deprecated
   */
  public setFixedFirstColumn(fixedFirstColumn: boolean): TableConfig {
    this.fixedFirstColumn = fixedFirstColumn;
    return this;
  }

  public getCountStyle(): FontStyle {
    return this.countStyle || TableConfig.defaultFontStyle;
  }

  public setCountStyle(countStyle: FontStyle): TableConfig {
    this.countStyle = countStyle;
    return this;
  }

  public isFixedCountRow(): boolean {
    return this.fixedCountRow;
  }

  public setFixedCountRow(fixedCountRow: boolean): TableConfig {
    this.fixedCountRow = fixedCountRow;
    return this;
  }

  public getTableTitleStyle(): FontStyle {
    return this.tableTitleStyle || TableConfig.defaultFontStyle;
  }

  public setTableTitleStyle(tableTitleStyle: FontStyle): TableConfig {
    this.tableTitleStyle = tableTitleStyle;
    return this;
  }

  public isShowXSequence(): boolean {
    return this._isShowXSequence;
  }

  public setShowXSequence(showXSequence: boolean): TableConfig {
    this._isShowXSequence = showXSequence;
    return this;
  }

  public isShowYSequence(): boolean {
    return this._isShowYSequence;
  }

  public setShowYSequence(showYSequence: boolean): TableConfig {
    this._isShowYSequence = showYSequence;
    return this;
  }

  public getContentCellBackgroundFormat(): ICellBackgroundFormat<CellInfo> {
    return this.contentCellBackgroundFormat;
  }

  public setContentCellBackgroundFormat(contentCellBackgroundFormat: ICellBackgroundFormat<CellInfo>): TableConfig {
    this.contentCellBackgroundFormat = contentCellBackgroundFormat;
    return this;
  }

  public getColumnCellBackgroundFormat(): ICellBackgroundFormat<Column> {
    return this.columnCellBackgroundFormat;
  }

  public setColumnCellBackgroundFormat(columnCellBackgroundFormat: ICellBackgroundFormat<Column>): TableConfig {
    this.columnCellBackgroundFormat = columnCellBackgroundFormat;
    return this;
  }

  public getXSequenceCellBgFormat(): ICellBackgroundFormat<number> {
    return this.XSequenceCellBgFormat;
  }

  public setXSequenceCellBgFormat(XSequenceCellBgFormat: ICellBackgroundFormat<number>): TableConfig {
    this.XSequenceCellBgFormat = XSequenceCellBgFormat;
    return this;
  }

  public getYSequenceCellBgFormat(): ICellBackgroundFormat<number> {
    return this.YSequenceCellBgFormat;
  }

  public setYSequenceCellBgFormat(YSequenceCellBgFormat: ICellBackgroundFormat<number>): TableConfig {
    this.YSequenceCellBgFormat = YSequenceCellBgFormat;
    return this;
  }

  public getCountBgCellFormat(): ICellBackgroundFormat<Column> {
    return this.countBgCellFormat;
  }

  public setCountBgCellFormat(countBgCellFormat: ICellBackgroundFormat<Column>): TableConfig {
    this.countBgCellFormat = countBgCellFormat;
    return this;
  }

  public getZoom(): number {
    return this.zoom;
  }

  public setZoom(zoom: number): void {
    this.zoom = zoom;
  }

  public getFixedLines(): number {
    return this.fixedLines;
  }

  public setFixedLines(fixedLines: number): TableConfig {
    this.fixedLines = fixedLines;
    return this;
  }

  public getColumnTitleHorizontalPadding(): number {
    return this.columnTitleHorizontalPadding;
  }

  public setColumnTitleHorizontalPadding(columnTitleHorizontalPadding: number): TableConfig {
    this.columnTitleHorizontalPadding = columnTitleHorizontalPadding;
    return this;
  }

  public isShowTableTitle(): boolean {
    return this._isShowTableTitle;
  }

  public setShowTableTitle(showTableTitle: boolean): TableConfig {
    this._isShowTableTitle = showTableTitle;
    return this;
  }

  public isShowColumnTitle(): boolean {
    return this._isShowColumnTitle;
  }

  public setShowColumnTitle(showColumnTitle: boolean): TableConfig {
    this._isShowColumnTitle = showColumnTitle;
    return this;
  }

  public getLeftAndTopBackgroundColor(): string {
    return this.leftAndTopBackgroundColor;
  }

  public setLeftAndTopBackgroundColor(leftAndTopBackgroundColor: string): TableConfig {
    this.leftAndTopBackgroundColor = leftAndTopBackgroundColor;
    return this;
  }

  public getLeftTopDrawFormat(): LeftTopDrawFormat {
    return this.leftTopDrawFormat;
  }

  public setLeftTopDrawFormat(leftTopDrawFormat: LeftTopDrawFormat): void {
    this.leftTopDrawFormat = leftTopDrawFormat;
  }

  public getSequenceGridStyle(): LineStyle {
    return this.SequenceGridStyle || TableConfig.defaultGridStyle;
  }

  public setSequenceGridStyle(sequenceGridStyle: LineStyle): TableConfig {
    this.SequenceGridStyle = sequenceGridStyle;
    return this;
  }

  public getMinTableWidth(): number {
    return this.minTableWidth;
  }

  public setMinTableWidth(minTableWidth: number): TableConfig {
    this.minTableWidth = minTableWidth;
    return this;
  }

  public getYSequenceBackground(): IBackgroundFormat {
    return this.YSequenceBackground;
  }

  public setYSequenceBackground(YSequenceBackground: IBackgroundFormat): TableConfig {
    this.YSequenceBackground = YSequenceBackground;
    return this;
  }

  public getColumnTitleVerticalPadding(): number {
    return this.columnTitleVerticalPadding;
  }

  public setColumnTitleVerticalPadding(columnTitleVerticalPadding: number): TableConfig {
    this.columnTitleVerticalPadding = columnTitleVerticalPadding;
    return this;
  }

  public getColumnTitleBackground(): IBackgroundFormat {
    return this.columnTitleBackground;
  }

  public setColumnTitleBackground(columnTitleBackground: IBackgroundFormat): TableConfig {
    this.columnTitleBackground = columnTitleBackground;
    return this;
  }

  public getContentBackground(): IBackgroundFormat {
    return this.contentBackground;
  }

  public setContentBackground(contentBackground: IBackgroundFormat): TableConfig {
    this.contentBackground = contentBackground;
    return this;
  }

  public getCountBackground(): IBackgroundFormat {
    return this.countBackground;
  }

  public setCountBackground(countBackground: IBackgroundFormat): TableConfig {
    this.countBackground = countBackground;
    return this;
  }

  public getXSequenceBackground(): IBackgroundFormat {
    return this.XSequenceBackground;
  }

  public setXSequenceBackground(XSequenceBackground: IBackgroundFormat): TableConfig {
    this.XSequenceBackground = XSequenceBackground;
    return this;
  }

  public getTableGridFormat(): IGridFormat {
    return this.tableGridFormat;
  }

  public setTableGridFormat(tableGridFormat: IGridFormat): TableConfig {
    this.tableGridFormat = tableGridFormat;
    return this;
  }

  public getSequenceVerticalPadding(): number {
    return this.sequenceVerticalPadding;
  }

  public setSequenceVerticalPadding(sequenceVerticalPadding: number): TableConfig {
    this.sequenceVerticalPadding = sequenceVerticalPadding;
    return this;
  }

  public getSequenceHorizontalPadding(): number {
    return this.sequenceHorizontalPadding;
  }

  public setSequenceHorizontalPadding(sequenceHorizontalPadding: number): TableConfig {
    this.sequenceHorizontalPadding = sequenceHorizontalPadding;
    return this;
  }

  public getTextLeftOffset(): number {
    return this.textLeftOffset;
  }

  public setTextLeftOffset(textLeftOffset: number): TableConfig {
    this.textLeftOffset = textLeftOffset;
    return this;
  }
}
