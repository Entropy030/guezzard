// game-state.js
console.log("game-state.js - Module loading");

// Default game state - Initial values for a new game
export function getDefaultGameState() {
    return {
        // Game settings
        settings: {
            tickRate: 1000,
            autoSaveInterval: 30,
            soundEnabled: true
        },
        
        // System values
        lastTickTime: 0,
        ticksSinceDayStart: 0,
        gameSpeed: 1,
        gameActive: true,
        gamePaused: false,
        isPaused: false,
        
        // Time tracking
        day: 1,
        seasonTimeLeft: 150,
        currentSeason: "Spring",
        seasonNumber: 0,
        year: 1,
        timePlayedSeconds: 0,
        
        // Player stats
        prestigeLevel: 0,
        prestigePoints: 0,
        gold: 0,
        age: 18,
        lifeQuality: 50,
        energy: 100,
        maxEnergy: 100,
        energyRechargeRate: 0.1,
        
        // Career & skills
        currentJobTier: 0,
        activeJob: null,
        jobs: [],
        jobLevels: {},
        jobProgress: 0,
        skills: {
            "Map Awareness": 1,
        },
        skillProgress: {
            "Map Awareness": 0,
        },
        currentTrainingSkill: null,
        
        // Progress tracking
        achievements: [],
        unlockedAchievements: [],
        eventLog: [],
        statistics: {
            timePlayedSeconds: 0,
            totalGoldEarned: 0,
            jobsHeld: 0,
            prestigeCount: 0
        },
        
        // Inventory & items
        relationships: [],
        pet: null,
        inventory: [],
        purchasedItems: {},
        
        // Time allocation
        timeUnits: {
            total: 24,
            allocated: {
                job: 0,
                skills: 0,
                leisure: 0,
            }
        },
        
        // Income tracking
        income: {
            job: 0,
            total: 0,
        },
        
        // Additional statistics
        gameStats: {
            totalGoldEarned: 0,
            // ... other stats ...
        }
    };
}

// Initialize game state (create if not exists)
export function initializeGameState() {
    console.log("initializeGameState() - Creating new game state");
    
    // If gameState is not defined globally, create it
    if (typeof window.gameState === 'undefined') {
        window.gameState = getDefaultGameState();
    }
    
    return window.gameState;
}

// Save game state to localStorage
export function saveGameState() {
    try {
        console.log("saveGameState() - Saving game state to localStorage");
        // Add timestamp to save data
        const saveData = {
            gameState: window.gameState,
            savedAt: new Date().toISOString(),
            version: '1.0.0' // Add version for future compatibility
        };
        
        // Save to localStorage
        localStorage.setItem('guezzardGameSave', JSON.stringify(saveData));
        
        // Log success
        console.log("Game saved successfully!");
        return true;
    } catch (error) {
        console.error("Error saving game:", error);
        return false;
    }
}

// Load game state from localStorage
export function loadGameState() {
    try {
        console.log("loadGameState() - Loading game state from localStorage");
        
        // Get save data from localStorage
        const saveData = localStorage.getItem('guezzardGameSave');
        
        // If no save data exists, return null
        if (!saveData) {
            console.log("No saved game found");
            return null;
        }
        
        // Parse saved data
        const parsedData = JSON.parse(saveData);
        
        // Basic validation - check if the structure makes sense
        if (!parsedData.gameState || typeof parsedData.gameState !== 'object') {
            console.warn("Invalid save data format");
            return null;
        }
        
        // Log successful load
        console.log("Game loaded successfully from save dated:", parsedData.savedAt);
        
        // Return the saved game state
        return parsedData.gameState;
    } catch (error) {
        console.error("Error loading game:", error);
        return null;
    }
}

// Reset game state to defaults
export function resetGameState() {
    console.log("resetGameState() - Resetting game to defaults");
    window.gameState = getDefaultGameState();
    return window.gameState;
}

// Update game state with partial data (useful for loading)
export function updateGameState(partialState) {
    console.log("updateGameState() - Updating game state with partial data");
    
    // Deep merge the partial state into the current state
    const mergeObjects = (target, source) => {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                mergeObjects(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    };
    
    mergeObjects(window.gameState, partialState);
    return window.gameState;
}

// Get game state (safe copy to prevent accidental mutation)
export function getGameState() {
    return JSON.parse(JSON.stringify(window.gameState));
}

// Set specific property in game state
export function setGameStateProperty(path, value) {
    console.log(`setGameStateProperty() - Setting ${path} to:`, value);
    
    // Split path into parts (e.g., "skills.Map Awareness.level" -> ["skills", "Map Awareness", "level"])
    const parts = path.split('.');
    let current = window.gameState;
    
    // Navigate to the property
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
            current[part] = {};
        }
        current = current[part];
    }
    
    // Set the value
    current[parts[parts.length - 1]] = value;
    return value;
}

// Auto-save system
let autoSaveInterval = null;

export function startAutoSave(intervalSeconds = 30) {
    console.log(`startAutoSave() - Setting up auto-save every ${intervalSeconds} seconds`);
    
    // Clear any existing interval
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    // Set up new interval
    autoSaveInterval = setInterval(() => {
        saveGameState();
        console.log("Auto-save completed");
    }, intervalSeconds * 1000);
}

export function stopAutoSave() {
    console.log("stopAutoSave() - Stopping auto-save system");
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// Initialize game state and make functions available globally
initializeGameState();

// Make all functions available globally for non-module scripts
window.getDefaultGameState = getDefaultGameState;
window.initializeGameState = initializeGameState;
window.saveGameState = saveGameState;
window.loadGameState = loadGameState;
window.resetGameState = resetGameState;
window.updateGameState = updateGameState;
window.getGameState = getGameState;
window.setGameStateProperty = setGameStateProperty;
window.startAutoSave = startAutoSave;
window.stopAutoSave = stopAutoSave;

console.log("game-state.js - Module loaded successfully");