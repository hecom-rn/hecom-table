import React, { Component } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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
import { MatrixHelper, MotionEvent, ScaleGestureDetector } from '../matrix/MatrixHelper';

import { TableMeasurer } from './TableMeasurer';
import { TableParser } from './TableParser';
import { TableConfig } from './TableConfig';
import { SkiaRenderer } from '../../skia/SkiaRenderer';
import TMPJSTable from '../../tmpjstable/Table';
import * as zrender from 'zrender/lib/zrender';
import { type ZRenderType } from 'zrender/lib/zrender';
import { Dimensions, View } from 'react-native';
import { HecomGridFormat } from '../../table/format/HecomGridFormat';
import type SmartTableProps from './SmartTableProps';
import { Table, Row, Rows, TableWrapper, Col, Cell } from '../../reanimatetable/index';
import SkiaChart from '../../skia/skiaChart';

// interface TableProps<T> extends ViewProps {
//     isYSequenceRight: boolean;
//     tableData?: TableData<T>;
// }
SkiaRenderer(zrender);

/**
 * 表格组件
 */
export class SmartTable<T> extends Component<SmartTableProps> implements OnTableChangeListener {
    private xAxis: XSequence<T> = new XSequence<T>();
    private yAxis: YSequence<T> = new YSequence<T>();
    private tableTitle: ITableTitle;
    private provider: TableProvider<T>;
    private showRect: Rect;
    private config: TableConfig;
    private parser: TableParser<T>;
    protected tableData: TableData<T>;
    private defaultHeight: number = 300;
    private defaultWidth: number = 300;
    private measurer: TableMeasurer<T>;
    // private annotationParser: AnnotationParser<T>;
    protected paint: Paint;
    protected textPaint: TextPaint;
    private matrixHelper: MatrixHelper;
    private isExactly: boolean = true; // 是否是测量精准模式
    containerRef: SvgChart;
    zrender: ZRenderType;
    canvas: Canvas;

