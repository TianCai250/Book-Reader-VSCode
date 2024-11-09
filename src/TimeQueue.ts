class TimeQueue {
    queue: number[] = [];
    push(time: number) {
        this.queue.push(time);
        if (this.queue.length > 10) {
            this.queue = this.queue.slice(this.queue.length - 10, this.queue.length);
        }
    }
    getSpeed() {
        if (this.queue.length <= 1) {
            return 0;
        }
        let interval = (this.queue[this.queue.length - 1] - this.queue[0]) / (this.queue.length - 1);
        return Math.round((60 * 60 * 1000) / interval);
    }
}

export default new TimeQueue();
