import confetti from "canvas-confetti";
import achievementsData from "../achievements.json";
import messages from "../messages.json";
import i18n, { i18nInstance } from './i18n';
import { flashMessage } from "./flashMessage.js";
import { FireCursor } from "./fireCursor.js";

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

    // Show different achievements based on screen size
    let hasEarned = false;
    const isMobile = window.innerWidth <= 768;
    const achievementsToShow = isMobile
        ? nextUnearned.slice(0, 1) // Show only next achievement on mobile
        : [lastEarned, ...nextUnearned].filter((a) => a !== null); // Show last earned + next two on desktop

    for (const achievement of achievementsToShow) {
        const row = document.createElement("tr");
        const progress = Math.min(
            (clicks / achievement.threshold) * 100,
            100,
        ).toFixed(0);
        row.innerHTML = `
            <td class="${achievement.earned ? "earned" : "locked"}">${i18n.t(achievement.messageKey)}</td>
            <td>${i18n.t('achievements.progress', { progress })}</td>
        `;
        tbody.appendChild(row);
        if (achievement.earned) {
            hasEarned = true;
        }
    }

    // Always show the table on mobile if there are achievements to show
    table.style.display =
        (isMobile && achievementsToShow.length > 0) || hasEarned
            ? "table"
            : "none";
}

function screenShake() {
    document.body.style.transform = "translate(5px, 5px)";
    setTimeout(() => {
        document.body.style.transform = "translate(-5px, -5px)";
        setTimeout(() => {
            document.body.style.transform = "translate(0, 0)";
        }, 50);
    }, 50);
}

