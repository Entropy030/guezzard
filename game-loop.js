// game-loop.js

// game-loop.js

let lastTimestamp = performance.now(); // Initialize lastTimestamp *outside* gameLoop

function gameLoop(timestamp) {
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
        gameState.ticksSinceDayStart +=1;
        advanceDay(); // Call this every tick

        updateDisplay();
        updateGameSpeedUI();
        checkAchievements();
        runEvents();
    }

    requestAnimationFrame(gameLoop);
}

function startGameLoop() {
    console.log("startGameLoop() - Starting game loop with requestAnimationFrame");
    gameLoop(performance.now()); // Start game loop with the initial timestamp
}

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

function advanceDay() {
    console.log("advanceDay() - START - day:", gameState.day, "ticksSinceDayStart:", gameState.ticksSinceDayStart, "seasonTimeLeft:", gameState.seasonTimeLeft, "ticks in one day:" , CONFIG.settings.ticksInOneGameDay);

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

    console.log("advanceDay() - END - day:", gameState.day, "ticksSinceDayStart:", gameState.ticksSinceDayStart, "seasonTimeLeft:", gameState.seasonTimeLeft);
}

function updateDisplay() {
    // console.log("updateDisplay() - START");
    const goldDisplay = document.getElementById('gold-display');
    const ageDisplay = document.getElementById('age-display');
    const lifeQualityDisplay = document.getElementById('life-quality-display');
    const currentJobNameDisplay = document.getElementById('current-job-name');
    const seasonDisplay = document.getElementById('season-display');

    if (!goldDisplay) console.error("Error: #gold-display element NOT FOUND in updateDisplay()!");
    if (!ageDisplay) console.error("Error: #age-display element NOT FOUND in updateDisplay()!");
    if (!lifeQualityDisplay) console.error("Error: #life-quality-display element NOT FOUND in updateDisplay()!");
    if (!currentJobNameDisplay) console.error("Error: #current-job-name element NOT FOUND in updateDisplay()!");
    if (!seasonDisplay) console.error("Error: #season-display element NOT FOUND in updateDisplay()!");

    if (goldDisplay) goldDisplay.textContent = Math.floor(gameState.gold);
    if (ageDisplay) ageDisplay.textContent = Math.floor(gameState.age);
    if (lifeQualityDisplay) lifeQualityDisplay.textContent = gameState.lifeQuality.toFixed(2);
    if (currentJobNameDisplay) {
        currentJobNameDisplay.textContent = gameState.activeJob ? gameState.activeJob.name : "Unemployed";
    }
    if (seasonDisplay) seasonDisplay.textContent = `Season: ${gameState.currentSeason}, Year ${gameState.year}`;

    updateJobProgressBar();
    updateSkillProgressBar();
    updateGameSpeedUI();
    // console.log("updateDisplay() - END");
}

function updateJobProgressBar() {
    // console.log("updateJobProgressBar() - Placeholder function called");
}

function updateSkillProgressBar() {
    // console.log("updateSkillProgressBar() - Placeholder function called");
}

function updateGameSpeedUI() {
    // console.log("updateGameSpeedUI Placeholder function called");
}

function updateEnergyDisplay() {
    // console.log("updateEnergyDisplay Placeholder");
}

function checkAchievements() {}
function runEvents(){}


//Placeholder
function saveGameData() {
    console.log("saveGameData Placeholder - Auto-saving...");
}