import achievementsData from "../achievements.json";

describe("Achievement System", () => {
    let achievements;

    beforeEach(() => {
        // Reset localStorage before each test
        localStorage.clear();
        // Create a fresh copy of achievements for each test
        achievements = JSON.parse(
            JSON.stringify(achievementsData.achievements),
        );
    });

    test("achievements should start unearned", () => {
        Object.values(achievements).forEach((achievement) => {
            expect(achievement.earned).toBeFalsy();
        });
    });

    test("beginner achievement should unlock at 50 clicks", () => {
        const beginnerAchievement = achievements.Beginner;
        expect(beginnerAchievement.threshold).toBe(50);
        expect(beginnerAchievement.earned).toBeFalsy();

        // Simulate checking achievement at threshold
        if (50 >= beginnerAchievement.threshold) {
            beginnerAchievement.earned = true;
        }

        expect(beginnerAchievement.earned).toBeTruthy();
    });

    test("achievements should be earned in order", () => {
        const clickCounts = [0, 25, 50, 75, 100];
        const expectedEarned = [0, 0, 1, 1, 2]; // Number of achievements expected at each click count

        clickCounts.forEach((clicks, index) => {
            Object.values(achievements).forEach((achievement) => {
                if (clicks >= achievement.threshold && !achievement.earned) {
                    achievement.earned = true;
                }
            });

            const earnedCount = Object.values(achievements).filter(
                (achievement) => achievement.earned,
            ).length;

            expect(earnedCount).toBe(expectedEarned[index]);
        });
    });

    test("achievements should persist to localStorage", () => {
        // Simulate earning an achievement
        achievements.Beginner.earned = true;

        // Save to localStorage
        localStorage.setItem("achievements", JSON.stringify(achievements));

        // Read back from localStorage
        const savedAchievements = JSON.parse(
            localStorage.getItem("achievements"),
        );

        expect(savedAchievements.Beginner.earned).toBeTruthy();
    });
});
