// ============== Game.js - Main Game Logic ==============
import GameState from './game-state.js';
import GameData, { TYPES } from './game-data.js';

// Global game state instance
let gameState = null;

// ============== Basic Error Handling ==============
window.onerror = function(message, source, lineno, colno, error) {
    console.log(`Error at line ${lineno}, column ${colno}: ${message}`);
    return false; // Let the default handler run as well
};

// ============== Initialization ==============
/**
 * Initialize the game
 * Loads saved game or creates a new one
 */
function initializeGame() {
    try {
        console.log("Initializing game...");
        
        // Try to load a saved game
        const savedGame = GameState.loadGame();
        
        if (savedGame) {
            gameState = savedGame;
            showNotification("Game Loaded", "Your saved game has been loaded.");
        } else {
            // Create a new game
            gameState = GameState.createNewState();
            gameState = GameState.initializeSkills(gameState);
        }
        
        // Ensure default lifestyle options are set if missing
        setDefaultLifestyleOptions();
        
        // Set up event listeners
        setupEventListeners();
        
        // Update UI with initial state
        updateUI();
        console.log("Initial UI update complete");
        
        // Start the game
        if (!gameState.isPaused) {
            resumeGame();
        }
    } catch (error) {
        console.error("Error initializing game:", error);
        showNotification("Error", "Failed to initialize game. Starting a new game.");
        gameState = GameState.createNewState();
        gameState = GameState.initializeSkills(gameState);
        updateUI();
    }
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
 * Set up event listeners for UI interactions
 */
function setupEventListeners() {
    // Pause/resume button
    const pauseButton = document.getElementById('toggle-pause');
    if (pauseButton) {
        pauseButton.addEventListener('click', togglePause);
    }
    
    // Time allocation controls
    const workDecrease = document.getElementById('work-decrease');
    const workIncrease = document.getElementById('work-increase');
    const trainingDecrease = document.getElementById('training-decrease');
    const trainingIncrease = document.getElementById('training-increase');
    
    if (workDecrease) workDecrease.addEventListener('click', () => adjustWorkHours(-1));
    if (workIncrease) workIncrease.addEventListener('click', () => adjustWorkHours(1));
    if (trainingDecrease) trainingDecrease.addEventListener('click', () => adjustTrainingHours(-1));
    if (trainingIncrease) trainingIncrease.addEventListener('click', () => adjustTrainingHours(1));
    
    // Slider drag functionality
    setupSliders();
    
    // Tab navigation
    setupTabs();
    
    // Reincarnation button
    const reincarnateButton = document.getElementById('reincarnate-button');
    if (reincarnateButton) {
        reincarnateButton.addEventListener('click', reincarnate);
    }
}

/**
 * Set up tab switching functionality
 */
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            console.log(`Tab clicked: ${tab.getAttribute('data-tab')}`);
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab panes
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.add('hidden');
            });
            
            // Show the selected tab pane
            const tabId = tab.getAttribute('data-tab');
            const tabPane = document.getElementById(`${tabId}-tab`);
            if (tabPane) {
                tabPane.classList.remove('hidden');
                console.log(`Tab pane ${tabId}-tab shown`);
            } else {
                console.error(`Tab pane ${tabId}-tab not found`);
            }
        });
    });
}

/**
 * Set up slider drag functionality
 */
function setupSliders() {
    // Work slider
    const workSlider = document.getElementById('work-slider');
    const workHandle = document.getElementById('work-handle');
    
    if (workSlider && workHandle) {
        makeSliderDraggable(workSlider, workHandle, (percent) => {
            const timeInfo = calculateAllocatableHours();
            const newHours = Math.round((percent / 100) * timeInfo.allocatableHours * 2) / 2; // Round to nearest 0.5
            gameState.workHours = Math.max(0, Math.min(newHours, timeInfo.allocatableHours - gameState.trainingHours));
            updateTimeAllocation();
        });
    }
    
    // Training slider
    const trainingSlider = document.getElementById('training-slider');
    const trainingHandle = document.getElementById('training-handle');
    
    if (trainingSlider && trainingHandle) {
        makeSliderDraggable(trainingSlider, trainingHandle, (percent) => {
            const timeInfo = calculateAllocatableHours();
            const newHours = Math.round((percent / 100) * timeInfo.allocatableHours * 2) / 2; // Round to nearest 0.5
            gameState.trainingHours = Math.max(0, Math.min(newHours, timeInfo.allocatableHours - gameState.workHours));
            updateTimeAllocation();
        });
    }
}


// ============== UI Interaction Functions ==============

/**
 * Display a notification to the user
 */
function showNotification(title, message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
        
        const notificationTitle = document.createElement('div');
        notificationTitle.className = 'notification-title';
        notification.appendChild(notificationTitle);
        
        const notificationMessage = document.createElement('div');
        notificationMessage.className = 'notification-message';
        notification.appendChild(notificationMessage);
    }
    
    // Update notification content
    notification.querySelector('.notification-title').textContent = title;
    notification.querySelector('.notification-message').textContent = message;
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Adjust work hours by the specified amount
 */
function adjustWorkHours(amount) {
    const timeInfo = calculateAllocatableHours();
    const newHours = gameState.workHours + amount;
    
    // Ensure we don't go below 0 or exceed allocatable hours
    gameState.workHours = Math.max(0, Math.min(newHours, timeInfo.allocatableHours - gameState.trainingHours));
    
    updateTimeAllocation();
}

/**
 * Adjust training hours by the specified amount
 */
function adjustTrainingHours(amount) {
    const timeInfo = calculateAllocatableHours();
    const newHours = gameState.trainingHours + amount;
    
    // Ensure we don't go below 0 or exceed allocatable hours
    gameState.trainingHours = Math.max(0, Math.min(newHours, timeInfo.allocatableHours - gameState.workHours));
    
    updateTimeAllocation();
}

/**
 * Apply for a new job
 */
