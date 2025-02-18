import { Text, View, StyleSheet } from 'react-native';
import { SmartTable, ArrayTableData } from 'hecom-table';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

function App() {
  const data: string[][] = [
    ['时间', '星期一', '星期二', '星期三', '星期四', '星期五'],
    ['上午', '数学', '生物', '英语', '历史', '数学'],
    ['上午', '英语', '数学', '物理', '地理', '生物'],
    ['上午', '物理', '历史', '化学', '数学', '物理'],
    ['上午', '化学', '地理', '数学', '英语', '化学'],
    ['下午', '体育', '美术', '音乐', '体育', '美术'],
    ['下午', '数学', '英语', '物理', '地理', '生物'],
    ['下午', '英语', '数学', '化学', '历史', '物理'],
    ['下午', '物理', '生物', '数学', '英语', '化学'],
  ];
  const tableData = ArrayTableData.create('课程表', null, data.slice(1));
  return (
    <View style={styles.container}>
      <Text>1234</Text>
      <SmartTable style={styles.table} />
    </View>
  );
}

export default gestureHandlerRootHOC(App);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  table: {
    width: 300,
    height: 200,
    backgroundColor: 'gray',
  },
});
