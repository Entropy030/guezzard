// initialization.js - Unified initialization system for Guezzard game
console.log("initialization.js - Starting game initialization");

// Import core modules
import { initializeGameState, getDefaultGameState } from './core/game-state.js';
import { startGameLoop } from './core/game-loop.js';

// Import UI manager
import { 
    initializeUI, 
    showNotification, 
    showErrorNotification, 
    logEvent,
    updateAllDisplays
} from './ui/ui-manager.js';

// Import job system
import { initializeJobSystem } from './systems/job-system.js';

// Import skill system
import { initializeSkillSystem } from './systems/skill-system.js';

/**
 * Main game initialization function
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

        // Step 6: Start game loop
        startGameLoop();
        console.log("Game loop started");

        // Step 7: Initial UI update
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
 * Load game data from JSON files
 */
async function loadGameData() {
    console.log("loadGameData() - Loading game data");
    
    try {
        // Load skills data
        const skillsResponse = await fetch("skills.json");
        const skillsData = await skillsResponse.json();
        
        // Process skills data
        processSkillsData(skillsData);
        
        // Load jobs data
        const jobsResponse = await fetch("jobs.json");
        const jobsData = await jobsResponse.json();
        
        // Store jobs data
        gameState.jobs = jobsData;
        
        // Load achievements data
        const achievementsResponse = await fetch("achievements.json");
        const achievementsData = await achievementsResponse.json();
        
        // Store achievements data
        gameState.achievements = achievementsData;
        
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
    gameState.skills = {};
    
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
            if (!gameState.skillCategories) {
                gameState.skillCategories = {};
            }
            
            gameState.skillCategories[category.id] = {
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
                        gameState.skills[skill.id] = {
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
                gameState.skills[skill.name] = {
                    level: skill.level || 0,
                    description: skill.description || '',
                    icon: skill.icon || ''
                };
            }
        });
    }
    
    // Ensure Map Awareness skill exists
    if (!gameState.skills["map_awareness"]) {
        gameState.skills["map_awareness"] = {
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
    if (!gameState.attributes) {
        gameState.attributes = {};
    }
    
    // Process each attribute
    attributesCategory.items.forEach(attribute => {
        if (attribute && attribute.id) {
            gameState.attributes[attribute.id] = {
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
    gameState.skills = {
        "map_awareness": {
            id: "map_awareness",
            name: "Map Awareness",
            description: "Ability to read and understand maps",
            level: 1,
            xp: 0
        }
    };
    
    // Set up default jobs (use pre-defined jobs from config)
    gameState.jobs = CONFIG.geoguesserCareerPath || [];
    
    // Set up default achievements
    gameState.achievements = [];
}

// Start initialization when document is loaded
document.addEventListener('DOMContentLoaded', initializeGame);

// Export functions
export { initializeGame, loadGameData };