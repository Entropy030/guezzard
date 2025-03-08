// game-init.js
function initializeGame() {
    console.log("initializeGame() - game-init.js - START"); // <-- START LOG
    // Initialize gameState.purchasedItems FIRST - to prevent undefined errors
    gameState.purchasedItems = {}; // Ensure this is initialized here - INITIALIZE purchasedItems

    // Initialize basic game state values
    gameState.gold = CONFIG.settings.startingGold;
    // ... (rest of gameState initializations) ...

    // Try to load saved game data from localStorage FIRST - using renamed function
    // const savedGame = loadSavedGameData(); // Call loadSavedGameData (from save-system.js) // loadSavedGameData(); // Commented out to prevent ReferenceError
    // if (savedGame) {
    //     // ... (saved game loading logic) ...
    // } else {
        // If no saved game data, initialize UI and game components
        // Note: loadGameDataFromServer() should have already loaded the JSON data at this point

        // Initialize the game UI and components
        console.log("initializeGame() - After setInitialJob() - gameState.activeJob:", gameState.activeJob); // <-- ADD THIS LOG
        setupTabNavigation(); // Ensure this is present
        setupJobsUI();
        updateSkillDisplay();
        setupAchievementsUI();
        setupGameControls();
        setupEventLog();
        updateDisplay();
        logEvent("Started career as a Google Maps User.");
    // }  // <-- THIS BRACE IS NOW COMMENTED OUT TOO

    // Initialize UI components (placeholder functions for now)
    updateResourceDisplay();
    setupEventListeners();
    initializeTabSystem();
    checkDeviceType();

    // Set up auto-save
    setInterval(saveGameData, gameState.settings.autoSaveInterval * 1000);


    // Start game loop - This is now the central place to start the game loop - USING requestAnimationFrame
    startGameLoop(); // Call startGameLoop to initiate the animation loop
    setupShopUI(); // <-- MOVE setupShopUI(); CALL TO BE THE VERY LAST LINE - after startGameLoop()
    console.log("initializeGame() - game-init.js - END");   // <-- END LOG
    // --- Progress Bar Element References ---
    const jobProgressBarFill = document.getElementById('job-progress-fill');
    const jobProgressBarText = document.getElementById('job-progress-text');
    const skillProgressBarFill = document.getElementById('skill-progress-fill');
    const skillProgressBarText = document.getElementById('skill-progress-text');

    console.log("Progress bar elements retrieved:", jobProgressBarFill, jobProgressBarText, skillProgressBarFill, skillProgressBarText); // Debug log
}

// Placeholder UI initialization functions (define in respective modules later)
function updateResourceDisplay() {
    console.log("updateResourceDisplay Placeholder"); // Keep the console.log for now

    document.getElementById('gold-display').textContent = Math.floor(gameState.gold); // TEMPORARY - Update gold display - CORRECTED ID
    document.getElementById('age-display').textContent = Math.floor(gameState.age);   // TEMPORARY - Update age display - CORRECTED ID
    document.getElementById('life-quality-display').textContent = gameState.lifeQuality; // TEMPORARY - Update lifeQuality display - CORRECTED ID
}

function setupEventListeners() { console.log("setupEventListeners Placeholder"); }
function initializeTabSystem() { console.log("initializeTabSystem Placeholder"); }
function checkDeviceType() { console.log("checkDeviceType Placeholder"); }
// Placeholder energy display update function (define in display.js later in Phase 2)
function updateEnergyDisplay() { console.log("updateEnergyDisplay Placeholder"); }



// --- MODIFIED gameLoop FUNCTION - Now only starts the animation loop ---
function gameLoop(timestamp) {
    console.log("gameLoop tick - VERY IMPORTANT CHECK"); // Keep this log for now
    // This function is now in game-loop.js - this is just a placeholder in game-init.js

    // Request the next frame to continue the loop - THIS LINE IS CRUCIAL
    requestAnimationFrame(gameLoop);
}

// --- NEW startGameLoop FUNCTION - Starts the animation loop correctly ---
function startGameLoop() {
    console.log("startGameLoop() - game-init.js - Starting game loop with requestAnimationFrame");
    requestAnimationFrame(gameLoop); // Start the animation loop using requestAnimationFrame
}


// Placeholder loadGameData function (define in save-system.js later)
function loadGameData() { return null; }

// Placeholder saveGameData function (define in save-system.js later)
function saveGameData() { console.log("saveGameData Placeholder - Auto-saving..."); }