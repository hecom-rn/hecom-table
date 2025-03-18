import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Row, TableWrapper, Col, Cell as CellComponent, Table as ReAnimatedTable } from "../reanimatetable/index";
import { TableData } from "../form/data/table/TableData";
import { Icon, type Cell } from "../table/bean/Cell";
import type { Column } from "../form/data/column/Column";
import { Text } from "react-native-svg";
import { Gesture, GestureDetector, GestureHandlerRootView, PanGestureHandler, type GestureEvent, type PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withDecay } from "react-native-reanimated";
import { useEffect, useState } from "react";
import { max } from "zrender/lib/core/vector";

interface Props {
    style?: any;
    tableData: TableData<Cell>;
    frozenRows?: number;
    frozenColumns?: number;
    onClickEvent?: (data: any) => void;
    onMounted?: () => void;
}

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
    fontSize?: number;
};

function mergeCells(props: Props, preRows?: number, preColumns?: number): MergedCell[] {
    const { tableData } = props;
    const result: MergedCell[] = [];
    const columnArr = tableData?.getChildColumns();
    const tableInfo = tableData?.getTableInfo();
    if (!columnArr.length || !columnArr[0].getDatas().length) return result;

    const rows = preColumns || columnArr.length;
    const cols = preRows || columnArr[0].getDatas().length;
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
                textStyle={[styles.text, {color:subMergedCells[0].textColor, fontSize: subMergedCells[0].fontSize}]}
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
                textStyle={[styles.text, {color:subMergedCells?.[0].textColor, fontSize: subMergedCells?.[0].fontSize}]}
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
                textStyle={[styles.text, {color:subMergedCells?.[0].textColor, fontSize: subMergedCells?.[0].fontSize}]}
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

function getContentSize(props: Props) {
    const { tableData } = props;
    if (!tableData) return { width: 0, height: 0 };
    let width = 0;
    let height = 0;
    tableData.getChildColumns().forEach((column) => {
        width += column.getComputeWidth() + getExtraWidth();
    });
    tableData.getChildColumns()[0].getDatas().forEach((data) => {
        height += (data.getCache()?.getHeight() || 0) + getExtraHeight();
    });
    return { width, height };
}

export default function Table(props: Props) {
    const { style, tableData, frozenRows = 0, frozenColumns = 0, onMounted } = props;
    if (!tableData) return <View />;
    const rowNums = tableData.getChildColumns()?.[0].getDatas().length;
    const { width, height } = getContentSize(props);
    const maxScrollX = width - (style.width || 0);
    const maxScrollY = height - (style.height || 0);

    const mergedCornerCells = mergeCells(props, frozenRows, frozenColumns);
    const mergedRowCells = mergeCells(props, frozenRows)?.filter((item) => item.col >= frozenColumns);
    const mergedColumnCells = mergeCells(props, undefined, frozenColumns)?.filter((item) => item.row >= frozenRows);
    const mergedContentCells = mergeCells(props)?.filter((item) => item.row >= frozenRows && item.col >= frozenColumns);

    const tmpCorner = genTopTable(mergedCornerCells, frozenRows, props);
    const tmpTop = genTopTable(mergedRowCells, frozenRows, props);
    const tmpLeft = genTopTable(mergedColumnCells, rowNums - frozenRows, props);
    const tmpContent = genTopTable(mergedContentCells, rowNums - frozenRows, props);

   
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const preTranslateX = useSharedValue(0);
    const preTranslateY = useSharedValue(0);

    const animatedStyleX = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
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
                    <View style={styles.row}>
                        <View style={styles.hideOverFlow}>
                            <Animated.View style={[animatedStyleY]}>
                                <ReAnimatedTable borderStyle={styles.borderStyle} >
                                    {tmpLeft}
                                </ReAnimatedTable>
                            </Animated.View>
                        </View>
                        <View style={styles.hideOverFlow}>
                            <Animated.View style={animatedStyle}>
                                <ReAnimatedTable borderStyle={styles.borderStyle} >
                                    {tmpContent}
                                </ReAnimatedTable>
                            </Animated.View>
                        </View>
                    </View>               
                </View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    hideOverFlow: {
        overflow: 'hidden',
    },
    row: { flexDirection: 'row' },
    borderStyle: { borderWidth: 1, borderColor: '#C1C0B9' },
    container: { backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    text: { margin: 6 }
});
