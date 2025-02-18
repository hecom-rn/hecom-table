import React, { Component } from 'react';
import { Align, type Canvas, CanvasImpl, Paint, Rect, TextPaint } from '../utils/temp';
import { Direction } from '../component/IComponent';
import type { ITableTitle } from '../component/ITableTitle';
import { TableProvider } from '../component/TableProvider';
import { TableTitle } from '../component/TableTitle';
import { XSequence } from '../component/XSequence';
import { YSequence } from '../component/YSequence';
import { Column } from '../data/column/Column';
import type { ISelectFormat } from '../data/format/selected/ISelectFormat';
import { FontStyle } from '../data/style/FontStyle';
import { TableData } from '../data/table/TableData';
import type { OnColumnClickListener } from '../listener/OnColumnClickListener';
import type { OnTableChangeListener } from '../listener/OnTableChangeListener';
import { MatrixHelper } from '../matrix/MatrixHelper';

import { TableMeasurer } from './TableMeasurer';
import { TableParser } from './TableParser';
import { TableConfig } from './TableConfig';
import { SVGRenderer } from '../../svg/SVGRenderer';
import * as zrender from 'zrender/lib/zrender';
import { type ZRenderType } from 'zrender/lib/zrender';
import { Dimensions, View, type ViewProps } from 'react-native';
import SvgChart from '../../svg/svgChart';

interface TableProps extends ViewProps {
  isYSequenceRight: boolean;
}

SVGRenderer(zrender);

/**
 * 表格组件
 */
export class SmartTable<T> extends Component<TableProps> implements OnTableChangeListener {
  static defaultProps: Partial<TableProps> = {
    isYSequenceRight: false,
  };
  private xAxis: XSequence<T> = new XSequence<T>();
  private yAxis: YSequence<T> = new YSequence<T>();
  private tableTitle: ITableTitle;
  private provider: TableProvider<T>;
  private showRect: Rect;
  private config: TableConfig;
  private parser: TableParser<T>;
  private tableData: TableData<T>;
  private defaultHeight: number = 300;
  private defaultWidth: number = 300;
  private measurer: TableMeasurer<T>;
  // private annotationParser: AnnotationParser<T>;
  protected paint: Paint;
  protected textPaint: TextPaint;
  private matrixHelper: MatrixHelper;
  private isExactly: boolean = true; // 是否是测量精准模式

  constructor(props: TableProps) {
    super(props);
    FontStyle.setDefaultTextSize(14);
    this.config = new TableConfig();
    this.config.dp10 = 10;
    this.paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    this.textPaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
    this.textPaint.setTextAlign(Align.CENTER);
    this.textPaint.setTextSize(new FontStyle().getTextSize());
    this.showRect = new Rect();
    this.parser = new TableParser<T>();
    this.provider = new TableProvider<T>();
    this.config.setPaint(this.paint);
    this.measurer = new TableMeasurer<T>();
    this.tableTitle = new TableTitle();
    this.tableTitle.setDirection(Direction.TOP);
    this.matrixHelper = new MatrixHelper(this);
    this.matrixHelper.setOnTableChangeListener(this);
    this.matrixHelper.register(this.provider);
    this.matrixHelper.setOnInterceptListener(this.provider.getOperation());
    this.provider.setMatrixHelper(this.matrixHelper);
  }

  containerRef: SvgChart;
  zrender: ZRenderType;
  canvas: Canvas;

  componentDidMount() {
    // 初始化 ZRender 实例
    this.zrender = zrender.init(this.containerRef, {
      renderer: 'svg',
    });
    this.canvas = new CanvasImpl(this.zrender);
  }

  componentWillUnmount() {
    this.zrender.dispose(); // 组件卸载时销毁 ZRender 实例
  }

  componentDidUpdate() {
    this.onDraw(this.canvas);
  }

  public render() {
    return (
      <View style={this.props.style}>
        <SvgChart useRNGH ref={(ref: SvgChart) => (this.containerRef = ref)} style={{ backgroundColor: 'gray' }} />
      </View>
    );
  }

  protected onDraw(canvas: Canvas): void {
    // this.setScrollY(0);
    // this.showRect.set(
    //   this.getPaddingLeft(),
    //   this.getPaddingTop(),
    //   this.getWidth() - this.getPaddingRight(),
    //   this.getHeight() - this.getPaddingBottom()
    // );
    if (this.tableData != null) {
      const rect = this.tableData.getTableInfo().getTableRect();
      if (rect != null) {
        if (this.config.isShowTableTitle()) {
          this.measurer.measureTableTitle(this.tableData, this.tableTitle, this.showRect);
        }
        const scaleRect = this.matrixHelper.getZoomProviderRect(this.showRect, rect, this.tableData.getTableInfo());
        if (this.config.isShowTableTitle()) {
          this.tableTitle.onMeasure(scaleRect, this.showRect, this.config);
          this.tableTitle.onDraw(canvas, this.showRect, this.tableData.getTableName(), this.config);
        }
        if (this.config.isShowYSequence()) {
          this.yAxis.onMeasure(scaleRect, this.showRect, this.config);
          if (this.props.isYSequenceRight) {
            canvas.save();
            canvas.translate(this.showRect.width, 0);
            this.yAxis.onDraw(canvas, this.showRect, this.tableData, this.config);
            canvas.restore();
          } else {
            this.yAxis.onDraw(canvas, this.showRect, this.tableData, this.config);
          }
        }
        if (this.config.isShowXSequence()) {
          this.xAxis.onMeasure(scaleRect, this.showRect, this.config);
          this.xAxis.onDraw(canvas, this.showRect, this.tableData, this.config);
        }
        if (this.props.isYSequenceRight) {
          canvas.save();
          canvas.translate(-this.yAxis.getWidth(), 0);
          this.provider.onDraw(canvas, scaleRect, this.showRect, this.tableData, this.config);
          canvas.restore();
        } else {
          try {
            this.provider.onDraw(canvas, scaleRect, this.showRect, this.tableData, this.config);
          } catch (e) {
            console.error(e);
          }
        }
        this.drawGridBackground(canvas, this.showRect, scaleRect);
      }
    }
  }

