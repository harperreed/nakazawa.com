export class ClickTracker {
    constructor() {
        this.clickCounter = Number.parseInt(localStorage.getItem("clickCount") || "0");
        this.lastClickTime = Date.now();
        this.clickSpeed = 0;
        this.streakCount = 0;
    }

    getCount() {
        return this.clickCounter;
    }

    increment(multiplier = 1) {
        this.clickCounter += multiplier;
        localStorage.setItem("clickCount", this.clickCounter.toString());
        this.updateClickSpeed();
        return this.clickCounter;
    }

    reset() {
        this.clickCounter = 0;
        this.streakCount = 0;
        localStorage.removeItem("clickCount");
    }

    updateClickSpeed() {
        const now = Date.now();
        const timeDiff = (now - this.lastClickTime) / 500;
        this.clickSpeed = 1 / timeDiff;

        if (timeDiff < 1) {
            this.streakCount++;
        } else {
            this.streakCount = 0;
        }

        this.lastClickTime = now;
        return {
            speed: this.clickSpeed,
            streak: this.streakCount
        };
    }

    getStreak() {
        return this.streakCount;
    }

    getClickSpeed() {
        return this.clickSpeed;
    }
}
