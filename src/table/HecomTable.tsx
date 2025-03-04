import { SmartTable } from '../form/core/SmartTable';
import type { Cell } from './bean/Cell';
import React, { Component } from 'react';
import { NativeEventEmitter, NativeModules, findNodeHandle } from 'react-native';
import { ProgressStyle } from './bean/ProgressStyle';
import { TableConfigBean } from './bean/TableConfigBean';
import { HecomStyle } from './format/HecomStyle';
import { BackgroundFormat } from './format/BackGroundFormat';
import { ClickHandler } from './ClickHandler';
import { LockHelper } from './lock/LockHelper';
import { HecomGridFormat } from './format/HecomGridFormat';
import { HecomTableData } from './HecomTableData';

type SpliceItem = {
    data: string;
    y: number;
    l: number;
};

export class HecomTable extends SmartTable<Cell> {
    private mClickHandler: ClickHandler;
    private mLockHelper: LockHelper;
    private lastConfigBean?: TableConfigBean;
    private lastJson?: string;
    private replenishConfig?: any; // 根据实际类型定义
    private progressStyle?: ProgressStyle;
    private isTableLayoutReady = false;
    private isContentLayoutReady = false;
    private resizeColumns = new Map<number, number>();
    private hecomStyle?: HecomStyle;

    private eventEmitter = new NativeEventEmitter(NativeModules.RCTEventEmitter);

    constructor(props) {
        super(props);
        this.init();
    }

    componentDidUpdate() {
        this.initTableData();
        const { frozenRows, frozenColumns, tableData } = this.props;
        this.getConfig().setFixedLines(frozenRows);
        this.mLockHelper.setFrozenColumns(frozenColumns);
        this.mLockHelper.reLock(tableData);
        super.componentDidUpdate();
    }

    getHecomStyle() {
        return this.hecomStyle;
    }

    getProgressStyle() {
        return this.progressStyle;
    }

    private init() {
        this.mClickHandler = new ClickHandler(this);
        this.mLockHelper = new LockHelper(this);

        // 初始化表格配置
        this.configureTable();

        // 设置事件监听
        this.setupEventListeners();
    }

    private configureTable() {
        // 应用样式配置
        this.getConfig()
            .setVerticalPadding(4)
            .setShowTableTitle(false)
            .setShowColumnTitle(false)
            .setShowXSequence(false)
            .setShowYSequence(false);

        // 设置网格和背景格式
        this.getConfig()
            .setTableGridFormat(new HecomGridFormat(this))
            .setContentCellBackgroundFormat(new BackgroundFormat(this));
    }

    private setupEventListeners() {
        // 表格变化监听
        const originalListener = this.getMatrixHelper().onTableChange;

        this.getMatrixHelper().onTableChange = (scale: number, translateX: number, translateY: number) => {
            originalListener?.(scale, translateX, translateY);

            const eventData = {
                translateX,
                translateY,
                scale,
            };

            this.emitScrollEvent(eventData);
            this.checkScrollEnd(translateY);
        };

        // 布局就绪监听
        this.setupLayoutReadyListener();
    }

    private emitScrollEvent(data: { translateX: number; translateY: number; scale: number }) {
        this.eventEmitter.emit('onScroll', {
            nativeEvent: {
                ...data,
                target: findNodeHandle(this),
            },
        });
    }

    private checkScrollEnd(translateY: number) {
        const matrixHelper = this.getMatrixHelper();
        const isEnd = matrixHelper.getZoomRect().bottom <= matrixHelper.getOriginalRect().bottom;

        if (isEnd) {
            this.eventEmitter.emit('onScrollEnd', {
                nativeEvent: { target: findNodeHandle(this) },
            });
        }
    }

    private setupLayoutReadyListener() {
        // 模拟Android的ViewTreeObserver
        requestAnimationFrame(() => {
            this.isTableLayoutReady = true;
            if (this.needReLayout()) {
                this.reLayout();
            }
        });
    }

    private needReLayout(): boolean {
        if (!this.replenishConfig || !this.isTableLayoutReady || !this.isContentLayoutReady) {
            return false;
        }

        const viewWidth = this.getMeasuredWidth();
        const columns = this.getTableData().columns;
        const totalWidth = columns
            .slice(0, this.replenishConfig.showNumber)
            .reduce((sum, col) => sum + col.computeWidth, 0);

        return totalWidth > viewWidth;
    }

    private reLayout() {
        const viewWidth = this.getMeasuredWidth();
        const columns = this.getTableData().columns;
        const totalColumns = Math.min(this.replenishConfig.showNumber, columns.length);

        // 计算列宽调整逻辑
        let columnTotalWidth = 0;
        let ignoreWidth = 0;

        columns.slice(0, totalColumns).forEach((col, index) => {
            columnTotalWidth += col.computeWidth;
            this.resizeColumns.set(index, 0);

            if (this.replenishConfig.ignore(index)) {
                ignoreWidth += col.computeWidth;
            }
        });

        // 执行列宽调整逻辑
        // ...（具体实现参考Java逻辑）

        this.notifyDataChanged();
    }

    // 其他方法实现（保持与Java方法结构一致）
    public updateData(data: string, x: number, y: number) {
        const tableData = this.getTableData() as HecomTableData;
        const newData = HecomTableData.transformData(data);

        // 数据合并逻辑
        // ...

        this.notifyDataChanged();
    }

    // public setData(json: string, configBean: TableConfigBean) {
    //     if (!json) return;

    //     if (json !== this.lastJson) {
    //         this.lastJson = json;
    //         this.lastConfigBean = configBean;

    //         // 主线程执行数据更新
    //         requestAnimationFrame(() => {
    //             this.setDataInMainThread(json, configBean);
    //         });
    //     } else if (this.configChanged(configBean)) {
    //         // 配置更新处理
    //         this.handleConfigUpdate(configBean);
    //     }
    // }

    private configChanged(newConfig: TableConfigBean): boolean {
        return (
            !this.lastConfigBean ||
            this.lastConfigBean.minWidth !== newConfig.minWidth ||
            this.lastConfigBean.maxWidth !== newConfig.maxWidth
        );
    }
}
