// initialization.js - Unified initialization system for Guezzard game
console.log("initialization.js - Starting game initialization");

/**
 * Main game initialization function
 * This consolidates functionality from:
 * - game-init.js
 * - integration-script.js
 * - enhanced-script.js
 * - skill-system-integration.js
 * - system-integration.js
 */
async function initializeGame() {
    console.log("initializeGame() - Starting game initialization");

    try {
        // Step 1: Initialize game state
        initializeGameState();
        console.log("Game state initialized");

        // Step 2: Load game data
        await loadGameData();
        console.log("Game data loaded");

        // Step 3: Initialize UI system
        initializeUI();
        console.log("UI system initialized");

        // Step 4: Initialize job system
        initializeJobSystem();
        console.log("Job system initialized");

        // Step 5: Initialize skill system
        initializeSkillSystem();
        console.log("Skill system initialized");

        // Step 6: Initialize other systems (prestige, weather, etc.)
        initializeOtherSystems();
        console.log("Other systems initialized");

        // Step 7: Start game loop
        startGameLoop();
        console.log("Game loop started");

        // Step 8: Initial UI update
        updateAllDisplays();

        // Welcome message
        logEvent("Welcome to Guezzard! Start your career journey now.", 'system');
        
        console.log("Game initialization completed successfully");
    } catch (error) {
        console.error("Error during game initialization:", error);
        showErrorNotification("Failed to initialize game. Please try refreshing the page.");
    }
}

/**
 * Initialize game state
 * Wraps the function from game-state.js
 */
function initializeGameState() {
    // Check if global gameState already exists
    if (typeof window.gameState === 'undefined') {
        window.gameState = getDefaultGameState();
    }

    // Set up default game parameters
    window.gameState.gameSpeed = 1;
    window.gameState.gamePaused = false;
    
    // Ensure statistics object exists
    if (!window.gameState.statistics) {
        window.gameState.statistics = {
            totalGoldEarned: 0,
            jobsHeld: 0,
            prestigeCount: 0
        };
    }

    // Try to load saved game
    try {
        const savedGame = loadGameState();
        if (savedGame) {
            // Found a saved game, apply it
            Object.assign(window.gameState, savedGame);
            console.log("Saved game loaded successfully");
        }
    } catch (error) {
        console.error("Error loading saved game:", error);
    }

    return window.gameState;
}

/**
 * Load game data from JSON files
 */
async function loadGameData() {
    console.log("loadGameData() - Loading game data");
    
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

        // Process skills data
        processSkillsData(loadedSkills);
        
        // Store jobs data
        window.gameState.jobs = loadedJobs;
        
        // Store achievements data
        window.gameState.achievements = loadedAchievements;
        
        console.log("All game data loaded successfully");
    } catch (error) {
        console.error("Error loading game data:", error);
        console.log("Using fallback default data");
        
        // Set up fallback data
        setupDefaultData();
    }
}

/**
 * Process skills data
 */
function processSkillsData(skillsData) {
    // Initialize skills object
    window.gameState.skills = {};
    
    // Check if we have the expected format
    if (Array.isArray(skillsData) && skillsData.length > 0 && skillsData[0].items) {
        // Process categories
        skillsData.forEach(category => {
            // Skip attributes category for now (handled separately)
            if (category.id === 'attributes') {
                processAttributes(category);
                return;
            }
            
            // Store category
            if (!window.gameState.skillCategories) {
                window.gameState.skillCategories = {};
            }
            
            window.gameState.skillCategories[category.id] = {
                id: category.id,
                name: category.name,
                description: category.description,
                primaryAttribute: category.primaryAttribute,
                secondaryAttribute: category.secondaryAttribute
            };
            
            // Process skills in this category
            if (Array.isArray(category.items)) {
                category.items.forEach(skill => {
                    if (skill && skill.id) {
                        window.gameState.skills[skill.id] = {
                            id: skill.id,
                            name: skill.name || skill.id,
                            description: skill.description || '',
                            categoryId: category.id,
                            level: skill.level || skill.baseValue || 0,
                            xp: 0,
                            maxLevel: skill.maxLevel || 100
                        };
                    }
                });
            }
        });
    } else {
        // Handle simple array of skills
        skillsData.forEach(skill => {
            if (skill && skill.name) {
                window.gameState.skills[skill.name] = {
                    level: skill.level || 0,
                    description: skill.description || '',
                    icon: skill.icon || ''
                };
            }
        });
    }
    
    // Ensure Map Awareness skill exists
    if (!window.gameState.skills["map_awareness"]) {
        window.gameState.skills["map_awareness"] = {
            id: "map_awareness",
            name: "Map Awareness",
            description: "Ability to read and understand maps",
            level: 1,
            xp: 0,
            maxLevel: 100
        };
    }
}

