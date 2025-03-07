// game-loop.js
let lastTimestamp = 0;
const TICK_RATE = 1000; // milliseconds per tick

function gameLoop(timestamp) {
    console.log("gameLoop tick - VERY IMPORTANT CHECK");
    console.log("gameLoop() - gameState:", gameState);

    const deltaTime = timestamp - lastTimestamp;
    console.log("gameLoop() - deltaTime:", deltaTime); // <-- ADD THIS LOG
    console.log("gameLoop() - TICK_RATE:", TICK_RATE);   // <-- ADD THIS LOG
    console.log("gameLoop() - lastTimestamp:", lastTimestamp); // <-- ADD THIS LOG

    if (deltaTime >= TICK_RATE) {
        // Update game time
        lastTimestamp = timestamp; // <-- Update lastTimestamp - SHOULD BE CORRECT

        // ... (rest of game loop logic) ...
        advanceDay();
        // ... (rest of game loop logic) ...
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
        goldDisplay.textContent = Math.floor(gameState.gold).toLocaleString();
    }

    // Update energy display
    const energyDisplay = document.getElementById('energy-counter');
    if (energyDisplay) {
        energyDisplay.textContent = Math.floor(gameState.energy) + "/" + gameState.maxEnergy;
    }
}