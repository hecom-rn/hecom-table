import { Point, Rect } from '../utils/temp';
import { TableInfo } from '../data/TableInfo';
import { Observable } from '../listener/Observable';
import type { OnTableChangeListener } from '../listener/OnTableChangeListener';
import type { TableClickObserver } from '../listener/TableClickObserver';
import { PointEvaluator } from './PointEvaluator';
import type { ITouch } from './ITouch';
import Scroller from './Scroller';
import type { SmartTable } from '../core/SmartTable';

class GestureDetector {
    static MIN_SCROLL_LENGTH: number = 10;

    private simpleOnGestureListener: SimpleOnGestureListener;
    startX: number = 0;
    lastMoveX: number = 0;
    velocityX: number = 0;
    startY: number = 0;
    lastMoveY: number = 0;
    lastMoveTime: number = 0;
    velocityY: number = 0;
    constructor(_context: SmartTable<any>, _param2: SimpleOnGestureListener) {
        this.simpleOnGestureListener = _param2;
    }

    onTouchEvent(event: MotionEvent) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                this.startY = event.getY();
                this.lastMoveY = event.getY();
                this.startX = event.getX();
                this.lastMoveX = event.getX();
                this.lastMoveTime = Date.now();
                this.simpleOnGestureListener.onDown(event);
                break;
            case MotionEvent.ACTION_MOVE:
                if (this.startY !== 0) {
                    const now = Date.now();
                    const deltaTime = (now - this.lastMoveTime) / 1000;
                    const deltaX = this.lastMoveX - event.getX();
                    const deltaY = this.lastMoveY - event.getY();
                    this.simpleOnGestureListener.onScroll(event, undefined, deltaX, deltaY);
                    if (deltaTime > 0) {
                        this.velocityX = deltaX / deltaTime;
                        this.velocityY = deltaY / deltaTime;
                    }
                    this.lastMoveTime = now;
                    this.lastMoveX = event.getX();
                    this.lastMoveY = event.getY();
                }
                break;
            case MotionEvent.ACTION_UP:
                if (
                    Math.abs(event.getX() - this.lastMoveX) > GestureDetector.MIN_SCROLL_LENGTH ||
                    Math.abs(event.getY() - this.lastMoveY) > GestureDetector.MIN_SCROLL_LENGTH
                ) {
                    this.simpleOnGestureListener.onFling(undefined, undefined, this.velocityX, this.velocityY);
                } else if (
                    Math.abs(event.getX() - this.startX) <= GestureDetector.MIN_SCROLL_LENGTH &&
                    Math.abs(event.getY() - this.startY) <= GestureDetector.MIN_SCROLL_LENGTH
                ) {
                    this.simpleOnGestureListener.onSingleTapUp(event);
                }
                this.startX = 0;
                this.startY = 0;
                break;
            default:
                break;
        }
    }
}

export class MotionEvent {
    static ACTION_MASK: number = 0xff;
    static ACTION_DOWN: number = 0;
    static ACTION_POINTER_DOWN: number = 5;
    static ACTION_MOVE: number = 2;
    static ACTION_POINTER_UP: number = 6;
    static ACTION_CANCEL: number = 3;
    static ACTION_UP: number = 1;

    private action: number;
    private x: number;
    private y: number;
    private actionIndex: number;
    private pointerCount: number;

    constructor(action: number, x: number, y: number, actionIndex: number, pointerCount: number) {
        this.action = action;
        this.x = x;
        this.y = y;
        this.actionIndex = actionIndex;
        this.pointerCount = pointerCount;
    }

    getAction() {
        return this.action;
    }

    getX(_index?: number) {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getActionIndex() {
        return this.actionIndex;
    }

    getPointerCount() {
        return this.pointerCount;
    }
}

interface View {
    getParent(): View;

    requestDisallowInterceptTouchEvent(b: boolean): void;
}

class ViewConfiguration {
    static get(_context: SmartTable<any>) {
        return new ViewConfiguration();
    }

    getScaledTouchSlop() {
        return 0;
    }

    getScaledMinimumFlingVelocity() {
        return 0;
    }
}

interface TimeInterpolator {}

class ValueAnimator {
    startNumber: number;
    end: number;