/**
 * Process attributes category
 */
function processAttributes(attributesCategory) {
    // Initialize attributes object
    if (!window.gameState.attributes) {
        window.gameState.attributes = {};
    }
    
    // Process each attribute
    attributesCategory.items.forEach(attribute => {
        if (attribute && attribute.id) {
            window.gameState.attributes[attribute.id] = {
                name: attribute.name || attribute.id,
                description: attribute.description || '',
                icon: attribute.icon || '',
                value: attribute.baseValue || 5
            };
        }
    });
}

/**
 * Set up default data if loading fails
 */
function setupDefaultData() {
    // Set up default skills
    window.gameState.skills = {
        "map_awareness": {
            id: "map_awareness",
            name: "Map Awareness",
            description: "Ability to read and understand maps",
            level: 1,
            xp: 0
        }
    };
    
    // Set up default jobs (use pre-defined jobs from config)
    window.gameState.jobs = CONFIG.geoguesserCareerPath || [];
    
    // Set up default achievements
    window.gameState.achievements = [];
}

/**
 * Initialize UI system
 * This will invoke function from ui-manager.js
 */
function initializeUI() {
    if (typeof window.initializeUISystem === 'function') {
        window.initializeUISystem();
    } else {
        // Fallback to separate UI initialization functions
        if (typeof window.setupEventLog === 'function') {
            window.setupEventLog();
        }
        
        if (typeof window.setupGameControls === 'function') {
            window.setupGameControls();
        }
        
        if (typeof window.setupJobsUI === 'function') {
            window.setupJobsUI();
        }
    }
}

/**
 * Initialize job system
 */
function initializeJobSystem() {
    if (typeof window.initializeJobSystem === 'function') {
        window.initializeJobSystem();
    }
}

/**
 * Initialize skill system
 */
function initializeSkillSystem() {
    if (typeof window.initializeSkillSystem === 'function') {
        window.initializeSkillSystem();
    }
}

/**
 * Initialize other game systems
 */
function initializeOtherSystems() {
    // Initialize prestige system if available
    if (typeof window.initPrestigeSystem === 'function') {
        window.initPrestigeSystem();
    }

    // Initialize weather system if available
    if (typeof window.setupWeatherSystem === 'function') {
        window.setupWeatherSystem();
    }

    // Initialize career progression if available
    if (typeof window.initializeCareerProgression === 'function') {
        window.initializeCareerProgression();
    }

    // Set up auto-save if function is available
    if (typeof window.startAutoSave === 'function') {
        window.startAutoSave(30); // Auto-save every 30 seconds
    }
}

/**
 * Update all UI displays
 */
function updateAllDisplays() {
    if (typeof window.updateAllDisplays === 'function') {
        window.updateAllDisplays();
    } else {
        // Fallback to individual update functions
        if (typeof window.updateDisplay === 'function') {
            window.updateDisplay();
        }
        
        if (typeof window.updateSkillDisplay === 'function') {
            window.updateSkillDisplay();
        }
    }
}

/**
 * Log event to console and game log
 */
function logEvent(message, category = 'general') {
    if (typeof window.logEvent === 'function') {
        window.logEvent(message, category);
    } else {
        console.log(`[${category}] ${message}`);
    }
}

/**
 * Show error notification
 */
function showErrorNotification(message) {
    if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification(message);
    } else {
        console.error(message);
        alert(message);
    }
}

// Start initialization when document is loaded
document.addEventListener('DOMContentLoaded', initializeGame);

// Make functions available globally
window.initializeGame = initializeGame;
window.loadGameData = loadGameData;
window.processSkillsData = processSkillsData;
window.updateAllDisplays = updateAllDisplays;