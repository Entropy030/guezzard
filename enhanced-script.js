// enhanced-script.js - Streamlined version
console.log("enhanced-script.js - Loading");

// Import UI functions from ui-setup.js
import { 
    showNotification, 
    showErrorNotification, 
    logEvent,
    setupJobsUI, 
    updateSkillDisplay, 
    setupAchievementsUI, 
    setupGameControls, 
    setupEventLog, 
    updateDisplay,
    closeJobsPanel
} from './ui-setup.js';

/**
 * Initialize UI functions globally for access by other modules
 */
function initializeGlobalUIFunctions() {
    // Make essential UI functions available globally
    window.showNotification = showNotification;
    window.showErrorNotification = showErrorNotification;
    window.logEvent = logEvent;
    window.setupJobsUI = setupJobsUI;
    window.updateSkillDisplay = updateSkillDisplay;
    window.setupAchievementsUI = setupAchievementsUI;
    window.setupGameControls = setupGameControls;
    window.setupEventLog = setupEventLog;
    window.updateDisplay = updateDisplay;
    window.closeJobsPanel = closeJobsPanel;
    
    console.log("enhanced-script.js - UI functions initialized globally");
}

/**
 * Override job application function with enhanced version
 */
function enhanceJobSystem() {
    // Store original applyForJob if it exists
    if (typeof window.applyForJob === 'function') {
        window.originalApplyForJob = window.applyForJob;
    }

    // Define enhanced version
    window.applyForJob = function(jobIndex, tierLevel = 0) {
        console.log("applyForJob called from enhanced-script.js");
        
        // Call the actual implementation if it exists
        if (typeof window.originalApplyForJob === 'function') {
            return window.originalApplyForJob(jobIndex, tierLevel);
        } else {
            // Fallback implementation
            console.log(`Applying for job at index ${jobIndex}, tier ${tierLevel}`);
            
            // Get the job data
            const jobData = window.getJobData ? window.getJobData(jobIndex, tierLevel) : null;
            
            if (!jobData) {
                console.error("Could not apply for job: Job data not found");
                return false;
            }
            
            // Apply for the job
            gameState.activeJob = { ...jobData, progress: 0 };
            gameState.currentJobTier = tierLevel;
            gameState.jobProgress = 0;
            
            if (typeof logEvent === 'function') {
                logEvent(`You got a new job as a ${jobData.title}!`, 'career');
            }
            
            return true;
        }
    };
    
    console.log("enhanced-script.js - Job system enhanced");
}

/**
 * Load game data from server
 */
async function loadGameDataFromServer() {
    console.log("enhanced-script.js - Loading game data from server");
    
    try {
        // Fetch multiple data files concurrently for performance
        const [loadedSkills, loadedJobs, loadedAchievements] = await Promise.all([
            fetch("skills.json").then(response => response.json()),
            fetch("jobs.json").then(response => response.json()),
            fetch("achievements.json").then(response => json())
        ]);

        console.log("Game data loaded successfully");

        // Initialize skills
        gameState.skills = {};
        loadedSkills.forEach(skill => {
            gameState.skills[skill.name] = {
                level: skill.level || 0,
                description: skill.description,
                icon: skill.icon
            };
        });

        // Ensure Map Awareness skill exists
        if (!gameState.skills.hasOwnProperty("Map Awareness")) {
            gameState.skills["Map Awareness"] = { level: 0 };
        }

        // Initialize jobs and achievements
        gameState.jobs = loadedJobs;
        gameState.achievements = loadedAchievements;

        console.log("Game data processed and applied to gameState");
        return true;
    } catch (error) {
        console.error("Error loading game data:", error);
        showErrorNotification("Failed to load game data. Please check console for details.");
        return false;
    }
}

/**
 * Initialize the enhanced script functionality
 */
function initialize() {
    // Make UI functions available globally
    initializeGlobalUIFunctions();
    
    // Enhance job system
    enhanceJobSystem();
    
    // Make data loading function available globally
    window.loadGameDataFromServer = loadGameDataFromServer;
    
    console.log("enhanced-script.js - Initialization complete");
}

// Auto-initialize when module is loaded
initialize();

// Export functions for use in other modules
export {
    loadGameDataFromServer,
    initialize
};