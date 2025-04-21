import { View, ScrollView, StyleSheet, Dimensions, FlatList, Text, type ViewStyle, type TextStyle } from "react-native";
import { Row, TableWrapper, Col, Cell as CellComponent, Table as ReAnimatedTable } from "../reanimatetable/index";
import { TableData } from "../form/data/table/TableData";
import { Icon, type Cell } from "../table/bean/Cell";
import type { Column } from "../form/data/column/Column";
import { Gesture, GestureDetector, GestureHandlerRootView, PanGestureHandler, type GestureEvent, type PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedProps, useAnimatedReaction, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDecay } from "react-native-reanimated";
import { useEffect, useRef, useState } from "react";
import Listener from '@hecom/listener';
import { max } from "zrender/lib/core/vector";

interface Props {
    style?: any;
    tableData: TableData<Cell>;
    frozenRows?: number;
    frozenColumns?: number;
    onClickEvent?: (data: any) => void;
    onScroll?: (data: any) => void;
    onMounted?: () => void;
    onContentSize?: (obj: {width: number, height: number })=> void;
}

const actionKey = 'com.hecom.crm.pro.ACTION_SCROLL_ENABLED';

type MergedCell = {
    textArr: string[] | undefined;
    width: number;
    height: number;
    keyIndex: number;
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
    icon?: Icon;
    textColor?: string;
    textPaddingLeft?: number;
    textPaddingRight?: number;
    fontSize?: number;
};

type ListItem = {
    data?: string;
    icon?: Icon;
    style?: ViewStyle; 
    textStyle?: TextStyle;
    onPress?: () => void;
    tableItemArray?: ListItem[];
};

function mergeCells(props: Props, preRows?: number, preColumns?: number): MergedCell[] {
    const { tableData } = props;
    const result: MergedCell[] = [];
    const columnArr = tableData?.getChildColumns();
    const tableInfo = tableData?.getTableInfo();
    if (!columnArr.length || !columnArr[0].getDatas().length) return result;

    const rows = preColumns === undefined ? columnArr.length : preColumns;
    const cols = preRows === undefined ? columnArr[0].getDatas().length: preRows;
    const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));

    // 定义四个方向的偏移量（上、右、下、左）
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!visited[i][j]) {
                const targetValue = columnArr[i].getDatas()[j];
                const stack: [number, number][] = [[i, j]];
                let minRow = i, maxRow = i;
                let minCol = j, maxCol = j;

                visited[i][j] = true;

                // DFS遍历相邻元素
                while (stack.length) {
                    const [x, y] = stack.pop()!;

                    // 更新区域边界
                    minRow = Math.min(minRow, x);
                    maxRow = Math.max(maxRow, x);
                    minCol = Math.min(minCol, y);
                    maxCol = Math.max(maxCol, y);

                    // 遍历四个方向
                    for (const [dx, dy] of directions) {
                        const nx = x + dx;
                        const ny = y + dy;

                        // 检查边界条件和数值相等性
                        if (nx >= 0 && nx < rows &&
                            ny >= 0 && ny < cols &&
                            !visited[nx][ny] &&
                            columnArr[nx].getDatas()[ny].getKeyIndex() === targetValue.getKeyIndex()) {
                            visited[nx][ny] = true;
                            stack.push([nx, ny]);
                        }
                    }
                }
                let width = 0;
                for (let i = minRow; i <= maxRow; i++) {
                    width += columnArr[i].getComputeWidth();
                }
                let height = 0;
                for (let i = minCol; i <= maxCol; i++) {
                    // height += columnArr[minRow].getDatas()[i].getCache()?.getHeight() || 0;
                    height += tableInfo?.getLineHeightArray()?.[i] || 0;
                }
                // 生成合并信息
                result.push({
                    col: minRow,
                    row: minCol,
                    keyIndex: targetValue.getKeyIndex(),
                    colSpan: maxRow - minRow + 1,
                    rowSpan: maxCol - minCol + 1,
                    textArr: columnArr[minRow].getDatas()[minCol].getCache()?.getStrArr(),
                    width: width + getExtraWidth() * (maxRow - minRow + 1),
                    height: height + getExtraHeight() * (maxCol - minCol + 1),
                    icon: columnArr[minRow].getDatas()[minCol].getIcon(),
                    textColor: columnArr[minRow].getDatas()[minCol].getTextColor(),
                    textPaddingLeft: columnArr[minRow].getDatas()[minCol].getTextPaddingLeft(),
                    textPaddingRight: columnArr[minRow].getDatas()[minCol].getTextPaddingRight(),
                    fontSize: columnArr[minRow].getDatas()[minCol].getFontSize()
                });
            }
        }
    }
    return result;
}

