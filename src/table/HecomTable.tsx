import { SmartTable } from '../form/core/SmartTable';
import type { Cell } from './bean/Cell';

export class HecomTable extends SmartTable<Cell> {
    componentDidUpdate() {
        const { frozenRows, frozenColumns } = this.props;
        this.getConfig().setFixedLines(frozenRows);
        super.componentDidUpdate();
    }
}
