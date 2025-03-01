import { BaseSequenceFormat } from './BaseSequenceFormat';

export class NumberSequenceFormat extends BaseSequenceFormat {
    public format(position: number): string {
        return String(position);
    }
}
