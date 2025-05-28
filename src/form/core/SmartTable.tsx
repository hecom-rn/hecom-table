import { Component } from 'react';
import type { ITableTitle } from '../component/ITableTitle';
import { FontStyle } from '../data/style/FontStyle';
import { TableData } from '../data/table/TableData';
import { Paint } from '../utils/temp';

import { HecomGridFormat } from '../../table/format/HecomGridFormat';
import TMPJSTable from '../../tmpjstable/Table';
import type SmartTableProps from './SmartTableProps';
import { TableConfig } from './TableConfig';
import { TableMeasurer } from './TableMeasurer';
import { TableParser } from './TableParser';
import { View } from 'react-native';
/**
 * 表格组件
 */
export class SmartTable<T> extends Component<SmartTableProps> {
    private tableTitle: ITableTitle;
    private config: TableConfig;
    private parser: TableParser<T>;
    protected tableData: TableData<T>;
    private measurer: TableMeasurer<T>;
    protected paint: Paint;

    constructor(props: SmartTableProps) {
        super(props);
        FontStyle.setDefaultTextSize(14);
        this.config = new TableConfig();
        this.config.dp10 = 10;
        this.config.setTableGridFormat(new HecomGridFormat(this));
        this.paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        // this.showRect = new Rect();
        this.parser = new TableParser<T>();
        this.config.setPaint(this.paint);
        this.measurer = new TableMeasurer<T>();
    }

    componentDidMount() {
        this.initTableData(this.props);
        this.notifyDataChanged();
        this.forceUpdate();
    }

    UNSAFE_componentWillReceiveProps(nextProps: Readonly<SmartTableProps>, nextContext: any): void {
        if (nextProps.tableData !== this.props.tableData) {
            this.initTableData(nextProps);
            this.notifyDataChanged();
            this.forceUpdate();
        }
    }

    public render() {
        const { style, frozenColumns, frozenRows, onClickEvent, onMounted, onContentSize, onScroll } = this.props;
        // return <View style={{ width: 200, height: 200, backgroundColor: 'red'}} />;
        return (
            <TMPJSTable 
                tableData={this.tableData} 
                onClickEvent={onClickEvent} 
                frozenColumns={frozenColumns} 
                frozenRows={frozenRows} 
                style={style} 
                onMounted={onMounted}
                onContentSize={onContentSize}
                onScroll={onScroll}
            />
        );
      
    }

    private getWidthAndHeight() {
        const { style: { width = 300, height = 200 } = {} } = this.props;
        return { width, height };
    }

    protected initTableData(props: SmartTableProps) {
        const { tableData } = props || {};
        this.setTableData(tableData);
    }

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
            this.measurer.measure(this.tableData, this.config);
        }
    }

}
