import i18n from './i18n';
import { flashMessage } from "./flashMessage.js";

export class AchievementManager {
    constructor(achievementsData) {
        this.achievements = achievementsData.achievements;
        this.loadSavedAchievements();
    }

    loadSavedAchievements() {
        const savedAchievements = localStorage.getItem("achievements");
        if (savedAchievements) {
            Object.assign(this.achievements, JSON.parse(savedAchievements));
        }
    }

    updateAchievementsTable(clicks) {
        const table = document.getElementById("achievements-table");
        const tbody = document.getElementById("achievements-body");
        tbody.innerHTML = "";

        const achievementsArray = Object.entries(this.achievements)
            .map(([name, achievement]) => ({ name, ...achievement }))
            .sort((a, b) => a.threshold - b.threshold);

        let lastEarned = null;
        const nextUnearned = [];

        for (const achievement of achievementsArray) {
            if (achievement.earned) {
                lastEarned = achievement;
            } else if (nextUnearned.length < 2) {
                nextUnearned.push(achievement);
            }
        }

        let hasEarned = false;
        const isMobile = window.innerWidth <= 768;
        const achievementsToShow = isMobile
            ? nextUnearned.slice(0, 1)
            : [lastEarned, ...nextUnearned].filter((a) => a !== null);

        for (const achievement of achievementsToShow) {
            const row = document.createElement("tr");
            const progress = Math.min(
                (clicks / achievement.threshold) * 100,
                100
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

        table.style.display =
            (isMobile && achievementsToShow.length > 0) || hasEarned
                ? "table"
                : "none";
    }

    checkAchievements(clicks) {
        let earned = false;
        for (const [name, achievement] of Object.entries(this.achievements)) {
            if (!achievement.earned && clicks >= achievement.threshold) {
                achievement.earned = true;
                earned = true;
                this.screenShake();
                this.flashAchievement(achievement);
            }
        }
        if (earned) {
            localStorage.setItem("achievements", JSON.stringify(this.achievements));
        }
        this.updateAchievementsTable(clicks);
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

    flashAchievement(achievement) {
        flashMessage(achievement.threshold, [{
            clicks: achievement.threshold,
            messageKey: achievement.messageKey
        }]);
    }

    reset() {
        Object.keys(this.achievements).forEach((key) => {
            this.achievements[key].earned = false;
        });
        localStorage.removeItem("achievements");
        this.updateAchievementsTable(0);
    }

    showAchievementsModal() {
        const modal = document.getElementById("modal");
        const modalAchievements = document.getElementById("modal-achievements");
        modalAchievements.innerHTML = "";

        const earnedAchievements = Object.entries(this.achievements)
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
    }
}
