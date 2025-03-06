 // game-init.js
 function initializeGame() {
    console.log("initializeGame() - game-init.js - START"); // <-- START LOG

    // Initialize gameState.purchasedItems FIRST - to prevent undefined errors
    gameState.purchasedItems = {}; // Ensure this is initialized here - INITIALIZE purchasedItems

    // Initialize basic game state values
    gameState.gold = CONFIG.settings.startingGold;
    // ... (rest of gameState initializations) ...

    // Try to load saved game data from localStorage FIRST - using renamed function
    const savedGame = loadSavedGameData(); // Call loadSavedGameData (from save-system.js)
    if (savedGame) {
        // ... (saved game loading logic) ...
    } else {
        // If no saved game data, initialize UI and game components
        // Note: loadGameDataFromServer() should have already loaded the JSON data at this point

        // Initialize the game UI and components
        setInitialJob();
        setupTabNavigation();
        setupJobsUI(); // <-- MOVE setupShopUI(); CALL TO THE VERY END OF initializeGame()
        updateSkillDisplay();
        setupAchievementsUI();
        setupGameControls();
        setupEventLog();
        updateDisplay();
        logEvent("Started career as a Google Maps User.");
    }

    // Initialize UI components (placeholder functions for now)
    updateResourceDisplay();
    setupEventListeners();
    initializeTabSystem();
    checkDeviceType();

    // Set up auto-save
    setInterval(saveGameData, gameState.settings.autoSaveInterval * 1000);

    // Initialize audio system
    initializeAudio();

    // Start game loop - This is now the central place to start the game loop - USING requestAnimationFrame
    startGameLoop(); // Call startGameLoop to initiate the animation loop
    setupShopUI(); // <-- MOVE setupShopUI(); CALL TO BE THE VERY LAST LINE - after startGameLoop()
    console.log("initializeGame() - game-init.js - END");   // <-- END LOG
}

// Placeholder UI initialization functions (define in respective modules later)
function updateResourceDisplay() {
    console.log("updateResourceDisplay Placeholder"); // Keep the console.log for now

    document.getElementById('gold').textContent = Math.floor(gameState.gold); // TEMPORARY - Update gold display
    document.getElementById('age').textContent = Math.floor(gameState.age);   // TEMPORARY - Update age display
    document.getElementById('lifeQuality').textContent = gameState.lifeQuality; // TEMPORARY - Update lifeQuality display
}

function setupEventListeners() { console.log("setupEventListeners Placeholder"); }
function initializeTabSystem() { console.log("initializeTabSystem Placeholder"); }
function checkDeviceType() { console.log("checkDeviceType Placeholder"); }
// Placeholder energy display update function (define in display.js later in Phase 2)
function updateEnergyDisplay() { console.log("updateEnergyDisplay Placeholder"); }

// Placeholder audio initialization function (define in audio.js later)
function initializeAudio() { console.log("initializeAudio Placeholder"); }


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