    startPoint: Point;
    endPoint: Point;

    duration: number;

    listener: (obj: object) => void;

    constructor(startPoint: Point, endPoint: Point, start: number, end: number) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.startNumber = start;
        this.end = end;
    }

    static ofObject(_startPoint: Point, _endPoint: Point): ValueAnimator {
        return new ValueAnimator(_startPoint, _endPoint, undefined, undefined);
    }

    static ofInt(_start: number, _offset: number): ValueAnimator {
        return new ValueAnimator(undefined, undefined, _start, _offset);
    }

    setInterpolator(_interpolator: TimeInterpolator) {}

    setDuration(_duration: number): ValueAnimator {
        this.duration = _duration;
        return this;
    }

    addUpdateListener(_param: (_animation: any) => void) {
        this.listener = _param;
    }

    start() {
        const interval = 10;
        if (this.startNumber !== undefined && this.end !== undefined) {
            const numberArray = this.generateInertiaValues(this.startNumber, this.end, this.duration, interval);
            this.executeSequence(
                (value: number) => {
                    this.listener &&
                        this.listener({
                            getAnimatedValue: () => -value,
                        });
                },
                numberArray,
                interval
            );
        } else if (this.startPoint !== undefined && this.endPoint !== undefined) {
            const pointArray = this.generateInertiaValues(this.startPoint, this.endPoint, this.duration, interval);
            this.executeSequence(
                (value: Point) => {
                    this.listener &&
                        this.listener({
                            getAnimatedValue: () => ({
                                x: -value.x,
                                y: -value.y,
                            }),
                        });
                },
                pointArray,
                interval
            );
        }
    }

    executeSequence(
        executor: (value: number | Point | undefined) => void,
        sequence: number[] | Point[],
        delay: number
    ): () => void {
        // ...保持原有参数校验逻辑...

        let currentIndex = 0;
        let isCancelled = false;
        let timeoutId: NodeJS.Timeout | undefined;

        const executeNext = () => {
            if (isCancelled) return;
            if (currentIndex >= sequence.length) return;

            try {
                executor(sequence[currentIndex]);
            } catch (error) {
                isCancelled = true;
                if (timeoutId) clearTimeout(timeoutId);
                return;
            }

            currentIndex++;
            timeoutId = setTimeout(executeNext, delay);
        };

        // 启动执行
        timeoutId = setTimeout(executeNext, delay); // 第一次立即执行

        // 返回取消函数
        return () => {
            isCancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }

    generateInertiaValues(
        start: number | Point,
        end: number | Point,
        duration: number,
        interval: number,
        decayFactor?: number
    ): number[] | Point[] {
        if (duration <= 0 || interval <= 0) return [];
        const steps = Math.floor(duration / interval);
        if (steps < 1) return [];

        // 默认衰减因子
        const df = decayFactor ?? 0.95;
        const dfClamped = Math.max(0.0, Math.min(1.0, df));

        if (start instanceof Point && end instanceof Point) {
            const current = new Point(start.x, start.y);
            const result = [];
            for (let i = 0; i < steps; i++) {
                current.x = current.x * dfClamped + end.x * (1 - dfClamped);
                current.y = current.y * dfClamped + end.y * (1 - dfClamped);
                result.push(JSON.parse(JSON.stringify(current)));
                if (Math.abs(current.x - end.x) < 1 && Math.abs(current.y - end.y) < 1) break;
            }
            return result;
        } else if (typeof start === 'number' && typeof end === 'number') {
            let current = start as number;
            const result = [];
            for (let i = 0; i < steps; i++) {
                current = current * dfClamped + end * (1 - dfClamped);
                result.push(current);
                if (Math.abs(current - end) < 1) break;
            }
            return result;
        } else {
            throw new Error('Unsupported type');
        }
    }
}

class DecelerateInterpolator {}

export class ScaleGestureDetector {
    scalFactor: number = 1;
    constructor(scalFactor: number) {
        this.scalFactor = scalFactor;
    }

    onTouchEvent(_event: MotionEvent) {
        return true;
    }

    getScaleFactor(): number {
        return this.scalFactor;
    }
}

interface OnScaleGestureListener {
    onScaleBegin(detector: ScaleGestureDetector): boolean;

