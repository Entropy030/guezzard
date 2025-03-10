// game-loop.js - Fixed version

// Variables for game loop timing
let lastTimestamp = 0;

// Main game loop function
function gameLoop(timestamp) {
    console.log("gameLoop tick"); // Keep this for debugging

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

    console.log("deltaTime:", deltaTime, "effectiveTickRate:", effectiveTickRate); // Log these values

    if (deltaTime >= effectiveTickRate) {
        lastTimestamp = timestamp;  // Update lastTimestamp ONLY when a tick occurs

        // Regenerate energy
        regenerateEnergy();

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
        if (typeof window.updateGameSpeedUI === 'function') {
            window.updateGameSpeedUI();
        }
        
        // Check for achievements
        checkAchievements();
        
        // Run random events
        runEvents();
    }

    requestAnimationFrame(gameLoop);
}

// Function to start the game loop
function startGameLoop() {
    console.log("startGameLoop() - Starting game loop with requestAnimationFrame");
    lastTimestamp = 0; // Reset lastTimestamp
    requestAnimationFrame(gameLoop);
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

// Modified advanceDay function to update day display without filling event log
function advanceDay() {
    console.log("advanceDay() - START - day:", gameState.day, "ticksSinceDayStart:", gameState.ticksSinceDayStart, 
                "seasonTimeLeft:", gameState.seasonTimeLeft, "ticks in one day:", CONFIG.settings.ticksInOneGameDay);

    if (gameState.gamePaused) {
        console.log("advanceDay() - Game is paused");
        return;
    }

    gameState.ticksSinceDayStart++; // Increment at the beginning

    if (gameState.ticksSinceDayStart >= CONFIG.settings.ticksInOneGameDay) {
        gameState.day++;
        gameState.ticksSinceDayStart = 0; // Reset at the START of the new day
        
        // Update day display instead of logging to event log
        updateDaySeasonDisplay();
        
        console.log("advanceDay() - Day advanced to:", gameState.day);
    }

    // Calculate season length in days
    const seasonLengthInDays = CONFIG.settings.seasonDuration / CONFIG.settings.ticksInOneGameDay;

    if (gameState.day > seasonLengthInDays) {
        console.log("advanceDay() - End of season reached", gameState.day, gameState.currentSeason, gameState.year);
        gameState.day = 1; // Reset day
        gameState.seasonNumber++;

        const seasons = ["Spring", "Summer", "Autumn", "Winter"]; // Array for easier cycling

        gameState.currentSeason = seasons[(gameState.seasonNumber) % seasons.length];

        if (gameState.currentSeason === "Spring") {
           gameState.year++; // New year starts in Spring
            if (gameState.age >= CONFIG.settings.maxAge) {
               if (typeof window.endGame === 'function') {
                   window.endGame();
               }
               return; // Stop after endgame
            }
        }
        
        gameState.seasonTimeLeft = CONFIG.settings.seasonDuration; // Reset at the END of season
        
        // Don't log season change to event log anymore
        // Just update the display
        updateDaySeasonDisplay();
        
        console.log("advanceDay() - New Season:", gameState.currentSeason, "New Year:", gameState.year);
    }

    gameState.timePlayedSeconds++;
    saveGameData();

    console.log("advanceDay() - END - day:", gameState.day, "ticksSinceDayStart:", gameState.ticksSinceDayStart, 
                "seasonTimeLeft:", gameState.seasonTimeLeft);
}

// Function to update the day-season display
function updateDaySeasonDisplay() {
    const seasonDisplay = document.getElementById('season-display');
    if (seasonDisplay) {
        // Format: "Day X, Season, Year Y"
        seasonDisplay.textContent = `Day ${gameState.day}, ${gameState.currentSeason}, Year ${gameState.year}`;
    }
}

// Update the original game-loop exports to include this function
if (typeof window.updateDaySeasonDisplay !== 'function') {
    window.updateDaySeasonDisplay = updateDaySeasonDisplay;
}

// Also update the original advanceDay function if it's defined
if (typeof window.gameLoop === 'function') {
    // Store original gameLoop
    const originalGameLoop = window.gameLoop;
    
    // Replace with our version that uses the updated advanceDay
    window.gameLoop = function(timestamp) {
        console.log("gameLoop tick - using modified version"); // Keep this for debugging

        if (gameState.gamePaused) {
            requestAnimationFrame(gameLoop);
            return;
        }

        // Initialize lastTimestamp if it's the first call
        if (!window.lastTimestamp) {
            window.lastTimestamp = timestamp;
        }

        const effectiveTickRate = 1000 / (CONFIG.settings.tickInterval * gameState.gameSpeed);
        const deltaTime = timestamp - window.lastTimestamp;

        if (deltaTime >= effectiveTickRate) {
            window.lastTimestamp = timestamp;  // Update lastTimestamp ONLY when a tick occurs

            // Call our improved advanceDay instead of the original
            advanceDay();
            
            // Rest of the game loop logic remains the same
            if (typeof window.regenerateEnergy === 'function') {
                window.regenerateEnergy();
            }
            
            // Process job progress (if player has a job)
            if (typeof window.processJobProgress === 'function' && gameState.activeJob) {
                window.processJobProgress(deltaTime);
            }

            // Update UI
            if (typeof window.updateDisplay === 'function') {
                window.updateDisplay();
            }
            if (typeof window.updateGameSpeedUI === 'function') {
                window.updateGameSpeedUI();
            }
            
            // Check for achievements
            if (typeof window.checkAchievements === 'function') {
                window.checkAchievements();
            }
            
            // Run random events
            if (typeof window.runEvents === 'function') {
                window.runEvents();
            }
        }

        requestAnimationFrame(gameLoop);
    };
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

function runEvents() {
    // Skip if game is paused
    if (gameState.gamePaused) {
        return;
    }
    
    // Random chance for an event to trigger (adjust probability as needed)
    if (Math.random() < CONFIG.settings.eventChance / 100) { // Convert percentage to decimal
        triggerRandomEvent();
    }
}

function triggerRandomEvent() {
    // Example list of random events
    const events = [
        { 
            name: "Lucky day", 
            action: () => {
                const bonus = Math.floor(20 + Math.random() * 50);
                gameState.gold += bonus;
                if (typeof window.logEvent === 'function') {
                    window.logEvent(`Lucky day! You found ${bonus} gold.`, 'event');
                }
            }
        },
        { 
            name: "Skill insight", 
            action: () => {
                // Choose a random skill
                const skillNames = Object.keys(gameState.skills);
                if (skillNames.length === 0) return;
                
                const randomSkill = skillNames[Math.floor(Math.random() * skillNames.length)];
                const bonusProgress = Math.floor(10 + Math.random() * 30);
                
                // Add progress to the skill
                let skill;
                if (typeof gameState.skills[randomSkill] === 'object') {
                    skill = gameState.skills[randomSkill];
                    skill.progress = (skill.progress || 0) + bonusProgress;
                } else {
                    // Initialize skill progress if needed
                    if (!gameState.skillProgress) {
                        gameState.skillProgress = {};
                    }
                    
                    if (!gameState.skillProgress[randomSkill]) {
                        gameState.skillProgress[randomSkill] = 0;
                    }
                    
                    gameState.skillProgress[randomSkill] += bonusProgress;
                    
                    // Get current skill level
                    const skillLevel = gameState.skills[randomSkill] || 0;
                    const progressNeeded = 10 + (skillLevel * 5);
                    
                    // Check for level up
                    if (gameState.skillProgress[randomSkill] >= progressNeeded) {
                        gameState.skills[randomSkill] = skillLevel + 1;
                        gameState.skillProgress[randomSkill] = 0;
                        
                        if (typeof window.logEvent === 'function') {
                            window.logEvent(`Skill insight! Your ${randomSkill} skill increased to level ${gameState.skills[randomSkill]}.`, 'skill');
                        }
                    } else {
                        if (typeof window.logEvent === 'function') {
                            window.logEvent(`Skill insight! You gained ${bonusProgress} progress towards ${randomSkill}.`, 'skill');
                        }
                    }
                    
                    return;
                }
                
                // Check if skill leveled up (for object-based skills)
                const progressNeeded = 10 + ((skill.level || 0) * 5);
                
                if (skill.progress >= progressNeeded) {
                    skill.level = (skill.level || 0) + 1;
                    skill.progress = 0;
                    
                    if (typeof window.logEvent === 'function') {
                        window.logEvent(`Skill insight! Your ${randomSkill} skill increased to level ${skill.level}.`, 'skill');
                    }
                } else {
                    if (typeof window.logEvent === 'function') {
                        window.logEvent(`Skill insight! You gained ${bonusProgress} progress towards ${randomSkill}.`, 'skill');
                    }
                }
            }
        },
        // Add more events as needed
    ];
    
    // Choose a random event and execute it
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    randomEvent.action();
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

// Export functions for module usage
export {
    gameLoop,
    startGameLoop,
    updateGameSpeedUI,
    updateEnergyDisplay,
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