function applyForJob(jobId) {
    try {
        // Find which career track this job belongs to
        let careerTrackId = null;
        let jobTier = null;
        
        for (const trackId in GameData.careers) {
            const track = GameData.careers[trackId];
            const foundTier = track.tiers.find(tier => tier.id === jobId);
            
            if (foundTier) {
                careerTrackId = trackId;
                jobTier = foundTier;
                break;
            }
        }
        
        if (!careerTrackId || !jobTier) {
            showNotification("Error", "Job not found. Please try again.");
            return;
        }
        
        // Check requirements
        if (!checkJobRequirements(jobTier)) {
            showNotification("Cannot Apply", "You don't meet the requirements for this job.");
            return;
        }
        
        // Apply for the job
        gameState.currentCareerTrack = careerTrackId;
        gameState.currentJob = jobId;
        gameState.jobLevel = 1;
        gameState.jobExperience = 0;
        
        showNotification("New Job!", `You are now a ${jobTier.name}.`);
        
        // Update UI
        updateUI();
    } catch (error) {
        console.error("Error applying for job:", error);
        showNotification("Error", "Something went wrong while applying for job.");
    }
}

/**
 * Switch to a different skill for training
 */
function switchTrainingSkill(skillId, skillType) {
    gameState.currentTrainingSkill = skillId;
    
    // Get skill name based on type
    let skillName = "";
    if (skillType === 'general') {
        skillName = GameData.skills.general[skillId].name;
    } else if (skillType === 'professional') {
        skillName = GameData.skills.professional[skillId].name;
    }
    
    showNotification("Training Changed", `Now training ${skillName}.`);
    updateUI();
}

/**
 * Purchase a lifestyle upgrade
 */
function purchaseLifestyleUpgrade(category, typeId) {
    try {
        let option = null;
        let currentTypeId = null;
        
        // Get current and new option based on category
        switch (category) {
            case 'housing':
                option = GameData.lifestyle.housing[typeId];
                currentTypeId = gameState.housingType;
                break;
            case 'transport':
                option = GameData.lifestyle.transport[typeId];
                currentTypeId = gameState.transportType;
                break;
            case 'food':
                option = GameData.lifestyle.food[typeId];
                currentTypeId = gameState.foodType;
                break;
            default:
                throw new Error(`Unknown lifestyle category: ${category}`);
        }
        
        if (!option) {
            showNotification("Error", `Invalid ${category} option.`);
            return false;
        }
        
        // Check if already owned
        if (currentTypeId === typeId) {
            showNotification("Already Owned", `You already have this ${category} option.`);
            return false;
        }
        
        // Check if player has enough kudos
        if (gameState.kudos < option.cost) {
            showNotification("Cannot Afford", `You need ${option.cost} kudos to purchase this ${category}.`);
            return false;
        }
        
        // Check other requirements (simplified)
        // ... add requirement checks as needed
        
        // Purchase the upgrade
        gameState.kudos -= option.cost;
        
        // Apply the purchase based on category
        switch (category) {
            case 'housing':
                gameState.housingType = typeId;
                break;
            case 'transport':
                gameState.transportType = typeId;
                break;
            case 'food':
                gameState.foodType = typeId;
                break;
        }
        
        showNotification("Purchased", `You've upgraded your ${category}!`);
        updateUI();
        return true;
    } catch (error) {
        console.error(`Error purchasing ${category}:`, error);
        showNotification("Error", `Something went wrong while purchasing ${category}.`);
        return false;
    }
}

// ============== Game Core Functions ==============


/**
 * Calculate allocatable hours per day
 */
function calculateAllocatableHours() {
    try {
        // Apply lifestyle modifiers to fixed time costs
        const housingOption = GameData.lifestyle.housing[gameState.housingType];
        const transportOption = GameData.lifestyle.transport[gameState.transportType];
        const foodOption = GameData.lifestyle.food[gameState.foodType];
        
        if (!housingOption || !transportOption || !foodOption) {
            throw new Error("Invalid lifestyle options");
        }
        
        const adjustedSleepHours = gameState.sleepHours * (1 - housingOption.sleepTimeReduction);
        const adjustedCommuteHours = gameState.commuteHours * (1 - transportOption.commuteTimeReduction);
        const adjustedMealHours = gameState.mealHours * (1 - foodOption.mealTimeReduction);
        
        const fixedTimeTotal = adjustedSleepHours + adjustedCommuteHours + adjustedMealHours;
        const allocatableHours = 24 - fixedTimeTotal;
        
        return {
            allocatableHours,
            adjustedSleepHours,
            adjustedCommuteHours,
            adjustedMealHours,
            fixedTimeTotal
        };
    } catch (error) {
        console.error("Error calculating allocatable hours:", error);
        // Return fallback values to prevent game crashes
        return {
            allocatableHours: 6,
            adjustedSleepHours: 10,
            adjustedCommuteHours: 4,
            adjustedMealHours: 4,
            fixedTimeTotal: 18
        };
    }
}

/**
 * Calculate daily income based on job
 */
function calculateDailyIncome() {
    try {
        const trackInfo = GameData.careers[gameState.currentCareerTrack];
        const jobTier = trackInfo.tiers.find(tier => tier.id === gameState.currentJob);
        
        if (!jobTier) return 0;
        
        const baseRate = jobTier.baseSalary;
        const levelMultiplier = 1 + (gameState.jobLevel / 100);
        const hourlyRate = baseRate * levelMultiplier;
        
        return hourlyRate * gameState.workHours;
    } catch (error) {
        console.error("Error calculating daily income:", error);
        return 0;
    }
}

/**
 * Calculate daily expenses based on lifestyle
 */
function calculateDailyExpenses() {
    try {
        const housingCost = GameData.lifestyle.housing[gameState.housingType].cost;
        const transportCost = GameData.lifestyle.transport[gameState.transportType].cost;
        const foodCost = GameData.lifestyle.food[gameState.foodType].cost;
        
        return housingCost + transportCost + foodCost;
    } catch (error) {
        console.error("Error calculating daily expenses:", error);
        return 0;
    }
}

/**
 * Start/pause game
 */
