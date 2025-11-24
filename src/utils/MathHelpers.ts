export class MathHelpers {
    static lerp(start: number, end: number, t: number): number {
        return start * (1 - t) + end * t;
    }

    static clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }
}
