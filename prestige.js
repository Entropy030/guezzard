// prestige.js - Complete implementation

console.log("prestige.js - Module loading");

// Calculate prestige points based on player's progress
function calculatePrestigePoints() {
    console.log("calculatePrestigePoints() - Calculating prestige points to award");
    
    // Formula based on player's progress
    const basePoints = Math.floor(
        (gameState.statistics.totalGoldEarned / 10000) +
        calculateTotalSkillLevels() * 0.5
    );
    
    console.log(`calculatePrestigePoints() - Base points: ${basePoints}`);
    
    // Minimum of 1 point if player qualifies for prestige
    return Math.max(1, basePoints);
}

// Calculate total skill levels (used in the prestige formula)
function calculateTotalSkillLevels() {
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

// Check if player is eligible for prestige
function canPrestige() {
    console.log("canPrestige() - Checking if player can prestige");
    
    // Check minimum age requirement
    if (!gameState.age || gameState.age < CONFIG.settings.maxAge) {
        console.log("canPrestige() - Player is not old enough to prestige");
        return false;
    }
    
    // Additional requirements can be added here
    // For example, minimum gold earned, specific achievements, etc.
    
    return true;
}

// Perform the prestige operation
function performPrestige() {
    console.log("performPrestige() - Starting prestige process");
    
    // Check if player can prestige
    if (!canPrestige()) {
        console.log("performPrestige() - Player cannot prestige yet");
        displayNotification("You need to reach retirement age before you can prestige!", "error");
        return false;
    }
    
    // Calculate prestige points to be awarded
    const pointsToAward = calculatePrestigePoints();
    
    // Check if player has enough progress to earn at least 1 prestige point
    if (pointsToAward < 1) {
        console.log("performPrestige() - Not enough progress for prestige");
        displayNotification("You need more progress before you can prestige!", "error");
        return false;
    }
    
    // Show confirmation dialog
    showConfirmDialog(
        "Prestige Confirmation",
        `Are you sure you want to prestige? You will earn ${pointsToAward} prestige points but lose most of your progress!`,
        () => {
            // User confirmed, execute prestige
            executePrestige(pointsToAward);
        }
    );
    
    return true;
}

// Execute the prestige after confirmation
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

// Apply bonuses from prestige points
function applyPrestigeBonuses() {
    console.log("applyPrestigeBonuses() - Applying prestige bonuses");
    
    // Apply prestige bonuses based on points
    // Example: Each prestige point gives +5% to all resource gains
    const resourceBonus = (gameState.prestigePoints || 0) * 0.05;
    
    // Apply to each skill multiplier
    if (gameState.skills) {
        for (const skill in gameState.skills) {
            // Initialize multiplier property if it doesn't exist
            if (typeof gameState.skills[skill] === 'object') {
                gameState.skills[skill].multiplier = (gameState.skills[skill].multiplier || 1) + resourceBonus;
            }
        }
    }
    
    // Other potential bonuses
    gameState.maxEnergy = (gameState.maxEnergy || 100) + (gameState.prestigePoints * 2);
    
    // Add gold gain multiplier
    if (!gameState.multipliers) {
        gameState.multipliers = { gold: 1, skill: 1 };
    }
    
    gameState.multipliers.gold = 1 + (gameState.prestigePoints * 0.05);
    gameState.multipliers.skill = 1 + (gameState.prestigePoints * 0.03);
    
    console.log("applyPrestigeBonuses() - Prestige bonuses applied");
}

// Set up the prestige UI
function setupPrestigeUI() {
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
                        <li>+5% resource gains per prestige point</li>
                        <li>+2 max energy per prestige point</li>
                        <li>Faster skill progression</li>
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
                        <li>+${(pointsToAward * 5)}% resource gains</li>
                        <li>+${(pointsToAward * 2)} max energy</li>
                        <li>+${(pointsToAward * 3)}% skill progression</li>
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

// Initialize prestige system
function initPrestigeSystem() {
    console.log("initPrestigeSystem() - Initializing prestige system");
    
    // Set up event listener for prestige button in main UI
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
    
    console.log("initPrestigeSystem() - Prestige system initialized");
}

// Export functions
export {
    calculatePrestigePoints,
    calculateTotalSkillLevels,
    canPrestige,
    performPrestige,
    applyPrestigeBonuses,
    setupPrestigeUI,
    initPrestigeSystem
};

// Make functions available globally
window.calculatePrestigePoints = calculatePrestigePoints;
window.calculateTotalSkillLevels = calculateTotalSkillLevels;
window.canPrestige = canPrestige;
window.performPrestige = performPrestige;
window.applyPrestigeBonuses = applyPrestigeBonuses;
window.setupPrestigeUI = setupPrestigeUI;
window.initPrestigeSystem = initPrestigeSystem;

// Auto-initialize on load
setTimeout(() => {
    initPrestigeSystem();
}, 1000); // Delay to ensure other systems are loaded first

console.log("prestige.js - Module loaded successfully");