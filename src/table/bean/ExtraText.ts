/**
 * Description :
 * Created on 2023/11/29.
 */
export class ExtraText {
    public backgroundStyle?: Style;
    public style?: Style;
    public text?: string;
    public isLeft: boolean;

    constructor(backgroundStyle?: Style, style?: Style, text?: string, isLeft: boolean = false) {
        this.backgroundStyle = backgroundStyle;
        this.style = style;
        this.text = text;
        this.isLeft = isLeft;
    }
}

/**
 * 样式类
 */
export class Style {
    public color: number;
    public width: number;
    public height: number;
    public fontSize: number;
    public radius: number;

    constructor(color: number = 0, width: number = 0, height: number = 0, fontSize: number = 0, radius: number = 0) {
        this.color = color;
        this.width = width;
        this.height = height;
        this.fontSize = fontSize;
        this.radius = radius;
    }
}
