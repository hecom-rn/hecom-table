export interface ITouch {
    /**
     * 用于判断是否请求不拦截事件
     * 解决手势冲突问题
     * @param view
     * @param event
     */
    onDisallowInterceptEvent(view: View, event: MotionEvent): void;

    /**
     * 处理touchEvent
     * @param event
     */
    handlerTouchEvent(event: MotionEvent): boolean;
}
