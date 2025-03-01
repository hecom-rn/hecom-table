/**
 * 观察者模式实现
 */
export abstract class Observable<T> {
    public readonly observables: Set<T> = new Set<T>();

    /**
     * AttachObserver（通过实例注册观察者）
     */
    public register(observer: T): void {
        if (observer == null) throw new Error('observer is null');
        if (!this.observables.has(observer)) {
            this.observables.add(observer);
        }
    }

    /**
     * UnAttach Observer（注销观察者）
     */
    public unRegister(observer: T): void {
        if (observer == null) throw new Error('observer is null');
        if (this.observables.has(observer)) {
            this.observables.delete(observer);
        }
    }

    public unRegisterAll(): void {
        this.observables.clear();
    }

    /**
     * return the size of observers
     */
    public countObservers(): number {
        return this.observables.size;
    }

    /**
     * notify all observer（通知所有观察者，在子类中实现）
     */
    public abstract notifyObservers(observers: Set<T>): void;
}
