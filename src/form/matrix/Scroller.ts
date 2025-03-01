interface Interpolator {
    getInterpolation(input: number): number;
}

export default class Scroller {
    private mInterpolator: Interpolator;

    private mMode: number = 0;

    private mStartX: number = 0;
    private mStartY: number = 0;
    private mFinalX: number = 0;
    private mFinalY: number = 0;

    private mMinX: number = 0;
    private mMaxX: number = 0;
    private mMinY: number = 0;
    private mMaxY: number = 0;

    private mCurrX: number = 0;
    private mCurrY: number = 0;
    private mStartTime: number = 0;
    private mDuration: number = 0;
    private mDurationReciprocal: number = 0;
    private mDeltaX: number = 0;
    private mDeltaY: number = 0;
    private mFinished: boolean = true;
    private mFlywheel: boolean = false;

    private mVelocity: number = 0;
    private mCurrVelocity: number = 0;
    private mDistance: number = 0;

    private mFlingFriction: number = Scroller.getScrollFriction();

    private static readonly DEFAULT_DURATION: number = 250;
    private static readonly SCROLL_MODE: number = 0;
    private static readonly FLING_MODE: number = 1;

    private static readonly DECELERATION_RATE: number = parseFloat((Math.log(0.78) / Math.log(0.9)).toFixed(2));
    private static readonly INFLEXION: number = 0.35; // Tension lines cross at (INFLEXION, 1)
    private static readonly START_TENSION: number = 0.5;
    private static readonly END_TENSION: number = 1.0;
    private static readonly P1: number = Scroller.START_TENSION * Scroller.INFLEXION;
    private static readonly P2: number = 1.0 - Scroller.END_TENSION * (1.0 - Scroller.INFLEXION);

    private static readonly NB_SAMPLES: number = 100;
    private static readonly SPLINE_POSITION: number[] = new Array(Scroller.NB_SAMPLES + 1);
    private static readonly SPLINE_TIME: number[] = new Array(Scroller.NB_SAMPLES + 1);

    private mDeceleration: number = 0;
    private readonly mPpi: number = 320;

    // A context-specific coefficient adjusted to physical values.
    private mPhysicalCoeff: number = 0;

    static getScrollFriction() {
        return 0.015;
    }

    static currentAnimationTimeMillis() {
        return new Date().getTime();
    }

    static signum(num: number) {
        if (num === 0) {
            return 0;
        } else if (num > 0) {
            return 1;
        } else {
            return -1;
        }
    }

    static init() {
        let x_min: number = 0.0;
        let y_min: number = 0.0;
        for (let i = 0; i < Scroller.NB_SAMPLES; i++) {
            const alpha: number = i / Scroller.NB_SAMPLES;

            let x_max: number = 1.0;
            let x: number, tx: number, coef: number;
            while (true) {
                x = x_min + (x_max - x_min) / 2.0;
                coef = 3.0 * x * (1.0 - x);
                tx = coef * ((1.0 - x) * Scroller.P1 + x * Scroller.P2) + x * x * x;
                if (Math.abs(tx - alpha) < 1e-5) break;
                if (tx > alpha) x_max = x;
                else x_min = x;
            }
            Scroller.SPLINE_POSITION[i] = coef * ((1.0 - x) * Scroller.START_TENSION + x) + x * x * x;

            let y_max: number = 1.0;
            let y: number, dy: number;
            while (true) {
                y = y_min + (y_max - y_min) / 2.0;
                coef = 3.0 * y * (1.0 - y);
                dy = coef * ((1.0 - y) * Scroller.START_TENSION + y) + y * y * y;
                if (Math.abs(dy - alpha) < 1e-5) break;
                if (dy > alpha) y_max = y;
                else y_min = y;
            }
            Scroller.SPLINE_TIME[i] = coef * ((1.0 - y) * Scroller.P1 + y * Scroller.P2) + y * y * y;
        }
        Scroller.SPLINE_POSITION[Scroller.NB_SAMPLES] = Scroller.SPLINE_TIME[Scroller.NB_SAMPLES] = 1.0;
    }

    constructor(interpolator?: Interpolator, flywheel: boolean = true) {
        this.mFinished = true;
        this.mInterpolator = interpolator || new ViscousFluidInterpolator();
        this.mDeceleration = this.computeDeceleration(Scroller.getScrollFriction());
        this.mFlywheel = flywheel;

        this.mPhysicalCoeff = this.computeDeceleration(0.84); // look and feel tuning
    }

    public setFriction(friction: number): void {
        this.mDeceleration = this.computeDeceleration(friction);
        this.mFlingFriction = friction;
    }

    private computeDeceleration(friction: number): number {
        return (
            9.8 * // g (m/s^2)
            39.37 * // inch/meter
            this.mPpi * // pixels per inch
            friction
        );
    }

