// config.js
const CONFIG = {
    // =========================================================================
    // 1. Game Settings
    // =========================================================================

    settings: {
        tickInterval: 200,
        ticksInOneGameDay: 5,
        ticksInOneGameYear: 5 * 365,
        maxAge: 65,
        startingGold: 0,
        eventChance: 0.2,
        achievementCheckInterval: 365,
        speedMultipliers: [1, 2, 4],
        maxEventLogEntries: 5,
        seasonDuration: 100,
    },

    // =========================================================================
    // 2. Base URL Configuration
    // =========================================================================

    baseUrl: "/",

    // =========================================================================
    // 3. Skill Configuration - SIMPLIFIED to ONE
    // =========================================================================

    skillConfig: {
        "Map Awareness": {
            description: "Your ability to navigate and identify locations.",
            maxLevel: 100,
            icon: "fa-map-location-dot"
        }
    },

    // =========================================================================
    // 4. Shop Items Configuration - SIMPLIFIED to ONE
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
    // 5. UI Text Configuration
    // =========================================================================

    uiText: {
        gameTitle: "BitLife-Inspired Game",
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
    // 6. Core Balancing Numbers
    // =========================================================================

    balancing: {
        baseLifeQualityDecay: 0.1,
        unemployedLifeQualityDecay: 0.2,
        workingLifeQualityIncrease: 0.05
    },

    // =========================================================================
    // 7. Job Configuration - SIMPLIFIED to ONE
    // =========================================================================

    geoguesserCareerPath: [
        {
            title: "Google Maps User",
            minSkill: 0,
            incomePerYear: 2,
            skillGainPerYear: {
                "Map Awareness": 0.5
            }
        }
    ],

    // =========================================================================
    // 8. Weather and Seasons Configuration (from weather.js)
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
    // 9. Relationship System Configuration (from relationships.js)
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
    // 10. Pet System Configuration (from pet.js)
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
    // 11. Initial Multipliers (from enhanced-script.js)
    // =========================================================================

    multipliers: {
        gold: 1,
        skill: 1
    },
};