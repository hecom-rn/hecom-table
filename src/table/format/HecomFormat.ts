import type { IFormat } from '../../form/data/format/IFormat';
import type { Cell } from '../bean/Cell';

export class HecomFormat implements IFormat<Cell> {
    format(cell: Cell): string {
        if (cell.getRichText()) {
            let sp = '';
            for (const richText of cell.getRichText()) {
                sp += richText.getText();
            }
            return sp;
        }
        return cell.getTitle();
    }
}
