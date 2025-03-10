// config.js
const CONFIG = {
    // =========================================================================
    // 1. Game Settings
    // =========================================================================

    settings: {
        tickInterval: 25,          //  ~40 ticks per second (Real-time: 0.025 seconds per tick) - Adjusted for 10 min lifespan
        ticksInOneGameDay: 5,        // 5 ticks per game day - Keep this for now, can adjust
        seasonDuration: 30 * 5,      // 30 days per season * 5 ticks per day = 150 ticks per season
        ticksInOneGameYear: 4 * (30 * 5), // 4 seasons * 150 ticks per season = 600 ticks per year (120 days * 5 ticks/day = 600)
        maxAge: 65,                  // Max age - unchanged
        startingGold: 0,
        eventChance: 0.2, // saved for later - currently no events implemented
        achievementCheckInterval: 600, // Check achievements every year (600 ticks) - adjust as needed
        speedMultipliers: [1, 2, 4],
        maxEventLogEntries: 5,
        // ... (rest of your settings) ...
        timeUnitsPerSeason: 24,      // <-- NEW SETTING: Total time units per season (unchanged for now)
        baseRequirements: {         // <-- NEW SETTING: Base time unit requirements (unchanged for now)
            sleep: 8,
            commute: 2,
            meals: 3
        },
    },
    
    // =========================================================================
    // 2. Base URL Configuration
    // =========================================================================

    baseUrl: "/",

    // =========================================================================
    // 3. Skill Configuration - SIMPLIFIED to ONE (Keep Map Awareness for now)
    // =========================================================================

    skillConfig: {
        "Map Awareness": {
            description: "Your ability to navigate and identify locations.",
            maxLevel: 100,
            icon: "fa-map-location-dot"
        }
    },

    // =========================================================================
    // 4. Shop Items Configuration - SIMPLIFIED to ONE (Life Extension)
    // =========================================================================

    shopItems: [
        {
            id: "lifeExtension",
            name: "Life Extension",
            description: "Extend your maximum age by 10 years.",
            price: 500,
            effect: "maxAge:10",
            maxPurchases: 3,
            icon: "fa-heart"
        }
    ],

    // =========================================================================
    // 5. UI Text Configuration (unchanged)
    // =========================================================================

    uiText: {
        gameTitle: "Guezzard - Master Your Career", // Updated game title!
        endGameTitle: "Game Over - Retirement!",
        newLifeButton: "Start New Life",
        achievementUnlocked: "Achievement Unlocked!",
        achievementButton: "Nice!",
        eventCloseButton: "OK",
        pauseButton: "Pause",
        resumeButton: "Resume",
        speedButton: "Speed: "
    },

    // =========================================================================
    // 6. Core Balancing Numbers (unchanged)
    // =========================================================================

    balancing: {
        baseLifeQualityDecay: 0.1,
        unemployedLifeQualityDecay: 0.2,
        workingLifeQualityIncrease: 0.05
    },

    // =========================================================================
    // 7. Job Configuration - SIMPLIFIED to ONE (Google Maps User)
    // =========================================================================

    geoguesserCareerPath: [
        {
            title: "Google Maps User",
            minSkill: 0,
            incomePerYear: 200,      // Increased income for testing
            skillGainPerYear: {
                "Map Awareness": 5  // Increased skill gain for testing
            },
            levelBonuses: [ // <-- ADDED levelBonuses ARRAY (as discussed)
                { level: 5, bonusType: "jobXpMultiplier", bonusValue: 0.05 }, // Level 5: +5% Job XP
                { level: 10, bonusType: "jobXpMultiplier", bonusValue: 0.1 }, // Level 10: +10% Job XP (cumulative)
                { level: 20, bonusType: "goldMultiplier", bonusValue: 0.02 }    // Level 20: +2% Gold Multiplier (example)
            ]
        }
    ],

    // =========================================================================
    // 8. Weather and Seasons Configuration (unchanged)
    // =========================================================================

    seasonConfig: [
        { seasonName: 'Spring', possibleWeather: ['sunny', 'cloudy', 'rainy'] },
        { seasonName: 'Summer', possibleWeather: ['sunny', 'cloudy', 'sunny', 'windy'] },
        { seasonName: 'Fall', possibleWeather: ['cloudy', 'rainy', 'windy', 'foggy'] },
        { seasonName: 'Winter', possibleWeather: ['cloudy', 'snowy', 'foggy', 'rainy'] }
    ],

    weatherEffects: {
        'sunny': { goldMultiplier: 1.1, skillMultiplier: 1.05, lifeQualityBonus: 2 },
        'cloudy': { goldMultiplier: 1.0, skillMultiplier: 1.0, lifeQualityBonus: 0 },
        'rainy': { goldMultiplier: 0.9, skillMultiplier: 0.95, lifeQualityBonus: -3 },
        'stormy': { goldMultiplier: 0.8, skillMultiplier: 0.9, lifeQualityBonus: -5 },
        'snowy': { goldMultiplier: 0.85, skillMultiplier: 0.92, lifeQualityBonus: -4 },
        'foggy': { goldMultiplier: 0.95, skillMultiplier: 0.98, lifeQualityBonus: -2 },
        'windy': { goldMultiplier: 1.02, skillMultiplier: 1.01, lifeQualityBonus: 1 }
    },

    // =========================================================================
    // 9. Relationship System Configuration (unchanged for now)
    // =========================================================================

    relationshipNames: [
        "Alice", "Bob", "Charlie", "David", "Eve", "Fiona", "George", "Hannah", "Ivy", "Jack"
    ],
    relationshipTypes: [
        "Friend", "Colleague", "Mentor", "Acquaintance", "Rival"
    ],
    relationshipTraits: [
        "Helpful", "Demanding", "Supportive", "Critical", "Enthusiastic", "Reserved", "Creative", "Practical"
    ],

    // =========================================================================
    // 10. Pet System Configuration (unchanged for now)
    // =========================================================================

    petTypes: [
        {
            type: 'dog',
            name: 'Dog',
            description: 'Loyal companion that increases happiness and occasionally finds gold.',
            adoptionFee: 500,
            bonusDescription: 'Occasionally finds gold.',
            iconClass: 'fas fa-dog'
        }
    ],

    // =========================================================================
    // 11. Initial Multipliers (unchanged)
    // =========================================================================

    multipliers: {
        gold: 1,
        skill: 1
    },
};