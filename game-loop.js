// game-loop.js
let lastTimestamp = 0;
const BASE_TICK_RATE = 1000; // milliseconds per base game tick
let TICK_RATE = BASE_TICK_RATE; // Initialize TICK_RATE with BASE_TICK_RATE
let effectiveTickRate; // Declare effectiveTickRate outside the if block


function gameLoop(timestamp) {
    // console.log("gameLoop tick - VERY IMPORTANT CHECK"); // KEEP THIS LOG

    // console.log("gameLoop() - gameState:", gameState); // COMMENT OUT - REDUCED LOGS
    // console.log("gameLoop() - gamePaused:", gameState.gamePaused, "gameSpeed:", gameState.gameSpeed); // COMMENT OUT - REDUCED LOGS
    // console.log("gameLoop() - effectiveTickRate:", effectiveTickRate); // COMMENT OUT - REDUCED LOGS
    // console.log("gameLoop() - TICK_RATE:", TICK_RATE); // COMMENT OUT - REDUCED LOGS
    // console.log("gameLoop() - deltaTime:", deltaTime); // COMMENT OUT - REDUCED LOGS
    // console.log("gameLoop() - lastTimestamp:", lastTimestamp); // COMMENT OUT - REDUCED LOGS


    if (gameState.gamePaused) {
        console.log("gameLoop() - Game is PAUSED - Exiting tick early");
        requestAnimationFrame(gameLoop);
        return;
    }

    // --- SPEED CONTROL LOGIC ---
    effectiveTickRate = BASE_TICK_RATE / gameState.gameSpeed; // Calculate effective tick rate

    const deltaTime = timestamp - lastTimestamp;
    // console.log("gameLoop() - deltaTime:", deltaTime); // COMMENT OUT - REDUCED LOGS
    // console.log("gameLoop() - lastTimestamp:", lastTimestamp); // COMMENT OUT - REDUCED LOGS


    if (deltaTime >= effectiveTickRate) { // Use effectiveTickRate in deltaTime check
        // Update game time
        lastTimestamp = timestamp;

        regenerateEnergy(); // Call energy regeneration  <--- regenerateEnergy() is called HERE

        advanceDay(); // Advance the game day

        tick(); // <---------------------- TICK() FUNCTION CALL HERE

        updateDisplay(); // Update UI elements
    }

    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

function regenerateEnergy() {
    console.log("regenerateEnergy() - START - Current energy:", gameState.energy, "maxEnergy:", gameState.maxEnergy); // LOG START VALUES

    // Calculate energy regen rate (base + bonuses)
    const energyRegenBase = 1;
    const prestigeBonus = gameState.prestigeLevel * 0.2;
    const regenRate = energyRegenBase + prestigeBonus;
    console.log("regenerateEnergy() - Calculated regenRate:", regenRate); // LOG regenRate

    // Add energy
    let newEnergy = gameState.energy + regenRate; // Calculate new energy value
    console.log("regenerateEnergy() - Calculated newEnergy (before min/max):", newEnergy); // LOG newEnergy before min/max

    gameState.energy = Math.min(gameState.maxEnergy, newEnergy); // Apply min/max and update gameState.energy
    console.log("regenerateEnergy() - Calculated gameState.energy (after min/max):", gameState.energy); // LOG gameState.energy AFTER UPDATE

    // Update energy display - Placeholder function in game-init.js for now
    updateEnergyDisplay(); // Make sure this is defined or remove call if not needed in Phase 1

    console.log("regenerateEnergy() - END - New energy:", gameState.energy); // LOG END VALUE
}


function advanceDay() {
    console.log("advanceDay() - START - Current Day:", gameState.day, "Current Age:", gameState.age); // LOG START VALUES

    console.log("advanceDay() - Incrementing day...");
    gameState.day++; // Increment day
    console.log("advanceDay() - Day incremented - New Day (before year check):", gameState.day); // LOG DAY AFTER INCREMENT

    if (gameState.day > 365) { // Add age increment logic here
        console.log("advanceDay() - Day > 365 - Incrementing age...");
        gameState.age++;       // Increment age by 1 year
        gameState.day = 1;     // Reset day to 1 for the new year
        logEvent(`Year ${gameState.age - 18 + 1999} begins. Age ${gameState.age}.`, 'time'); // Log year and age - MODIFIED LOG MESSAGE
        console.log("advanceDay() - Age incremented, Day reset - New Age:", gameState.age, "New Day:", gameState.day); // LOG AGE AND DAY AFTER YEAR INCREMENT
    } else {
        logEvent(`Day ${gameState.day} begins.`, 'time'); // Keep existing day log
    }

    // Update game state for new day
    gameState.statistics.timePlayedSeconds += TICK_RATE / 1000;
    console.log("advanceDay() - Updated timePlayedSeconds:", gameState.statistics.timePlayedSeconds); // LOG timePlayedSeconds

    // Auto-save game data on day change
    saveGameData(); // Call saveGameData to auto-save on day change

    console.log("advanceDay() - END - New Day:", gameState.day, "New Age:", gameState.age); // LOG END VALUES
}


function updateTimeDisplay() {
    const dayDisplay = document.getElementById('day-counter');
    if (dayDisplay) {
        dayDisplay.textContent = `Day ${gameState.day}`;
    }
}

function updateResourceDisplay() {
    // Update gold display
    const goldDisplay = document.getElementById('gold-display'); // CORRECTED ID
    if (goldDisplay) {
        goldDisplay.textContent = Math.floor(gameState.gold).toLocaleString();
    }

    // Update energy display
    const energyDisplay = document.getElementById('energy-display'); // CORRECTED ID
    if (energyDisplay) {
        energyDisplay.textContent = Math.floor(gameState.energy) + "/" + gameState.maxEnergy;
    }
}