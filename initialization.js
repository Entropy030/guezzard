// initialization.js - Primary entry point for game initialization

console.log("initialization.js - Starting game initialization");

// Import core systems
import { 
  initializeGameState, 
  loadGameState,
  loadGameData,
  setupGameSystems,
  initializeUI,
  startGameLoop, 
  startAutoSave
} from './core/core.js';

// Execute initialization when document is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM loaded, starting game initialization");
  
  try {
    // Step 1: Initialize game state
    initializeGameState();
    console.log("Game state initialized");

    // Step 2: Load saved game if exists
    try {
      const savedGame = loadGameState();
      if (savedGame) {
        Object.assign(window.gameState, savedGame);
        console.log("Saved game loaded successfully");
      }
    } catch (error) {
      console.error("Error loading saved game:", error);
    }

    // Step 3: Load game data
    await loadGameData();
    console.log("Game data loaded");

    // Step 4: Initialize UI system
    initializeUI();
    console.log("UI system initialized");

    // Step 5: Initialize game systems
    setupGameSystems();
    console.log("Game systems initialized");

    // Step 6: Start game loop
    startGameLoop();
    console.log("Game loop started");

    // Step 7: Initial UI update
    if (typeof window.updateAllDisplays === 'function') {
      window.updateAllDisplays();
    }

    // Step 8: Start auto-save
    startAutoSave(30); // Auto-save every 30 seconds

    // Welcome message
    if (typeof window.logEvent === 'function') {
      window.logEvent("Welcome to Guezzard! Start your career journey now.", 'system');
    }
    
    console.log("Game initialization completed successfully");
  } catch (error) {
    console.error("Failed to initialize game:", error);
    
    // Show error notification
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification("Failed to initialize game. Please refresh the page.");
    }
  }
});