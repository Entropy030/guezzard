// prestige-system.js - Consolidated Prestige System
// This file incorporates and enhances functionality from prestige.js

console.log("prestige-system.js - Loading consolidated prestige system");

// Make sure we have the required functions
if (typeof window.getDefaultGameState !== 'function') {
    console.warn("prestige-system.js - getDefaultGameState not available globally");
}

// Constants for prestige system
const PRESTIGE_CONSTANTS = {
    GOLD_FACTOR: 10000,           // How much gold contributes to prestige points
    SKILL_FACTOR: 0.5,            // How much skill levels contribute to prestige points
    MINIMUM_POINTS: 1,            // Minimum prestige points to earn when prestiging
    GOLD_MULTIPLIER_PER_POINT: 0.05, // How much each prestige point affects gold gain
    SKILL_MULTIPLIER_PER_POINT: 0.03, // How much each prestige point affects skill gain
    ENERGY_BONUS_PER_POINT: 2     // How much max energy increases per prestige point
};

/**
 * Initialize the prestige system
 */
export function initializePrestigeSystem() {
    console.log("initializePrestigeSystem() - Setting up prestige system");
    
    // Ensure prestige values exist in game state
    ensurePrestigeStructures();
    
    // Apply prestige bonuses from existing points
    applyPrestigeBonuses();
    
    // Set up event listener for prestige button in main UI
    setupPrestigeButton();
    
    console.log("Prestige system initialized successfully");
    return true;
}

/**
 * Apply bonuses from prestige points
 */
export function applyPrestigeBonuses() {
    console.log("applyPrestigeBonuses() - Applying prestige bonuses");
    
    // Skip if no prestige points
    if (!gameState.prestigePoints) {
        return;
    }
    
    // Apply prestige bonuses based on points
    const resourceBonus = gameState.prestigePoints * PRESTIGE_CONSTANTS.GOLD_MULTIPLIER_PER_POINT;
    
    // Apply to each skill multiplier if skills exist
    if (gameState.skills) {
        for (const skill in gameState.skills) {
            // Initialize multiplier property if it doesn't exist
            if (typeof gameState.skills[skill] === 'object') {
                gameState.skills[skill].multiplier = 1 + resourceBonus;
            }
        }
    }
    
    // Increase max energy
    gameState.maxEnergy = (gameState.baseMaxEnergy || 100) + (gameState.prestigePoints * PRESTIGE_CONSTANTS.ENERGY_BONUS_PER_POINT);
    
    // Set gold gain multiplier
    if (!gameState.multipliers) {
        gameState.multipliers = { gold: 1, skill: 1 };
    }
    
    gameState.multipliers.gold = 1 + (gameState.prestigePoints * PRESTIGE_CONSTANTS.GOLD_MULTIPLIER_PER_POINT);
    gameState.multipliers.skill = 1 + (gameState.prestigePoints * PRESTIGE_CONSTANTS.SKILL_MULTIPLIER_PER_POINT);
    
    console.log("applyPrestigeBonuses() - Prestige bonuses applied");
}

/**
 * Set up the prestige UI
 */
