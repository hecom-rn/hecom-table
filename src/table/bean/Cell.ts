import type { CellCache } from './CellCache';
import type { ExtraText } from './ExtraText';
import { TableConfig } from '../../form/core/TableConfig';
import type { ProgressStyle } from './ProgressStyle';
import { Color } from '../../form/utils/Paint';

enum TextAlign {
    LEFT = 0,
    CENTER = 1,
    RIGHT = 2,
}

export class Cell {
    private keyIndex: number = 0;
    private title: string = '';
    private richText: RichText[] | undefined = undefined;
    private backgroundColor: string = TableConfig.INVALID_COLOR;
    private fontSize: number = 0;
    private textColor: string = TableConfig.INVALID_COLOR;
    private textAlignment: TextAlign = TextAlign.LEFT;
    private icon: Icon | null = null;
    private progressStyle: ProgressStyle | null = null;
    private _isOverstriking: boolean = false;
    private _isForbidden: boolean = false; // 斜线
    private classificationLinePosition: number = 2;
    private classificationLineColor: string = Color.BLACK;
    private boxLineColor: string = TableConfig.INVALID_COLOR;
    private strikethrough: boolean = false; // 删除线
    private textPaddingLeft: number = -1; // 左侧间距
    private textPaddingRight: number = -1;
    private textPaddingHorizontal: number = -1;
    private extraText: ExtraText | null = null; // 后缀标签
    private cache: CellCache | null = null;

    getRichText(): RichText[] {
        return this.richText;
    }

    getCache(): CellCache | null {
        return this.cache;
    }

    setCache(cache: CellCache): void {
        this.cache = cache;
    }

    merge(newCell: Cell): void {
        if (!newCell) return;

        this.keyIndex = newCell.getKeyIndex();
        this.title = newCell.getTitle();
        this.richText = newCell.getRichText();
        this.backgroundColor = newCell.getBackgroundColor();
        this.fontSize = newCell.getFontSize();
        this.textColor = newCell.getTextColor();
        this.textAlignment = newCell.getTextAlignment();
        this.icon = newCell.getIcon();
        this._isOverstriking = newCell.isOverstriking();
        this._isForbidden = newCell.isForbidden();
        this.classificationLinePosition = newCell.getClassificationLinePosition();
        this.classificationLineColor = newCell.getClassificationLineColor();
        this.boxLineColor = newCell.getBoxLineColor();
        this.strikethrough = newCell.isStrikethrough();
        this.extraText = newCell.getExtraText();
        this.textPaddingLeft = newCell.getTextPaddingLeft();
        this.textPaddingRight = newCell.getTextPaddingRight();
        this.textPaddingHorizontal = newCell.getTextPaddingHorizontal();

        this.cache = null;
    }

    getProgressStyle(): ProgressStyle | null {
        return this.progressStyle;
    }

    setProgressStyle(progressStyle: ProgressStyle): void {
        this.progressStyle = progressStyle;
    }

    getTextPaddingRight(): number {
        return this.textPaddingRight;
    }

    setTextPaddingRight(textPaddingRight: number): void {
        this.textPaddingRight = textPaddingRight;
    }

    getTextPaddingHorizontal(): number {
        return this.textPaddingHorizontal;
    }

    setTextPaddingHorizontal(textPaddingHorizontal: number): void {
        this.textPaddingHorizontal = textPaddingHorizontal;
    }

    getTextPaddingLeft(): number {
        return this.textPaddingLeft;
    }

    setTextPaddingLeft(textPaddingLeft: number): void {
        this.textPaddingLeft = textPaddingLeft;
    }

    setRichText(richText: RichText[]): void {
        this.richText = richText;
    }

    getExtraText(): ExtraText | null {
        return this.extraText;
    }

    setExtraText(extraText: ExtraText): void {
        this.extraText = extraText;
    }

    isStrikethrough(): boolean {
        return this.strikethrough;
    }

    setStrikethrough(strikethrough: boolean): void {
        this.strikethrough = strikethrough;
    }

    getBoxLineColor(): string {
        return this.boxLineColor;
    }

