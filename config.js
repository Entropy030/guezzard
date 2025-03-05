// config.js
const CONFIG = {
    // =========================================================================
    // 1. Game Settings
    // =========================================================================

    settings: {
        tickInterval: 200,         // 0.2 seconds per tick (Real life)
        ticksInOneGameDay: 5,       // Number of ticks in one in-game day
        ticksInOneGameYear: 5 * 365,  // Number of ticks in one in-game year
        maxAge: 65,                 // Age at which the game ends
        startingGold: 0,              // Starting gold amount
        eventChance: 0.2,             // 20% chance of event per year
        achievementCheckInterval: 365, // Check achievements every year (in game days)
        speedMultipliers: [1, 2, 4],     // Available game speeds
        maxEventLogEntries: 5,          // Number of events to show in log
        seasonDuration: 100,         // Example: 100 ticks per season (from weather.js)
    },

    // =========================================================================
    // 2. Base URL Configuration
    // =========================================================================

    baseUrl: "/", // Explicitly set baseUrl to root path

    // =========================================================================
    // 3. Skill Configuration
    // =========================================================================

    skillConfig: {
        "Map Awareness": {
            description: "Your ability to navigate and identify locations.",
            maxLevel: 100,
            icon: "fa-map-location-dot"
        },
        "Navigation": {
            description: "Your ability to find your way in various environments.",
            maxLevel: 100,
            icon: "fa-compass"
        },
        "Communication": {
            description: "Your ability to effectively communicate with others.",
            maxLevel: 100,
            icon: "fa-comment"
        },
        "Technical Drawing": {
            description: "Your ability to create technical diagrams and plans.",
            maxLevel: 100,
            icon: "fa-drafting-compass"
        },
        "Data Analysis": {
            description: "Your ability to analyze and interpret data.",
            maxLevel: 100,
            icon: "fa-chart-bar"
        },
        "Programming": {
            description: "Your ability to write and understand code.",
            maxLevel: 100,
            icon: "fa-code"
        }
    },

    // =========================================================================
    // 4. Shop Items Configuration
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
        },
        {
            id: "goldBooster",
            name: "Gold Multiplier",
            description: "Increase all gold earnings by 10%.",
            price: 300,
            effect: "goldMultiplier:0.1",
            maxPurchases: 5,
            icon: "fa-coins"
        },
        {
            id: "skillBooster",
            name: "Skill Boost",
            description: "Improve all skill gain rates by 20%.",
            price: 400,
            effect: "skillMultiplier:0.2",
            maxPurchases: 3,
            icon: "fa-bolt"
        },
        {
            id: "education",
            name: "Education Investment",
            description: "Gain +10 levels in Education skill.",
            price: 200,
            effect: "Education:10",
            maxPurchases: 10,
            icon: "fa-graduation-cap",
            requiresSkill: "Education"
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
        baseLifeQualityDecay: 0.1,           // Yearly decay
        unemployedLifeQualityDecay: 0.2,    // Yearly decay
        workingLifeQualityIncrease: 0.05     // Yearly increase
    },

    // =========================================================================
    // 7. Job Configuration
    // =========================================================================

    geoguesserCareerPath: [ // From enhanced-script.js
        {
            title: "Google Maps User",
            minSkill: 0,
            incomePerYear: 2,
            skillGainPerYear: {
                "Map Awareness": 0.5
            }
        },
        {
            title: "Geoguesser Noob",
            minSkill: 5,
            incomePerYear: 5,
            skillGainPerYear: {
                "Map Awareness": 2
            }
        },
        {
            title: "Geoguesser Enthusiast",
            minSkill: 15,
            incomePerYear: 10,
            skillGainPerYear: {
                "Map Awareness": 10
            }
        },
        {
            title: "Geoguesser Champion",
            minSkill: 50,
            incomePerYear: 300,
            skillGainPerYear: {
                "Map Awareness": 50
            }
        }
    ],

    // =========================================================================
    // 8. Weather and Seasons Configuration (from weather.js)
    // =========================================================================

    seasonConfig: [ // From weather.js
        { seasonName: 'Spring', possibleWeather: ['sunny', 'cloudy', 'rainy'] },
        { seasonName: 'Summer', possibleWeather: ['sunny', 'cloudy', 'sunny', 'windy'] },
        { seasonName: 'Fall', possibleWeather: ['cloudy', 'rainy', 'windy', 'foggy'] },
        { seasonName: 'Winter', possibleWeather: ['cloudy', 'snowy', 'foggy', 'rainy'] }
    ],

    weatherEffects: { // From weather.js
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

    relationshipNames: [ // From relationships.js
        "Alice", "Bob", "Charlie", "David", "Eve", "Fiona", "George", "Hannah", "Ivy", "Jack"
    ],

    relationshipTypes: [ // From relationships.js
        "Friend", "Colleague", "Mentor", "Acquaintance", "Rival"
    ],

    relationshipTraits: [ // From relationships.js
        "Helpful", "Demanding", "Supportive", "Critical", "Enthusiastic", "Reserved", "Creative", "Practical"
    ],

    // =========================================================================
    // 10. Pet System Configuration (from pet.js)
    // =========================================================================

    petTypes: [ // From pet.js
        {
            type: 'dog',
            name: 'Dog',
            description: 'Loyal companion that increases happiness and occasionally finds gold.',
            adoptionFee: 500,
            bonusDescription: 'Occasionally finds gold.',
            iconClass: 'fas fa-dog' // Icon class for display
        },
        {
            type: 'cat',
            name: 'Cat',
            description: 'Independent pet that reduces stress and occasionally helps with skill training.',
            adoptionFee: 400,
            bonusDescription: 'Occasionally helps with skill training.',
            iconClass: 'fas fa-cat'
        },
        {
            type: 'bird',
            name: 'Bird',
            description: 'Cheerful pet that occasionally brings small gifts and improves creativity.',
            adoptionFee: 300,
            bonusDescription: 'Occasionally brings small gifts and improves creativity.',
            iconClass: 'fas fa-crow'
        }
    ],

    // =========================================================================
    // 11. Initial Multipliers (from enhanced-script.js)
    // =========================================================================

    multipliers: { // From enhanced-script.js (initial definition)
        gold: 1,
        skill: 1
    },
};