    onScale(detector: ScaleGestureDetector): boolean;

    onScaleEnd(detector: ScaleGestureDetector): void;
}

interface SimpleOnGestureListener {
    onScroll(e1: MotionEvent, e2: MotionEvent, distanceX: number, distanceY: number): boolean;

    onFling(e1: MotionEvent, e2: MotionEvent, velocityX: number, velocityY: number): boolean;

    onDown(ev: MotionEvent): boolean;

    // Double tap
    onDoubleTap(e: MotionEvent): boolean;

    // Single tap
    onSingleTapUp(e: MotionEvent): boolean;
}

/**
 * Created by huang on 2017/9/29.
 * 图表放大缩小协助类
 */
export class MatrixHelper
    extends Observable<TableClickObserver>
    implements ITouch, OnScaleGestureListener, SimpleOnGestureListener
{
    private maxZoom: number = 5;
    private minZoom: number = 1;
    private zoom: number = this.minZoom; //缩放比例  不得小于1
    private translateX: number = 0; //以左上角为准，X轴位移的距离
    private translateY: number = 0; //以左上角为准，y轴位移的距离
    private mScaleGestureDetector: ScaleGestureDetector;
    private mGestureDetector: GestureDetector;
    private _isCanZoom: boolean = true;
    private isCanDoubleClickZoom: boolean = false;
    private isScale: boolean = false; //是否正在缩小
    private originalRect: Rect = new Rect(); //原始大小
    private zoomRect: Rect = new Rect();
    private mDownX: number = 0;
    private mDownY: number = 0;
    private pointMode: number = 0; //屏幕的手指点个数
    private scroller: Scroller;
    private readonly mMinimumVelocity: number;
    private isFling: boolean = false;
    private listener: OnTableChangeListener;
    private flingRate: number = 1;
    private scaleRect: Rect = new Rect();
    private isZooming: boolean = false;
    private isAutoFling: boolean = false;
    private onInterceptListener: OnInterceptListener;
    private touchSlop: number; //最小滚动距离
    private fixedReactLeft: number = 0;
    private fixedReactRight: number = 0;
    public mFixedTranslateX: number = 0;
    private touchFromFixed: boolean = false;
    private originalProviderRect: Rect;
    private offsetY: number = 0;
    /**
     * 临时保存TranslateX值
     */
    private tempTranslateX: number = 0;
    /**
     * 临时保存TranslateY值
     */
    private tempTranslateY: number = 0;
    /**
     * 临时保存缩放值
     */
    private tempZoom: number = this.minZoom;
    private startPoint: Point = new Point(0, 0);
    private endPoint: Point = new Point();
    private interpolator: TimeInterpolator = new DecelerateInterpolator();
    private evaluator: PointEvaluator = new PointEvaluator();
    private isScaleMax: boolean = false;
    private isScaleMin: boolean = false;

    /**
     * 手势帮助类构造方法
     * @param context 用于获取GestureDetector，scroller ViewConfiguration
     */
    constructor(context: SmartTable<any>) {
        super();
        this.mScaleGestureDetector = new ScaleGestureDetector(1);
        this.mGestureDetector = new GestureDetector(context, this);
        const configuration = ViewConfiguration.get(context);
        this.touchSlop = configuration.getScaledTouchSlop();
        this.mMinimumVelocity = configuration.getScaledMinimumFlingVelocity();
        this.scroller = new Scroller();
    }

    /**
     * 处理手势
     */
    public handlerTouchEvent(event: MotionEvent): boolean {
        if (this._isCanZoom) {
            this.mScaleGestureDetector.onTouchEvent(event);
        }
        this.mGestureDetector.onTouchEvent(event);
        return true;
    }

    /**
     * 判断是否需要接收触摸事件
     */
    public onDisallowInterceptEvent(view: View, event: MotionEvent): void {
        const parent = view.getParent();
        if (!this.zoomRect || !this.originalRect) {
            parent.requestDisallowInterceptTouchEvent(false);
            return;
        }
        switch (event.getAction() & MotionEvent.ACTION_MASK) {
            case MotionEvent.ACTION_DOWN:
                this.pointMode = 1;
                //ACTION_DOWN的时候，赶紧把事件hold住
                this.mDownX = event.getX();
                this.mDownY = event.getY();
                if (this.originalRect.contains(this.mDownX, this.mDownY)) {
                    //判断是否落在图表内容区中
                    parent.requestDisallowInterceptTouchEvent(true);
                } else {
                    parent.requestDisallowInterceptTouchEvent(false);
                }
                break;
            case MotionEvent.ACTION_POINTER_DOWN:
                //判断是否是多指操作
                this.pointMode += 1;
                parent.requestDisallowInterceptTouchEvent(true);
                break;
            case MotionEvent.ACTION_MOVE:
                if (this.pointMode > 1) {
                    parent.requestDisallowInterceptTouchEvent(true);
                    return;
                }
                const disX = event.getX() - this.mDownX;
                const disY = event.getY() - this.mDownY;
                let isDisallowIntercept = true;
                if (Math.abs(disX) > Math.abs(disY)) {
                    if ((disX > 0 && this.toRectLeft()) || (disX < 0 && this.toRectRight())) {
                        isDisallowIntercept = false;
                    }
                } else {
                    if ((disY > 0 && this.toRectTop()) || (disY < 0 && this.toRectBottom())) {
                        isDisallowIntercept = false;
                    }
                }
                parent.requestDisallowInterceptTouchEvent(isDisallowIntercept);
                break;
            case MotionEvent.ACTION_POINTER_UP:
                this.pointMode -= 1;
                break;
            case MotionEvent.ACTION_CANCEL:
            case MotionEvent.ACTION_UP:
                this.pointMode = 0;
                parent.requestDisallowInterceptTouchEvent(false);
        }
    }

    /**
     * 通过translateX值判断是否到左边界
     * 通过该方法可以判断是否继续拦截滑动事件
     * @return 是否到左边界
     */
    private toRectLeft(): boolean {
        return this.translateX <= 0;
    }

    /**
     * 通过translateX值判断是否到右边界
     * @return 是否到右边界
     */
    private toRectRight(): boolean {
        return this.translateX >= this.zoomRect.width - this.originalRect.width;
    }

    /**
     * 通过translateY值判断是否到底部边界
     * @return 是否到底部边界
     */
    private toRectBottom(): boolean {
        const height = this.zoomRect.height - this.originalRect.height;
        return this.translateY >= height;
    }

    /**
     * 通过translateY值判断是否到顶部边界
     * @return 是否到顶部边界
     */
    private toRectTop(): boolean {
        return this.translateY <= 0;
    }

    /**
     * 通知View更新
     */
    private notifyViewChanged(): void {
        if (this.listener) {
            this.listener.onTableChanged(this.zoom, this.translateX, this.translateY);
        }
    }

    public setFixedReactLeft(fixedReactLeft: number): void {
        this.fixedReactLeft = fixedReactLeft;
    }

    public getFixedReactLeft(): number {
        return this.fixedReactLeft;
    }

    public setFixedReactRight(fixedReactRight: number): void {
        this.fixedReactRight = fixedReactRight;
    }

    public getFixedReactRight(): number {
        return this.fixedReactRight;
    }

    /**
     * 被观察者通知方法
     * @param _observers
     */
    public notifyObservers(_observers: Set<TableClickObserver>): void {
        //暂时不需要
    }

    /*************************************/
    public onScaleBegin(_detector: ScaleGestureDetector): boolean {
        this.tempZoom = this.zoom;
        this.isZooming = true;
        return true;
    }

    public onScale(detector: ScaleGestureDetector): boolean {
        const oldZoom = this.zoom;
        let isScaleEnd = false;
        const scale = detector.getScaleFactor();

        if (scale > 1 && this.isScaleMax) {
            this.isScaleMin = false;
            return true;
        } else if (scale < 1 && this.isScaleMin) {
            this.isScaleMax = false;
            return true;
        }
        this.zoom = this.tempZoom * scale;
        if (this.zoom >= this.maxZoom) {
            this.isScaleMax = true;
            this.zoom = this.maxZoom;
            isScaleEnd = true;
        } else if (this.zoom <= this.minZoom) {
            this.isScaleMin = true;
            this.zoom = this.minZoom;
            isScaleEnd = true;
        } else {
            this.isScaleMin = false;
            this.isScaleMax = false;
        }
        const factor = this.zoom / oldZoom;
        this.resetTranslate(factor);
        this.notifyViewChanged();
        return isScaleEnd;
    }

    public onScaleEnd(_detector: ScaleGestureDetector): void {
        this.isZooming = false;
    }

    /*************************************/
    onScroll(e1: MotionEvent, _e2: MotionEvent, distanceX: number, distanceY: number): boolean {
        if (this.onInterceptListener == null || !this.onInterceptListener.isIntercept(e1, distanceX, distanceY)) {
            this.translateX += distanceX;
            this.translateY += distanceY;
            if (this.touchFromFixed) {
                this.mFixedTranslateX += distanceX;
            }
            if (this.translateX < this.mFixedTranslateX) {
                this.mFixedTranslateX = this.translateX;
            }
            this.notifyViewChanged();
        }
        return true;
    }

    onFling(_e1: MotionEvent, _e2: MotionEvent, velocityX: number, velocityY: number): boolean {
        // Set Scroller final values based on fling velocity, then use property animation to calculate
        if (Math.abs(velocityX) > this.mMinimumVelocity || Math.abs(velocityY) > this.mMinimumVelocity) {
            this.scroller.setFinalX(0);
            this.scroller.setFinalY(0);
            this.tempTranslateX = this.translateX;
            this.tempTranslateY = this.translateY;
            this.scroller.fling(0, 0, velocityX, velocityY, -50000, 50000, -50000, 50000);
            this.isFling = true;
            this.startFilingAnim(false);
        }
        return true;
    }

    onDown(ev: MotionEvent): boolean {
        this.isFling = false;
        const action = ev.getAction();
        const pointerUp = (action & MotionEvent.ACTION_MASK) === MotionEvent.ACTION_POINTER_UP;
        const skipIndex = pointerUp ? ev.getActionIndex() : -1;

        // Determine focal point
        let sumX = 0;
        const count = ev.getPointerCount();
        for (let i = 0; i < count; i++) {
            if (skipIndex === i) continue;
            sumX += ev.getX(i);
        }
        const div = pointerUp ? count - 1 : count;
        const focusX = sumX / div;
        this.touchFromFixed = focusX > this.fixedReactLeft && focusX < this.fixedReactRight;
        return true;
    }

    // Double tap
    onDoubleTap(_e: MotionEvent): boolean {
        if (this._isCanZoom && this.isCanDoubleClickZoom) {
            const oldZoom = this.zoom;
            if (this.isScale) {
                // Zoom out
                this.zoom = this.zoom / 1.5;
                if (this.zoom < this.minZoom) {
                    this.zoom = this.minZoom;
                    this.isScale = false;
                }
            } else {
                // Zoom in
                this.zoom = this.zoom * 1.5;
                if (this.zoom > this.maxZoom) {
                    this.zoom = this.maxZoom;
                    this.isScale = true;
                }
            }
            const factor = this.zoom / oldZoom;
            this.resetTranslate(factor);
            this.notifyViewChanged();
        }
        return true;
    }

    // Single tap
    onSingleTapUp(e: MotionEvent): boolean {
        for (const observer of this.observables) {
            observer.onClick(e.getX(), e.getY());
        }
        this.notifyViewChanged();
        return true;
    }

    /*************************************/

    /**
     * 开始飞滚
     * @param doubleWay 双向飞滚
     */
    private startFilingAnim(doubleWay: boolean): void {
        const scrollX = Math.abs(this.scroller.getFinalX());
        const scrollY = Math.abs(this.scroller.getFinalY());
        if (doubleWay) {
            this.endPoint.set(this.scroller.getFinalX() * this.flingRate, this.scroller.getFinalY() * this.flingRate);
        } else {
            if (scrollX > scrollY) {
                this.endPoint.set(this.scroller.getFinalX() * this.flingRate, 0);
            } else {
                this.endPoint.set(0, this.scroller.getFinalY() * this.flingRate);
            }
        }
        const valueAnimator = ValueAnimator.ofObject(this.startPoint, this.endPoint);
        valueAnimator.setInterpolator(this.interpolator);
        valueAnimator.addUpdateListener((animation) => {
            if (this.isFling) {
                const point = animation.getAnimatedValue() as Point;
                this.translateX = this.tempTranslateX - point.x;
                this.translateY = this.tempTranslateY - point.y;
                if (this.touchFromFixed) {
                    this.mFixedTranslateX -= point.x;
                }
                if (this.translateX < this.mFixedTranslateX) {
                    this.mFixedTranslateX = this.translateX;
                }
                this.notifyViewChanged();
            } else {
                animation.cancel();
            }
        });
        const duration = (Math.max(scrollX, scrollY) * this.flingRate) / 2;
        valueAnimator.setDuration(duration > 300 ? 300 : duration);
        valueAnimator.start();
    }

    /**
     * 重新计算偏移量
     * * @param factor
     */
    private resetTranslate(factor: number): void {
        this.translateX = this.translateX * factor;
        this.translateY = this.translateY * factor;
        this.mFixedTranslateX = this.mFixedTranslateX * factor;
        if (this.translateX < this.mFixedTranslateX) {
            this.mFixedTranslateX = this.translateX;
        }
    }

    /**
     * 获取图片的内容的缩放大小
     * @param showRect 当前View显示大小
     * @param providerRect 表格实际需要的大小
     * @param _tableInfo
     * @return 缩放后内容的大小
     *
     */
    public getZoomProviderRect(showRect: Rect, providerRect: Rect, _tableInfo: TableInfo): Rect {
        this.originalRect.set(showRect);
        const showWidth = showRect.width;
        const showHeight = showRect.height;
        const offsetX = (showWidth * (this.zoom - 1)) / 2;
        const offsetY = (showHeight * (this.zoom - 1)) / 2;
        this.originalProviderRect = providerRect;
        this.offsetY = offsetY;
        if (!this.isAutoFling) {
            const newWidth = providerRect.width * this.zoom;
            const newHeight = providerRect.height * this.zoom;
            /**
             * 在表格中，x序列和Y序列不需要跟随放大，需要减掉多计算部分
             */
            //            if (zoom > 1) {
            //                newWidth -= (int) (tableInfo.getyAxisWidth() * (zoom - 1));
            //                newHeight -= (int) (tableInfo.getTopHeight() * (zoom - 1));
            //            }

            /**
             * 表格的标题不会跟随放大和缩小，也需要减掉多计算部分
             * 根据表格标题方向来判断减掉高还是宽
             */
            //            if (tableInfo.getTitleDirection() == IComponent.TOP
            //                    || tableInfo.getTitleDirection() == IComponent.BOTTOM) {
            //                newHeight -= (int) (tableInfo.getTableTitleSize() * (zoom - 1));
            //            } else {
            //                newWidth -= (int) (tableInfo.getTableTitleSize() * (zoom - 1));
            //            }
            const minTranslateX = -offsetX;
            const maxTranslateX = newWidth - showWidth - offsetX;
            const minTranslateY = -offsetY;
            const maxTranslateY = newHeight - showHeight - offsetY;
            let isFullShowX = false,
                isFullShowY = false;
            //计算出对比当前中心点的偏移量
            if (maxTranslateX > minTranslateX) {
                if (this.translateX < minTranslateX) {
                    this.translateX = minTranslateX;
                    if (this.translateX < this.mFixedTranslateX) {
                        this.mFixedTranslateX = this.translateX;
                    }
                } else if (this.translateX > maxTranslateX) {
                    this.translateX = maxTranslateX;
                    if (this.translateX < this.mFixedTranslateX) {
                        this.mFixedTranslateX = this.translateX;
                    }
                }
            } else {
                isFullShowX = true;
            }
            if (maxTranslateY > minTranslateY) {
                if (this.translateY < minTranslateY) {
                    this.translateY = minTranslateY;
                } else if (this.translateY > maxTranslateY) {
                    this.translateY = maxTranslateY;
                }
            } else {
                isFullShowY = true;
            }
            this.scaleRect.left = providerRect.left - offsetX - this.translateX + showRect.left;
            this.scaleRect.top = providerRect.top - offsetY - this.translateY + showRect.top;
            if (isFullShowX) {
                if (this.isZooming) {
                    this.scaleRect.left = Math.max(this.scaleRect.left, showRect.left);
                    this.scaleRect.left = Math.min(this.scaleRect.left, showRect.right - newWidth);
                } else {
                    this.scaleRect.left = showRect.left;
                    this.translateX = minTranslateX;
                    if (this.translateX < this.mFixedTranslateX) {
                        this.mFixedTranslateX = this.translateX;
                    }
                }
            }
            if (isFullShowY) {
                if (this.isZooming) {
                    this.scaleRect.top = Math.max(this.scaleRect.top, showRect.top);
                    this.scaleRect.top = Math.min(this.scaleRect.top, showRect.bottom - newHeight);
                } else {
                    this.scaleRect.top = showRect.top;
                    this.translateY = minTranslateY;
                }
            }
            this.scaleRect.right = this.scaleRect.left + newWidth;
            this.scaleRect.bottom = this.scaleRect.top + newHeight;
            this.zoomRect.set(this.scaleRect);
        } else {
            this.translateX = providerRect.left - this.zoomRect.left - offsetX;
            this.translateY = providerRect.top - this.zoomRect.top - offsetY;
            this.scaleRect.set(this.zoomRect);
            if (this.translateX < this.mFixedTranslateX) {
                this.mFixedTranslateX = this.translateX;
            }
        }
        return this.scaleRect;
    }

    public setZoom(zoom: number): void {
        this.zoom = zoom;
    }

    public getZoomRect(): Rect {
        return this.zoomRect;
    }

    public getOriginalRect(): Rect {
        return this.originalRect;
    }

    /**
     * 是否可以缩放
     * @return 是否可以缩放
     */
    public isCanZoom(): boolean {
        this.zoom = 1;
        return this._isCanZoom;
    }

    /**
     * 获取表格改变监听
     * 主要用于SmartTable view监听matrixHelper 移动和缩放
     */
    public getOnTableChangeListener(): OnTableChangeListener {
        return this.listener;
    }

    /**
     * 设置表格改变监听
     * 主要用于SmartTable view监听matrixHelper 移动和缩放
     * 请不要改变原来设置值
     * @param listener
     */
    public setOnTableChangeListener(listener: OnTableChangeListener): void {
        this.listener = listener;
    }

    /**
     * 设置是否可以缩放
     * @param canZoom
     */
    public setCanZoom(canZoom: boolean): void {
        this._isCanZoom = canZoom;
        if (!this._isCanZoom) {
            this.zoom = 1;
        }
    }

    /**
     * 设置是否可以双击缩放
     * @param canDoubleClickZoom
     */
    public setCanDoubleClickZoom(canDoubleClickZoom: boolean): void {
        this.isCanDoubleClickZoom = canDoubleClickZoom;
    }

    /**
     * 获取最大缩放值
     * @return 最大缩放值
     */
    public getMaxZoom(): number {
        return this.maxZoom;
    }

    /**
     * 获取最小缩放值
     * @return 最小缩放值
     */
    public getMinZoom(): number {
        return this.minZoom;
    }

    /**
     * 设置最小缩放值
     */
    public setMinZoom(minZoom: number): void {
        if (minZoom < 0) {
            minZoom = 0.1;
        }
        this.minZoom = minZoom;
    }

    /**
     * 设置最大缩放值
     */
    public setMaxZoom(maxZoom: number): void {
        if (maxZoom < 1) {
            maxZoom = 1;
        }
        this.maxZoom = maxZoom;
    }

    public reset(): void {
        this.zoom = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.notifyViewChanged();
    }

    /**
     * 飞滚到最左边
     */
    public flingLeft(duration: number, offset: number): void {
        const width = this.zoomRect.width;
        const valueAnimator = ValueAnimator.ofInt(this.zoomRect.left, offset).setDuration(duration);
        valueAnimator.addUpdateListener((animation) => {
            this.zoomRect.left = animation.getAnimatedValue() as number;
            this.zoomRect.right = this.zoomRect.left + width;
            this.notifyViewChanged();
        });
        valueAnimator.start();
    }

    /**
     * 飞滚到最右边
     */
    public flingRight(duration: number): void {
        const width = this.zoomRect.width;
        const valueAnimator = ValueAnimator.ofInt(this.zoomRect.right, this.originalRect.right).setDuration(duration);
        valueAnimator.addUpdateListener((animation) => {
            this.zoomRect.right = animation.getAnimatedValue() as number;
            this.zoomRect.left = this.zoomRect.right - width;
            this.notifyViewChanged();
        });
        valueAnimator.start();
    }

    /**
     * 飞滚到顶部
     */
    public flingTop(duration: number, offset: number): void {
        const height = this.zoomRect.height;
        const valueAnimator = ValueAnimator.ofInt(this.zoomRect.top, offset).setDuration(duration);
        valueAnimator.addUpdateListener((animation) => {
            this.zoomRect.top = animation.getAnimatedValue() as number;
            this.zoomRect.bottom = this.zoomRect.top + height;
            this.notifyViewChanged();
        });
        valueAnimator.start();
    }

    public flingToRow(tableInfo: TableInfo, row: number, offset: number, duration: number): void {
        try {
            if (row === 0) {
                this.flingTop(duration, offset);
                return;
            }
            const height = this.zoomRect.height;
            const oriHeight = this.originalRect.height;
            if (height < oriHeight) {
                return; //内容区域没有充满table
            }
            const oriBottom = this.originalRect.bottom;
            const lineHeightArray = tableInfo.getLineHeightArray();
            let targetRowHeight = offset;
            for (let i = 0; i < row; i++) {
                targetRowHeight += lineHeightArray[i];
            }
            const limitMinTop = this.originalRect.bottom - height;
            let targetTop = oriBottom - targetRowHeight * this.getZoom();
            if (targetTop < limitMinTop) {
                targetTop = limitMinTop;
            }
            if (
                this.originalRect.bottom - this.zoomRect.top > targetRowHeight * this.getZoom() &&
                this.originalRect.top - this.zoomRect.top <
                    (targetRowHeight - lineHeightArray[row - 1]) * this.getZoom()
            ) {
                return;
            }
            const valueAnimator = ValueAnimator.ofInt(this.zoomRect.top, targetTop).setDuration(duration);
            valueAnimator.addUpdateListener((animation) => {
                this.zoomRect.top = animation.getAnimatedValue() as number;
                this.zoomRect.bottom = this.zoomRect.top + height;
                this.translateY = this.originalProviderRect.top - this.zoomRect.top - this.offsetY;
                this.notifyViewChanged();
            });
            valueAnimator.start();
        } catch (e) {
            console.error(e);
        }
    }

    public flingToColumn(_tableInfo: TableInfo, _column: number, _offset: number, _duration: number): void {
        // Implementation needed
    }

    /**
     * 飞滚到底部
     */
    public flingBottom(duration: number): void {
        if (this.zoomRect.top >= this.originalRect.top && this.zoomRect.bottom <= this.originalRect.bottom) {
            return;
        }
        const height = this.zoomRect.height;
        const valueAnimator = ValueAnimator.ofInt(this.zoomRect.bottom, this.originalRect.bottom).setDuration(duration);
        valueAnimator.addUpdateListener((animation) => {
            this.zoomRect.bottom = animation.getAnimatedValue() as number;
            this.zoomRect.top = this.zoomRect.bottom - height;
            this.translateY = this.originalProviderRect.top - this.zoomRect.top - this.offsetY;
            this.notifyViewChanged();
        });
        valueAnimator.start();
    }

    /**
     * 获取当前的缩放值
     * @return 当前的缩放值
     */
    public getZoom(): number {
        return this.zoom;
    }

    /**
     * 获取飞滚的速率
     * @return 飞滚的速率
     */
    public getFlingRate(): number {
        return this.flingRate;
    }

    /**
     * 动态设置飞滚的速率
     * @param flingRate 速率
     */
    public setFlingRate(flingRate: number): void {
        this.flingRate = flingRate;
    }

    public getOnInterceptListener(): OnInterceptListener {
        return this.onInterceptListener;
    }

    public setOnInterceptListener(onInterceptListener: OnInterceptListener): void {
        this.onInterceptListener = onInterceptListener;
    }

    public setAutoFling(autoFling: boolean): void {
        this.isAutoFling = autoFling;
    }
}

export interface OnInterceptListener {
    isIntercept(e1: MotionEvent, distanceX: number, distanceY: number): boolean;
}