    public isFinished(): boolean {
        return this.mFinished;
    }

    public forceFinished(finished: boolean): void {
        this.mFinished = finished;
    }

    public getDuration(): number {
        return this.mDuration;
    }

    public getCurrX(): number {
        return this.mCurrX;
    }

    public getCurrY(): number {
        return this.mCurrY;
    }

    public getCurrVelocity(): number {
        return this.mMode === Scroller.FLING_MODE
            ? this.mCurrVelocity
            : this.mVelocity - (this.mDeceleration * this.timePassed()) / 2000.0;
    }

    public getStartX(): number {
        return this.mStartX;
    }

    public getStartY(): number {
        return this.mStartY;
    }

    public getFinalX(): number {
        return this.mFinalX;
    }

    public getFinalY(): number {
        return this.mFinalY;
    }

    public computeScrollOffset(): boolean {
        if (this.mFinished) {
            return false;
        }

        const timePassed: number = Scroller.currentAnimationTimeMillis() - this.mStartTime;

        if (timePassed < this.mDuration) {
            switch (this.mMode) {
                case Scroller.SCROLL_MODE:
                    const x: number = this.mInterpolator.getInterpolation(timePassed * this.mDurationReciprocal);
                    this.mCurrX = this.mStartX + Math.round(x * this.mDeltaX);
                    this.mCurrY = this.mStartY + Math.round(x * this.mDeltaY);
                    break;
                case Scroller.FLING_MODE:
                    const t: number = timePassed / this.mDuration;
                    const index: number = Math.floor(Scroller.NB_SAMPLES * t);
                    let distanceCoef: number = 1.0;
                    let velocityCoef: number = 0.0;
                    if (index < Scroller.NB_SAMPLES) {
                        const t_inf: number = index / Scroller.NB_SAMPLES;
                        const t_sup: number = (index + 1) / Scroller.NB_SAMPLES;
                        const d_inf: number = Scroller.SPLINE_POSITION[index];
                        const d_sup: number = Scroller.SPLINE_POSITION[index + 1];
                        velocityCoef = (d_sup - d_inf) / (t_sup - t_inf);
                        distanceCoef = d_inf + (t - t_inf) * velocityCoef;
                    }

                    this.mCurrVelocity = ((velocityCoef * this.mDistance) / this.mDuration) * 1000.0;

                    this.mCurrX = this.mStartX + Math.round(distanceCoef * (this.mFinalX - this.mStartX));
                    this.mCurrX = Math.min(this.mCurrX, this.mMaxX);
                    this.mCurrX = Math.max(this.mCurrX, this.mMinX);

                    this.mCurrY = this.mStartY + Math.round(distanceCoef * (this.mFinalY - this.mStartY));
                    this.mCurrY = Math.min(this.mCurrY, this.mMaxY);
                    this.mCurrY = Math.max(this.mCurrY, this.mMinY);

                    if (this.mCurrX === this.mFinalX && this.mCurrY === this.mFinalY) {
                        this.mFinished = true;
                    }

                    break;
            }
        } else {
            this.mCurrX = this.mFinalX;
            this.mCurrY = this.mFinalY;
            this.mFinished = true;
        }
        return true;
    }

    public startScroll(
        startX: number,
        startY: number,
        dx: number,
        dy: number,
        duration: number = Scroller.DEFAULT_DURATION
    ): void {
        this.mMode = Scroller.SCROLL_MODE;
        this.mFinished = false;
        this.mDuration = duration;
        this.mStartTime = Scroller.currentAnimationTimeMillis();
        this.mStartX = startX;
        this.mStartY = startY;
        this.mFinalX = startX + dx;
        this.mFinalY = startY + dy;
        this.mDeltaX = dx;
        this.mDeltaY = dy;
        this.mDurationReciprocal = 1.0 / this.mDuration;
    }

