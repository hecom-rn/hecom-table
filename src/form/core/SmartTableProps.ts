import type { ViewStyle } from 'react-native';

export default interface SmartTableProps {
    onScrollEnd: () => {};
    onScroll: () => {};
    onContentSize: () => {};
    disableZoom: boolean;
    frozenRows: number;
    frozenPoint: number;
    frozenCount: number;
    frozenColumns: number;
    permutable: boolean;
    ignoreLocks: Array<object>;
    doubleClickZoom: boolean;
    replenishColumnsWidthConfig: object;
    progressStyle: ViewStyle;
    lineColor: string;
    itemConfig: object;
    onClickEvent: (obj: object) => void;
    data: Array<Array<object>>;
    style: ViewStyle;
}