function togglePause() {
    if (gameState.isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
    
    updateUI();
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
    const pauseButton = document.getElementById('toggle-pause');
    if (pauseButton) {
        pauseButton.textContent = 'Resume';
    }
}

/**
 * Resume the game
 */
function resumeGame() {
    console.log("Resuming game...");
    if (!gameState.tickInterval && !gameState.isGameOver) {
        // Default to 1 second per day if gameSpeed is not set
        const gameSpeed = gameState.gameSpeed || 1;
        gameState.tickInterval = setInterval(progressDay, gameSpeed * 1000);
        console.log(`Game tick started with interval: ${gameSpeed} seconds`);
    }
    
    gameState.isPaused = false;
    const pauseButton = document.getElementById('toggle-pause');
    if (pauseButton) {
        pauseButton.textContent = 'Pause';
    }
}

// Find the progressDay function in game.js and replace it with this improved version

/**
 * Progress one day - Core game loop
 */
function progressDay() {
    if (gameState.isPaused || gameState.isGameOver) {
        return;
    }

    try {
        console.log(`Processing day ${gameState.day}...`);
        
        // Calculate allocatable time
        const timeInfo = calculateAllocatableHours();
        
        // Check if time allocation is valid
        const totalAllocatedHours = gameState.workHours + gameState.trainingHours;
        if (totalAllocatedHours > timeInfo.allocatableHours) {
            // Automatically adjust work hours to fit
            gameState.workHours = Math.max(0, timeInfo.allocatableHours - gameState.trainingHours);
            
            if (gameState.workHours + gameState.trainingHours > timeInfo.allocatableHours) {
                gameState.trainingHours = Math.max(0, timeInfo.allocatableHours - gameState.workHours);
            }
            
            updateUI();
        }
        
        // Calculate income and expenses
        const dailyIncome = calculateDailyIncome();
        const dailyExpenses = calculateDailyExpenses();
        
        // Update kudos
        gameState.kudos += (dailyIncome - dailyExpenses);
        
        // Process skill training
        if (gameState.trainingHours > 0 && gameState.currentTrainingSkill) {
            processSkillTraining(gameState.currentTrainingSkill, gameState.trainingHours);
        }
        
        // Process job experience
        if (gameState.workHours > 0) {
            processJobExperience(gameState.workHours);
        }
        
        // Process mortality check
        processMortalityCheck();
        
        // Increment day
        gameState.day++;
        
        // Check for month/year changes
        if (gameState.day > 30) {
            gameState.day = 1;
            gameState.month++;
            
            if (gameState.month > 12) {
                gameState.month = 1;
                gameState.year++;
                
                // Age increases each year
                gameState.age++;
            }
        }
        
        // Save game if autosave is enabled
        if (gameState.autosaveEnabled) {
            GameState.saveGame(gameState);
        }
        
        // Update UI
        updateUI();
    } catch (error) {
        console.error("Error progressing day:", error);
        pauseGame();
        showNotification("Game Error", "A problem occurred while processing the day. Game paused.");
    }
}

/**
 * Process skill training for the day
 * @param {string} skillId - The ID of the skill being trained
 * @param {number} trainingHours - Hours spent training
 */
function processSkillTraining(skillId, trainingHours) {
    // Base experience rate per hour
    const BASE_SKILL_EXP_RATE = 5;
    
    // Determine if it's a general or professional skill
    let skillObj = null;
    let skillType = "";
    
    if (skillId.startsWith("skill_")) {
        skillObj = gameState.generalSkills[skillId];
        skillType = "general";
    } else if (skillId.startsWith("professionalSkill_")) {
        skillObj = gameState.professionalSkills[skillId];
        skillType = "professional";
    }
    
    if (!skillObj) {
        console.error(`Skill not found: ${skillId}`);
        return;
    }
    
    // Calculate experience gain with Eternal Echo multiplier
    const echoMultiplier = gameState.skillEchoes[skillId] || 1;
    const expGain = trainingHours * BASE_SKILL_EXP_RATE * echoMultiplier;
    
    // Add experience
    skillObj.experience += expGain;
    
    // Check for level up
    checkSkillLevelUp(skillId, skillType);
}

/**
 * Check if a skill levels up
 * @param {string} skillId - The ID of the skill
 * @param {string} skillType - "general" or "professional"
 */
function checkSkillLevelUp(skillId, skillType) {
    // Get skill object
    const skillObj = skillType === "general" 
        ? gameState.generalSkills[skillId] 
        : gameState.professionalSkills[skillId];
    
    if (!skillObj) return;
    
    // Calculate experience needed for next level
    // Each level requires more exp than the previous (8% increase per level)
    const expForNextLevel = 100 * Math.pow(1.08, skillObj.level);
    
    // Check if enough experience has been gained
    if (skillObj.experience >= expForNextLevel) {
        // Level up
        skillObj.experience -= expForNextLevel;
        skillObj.level++;
        
        // Show notification
        const skillName = skillType === "general" 
            ? GameData.skills.general[skillId].name 
            : GameData.skills.professional[skillId].name;
        
        showNotification("Skill Level Up!", `${skillName} is now level ${skillObj.level}!`);
        
        // Check if this level grants an Eternal Echo increase (every 10 levels)
        if (skillObj.level % 10 === 0 && skillObj.level <= 100) {
            updateEternalEchoMultiplier(skillId, skillObj.level / 10);
        }
        
        // Check for multiple level ups
        checkSkillLevelUp(skillId, skillType);
    }
}

/**
 * Update Eternal Echo multiplier for a skill
 * @param {string} skillId - The ID of the skill
 * @param {number} echoLevel - The echo level (1-10)
 */
function updateEternalEchoMultiplier(skillId, echoLevel) {
    // 10% bonus per 10 levels, capped at 100% (2x multiplier)
    const bonusMultiplier = 1 + (Math.min(echoLevel, 10) * 0.1);
    
    // Update the echo multiplier if it's higher than the current one
    if (!gameState.skillEchoes[skillId] || bonusMultiplier > gameState.skillEchoes[skillId]) {
        gameState.skillEchoes[skillId] = bonusMultiplier;
        
        // Show notification
        showNotification("Eternal Echo Increased!", 
            `Your training in this skill will be ${Math.floor((bonusMultiplier - 1) * 100)}% faster in future lives!`);
    }
}

/**
 * Process job experience for the day
 * @param {number} workHours - Hours spent working
 */
function processJobExperience(workHours) {
    // Base experience rate per hour - depends on job tier
    const trackInfo = GameData.careers[gameState.currentCareerTrack];
    if (!trackInfo) return;
    
    const jobTier = trackInfo.tiers.find(tier => tier.id === gameState.currentJob);
    if (!jobTier) return;
    
    // Base experience is proportional to job tier (higher tier = more exp)
    const tierIndex = trackInfo.tiers.findIndex(tier => tier.id === gameState.currentJob);
    const BASE_JOB_EXP_RATE = 5 + (tierIndex * 3); // 5 for tier 1, 8 for tier 2, etc.
    
    // Calculate experience gain with Eternal Echo multiplier
    const echoMultiplier = gameState.jobEchoes[gameState.currentJob] || 1;
    const expGain = workHours * BASE_JOB_EXP_RATE * echoMultiplier;
    
    // Add experience
    gameState.jobExperience += expGain;
    
    // Check for level up
    checkJobLevelUp();
}

/**
 * Check if job levels up
 */
function checkJobLevelUp() {
    // Calculate experience needed for next level
    // Each level requires more exp than the previous (10% increase per level)
    const expForNextLevel = 100 * Math.pow(1.1, gameState.jobLevel);
    
    // Check if enough experience has been gained
    if (gameState.jobExperience >= expForNextLevel) {
        // Level up
        gameState.jobExperience -= expForNextLevel;
        gameState.jobLevel++;
        
        // Show notification
        const jobTitle = getJobTitle();
        showNotification("Job Level Up!", `You are now a level ${gameState.jobLevel} ${jobTitle}!`);
        
        // Check if this level grants an Eternal Echo increase (every 10 levels)
        if (gameState.jobLevel % 10 === 0 && gameState.jobLevel <= 100) {
            updateJobEchoMultiplier(gameState.currentJob, gameState.jobLevel / 10);
        }
        
        // Check for multiple level ups
        checkJobLevelUp();
    }
}

/**
 * Update Eternal Echo multiplier for a job
 * @param {string} jobId - The ID of the job
 * @param {number} echoLevel - The echo level (1-10)
 */
function updateJobEchoMultiplier(jobId, echoLevel) {
    // 10% bonus per 10 levels, capped at 100% (2x multiplier)
    const bonusMultiplier = 1 + (Math.min(echoLevel, 10) * 0.1);
    
    // Update the echo multiplier if it's higher than the current one
    if (!gameState.jobEchoes[jobId] || bonusMultiplier > gameState.jobEchoes[jobId]) {
        gameState.jobEchoes[jobId] = bonusMultiplier;
        
        // Show notification
        showNotification("Eternal Echo Increased!", 
            `Your experience in this job will be ${Math.floor((bonusMultiplier - 1) * 100)}% faster in future lives!`);
    }
}

/**
 * Process mortality check for the day
 */
function processMortalityCheck() {
    // Only start mortality checks after age 30
    if (gameState.age < 30) return;
    
    // Base parameters for mortality curve
    const BASE_MORTALITY = 1.0; // Max mortality rate (100%)
    const BASE_K_VALUE = 0.1;   // Steepness of the curve
    const MIDPOINT_AGE = 75;    // Age at which mortality rate is 50%
    
    // Get lifestyle modifiers
    const housingOption = GameData.lifestyle.housing[gameState.housingType] || { mortalityReduction: 0 };
    const foodOption = GameData.lifestyle.food[gameState.foodType] || { mortalityReduction: 0 };
    
    // Calculate adjusted k-value with lifestyle modifiers
    const adjustedK = BASE_K_VALUE * (1 - (housingOption.mortalityReduction + foodOption.mortalityReduction));
    
    // Calculate current mortality rate using sigmoid function
    const mortalityRate = BASE_MORTALITY * (1 / (1 + Math.exp(-adjustedK * (gameState.age - MIDPOINT_AGE))));
    
    // Convert to daily probability (simplification)
    const dailyMortalityChance = mortalityRate / 365;
    
    // Update UI to show mortality rate
    const mortalityDisplay = document.getElementById('mortality-display');
    if (mortalityDisplay) {
        mortalityDisplay.textContent = (dailyMortalityChance * 100).toFixed(2) + "%";
    }
    
    // Check for death
    if (Math.random() < dailyMortalityChance) {
        handleDeath();
    }
}

/**
 * Handle player death
 */
function handleDeath() {
    // Pause the game
    pauseGame();
    
    // Set game over flag
    gameState.isGameOver = true;
    
    // Update death screen
    const deathScreen = document.getElementById('death-screen');
    const deathAge = document.getElementById('death-age');
    const deathJobLevel = document.getElementById('death-job-level');
    const deathSkillLevel = document.getElementById('death-skill-level');
    
    if (deathAge) deathAge.textContent = gameState.age;
    if (deathJobLevel) deathJobLevel.textContent = gameState.jobLevel;
    
    // Find highest skill level
    let highestSkillLevel = 0;
    for (const skillId in gameState.generalSkills) {
        if (gameState.generalSkills[skillId].level > highestSkillLevel) {
            highestSkillLevel = gameState.generalSkills[skillId].level;
        }
    }
    for (const skillId in gameState.professionalSkills) {
        if (gameState.professionalSkills[skillId].level > highestSkillLevel) {
            highestSkillLevel = gameState.professionalSkills[skillId].level;
        }
    }
    
    if (deathSkillLevel) deathSkillLevel.textContent = highestSkillLevel;
    
    // Show death screen
    if (deathScreen) {
        deathScreen.style.display = 'flex';
    }
}

/**
 * Reincarnate player - simplified
 */
function reincarnate() {
    try {
        // Reset game state while preserving echoes
        gameState = GameState.resetWithEchoes(gameState);
        
        // Hide death screen
        const deathScreen = document.getElementById('death-screen');
        if (deathScreen) {
            deathScreen.style.display = 'none';
        }
        
        // Restart the game
        resumeGame();
        
        // Update UI
        updateUI();
        
        showNotification("Reincarnated!", "You've been reincarnated with your Eternal Echo bonuses.");
    } catch (error) {
        console.error("Error during reincarnation:", error);
    }
}

// ============== UI Update Functions ==============
/**
 * Update the lifestyle panel in the UI
 * This function should be called from updateUI()
 */
function updateLifestylePanel() {
    try {
        // Update housing options
        updateHousingOptions();
        
        // Update transportation options
        updateTransportOptions();
        
        // Update food options
        updateFoodOptions();
    } catch (error) {
        console.error("Error updating lifestyle panel:", error);
    }
}

/**
 * Update housing options
 */
function updateHousingOptions() {
    const container = document.getElementById('housing-options-container');
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // Add each housing option
    for (const housingId in GameData.lifestyle.housing) {
        const housingData = GameData.lifestyle.housing[housingId];
        const isCurrent = gameState.housingType === housingId;
        
        // Create housing element
        const housingElement = createLifestyleOptionElement(
            housingId,
            housingData.name,
            housingData.cost,
            [
                `Sleep: -${(housingData.sleepTimeReduction * 100).toFixed(0)}%`,
                `Mortality: ${housingData.mortalityReduction > 0 ? '-' : '+'}${Math.abs(housingData.mortalityReduction * 100).toFixed(0)}%`
            ],
            isCurrent,
            'housing',
            canAffordLifestyleOption(housingData.cost)
        );
        
        container.appendChild(housingElement);
    }
}

/**
 * Update transportation options
 */
function updateTransportOptions() {
    const container = document.getElementById('transportation-options-container');
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // Add each transport option
    for (const transportId in GameData.lifestyle.transport) {
        const transportData = GameData.lifestyle.transport[transportId];
        const isCurrent = gameState.transportType === transportId;
        
        // Create transport element
        const transportElement = createLifestyleOptionElement(
            transportId,
            transportData.name,
            transportData.cost,
            [
                `Commute: -${(transportData.commuteTimeReduction * 100).toFixed(0)}%`
            ],
            isCurrent,
            'transport',
            canAffordLifestyleOption(transportData.cost)
        );
        
        container.appendChild(transportElement);
    }
}

/**
 * Update food options
 */
function updateFoodOptions() {
    const container = document.getElementById('food-options-container');
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // Add each food option
    for (const foodId in GameData.lifestyle.food) {
        const foodData = GameData.lifestyle.food[foodId];
        const isCurrent = gameState.foodType === foodId;
        
        // Create food element
        const foodElement = createLifestyleOptionElement(
            foodId,
            foodData.name,
            foodData.cost,
            [
                `Meals: -${(foodData.mealTimeReduction * 100).toFixed(0)}%`,
                `Mortality: ${foodData.mortalityReduction > 0 ? '-' : '+'}${Math.abs(foodData.mortalityReduction * 100).toFixed(0)}%`
            ],
            isCurrent,
            'food',
            canAffordLifestyleOption(foodData.cost)
        );
        
        container.appendChild(foodElement);
    }
}

/**
 * Create a lifestyle option element
 * @param {string} id - The option ID
 * @param {string} name - The option name
 * @param {number} cost - The option cost
 * @param {Array} effects - Array of effect descriptions
 * @param {boolean} isCurrent - Whether this is the current option
 * @param {string} type - The type of lifestyle option (housing, transport, food)
 * @param {boolean} canAfford - Whether the player can afford this option
 * @returns {HTMLElement} - The lifestyle option element
 */
function createLifestyleOptionElement(id, name, cost, effects, isCurrent, type, canAfford) {
    const element = document.createElement('div');
    element.className = 'lifestyle-option';
    
    // Add current-lifestyle class if applicable
    if (isCurrent) {
        element.classList.add('current-lifestyle');
    }
    
    // Create details section
    const details = document.createElement('div');
    details.className = 'lifestyle-details';
    
    // Option name
    const nameElement = document.createElement('div');
    nameElement.className = 'lifestyle-name';
    nameElement.textContent = name;
    details.appendChild(nameElement);
    
    // Option effects
    if (effects && effects.length > 0) {
        const effectsElement = document.createElement('div');
        effectsElement.className = 'lifestyle-effects';
        effectsElement.textContent = effects.join(' • ');
        details.appendChild(effectsElement);
    }
    
    element.appendChild(details);
    
    // Cost display
    const costElement = document.createElement('div');
    costElement.className = 'lifestyle-cost';
    costElement.textContent = `${cost} kudos/day`;
    element.appendChild(costElement);
    
    // Add purchase button if not current option
    if (!isCurrent) {
        const purchaseButton = document.createElement('button');
        purchaseButton.textContent = "Purchase";
        purchaseButton.disabled = !canAfford;
        
        purchaseButton.addEventListener('click', () => {
            purchaseLifestyleUpgrade(type, id);
        });
        
        element.appendChild(purchaseButton);
    }
    
    return element;
}

/**
 * Check if player can afford a lifestyle option
 * @param {number} cost - The cost of the option
 * @returns {boolean} - Whether the player can afford it
 */
function canAffordLifestyleOption(cost) {
    return gameState.kudos >= cost;
}
/**
 * Update the entire UI
 */
function updateUI() {
    try {
        // Update status panel with player stats
        updateStatusPanel();

        // Update skill panels (general and professional)
        updateSkillsPanel();
        
        // Update career panel with available jobs
        updateCareerPanel();
        
        // Update lifestyle panel options
        updateLifestylePanel();
        
        // Update time allocation display and sliders
        updateTimeAllocation();

        // Update save button based on game changes
        const saveButton = document.getElementById('save-game-button');
        if (saveButton) {
            saveButton.disabled = false; // Enable whenever UI updates
        }
    } catch (error) {
        console.error("Error updating UI:", error);
    }
}
/**
 * Update the skills panel in the UI
 * This function should be called from updateUI()
 */
function updateSkillsPanel() {
    try {
        // Update general skills container
        updateGeneralSkills();
        
        // Update professional skills container
        updateProfessionalSkills();
    } catch (error) {
        console.error("Error updating skills panel:", error);
    }
}

/**
 * Update the general skills section
 */
function updateGeneralSkills() {
    const container = document.getElementById('general-skills-container');
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // Add each general skill
    for (const skillId in GameData.skills.general) {
        const skillData = GameData.skills.general[skillId];
        const playerSkill = gameState.generalSkills[skillId] || { level: 1, experience: 0 };
        
        // Create skill element
        const skillElement = createSkillElement(
            skillId, 
            skillData.name, 
            skillData.description, 
            playerSkill.level, 
            playerSkill.experience, 
            calculateExpForLevel(playerSkill.level),
            "general",
            skillId === gameState.currentTrainingSkill
        );
        
        container.appendChild(skillElement);
    }
}

/**
 * Update the professional skills section
 */
function updateProfessionalSkills() {
    const container = document.getElementById('professional-skills-container');
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // Add each professional skill
    for (const skillId in GameData.skills.professional) {
        const skillData = GameData.skills.professional[skillId];
        const playerSkill = gameState.professionalSkills[skillId] || { level: 1, experience: 0 };
        
        // Create skill element
        const skillElement = createSkillElement(
            skillId, 
            skillData.name, 
            skillData.description, 
            playerSkill.level, 
            playerSkill.experience, 
            calculateExpForLevel(playerSkill.level),
            "professional",
            skillId === gameState.currentTrainingSkill
        );
        
        // Add career track info for professional skills
        if (skillData.primaryCareerTracks && skillData.primaryCareerTracks.length > 0) {
            const careerInfo = document.createElement('div');
            careerInfo.className = 'skill-career-info';
            
            let careerNames = skillData.primaryCareerTracks.map(trackId => {
                const track = GameData.careers[trackId];
                return track ? track.name : '';
            }).filter(name => name);
            
            careerInfo.textContent = `Career Tracks: ${careerNames.join(', ')}`;
            skillElement.querySelector('.skill-description').appendChild(careerInfo);
        }
        
        container.appendChild(skillElement);
    }
}

/**
 * Create a skill element for the UI
 * @param {string} skillId - The skill ID
 * @param {string} name - The skill name
 * @param {string} description - The skill description
 * @param {number} level - The current skill level
 * @param {number} experience - The current experience
 * @param {number} expForNextLevel - Experience needed for next level
 * @param {string} skillType - "general" or "professional"
 * @param {boolean} isTraining - Whether this skill is currently being trained
 * @returns {HTMLElement} The skill element
 */
function createSkillElement(skillId, name, description, level, experience, expForNextLevel, skillType, isTraining) {
    const skillElement = document.createElement('div');
    skillElement.className = 'skill-item';
    if (isTraining) {
        skillElement.classList.add('active-training');
    }
    
    // Create header with name and level
    const header = document.createElement('div');
    header.className = 'skill-header';
    
    const nameElement = document.createElement('div');
    nameElement.className = 'skill-name';
    nameElement.textContent = name;
    
    const levelElement = document.createElement('div');
    levelElement.className = 'skill-level';
    levelElement.textContent = `Level ${level}`;
    
    header.appendChild(nameElement);
    header.appendChild(levelElement);
    skillElement.appendChild(header);
    
    // Add description
    const descElement = document.createElement('div');
    descElement.className = 'skill-description';
    descElement.textContent = description;
    skillElement.appendChild(descElement);
    
    // Create progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    // Calculate progress percentage
    const progressPercent = (experience / expForNextLevel) * 100;
    progressBar.style.width = `${Math.min(100, progressPercent)}%`;
    
    progressContainer.appendChild(progressBar);
    skillElement.appendChild(progressContainer);
    
    // Add experience info
    const expInfo = document.createElement('div');
    expInfo.className = 'skill-exp-info';
    expInfo.textContent = `${Math.floor(experience)}/${Math.floor(expForNextLevel)} XP`;
    skillElement.appendChild(expInfo);
    
    // Add eternal echo info if applicable
    if (gameState.skillEchoes[skillId] && gameState.skillEchoes[skillId] > 1) {
        const echoInfo = document.createElement('div');
        echoInfo.className = 'skill-echo-info';
        const bonusPercent = Math.floor((gameState.skillEchoes[skillId] - 1) * 100);
        echoInfo.textContent = `Eternal Echo: +${bonusPercent}% XP`;
        skillElement.appendChild(echoInfo);
    }
    
    // Add training button
    const trainButton = document.createElement('button');
    trainButton.className = 'training-button';
    trainButton.textContent = isTraining ? 'Currently Training' : 'Train This Skill';
    trainButton.disabled = isTraining;
    
    // Add event listener to switch training skill
    trainButton.addEventListener('click', () => {
        switchTrainingSkill(skillId, skillType);
    });
    
    skillElement.appendChild(trainButton);
    
    return skillElement;
}

/**
 * Calculate experience needed for the next level
 * @param {number} currentLevel - The current level
 * @returns {number} Experience needed for next level
 */
function calculateExpForLevel(currentLevel) {
    // Same formula as in checkSkillLevelUp
    return 100 * Math.pow(1.08, currentLevel);
}


/**
 * Update status panel
 */
function updateStatusPanel() {
    // Update date and age
    const dateDisplay = document.getElementById('date-display');
    const ageDisplay = document.getElementById('age-display');
    
    if (dateDisplay) dateDisplay.textContent = `Day ${gameState.day}, Year ${gameState.year - 2024}`;
    if (ageDisplay) ageDisplay.textContent = gameState.age;
    
    // Update kudos
    const kudosDisplay = document.getElementById('kudos-display');
    if (kudosDisplay) kudosDisplay.textContent = Math.floor(gameState.kudos);
    
    // Update job info
    const jobDisplay = document.getElementById('job-display');
    const jobLevelDisplay = document.getElementById('job-level-display');
    
    if (jobDisplay) jobDisplay.textContent = getJobTitle();
    if (jobLevelDisplay) jobLevelDisplay.textContent = gameState.jobLevel;
    
    // Update income and expenses
    const incomeDisplay = document.getElementById('income-display');
    const expensesDisplay = document.getElementById('expenses-display');
    
    if (incomeDisplay) incomeDisplay.textContent = `${calculateDailyIncome().toFixed(1)} kudos/day`;
    if (expensesDisplay) expensesDisplay.textContent = `${calculateDailyExpenses().toFixed(1)} kudos/day`;
}

/**
 * Update time allocation UI and sliders
 */
function updateTimeAllocation() {
    const timeInfo = calculateAllocatableHours();
    
    // Update fixed time displays
    const fixedTimeDisplay = document.getElementById('fixed-time-display');
    const sleepTimeDisplay = document.getElementById('sleep-time-display');
    const commuteTimeDisplay = document.getElementById('commute-time-display');
    const mealTimeDisplay = document.getElementById('meal-time-display');
    
    if (fixedTimeDisplay) fixedTimeDisplay.textContent = `${timeInfo.fixedTimeTotal.toFixed(1)} hours/day`;
    if (sleepTimeDisplay) sleepTimeDisplay.textContent = `${timeInfo.adjustedSleepHours.toFixed(1)} hours`;
    if (commuteTimeDisplay) commuteTimeDisplay.textContent = `${timeInfo.adjustedCommuteHours.toFixed(1)} hours`;
    if (mealTimeDisplay) mealTimeDisplay.textContent = `${timeInfo.adjustedMealHours.toFixed(1)} hours`;
    
    // Update allocatable time
    const allocatableTimeDisplay = document.getElementById('allocatable-time-display');
    if (allocatableTimeDisplay) allocatableTimeDisplay.textContent = `${timeInfo.allocatableHours.toFixed(1)} hours/day`;
    
    // Update work time display
    const workTimeDisplay = document.getElementById('work-time-display');
    if (workTimeDisplay) workTimeDisplay.textContent = `${gameState.workHours.toFixed(1)} hours`;
    
    // Update training time display
    const trainingTimeDisplay = document.getElementById('training-time-display');
    if (trainingTimeDisplay) trainingTimeDisplay.textContent = `${gameState.trainingHours.toFixed(1)} hours`;
    
    // Update slider positions
    updateTimeSliders(timeInfo.allocatableHours);
    
    // Enable/disable +/- buttons based on current values
    updateTimeButtons(timeInfo.allocatableHours);
}

/**
 * Update slider positions based on current hours
 */
function updateTimeSliders(allocatableHours) {
    // Set work slider
    const workHandle = document.getElementById('work-handle');
    if (workHandle) {
        const workPercentage = allocatableHours > 0 ? 
            Math.min(100, (gameState.workHours / allocatableHours) * 100) : 0;
        workHandle.style.left = `${workPercentage}%`;
    }
    
    // Set training slider
    const trainingHandle = document.getElementById('training-handle');
    if (trainingHandle) {
        const trainingPercentage = allocatableHours > 0 ? 
            Math.min(100, (gameState.trainingHours / allocatableHours) * 100) : 0;
        trainingHandle.style.left = `${trainingPercentage}%`;
    }
}

/**
 * Update time buttons enabled/disabled state
 */
function updateTimeButtons(allocatableHours) {
    const workDecrease = document.getElementById('work-decrease');
    const workIncrease = document.getElementById('work-increase');
    const trainingDecrease = document.getElementById('training-decrease');
    const trainingIncrease = document.getElementById('training-increase');
    
    if (workDecrease) workDecrease.disabled = gameState.workHours <= 0;
    if (workIncrease) workIncrease.disabled = gameState.workHours + gameState.trainingHours >= allocatableHours;
    if (trainingDecrease) trainingDecrease.disabled = gameState.trainingHours <= 0;
    if (trainingIncrease) trainingIncrease.disabled = gameState.workHours + gameState.trainingHours >= allocatableHours;
}

/**
 * Make a slider element draggable with improved functionality
 */
function makeSliderDraggable(sliderElement, handleElement, callback) {
    let isDragging = false;
    
    // Start dragging on mousedown
    handleElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateSliderPosition(e);
        e.preventDefault(); // Prevent text selection
    });
    
    // Handle touch events for mobile
    handleElement.addEventListener('touchstart', (e) => {
        isDragging = true;
        updateSliderPosition(e.touches[0]);
        e.preventDefault(); // Prevent scrolling
    });
    
    // Track drag on mousemove
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateSliderPosition(e);
        }
    });
    
    // Track touch movement
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            updateSliderPosition(e.touches[0]);
            e.preventDefault(); // Prevent scrolling
        }
    });
    
    // End drag on mouseup
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // End drag on touch end
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // Helper to update slider position
    function updateSliderPosition(event) {
        const rect = sliderElement.getBoundingClientRect();
        let x = event.clientX - rect.left;
        
        // Constrain to slider width
        x = Math.max(0, Math.min(x, rect.width));
        
        // Calculate percentage
        const percent = (x / rect.width) * 100;
        
        // Update handle position
        handleElement.style.left = `${percent}%`;
        
        // Call the callback with the percentage
        callback(percent);
    }
}