  private drawGridBackground(canvas: Canvas, showRect: Rect, scaleRect: Rect): void {
    this.config.getContentGridStyle().fillPaint(this.paint);
    if (this.config.getTableGridFormat() != null) {
      this.config
        .getTableGridFormat()
        .drawTableBorderGrid(
          canvas,
          Math.max(showRect.left, scaleRect.left),
          Math.max(showRect.top, scaleRect.top),
          Math.min(showRect.right, scaleRect.right),
          Math.min(scaleRect.bottom, showRect.bottom),
          this.paint
        );
    }
  }

  public getConfig(): TableConfig {
    return this.config;
  }

  // public setData(data: T[]): PageTableData<T> {
  //   if (this.annotationParser == null) {
  //     this.annotationParser = new AnnotationParser<T>(this.config.dp10);
  //   }
  //   const tableData = this.annotationParser.parse(data);
  //   if (tableData != null) {
  //     this.setTableData(tableData);
  //   }
  //   return tableData;
  // }

  public setTableData(tableData: TableData<T>): void {
    if (tableData != null) {
      this.tableData = tableData;
      this.notifyDataChanged();
    }
  }

  public getTableTitle(): ITableTitle {
    return this.tableTitle;
  }

  public notifyDataChanged(): void {
    if (this.tableData != null) {
      this.config.setPaint(this.paint);
      this.parser.parse(this.tableData);
      const info = this.measurer.measure(this.tableData, this.config);
      this.xAxis.setHeight(info.getTopHeight());
      this.yAxis.setWidth(info.getYAxisWidth());
      this.requestReMeasure();
      this.forceUpdate();
    }
  }

  public addData(t: T[], isFoot: boolean): void {
    if (t != null && t.length > 0) {
      this.parser.addData(this.tableData, t, isFoot);
      this.measurer.measure(this.tableData, this.config);
      this.requestReMeasure();
      this.forceUpdate();
    }
  }

  private requestReMeasure(): void {
    if (!this.isExactly && this.tableData != null) {
      if (this.tableData.getTableInfo().getTableRect() != null) {
        let defaultHeight = this.tableData.getTableInfo().getTableRect().height;
        let defaultWidth = this.tableData.getTableInfo().getTableRect().width;
        const realSize = new Array(2);
        // this.getLocationInWindow(realSize);
        const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
        const maxWidth = screenWidth - realSize[0];
        const maxHeight = screenHeight - realSize[1];
        defaultHeight = Math.min(defaultHeight, maxHeight);
        defaultWidth = Math.min(defaultWidth, maxWidth);
        if (this.defaultHeight != defaultHeight || this.defaultWidth != defaultWidth) {
          this.defaultHeight = defaultHeight;
          this.defaultWidth = defaultWidth;
          this.requestReMeasure();
        }
      }
    }
  }

  // public onTouchEvent(event: MotionEvent): boolean {
  //   return this.matrixHelper.handlerTouchEvent(event);
  // }
  //
  // public dispatchTouchEvent(event: MotionEvent): boolean {
  //   this.matrixHelper.onDisallowInterceptEvent(this, event);
  //   return super.dispatchTouchEvent(event);
  // }

  public onTableChanged(scale: number, translateX: number, translateY: number): void {
    if (this.tableData != null) {
      this.config.setZoom(scale);
      this.tableData.getTableInfo().setZoom(scale);
      this.forceUpdate();
    }
  }

  public getOnColumnClickListener(): OnColumnClickListener {
    return this.provider.getOnColumnClickListener();
  }

  public setOnColumnClickListener(onColumnClickListener: OnColumnClickListener): void {
    this.provider.setOnColumnClickListener(onColumnClickListener);
  }

  public setSortColumn(column: Column, isReverse: boolean): void {
    if (this.tableData != null && column != null) {
      column.setReverseSort(isReverse);
      this.tableData.setSortColumn(column);
      this.setTableData(this.tableData);
    }
  }

  public getShowRect(): Rect {
    return this.showRect;
  }

  public getProvider(): TableProvider<T> {
    return this.provider;
  }

  public getTableData(): TableData<T> {
    return this.tableData;
  }

  public setZoom(zoom: boolean, maxZoom?: number, minZoom?: number): void {
    this.matrixHelper.setCanZoom(zoom);
    if (maxZoom != null && minZoom != null) {
      this.matrixHelper.setMinZoom(minZoom);
      this.matrixHelper.setMaxZoom(maxZoom);
    }
    this.forceUpdate();
  }

  public setDoubleClickZoom(doubleClickZoom: boolean): void {
    this.matrixHelper.setCanDoubleClickZoom(doubleClickZoom);
  }

  public getMatrixHelper(): MatrixHelper {
    return this.matrixHelper;
  }

  public setSelectFormat(selectFormat: ISelectFormat): void {
    this.provider.setSelectFormat(selectFormat);
  }

  public getXSequence(): XSequence<T> {
    return this.xAxis;
  }

  public getYSequence(): YSequence<T> {
    return this.yAxis;
  }
}
