// ABOUTME: Manages visual feedback effects (confetti, vibration, background color, screen shake).
// ABOUTME: Provides escalating haptic/visual responses to player clicks and achievements.

import confetti from "canvas-confetti";

export class VisualEffects {
	constructor() {
		this.setupVibrationPatterns();
	}

	setupVibrationPatterns() {
		this.patterns = {
			small: 200,
			large: [200, 100, 200],
			evenBigger: [200, 100, 200, 100, 200],
		};
	}

	createClickConfetti(e) {
		confetti({
			particleCount: 100,
			spread: 70,
			gravity: 0.4,
			shapes: ["star", "circle", "square"],
			colors: ["#FFB6C1", "#87CEEB", "#98FB98", "#DDA0DD", "#F0E68C"],
			origin: {
				x: e.clientX / window.innerWidth,
				y: e.clientY / window.innerHeight,
			},
		});
	}

	vibrate(pattern) {
		if (!window.navigator.vibrate) {
			return;
		}
		window.navigator.vibrate(this.patterns[pattern]);
	}

	blendBackgroundColor(clickCounter) {
		const colors = ["#FFB6C1", "#87CEEB", "#98FB98", "#DDA0DD", "#F0E68C"];
		const currentColorIndex = Math.floor(clickCounter / 25) % colors.length;
		const nextColorIndex = (currentColorIndex + 1) % colors.length;
		const nextColor = colors[nextColorIndex];

		document.body.style.transition = "background-color 1s ease-in-out";
		document.body.style.backgroundColor = nextColor;
	}

	screenShake() {
		document.body.style.transform = "translate(5px, 5px)";
		setTimeout(() => {
			document.body.style.transform = "translate(-5px, -5px)";
			setTimeout(() => {
				document.body.style.transform = "translate(0, 0)";
			}, 50);
		}, 50);
	}
}
