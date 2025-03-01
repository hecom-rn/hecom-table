/**
 */
export interface ICountFormat<T> {
    count(t: T): void;

    getCount(): number;

    getCountString(): string;

    clearCount(): void;
}
