// game-state.js
const gameState = {
    // Player resources
    gold: 0,
    energy: 100,
    maxEnergy: 100,

    // Skills and attributes
    skills: {
        coding: { level: 0, experience: 0, multiplier: 1 },
        design: { level: 0, experience: 0, multiplier: 1 },
        marketing: { level: 0, experience: 0, multiplier: 1 },
        management: { level: 0, experience: 0, multiplier: 1 }
    },

    // Progression trackers
    day: 1,
    prestigePoints: 0,
    prestigeLevel: 0,
    lifeQualityScore: 0,

    // Unlocks and achievements (initially empty)
    achievements: {},
    unlockedFeatures: {},

    // Game settings
    settings: {
        autoSaveInterval: 60, // seconds
        soundEnabled: true,
        musicEnabled: true,
        notificationsEnabled: true,
        volume: 0.5
    },

    // Statistics for tracking
    statistics: {
        totalGoldEarned: 0,
        actionsPerformed: 0,
        timePlayedSeconds: 0,
        prestigeCount: 0
    }
};
function getDefaultGameState() {
    return {
        // Player resources (reset to default)
        gold: 0,
        energy: 100,
        maxEnergy: 100,

        // Skills and attributes (reset to default levels and experience, keep multipliers - prestige bonus)
        skills: {
            coding: { level: 0, experience: 0, multiplier: gameState.skills.coding.multiplier }, // Keep multiplier
            design: { level: 0, experience: 0, multiplier: gameState.skills.design.multiplier }, // Keep multiplier
            marketing: { level: 0, experience: 0, multiplier: gameState.skills.marketing.multiplier }, // Keep multiplier
            management: { level: 0, experience: 0, multiplier: gameState.skills.management.multiplier } // Keep multiplier
        },

        // Progression trackers (reset)
        day: 1,
        lifeQualityScore: 0,
        unlockedFeatures: {}, // Reset feature unlocks if needed

        // Achievements and prestige level/points/stats are kept
        achievements: gameState.achievements, // Keep achievements
        prestigePoints: gameState.prestigePoints, // Keep prestige points
        prestigeLevel: gameState.prestigeLevel, // Keep prestige level
        statistics: gameState.statistics, // Keep statistics
        settings: gameState.settings, // Keep settings

        // Settings (keep settings) - already handled by prestigeKeepData, but explicitly include for clarity
        // settings: gameState.settings, // Already kept via prestigeKeepData

        // Statistics (keep statistics) - already handled by prestigeKeepData, but explicitly include for clarity
        // statistics: gameState.statistics // Already kept via prestigeKeepData
    };
}