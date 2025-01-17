import achievementsData from "../achievements.json";
import { i18n } from "./i18n.js";

class AchievementManager {
    constructor() {
        this.achievements = {};
        this.initializeAchievements();
    }

    initializeAchievements() {
        if (!achievementsData?.achievements) {
            console.error("Achievement data not properly loaded:", achievementsData);
            return;
        }

        this.achievements = { ...achievementsData.achievements };

        // Load saved achievements
        const savedAchievements = localStorage.getItem("achievements");
        if (savedAchievements) {
            Object.assign(this.achievements, JSON.parse(savedAchievements));
        }
    }

    getAchievementMessage(achievement) {
        // Try current language
        const messageKey = `message_${i18n.currentLang}`;
        const message = achievement[messageKey];
        if (message) return message;

        // Try English
        if (achievement.message_en) return achievement.message_en;
        
        // Fallback to default message
        if (achievement.message) return achievement.message;
        
        // Last resort
        console.error('No valid message found for achievement:', achievement);
        return 'Achievement Unlocked!';
    }

    getDisplayAchievements(clicks, isMobile = false) {
        // Convert achievements to array and sort by threshold
        const achievementsArray = Object.entries(this.achievements)
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

        return isMobile
            ? nextUnearned.slice(0, 1) // Show only next achievement on mobile
            : [lastEarned, ...nextUnearned].filter((a) => a !== null); // Show last earned + next two on desktop
    }

    checkAchievements(clicks, onAchievementEarned) {
        let earned = false;
        for (const [name, achievement] of Object.entries(this.achievements)) {
            if (!achievement.earned && clicks >= achievement.threshold) {
                achievement.earned = true;
                earned = true;
                onAchievementEarned?.(achievement);
            }
        }
        if (earned) {
            localStorage.setItem("achievements", JSON.stringify(this.achievements));
        }
        return earned;
    }

    reset() {
        Object.keys(this.achievements).forEach((key) => {
            this.achievements[key].earned = false;
        });
        localStorage.removeItem("achievements");
    }
}

export const achievementManager = new AchievementManager();