    public fling(
        startX: number,
        startY: number,
        velocityX: number,
        velocityY: number,
        minX: number,
        maxX: number,
        minY: number,
        maxY: number
    ): void {
        // if (this.mFlywheel && !this.mFinished) {
        //     const oldVel: number = this.getCurrVelocity();

        //     const dx: number = this.mFinalX - this.mStartX;
        //     const dy: number = this.mFinalY - this.mStartY;
        //     const hyp: number = Math.hypot(dx, dy);

        //     const ndx: number = dx / hyp;
        //     const ndy: number = dy / hyp;

        //     const oldVelocityX: number = ndx * oldVel;
        //     const oldVelocityY: number = ndy * oldVel;
        //     if (
        //         Scroller.signum(velocityX) === Scroller.signum(oldVelocityX) &&
        //         Scroller.signum(velocityY) === Scroller.signum(oldVelocityY)
        //     ) {
        //         velocityX += oldVelocityX;
        //         velocityY += oldVelocityY;
        //     }
        // }

        this.mMode = Scroller.FLING_MODE;
        this.mFinished = false;

        const velocity: number = Math.hypot(velocityX, velocityY);

        this.mVelocity = velocity;
        this.mDuration = this.getSplineFlingDuration(velocity);
        this.mStartTime = Scroller.currentAnimationTimeMillis();
        this.mStartX = startX;
        this.mStartY = startY;

        const coeffX: number = velocity === 0 ? 1.0 : velocityX / velocity;
        const coeffY: number = velocity === 0 ? 1.0 : velocityY / velocity;

        const totalDistance: number = this.getSplineFlingDistance(velocity);
        this.mDistance = Math.floor(totalDistance * Scroller.signum(velocity));

        this.mMinX = minX;
        this.mMaxX = maxX;
        this.mMinY = minY;
        this.mMaxY = maxY;

        this.mFinalX = startX + Math.round(totalDistance * coeffX);
        this.mFinalX = Math.min(this.mFinalX, this.mMaxX);
        this.mFinalX = Math.max(this.mFinalX, this.mMinX);

        this.mFinalY = startY + Math.round(totalDistance * coeffY);
        this.mFinalY = Math.min(this.mFinalY, this.mMaxY);
        this.mFinalY = Math.max(this.mFinalY, this.mMinY);
    }

    private getSplineDeceleration(velocity: number): number {
        return Math.log((Scroller.INFLEXION * Math.abs(velocity)) / (this.mFlingFriction * this.mPhysicalCoeff));
    }

    private getSplineFlingDuration(velocity: number): number {
        const l: number = this.getSplineDeceleration(velocity);
        const decelMinusOne: number = Scroller.DECELERATION_RATE - 1.0;
        return Math.floor(1000.0 * Math.exp(l / decelMinusOne));
    }

    private getSplineFlingDistance(velocity: number): number {
        const l: number = this.getSplineDeceleration(velocity);
        const decelMinusOne: number = Scroller.DECELERATION_RATE - 1.0;
        return this.mFlingFriction * this.mPhysicalCoeff * Math.exp((Scroller.DECELERATION_RATE / decelMinusOne) * l);
    }

    public abortAnimation(): void {
        this.mCurrX = this.mFinalX;
        this.mCurrY = this.mFinalY;
        this.mFinished = true;
    }

    public extendDuration(extend: number): void {
        const passed: number = this.timePassed();
        this.mDuration = passed + extend;
        this.mDurationReciprocal = 1.0 / this.mDuration;
        this.mFinished = false;
    }

    public timePassed(): number {
        return Scroller.currentAnimationTimeMillis() - this.mStartTime;
    }

    public setFinalX(newX: number): void {
        this.mFinalX = newX;
        this.mDeltaX = this.mFinalX - this.mStartX;
        this.mFinished = false;
    }

    public setFinalY(newY: number): void {
        this.mFinalY = newY;
        this.mDeltaY = this.mFinalY - this.mStartY;
        this.mFinished = false;
    }

    public isScrollingInDirection(xvel: number, yvel: number): boolean {
        return (
            !this.mFinished &&
            Scroller.signum(xvel) === Scroller.signum(this.mFinalX - this.mStartX) &&
            Scroller.signum(yvel) === Scroller.signum(this.mFinalY - this.mStartY)
        );
    }
}

class ViscousFluidInterpolator implements Interpolator {
    private static readonly VISCOUS_FLUID_SCALE: number = 8.0;
    private static readonly VISCOUS_FLUID_NORMALIZE: number = 1.0 / ViscousFluidInterpolator.viscousFluid(1.0);
    private static readonly VISCOUS_FLUID_OFFSET: number =
        1.0 - ViscousFluidInterpolator.VISCOUS_FLUID_NORMALIZE * ViscousFluidInterpolator.viscousFluid(1.0);

    private static viscousFluid(x: number): number {
        x *= ViscousFluidInterpolator.VISCOUS_FLUID_SCALE;
        if (x < 1.0) {
            x -= 1.0 - Math.exp(-x);
        } else {
            const start: number = 0.36787944117; // 1/e == exp(-1)
            x = 1.0 - Math.exp(1.0 - x);
            x = start + x * (1.0 - start);
        }
        return x;
    }

    public getInterpolation(input: number): number {
        const interpolated: number =
            ViscousFluidInterpolator.VISCOUS_FLUID_NORMALIZE * ViscousFluidInterpolator.viscousFluid(input);
        if (interpolated > 0) {
            return interpolated + ViscousFluidInterpolator.VISCOUS_FLUID_OFFSET;
        }
        return interpolated;
    }
}
