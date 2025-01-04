let clickCounter = 0;
const clickCounterElement = document.getElementById("click-counter");
const fullscreenButton = document.getElementById("fullscreen-button");

// Register Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
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
});

// Add event listener to fullscreen button to toggle full screen mode
fullscreenButton.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
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