/**
 * Update career panel with clickable job options
 */
function updateCareerPanel() {
    try {
        console.log("Updating career panel...");
        
        const careerContainer = document.getElementById('career-tracks-container');
        if (!careerContainer) {
            console.error("Career container not found in DOM");
            return;
        }
        
        // Clear the container
        careerContainer.innerHTML = '';
        
        // Check if career tracks are available
        if (!GameData.careers || Object.keys(GameData.careers).length === 0) {
            console.error("No career tracks found in GameData:", GameData);
            careerContainer.innerHTML = '<div class="career-track">No career tracks available</div>';
            return;
        }
        
        console.log("Career tracks found:", Object.keys(GameData.careers));
        
        // Add career tracks
        for (const trackId in GameData.careers) {
            const track = GameData.careers[trackId];
            console.log(`Adding career track: ${track.name}`);
            
            // Create career track element
            const trackElement = document.createElement('div');
            trackElement.className = 'career-track';
            
            // Create track header
            const trackHeader = document.createElement('div');
            trackHeader.className = 'career-track-header';
            
            const trackTitle = document.createElement('div');
            trackTitle.className = 'career-track-title';
            trackTitle.textContent = track.name;
            
            trackHeader.appendChild(trackTitle);
            trackElement.appendChild(trackHeader);
            
            if (track.description) {
                const trackDescription = document.createElement('div');
                trackDescription.className = 'career-track-description';
                trackDescription.textContent = track.description;
                trackElement.appendChild(trackDescription);
            }
            
            // Add all job tiers
            if (track.tiers && track.tiers.length > 0) {
                console.log(`Track ${track.name} has ${track.tiers.length} tiers`);
                
                // Keep track of which tiers to show
                // Initially just show first tier and current job's tier
                const visibleTiers = new Set();
                visibleTiers.add(0); // Always show first tier
                
                // Find current job's tier index if in this track
                const currentTierIndex = track.tiers.findIndex(tier => tier.id === gameState.currentJob);
                if (currentTierIndex >= 0) {
                    visibleTiers.add(currentTierIndex);
                    
                    // Also show next tier if available
                    if (currentTierIndex + 1 < track.tiers.length) {
                        visibleTiers.add(currentTierIndex + 1);
                    }
                }
                
                // Add each visible tier
                track.tiers.forEach((tier, index) => {
                    if (visibleTiers.has(index)) {
                        console.log(`Adding tier: ${tier.name}`);
                        const tierElement = createJobTierElement(tier, track.tiers, trackId);
                        trackElement.appendChild(tierElement);
                    }
                });
            } else {
                console.warn(`Track ${track.name} has no tiers`);
            }
            
            careerContainer.appendChild(trackElement);
        }
    } catch (error) {
        console.error("Error updating career panel:", error);
        console.error("Stack trace:", error.stack);
    }
}

