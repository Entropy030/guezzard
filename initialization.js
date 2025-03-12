// initialization.js - Unified game initialization
// This file bootstraps the entire game initialization process

console.log("initialization.js - Starting game initialization");

// Import core systems
import { initializeGame } from './core/core.js';
import { initializeUISystem } from './ui/ui-manager.js';
import { initializeSkillSystem } from './systems/skill-system.js';
import { initializeJobSystem } from './systems/job-system.js';
import { initializePrestigeSystem } from './systems/prestige-system.js';

// Execute initialization when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, starting game initialization");
    
    // Start the initialization process
    initializeGame()
        .then(() => {
            console.log("Core game systems initialized successfully");
            
            // Log successful initialization
            if (typeof window.logEvent === 'function') {
                window.logEvent("Welcome to Guezzard! Your career adventure begins now.", 'system');
            }
        })
        .catch(error => {
            console.error("Failed to initialize game:", error);
            
            // Show error notification if available
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification("Failed to initialize game. Please refresh the page.");
            }
        });
});

/**
 * Get default configuration for the game
 * This provides a fallback in case config.js is missing
 */
function getDefaultConfig() {
    return {
        settings: {
            tickInterval: 25,
            ticksInOneGameDay: 5,
            seasonDuration: 150,
            ticksInOneGameYear: 600,
            maxAge: 65,
            startingGold: 0,
            speedMultipliers: [1, 2, 4]
        },
        
        uiText: {
            gameTitle: "Guezzard - Master Your Career",
            endGameTitle: "Game Over - Retirement!",
            newLifeButton: "Start New Life",
            achievementUnlocked: "Achievement Unlocked!",
            achievementButton: "Nice!",
            eventCloseButton: "OK",
            pauseButton: "Pause",
            resumeButton: "Resume",
            speedButton: "Speed: "
        },
        
        skillConfig: {
            "Map Awareness": {
                description: "Your ability to navigate and identify locations.",
                maxLevel: 100,
                icon: "fa-map-location-dot"
            }
        },
        
        shopItems: [
            {
                id: "lifeExtension",
                name: "Life Extension",
                description: "Extend your maximum age by 10 years.",
                price: 500,
                effect: "maxAge:10",
                maxPurchases: 3,
                icon: "fa-heart"
            }
        ]
    };
}

// Ensure CONFIG is available globally
if (typeof window.CONFIG === 'undefined') {
    console.warn("CONFIG not found, using default configuration");
    window.CONFIG = getDefaultConfig();
}

// Export initialization function for ES module usage
export { initializeGame };