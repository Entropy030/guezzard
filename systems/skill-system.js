// skill-system.js - Simplified Skill System
// Aligned with game mechanics documentation (15 general skills + 10 professional skills)
// Removed: decay, synergies, energy costs, attributes influence

console.log("skill-system.js - Loading simplified skill system");

// Constants for skill system
const SKILL_CONSTANTS = {
    BASE_XP_REQUIRED: 100,      // Base XP needed for level up
    XP_SCALING_FACTOR: 1.1,     // How much XP requirements increase per level
    MAX_SKILL_LEVEL: 100,       // Maximum skill level
    MIN_SKILL_LEVEL: 1,         // Minimum skill level
    TRAINING_BASE_XP: 10        // Base XP gained per hour of training
};

// Cache for optimizing skill calculations
const skillCache = {
    lastUpdateTime: 0
};

/**
 * Initialize the skill system
 */
export function initializeSkillSystem() {
    console.log("initializeSkillSystem() - Setting up simplified skill system");
    
    // Ensure game state has the necessary structures
    ensureSkillStructures();
    
    // Set up skill UI if function is available
    if (typeof window.setupSkillUI === 'function') {
        window.setupSkillUI();
    }
    
    console.log("Skill system initialized successfully");
    return true;
}

/**
 * Ensure all necessary skill-related structures exist in game state
 */
function ensureSkillStructures() {
    // Ensure skills object exists
    if (!gameState.skills) {
        gameState.skills = {};
    }
    
    // Ensure skill categories object exists
    if (!gameState.skillCategories) {
        gameState.skillCategories = {};
    }
    
    // Ensure skill progress object exists
    if (!gameState.skillProgress) {
        gameState.skillProgress = {};
    }
    
    // Ensure skill multipliers object exists (for lasting multipliers)
    if (!gameState.skillMultipliers) {
        gameState.skillMultipliers = {};
    }
    
    // Ensure previous lives skill levels object exists
    if (!gameState.previousLivesSkillLevels) {
        gameState.previousLivesSkillLevels = {};
    }
}

/**
 * Process skills data from loaded JSON
 * @param {Array} skillsData - Array of skill categories with their skills
 */
export function processSkillsData(skillsData) {
    console.log("processSkillsData() - Processing skills data");
    
    // Check if we have the expected format
    if (!Array.isArray(skillsData)) {
        console.error("processSkillsData() - Invalid skills data format");
        return;
    }
    
    // Initialize structures
    if (!gameState.skillCategories) {
        gameState.skillCategories = {};
    }
    
    if (!gameState.skills) {
        gameState.skills = {};
    }
    
    // Process general skills category (15 skills)
    const generalSkills = skillsData.find(cat => cat.id === "general");
    if (generalSkills && Array.isArray(generalSkills.items)) {
        // Store category
        gameState.skillCategories["general"] = {
            id: "general",
            name: generalSkills.name || "General Skills",
            description: generalSkills.description || "Basic human skills applicable to many situations"
        };
        
        // Process each general skill
        generalSkills.items.forEach(skill => {
            processSkill(skill, "general");
        });
    } else {
        console.warn("processSkillsData() - General skills category not found");
    }
    
    // Process professional skills category (10 skills)
    const professionalSkills = skillsData.find(cat => cat.id === "professional");
    if (professionalSkills && Array.isArray(professionalSkills.items)) {
        // Store category
        gameState.skillCategories["professional"] = {
            id: "professional",
            name: professionalSkills.name || "Professional Skills",
            description: professionalSkills.description || "Specialized skills for specific career tracks"
        };
        
        // Process each professional skill
        professionalSkills.items.forEach(skill => {
            processSkill(skill, "professional");
        });
    } else {
        console.warn("processSkillsData() - Professional skills category not found");
    }
    
    // Initialize default skill multipliers based on previous life skill levels
    updateSkillMultipliers();
    
    console.log("processSkillsData() - Skills processing complete");
}

/**
 * Process a single skill definition
 * @param {Object} skill - Skill definition object
 * @param {string} categoryId - Category ID
 */
function processSkill(skill, categoryId) {
    if (!skill || !skill.id) {
        console.warn("processSkill() - Invalid skill definition");
        return;
    }
    
    // Preserve existing skill level and XP if skill already exists
    const existingSkill = gameState.skills[skill.id];
    const level = existingSkill ? (existingSkill.level || existingSkill.baseValue || 1) : 1;
    const xp = existingSkill ? (existingSkill.xp || 0) : 0;
    
    // Create or update skill
    gameState.skills[skill.id] = {
        id: skill.id,
        name: skill.name || skill.id,
        description: skill.description || "",
        categoryId: categoryId,
        level: level,
        xp: xp,
        maxLevel: SKILL_CONSTANTS.MAX_SKILL_LEVEL,
        baseValue: skill.baseValue || 1
    };
}