/**
 * Create a job tier element
 * @param {Object} tier - The job tier data
 * @param {Array} allTiers - All tiers in this career track
 * @param {string} trackId - The career track ID
 * @returns {HTMLElement} - The job tier element
 */
function createJobTierElement(tier, allTiers, trackId) {
    const tierElement = document.createElement('div');
    tierElement.className = 'job-tier';
    
    // Add current-job class if this is the player's current job
    if (tier.id === gameState.currentJob) {
        tierElement.classList.add('current-job');
    }
    
    // Create job details section
    const jobDetails = document.createElement('div');
    jobDetails.className = 'job-details';
    
    // Job title
    const jobTitle = document.createElement('div');
    jobTitle.className = 'job-title';
    jobTitle.textContent = tier.name;
    jobDetails.appendChild(jobTitle);
    
    // Job quote
    if (tier.quote) {
        const jobQuote = document.createElement('div');
        jobQuote.className = 'job-quote';
        jobQuote.textContent = `"${tier.quote}"`;
        jobDetails.appendChild(jobQuote);
    }
    
    // Job salary
    const jobSalary = document.createElement('div');
    jobSalary.className = 'job-salary';
    jobSalary.textContent = `${tier.baseSalary} kudos/hr`;
    jobDetails.appendChild(jobSalary);
    
    tierElement.appendChild(jobDetails);
    
    // Add requirements if this isn't the current job
    if (tier.id !== gameState.currentJob) {
        const requirements = document.createElement('div');
        requirements.className = 'job-requirements';
        
        // Check if requirements are met
        const requirementsMet = checkJobRequirements(tier);
        
        if (requirementsMet) {
            const applyButton = document.createElement('button');
            applyButton.textContent = "Apply for Job";
            applyButton.addEventListener('click', () => {
                applyForJob(tier.id);
            });
            requirements.appendChild(applyButton);
        } else {
            if (tier.requirements) {
                // Add general skill requirements
                if (tier.requirements.generalSkills && Object.keys(tier.requirements.generalSkills).length > 0) {
                    const skillReqs = document.createElement('div');
                    skillReqs.className = 'skill-requirements';
                    skillReqs.textContent = "Required Skills:";
                    
                    const skillList = document.createElement('ul');
                    for (const [skillId, level] of Object.entries(tier.requirements.generalSkills)) {
                        const skillName = GameData.skills.general[skillId]?.name || skillId;
                        const playerLevel = gameState.generalSkills[skillId]?.level || 0;
                        
                        const listItem = document.createElement('li');
                        listItem.textContent = `${skillName}: ${playerLevel}/${level}`;
                        
                        // Highlight if requirement not met
                        if (playerLevel < level) {
                            listItem.style.color = 'red';
                        } else {
                            listItem.style.color = 'green';
                        }
                        
                        skillList.appendChild(listItem);
                    }
                    skillReqs.appendChild(skillList);
                    requirements.appendChild(skillReqs);
                }
                
                // Add professional skill requirements
                if (tier.requirements.professionalSkills && Object.keys(tier.requirements.professionalSkills).length > 0) {
                    const profSkillReqs = document.createElement('div');
                    profSkillReqs.className = 'prof-skill-requirements';
                    profSkillReqs.textContent = "Required Professional Skills:";
                    
                    const skillList = document.createElement('ul');
                    for (const [skillId, level] of Object.entries(tier.requirements.professionalSkills)) {
                        const skillName = GameData.skills.professional[skillId]?.name || skillId;
                        const playerLevel = gameState.professionalSkills[skillId]?.level || 0;
                        
                        const listItem = document.createElement('li');
                        listItem.textContent = `${skillName}: ${playerLevel}/${level}`;
                        
                        // Highlight if requirement not met
                        if (playerLevel < level) {
                            listItem.style.color = 'red';
                        } else {
                            listItem.style.color = 'green';
                        }
                        
                        skillList.appendChild(listItem);
                    }
                    profSkillReqs.appendChild(skillList);
                    requirements.appendChild(profSkillReqs);
                }
                
                // Add previous job requirement if applicable
                if (tier.requirements.previousJob) {
                    const prevJobReq = document.createElement('div');
                    prevJobReq.className = 'previous-job-requirement';
                    
                    // Find previous job info
                    const prevJobTier = allTiers.find(t => t.id === tier.requirements.previousJob);
                    const prevJobName = prevJobTier ? prevJobTier.name : tier.requirements.previousJob;
                    
                    prevJobReq.textContent = `Previous Job: ${prevJobName} (Level ${gameState.currentJob === tier.requirements.previousJob ? gameState.jobLevel : 0}/${tier.requirements.previousJobLevel})`;
                    
                    // Highlight if requirement not met
                    if (gameState.currentJob !== tier.requirements.previousJob || gameState.jobLevel < tier.requirements.previousJobLevel) {
                        prevJobReq.style.color = 'red';
                    } else {
                        prevJobReq.style.color = 'green';
                    }
                    
                    requirements.appendChild(prevJobReq);
                }
            }
        }
        
        tierElement.appendChild(requirements);
    }
    
    return tierElement;
}