function getExtraWidth() {
    return 4;
}
function getExtraHeight() {
    return 12;
}

function genTopTableItem(subMergedCells: MergedCell[], rowNum: number, props: Props): React.ReactElement {
    const { onClickEvent } = props;
    if (subMergedCells.length === 0) {
        return <TableWrapper />;
    }
    if (subMergedCells.length === 1) {
        return (
            <CellComponent 
                data={subMergedCells[0].textArr?.join('\n')} 
                icon={subMergedCells[0].icon} 
                style={{ width: subMergedCells[0].width, height: subMergedCells[0].height }} 
                textStyle={[styles.text, {color:subMergedCells[0].textColor, fontSize: subMergedCells[0].fontSize, paddingLeft: subMergedCells[0].textPaddingLeft, paddingRight: subMergedCells[0].textPaddingRight}]}
                onPress={() => {
                    onClickEvent && onClickEvent({
                        keyIndex: subMergedCells[0].keyIndex,
                        rowIndex: subMergedCells[0].row,
                        columnIndex: subMergedCells[0].col,
                    });
                }}
            />
        );
    }

    const maxColumnSpan = subMergedCells.reduce((max, item) => Math.max(max, item.col + item.colSpan), 0);
    const minColumnSpan = subMergedCells.reduce((min, item) => Math.min(min, item.col + item.colSpan), Number.MAX_VALUE);
    if (maxColumnSpan === minColumnSpan) {
        const width = subMergedCells.reduce((max, item) => Math.max(max, item.width), 0);
        const heightArr = subMergedCells.map((item) => item.height);
        const data = subMergedCells.map((item) => (
          item.textArr?.join('\n')  
        ));
        const icons = subMergedCells.map((item) => (
            item.icon
        ));
        const textStyleArr = subMergedCells.map((item) => ({
            ...styles.text, color:item.textColor, fontSize: item.fontSize, paddingLeft: item.textPaddingLeft, paddingRight: item.textPaddingRight
        }));
        const onPressFuncs = subMergedCells.map((item) => (
            () => {onClickEvent && onClickEvent({
                keyIndex: item.keyIndex,
                rowIndex: item.row,
                columnIndex: item.col,
            })}
        ));
        return (
            <Col 
                data={data} 
                icons={icons} 
                onPressFuncs={onPressFuncs}
                style={[{ width }]} 
                heightArr={heightArr} 
                textStyleArr={textStyleArr}
                // textStyle={[styles.text, {color:subMergedCells?.[0].textColor, fontSize: subMergedCells?.[0].fontSize}]}
            />
        )
    }
    const maxIndex = subMergedCells.reduce(
        (maxIdx, currentValue, currentIndex) => 
            currentValue.colSpan > subMergedCells[maxIdx].colSpan ? currentIndex : maxIdx,
        0
    );
    return (
        <TableWrapper style={{ flexDirection: 'column' }}>
            {genTopTable(subMergedCells.slice(0, maxIndex), subMergedCells[maxIndex].row - subMergedCells[0].row, props)}
            <Row 
                data={[subMergedCells[maxIndex].textArr?.join('\n')]} 
                icons={[subMergedCells[maxIndex].icon]}
                onPressFuncs={[() => {
                    onClickEvent && onClickEvent({
                        keyIndex: subMergedCells[maxIndex].keyIndex,
                        rowIndex: subMergedCells[maxIndex].row,
                        columnIndex: subMergedCells[maxIndex].col,
                    });
                }]}
                widthArr={[subMergedCells[maxIndex].width]}
                style={[{ height: subMergedCells[maxIndex].height, }]}
                textStyle={[styles.text, {color:subMergedCells?.[0].textColor, fontSize: subMergedCells?.[0].fontSize, paddingLeft: subMergedCells?.[0].textPaddingLeft, paddingRight: subMergedCells?.[0].textPaddingRight}]}
            />
            {genTopTable(subMergedCells.slice(maxIndex + 1), rowNum - (subMergedCells[maxIndex].row - subMergedCells[0].row + subMergedCells[maxIndex].rowSpan), props)}
        </TableWrapper>
    );
}

