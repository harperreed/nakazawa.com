import achievementsData from "../achievements.json";
import messages from "../messages.json";
import i18n, { i18nInstance } from './i18n';
import { flashMessage } from "./flashMessage.js";
import { FireCursor } from "./fireCursor.js";
import { AchievementManager } from "./AchievementManager.js";
import { VisualEffects } from "./VisualEffects.js";
import { PowerupManager } from "./PowerupManager.js";
import { ClickTracker } from "./ClickTracker.js";

const achievementManager = new AchievementManager(achievementsData);
const visualEffects = new VisualEffects();
const powerupManager = new PowerupManager();
const clickTracker = new ClickTracker();

// Expose powerupManager globally for debugging
window.powerupManager = powerupManager;




// Detect if the website is loaded on a desktop
const isDesktop = window.innerWidth > 1024;

const clickCounterElement = document.getElementById("click-counter");
const mobileCounterElement = document.createElement("div");
mobileCounterElement.id = "mobile-counter";
document.getElementById("button-container").prepend(mobileCounterElement);
const fullscreenButton = document.getElementById("fullscreen-button");

let clickCounter = Number.parseInt(localStorage.getItem("clickCount") || "0");
// Initialize counter and button container with hidden state
clickCounterElement.style.display = "none";
mobileCounterElement.style.display = "none";
document.getElementById("button-container").style.display = "none";
clickCounterElement.innerText = `${clickCounter}`;
mobileCounterElement.innerText = `${clickCounter}`;

// Initialize achievements table
achievementManager.updateAchievementsTable(clickCounter);

// Update achievements table on window resize
window.addEventListener("resize", () => {
    achievementManager.updateAchievementsTable(clickCounter);
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


function startPowerupSpawnTimer() {
    const minDelay = 45000; // 45 seconds minimum
    const maxDelay = 60000; // 60 seconds maximum

    // Faster clicking = shorter spawn time
    const speedMultiplier = Math.max(0.1, Math.min(1, clickSpeed / 5)); // cap at 5 clicks/sec
    const delay = maxDelay - (maxDelay - minDelay) * speedMultiplier;

    setTimeout(() => {
        powerupManager.spawnPowerup();
        startPowerupSpawnTimer(); // Schedule next spawn
    }, delay);
}

// Start the initial powerup spawn timer
powerupManager.startPowerupSpawnTimer(0);

// Initialize translations and setup
async function initializeApp() {
    // Wait for i18next to initialize
    await i18nInstance;

    // Initialize translations for static content
    const translationElements = document.querySelectorAll('[data-i18n]');
    const updatePageTranslations = () => {
        translationElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = i18n.t(key);
        });
    };

    // Set initial translations
    updatePageTranslations();

    // Handle language changes
    const languageSelect = document.getElementById('language-select');
    // Set initial language value after i18next has detected the language
    const currentLanguage = i18n.language.split('-')[0]; // Handle cases like 'en-US' -> 'en'
    languageSelect.value = currentLanguage;
    
    languageSelect.addEventListener('change', async (event) => {
        await i18n.changeLanguage(event.target.value);
        updatePageTranslations();
        // Update any dynamic content that needs translation
        updateAchievementsTable(clickCounter);
    });
}

// Start initialization
initializeApp().catch(console.error);

// Listen for powerup collection
document.addEventListener('powerupCollected', (e) => {
    clickCounter += e.detail.bonus;
    localStorage.setItem("clickCount", clickCounter.toString());
    clickCounterElement.innerText = `${clickCounter}`;
    mobileCounterElement.innerText = `${clickCounter}`;
    visualEffects.screenShake();
    visualEffects.vibrate("large");
});

document.addEventListener("click", (e) => {
    clickTracker.updateClickSpeed();
    visualEffects.createClickConfetti(e);

    clickCounter += powerupManager.getMultiplier();
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
    achievementManager.checkAchievements(clickCounter);

    // Random carrot spawn chance
    if (Math.random() < 0.01) {
        // 1% chance on each click
        powerupManager.spawnRandomCarrot();
    }

    // Haptic feedback
    if (clickCounter % 100 === 0) {
        console.log(
            `Click count ${clickCounter} divisible by 100 - triggering even bigger vibration`,
        );
        visualEffects.vibrate("evenBigger"); // Even bigger vibration
        // Display flash message
        console.log(
            `Flash message displayed: ${i18n.t('powerups.clickStreak', { count: clickCounter })}`,
        ); // Debug logging
    } else if (clickCounter % 10 === 0) {
        console.log(
            `Click count ${clickCounter} divisible by 10 - triggering large vibration`,
        );
        visualEffects.vibrate("large"); // Large vibration
    } else {
        console.log(`Click count ${clickCounter} - triggering small vibration`);
        visualEffects.vibrate("small"); // Small vibration
    }

    if (clickCounter % 25 === 0) {
        console.log(
            `Click count ${clickCounter} divisible by 25 - changing background color`,
        );
        visualEffects.blendBackgroundColor(clickCounter);
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
    const earnedAchievements = Object.entries(achievementManager.achievements)
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
    if (confirm(i18n.t('reset.confirm'))) {
        localStorage.clear();
        clickCounter = 0;
        achievementManager.reset();
        clickCounterElement.style.display = "none";
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
