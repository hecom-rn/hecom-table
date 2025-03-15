import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Row, TableWrapper, Col, Cell as CellComponent, Table as ReAnimatedTable } from "../reanimatetable/index";
import { TableData } from "../form/data/table/TableData";
import type { Cell } from "../table/bean/Cell";
import type { Column } from "../form/data/column/Column";
import { Text } from "react-native-svg";
import { Gesture, GestureDetector, GestureHandlerRootView, PanGestureHandler, type GestureEvent, type PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withDecay } from "react-native-reanimated";
import { useState } from "react";
import { max } from "zrender/lib/core/vector";

interface Props {
    style?: any;
    tableData: TableData<Cell>;
    frozenRows?: number;
    frozenColumns?: number;
}

type MergedCell = {
    textArr: string[] | undefined;
    width: number;
    height: number;
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
};

function mergeCells(columnArr: Array<Column<Cell>>, preRows?: number, preColumns?: number): MergedCell[] {
    const result: MergedCell[] = [];
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
                    height += columnArr[minRow].getDatas()[i].getCache()?.getHeight() || 0;
                }
                // 生成合并信息
                result.push({
                    col: minRow,
                    row: minCol,
                    colSpan: maxRow - minRow + 1,
                    rowSpan: maxCol - minCol + 1,
                    textArr: columnArr[minRow].getDatas()[minCol].getCache()?.getStrArr(),
                    width,
                    height
                });
            }
        }
    }
    return result;
}

function genTopTableItem(subMergedCells: MergedCell[], rowNum: number): React.ReactElement {
    if (subMergedCells.length === 0) {
        return <TableWrapper />;
    }
    if (subMergedCells.length === 1) {
        return <CellComponent data={subMergedCells[0].textArr?.join('\n')} style={{ width: subMergedCells[0].width, height: subMergedCells[0].height }} />;
    }

    const maxColumnSpan = subMergedCells.reduce((max, item) => Math.max(max, item.col + item.colSpan), 0);
    const minColumnSpan = subMergedCells.reduce((min, item) => Math.min(min, item.col + item.colSpan), Number.MAX_VALUE);
    if (maxColumnSpan === minColumnSpan) {
        const width = subMergedCells.reduce((max, item) => Math.max(max, item.width), 0);
        const heightArr = subMergedCells.map((item) => item.height);
        // const data = subMergedCells.map((item) => (
        //     <View>
        //         <Text>{item.textArr?.join('\n')}</Text>
        //     </View>
        // ));
        const data = subMergedCells.map((item) => (
          item.textArr?.join('\n')  
        ))
        return (
            <Col data={data} style={[{ width }]} heightArr={heightArr} />
        )
    }
    const maxIndex = subMergedCells.reduce(
        (maxIdx, currentValue, currentIndex) => 
            currentValue.colSpan > subMergedCells[maxIdx].colSpan ? currentIndex : maxIdx,
        0
    );
    return (
        <TableWrapper style={{ flexDirection: 'column' }}>
            {genTopTable(subMergedCells.slice(0, maxIndex), subMergedCells[maxIndex].row - subMergedCells[0].row)}
            <Row 
                data={[subMergedCells[maxIndex].textArr?.join('\n')]} 
                widthArr={[subMergedCells[maxIndex].width]}
                style={[{ height: subMergedCells[maxIndex].height, }]}
                textStyle={styles.text}
            />
            {genTopTable(subMergedCells.slice(maxIndex + 1), rowNum - (subMergedCells[maxIndex].row - subMergedCells[0].row + subMergedCells[maxIndex].rowSpan))}
        </TableWrapper>
    );
}

function genTopTable(mergedRowCells: MergedCell[], rowNum: number): React.ReactElement {
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
                genTopTableItem(subMergedCells, rowNum)
            ))}
        </TableWrapper>
    );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function getContentSize(props: Props) {
    const { tableData } = props;
    if (!tableData) return { width: 0, height: 0 };
    let width = 0;
    let height = 0;
    tableData.getChildColumns().forEach((column) => {
        width += column.getComputeWidth();
    });
    tableData.getChildColumns()[0].getDatas().forEach((data) => {
        height += data.getCache()?.getHeight() || 0;
    });
    return { width, height };
}