/**
 * Update skill multipliers based on previous lives
 */
function updateSkillMultipliers() {
    // Skip if no previous lives data
    if (!gameState.previousLivesSkillLevels) {
        return;
    }
    
    // Initialize multipliers object if needed
    if (!gameState.skillMultipliers) {
        gameState.skillMultipliers = {};
    }
    
    // Update multipliers for each skill from previous lives
    for (const skillId in gameState.previousLivesSkillLevels) {
        const prevLevel = gameState.previousLivesSkillLevels[skillId];
        
        // Calculate multiplier (1% per level, max 100% at level 100)
        const multiplier = Math.min(1.0, prevLevel / 100);
        
        // Store multiplier
        gameState.skillMultipliers[skillId] = multiplier;
    }
}

/**
 * Add experience to a skill
 * @param {string} skillId - Skill identifier
 * @param {number} amount - Amount of XP to add
 * @returns {boolean} - Success/failure
 */
export function addSkillXP(skillId, amount) {
    console.log(`addSkillXP() - Adding ${amount} XP to ${skillId}`);
    
    const skill = gameState.skills[skillId];
    if (!skill) {
        console.error(`addSkillXP() - Skill ${skillId} not found`);
        return false;
    }
    
    // Apply multiplier if exists
    let multiplier = 1.0;
    if (gameState.skillMultipliers && gameState.skillMultipliers[skillId]) {
        multiplier = 1.0 + gameState.skillMultipliers[skillId];
    }
    
    // Apply the multiplier
    const adjustedAmount = amount * multiplier;
    
    // Add XP
    skill.xp = (skill.xp || 0) + adjustedAmount;
    
    // Check for level up
    checkSkillLevelUp(skillId);
    
    return true;
}

/**
 * Check if a skill should level up
 * @param {string} skillId - Skill identifier
 * @returns {boolean} - Whether skill leveled up
 */
function checkSkillLevelUp(skillId) {
    const skill = gameState.skills[skillId];
    if (!skill) {
        return false;
    }
    
    // Ensure level property exists
    if (typeof skill.level === 'undefined') {
        skill.level = skill.baseValue || 1;
    }
    
    // Skip if already at max level
    if (skill.level >= SKILL_CONSTANTS.MAX_SKILL_LEVEL) {
        return false;
    }
    
    // Calculate XP needed for next level
    const xpNeeded = calculateXPForLevel(skill.level);
    
    // Check if we have enough XP to level up
    if (skill.xp >= xpNeeded) {
        // Level up the skill
        skill.level++;
        skill.xp -= xpNeeded;
        
        // Log the level up
        if (typeof window.logEvent === 'function') {
            window.logEvent(`${skill.name} skill increased to level ${skill.level}!`, 'skill');
        }
        
        // Check for additional level ups
        checkSkillLevelUp(skillId);
        
        // Trigger skill level up event
        if (typeof window.onSkillLevelUp === 'function') {
            window.onSkillLevelUp(skillId, skill.level);
        }
        
        return true;
    }
    
    return false;
}

/**
 * Calculate XP needed for a specific level
 * @param {number} level - Skill level
 * @returns {number} - XP needed for next level
 */
export function calculateXPForLevel(level) {
    return Math.floor(SKILL_CONSTANTS.BASE_XP_REQUIRED * Math.pow(SKILL_CONSTANTS.XP_SCALING_FACTOR, level - 1));
}

/**
 * Train a specific skill
 * @param {string} skillId - Skill identifier
 * @param {number} hoursSpent - Hours spent training
 * @param {number} focusLevel - Focus level (0-2) affects XP gain
 * @returns {boolean} - Success/failure
 */