function genTopTable(mergedRowCells: MergedCell[], rowNum: number, props: Props): React.ReactElement {
    if (rowNum === 0) {
        return <TableWrapper />;
    }
    mergedRowCells.sort((a, b) => {
        if (a.col === b.col) {
            return a.row - b.row;
        }
        return a.col - b.col;
    });
    const mergedCellsArr = [];
    let i = 0;
    while (i < mergedRowCells.length) {
        let startRowIndex = i;
        let endColIndex = mergedRowCells[i].col + mergedRowCells[i].colSpan - 1;
        let hasRowNum = 0;

        while (i < mergedRowCells.length && hasRowNum < rowNum) {
            if (mergedRowCells[i].col + mergedRowCells[i].colSpan - 1 == endColIndex) {
                hasRowNum += mergedRowCells[i].rowSpan;
                i++;
            } else if (mergedRowCells[i].col + mergedRowCells[i].colSpan - 1 > endColIndex) {
                endColIndex = mergedRowCells[i].col + mergedRowCells[i].colSpan - 1;
                hasRowNum = 0;
            } else {
                i++;
            }
        }
        const subMergedCells = mergedRowCells.slice(startRowIndex, i)?.sort((a, b) => {
            if (a.row === b.row) {
                return a.col - b.col;
            }
            return a.row - b.row;
        });
        mergedCellsArr.push(subMergedCells);
    }
    return (
        <TableWrapper style={{ flexDirection: 'row' }}>
            {mergedCellsArr.map((subMergedCells) => (
                genTopTableItem(subMergedCells, rowNum, props)
            ))}
        </TableWrapper>
    );
}