function checkAchievements(clicks) {
    let earned = false;
    for (const [name, achievement] of Object.entries(achievements)) {
        if (!achievement.earned && clicks >= achievement.threshold) {
            achievement.earned = true;
            earned = true;
            screenShake();
            flashMessage(clicks, [
                {
                    clicks,
                    message: i18n.t('achievements.unlocked', { 
                        message: i18n.t(achievement.messageKey)
                    }),
                    messageKey: message.messageKey,
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
const mobileCounterElement = document.createElement("div");
mobileCounterElement.id = "mobile-counter";
document.getElementById("button-container").prepend(mobileCounterElement);
const fullscreenButton = document.getElementById("fullscreen-button");

let clickCounter = Number.parseInt(localStorage.getItem("clickCount") || "0");
let powerupActive = false;
let powerupMultiplier = 1;
let powerupTimeout = null;
let lastClickTime = Date.now();
let clickSpeed = 0; // clicks per second
let streakCount = 0;
// Initialize counter and button container with hidden state
clickCounterElement.style.display = "none";
mobileCounterElement.style.display = "none";
document.getElementById("button-container").style.display = "none";
clickCounterElement.innerText = `${clickCounter}`;
mobileCounterElement.innerText = `${clickCounter}`;

// Initialize achievements table
updateAchievementsTable(clickCounter);

// Update achievements table on window resize
window.addEventListener("resize", () => {
    updateAchievementsTable(clickCounter);
});

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
    const powerup = document.createElement("div");
    powerup.id = "powerup";
    powerup.style.left = Math.random() * (window.innerWidth - 40) + "px";
    powerup.style.top = "0";
    powerup.style.position = "fixed";
    powerup.style.animation = "fall 3s linear forwards";

    powerup.addEventListener("click", (e) => {
        e.stopPropagation();

        // Create large confetti explosion
        const count = 200;
        const defaults = {
            origin: {
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            },
            spread: 360,
            startVelocity: 45,
            scalar: 2,
            ticks: 100,
            colors: ["#ff0000", "#000000"],
            shapes: ["square", "circle"],
        };

        confetti({
            ...defaults,
            particleCount: count,
            gravity: 0.8,
        });

        // Second wave for more density
        confetti({
            ...defaults,
            particleCount: count,
            gravity: 1.2,
            scalar: 1.5,
        });

        activatePowerup();
        powerup.remove();
    });

    // Add animation keyframes
    if (!document.querySelector("#powerup-animation")) {
        const style = document.createElement("style");
        style.id = "powerup-animation";
        style.textContent = `
            @keyframes fall {
                from { top: -50px; }
                to { top: calc(100vh - 50px); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(powerup);

    // Remove powerup if not clicked after animation
    setTimeout(() => powerup.remove(), 3000);
}

let fireCursor = null;

function activatePowerup() {
    powerupActive = true;
    powerupMultiplier = 2;

    const timerElement = document.getElementById("timer");
    const mobileTimerElement = document.createElement("div");
    mobileTimerElement.id = "mobile-timer";
    document.getElementById("button-container").prepend(mobileTimerElement);
    timerElement.style.display = "block";

    // Initialize fire cursor if not already created
    if (!fireCursor) {
        const canvas = document.getElementById("fire-cursor");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        fireCursor = new FireCursor(canvas);
    }
    document.getElementById("fire-cursor").style.display = "block";

    let timeLeft = 30;

    clearInterval(powerupTimeout);
    powerupTimeout = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft}s`;
        mobileTimerElement.textContent = `${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(powerupTimeout);
            powerupActive = false;
            powerupMultiplier = 1;
            timerElement.style.display = "none";
            mobileTimerElement.remove(); // Remove the mobile timer element completely
            document.getElementById("fire-cursor").style.display = "none";
        }
    }, 1000);
}

// Calculate time since last click and update click speed
function updateClickSpeed() {
    const now = Date.now();
    const timeDiff = (now - lastClickTime) / 500; // convert to seconds
    clickSpeed = 1 / timeDiff; // clicks per second

    // Update streak
    if (timeDiff < 1) {
        // Within 1 second
        streakCount++;
        if (streakCount % 50 === 0) {
            // Every 10 clicks in streak
            flashMessage(clickCounter, [
                {
                    clicks: clickCounter,
                    message: `🔥 ${streakCount} Click Streak!`,
                },
            ]);
        }
    } else {
        streakCount = 0;
    }

    lastClickTime = now;
}

// Dynamic powerup spawn timing
function spawnRandomCarrot() {
    const carrot = document.createElement("div");
    carrot.style.position = "absolute";
    carrot.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
    carrot.style.top = `${Math.random() * (window.innerHeight - 50)}px`;
    carrot.style.width = "50px";
    carrot.style.height = "50px";
    carrot.style.cursor = "pointer";
    carrot.style.backgroundImage = `url("${new URL("../images/carrot-powerup.webp", import.meta.url)}")`;
    carrot.style.backgroundSize = "contain";
    carrot.style.filter = "drop-shadow(3px 3px 3px rgba(0,0,0,0.5))";

    carrot.onclick = () => {
        clickCounter += 50; // Bonus points
        carrot.remove();
        flashMessage(clickCounter, [
            { clicks: clickCounter, message: "🥕 +50 Bonus Points!" },
        ]);
    };

    document.body.appendChild(carrot);
    setTimeout(() => carrot.remove(), 3000); // Remove after 3 seconds
}

function startPowerupSpawnTimer() {
    const minDelay = 45000; // 45 seconds minimum
    const maxDelay = 60000; // 60 seconds maximum

    // Faster clicking = shorter spawn time
    const speedMultiplier = Math.max(0.1, Math.min(1, clickSpeed / 5)); // cap at 5 clicks/sec
    const delay = maxDelay - (maxDelay - minDelay) * speedMultiplier;

    setTimeout(() => {
        spawnPowerup();
        startPowerupSpawnTimer(); // Schedule next spawn
    }, delay);
}

// Start the initial spawn timer
startPowerupSpawnTimer();

// Initialize translations and setup
async function initializeApp() {
    // Wait for i18next to initialize
    await i18nInstance;

    // Initialize translations for static content
    const updatePageTranslations = () => {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = i18n.t(key);
        });
    };

    // Set initial translations
    updatePageTranslations();

    // Handle language changes
    const languageSelect = document.getElementById('language-select');
    languageSelect.value = i18n.language || 'en';
    
    languageSelect.addEventListener('change', async (event) => {
        await i18n.changeLanguage(event.target.value);
        updatePageTranslations();
        // Update any dynamic content that needs translation
        updateAchievementsTable(clickCounter);
    });
}

// Start initialization
initializeApp().catch(console.error);

document.addEventListener("click", (e) => {
    updateClickSpeed();
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

    clickCounterElement.innerText = `${clickCounter}`;
    mobileCounterElement.innerText = `${clickCounter}`;

    // Show counter at 10 clicks
    if (clickCounter >= 10) {
        clickCounterElement.style.display = "block";
        mobileCounterElement.style.display = "block";
    }

    // Show menu at 20 clicks
    if (clickCounter >= 20) {
        document.getElementById("button-container").style.display = "flex";
    }

    flashMessage(clickCounter, messages.messages);

    // Check achievements
    checkAchievements(clickCounter);

    // Random carrot spawn chance
    if (Math.random() < 0.01) {
        // 1% chance on each click
        console.log("spawning carrot");
        spawnRandomCarrot();
    }

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
        noAchievementsDiv.innerText = i18n.t('achievements.noAchievements');
        modalAchievements.appendChild(noAchievementsDiv);
    } else {
        earnedAchievements.forEach((achievement) => {
            const achievementDiv = document.createElement("div");
            achievementDiv.style.margin = "10px 0";
            achievementDiv.style.padding = "10px";
            achievementDiv.style.borderBottom = "2px solid #333";
            achievementDiv.innerHTML = `
                <div class="earned">
                    ${i18n.t(achievement.messageKey)}
                </div>
            `;
            modalAchievements.appendChild(achievementDiv);
        });
    }

    modal.style.display = "block";
});

// Debug powerup button
const debugPowerupButton = document.getElementById("debug-powerup");
if (debugPowerupButton) {
    debugPowerupButton.addEventListener("click", () => {
        spawnPowerup();
    });
}

resetButton.addEventListener("click", () => {
    if (
        confirm(
            i18n.t('reset.confirm')
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