export function trainSkill(skillId, hoursSpent = 1, focusLevel = 1) {
    console.log(`trainSkill() - Training ${skillId} for ${hoursSpent} hours with focus level ${focusLevel}`);
    
    const skill = gameState.skills[skillId];
    if (!skill) {
        console.error(`trainSkill() - Skill ${skillId} not found`);
        return false;
    }
    
    // Base XP gain from training
    const baseXPGain = SKILL_CONSTANTS.TRAINING_BASE_XP * hoursSpent;
    
    // Apply focus modifier
    const focusModifier = 0.5 + (focusLevel * 0.5); // 0.5 to 1.5 based on focus level 0-2
    
    // Calculate total XP gain
    const totalXPGain = baseXPGain * focusModifier;
    
    // Add the XP
    addSkillXP(skillId, totalXPGain);
    
    // Log training activity
    if (typeof window.logEvent === 'function') {
        window.logEvent(`Trained ${skill.name} for ${hoursSpent} hour${hoursSpent > 1 ? 's' : ''}.`, 'skill');
    }
    
    // Update display
    if (typeof window.updateSkillDisplay === 'function') {
        window.updateSkillDisplay();
    }
    
    return true;
}

/**
 * Get skill info by ID
 * @param {string} skillId - Skill identifier
 * @returns {object|null} - Skill info or null if not found
 */
export function getSkillInfo(skillId) {
    if (!gameState.skills || !gameState.skills[skillId]) {
        return null;
    }
    
    const skill = gameState.skills[skillId];
    const category = gameState.skillCategories[skill.categoryId];
    
    // Calculate XP needed for next level
    const xpForNextLevel = calculateXPForLevel(skill.level);
    
    // Calculate percentage to next level
    const percentToNextLevel = (skill.xp / xpForNextLevel) * 100;
    
    // Get multiplier if any
    const multiplier = gameState.skillMultipliers && gameState.skillMultipliers[skillId] ?
        gameState.skillMultipliers[skillId] : 0;
    
    return {
        id: skill.id || skillId,
        name: skill.name || skillId,
        description: skill.description || '',
        icon: skill.icon || '',
        level: skill.level || 0,
        xp: skill.xp || 0,
        xpForNextLevel,
        percentToNextLevel,
        category: category,
        multiplier: multiplier
    };
}

/**
 * Get all skills in a category
 * @param {string} categoryId - Category identifier
 * @returns {Array} - Array of skill info objects
 */
export function getSkillsByCategory(categoryId) {
    if (!gameState.skillCategories || !gameState.skillCategories[categoryId]) {
        return [];
    }
    
    const skills = [];
    
    for (const skillId in gameState.skills) {
        const skill = gameState.skills[skillId];
        if (skill.categoryId === categoryId) {
            skills.push(getSkillInfo(skillId));
        }
    }
    
    return skills;
}

/**
 * Get all categories with skills
 * @returns {Array} - Array of category objects
 */
export function getAllCategories() {
    if (!gameState.skillCategories) {
        return [];
    }
    
    const categories = [];
    
    for (const categoryId in gameState.skillCategories) {
        const category = gameState.skillCategories[categoryId];
        categories.push({
            id: category.id || categoryId,
            name: category.name || categoryId,
            description: category.description || '',
            skillCount: getSkillsByCategory(categoryId).length
        });
    }
    
    return categories;
}

/**
 * Save current skill levels as previous life values when starting a new life
 * Called when a player retires or dies
 */
export function saveSkillLevelsForNextLife() {
    console.log("saveSkillLevelsForNextLife() - Saving skill levels for multipliers in next life");
    
    // Initialize previous lives skill levels if needed
    if (!gameState.previousLivesSkillLevels) {
        gameState.previousLivesSkillLevels = {};
    }
    
    // For each skill, store the highest level achieved (current or previous)
    for (const skillId in gameState.skills) {
        const currentLevel = gameState.skills[skillId].level || 1;
        const previousBestLevel = gameState.previousLivesSkillLevels[skillId] || 0;
        
        // Store the highest level
        gameState.previousLivesSkillLevels[skillId] = Math.max(currentLevel, previousBestLevel);
    }
    
    console.log("saveSkillLevelsForNextLife() - Skill levels saved successfully");
}

// Make functions available globally
window.initializeSkillSystem = initializeSkillSystem;
window.addSkillXP = addSkillXP;
window.trainSkill = trainSkill;
window.getSkillInfo = getSkillInfo;
window.getSkillsByCategory = getSkillsByCategory;
window.getAllCategories = getAllCategories;
window.calculateXPForLevel = calculateXPForLevel;
window.processSkillsData = processSkillsData;
window.saveSkillLevelsForNextLife = saveSkillLevelsForNextLife;

console.log("skill-system.js - Simplified skill system loaded successfully");

// Export functions for ES module usage
export {
    initializeSkillSystem,
    addSkillXP,
    trainSkill,
    getSkillInfo,
    getSkillsByCategory,
    getAllCategories,
    calculateXPForLevel,
    processSkillsData,
    saveSkillLevelsForNextLife
};