    setBoxLineColor(boxLineColor: string): void {
        this.boxLineColor = boxLineColor;
    }

    isForbidden(): boolean {
        return this._isForbidden;
    }

    setForbidden(forbidden: boolean): void {
        this._isForbidden = forbidden;
    }

    getClassificationLineColor(): string {
        return this.classificationLineColor;
    }

    setClassificationLineColor(classificationLineColor: string): void {
        this.classificationLineColor = classificationLineColor;
    }

    getClassificationLinePosition(): number {
        return this.classificationLinePosition;
    }

    setClassificationLinePosition(classificationLinePosition: number): void {
        this.classificationLinePosition = classificationLinePosition;
    }

    setFontSize(fontSize: number): void {
        this.fontSize = fontSize;
    }

    getFontSize(): number {
        return this.fontSize;
    }

    setTextAlignment(textAlignment: TextAlign): void {
        this.textAlignment = textAlignment;
    }

    getKeyIndex(): number {
        return this.keyIndex;
    }

    setKeyIndex(keyIndex: number): void {
        this.keyIndex = keyIndex;
    }

    getTitle(): string {
        return this.title;
    }

    setTitle(title: string): void {
        this.title = title;
    }

    getBackgroundColor(): string {
        return this.backgroundColor;
    }

    setBackgroundColor(backgroundColor: string): void {
        this.backgroundColor = backgroundColor;
    }

    getTextColor(): string {
        return this.textColor;
    }

    setTextColor(textColor: string): void {
        this.textColor = textColor;
    }

    getIcon(): Icon | null {
        return this.icon;
    }

    setIcon(icon: Icon): void {
        this.icon = icon;
    }

    getTextAlignment(): TextAlign {
        return this.textAlignment;
    }

    isOverstriking(): boolean {
        return this._isOverstriking;
    }

    setOverstriking(overstriking: boolean): void {
        this._isOverstriking = overstriking;
    }
}

class RichText {
    private text: string = '';
    private style: RichTextStyle | null = null;

    getText(): string {
        return this.text;
    }

    setText(text: string): void {
        this.text = text;
    }

    getStyle(): RichTextStyle | null {
        return this.style;
    }

    setStyle(style: RichTextStyle): void {
        this.style = style;
    }
}

class RichTextStyle {
    private textColor: string = '';
    private backgroundColor: string = '';
    private fontSize: number = -1;
    private borderRadius: number = 0;
    private borderColor: string = '';
    private borderWidth: number = -1;
    private isOverstriking: boolean | null = null;
    private strikethrough: boolean | null = null;

    getStrikethrough(): boolean | null {
        return this.strikethrough;
    }

    setStrikethrough(strikethrough: boolean): void {
        this.strikethrough = strikethrough;
    }

    getOverstriking(): boolean | null {
        return this.isOverstriking;
    }

    setOverstriking(overstriking: boolean): void {
        this.isOverstriking = overstriking;
    }

    getTextColor(): string {
        return this.textColor;
    }

    setTextColor(textColor: string): void {
        this.textColor = textColor;
    }

    getBackgroundColor(): string {
        return this.backgroundColor;
    }

    setBackgroundColor(backgroundColor: string): void {
        this.backgroundColor = backgroundColor;
    }

    getFontSize(): number {
        return this.fontSize;
    }

    setFontSize(fontSize: number): void {
        this.fontSize = fontSize;
    }

    getBorderRadius(): number {
        return this.borderRadius;
    }

    setBorderRadius(borderRadius: number): void {
        this.borderRadius = borderRadius;
    }

    getBorderColor(): string {
        return this.borderColor;
    }

    setBorderColor(borderColor: string): void {
        this.borderColor = borderColor;
    }

    getBorderWidth(): number {
        return this.borderWidth;
    }

    setBorderWidth(borderWidth: number): void {
        this.borderWidth = borderWidth;
    }
}

class Icon {
    static readonly LEFT = 0;
    static readonly TOP = 1;
    static readonly RIGHT = 2;
    static readonly BOTTOM = 3;