function getFlatListData(subMergedCells: MergedCell[], rowNum: number, props: Props):any {
    const { onClickEvent } = props;
    const maxColumnSpan = subMergedCells.reduce((max, item) => Math.max(max, item.col + item.colSpan), 0);
    const minColumnSpan = subMergedCells.reduce((min, item) => Math.min(min, item.col + item.colSpan), Number.MAX_VALUE);
    if (maxColumnSpan === minColumnSpan) {
        const width = subMergedCells.reduce((max, item) => Math.max(max, item.width), 0);
        const heightArr = subMergedCells.map((item) => item.height);
        const data = subMergedCells.map((item) => (
          item.textArr?.join('\n')  
        ));
        const icons = subMergedCells.map((item) => (
            item.icon
        ));
        const textStyleArr = subMergedCells.map((item) => ({
            ...styles.text, color:item.textColor, fontSize: item.fontSize, paddingLeft: item.textPaddingLeft, paddingRight: item.textPaddingRight
        }));
        const onPressFuncs = subMergedCells.map((item) => (
            () => {onClickEvent && onClickEvent({
                keyIndex: item.keyIndex,
                rowIndex: item.row,
                columnIndex: item.col,
            })}
        ));
        return data?.map((item, index) => {
            return {
                data: item,
                icon: icons[index],
                style: { width, height: heightArr[index]  },
                textStyle: textStyleArr[index],
                onPress: onPressFuncs[index],
            };
        });
    }
    const maxIndex = subMergedCells.reduce(
        (maxIdx, currentValue, currentIndex) => 
            currentValue.colSpan > subMergedCells[maxIdx].colSpan ? currentIndex : maxIdx,
        0
    );
    const item1 = getFlatListDataArray(subMergedCells.slice(0, maxIndex), subMergedCells[maxIndex].row - subMergedCells[0].row, props, true);
    const item2 = {
        data: subMergedCells[maxIndex].textArr?.join('\n'),
        icon: subMergedCells[maxIndex].icon,
        style: { width: subMergedCells[maxIndex].width, height: subMergedCells[maxIndex].height  },
        textStyle: [styles.text, {color:subMergedCells?.[0].textColor, fontSize: subMergedCells?.[0].fontSize, paddingLeft: subMergedCells?.[0].textPaddingLeft, paddingRight: subMergedCells?.[0].textPaddingRight}],
        onPress: () => {
            onClickEvent && onClickEvent({
                keyIndex: subMergedCells[maxIndex].keyIndex,
                rowIndex: subMergedCells[maxIndex].row,
                columnIndex: subMergedCells[maxIndex].col,
            });
        },
    };
    const item3 = getFlatListDataArray(subMergedCells.slice(maxIndex + 1), rowNum - (subMergedCells[maxIndex].row - subMergedCells[0].row + subMergedCells[maxIndex].rowSpan), props, true);
    return [item1, item2, item3];
}

function getFlatListDataArray(mergedRowCells: MergedCell[], rowNum: number, props: Props, asItem: boolean = false) {
    mergedRowCells.sort((a, b) => {
        if (a.col === b.col) {
            return a.row - b.row;
        }
        return a.col - b.col;
    });
    const mergedCellsArr = [];
    let i = 0;
    while (i < mergedRowCells.length) {
        let startRowIndex = i;
        let endColIndex = mergedRowCells[i].col + mergedRowCells[i].colSpan - 1;
        let hasRowNum = 0;

        while (i < mergedRowCells.length && hasRowNum < rowNum) {
            if (mergedRowCells[i].col + mergedRowCells[i].colSpan - 1 == endColIndex) {
                hasRowNum += mergedRowCells[i].rowSpan;
                i++;
            } else if (mergedRowCells[i].col + mergedRowCells[i].colSpan - 1 > endColIndex) {
                endColIndex = mergedRowCells[i].col + mergedRowCells[i].colSpan - 1;
                hasRowNum = 0;
            } else {
                i++;
            }
        }
        const subMergedCells = mergedRowCells.slice(startRowIndex, i)?.sort((a, b) => {
            if (a.row === b.row) {
                return a.col - b.col;
            }
            return a.row - b.row;
        });
        mergedCellsArr.push(subMergedCells);
    }
    const result = mergedCellsArr.map((subMergedCells) => {
        return getFlatListData(subMergedCells, rowNum, props);
    });
    return result;
}

function getContentSize(props: Props) {
    const { tableData } = props;
    if (!tableData) return { width: 0, height: 0 };
    let width = 0;
    let height = 0;
    tableData.getChildColumns().forEach((column) => {
        width += column.getComputeWidth() + getExtraWidth();
    });
    // tableData.getChildColumns()[0].getDatas().forEach((data) => {
    //     height += (data.getCache()?.getHeight() || 0) + getExtraHeight();
    // });
    tableData?.getTableInfo()?.getLineHeightArray()?.forEach((lineHeight) => {
        height += lineHeight + getExtraHeight();
    });
    return { width, height: height + 2 };
}

