// core.js - Consolidated Core System
// This file combines functionality from:
// - core/core.js
// - initialization.js
// - system-integration.js

console.log("core.js - Loading consolidated core system");

// -------------------------------------------------------------------------
// Game State Functions
// -------------------------------------------------------------------------

/**
 * Default game state - Initial values for a new game
 */
function getDefaultGameState() {
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
            "map_awareness": 1
        },
        skillProgress: {
            "map_awareness": 0
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
        
        // Income tracking
        income: {
            job: 0,
            total: 0,
        },
        
        // Additional statistics
        gameStats: {
            totalGoldEarned: 0
        }
    };
}

/**
 * Initialize game state (create if not exists)
 */
function initializeGameState() {
    console.log("initializeGameState() - Creating or loading game state");
    
    // If gameState is not defined globally, create it
    if (typeof window.gameState === 'undefined') {
        window.gameState = getDefaultGameState();
    }
    
    return window.gameState;
}

/**
 * Save game state to localStorage
 */
function saveGameState() {
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

/**
 * Load game state from localStorage
 */
function loadGameState() {
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

/**
 * Reset game state to defaults
 */
function resetGameState() {
    console.log("resetGameState() - Resetting game to defaults");
    window.gameState = getDefaultGameState();
    return window.gameState;
}

// Auto-save system
let autoSaveInterval = null;

/**
 * Start auto-save system
 */
function startAutoSave(intervalSeconds = 30) {
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

/**
 * Stop auto-save system
 */
function stopAutoSave() {
    console.log("stopAutoSave() - Stopping auto-save system");
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// -------------------------------------------------------------------------
// Game Initialization Functions
// -------------------------------------------------------------------------

/**
 * Main game initialization function
 * This orchestrates the entire initialization process
 */
async function initializeGame() {
    console.log("initializeGame() - Starting game initialization");

    try {
        // Step 1: Initialize game state
        initializeGameState();
        console.log("Game state initialized");

        // Step 2: Load saved game if exists
        try {
            const savedGame = loadGameState();
            if (savedGame) {
                // Found a saved game, apply it
                Object.assign(window.gameState, savedGame);
                console.log("Saved game loaded successfully");
            }
        } catch (error) {
            console.error("Error loading saved game:", error);
        }

        // Step 3: Load game data
        await loadGameData();
        console.log("Game data loaded");

        // Step 4: Initialize UI system
        initializeUI();
        console.log("UI system initialized");

        // Step 5: Initialize game systems
        initializeGameSystems();
        console.log("Game systems initialized");

        // Step 6: Start game loop
        startGameLoop();
        console.log("Game loop started");

        // Step 7: Initial UI update
        if (typeof window.updateAllDisplays === 'function') {
            window.updateAllDisplays();
        }

        // Step 8: Start auto-save
        startAutoSave(30); // Auto-save every 30 seconds

        // Welcome message
        if (typeof window.logEvent === 'function') {
            window.logEvent("Welcome to Guezzard! Start your career journey now.", 'system');
        }
        
        console.log("Game initialization completed successfully");
    } catch (error) {
        console.error("Error during game initialization:", error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification("Failed to initialize game. Please try refreshing the page.");
        }
    }
}

/**
 * Load game data from JSON files
 */
async function loadGameData() {
    console.log("loadGameData() - Loading game data");
    
    try {
        // Create an array of promises for each fetch
        const promises = [
            fetch("skills.json").then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load skills.json: ${response.status} ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error("Error loading skills:", error);
                return []; // Default empty array on error
            }),
            
            fetch("jobs.json").then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load jobs.json: ${response.status} ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error("Error loading jobs:", error);
                return []; // Default empty array on error
            }),
            
            fetch("achievements.json").then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load achievements.json: ${response.status} ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error("Error loading achievements:", error);
                return []; // Default empty array on error
            }),
            
            fetch("events.json").then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load events.json: ${response.status} ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error("Error loading events:", error);
                return []; // Default empty array on error
            })
        ];

        // Wait for all promises to resolve
        const [loadedSkills, loadedJobs, loadedAchievements, loadedEvents] = await Promise.all(promises);

        console.log("Skills data loaded:", loadedSkills.length || 0, "categories");
        console.log("Jobs data loaded:", loadedJobs.length || 0, "jobs");
        console.log("Achievements data loaded:", loadedAchievements.length || 0, "achievements");
        console.log("Events data loaded:", loadedEvents.length || 0, "events");

        // Process skills data
        processSkillsData(loadedSkills);
        
        // Store jobs data
        window.gameState.jobs = loadedJobs;
        
        // Store achievements data
        window.gameState.achievements = loadedAchievements;
        
        // Store events data
        window.gameState.events = loadedEvents;
        
        console.log("All game data loaded successfully");
        return true;
    } catch (error) {
        console.error("Error loading game data:", error);
        console.log("Using fallback default data");
        
        // Set up fallback data
        setupDefaultData();
        return false;
    }
}

