// game-loop.js - Fixed version

// Variables for game loop timing
let lastTimestamp = 0;

// Main game loop function
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

        // Handle season time
        if (gameState.seasonTimeLeft > 0) {
            gameState.seasonTimeLeft -= 1;
        } else {
            // Season End & Transition
            gameState.seasonTimeLeft = CONFIG.settings.seasonDuration; 
        }
        
        // Advance the game day
        advanceDay();
        
        // Process job progress (if player has a job)
        if (typeof window.processJobProgress === 'function' && gameState.activeJob) {
            window.processJobProgress(deltaTime);
        }

        // Update UI
        if (typeof window.updateDisplay === 'function') {
            window.updateDisplay();
        }
        
        // Check for achievements
        if (typeof window.checkAchievements === 'function') {
            window.checkAchievements();
        }
        
        // REMOVED: runEvents() - No longer triggering random events
    }

    requestAnimationFrame(gameLoop);
}

// Function to start the game loop
function startGameLoop() {
    console.log("startGameLoop() - Starting game loop with requestAnimationFrame");
    lastTimestamp = 0; // Reset lastTimestamp
    requestAnimationFrame(window.gameLoop); // Use window.gameLoop to avoid recursion
}

// Energy regeneration function
function regenerateEnergy() {
    // console.log("regenerateEnergy() - START - Current energy:", gameState.energy, "maxEnergy:", gameState.maxEnergy);

    const energyRegenBase = 1;
    const prestigeBonus = gameState.prestigeLevel * 0.2;
    const regenRate = energyRegenBase + prestigeBonus;
    // console.log("regenerateEnergy() - Calculated regenRate:", regenRate);

    let newEnergy = gameState.energy + regenRate;
    // console.log("regenerateEnergy() - Calculated newEnergy (before min/max):", newEnergy);

    gameState.energy = Math.min(gameState.maxEnergy, newEnergy);
    // console.log("regenerateEnergy() - Calculated gameState.energy (after min/max):", gameState.energy);

    updateEnergyDisplay();

    // console.log("regenerateEnergy() - END - New energy:", gameState.energy);
}

// Modified advanceDay function with age progression and cleaner logging
function advanceDay() {
    // Skip if game is paused
    if (gameState.gamePaused) {
        return;
    }

    gameState.ticksSinceDayStart++; // Increment at the beginning

    // Check if a new day has started
    if (gameState.ticksSinceDayStart >= CONFIG.settings.ticksInOneGameDay) {
        gameState.day++;
        gameState.ticksSinceDayStart = 0; // Reset at the START of the new day
        
        // Update day display
        updateDaySeasonDisplay();
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
            
            // IMPORTANT ADDITION: Increment age with each new year
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
        
        // Reset season time
        gameState.seasonTimeLeft = CONFIG.settings.seasonDuration;
        
        // Update display
        updateDaySeasonDisplay();
    }

    // Increment played time and save game periodically
    gameState.timePlayedSeconds++;
    
    // Save only occasionally to improve performance (every 60 seconds of game time)
    if (gameState.timePlayedSeconds % 60 === 0) {
        saveGameData();
    }
}

// Function to update the day-season display
function updateDaySeasonDisplay() {
    const seasonDisplay = document.getElementById('season-display');
    if (seasonDisplay) {
        // Format: "Day X, Season, Year Y"
        seasonDisplay.textContent = `Day ${gameState.day}, ${gameState.currentSeason}, Year ${gameState.year}`;
    }
}

// Function to update the day-season display
function updateDaySeasonDisplay() {
    const seasonDisplay = document.getElementById('season-display');
    if (seasonDisplay) {
        // Format: "Day X, Season, Year Y"
        seasonDisplay.textContent = `Day ${gameState.day}, ${gameState.currentSeason}, Year ${gameState.year}`;
    }
}

// Add the updateGameSpeedUI function that was missing
function updateGameSpeedUI() {
    const speedButton = document.getElementById('speed-button');
    if (speedButton) {
        speedButton.textContent = `▶ ${gameState.gameSpeed}x Speed`;
    }
}

function updateEnergyDisplay() {
    // console.log("updateEnergyDisplay Placeholder");
    const energyDisplay = document.getElementById('energy-display');
    if (energyDisplay) {
        energyDisplay.textContent = `${Math.floor(gameState.energy)}/${gameState.maxEnergy}`;
    }
    
    // Update energy bar if it exists
    const energyBar = document.getElementById('energy-bar-fill');
    if (energyBar) {
        const energyPercentage = (gameState.energy / gameState.maxEnergy) * 100;
        energyBar.style.width = `${energyPercentage}%`;
    }
}