export function setupPrestigeUI() {
    console.log("setupPrestigeUI() - Setting up prestige panel");
    
    const prestigePanel = document.getElementById('prestige-panel');
    const prestigeArea = document.getElementById('prestige-area');
    
    if (!prestigePanel || !prestigeArea) {
        console.error("setupPrestigeUI() - Prestige panel elements not found");
        return;
    }
    
    // Clear existing content
    prestigeArea.innerHTML = '';
    
    // Check if player can prestige
    const canPrestigeNow = canPrestige();
    
    if (!canPrestigeNow) {
        // Player can't prestige yet - show requirements
        const maxAge = CONFIG.settings.maxAge || 65;
        
        prestigeArea.innerHTML = `
            <div class="prestige-info">
                <h3>Career Legacy System</h3>
                <p>When you reach retirement age (${maxAge}), you can prestige to start a new career with bonuses!</p>
                <div class="prestige-requirements">
                    <h4>Requirements:</h4>
                    <div class="requirement ${gameState.age >= maxAge ? 'met' : 'not-met'}">
                        Age: ${gameState.age || 18}/${maxAge}
                    </div>
                </div>
                <div class="prestige-benefits">
                    <h4>Benefits:</h4>
                    <ul>
                        <li>+${PRESTIGE_CONSTANTS.GOLD_MULTIPLIER_PER_POINT * 100}% resource gains per prestige point</li>
                        <li>+${PRESTIGE_CONSTANTS.ENERGY_BONUS_PER_POINT} max energy per prestige point</li>
                        <li>+${PRESTIGE_CONSTANTS.SKILL_MULTIPLIER_PER_POINT * 100}% skill progression per prestige point</li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        // Player can prestige - show prestige info and button
        const pointsToAward = calculatePrestigePoints();
        
        prestigeArea.innerHTML = `
            <div class="prestige-info">
                <h3>Ready to Prestige!</h3>
                <p>You've reached retirement age and can start a new life with bonuses!</p>
                <div class="prestige-current">
                    <h4>Current Stats:</h4>
                    <ul>
                        <li>Prestige Level: ${gameState.prestigeLevel || 0}</li>
                        <li>Prestige Points: ${gameState.prestigePoints || 0}</li>
                        <li>New Points Available: +${pointsToAward}</li>
                    </ul>
                </div>
                <div class="prestige-benefits">
                    <h4>Benefits After Prestige:</h4>
                    <ul>
                        <li>+${(pointsToAward * PRESTIGE_CONSTANTS.GOLD_MULTIPLIER_PER_POINT * 100).toFixed(0)}% resource gains</li>
                        <li>+${(pointsToAward * PRESTIGE_CONSTANTS.ENERGY_BONUS_PER_POINT)} max energy</li>
                        <li>+${(pointsToAward * PRESTIGE_CONSTANTS.SKILL_MULTIPLIER_PER_POINT * 100).toFixed(0)}% skill progression</li>
                    </ul>
                </div>
                <button id="prestige-button-confirm" class="prestige-button">Prestige Now</button>
            </div>
        `;
        
        // Add event listener to prestige button
        const prestigeButton = document.getElementById('prestige-button-confirm');
        if (prestigeButton) {
            prestigeButton.addEventListener('click', performPrestige);
        }
    }
    
    console.log("setupPrestigeUI() - Prestige panel setup complete");
}

// Make all functions available globally
window.initializePrestigeSystem = initializePrestigeSystem;
window.calculatePrestigePoints = calculatePrestigePoints;
window.calculateTotalSkillLevels = calculateTotalSkillLevels;
window.canPrestige = canPrestige;
window.performPrestige = performPrestige;
window.applyPrestigeBonuses = applyPrestigeBonuses;
window.setupPrestigeUI = setupPrestigeUI;

console.log("prestige-system.js - Consolidated prestige system loaded successfully");

// Export functions for ES module usage
export {
    initializePrestigeSystem,
    calculatePrestigePoints,
    calculateTotalSkillLevels,
    canPrestige,
    performPrestige,
    applyPrestigeBonuses,
    setupPrestigeUI
};

/**
 * Ensure prestige-related structures exist in game state
 */
function ensurePrestigeStructures() {
    // Initialize prestige points
    if (typeof gameState.prestigePoints === 'undefined') {
        gameState.prestigePoints = 0;
    }
    
    // Initialize prestige level
    if (typeof gameState.prestigeLevel === 'undefined') {
        gameState.prestigeLevel = 0;
    }
    
    // Initialize multipliers
    if (!gameState.multipliers) {
        gameState.multipliers = { 
            gold: 1, 
            skill: 1 
        };
    }
    
    // Ensure statistics object exists
    if (!gameState.statistics) {
        gameState.statistics = {};
    }
    
    // Initialize prestige count in statistics
    if (typeof gameState.statistics.prestigeCount === 'undefined') {
        gameState.statistics.prestigeCount = 0;
    }
}

/**
 * Set up prestige button event listener
 */
function setupPrestigeButton() {
    console.log("setupPrestigeButton() - Setting up prestige button");
    
    const prestigeButton = document.getElementById('prestige-button');
    if (prestigeButton) {
        prestigeButton.addEventListener('click', () => {
            const prestigePanel = document.getElementById('prestige-panel');
            if (prestigePanel) {
                setupPrestigeUI();
                prestigePanel.style.display = 'block';
            }
        });
    }
}

/**
 * Calculate prestige points based on player's progress
 * @returns {number} - Prestige points to award
 */
export function calculatePrestigePoints() {
    console.log("calculatePrestigePoints() - Calculating prestige points to award");
    
    // Formula based on player's progress
    const basePoints = Math.floor(
        (gameState.statistics.totalGoldEarned / PRESTIGE_CONSTANTS.GOLD_FACTOR) +
        (calculateTotalSkillLevels() * PRESTIGE_CONSTANTS.SKILL_FACTOR)
    );
    
    console.log(`calculatePrestigePoints() - Base points: ${basePoints}`);
    
    // Minimum of 1 point if player qualifies for prestige
    return Math.max(PRESTIGE_CONSTANTS.MINIMUM_POINTS, basePoints);
}

/**
 * Calculate total skill levels (used in the prestige formula)
 * @returns {number} - Sum of all skill levels
 */
export function calculateTotalSkillLevels() {
    console.log("calculateTotalSkillLevels() - Summing all skill levels");
    
    let totalLevels = 0;
    
    // Check if skills exist
    if (!gameState.skills) {
        console.warn("calculateTotalSkillLevels() - No skills found in gameState");
        return 0;
    }
    
    // Sum up all skill levels from the skills object
    for (const skillName in gameState.skills) {
        const skillData = gameState.skills[skillName];
        
        // Handle different skill data formats
        if (typeof skillData === 'object' && skillData.level !== undefined) {
            totalLevels += skillData.level;
        } else if (typeof skillData === 'number') {
            totalLevels += skillData;
        }
    }
    
    console.log(`calculateTotalSkillLevels() - Total skill levels: ${totalLevels}`);
    return totalLevels;
}

/**
 * Check if player is eligible for prestige
 * @returns {boolean} - Whether player can prestige
 */
export function canPrestige() {
    console.log("canPrestige() - Checking if player can prestige");
    
    // Check minimum age requirement
    if (!gameState.age || gameState.age < CONFIG.settings.maxAge) {
        console.log(`canPrestige() - Player is not old enough to prestige (${gameState.age}/${CONFIG.settings.maxAge})`);
        return false;
    }
    
    // Additional requirements can be added here
    // For example, minimum gold earned, specific achievements, etc.
    
    return true;
}

/**
 * Perform the prestige operation
 * @returns {boolean} - Success/failure of prestige
 */
export function performPrestige() {
    console.log("performPrestige() - Starting prestige process");
    
    // Check if player can prestige
    if (!canPrestige()) {
        console.log("performPrestige() - Player cannot prestige yet");
        
        if (typeof window.displayNotification === 'function') {
            window.displayNotification("You need to reach retirement age before you can prestige!", "error");
        }
        
        return false;
    }
    
    // Calculate prestige points to be awarded
    const pointsToAward = calculatePrestigePoints();
    
    // Check if player has enough progress to earn at least 1 prestige point
    if (pointsToAward < 1) {
        console.log("performPrestige() - Not enough progress for prestige");
        
        if (typeof window.displayNotification === 'function') {
            window.displayNotification("You need more progress before you can prestige!", "error");
        }
        
        return false;
    }
    
    // Show confirmation dialog
    if (typeof window.showConfirmDialog === 'function') {
        window.showConfirmDialog(
            "Prestige Confirmation",
            `Are you sure you want to prestige? You will earn ${pointsToAward} prestige points but lose most of your progress!`,
            () => {
                // User confirmed, execute prestige
                executePrestige(pointsToAward);
            }
        );
    } else {
        // No confirmation dialog available, just execute
        executePrestige(pointsToAward);
    }
    
    return true;
}

/**
 * Execute the prestige after confirmation
 * @param {number} pointsToAward - Prestige points to award
 * @returns {boolean} - Success/failure of prestige execution
 */
function executePrestige(pointsToAward) {
    console.log(`executePrestige() - Executing prestige with ${pointsToAward} points`);
    
    // Award prestige points
    gameState.prestigePoints = (gameState.prestigePoints || 0) + pointsToAward;
    gameState.prestigeLevel = (gameState.prestigeLevel || 0) + 1;
    
    // Ensure statistics object exists
    if (!gameState.statistics) {
        gameState.statistics = {};
    }
    
    // Track prestige count
    gameState.statistics.prestigeCount = (gameState.statistics.prestigeCount || 0) + 1;
    
    // Track what needs to be kept (achievements, stats, settings, etc.)
    const prestigeKeepData = {
        prestigePoints: gameState.prestigePoints,
        prestigeLevel: gameState.prestigeLevel,
        achievements: gameState.achievements,
        statistics: gameState.statistics,
        settings: gameState.settings
    };
    
    // Reset game state but keep prestige data
    const defaultState = window.getDefaultGameState ? 
        window.getDefaultGameState() : 
        {/* Minimal default state if getDefaultGameState not available */};
    
    Object.assign(gameState, defaultState);
    
    // Restore kept data
    gameState.prestigePoints = prestigeKeepData.prestigePoints;
    gameState.prestigeLevel = prestigeKeepData.prestigeLevel;
    gameState.achievements = prestigeKeepData.achievements;
    gameState.statistics = prestigeKeepData.statistics;
    gameState.settings = prestigeKeepData.settings;
    
    // Apply prestige bonuses
    applyPrestigeBonuses();
    
    // Update UI
    if (typeof window.updateAllDisplays === 'function') {
        window.updateAllDisplays();
    }
    
    // Play prestige sound and effect
    if (typeof window.playSound === 'function') {
        window.playSound('prestige');
    }
    
    if (typeof window.showPrestigeAnimation === 'function') {
        window.showPrestigeAnimation();
    }
    
    // Log event
    if (typeof window.logEvent === 'function') {
        window.logEvent(`Prestiged to level ${gameState.prestigeLevel}! Earned ${pointsToAward} prestige points.`, 'prestige');
    }
    
    console.log(`executePrestige() - Prestige complete, now at level ${gameState.prestigeLevel}`);
    
    return true;
}