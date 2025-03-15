/**
 * Time System Alignment
 * 
 * This code aligns the game's time system with the documented 24-hour day cycle.
 * It ensures proper time allocation for sleeping, commuting, meals, and activites.
 */

// Constants for time system
const TIME_CONSTANTS = {
    HOURS_PER_DAY: 24,
    DEFAULT_SLEEP: 8,      // Default sleep time
    DEFAULT_COMMUTE: 2,    // Default commute time
    DEFAULT_MEALS: 3,      // Default meal time (breakfast, lunch, dinner)
    DEFAULT_CLEANING: 0.5, // Default cleaning time
    DEFAULT_WORKING: 5,    // Default working time
    DEFAULT_TRAINING: 3    // Default training time  
};

/**
 * Initialize time allocation system based on lifestyle choices
 */
function initializeTimeAllocation() {
    console.log("initializeTimeAllocation() - Setting up time allocation");
    
    // Base time allocation structure
    if (!gameState.timeAllocation) {
        gameState.timeAllocation = {
            working: TIME_CONSTANTS.DEFAULT_WORKING,
            training: TIME_CONSTANTS.DEFAULT_TRAINING,
            sleeping: TIME_CONSTANTS.DEFAULT_SLEEP,
            traveling: TIME_CONSTANTS.DEFAULT_COMMUTE,
            cooking: TIME_CONSTANTS.DEFAULT_MEALS,
            cleaning: TIME_CONSTANTS.DEFAULT_CLEANING,
            freeTime: 0 // Will be calculated
        };
    }
    
    // Apply lifestyle effects to basic time needs if available
    if (gameState.lifestyleEffects && gameState.lifestyleEffects.timeAllocation) {
        gameState.timeAllocation.sleeping = gameState.lifestyleEffects.timeAllocation.sleep || TIME_CONSTANTS.DEFAULT_SLEEP;
        gameState.timeAllocation.traveling = gameState.lifestyleEffects.timeAllocation.commute || TIME_CONSTANTS.DEFAULT_COMMUTE;
        gameState.timeAllocation.cooking = gameState.lifestyleEffects.timeAllocation.meals || TIME_CONSTANTS.DEFAULT_MEALS;
    }
    
    // Calculate free time based on fixed time allocations
    recalculateFreeTime();
    
    console.log("Time allocation initialized:", gameState.timeAllocation);
}

/**
 * Calculate free time based on all allocations
 */
function recalculateFreeTime() {
    console.log("recalculateFreeTime() - Calculating available free time");
    
    if (!gameState.timeAllocation) {
        initializeTimeAllocation();
        return;
    }
    
    // Calculate total fixed time (sleep, commute, meals, cleaning)
    const fixedTime = (
        gameState.timeAllocation.sleeping + 
        gameState.timeAllocation.traveling + 
        gameState.timeAllocation.cooking + 
        gameState.timeAllocation.cleaning
    );
    
    // Calculate time spent on activities (work, training)
    const activityTime = (
        gameState.timeAllocation.working + 
        gameState.timeAllocation.training
    );
    
    // Free time is what remains from 24 hours
    const freeTime = TIME_CONSTANTS.HOURS_PER_DAY - fixedTime - activityTime;
    
    // Update free time (min 0)
    gameState.timeAllocation.freeTime = Math.max(0, freeTime);
    
    console.log(`Free time calculated: ${gameState.timeAllocation.freeTime.toFixed(2)} hours`);
}

/**
 * Validate time adjustments to ensure they're within available free time
 * @param {string} activity - Activity to adjust (working, training)
 * @param {number} hours - Hours to add (positive) or remove (negative)
 * @returns {boolean} Whether the adjustment is valid
 */
function validateTimeAdjustment(activity, hours) {
    // Skip check for removing time
    if (hours <= 0) return true;
    
    // Check if we have enough free time for this adjustment
    if (gameState.timeAllocation.freeTime < hours) {
        console.log(`Not enough free time for ${activity} adjustment: needed ${hours}, available ${gameState.timeAllocation.freeTime}`);
        return false;
    }
    
    return true;
}

/**
 * Increase time allocation for an activity
 * @param {string} activity - Activity to increase time for
 * @param {number} hours - Hours to add
 * @returns {boolean} Whether time was successfully added
 */
function increaseActivityTime(activity, hours) {
    console.log(`increaseActivityTime() - Adding ${hours} hours to ${activity}`);
    
    // Validate if we have enough free time
    if (!validateTimeAdjustment(activity, hours)) {
        return false;
    }
    
    // Update activity time
    gameState.timeAllocation[activity] += hours;
    
    // Recalculate free time
    recalculateFreeTime();
    
    return true;
}

/**
 * Decrease time allocation for an activity
 * @param {string} activity - Activity to decrease time for
 * @param {number} hours - Hours to remove
 * @returns {boolean} Whether time was successfully removed
 */
function decreaseActivityTime(activity, hours) {
    console.log(`decreaseActivityTime() - Removing ${hours} hours from ${activity}`);
    
    // Ensure we're not going below 0
    if (gameState.timeAllocation[activity] < hours) {
        console.log(`Cannot decrease ${activity} below 0`);
        return false;
    }
    
    // Update activity time
    gameState.timeAllocation[activity] -= hours;
    
    // Recalculate free time
    recalculateFreeTime();
    
    return true;
}

