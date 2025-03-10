// function-loader.js
// This script ensures all critical game functions are available
// Add it as the last script in your HTML

(function() {
  console.log("Function loader - Checking for critical game functions");
  
  // Wait for the DOM to be fully loaded
  window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      // Check if critical functions exist
      const missingFunctions = [];
      
      const requiredFunctions = [
        'gameLoop',
        'startGameLoop',
        'updateDisplay',
        'updateDaySeasonDisplay',
        'setupEventLog',
        'setupGameControls',
        'setupJobsUI',
        'updateSkillDisplay'
      ];
      
      requiredFunctions.forEach(function(func) {
        if (typeof window[func] !== 'function') {
          console.error(`Critical function ${func} is missing`);
          missingFunctions.push(func);
        }
      });
      
      if (missingFunctions.length > 0) {
        console.error("Missing critical functions:", missingFunctions);
        alert("Game initialization error: Some game functions failed to load. Check the console for details.");
      } else {
        console.log("All critical functions are available");
        
        // Check if game is already running
        if (!window.gameStarted) {
          console.log("Starting game manually");
          window.gameStarted = true;
          
          // Initialize UI elements
          if (typeof window.setupEventLog === 'function') {
            window.setupEventLog();
          }
          
          if (typeof window.setupGameControls === 'function') {
            window.setupGameControls();
          }
          
          // Start game loop
          if (typeof window.startGameLoop === 'function') {
            window.startGameLoop();
          }
        }
      }
    }, 500); // Short delay to make sure everything has had a chance to load
  });
})();