function updateJobProgressBar() {
    // console.log("updateJobProgressBar() - Placeholder function called");
    const jobProgressBarFill = document.querySelector('.progressFill');
    const jobProgressText = document.querySelector('.progress-text.name');
    
    if (!jobProgressBarFill || !jobProgressText) {
        // Elements not found, may be early in loading process
        return;
    }
    
    if (gameState.activeJob) {
        const progressPercent = (gameState.jobProgress / gameState.activeJob.progressNeeded) * 100;
        jobProgressBarFill.style.width = `${Math.min(100, progressPercent)}%`;
        jobProgressText.textContent = `${gameState.activeJob.title} Progress: ${Math.floor(progressPercent)}%`;
    } else {
        jobProgressBarFill.style.width = '0%';
        jobProgressText.textContent = 'No Active Job';
    }
}

function updateSkillProgressBar() {
    // console.log("updateSkillProgressBar() - Placeholder function called");
    const skillProgressBarFill = document.getElementById('skill-progress-fill');
    const skillProgressText = document.getElementById('skill-progress-text');
    
    if (!skillProgressBarFill || !skillProgressText) {
        // Elements not found, may be early in loading process
        return;
    }
    
    // Example for a currently training skill
    if (gameState.currentTrainingSkill) {
        const skill = gameState.skills[gameState.currentTrainingSkill];
        const progressPercent = (skill.progress / skill.progressNeeded) * 100;
        skillProgressBarFill.style.width = `${Math.min(100, progressPercent)}%`;
        skillProgressText.textContent = `${gameState.currentTrainingSkill} Progress: ${Math.floor(progressPercent)}%`;
    } else {
        skillProgressBarFill.style.width = '0%';
        skillProgressText.textContent = 'No Skill Training';
    }
}

// Game mechanics functions
function checkAchievements() {
    // Skip if achievements aren't loaded yet
    if (!gameState.achievements || !Array.isArray(gameState.achievements)) {
        return;
    }
    
    // Check each achievement's conditions
    gameState.achievements.forEach(achievement => {
        // Skip already unlocked achievements
        if (achievement.unlocked) {
            return;
        }
        
        let conditionsMet = true;
        
        // Handle different achievement types
        if (achievement.condition && achievement.condition.type === 'gold') {
            conditionsMet = gameState.gold >= achievement.condition.value;
        } else {
            // Simple examples of achievement conditions
            switch (achievement.id) {
                case 'first_job':
                    conditionsMet = gameState.jobsHeld && gameState.jobsHeld.length > 0;
                    break;
                case 'reach_age_30':
                    conditionsMet = gameState.age >= 30;
                    break;
                case 'earn_1000_gold':
                    conditionsMet = gameState.totalGoldEarned >= 1000;
                    break;
                case 'max_skill':
                    // Check if any skill has reached max level
                    conditionsMet = Object.values(gameState.skills).some(skill => {
                        const skillLevel = typeof skill === 'object' ? skill.level : skill;
                        return skillLevel >= 10;
                    });
                    break;
                // Add more achievement checks as needed
                default:
                    // For achievements with no specific check
                    conditionsMet = false;
            }
        }
        
        if (conditionsMet) {
            achievement.unlocked = true;
            if (typeof window.logEvent === 'function') {
                window.logEvent(`Achievement Unlocked: ${achievement.name}`, 'achievement');
            }
            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification("Achievement Unlocked", achievement.name, "success");
            }
        }
    });
}


// Placeholder for saving game data
function saveGameData() {
    //console.log("saveGameData Placeholder - Auto-saving...");
    
    // Example implementation:
    try {
        const gameData = {
            gameState: gameState,
            timestamp: Date.now(),
            version: CONFIG.version || '1.0'
        };
        
        localStorage.setItem('guezzardGameSave', JSON.stringify(gameData));
        //console.log("Game saved successfully");
    } catch (error) {
        console.error("Failed to save game:", error);
    }
}

// Make updateDaySeasonDisplay available globally
window.updateDaySeasonDisplay = updateDaySeasonDisplay;

// Export functions for module usage
export {
    gameLoop,
    startGameLoop,
    updateGameSpeedUI,
    updateEnergyDisplay,
    updateDaySeasonDisplay,
    saveGameData,
    checkAchievements,
    runEvents
};

// Make functions available on window for non-module scripts
window.gameLoop = gameLoop;
window.startGameLoop = startGameLoop;
window.updateGameSpeedUI = updateGameSpeedUI;
window.updateEnergyDisplay = updateEnergyDisplay;
window.saveGameData = saveGameData;
window.checkAchievements = checkAchievements;
window.runEvents = runEvents;