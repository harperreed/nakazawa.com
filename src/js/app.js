import confetti from "canvas-confetti";
import achievementsData from "../achievements.json";
import messages from "../messages.json";
import { flashMessage } from "./flashMessage.js";

// Achievement System
const achievements = achievementsData.achievements;

// Load saved achievements
const savedAchievements = localStorage.getItem("achievements");
if (savedAchievements) {
	Object.assign(achievements, JSON.parse(savedAchievements));
}

function updateAchievementsTable(clicks) {
	const table = document.getElementById("achievements-table");
	const tbody = document.getElementById("achievements-body");
	tbody.innerHTML = "";

	// Convert achievements to array and sort by threshold
	const achievementsArray = Object.entries(achievements)
		.map(([name, achievement]) => ({ name, ...achievement }))
		.sort((a, b) => a.threshold - b.threshold);

	// Find the last earned achievement and next two unearned
	let lastEarned = null;
	const nextUnearned = [];

	for (const achievement of achievementsArray) {
		if (achievement.earned) {
			lastEarned = achievement;
		} else if (nextUnearned.length < 2) {
			nextUnearned.push(achievement);
		}
	}

	// Show only these three achievements
	let hasEarned = false;
	const achievementsToShow = [lastEarned, ...nextUnearned].filter(
		(a) => a !== null,
	);

	for (const achievement of achievementsToShow) {
		const row = document.createElement("tr");
		const progress = Math.min(
			(clicks / achievement.threshold) * 100,
			100,
		).toFixed(0);
		row.innerHTML = `
            <td class="${achievement.earned ? "earned" : "locked"}">${achievement.message}</td>
            <td>${progress}%</td>
        `;
		tbody.appendChild(row);
		if (achievement.earned) {
			hasEarned = true;
		}
	}

	// Only show table if at least one achievement is earned
	table.style.display = hasEarned ? "table" : "none";
}

function checkAchievements(clicks) {
	let earned = false;
	for (const [name, achievement] of Object.entries(achievements)) {
		if (!achievement.earned && clicks >= achievement.threshold) {
			achievement.earned = true;
			earned = true;
			flashMessage(clicks, [
				{
					clicks,
					message: `Achievement Unlocked: ${achievement.message}`,
				},
			]);
		}
	}
	if (earned) {
		localStorage.setItem("achievements", JSON.stringify(achievements));
	}
	updateAchievementsTable(clicks);
}

// Detect if the website is loaded on a desktop
const isDesktop = window.innerWidth > 1024;

const clickCounterElement = document.getElementById("click-counter");
const fullscreenButton = document.getElementById("fullscreen-button");

let clickCounter = Number.parseInt(localStorage.getItem("clickCount") || "0");
let powerupActive = false;
let powerupMultiplier = 1;
let powerupTimeout = null;
// Update the counter display if there's a stored value
if (clickCounter >= 10) {
	clickCounterElement.style.display = "block";
	clickCounterElement.innerText = `${clickCounter}`;
}
if (clickCounter >= 25) {
	document.getElementById("button-container").style.display = "flex";
}

// Initialize achievements table
updateAchievementsTable(clickCounter);

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
function spawnPowerup() {
    const powerup = document.createElement('div');
    powerup.id = 'powerup';
    powerup.style.left = Math.random() * (window.innerWidth - 40) + 'px';
    
    powerup.addEventListener('click', (e) => {
        e.stopPropagation();
        activatePowerup();
        powerup.remove();
    });

    document.body.appendChild(powerup);

    // Remove powerup if not clicked after animation
    setTimeout(() => powerup.remove(), 3000);
}

function activatePowerup() {
    powerupActive = true;
    powerupMultiplier = 2;
    
    const timerElement = document.getElementById('timer');
    timerElement.style.display = 'block';
    
    let timeLeft = 30;
    
    clearInterval(powerupTimeout);
    powerupTimeout = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Powerup: ${timeLeft}s`;
        
        if (timeLeft <= 0) {
            clearInterval(powerupTimeout);
            powerupActive = false;
            powerupMultiplier = 1;
            timerElement.style.display = 'none';
        }
    }, 1000);
}

// Spawn powerup every 30 seconds
setInterval(spawnPowerup, 30000);

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

	clickCounter += powerupMultiplier;
	localStorage.setItem("clickCount", clickCounter.toString());

	if (clickCounter >= 10) {
		clickCounterElement.style.display = "block";
		clickCounterElement.innerText = `${clickCounter}`;
	}

	if (clickCounter >= 25) {
		document.getElementById("button-container").style.display = "flex";
	}

	flashMessage(clickCounter, messages.messages);

	// Check achievements
	checkAchievements(clickCounter);

	// Haptic feedback
	if (clickCounter % 100 === 0) {
		console.log(
			`Click count ${clickCounter} divisible by 100 - triggering even bigger vibration`,
		);
		vibrationPattern("evenBigger"); // Even bigger vibration
		// Display flash message
		console.log(
			`Flash message displayed: You've reached ${clickCounter} clicks!`,
		); // Debug logging
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

// Button functionality
const achievementsButton = document.getElementById("achievements-button");
const resetButton = document.getElementById("reset-button");
const modal = document.getElementById("modal");
const closeBtn = document.querySelector(".close");

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

achievementsButton.addEventListener("click", () => {
	const modalAchievements = document.getElementById("modal-achievements");
	modalAchievements.innerHTML = ""; // Clear existing content

	// Filter and sort earned achievements
	const earnedAchievements = Object.entries(achievements)
		.map(([name, achievement]) => ({ name, ...achievement }))
		.filter((achievement) => achievement.earned)
		.sort((a, b) => a.threshold - b.threshold);

	if (earnedAchievements.length === 0) {
		const noAchievementsDiv = document.createElement("div");
		noAchievementsDiv.style.textAlign = "center";
		noAchievementsDiv.style.padding = "20px";
		noAchievementsDiv.innerText = "No achievements earned yet. Keep clicking!";
		modalAchievements.appendChild(noAchievementsDiv);
	} else {
		earnedAchievements.forEach((achievement) => {
			const achievementDiv = document.createElement("div");
			achievementDiv.style.margin = "10px 0";
			achievementDiv.style.padding = "10px";
			achievementDiv.style.borderBottom = "2px solid #333";
			achievementDiv.innerHTML = `
                <div class="earned">
                    ${achievement.message}
                </div>
            `;
			modalAchievements.appendChild(achievementDiv);
		});
	}

	modal.style.display = "block";
});

resetButton.addEventListener("click", () => {
	if (
		confirm(
			"Are you sure you want to reset all progress? This cannot be undone.",
		)
	) {
		localStorage.clear();
		clickCounter = 0;
		Object.keys(achievements).forEach((key) => {
			achievements[key].earned = false;
		});
		clickCounterElement.style.display = "none";
		updateAchievementsTable(0);
		location.reload(); // Refresh the page to reset everything
	}
});

closeBtn.addEventListener("click", () => {
	modal.style.display = "none";
});

window.addEventListener("click", (event) => {
	if (event.target === modal) {
		modal.style.display = "none";
	}
});

// Handle PWA installation prompt
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
	e.preventDefault();
	deferredPrompt = e;
});
