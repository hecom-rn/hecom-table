import { LetterUtils } from '../../../utils/LetterUtils';
import { BaseSequenceFormat } from './BaseSequenceFormat';

/**
 */
export class LetterSequenceFormat extends BaseSequenceFormat {
    public format(position: number): string {
        return LetterUtils.ToNumberSystem26(position);
    }
}
