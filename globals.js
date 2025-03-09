// globals.js
// This file initializes global variables before any modules load

console.log("globals.js - Initializing global variables");

// Initialize gameState object globally
window.gameState = {
    settings: {
        tickRate: 1000,
        autoSaveInterval: 30
    },
    lastTickTime: 0,
    ticksSinceDayStart: 0,
    gameSpeed: 1,
    prestigeLevel: 0,
    gold: 0,
    age: 18,
    day: 1,
    lifeQuality: 50,
    energy: 100,
    maxEnergy: 100,
    energyRechargeRate: 0.1,
    currentJobTier: 0,
    activeJob: null,
    jobs: [],
    jobLevels: {},
    skills: {
        "Map Awareness": 1,
    },
    skillProgress: {
        "Map Awareness": 0,
    },
    achievements: [],
    unlockedAchievements: [],
    timePlayedSeconds: 0,
    statistics: {
        timePlayedSeconds: 0
    },
    relationships: [],
    pet: null,
    inventory: [],
    purchasedItems: {},
    eventLog: [],
    gameActive: true,
    gamePaused: false,
    seasonTimeLeft: 150,
    currentSeason: "Spring",
    seasonNumber: 0,
    year: 1,
    timeUnits: {
        total: 24,
        allocated: {
            job: 0,
            skills: 0,
            leisure: 0,
        }
    },
    income: {
        job: 0,
        total: 0,
    },
    gameStats: {
        totalGoldEarned: 0,
    },
    isPaused: false,
};

console.log("globals.js - Global variables initialized");
