import confetti from "canvas-confetti";

let clickCounter = 0;
const clickCounterElement = document.getElementById("click-counter");
const fullscreenButton = document.getElementById("fullscreen-button");

// Register Service Worker
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register(new URL("./sw.js", import.meta.url), {
				type: "module", // Add this line to specify module type
			})
			.then((registration) => {
				console.log("ServiceWorker registration successful");
			})
			.catch((err) => {
				console.log("ServiceWorker registration failed: ", err);
			});
	});
}

// Detect if the website is loaded on a desktop
const isDesktop = window.innerWidth > 1024;

// Initialize confetti canvas
const myCanvas = document.createElement("canvas");
document.body.appendChild(myCanvas);
const myConfetti = confetti.create(myCanvas, {
	resize: true,
	useWorker: true,
});

// Define vibration patterns
const patterns = {
	small: 200,
	large: [200, 100, 200],
	evenBigger: [200, 100, 200, 100, 200],
};

// Vibration pattern function
function vibrationPattern(index) {
	if (!window.navigator.vibrate) {
		console.log(
			"Your device does not support the Vibration API. Try on an Android phone!",
		);
	} else {
		window.navigator.vibrate(patterns[index]);
	}
}

// Function to blend/fade the background color every 25 clicks
function blendBackgroundColor() {
	const colors = ["#FFB6C1", "#87CEEB", "#98FB98", "#DDA0DD", "#F0E68C"];
	const currentColorIndex = Math.floor(clickCounter / 25) % colors.length;
	const nextColorIndex = (currentColorIndex + 1) % colors.length;
	const currentColor = colors[currentColorIndex];
	const nextColor = colors[nextColorIndex];

	document.body.style.transition = "background-color 1s ease-in-out";
	document.body.style.backgroundColor = nextColor;
}

// Function to change the background to various images after 500 clicks
function changeBackgroundImage() {
	const images = [
		"url('image1.jpg')",
		"url('image2.jpg')",
		"url('image3.jpg')",
		"url('image4.jpg')",
		"url('image5.jpg')",
	];
	const imageIndex = Math.floor((clickCounter - 500) / 25) % images.length;
	document.body.style.backgroundImage = images[imageIndex];
}

// Handle clicks for confetti
document.addEventListener("click", (e) => {
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

	clickCounter++;
	if (clickCounter >= 10) {
		clickCounterElement.style.display = "block";
		clickCounterElement.innerText = `🎉: ${clickCounter}`;
		if (isDesktop) {
			fullscreenButton.style.display = "block";
		}
	}

	// Haptic feedback
	if (clickCounter % 100 === 0) {
		console.log(
			`Click count ${clickCounter} divisible by 100 - triggering even bigger vibration`,
		);
		vibrationPattern("evenBigger"); // Even bigger vibration
	} else if (clickCounter % 10 === 0) {
		console.log(
			`Click count ${clickCounter} divisible by 10 - triggering large vibration`,
		);
		vibrationPattern("large"); // Large vibration
	} else {
		console.log(`Click count ${clickCounter} - triggering small vibration`);
		vibrationPattern("small"); // Small vibration
	}

	if (clickCounter % 25 === 0) {
		console.log(
			`Click count ${clickCounter} divisible by 25 - changing background color`,
		);
		blendBackgroundColor();
	}

	if (clickCounter >= 500) {
		console.log(`Click count ${clickCounter} >= 5 - changing background image`);
		// changeBackgroundImage();
	}
});

// Add event listener to fullscreen button to toggle full screen mode
fullscreenButton.addEventListener("click", () => {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen().catch((err) => {
			console.warn("Fullscreen request denied:", err);
		});
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	}
});

// Handle PWA installation prompt
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
	e.preventDefault();
	deferredPrompt = e;
});
