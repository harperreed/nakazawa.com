import confetti from "canvas-confetti";
import { flashMessage } from "./flashMessage.js";
import messages from "../messages.json";
import achievementsData from "../achievements.json";

// Achievement System
const achievements = achievementsData.achievements;

// Load saved achievements
const savedAchievements = localStorage.getItem('achievements');
if (savedAchievements) {
    Object.assign(achievements, JSON.parse(savedAchievements));
}

function updateAchievementsTable(clicks) {
    const table = document.getElementById('achievements-table');
    const tbody = document.getElementById('achievements-body');
    tbody.innerHTML = '';

    let hasEarned = false;
    for (const [name, achievement] of Object.entries(achievements)) {
        const row = document.createElement('tr');
        const progress = Math.min(clicks / achievement.threshold * 100, 100).toFixed(0);
        row.innerHTML = `
            <td class="${achievement.earned ? 'earned' : 'locked'}">${achievement.message}</td>
            <td>${progress}%</td>
        `;
        tbody.appendChild(row);
        if (achievement.earned) {
            hasEarned = true;
        }
    }
    
    // Only show table if at least one achievement is earned
    table.style.display = hasEarned ? 'table' : 'none';
}

function checkAchievements(clicks) {
    let earned = false;
    for (const [name, achievement] of Object.entries(achievements)) {
        if (!achievement.earned && clicks >= achievement.threshold) {
            achievement.earned = true;
            earned = true;
            flashMessage(clicks, [{ clicks, message: `Achievement Unlocked: ${achievement.message}` }]);
        }
    }
    if (earned) {
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }
    updateAchievementsTable(clicks);
}

// Detect if the website is loaded on a desktop
const isDesktop = window.innerWidth > 1024;


const clickCounterElement = document.getElementById("click-counter");
const fullscreenButton = document.getElementById("fullscreen-button");

let clickCounter = parseInt(localStorage.getItem('clickCount') || '0');
// Update the counter display if there's a stored value
if (clickCounter >= 10) {
    clickCounterElement.style.display = "block";
    clickCounterElement.innerText = `🎉: ${clickCounter}`;
    if (isDesktop) {
        fullscreenButton.style.display = "block";
    }
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
    localStorage.setItem('clickCount', clickCounter.toString());
    if (clickCounter >= 10) {
        clickCounterElement.style.display = "block";
        clickCounterElement.innerText = `🎉: ${clickCounter}`;
        if (isDesktop) {
            fullscreenButton.style.display = "block";
        }
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
        console.log(
            `Click count ${clickCounter} >= 5 - changing background image`,
        );
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
