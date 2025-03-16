// ============== game-core.js - Main Game Logic ==============
import GameState, { GameEvents } from './game-state.js';
import GameData from './game-data.js';
import UIManager from './ui-manager.js';
import TimeManager from './game-time.js';
import CareerManager from './game-career.js';
import SkillManager from './game-skills.js';
import LifestyleManager from './game-lifestyle.js';
import MortalityManager from './game-mortality.js';

// Global game state instance
let gameState = null;

// ============== Basic Error Handling ==============
window.onerror = function(message, source, lineno, colno, error) {
    console.log(`Error at line ${lineno}, column ${colno}: ${message}`);
    return false; // Let the default handler run as well
};

// ============== Game Initialization Functions ==============

/**
 * Initialize the game
 * Loads saved game or creates a new one
 */
function initializeGame() {
    try {
        console.log("Initializing game...");
        
        // Initialize UI Manager
        UIManager.initialize();
        
        // Try to load a saved game
        const savedGame = GameState.loadGame();
        
        if (savedGame) {
            gameState = savedGame;
            UIManager.showNotification("Game Loaded", "Your saved game has been loaded.");
        } else {
            // Create a new game
            gameState = GameState.createNewState();
            gameState = GameState.initializeSkills(gameState);
        }
        
        // Ensure default lifestyle options are set if missing
        setDefaultLifestyleOptions();
        
        // Initialize managers with the game state
        initializeManagers(gameState);
        
        // Subscribe to game events
        subscribeToGameEvents();
        
        // Update UI with initial state
        GameEvents.publish('gameStateUpdated', { gameState });
        
        // Start the game
        if (!gameState.isPaused) {
            resumeGame();
        }
    } catch (error) {
        console.error("Error initializing game:", error);
        UIManager.showNotification("Error", "Failed to initialize game. Starting a new game.");
        gameState = GameState.createNewState();
        gameState = GameState.initializeSkills(gameState);
        GameEvents.publish('gameStateUpdated', { gameState });
    }
}

/**
 * Initialize game managers with the current game state
 * @param {Object} state - Current game state
 */
function initializeManagers(state) {
    TimeManager.initialize(state);
    CareerManager.initialize(state);
    SkillManager.initialize(state);
    LifestyleManager.initialize(state);
    MortalityManager.initialize(state);
}

/**
 * Set default lifestyle options if missing
 */
function setDefaultLifestyleOptions() {
    // Default housing
    if (!gameState.housingType) {
        for (const id in GameData.lifestyle.housing) {
            if (GameData.lifestyle.housing[id].cost === 0) {
                gameState.housingType = id;
                break;
            }
        }
    }
    
    // Default transport
    if (!gameState.transportType) {
        for (const id in GameData.lifestyle.transport) {
            if (GameData.lifestyle.transport[id].cost === 0) {
                gameState.transportType = id;
                break;
            }
        }
    }
    
    // Default food
    if (!gameState.foodType) {
        for (const id in GameData.lifestyle.food) {
            if (GameData.lifestyle.food[id].cost === 0) {
                gameState.foodType = id;
                break;
            }
        }
    }
}

/**
 * Subscribe to game events from UI
 */
function subscribeToGameEvents() {
    // Pause/resume events
    GameEvents.subscribe('togglePause', togglePause);
    
    // Time allocation events
    GameEvents.subscribe('adjustWorkHours', (data) => TimeManager.adjustWorkHours(data.amount));
    GameEvents.subscribe('adjustTrainingHours', (data) => TimeManager.adjustTrainingHours(data.amount));
    GameEvents.subscribe('setWorkHoursByPercent', (data) => TimeManager.setWorkHoursByPercent(data.percent));
    GameEvents.subscribe('setTrainingHoursByPercent', (data) => TimeManager.setTrainingHoursByPercent(data.percent));
    
    // Career events
    GameEvents.subscribe('applyForJob', (data) => CareerManager.applyForJob(data.jobId));
    
    // Skill events
    GameEvents.subscribe('switchTrainingSkill', (data) => SkillManager.switchTrainingSkill(data.skillId, data.skillType));
    
    // Lifestyle events
    GameEvents.subscribe('purchaseLifestyle', (data) => LifestyleManager.purchaseLifestyleUpgrade(data.type, data.id));
    
    // Reincarnation event
    GameEvents.subscribe('reincarnate', reincarnate);
}

// ============== Game Flow Control Functions ==============

/**
 * Start/pause game
 */
