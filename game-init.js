// game-init.js
import { 
    logEvent,
    setupJobsUI, 
    updateSkillDisplay, 
    setupAchievementsUI, 
    setupGameControls, 
    setupEventLog, 
    updateDisplay 
} from './ui-setup.js';

import { loadGameDataFromServer } from './enhanced-script.js';

async function initializeGame() {
    console.log("initializeGame() - game-init.js - START");

    if (gameState.activeJob) { // Check for active job to prevent "undefined" errors
        logEvent(`Started career as a ${gameState.activeJob.title}.`, 'game'); // Log only ONCE here
    } else {
        logEvent("Started career with no job.", 'game');
    }

    setupJobsUI();
    updateSkillDisplay();
    setupAchievementsUI();
    setupGameControls();
    setupEventLog();
    updateDisplay();

    console.log("initializeGame() - game-init.js - END");
}

// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded event - Starting game initialization after DOM is ready.");

    // 1. Load Data (Asynchronously)
    await loadGameDataFromServer(); // Await data loading - ONLY ONCE HERE

    // 3. Initialize Game (AFTER data AND initial job are set)
    await initializeGame(); // Await game initialization

    // 4. Start Game Loop (AFTER initialization)
    startGameLoop();

    // 5. Retrieve Progress Bar Elements 
    const jobProgressBarFill = document.querySelector('.progressFill');
    const jobProgressText = document.querySelector('.progress-text.name');
    const skillProgressBarFill = document.querySelector('#skill-progress-fill');
    const skillProgressText = document.querySelector('#skill-progress-text');
    console.log("Progress bar elements retrieved (DOM ready):", jobProgressBarFill, jobProgressText, skillProgressBarFill, skillProgressText);

    console.log("DOMContentLoaded event - Game initialization completed.");
});

function startGameLoop() {
    console.log("startGameLoop() - Starting game loop with requestAnimationFrame");
    lastTimestamp = performance.now();
    gameLoop(lastTimestamp);
}

// Make the initialization function available globally
window.initializeGame = initializeGame;
window.startGameLoop = startGameLoop;