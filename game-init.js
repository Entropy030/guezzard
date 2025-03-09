// game-init.js
console.log("game-init.js - Module loading");

// We'll import from window to avoid circular dependencies
// These functions are made available globally in their respective modules
const {
    logEvent,
    setupJobsUI, 
    updateSkillDisplay, 
    setupAchievementsUI, 
    setupGameControls, 
    setupEventLog, 
    updateDisplay
} = window;

// Initialize lastTimestamp globally for game loop
window.lastTimestamp = performance.now();

async function initializeGame() {
    console.log("initializeGame() - game-init.js - START");

    try {
        // First load game data asynchronously
        await loadGameDataFromServer();

        // Set up initial UI
        if (typeof setupEventLog === 'function') {
            setupEventLog();
        } else {
            console.error("setupEventLog function not available");
        }

        if (typeof setupGameControls === 'function') {
            setupGameControls();
        } else {
            console.error("setupGameControls function not available");
        }

        if (typeof setupJobsUI === 'function') {
            setupJobsUI();
        } else {
            console.error("setupJobsUI function not available");
        }

        if (typeof updateSkillDisplay === 'function') {
            updateSkillDisplay();
        } else {
            console.error("updateSkillDisplay function not available");
        }

        if (typeof setupAchievementsUI === 'function') {
            setupAchievementsUI();
        } else {
            console.error("setupAchievementsUI function not available");
        }

        if (typeof updateDisplay === 'function') {
            updateDisplay();
        } else {
            console.error("updateDisplay function not available");
        }

        // Log game start
        if (gameState.activeJob) {
            if (typeof logEvent === 'function') {
                logEvent(`Started career as a ${gameState.activeJob.title}.`, 'game');
            } else {
                console.log(`GAME: Started career as a ${gameState.activeJob.title}.`);
            }
        } else {
            if (typeof logEvent === 'function') {
                logEvent("Started career with no job.", 'game');
            } else {
                console.log("GAME: Started career with no job.");
            }
        }

        console.log("initializeGame() - game-init.js - END");
    } catch (error) {
        console.error("Error initializing game:", error);
    }
}

async function loadGameDataFromServer() {
    console.log("loadGameDataFromServer() - Loading game data from JSON files");
    
    try {
        // Create an array of promises for each fetch
        const promises = [
            fetch("skills.json").then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load skills.json: ${response.status} ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error("Error loading skills:", error);
                return []; // Default empty array on error
            }),
            
            fetch("jobs.json").then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load jobs.json: ${response.status} ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error("Error loading jobs:", error);
                return []; // Default empty array on error
            }),
            
            fetch("achievements.json").then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load achievements.json: ${response.status} ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error("Error loading achievements:", error);
                return []; // Default empty array on error
            })
        ];

        // Wait for all promises to resolve
        const [loadedSkills, loadedJobs, loadedAchievements] = await Promise.all(promises);

        console.log("Skills data loaded:", loadedSkills);
        console.log("Jobs data loaded:", loadedJobs);
        console.log("Achievements data loaded:", loadedAchievements);

        // Initialize skills
        // First ensure skills object exists
        if (!gameState.skills) {
            gameState.skills = {};
        }
        
        // Process loaded skills
        if (Array.isArray(loadedSkills)) {
            loadedSkills.forEach(skill => {
                if (skill && skill.name) {
                    gameState.skills[skill.name] = {
                        level: gameState.skills[skill.name] || 0,
                        description: skill.description || '',
                        icon: skill.icon || ''
                    };
                }
            });
        }

        // Ensure core skills always exist
        if (!gameState.skills.hasOwnProperty("Map Awareness")) {
            gameState.skills["Map Awareness"] = { level: 1 };
        }

        // Initialize jobs
        gameState.jobs = Array.isArray(loadedJobs) ? loadedJobs : [];

        // Initialize achievements
        gameState.achievements = Array.isArray(loadedAchievements) ? loadedAchievements : [];

        console.log("loadGameDataFromServer() - Game data loaded and processed successfully.");
    } catch (error) {
        console.error("Error in loadGameDataFromServer:", error);
        // Create default data if loading fails
        if (!gameState.skills) {
            gameState.skills = { "Map Awareness": { level: 1 } };
        }
        if (!gameState.jobs) {
            gameState.jobs = [];
        }
        if (!gameState.achievements) {
            gameState.achievements = [];
        }
    }
}

// Function to start the game loop
function startGameLoop() {
    console.log("startGameLoop() - Starting game loop with requestAnimationFrame");
    
    // Ensure lastTimestamp is defined globally
    window.lastTimestamp = performance.now();
    
    // Call the game loop if it's available globally
    if (typeof window.gameLoop === 'function') {
        window.gameLoop(window.lastTimestamp);
    } else {
        console.error("gameLoop function is not available globally!");
    }
}

// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded event - Starting game initialization after DOM is ready.");

    try {
        // Initialize Game
        await initializeGame();

        // Start Game Loop
        startGameLoop();

        console.log("DOMContentLoaded event - Game initialization completed.");
    } catch (error) {
        console.error("Error during game initialization:", error);
    }
});

// Make functions available globally for non-module scripts
window.initializeGame = initializeGame;
window.loadGameDataFromServer = loadGameDataFromServer;
window.startGameLoop = startGameLoop;

console.log("game-init.js - Module loaded successfully");