/**
 * Process skills data from loaded JSON
 */
function processSkillsData(skillsData) {
    // Check if we have the expected format (categories with items)
    if (Array.isArray(skillsData) && skillsData.length > 0 && skillsData[0].items) {
        // Process skill categories
        processSkillCategories(skillsData);
    } else {
        // Handle simple array of skills
        processSimpleSkillsList(skillsData);
    }
    
    // Ensure Map Awareness skill exists (core skill for the game)
    if (!window.gameState.skills["map_awareness"]) {
        window.gameState.skills["map_awareness"] = {
            id: "map_awareness",
            name: "Map Awareness",
            description: "Ability to read and understand maps",
            level: 1,
            xp: 0,
            maxLevel: 100
        };
    }
}

/**
 * Process skill categories and their items
 */
function processSkillCategories(categories) {
    // Initialize skills object
    if (!window.gameState.skills) {
        window.gameState.skills = {};
    }
    
    // Initialize skill categories
    if (!window.gameState.skillCategories) {
        window.gameState.skillCategories = {};
    }
    
    // Process each category
    categories.forEach(category => {
        // Skip attributes category for special handling
        if (category.id === 'attributes') {
            processAttributes(category);
            return;
        }
        
        // Store category data
        window.gameState.skillCategories[category.id] = {
            id: category.id,
            name: category.name,
            description: category.description,
            primaryAttribute: category.primaryAttribute,
            secondaryAttribute: category.secondaryAttribute
        };
        
        // Process skills in this category
        if (Array.isArray(category.items)) {
            category.items.forEach(skill => {
                if (skill && skill.id) {
                    // Check if skill already exists to preserve progress
                    if (window.gameState.skills[skill.id]) {
                        // Update metadata but preserve level/xp
                        const existingSkill = window.gameState.skills[skill.id];
                        const level = existingSkill.level || existingSkill.baseValue || 0;
                        const xp = existingSkill.xp || 0;
                        
                        window.gameState.skills[skill.id] = {
                            id: skill.id,
                            name: skill.name || skill.id,
                            description: skill.description || '',
                            categoryId: category.id,
                            level: level,
                            xp: xp,
                            maxLevel: skill.maxLevel || 100,
                            baseValue: skill.baseValue || 0,
                            growthRate: skill.growthRate || 1.0,
                            decayRate: skill.decayRate || 0.1,
                            synergies: skill.synergies || []
                        };
                    } else {
                        // Create new skill
                        window.gameState.skills[skill.id] = {
                            id: skill.id,
                            name: skill.name || skill.id,
                            description: skill.description || '',
                            categoryId: category.id,
                            level: skill.level || skill.baseValue || 0,
                            xp: 0,
                            maxLevel: skill.maxLevel || 100,
                            baseValue: skill.baseValue || 0,
                            growthRate: skill.growthRate || 1.0,
                            decayRate: skill.decayRate || 0.1,
                            synergies: skill.synergies || []
                        };
                    }
                }
            });
        }
    });
}

