/**
 * 阅读速度追踪器。
 * 使用滑动窗口记录最近若干次翻页时间戳，通过平均间隔推算每小时阅读行数。
 * 每个 Book 实例独立持有，避免全局单例带来的测试和状态污染问题。
 */
const MAX_QUEUE_SIZE = 10;
const MS_PER_HOUR = 60 * 60 * 1000;

export class ReadingProgress {
    private queue: number[] = [];

    /** 记录一次翻页行为的时间戳 */
    record(): void {
        this.queue.push(Date.now());
        if (this.queue.length > MAX_QUEUE_SIZE) {
            this.queue.shift();
        }
    }

    /** 根据滑动窗口内的时间间隔计算平均阅读速度（行/时） */
    getSpeed(): number {
        if (this.queue.length <= 1) {
            return 0;
        }
        const interval = (this.queue[this.queue.length - 1] - this.queue[0]) / (this.queue.length - 1);
        if (interval <= 0) {
            return 0;
        }
        return Math.round(MS_PER_HOUR / interval);
    }

    /** 切换书籍时重置统计 */
    reset(): void {
        this.queue = [];
    }
}
