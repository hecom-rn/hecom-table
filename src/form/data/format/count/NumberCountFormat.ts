import type { ICountFormat } from './ICountFormat';

/**
 * 数字总计格式化
 */
export class NumberCountFormat<T> implements ICountFormat<T> {
    private totalLongCount: number = 0;

    public count(t: T): void {
        const number = t as number;
        this.totalLongCount += number;
    }

    public getCount(): number {
        return this.totalLongCount;
    }

    public getCountString(): string {
        return String(this.totalLongCount);
    }

    public clearCount(): void {
        this.totalLongCount = 0;
    }
}
