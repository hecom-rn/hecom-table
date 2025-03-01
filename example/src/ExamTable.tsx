import { Text, View, StyleSheet, TouchableHighlight } from 'react-native';
import { SmartTable, HecomTableData, HecomFormat, TextDrawFormat, Cell } from 'hecom-table';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { useEffect, useRef, useState } from 'react';

export default function ExamTable() {
    const [show, setShow] = useState(false);
    const tableData = useRef<HecomTableData>();
    useEffect(() => {
        console.log('useEffect');
        const testData: Cell[][] = [];
        for (let i = 0; i < 50; i++) {
            const tmp: Cell[] = [];
            for (let j = 0; j < 20; j++) {
                const c = new Cell();
                c.setTitle(`title${i}-${j}`);
                c.setKeyIndex(i * 10 + j + 3);
                tmp.push(c);
            }
            testData.push(tmp);
        }
        tableData.current = HecomTableData.create(testData, new HecomFormat(), new TextDrawFormat());
    }, [show]);
    return (
        <View style={styles.container}>
            <Text>1234</Text>
            <TouchableHighlight
                onPress={() => {
                    setShow(!show);
                }}
            >
                <Text style={{ width: 200, height: 30, backgroundColor: 'red' }}>初始化表格数据</Text>
            </TouchableHighlight>
            {show && <SmartTable style={styles.table} tableData={tableData.current} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5FCFF',
    },
    table: {
        width: 300,
        height: 200,
        backgroundColor: 'gray',
    },
});