    private path: Path | null = null;
    private width: number = 0;
    private height: number = 0;
    private name: string = '';
    private direction: number = Icon.RIGHT;
    private resourceId: number = -1;

    getDirection(): number {
        return this.direction;
    }

    setDirection(direction: number): void {
        this.direction = direction;
    }

    getResourceId(): number {
        return this.resourceId;
    }

    setResourceId(resourceId: number): void {
        this.resourceId = resourceId;
    }

    getPath(): Path | null {
        return this.path;
    }

    setPath(path: Path): void {
        this.path = path;
    }

    getWidth(): number {
        return this.width;
    }

    setWidth(width: number): void {
        this.width = width;
    }

    getHeight(): number {
        return this.height;
    }

    setHeight(height: number): void {
        this.height = height;
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    update(): void {
        if (this.resourceId === -1) {
            const iconMap: Record<string, { resourceId: number; direction: number }> = {
                normal: { resourceId: 1, direction: Icon.RIGHT },
                up: { resourceId: 2, direction: Icon.RIGHT },
                down: { resourceId: 3, direction: Icon.RIGHT },
                dot_new: { resourceId: 4, direction: Icon.LEFT },
                dot_edit: { resourceId: 5, direction: Icon.LEFT },
                dot_delete: { resourceId: 6, direction: Icon.LEFT },
                dot_readonly: { resourceId: 7, direction: Icon.LEFT },
                dot_white: { resourceId: 8, direction: Icon.LEFT },
                dot_select: { resourceId: 9, direction: Icon.LEFT },
                portal_icon: { resourceId: 10, direction: Icon.LEFT },
                trash: { resourceId: 11, direction: Icon.RIGHT },
                revert: { resourceId: 12, direction: Icon.RIGHT },
                copy: { resourceId: 13, direction: Icon.RIGHT },
                edit: { resourceId: 14, direction: Icon.RIGHT },
                selected: { resourceId: 15, direction: Icon.RIGHT },
                unselected: { resourceId: 16, direction: Icon.RIGHT },
                unselected_disable: { resourceId: 17, direction: Icon.RIGHT },
                copy_disable: { resourceId: 18, direction: Icon.RIGHT },
                edit_disable: { resourceId: 19, direction: Icon.RIGHT },
                trash_disable: { resourceId: 20, direction: Icon.RIGHT },
                unSelectIcon: { resourceId: 21, direction: Icon.RIGHT },
                selectedIcon: { resourceId: 22, direction: Icon.RIGHT },
                expandedIcon: { resourceId: 23, direction: Icon.LEFT },
                collapsedIcon: { resourceId: 24, direction: Icon.LEFT },
            };

            const iconConfig = iconMap[this.name];
            if (iconConfig) {
                this.resourceId = iconConfig.resourceId;
                this.direction = iconConfig.direction;
            }
        }
    }
}

class Path {
    private height: number = 0;
    private scale: string = '';
    private uri: string = '';
    private width: number = 0;
    private __packager_asset: boolean = false;

    getHeight(): number {
        return this.height;
    }

    setHeight(height: number): void {
        this.height = height;
    }

    getScale(): string {
        return this.scale;
    }

    setScale(scale: string): void {
        this.scale = scale;
    }

    getUri(): string {
        return this.uri;
    }

    setUri(uri: string): void {
        this.uri = uri;
    }

    getWidth(): number {
        return this.width;
    }

    setWidth(width: number): void {
        this.width = width;
    }

    is__packager_asset(): boolean {
        return this.__packager_asset;
    }

    set__packager_asset(__packager_asset: boolean): void {
        this.__packager_asset = __packager_asset;
    }

    private static mResourceDrawableIdMap: Map<string, number> = new Map();

    static getResourceDrawableId(context: any, name: string | null): number {
        if (!name) return 0;

        name = name.toLowerCase().replace('-', '_');
        if (Path.mResourceDrawableIdMap.has(name)) {
            return Path.mResourceDrawableIdMap.get(name)!;
        }

        const id = 0; // 模拟资源 ID 获取逻辑
        Path.mResourceDrawableIdMap.set(name, id);
        return id;
    }
}