function getInnerNumber(min: number, n: number, max: number):number {
    if (n < min) {
        return min;
    } else if (n > max) {
        return max;
    } else {
        return n;
    }
}

export default function Table(props: Props) {
    const { style, tableData, frozenRows = 0, frozenColumns = 0 } = props;
    if (!tableData) return <View />;
    const rowNums = tableData.getChildColumns()?.[0].getDatas().length;
    const { width, height } = getContentSize(props);
    const maxScrollX = width - style.width || 0;
    const maxScrollY = height - style.height || 0;

    const mergedCornerCells = mergeCells(tableData?.getChildColumns(), frozenRows, frozenColumns);
    const mergedRowCells = mergeCells(tableData?.getChildColumns(), frozenRows)?.filter((item) => item.col >= frozenColumns);
    const mergedColumnCells = mergeCells(tableData?.getChildColumns(), undefined, frozenColumns)?.filter((item) => item.row >= frozenRows);
    const mergedContentCells = mergeCells(tableData?.getChildColumns())?.filter((item) => item.row >= frozenRows && item.col >= frozenColumns);

    const tmpCorner = genTopTable(mergedCornerCells, frozenRows);
    const tmpTop = genTopTable(mergedRowCells, frozenRows);
    const tmpLeft = genTopTable(mergedColumnCells, rowNums - frozenRows);
    const tmpContent = genTopTable(mergedContentCells, rowNums - frozenRows);

   
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

    return (
        <GestureHandlerRootView style={styles.container}>
            <GestureDetector gesture={gestureHandler}>
        <View style={[style, styles.container]}>
            {/* <ScrollView horizontal={true}> */}
                <View>
                    <View style={{ flexDirection: 'row' }}>
                        <ReAnimatedTable borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }} >
                            {tmpCorner}
                        </ReAnimatedTable>

                        <View style={{overflow: 'hidden'}}>
                            <Animated.View style={[animatedStyleX]}>
                        <ReAnimatedTable borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }} >
                            {tmpTop}
                        </ReAnimatedTable>
                            </Animated.View>
                            </View>
                    </View>
                    {/* <ScrollView> */}
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{overflow: 'hidden'}}>
                            <Animated.View style={[animatedStyleY]}>
                            <ReAnimatedTable borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }} >
                                {tmpLeft}
                            </ReAnimatedTable>
                            </Animated.View>
                            </View>
                            <View style={{overflow: 'hidden'}}>
                            <Animated.View style={animatedStyle}>
                                <ReAnimatedTable borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }} >
                                    {tmpContent}
                                </ReAnimatedTable>
                            </Animated.View>
                            </View>

                        </View>
                    {/* </ScrollView> */}
                </View>
            {/* </ScrollView> */}
        </View>
             </GestureDetector>
         </GestureHandlerRootView>
    )
    // return (
    //     <View style={[style, styles.container]}>
    //         <ScrollView horizontal={true}>
    //             <View>
    //                 <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
    //                     <Row data={headArr} widthArr={widthArr} style={styles.head} textStyle={styles.text} />
    //                 </Table>
    //                 <ScrollView style={{ marginTop: -1 }}>
    //                     <Table style={{ flexDirection: 'row' }} borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
    //                         <TableWrapper style={{ flexDirection: 'row', width: 80 }}>
    //                             <Col data={['H1', 'H2']} style={[styles.head, { width: 40 }]} heightArr={[60, 60]} textStyle={styles.text} />
    //                             <Col data={['ad', 'dfs', 'rew', 'hgf']} style={[styles.head, { width: 40 }]} heightArr={[30, 30, 30, 30]} textStyle={styles.text}></Col>
    //                         </TableWrapper>
    //                         <TableWrapper style={{ flex: 1 }}>
    //                             {
    //                                 tableData.map((rowData, index) => (
    //                                     <Row
    //                                         key={index}
    //                                         data={rowData}
    //                                         widthArr={widthArr}
    //                                         style={[{ height: 40, backgroundColor: '#E7E6E1' }, index % 2 ? { backgroundColor: '#F7F6E7' } : {}]}
    //                                         textStyle={styles.text}
    //                                     />
    //                                 ))
    //                             }
    //                         </TableWrapper>
    //                     </Table>
    //                 </ScrollView>
    //             </View>
    //         </ScrollView>
    //     </View>
    // )
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    text: { margin: 6 }
});