function togglePause() {
    if (gameState.isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

/**
 * Pause the game
 */
function pauseGame() {
    if (gameState.tickInterval) {
        clearInterval(gameState.tickInterval);
        gameState.tickInterval = null;
    }
    
    gameState.isPaused = true;
    GameEvents.publish('gamePaused');
}

/**
 * Resume the game
 */
function resumeGame() {
    if (!gameState.tickInterval && !gameState.isGameOver) {
        // Default to 1 second per day if gameSpeed is not set
        const gameSpeed = gameState.gameSpeed || 1;
        gameState.tickInterval = setInterval(progressDay, gameSpeed * 1000);
    }
    
    gameState.isPaused = false;
    GameEvents.publish('gameResumed');
}

/**
 * Progress one day - Core game loop
 */
function progressDay() {
    if (gameState.isPaused || gameState.isGameOver) {
        return;
    }

    try {
        // Calculate time allocation
        TimeManager.validateTimeAllocation(gameState);
        
        // Process economy (income and expenses)
        processEconomics();
        
        // Process activities (skill training and job experience)
        processActivities();
        
        // Process mortality check
        MortalityManager.processMortalityCheck(gameState);
        
        // Advance calendar
        advanceCalendar();
        
        // Autosave game
        autoSaveGame();
        
        // Update UI
        GameEvents.publish('gameStateUpdated', { gameState });
    } catch (error) {
        console.error("Error progressing day:", error);
        pauseGame();
        UIManager.showNotification("Game Error", "A problem occurred while processing the day. Game paused.");
    }
}

/**
 * Process income and expenses for the day
 */
function processEconomics() {
    // Calculate income and expenses
    const dailyIncome = CareerManager.calculateDailyIncome(gameState);
    const dailyExpenses = LifestyleManager.calculateDailyExpenses(gameState);
    
    // Update kudos
    gameState.kudos += (dailyIncome - dailyExpenses);
    
    // Track total kudos earned for statistics
    gameState.totalKudosEarned = (gameState.totalKudosEarned || 0) + dailyIncome;
    gameState.lifetimeStats.kudosEarned = (gameState.lifetimeStats.kudosEarned || 0) + dailyIncome;
    
    // Publish economy updated event
    GameEvents.publish('economyUpdated', {
        income: dailyIncome,
        expenses: dailyExpenses,
        balance: gameState.kudos
    });
}

/**
 * Process skill training and job experience for the day
 */
function processActivities() {
    // Process skill training
    if (gameState.trainingHours > 0 && gameState.currentTrainingSkill) {
        SkillManager.processSkillTraining(gameState, gameState.currentTrainingSkill, gameState.trainingHours);
    }
    
    // Process job experience
    if (gameState.workHours > 0) {
        CareerManager.processJobExperience(gameState, gameState.workHours);
    }
}

/**
 * Advance the game calendar
 */
function advanceCalendar() {
    // Increment day
    gameState.day++;
    
    // Check for month changes
    if (gameState.day > 30) {
        gameState.day = 1;
        gameState.month++;
        
        // Check for year changes
        if (gameState.month > 12) {
            gameState.month = 1;
            gameState.year++;
            
            // Age increases each year
            gameState.age++;
        }
    }
    
    // Update lifetimeStats
    gameState.lifetimeStats.totalDays = (gameState.lifetimeStats.totalDays || 0) + 1;
}

/**
 * Autosave the game if enabled
 */
function autoSaveGame() {
    if (gameState.autosaveEnabled) {
        GameState.saveGame(gameState);
    }
}

/**
 * Handle player death and reincarnation
 */
function handleDeath() {
    // Pause the game
    pauseGame();
    
    // Set game over flag
    gameState.isGameOver = true;
    
    // Calculate final stats for display
    const deathStats = {
        age: gameState.age,
        maxJobLevel: gameState.maxJobLevelReached || gameState.jobLevel,
        maxSkillLevel: gameState.maxSkillLevelReached || 1,
        mortalityRate: MortalityManager.calculateMortalityRate(gameState),
        kudosEarned: gameState.totalKudosEarned || 0
    };
    
    // Publish death event
    GameEvents.publish('playerDied', deathStats);
}

/**
 * Reincarnate player after death
 */
function reincarnate() {
    try {
        // Reset game state while preserving echoes
        gameState = GameState.resetWithEchoes(gameState);
        
        // Re-initialize managers with new state
        initializeManagers(gameState);
        
        // Update UI
        GameEvents.publish('gameStateUpdated', { gameState });
        
        // Restart the game
        resumeGame();
        
        UIManager.showNotification("Reincarnated!", "You've been reincarnated with your Eternal Echo bonuses.");
    } catch (error) {
        console.error("Error during reincarnation:", error);
        UIManager.showNotification("Error", "Something went wrong during reincarnation.");
    }
}

// Link death handler from MortalityManager
MortalityManager.setDeathHandler(handleDeath);

// Initialize game when document is loaded
window.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded - Starting game initialization");
    initializeGame();
});

// Export any needed functions for testing
export {
    initializeGame,
    pauseGame,
    resumeGame,
    progressDay
};