export default function Table(props: Props) {
    const { style, tableData, frozenRows = 0, frozenColumns = 0, onMounted, onContentSize, onScroll } = props;
    if (!tableData) return <View />;
    const rowNums = tableData.getChildColumns()?.[0].getDatas().length;
    const contentWidth = useRef(0);
    const contentHeight = useRef(0);
    const { width, height } = getContentSize(props);
    if (contentWidth.current !== width || contentHeight.current !== height) {
        contentWidth.current = width;
        contentHeight.current = height;
        onContentSize && onContentSize({width: width, height: height});
    }
    let topHeight = 0;
    const lineHeightArr = tableData?.getTableInfo()?.getLineHeightArray();
    for(let i = 0; i < frozenRows; i++) {
        topHeight += lineHeightArr?.[i] || 0;
    }

    const maxScrollX = width - (style.width || 0);
    const maxScrollY = height - topHeight;
    const flatListHeight = Math.max(0, (style.height || 0) - topHeight);

    const mergedCornerCells = mergeCells(props, frozenRows, frozenColumns);
    const mergedRowCells = mergeCells(props, frozenRows)?.filter((item) => item.col >= frozenColumns);
    const mergedColumnCells = mergeCells(props, undefined, frozenColumns)?.filter((item) => item.row >= frozenRows);
    const mergedContentCells = mergeCells(props)?.filter((item) => item.row >= frozenRows && item.col >= frozenColumns);

    const tmpCorner = genTopTable(mergedCornerCells, frozenRows, props);
    const tmpTop = genTopTable(mergedRowCells, frozenRows, props);
    const tmpLeft = genTopTable(mergedColumnCells, rowNums - frozenRows, props);
    const tmpContent = genTopTable(mergedContentCells, rowNums - frozenRows, props);

    const leftArray = getFlatListDataArray(mergedColumnCells, rowNums - frozenRows, props);
    const contentArray = getFlatListDataArray(mergedContentCells, rowNums - frozenRows, props);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const preTranslateX = useSharedValue(0);
    const preTranslateY = useSharedValue(0);

    useAnimatedReaction(
        () => translateX.value, // 依赖值
        (currentValue, previousValue) => {
            onScroll && runOnJS(onScroll)?.({ nativeEvent: {
                translateX: -currentValue,
                translateY: -translateY.value
            }});
            // console.log(`XXX值从 ${previousValue} 变为 ${currentValue}`);
            // onScroll && onScroll({ nativeEvent: {
            //     translateX: currentValue,
            //     translateY: translateY.value
            // }});
        }
    );

    useAnimatedReaction(
        () => translateY.value, // 依赖值
        (currentValue, previousValue) => {
            onScroll && runOnJS(onScroll)?.({ nativeEvent: {
                translateX: -translateX.value,
                translateY: -currentValue
            }});
            // 'worklet';
            // console.log(`YYY值从 ${previousValue} 变为 ${currentValue}`);
            // onScroll && onScroll({ nativeEvent: {
            //     translateX: translateX.value,
            //     translateY: currentValue
            // }});
        }
    );

    const animatedStyleX = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));
    const animatedStyleX2 = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value + 100 }],
    }));
    const animatedStyleX3 = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value + 200 }],
    }));
    const animatedStyleY = useAnimatedStyle(() => ({
        transform: [ { translateY: translateY.value }],
    }));
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [ { translateX: translateX.value}, {translateY: translateY.value }],
    }));

    const gestureHandler = Gesture.Pan().onBegin((event) => {
        preTranslateX.value = translateX.value;
        preTranslateY.value = translateY.value;
        runOnJS(Listener.trigger)?.(actionKey, false);
    }).onUpdate((event) => {
        'worklet';
        if (maxScrollX > 0) {
            translateX.value = preTranslateX.value + event.translationX;
            if (translateX.value > 0) {
                translateX.value = 0;
            } else if (translateX.value < -maxScrollX) {
                translateX.value = -maxScrollX;
            }
        }
        if (maxScrollY > 0){
            translateY.value = preTranslateY.value + event.translationY;
            if (translateY.value > 0) {
                translateY.value = 0;
            } else if (translateY.value < -maxScrollY) {
                translateY.value = -maxScrollY;
            }
        }   
    }).onEnd((event) => {
        if (maxScrollX > 0) {
            translateX.value = withDecay({
                velocity: event.velocityX,
                clamp: [-maxScrollX, 0], // 限制水平滑动范围
            });
        }
        if (maxScrollY > 0) {
            translateY.value = withDecay({
                velocity: event.velocityY,
                clamp: [-maxScrollY, 0], // 限制垂直滑动范围
            });
        }
        runOnJS(Listener.trigger)?.(actionKey, true);
    });

    useEffect(() => {
        // 此处执行组件挂载后的初始化操作（等效 componentDidMount）
        console.log('组件已挂载 time = ', new Date().getTime());
        onMounted && onMounted();
        return () => {
          // 此处编写清理逻辑（等效 componentWillUnmount）
          console.log('组件即将卸载');
        };
      }, []);

    const scrollOffset1 = useSharedValue(0);

    const scrollOffset2 = useSharedValue(0);

    const animatedProps1 = useAnimatedProps(() => ({
        contentOffset: { y: -translateY.value }
    }));

    const animatedProps2 = useAnimatedProps(() => ({
        contentOffset: { y: -translateY.value }
    }));

    return (
        <GestureHandlerRootView>
            <GestureDetector gesture={gestureHandler}>
                <View style={[style, styles.container, styles.hideOverFlow]}>
                    <View style={styles.row}>
                        <ReAnimatedTable borderStyle={styles.borderStyle} >
                            {tmpCorner}
                        </ReAnimatedTable>
                        <View style={styles.hideOverFlow}>
                            <Animated.View style={[animatedStyleX]}>
                                <ReAnimatedTable borderStyle={styles.borderStyle} >
                                    {tmpTop}
                                </ReAnimatedTable>
                            </Animated.View>
                        </View>
                    </View>
                    <View style={[styles.row, { flex: 1 }]}>
                        <View style={[styles.hideOverFlow, {flexDirection: 'row'}]}>
                            {/* <Animated.View  style={[animatedStyleY]}>
                                <ReAnimatedTable borderStyle={styles.borderStyle} >
                                    {tmpLeft}
                                </ReAnimatedTable>
                            </Animated.View> */}
                           
                            {getFlatListComponentArray(leftArray, animatedProps1, {})}
                        </View>
                        <View style={[styles.hideOverFlow, {flexDirection: 'row'}]}>
                            {/* <Animated.View style={[{backgroundColor: 'blue', width: 1000, height: 200}]}>
                                <ReAnimatedTable borderStyle={styles.borderStyle} >
                                    {tmpContent}
                                </ReAnimatedTable>
                            </Animated.View> */}

                            {getFlatListComponentArray(contentArray, animatedProps2, animatedStyleX)}
                            {/* <Animated.View style={[animatedStyleX, {flexDirection: 'row', width: 300, flex: 1, backgroundColor: 'blue'}]}> */}
                                {/* <Animated.FlatList
                                    // scrollEnabled={false}
                                    pointerEvents="none"
                                    animatedProps={animatedProps2}
                                    useNativeDriver={true}
                                    // onScroll={scrollHandler1}
                                    // animatedProps={animatedProps2}
                                    scrollEventThrottle={16}
                                    style={[animatedStyleX, {width: 200, backgroundColor: 'green'}]}
                                    data={Array.from({ length: 100 }).map((_, index) => ({}))}
                                    renderItem={({ item, index }) => <View style={{ height: 40, backgroundColor: index % 2 == 0 ? 'blue' : 'red' }} ><Text>`index = ${index}abcdeghijklmnopqrstuvwxyz`</Text></View>}
                                />
                                <Animated.FlatList
                                    // scrollEnabled={false}
                                    pointerEvents="none"
                                    animatedProps={animatedProps2}
                                    useNativeDriver={true}
                                    // onScroll={scrollHandler1}
                                    // animatedProps={animatedProps2}
                                    scrollEventThrottle={16}
                                    style={[animatedStyleX, {width: 100, backgroundColor: 'green'}]}
                                    data={Array.from({ length: 100 }).map((_, index) => ({}))}
                                    renderItem={({ item, index }) => <View style={{ height: 40, backgroundColor: index % 2 == 0 ? 'blue' : 'red' }} ><Text>`index = ${index}abcdeghijklmnopqrstuvwxyz`</Text></View>}
                                />
                                <Animated.FlatList
                                    // scrollEnabled={false}
                                    pointerEvents="none"
                                    animatedProps={animatedProps2}
                                    useNativeDriver={true}
                                    // onScroll={scrollHandler1}
                                    // animatedProps={animatedProps2}
                                    scrollEventThrottle={16}
                                    style={[animatedStyleX, {width: 100, backgroundColor: 'green'}]}
                                    data={Array.from({ length: 100 }).map((_, index) => ({}))}
                                    renderItem={({ item, index }) => <View style={{ height: 40, backgroundColor: index % 2 == 0 ? 'blue' : 'red' }} ><Text>`index = ${index}abcdeghijklmnopqrstuvwxyz`</Text></View>}
                                /> */}
                                {/* </Animated.View> */}
                        </View>
                    </View>               
                </View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}