/**
 * Check if job requirements are met
 * @param {Object} jobTier - The job tier to check
 * @returns {boolean} - Whether requirements are met
 */
function checkJobRequirements(jobTier) {
    try {
        // If it's the current job, requirements are already met
        if (gameState.currentJob === jobTier.id) {
            return true;
        }
        
        // If no requirements, return true
        if (!jobTier.requirements) {
            return true;
        }
        
        // Check previous job requirement
        if (jobTier.requirements.previousJob && 
            (gameState.currentJob !== jobTier.requirements.previousJob || 
             gameState.jobLevel < jobTier.requirements.previousJobLevel)) {
            return false;
        }
        
        // Check general skill requirements
        if (jobTier.requirements.generalSkills) {
            for (const [skillId, level] of Object.entries(jobTier.requirements.generalSkills)) {
                if (!gameState.generalSkills[skillId] || gameState.generalSkills[skillId].level < level) {
                    return false;
                }
            }
        }
        
        // Check professional skill requirements
        if (jobTier.requirements.professionalSkills) {
            for (const [skillId, level] of Object.entries(jobTier.requirements.professionalSkills)) {
                if (!gameState.professionalSkills[skillId] || gameState.professionalSkills[skillId].level < level) {
                    return false;
                }
            }
        }
        
        return true;
    } catch (error) {
        console.error("Error checking job requirements:", error);
        return false;
    }
}

/**
 * Get the title of the current job
 */
function getJobTitle() {
    try {
        const trackInfo = GameData.careers[gameState.currentCareerTrack];
        if (!trackInfo) return "Unemployed";
        
        const jobTier = trackInfo.tiers.find(tier => tier.id === gameState.currentJob);
        if (!jobTier) return "Unemployed";
        
        return jobTier.name;
    } catch (error) {
        console.error("Error getting job title:", error);
        return "Unemployed";
    }
}

// Initialize game when document is loaded
window.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded - Starting game initialization");
    initializeGame();
});
