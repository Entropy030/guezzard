// game-state.js
let gameState = {
    settings: { // Encapsulate settings
        tickRate: 1000, // Milliseconds per game tick (e.g., 1000ms = 1 second)
        autoSaveInterval: 30 // Seconds between auto-saves
    },
    lastTickTime: 0,
    gameSpeed: 1, // 1x speed, can be increased for faster game
    prestigeLevel: 0,  // <-- INITIALIZE gameState.prestigeLevel to 0 - ADDED THIS LINE

    gold: 0,
    age: 18, // Starting age
    day: 1,   // <--  INITIALIZE gameState.day to 1 (or your desired starting day) - **FIXED!**
    lifeQuality: 50, // Starting life quality

    energy: 100,
    maxEnergy: 100,
    energyRechargeRate: 0.1, // Energy recharged per tick

    currentJobTier: 0,
    activeJob: null,
    jobs: [], // Array to hold job data
    jobLevels: {},

    skills: { // Changed skills to an object for easier access and 확장성
        "Map Awareness": 1, // Initial skill level
        "Programming": 0,
        "Endurance": 0,
        "Charm": 0,
        "Creativity": 0,
        "Logic": 0
    },
    skillProgress: { // To track progress towards next level, if needed
        "Map Awareness": 0,
        "Programming": 0,
        "Endurance": 0,
        "Charm": 0,
        "Creativity": 0,
        "Logic": 0
    },

    achievements: [], // Array to hold achievement definitions
    unlockedAchievements: [], // Array to hold IDs of unlocked achievements
    timePlayedSeconds: 0, // Initialize timePlayedSeconds to 0
    statistics: {      // Initialize gameState.statistics as an OBJECT
        timePlayedSeconds: 0 // Now initialize timePlayedSeconds INSIDE statistics
    },

    relationships: [],
    pet: null,
    inventory: [],
    purchasedItems: {}, // Shop items purchased, using IDs as keys, e.g., { lifeExtension: 1, goldBooster: 2 }

    eventLog: [],
    gameActive: true, // Flag to control game loop
    gamePaused: false // Flag to track pause state
};