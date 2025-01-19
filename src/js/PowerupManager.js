import { flashMessage } from "./flashMessage.js";
import confetti from "canvas-confetti";
import { FireCursor } from "./fireCursor.js";

export class PowerupManager {
    constructor() {
        this.active = false;
        this.multiplier = 1;
        this.timeout = null;
        this.timerElement = document.getElementById("timer");
        this.mobileTimerElement = null;
        this.fireCursor = null;
        this.setupMobileTimer();
    }

    setupMobileTimer() {
        this.mobileTimerElement = document.createElement("div");
        this.mobileTimerElement.id = "mobile-timer";
        document.getElementById("button-container").prepend(this.mobileTimerElement);
    }

    spawnPowerup() {
        const powerup = document.createElement("div");
        powerup.id = "powerup";
        powerup.style.left = Math.random() * (window.innerWidth - 40) + "px";
        powerup.style.top = "0";
        powerup.style.position = "fixed";
        powerup.style.animation = "fall 3s linear forwards";

        this.setupPowerupAnimation();
        this.setupPowerupClickHandler(powerup);

        document.body.appendChild(powerup);
        setTimeout(() => powerup.remove(), 3000);
    }

    setupPowerupAnimation() {
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
    }

    setupPowerupClickHandler(powerup) {
        powerup.addEventListener("click", (e) => {
            e.stopPropagation();
            this.createConfettiExplosion(e);
            this.activate();
            flashMessage(0, [{
                clicks: 0,
                messageKey: 'powerups.fire'
            }]);
            powerup.remove();
        });
    }

    createConfettiExplosion(e) {
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

        confetti({
            ...defaults,
            particleCount: count,
            gravity: 1.2,
            scalar: 1.5,
        });
    }

    activate() {
        this.active = true;
        this.multiplier = 2;
        this.timerElement.style.display = "block";
        
        // Initialize fire cursor
        const canvas = document.createElement("canvas");
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "9999";
        document.body.appendChild(canvas);
        this.fireCursor = new FireCursor(canvas);
        this.fireCursor.startAnimation();

        let timeLeft = 30;

        clearInterval(this.timeout);
        this.timeout = setInterval(() => {
            timeLeft--;
            this.timerElement.textContent = `${timeLeft}s`;
            this.mobileTimerElement.textContent = `${timeLeft}s`;

            if (timeLeft <= 0) {
                this.deactivate();
            }
        }, 1000);
    }

    deactivate() {
        clearInterval(this.timeout);
        this.active = false;
        this.multiplier = 1;
        this.timerElement.style.display = "none";
        this.mobileTimerElement.textContent = "";
        
        // Remove fire cursor
        if (this.fireCursor) {
            this.fireCursor.canvas.remove();
            this.fireCursor = null;
        }
    }

    spawnRandomCarrot() {
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

        carrot.onclick = (e) => {
            const bonus = 50;
            this.createConfettiExplosion(e);
            flashMessage(bonus, [{
                clicks: bonus,
                messageKey: 'powerups.bonusPoints'
            }]);
            carrot.remove();
            document.dispatchEvent(new CustomEvent('powerupCollected', { 
                detail: { bonus }
            }));
        };

        document.body.appendChild(carrot);
        setTimeout(() => carrot.remove(), 3000);
    }

    startPowerupSpawnTimer(clickSpeed) {
        const minDelay = 45000;
        const maxDelay = 60000;
        const speedMultiplier = Math.max(0.1, Math.min(1, clickSpeed / 5));
        const delay = maxDelay - (maxDelay - minDelay) * speedMultiplier;

        setTimeout(() => {
            this.spawnPowerup();
            this.startPowerupSpawnTimer(clickSpeed);
        }, delay);
    }

    getMultiplier() {
        return this.multiplier;
    }

    isActive() {
        return this.active;
    }
}