/**
 * Apply time effects from lifestyle changes
 */
function applyLifestyleTimeEffects() {
    console.log("applyLifestyleTimeEffects() - Updating time allocation from lifestyle");
    
    // Skip if lifecycle effects not available
    if (!gameState.lifestyleEffects || !gameState.lifestyleEffects.timeAllocation) {
        return;
    }
    
    // Get previous values to check for changes
    const prevSleeping = gameState.timeAllocation.sleeping;
    const prevTraveling = gameState.timeAllocation.traveling;
    const prevCooking = gameState.timeAllocation.cooking;
    
    // Apply new values
    gameState.timeAllocation.sleeping = gameState.lifestyleEffects.timeAllocation.sleep;
    gameState.timeAllocation.traveling = gameState.lifestyleEffects.timeAllocation.commute;
    gameState.timeAllocation.cooking = gameState.lifestyleEffects.timeAllocation.meals;
    
    // Calculate total time difference
    const timeDifference = (
        (prevSleeping - gameState.timeAllocation.sleeping) +
        (prevTraveling - gameState.timeAllocation.traveling) +
        (prevCooking - gameState.timeAllocation.cooking)
    );
    
    // Log the time savings or loss
    if (timeDifference > 0) {
        console.log(`Gained ${timeDifference.toFixed(2)} hours of free time from lifestyle changes`);
    } else if (timeDifference < 0) {
        console.log(`Lost ${Math.abs(timeDifference).toFixed(2)} hours of free time from lifestyle changes`);
    }
    
    // Recalculate free time
    recalculateFreeTime();
}

/**
 * Update time allocation display in the UI
 */
function updateTimeAllocationDisplay() {
    // Working time display
    const workingTimeDisplay = document.querySelector('.working .time-display');
    const workingProgressFill = document.querySelector('.working .progress-fill');
    
    // Training time display
    const trainingTimeDisplay = document.querySelector('.training .time-display');
    const trainingProgressFill = document.querySelector('.training .progress-fill');
    
    // Fixed activities display
    const sleepingTime = document.querySelector('.other-activities .other-activity:nth-child(1) span:nth-child(2)');
    const travelingTime = document.querySelector('.other-activities .other-activity:nth-child(2) span:nth-child(2)');
    const cleaningTime = document.querySelector('.other-activities .other-activity:nth-child(3) span:nth-child(2)');
    const cookingTime = document.querySelector('.other-activities .other-activity:nth-child(4) span:nth-child(2)');
    
    // Free time display
    const freeTimeValue = document.querySelector('.free-time .free-time-value');
    
    // Format and display working time
    if (workingTimeDisplay) {
        const hours = Math.floor(gameState.timeAllocation.working);
        const minutes = Math.round((gameState.timeAllocation.working - hours) * 60);
        workingTimeDisplay.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Update working progress bar
    if (workingProgressFill) {
        const percentWorking = (gameState.timeAllocation.working / TIME_CONSTANTS.HOURS_PER_DAY) * 100;
        workingProgressFill.style.width = `${percentWorking}%`;
    }
    
    // Format and display training time
    if (trainingTimeDisplay) {
        const hours = Math.floor(gameState.timeAllocation.training);
        const minutes = Math.round((gameState.timeAllocation.training - hours) * 60);
        trainingTimeDisplay.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Update training progress bar
    if (trainingProgressFill) {
        const percentTraining = (gameState.timeAllocation.training / TIME_CONSTANTS.HOURS_PER_DAY) * 100;
        trainingProgressFill.style.width = `${percentTraining}%`;
    }
    
    // Update fixed activities display
    if (sleepingTime) {
        const hours = Math.floor(gameState.timeAllocation.sleeping);
        const minutes = Math.round((gameState.timeAllocation.sleeping - hours) * 60);
        sleepingTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    
    if (travelingTime) {
        const hours = Math.floor(gameState.timeAllocation.traveling);
        const minutes = Math.round((gameState.timeAllocation.traveling - hours) * 60);
        travelingTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    
    if (cleaningTime) {
        const hours = Math.floor(gameState.timeAllocation.cleaning);
        const minutes = Math.round((gameState.timeAllocation.cleaning - hours) * 60);
        cleaningTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    
    if (cookingTime) {
        const hours = Math.floor(gameState.timeAllocation.cooking);
        const minutes = Math.round((gameState.timeAllocation.cooking - hours) * 60);
        cookingTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Update free time display
    if (freeTimeValue) {
        const hours = Math.floor(gameState.timeAllocation.freeTime);
        const minutes = Math.round((gameState.timeAllocation.freeTime - hours) * 60);
        freeTimeValue.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
}

// Export functions for external use
window.initializeTimeAllocation = initializeTimeAllocation;
window.recalculateFreeTime = recalculateFreeTime;
window.increaseActivityTime = increaseActivityTime;
window.decreaseActivityTime = decreaseActivityTime;
window.applyLifestyleTimeEffects = applyLifestyleTimeEffects;
window.updateTimeAllocationDisplay = updateTimeAllocationDisplay;