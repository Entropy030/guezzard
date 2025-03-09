// enhanced-script.js
console.log("enhanced-script.js - File LOADED and EXECUTING - Top of File");
console.log("enhanced-script.js - Checking gameState at very top:", gameState);

// Import UI functions from ui-setup.js so they're available to other scripts
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
    closeJobsPanel,
    applyForJob,
    endGame
} from './ui-setup.js';

// Make these functions available globally (so other non-module scripts can access them)
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
window.applyForJob = applyForJob;
window.endGame = endGame;

// =========================================================================
// Data Loading and Initialization
// =========================================================================

export function setInitialJob(jobIndex = null) {
  // ... (setInitialJob logic, unchanged from previous responses)
}

export async function loadGameDataFromServer() {
    console.log("enhanced-script.js - Just BEFORE calling loadGameDataFromServer()");
    try {
        const [loadedSkills, loadedJobs, loadedAchievements] = await Promise.all([
            fetch("skills.json").then(response => response.json()),
            fetch("jobs.json").then(response => response.json()),
            fetch("achievements.json").then(response => response.json())
        ]);

        console.log("Skills data loaded:", loadedSkills);
        console.log("Jobs data loaded:", loadedJobs);
        console.log("Achievements data loaded:", loadedAchievements);

        // Initialize skills
        gameState.skills = {};
        loadedSkills.forEach(skill => {
            gameState.skills[skill.name] = {
                level: skill.level || 0,
                description: skill.description,
                icon: skill.icon
            };
        });

        if (!gameState.skills.hasOwnProperty("Map Awareness")) {
            gameState.skills["Map Awareness"] = { level: 0 };
        }

        gameState.jobs = loadedJobs;
        gameState.achievements = loadedAchievements;

        console.log("loadGameDataFromServer() - Game data loaded and processed successfully.");
    } catch (error) {
        console.error("Error loading game data:", error);
        showErrorNotification("Failed to load game data. Please check console for details.");
    }
}

// Make the data loading function available globally
window.loadGameDataFromServer = loadGameDataFromServer;