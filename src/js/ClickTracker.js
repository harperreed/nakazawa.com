// ABOUTME: Tracks click speed and streak data for gameplay feedback.
// ABOUTME: Used by app.js to feed click velocity into powerup spawn timing.

export class ClickTracker {
	constructor() {
		this.lastClickTime = Date.now();
		this.clickSpeed = 0;
		this.streakCount = 0;
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
			streak: this.streakCount,
		};
	}

	getStreak() {
		return this.streakCount;
	}

	getClickSpeed() {
		return this.clickSpeed;
	}
}