    constructor(props: SmartTableProps) {
        super(props);
        FontStyle.setDefaultTextSize(14);
        this.config = new TableConfig();
        this.config.dp10 = 10;
        this.config.setTableGridFormat(new HecomGridFormat(this));
        this.paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        this.textPaint = new TextPaint(Paint.ANTI_ALIAS_FLAG);
        this.textPaint.setTextAlign(Align.LEFT);
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

    componentDidMount() {
        // 初始化 ZRender 实例
        // this.zrender = zrender.init(this.containerRef, {
        //     renderer: 'skia',
        // });
        // const { width, height } = this.getWidthAndHeight();
        // this.zrender.resize({
        //     width,
        //     height,
        // });
        // this.canvas = new CanvasImpl(this.zrender);
        // this.zrender.on('mousedown', (e) => {
        //     this.matrixHelper.handlerTouchEvent(new MotionEvent(MotionEvent.ACTION_DOWN, e.offsetX, e.offsetY, 1, 1));
        // });
        // this.zrender.on('mousemove', (e) => {
        //     this.matrixHelper.handlerTouchEvent(new MotionEvent(MotionEvent.ACTION_MOVE, e.offsetX, e.offsetY, 1, 1));
        // });
        // this.zrender.on('mouseup', (e) => {
        //     this.matrixHelper.handlerTouchEvent(new MotionEvent(MotionEvent.ACTION_UP, e.offsetX, e.offsetY, 1, 1));
        // });
        // this.zrender.on('mousewheel', (e) => {
        //     switch (e.event.zrStatus) {
        //         case 'pinchBegin':
        //             this.matrixHelper.onScaleBegin(new ScaleGestureDetector(e.event.zrScale));
        //             break;
        //         case 'pinching':
        //             this.matrixHelper.onScale(new ScaleGestureDetector(e.event.zrScale));
        //             break;
        //         case 'pinchEnd':
        //             this.matrixHelper.onScaleEnd(new ScaleGestureDetector(e.event.zrScale));
        //             break;
        //         default:
        //             break;
        //     }
        // });
        // this.forceUpdate();
        this.initTableData();
        this.notifyDataChanged();
        this.forceUpdate();
    }

    componentWillUnmount() {
        // this.zrender.dispose(); // 组件卸载时销毁 ZRender 实例
    }

    componentDidUpdate() {
        this.initTableData();
        this.notifyDataChanged();
    }

    public render() {
        // return (
        //     <View style={this.props.style}>
        //         <SkiaChart
        //             useRNGH
        //             ref={(ref) => (this.containerRef = ref)}
        //             style={{ backgroundColor: 'white' }}
        //         />
        //     </View>
        // );
        const { style, onClickEvent, onMounted } = this.props;

        return (
            <TMPJSTable 
                tableData={this.tableData} 
                onClickEvent={onClickEvent} 
                frozenColumns={this.props.frozenColumns} 
                frozenRows={this.props.frozenRows} 
                style={this.props.style} 
                onMounted={onMounted}
            />
        );

        // const tableData = [];
        // const width = 10;
        // const height = 30;
        // for (let i = 0; i < height; i += 1) {
        //     const rowData = [];
        //     for (let j = 0; j < width; j += 1) {
        //         rowData.push(`${i}${j}`);
        //     }
        //     tableData.push(rowData);
        // }
        // const tmp = [40, 60, 80, 100, 120, 140, 160, 180, 200];
        // const widthArr:Array<number> = [];
        // const headArr: Array<string> = [];
        // for(let i = 0; i < width; i++) {
        //     widthArr.push(tmp[i % tmp.length]);
        //     headArr.push(`Head${i}`);
        // }

        // return (<View style={[style, styles.container]}>
        //     <ScrollView horizontal={true}>
        //         <View>
        //             <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
        //                 <Row data={headArr} widthArr={widthArr} style={styles.head} textStyle={styles.text} />
        //             </Table>
        //             <ScrollView style={{ marginTop: -1 }}>
        //                 <Table style={{ flexDirection: 'row' }} borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
        //                     <TableWrapper style={{ flexDirection: 'column', width: 80, }}>
        //                         <TableWrapper style={{ flexDirection: 'row', width: 80, height: 120 }}>
        //                             <Col data={['H1', 'H2']} style={[styles.head, { width: 40 }]} heightArr={[60, 60]} textStyle={styles.text} />
        //                             <Col data={['ad', 'dfs', 'rew', 'hgf']} style={[styles.head, { width: 40 }]} heightArr={[30, 30, 30, 30]} textStyle={styles.text}></Col>

        //                         </TableWrapper>
        //                         <Cell data="dfsder" style={styles.singleHead}/>
        //                     </TableWrapper>
        //                     <TableWrapper style={{ flex: 1 }}>
        //                         {
        //                             tableData.map((rowData, index) => (
        //                                 <Row
        //                                     key={index}
        //                                     data={rowData}
        //                                     widthArr={widthArr}
        //                                     stylconst { x, y, width, height } = event.nativeEvent.layout;
        //                 this.showRect.set(x, y, we={[{ height: 40, backgroundColor: '#E7E6E1' }, index % 2 ? { backgroundColor: '#F7F6E7' } : {}]}
        //                                     textStyle={styles.text}
        //                                 />
        //                             ))
        //                         }
        //                     </TableWrapper>
        //                 </Table>
        //             </ScrollView>
        //         </View>
        //     </ScrollView>
        // </View>);
    }

    private getWidthAndHeight() {
        const { style: { width = 300, height = 200 } = {} } = this.props;
        return { width, height };
    }

    protected initTableData() {
        const { tableData } = this.props;
        const { width, height } = this.getWidthAndHeight();
        // this.zrender.resize({
        //     width,
        //     height,
        // });
        this.setTableData(tableData);
        this.showRect = new Rect(0, 0, width, height);
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
                const scaleRect = this.matrixHelper.getZoomProviderRect(
                    this.showRect,
                    rect,
                    this.tableData.getTableInfo(),
                );

                try {
                    this.provider.onDraw(canvas, scaleRect, this.showRect, this.tableData, this.config);
                } catch (e) {
                    console.error(e);
                }

                // this.drawGridBackground(canvas, this.showRect, scaleRect);
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
                    this.paint,
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
            // this.requestReMeasure();
            // this.forceUpdate();
            this.onDraw(this.canvas);
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
            // this.forceUpdate();
            this.onDraw(this.canvas);
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

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    singleHead: { width: 80, height: 40, backgroundColor: '#c8e1ff' },
    text: { margin: 6 }
  });
  
