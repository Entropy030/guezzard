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

/**
 * Make a slider element draggable
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
 * Check if job requirements are met (simplified)
 */
function checkJobRequirements(jobTier) {
    try {
        // If it's the current job, requirements are already met
        if (gameState.currentJob === jobTier.id) {
            return true;
        }
        
        // Basic checks (simplified)
        // ... add detailed checks as needed
        
        return true; // For now, allow all jobs
    } catch (error) {
        console.error("Error checking job requirements:", error);
        return false;
    }
}

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

/**
 * Progress one day - simplified core game loop
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
        
        // Basic progress for job and skills
        // ... add more detailed calculations later
        
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
                
                // Check mortality
                // ... add later
            }
        }
        
        // Update UI
        updateUI();
    } catch (error) {
        console.error("Error progressing day:", error);
        pauseGame();
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
 * Update the entire UI
 */
function updateUI() {
    try {
        updateStatusPanel();
        updateTimeAllocation();
        updateCareerPanel();
        // Add more panel updates as needed
        //updateSkillsPanel();
        //updateLifestylePanel();
    } catch (error) {
        console.error("Error updating UI:", error);
    }
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
 * Update time allocation panel
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
}

/**
 * Update slider positions based on current hours
 */
function updateTimeSliders(allocatableHours) {
    // Set work slider
    const workHandle = document.getElementById('work-handle');
    if (workHandle) {
        const workPercentage = Math.min(100, (gameState.workHours / allocatableHours) * 100);
        workHandle.style.left = `${workPercentage}%`;
    }
    
    // Set training slider
    const trainingHandle = document.getElementById('training-handle');
    if (trainingHandle) {
        const trainingPercentage = Math.min(100, (gameState.trainingHours / allocatableHours) * 100);
        trainingHandle.style.left = `${trainingPercentage}%`;
    }
}

/**
 * Update career panel - minimal implementation
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
            console.error("No career tracks found in GameData");
            careerContainer.innerHTML = '<div class="career-track">No career tracks available</div>';
            return;
        }
        
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
            
            // Add job tiers (simplified - just show the first tier)
            if (track.tiers && track.tiers.length > 0) {
                const tier = track.tiers[0];
                
                const tierElement = document.createElement('div');
                tierElement.className = 'job-tier';
                
                const jobTitle = document.createElement('div');
                jobTitle.className = 'job-title';
                jobTitle.textContent = tier.name;
                
                tierElement.appendChild(jobTitle);
                trackElement.appendChild(tierElement);
            }
            
            careerContainer.appendChild(trackElement);
        }
    } catch (error) {
        console.error("Error updating career panel:", error);
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