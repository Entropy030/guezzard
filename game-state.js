// game-state.js
let gameState = {
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
    seasonTimeLeft: 150, // Initialize seasonTimeLeft, correctly this time!
    currentSeason: "Spring", // Initialize currentSeason.  CRITICAL.
    seasonNumber: 0,         // Initialize seasonNumber. CRITICAL.
    year: 1,                // Initialize year
     timeUnits: {            // Initialize timeUnits
        total: 24,
        allocated: {
            job: 0,
            skills: 0,
            leisure: 0,
        }
    },
    income:{
      job: 0,
      total: 0,
    },
        gameStats: { // Initialize game statistics
        totalGoldEarned: 0,
        // ... other stats ...
    },
    isPaused: false,
};