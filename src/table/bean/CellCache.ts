/**
 * 单元格缓存
 * <p>
 * 缓存单元格的宽高和设置好span的文本
 * <p>
 */
export class CellCache {
    private readonly text: string;
    private readonly width: number;
    private readonly height: number;
    private drawWidth: number;

    /**
     * 构造函数
     * @param text 单元格文本
     * @param width 单元格宽度
     * @param height 单元格高度
     */
    constructor(text: string, width: number, height: number) {
        this.text = text;
        this.width = width;
        this.height = height;
        this.drawWidth = 0; // 初始化绘制宽度为0
    }

    /**
     * 获取单元格高度
     */
    public getHeight(): number {
        return this.height;
    }

    /**
     * 获取单元格文本
     */
    public getText(): string {
        return this.text;
    }

    /**
     * 获取单元格宽度
     */
    public getWidth(): number {
        return this.width;
    }

    /**
     * 获取绘制宽度
     */
    public getDrawWidth(): number {
        return this.drawWidth;
    }

    /**
     *绘制 设置宽度
     * @param drawWidth 绘制宽度
     */
    public setDrawWidth(drawWidth: number): void {
        this.drawWidth = drawWidth;
    }
}