function getFlatListComponentArray(dataArray: any[], animatedProps: any, style: ViewStyle) {
    return dataArray.map((arr, index) => {
        return <Animated.FlatList
            pointerEvents="none"
            animatedProps={animatedProps}
            // useNativeDriver={true}
            showsVerticalScrollIndicator={false}
            // scrollEventThrottle={16}
            style={[style, { width: arr?.[0]?.style?.width}]}
            data={arr}
            // windowSize={3} // 渲染区域高度
            // maxToRenderPerBatch={1} // 增量渲染最大数量
            // updateCellsBatchingPeriod={5000} // 增量渲染时间间隔
            // debug // 开启 debug 模式
            renderItem={({ item, index }) => {
                if (Array.isArray(item)) {
                    return (
                        <View style={styles.row}>
                            {item?.map((innerItem, innerIndex) => {
                                return (
                                    <ReAnimatedTable borderStyle={styles.borderStyle} >
                                        <Col
                                            data={innerItem?.map((i: ListItem) => i.data)} 
                                            icons={innerItem?.map((i: ListItem) => i.icon)} 
                                            onPressFuncs={innerItem?.map((i: ListItem) => i.onPress)}
                                            style={[{ width: innerItem?.[0]?.style?.width }]} 
                                            heightArr={innerItem?.map((i: ListItem) => i.style?.height)} 
                                            textStyleArr={innerItem?.map((i: ListItem) => i.textStyle)}
                                        />
                                    </ReAnimatedTable>
                                );
                            })}
                        </View>
                    );
                } else {
                    return (
                        <CellComponent 
                            data={item?.data} 
                            icon={item?.icon} 
                            style={item?.style} 
                            textStyle={item?.textStyle}
                            onPress={item?.onPress}
                            borderStyle={styles.borderStyle}
                        />
                    );
                }
            }}
        />
    })
}

const styles = StyleSheet.create({
    hideOverFlow: {
        overflow: 'hidden',
    },
    abc: {
        alignSelf: 'stretch',
    },
    row: { flexDirection: 'row' },
    borderStyle: { borderWidth: 1, borderColor: '#C1C0B9' },
    container: { backgroundColor: '#FFFFFF' },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    text: { margin: 6 }
});
