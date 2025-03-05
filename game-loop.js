// game-loop.js
let lastTimestamp = 0;
const TICK_RATE = 1000; // milliseconds per tick


function gameLoop(timestamp) {
    console.log("gameLoop tick - VERY IMPORTANT CHECK");
    // Calculate delta time (time since last frame)
    const deltaTime = timestamp - lastTimestamp;
    
    // Only update on appropriate intervals
    if (deltaTime >= TICK_RATE) {
        // Update game time
        lastTimestamp = timestamp;
        
        // Regenerate energy
        regenerateEnergy();
        
        // Check for random events
        if (gameState.day > 0 && gameState.day % 5 === 0) {
            const event = checkForRandomEvent();
            if (event) {
                displayEventModal(event);
            }
        }
        
        // Check achievements
        checkAchievements();
        
        // Update life quality score
        calculateLifeQualityScore();
        
        // Update game time display
        updateTimeDisplay();
        
        // Check for daily rewards
        if (gameState.day % 4 === 0) { // In-game days as example, could use real time
            displayDailyRewardModal();
        }
    }
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}


function regenerateEnergy() {
    // Calculate energy regen rate (base + bonuses)
    const energyRegenBase = 1;
    const prestigeBonus = gameState.prestigeLevel * 0.2;
    const regenRate = energyRegenBase + prestigeBonus;
    
    // Add energy
    gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + regenRate);
    
    // Update energy display
    updateEnergyDisplay();
}


function advanceDay() {
    gameState.day++;
    
    // Update game state for new day
    gameState.statistics.timePlayedSeconds += TICK_RATE / 1000;
    
    // Daily resource updates (if any)
    // ...
    
    // Log day change
    logEvent(`Day ${gameState.day} begins.`, 'time');
    
    // Save game on day change
    saveGameData();
}


function updateTimeDisplay() {
    const dayDisplay = document.getElementById('day-counter');
    if (dayDisplay) {
        dayDisplay.textContent = `Day ${gameState.day}`;
    }
}


function updateResourceDisplay() {
    // Update gold display
    const goldDisplay = document.getElementById('gold-counter');
    if (goldDisplay) {
        goldDisplay.textContent = gameState.gold.toLocaleString();
    }
    
    // Update energy display
    const energyDisplay = document.getElementById('energy-counter');
    if (energyDisplay) {
        energyDisplay.textContent = Math.floor(gameState.energy) + "/" + gameState.maxEnergy;
    }
}