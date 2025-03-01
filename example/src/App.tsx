import { Text, View, StyleSheet } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import ExamTable from './ExamTable';
import Scroller from '../../src/form/matrix/Scroller';

function App() {
    Scroller.init();
    return (
        <View style={styles.container}>
            <Text>1234</Text>
            <ExamTable />
        </View>
    );
}

export default gestureHandlerRootHOC(App);
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