/**
 * Process attributes from the skills data
 */
function processAttributes(attributesCategory) {
    // Initialize attributes object
    if (!window.gameState.attributes) {
        window.gameState.attributes = {};
    }
    
    // Process each attribute
    attributesCategory.items.forEach(attribute => {
        if (attribute && attribute.id) {
            // Check if attribute already exists
            if (window.gameState.attributes[attribute.id]) {
                // Preserve value but update metadata
                const currentValue = window.gameState.attributes[attribute.id].value;
                
                window.gameState.attributes[attribute.id] = {
                    id: attribute.id,
                    name: attribute.name || attribute.id,
                    description: attribute.description || '',
                    icon: attribute.icon || '',
                    value: currentValue || attribute.baseValue || 5,
                    modifiers: attribute.modifiers || []
                };
            } else {
                // Create new attribute
                window.gameState.attributes[attribute.id] = {
                    id: attribute.id,
                    name: attribute.name || attribute.id,
                    description: attribute.description || '',
                    icon: attribute.icon || '',
                    value: attribute.baseValue || 5,
                    modifiers: attribute.modifiers || []
                };
            }
        }
    });
}

/**
 * Process simple list of skills (fallback)
 */
function processSimpleSkillsList(skills) {
    // Initialize skills object
    if (!window.gameState.skills) {
        window.gameState.skills = {};
    }
    
    // Process each skill
    if (Array.isArray(skills)) {
        skills.forEach(skill => {
            if (skill && skill.name) {
                window.gameState.skills[skill.name] = {
                    name: skill.name,
                    description: skill.description || '',
                    level: skill.level || 0,
                    xp: 0
                };
            }
        });
    }
}

/**
 * Setup default data if loading fails
 */
function setupDefaultData() {
    // Set up default skills
    window.gameState.skills = {
        "map_awareness": {
            id: "map_awareness",
            name: "Map Awareness",
            description: "Ability to read and understand maps",
            level: 1,
            xp: 0
        }
    };
    
    // Set up default jobs from CONFIG
    window.gameState.jobs = CONFIG.geoguesserCareerPath || [];
    
    // Set up empty achievements array
    window.gameState.achievements = [];
    
    // Set up empty events array
    window.gameState.events = [];
}

/**
 * Initialize UI system
 */
function initializeUI() {
    if (typeof window.initializeUISystem === 'function') {
        window.initializeUISystem();
    } else {
        // Fallback to separate UI initialization functions
        if (typeof window.setupEventLog === 'function') {
            window.setupEventLog();
        }
        
        if (typeof window.setupGameControls === 'function') {
            window.setupGameControls();
        }
        
        if (typeof window.setupJobsUI === 'function') {
            window.setupJobsUI();
        }
    }
}

/**
 * Initialize all game systems
 */
function initializeGameSystems() {
    // Initialize job system if available
    if (typeof window.initializeJobSystem === 'function') {
        window.initializeJobSystem();
    }

    // Initialize skill system if available
    if (typeof window.initializeSkillSystem === 'function') {
        window.initializeSkillSystem();
    }

    // Initialize prestige system if available
    if (typeof window.initPrestigeSystem === 'function') {
        window.initPrestigeSystem();
    }
}

// -------------------------------------------------------------------------
// Game Loop Functions
// -------------------------------------------------------------------------

// Variables for game loop timing
let lastTimestamp = 0;

/**
 * Main game loop function
 */
function gameLoop(timestamp) {
    if (gameState.gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // Initialize lastTimestamp if it's the first call
    if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
    }

    const effectiveTickRate = 1000 / (CONFIG.settings.tickInterval * gameState.gameSpeed);
    const deltaTime = timestamp - lastTimestamp;

    if (deltaTime >= effectiveTickRate) {
        lastTimestamp = timestamp;  // Update lastTimestamp ONLY when a tick occurs

        // Regenerate energy
        regenerateEnergy();

        // Handle time progression
        progressTime();
        
        // Process job progress (if player has a job)
        if (typeof window.processJobProgress === 'function' && gameState.activeJob) {
            window.processJobProgress(deltaTime);
        }

        // Update UI
        if (typeof window.updateAllDisplays === 'function') {
            window.updateAllDisplays();
        }
        
        // Check for achievements
        if (typeof window.checkAchievements === 'function') {
            window.checkAchievements();
        }
        
        // Process random events (if enabled)
        if (typeof window.processRandomEvents === 'function') {
            window.processRandomEvents();
        }
    }

    requestAnimationFrame(gameLoop);
}

