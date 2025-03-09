// game-loop.js

import { 
    logEvent, 
    updateDisplay 
} from './ui-setup.js';

// Variables for game loop timing
let lastTimestamp = performance.now(); // Initialize lastTimestamp outside gameLoop

// Main game loop function
export function gameLoop(timestamp) {
    console.log("gameLoop tick"); // Keep this for debugging

    if (gameState.gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    const effectiveTickRate = 1000 / (CONFIG.settings.tickInterval * gameState.gameSpeed);
    const deltaTime = timestamp - lastTimestamp;

    console.log("deltaTime:", deltaTime, "effectiveTickRate:", effectiveTickRate); // Log these values

    if (deltaTime >= effectiveTickRate) {
        lastTimestamp = timestamp;  // Update lastTimestamp ONLY when a tick occurs

        regenerateEnergy();

        if (gameState.seasonTimeLeft > 0) {
            // ... (Your existing time allocation logic within a season)
        } else {
            // Season End & Transition
            gameState.seasonTimeLeft = CONFIG.settings.seasonDuration; 
        }
        gameState.ticksSinceDayStart += 1;
        advanceDay(); // Call this every tick

        updateDisplay();
        updateGameSpeedUI();
        checkAchievements();
        runEvents();
    }

    requestAnimationFrame(gameLoop);
}

// Function to start the game loop
export function startGameLoop() {
    console.log("startGameLoop() - Starting game loop with requestAnimationFrame");
    lastTimestamp = performance.now(); // Set initial timestamp
    gameLoop(lastTimestamp);
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

// Function to advance game days
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
        logEvent(`Day ${gameState.day} begins. Season: ${gameState.currentSeason}, Year ${gameState.year}`, 'time');
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
               endGame();
               return; // Stop after endgame
            }
        }
        
        gameState.seasonTimeLeft = CONFIG.settings.seasonDuration; // Reset at the END of season
        logEvent(`Season changed to ${gameState.currentSeason}, Year ${gameState.year}. Day 1 of new season.`, 'season');
        console.log("advanceDay() - New Season:", gameState.currentSeason, "New Year:", gameState.year);
    }

    gameState.timePlayedSeconds++;
    saveGameData();

    console.log("advanceDay() - END - day:", gameState.day, "ticksSinceDayStart:", gameState.ticksSinceDayStart, 
                "seasonTimeLeft:", gameState.seasonTimeLeft);
}

// UI update functions
function updateGameSpeedUI() {
    // console.log("updateGameSpeedUI Placeholder function called");
    const gameSpeedDisplay = document.getElementById('game-speed-display');
    if (gameSpeedDisplay) {
        gameSpeedDisplay.textContent = `${gameState.gameSpeed}x`;
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
                conditionsMet = Object.values(gameState.skills).some(skill => skill.level >= 10);
                break;
            // Add more achievement checks as needed
            default:
                conditionsMet = false;
        }
        
        if (conditionsMet) {
            achievement.unlocked = true;
            logEvent(`Achievement Unlocked: ${achievement.name}`, 'achievement');
            // You might want to show a notification or update UI
        }
    });
}

function runEvents() {
    // Skip if game is paused
    if (gameState.gamePaused) {
        return;
    }
    
    // Random chance for an event to trigger (adjust probability as needed)
    if (Math.random() < 0.01) { // 1% chance per tick
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
                logEvent(`Lucky day! You found ${bonus} gold.`, 'event');
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
                const skill = gameState.skills[randomSkill];
                skill.progress = (skill.progress || 0) + bonusProgress;
                
                // Check if skill leveled up
                if (skill.progress >= skill.progressNeeded) {
                    skill.level = (skill.level || 0) + 1;
                    skill.progress = 0;
                    logEvent(`Skill insight! Your ${randomSkill} skill increased to level ${skill.level}.`, 'skill');
                } else {
                    logEvent(`Skill insight! You gained ${bonusProgress} progress towards ${randomSkill}.`, 'skill');
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
    console.log("saveGameData Placeholder - Auto-saving...");
    
    // Example implementation:
    const gameData = {
        gameState: gameState,
        timestamp: Date.now(),
        version: CONFIG.version
    };
    
    try {
        localStorage.setItem('gameSave', JSON.stringify(gameData));
        console.log("Game saved successfully");
    } catch (error) {
        console.error("Failed to save game:", error);
    }
}

// Import endGame function from ui-setup.js and make it available
import { endGame } from './ui-setup.js';

// Export needed functions for use in other modules
export {
    updateDisplay,
    updateGameSpeedUI,
    updateEnergyDisplay,
    saveGameData
};

// Also make functions available on window for non-module scripts
window.gameLoop = gameLoop;
window.startGameLoop = startGameLoop;
window.updateDisplay = updateDisplay;
window.updateGameSpeedUI = updateGameSpeedUI;
window.updateEnergyDisplay = updateEnergyDisplay;
window.saveGameData = saveGameData;