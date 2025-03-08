// game-init.js
function initializeGame() {
    console.log("initializeGame() - game-init.js - START");

    // Initialize gameState.purchasedItems FIRST - to prevent undefined errors
    gameState.purchasedItems = {};

    // Initialize basic game state values
    gameState.gold = CONFIG.settings.startingGold;
    // ... (rest of gameState initializations -  You might have more here, keep them) ...

    gameState.gameStats = { // <-- ADD THIS LINE - INITIALIZE gameState.gameStats!
        totalGoldEarned: 0,
        itemsPurchased: 0,
        careerChanges: 0,
        achievementsUnlocked: 0,
        playTimeSeconds: 0
    };


    console.log("initializeGame() - BEFORE setInitialJob() - gameState.activeJob:", gameState.activeJob);

    setInitialJob();

    console.log("initializeGame() - AFTER setInitialJob() - gameState.activeJob:", gameState.activeJob);
    console.log("initializeGame() - AFTER setupTabNavigation() - gameState.activeJob:", gameState.activeJob);
    setupTabNavigation();
    setupJobsUI();
    console.log("initializeGame() - AFTER setupJobsUI() - gameState.activeJob:", gameState.activeJob);
    updateSkillDisplay();
    console.log("initializeGame() - AFTER updateSkillDisplay() - gameState.activeJob:", gameState.activeJob);
    setupAchievementsUI();
    console.log("initializeGame() - AFTER setupAchievementsUI() - gameState.activeJob:", gameState.activeJob);
    setupGameControls();
    console.log("initializeGame() - AFTER setupGameControls() - gameState.activeJob:", gameState.activeJob);
    setupEventLog();
    console.log("initializeGame() - AFTER setupEventLog() - gameState.activeJob:", gameState.activeJob);
    updateDisplay();
    console.log("initializeGame() - AFTER updateDisplay() - gameState.activeJob:", gameState.activeJob);
    logEvent("Started career as a Google Maps User.");
    // }  // <-- THIS BRACE IS NOW COMMENTED OUT TOO - Keep this commented out if it was before

    // Initialize UI components (placeholder functions for now)
    updateResourceDisplay();
    setupEventListeners();
    initializeTabSystem();
    checkDeviceType();

    // Set up auto-save
    setInterval(saveGameData, gameState.settings.autoSaveInterval * 1000);

    // Start game loop - This is now the central place to start the game loop - USING requestAnimationFrame
    startGameLoop();
    setupShopUI();
    console.log("initializeGame() - game-init.js - END");
    // --- Progress Bar Element References ---
    const jobProgressBarFill = document.getElementById('job-progress-fill');
    const jobProgressBarText = document.getElementById('job-progress-text');
    const skillProgressBarFill = document.getElementById('skill-progress-fill');
    const skillProgressBarText = document.getElementById('skill-progress-text');

    console.log("Progress bar elements retrieved:", jobProgressBarFill, jobProgressBarText, skillProgressBarFill, skillProgressBarText);
}


function updateResourceDisplay() {
    console.log("updateResourceDisplay Placeholder");
    document.getElementById('gold-display').textContent = Math.floor(gameState.gold);
    document.getElementById('age-display').textContent = Math.floor(gameState.age);
    document.getElementById('life-quality-display').textContent = gameState.lifeQuality;
}

function setupEventListeners() { console.log("setupEventListeners Placeholder"); }
function initializeTabSystem() { console.log("initializeTabSystem Placeholder"); }
function checkDeviceType() { console.log("checkDeviceType Placeholder"); }
function updateEnergyDisplay() { console.log("updateEnergyDisplay Placeholder"); }


// --- MODIFIED gameLoop FUNCTION - Now only starts the animation loop ---
function gameLoop(timestamp) {
    console.log("gameLoop tick - VERY IMPORTANT CHECK");
    requestAnimationFrame(gameLoop);
}

// --- NEW startGameLoop FUNCTION ---
function startGameLoop() {
    console.log("startGameLoop() - game-init.js - Starting game loop with requestAnimationFrame");
    requestAnimationFrame(gameLoop);
}


function loadGameData() { return null; }
function saveGameData() { console.log("saveGameData Placeholder - Auto-saving..."); }