/**
 * Function to start the game loop
 */
function startGameLoop() {
    console.log("startGameLoop() - Starting game loop");
    lastTimestamp = 0; // Reset lastTimestamp
    requestAnimationFrame(gameLoop);
}

/**
 * Energy regeneration function
 */
function regenerateEnergy() {
    const energyRegenBase = 1;
    const prestigeBonus = gameState.prestigeLevel * 0.2;
    const regenRate = energyRegenBase + prestigeBonus;

    let newEnergy = gameState.energy + regenRate;
    gameState.energy = Math.min(gameState.maxEnergy, newEnergy);
}

/**
 * Progress game time (days, seasons, years)
 */
function progressTime() {
    // Skip if game is paused
    if (gameState.gamePaused) {
        return;
    }

    gameState.ticksSinceDayStart++; // Increment at the beginning

    // Check if a new day has started
    if (gameState.ticksSinceDayStart >= CONFIG.settings.ticksInOneGameDay) {
        gameState.day++;
        gameState.ticksSinceDayStart = 0; // Reset at the START of the new day
    }

    // Calculate season length in days
    const seasonLengthInDays = CONFIG.settings.seasonDuration / CONFIG.settings.ticksInOneGameDay;

    // Check if a new season should start
    if (gameState.day > seasonLengthInDays) {
        // Reset day counter
        gameState.day = 1;
        gameState.seasonNumber++;

        // Update season
        const seasons = ["Spring", "Summer", "Autumn", "Winter"];
        gameState.currentSeason = seasons[(gameState.seasonNumber) % seasons.length];

        // Check if it's the start of a new year (Spring)
        if (gameState.currentSeason === "Spring") {
            gameState.year++; // New year starts in Spring
            
            // IMPORTANT: Increment age with each new year
            gameState.age++;
            console.log(`Year incremented to ${gameState.year}, Age incremented to ${gameState.age}`);
            
            // Check for retirement
            if (gameState.age >= CONFIG.settings.maxAge) {
                if (typeof window.endGame === 'function') {
                    window.endGame();
                } else {
                    console.error("endGame function not available");
                    gameState.gamePaused = true; // At least pause the game
                }
                return; // Stop after endgame
            }
        }
    }

    // Increment played time and save game periodically
    gameState.timePlayedSeconds++;
    
    // Save only occasionally to improve performance (every 60 seconds of game time)
    if (gameState.timePlayedSeconds % 60 === 0) {
        saveGameState();
    }
}

// -------------------------------------------------------------------------
// Export and Global Registration
// -------------------------------------------------------------------------

// Make all functions available globally for non-module scripts
window.getDefaultGameState = getDefaultGameState;
window.initializeGameState = initializeGameState;
window.saveGameState = saveGameState;
window.loadGameState = loadGameState;
window.resetGameState = resetGameState;
window.startAutoSave = startAutoSave;
window.stopAutoSave = stopAutoSave;
window.initializeGame = initializeGame;
window.loadGameData = loadGameData;
window.gameLoop = gameLoop;
window.startGameLoop = startGameLoop;
window.regenerateEnergy = regenerateEnergy;

console.log("core.js - Consolidated core system loaded successfully");

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeGame);

// Export functions for ES module usage
export {
    getDefaultGameState,
    initializeGameState,
    saveGameState,
    loadGameState,
    resetGameState,
    startAutoSave,
    stopAutoSave,
    initializeGame,
    loadGameData,
    gameLoop,
    startGameLoop
};