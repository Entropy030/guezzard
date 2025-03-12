// skill-system.js - Consolidated Skill System
// This file combines functionality from:
// - systems/skill-system.js
// - skill-system-integration.js

console.log("skill-system.js - Loading consolidated skill system");

// Constants for skill system
const SKILL_CONSTANTS = {
    BASE_XP_REQUIRED: 100,      // Base XP needed for level up
    XP_SCALING_FACTOR: 1.1,     // How much XP requirements increase per level
    SYNERGY_BONUS_CAP: 0.5,     // Maximum bonus from skill synergies (50%)
    ATTRIBUTE_SCALING: 0.05,    // How much each attribute point affects growth (5%)
    MAX_ATTRIBUTE_VALUE: 20,    // Maximum value for attributes
    MIN_ATTRIBUTE_VALUE: 1,     // Minimum value for attributes
    DECAY_INTERVAL: 86400,      // Skill decay interval in milliseconds (1 day)
    DECAY_CHECK_INTERVAL: 3600  // How often to check for decay (1 hour)
};

// Cache for optimizing skill calculations
const skillCache = {
    calculatedSynergies: {},
    effectiveGrowthRates: {},
    lastUpdateTime: 0
};

/**
 * Initialize the skill system
 */
export function initializeSkillSystem() {
    console.log("initializeSkillSystem() - Setting up enhanced skill system");
    
    // Ensure game state has the necessary structures
    ensureSkillStructures();
    
    // Set up skill decay timer
    setupSkillDecay();
    
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
    
    // Ensure attributes object exists
    if (!gameState.attributes) {
        gameState.attributes = {};
    }
    
    // Ensure skill categories object exists
    if (!gameState.skillCategories) {
        gameState.skillCategories = {};
    }
    
    // Ensure skill progress object exists
    if (!gameState.skillProgress) {
        gameState.skillProgress = {};
    }
}

/**
 * Set up skill decay timer
 */
function setupSkillDecay() {
    console.log("setupSkillDecay() - Setting up skill decay timer");
    
    // Clear any existing timer
    if (window.skillDecayTimer) {
        clearInterval(window.skillDecayTimer);
    }
    
    // Set up new timer
    window.skillDecayTimer = setInterval(() => {
        if (!gameState.gamePaused) {
            processSkillDecay();
        }
    }, SKILL_CONSTANTS.DECAY_CHECK_INTERVAL);
    
    console.log(`setupSkillDecay() - Decay timer set to check every ${SKILL_CONSTANTS.DECAY_CHECK_INTERVAL}ms`);
}

/**
 * Process skill decay for all skills
 */
export function processSkillDecay() {
    console.log("processSkillDecay() - Processing skill decay");
    
    const now = Date.now();
    
    // Process each skill
    for (const skillId in gameState.skills) {
        const skill = gameState.skills[skillId];
        
        // Skip if skill doesn't have decay properties
        if (!skill.decayRate) continue;
        
        // Calculate time since last update
        const lastUpdated = skill.lastUpdated || now;
        const timeSinceUpdate = now - lastUpdated;
        
        // Only decay if enough time has passed
        if (timeSinceUpdate >= SKILL_CONSTANTS.DECAY_INTERVAL) {
            // Calculate decay amount
            const decayIntervals = Math.floor(timeSinceUpdate / SKILL_CONSTANTS.DECAY_INTERVAL);
            let decayAmount = skill.level * skill.decayRate * decayIntervals;
            
            // Apply discipline attribute to reduce decay
            const disciplineValue = getAttributeValue("discipline");
            const disciplineBonus = 1 - (disciplineValue / SKILL_CONSTANTS.MAX_ATTRIBUTE_VALUE * 0.5);
            decayAmount *= disciplineBonus;
            
            // Apply the decay
            if (skill.xp > 0) {
                // First decay XP
                skill.xp = Math.max(0, skill.xp - decayAmount * 10);
            } else if (skill.level > skill.baseValue) {
                // Then decay levels if XP is gone
                skill.level = Math.max(skill.baseValue, skill.level - decayAmount);
            }
            
            // Update last updated timestamp
            skill.lastUpdated = now;
        }
    }
    
    // Update skill display if needed
    if (typeof window.updateSkillDisplay === 'function') {
        window.updateSkillDisplay();
    }
}

/**
 * Get attribute value with modifiers applied
 * @param {string} attributeId - Attribute identifier
 * @returns {number} - Attribute value
 */
export function getAttributeValue(attributeId) {
    if (!gameState.attributes || !gameState.attributes[attributeId]) {
        console.warn(`getAttributeValue() - Attribute ${attributeId} not found`);
        return SKILL_CONSTANTS.MIN_ATTRIBUTE_VALUE;
    }
    
    const attribute = gameState.attributes[attributeId];
    let value = attribute.value;
    
    // Apply modifiers if any
    if (attribute.modifiers && Array.isArray(attribute.modifiers)) {
        attribute.modifiers.forEach(modifier => {
            if (modifier.active) {
                value += modifier.value;
            }
        });
    }
    
    // Ensure value is within range
    return Math.max(
        SKILL_CONSTANTS.MIN_ATTRIBUTE_VALUE,
        Math.min(SKILL_CONSTANTS.MAX_ATTRIBUTE_VALUE, value)
    );
}

/**
 * Calculate synergy bonus for a skill
 * @param {string} skillId - Skill identifier
 * @returns {number} - Synergy bonus (0-0.5)
 */
export function calculateSkillSynergy(skillId) {
    // Check cache first
    if (skillCache.calculatedSynergies[skillId]) {
        return skillCache.calculatedSynergies[skillId];
    }
    
    const skill = gameState.skills[skillId];
    if (!skill || !skill.synergies || skill.synergies.length === 0) {
        return 0;
    }
    
    let synergyBonus = 0;
    
    // Calculate bonus from each synergy skill
    skill.synergies.forEach(synergySkillId => {
        if (gameState.skills[synergySkillId]) {
            const synergySkill = gameState.skills[synergySkillId];
            // Each level of the synergy skill contributes a small bonus
            synergyBonus += (synergySkill.level / 100) * 0.1;
        }
    });
    
    // Cap the synergy bonus
    synergyBonus = Math.min(SKILL_CONSTANTS.SYNERGY_BONUS_CAP, synergyBonus);
    
    // Store in cache
    skillCache.calculatedSynergies[skillId] = synergyBonus;
    
    return synergyBonus;
}

/**
 * Calculate all skill synergies (for cache)
 */
function calculateAllSynergies() {
    for (const skillId in gameState.skills) {
        calculateSkillSynergy(skillId);
    }
}

/**
 * Calculate effective growth rate for a skill
 * @param {string} skillId - Skill identifier
 * @returns {number} - Effective growth rate
 */
export function calculateEffectiveGrowthRate(skillId) {
    // Check cache first
    if (skillCache.effectiveGrowthRates[skillId]) {
        return skillCache.effectiveGrowthRates[skillId];
    }
    
    const skill = gameState.skills[skillId];
    if (!skill) {
        return 1.0;
    }
    
    // Get the skill's category
    const category = gameState.skillCategories[skill.categoryId];
    if (!category) {
        return skill.growthRate || 1.0;
    }
    
    // Get attribute values
    const primaryAttrValue = getAttributeValue(category.primaryAttribute);
    const secondaryAttrValue = getAttributeValue(category.secondaryAttribute);
    
    // Calculate attribute bonus
    const primaryBonus = (primaryAttrValue - 5) * SKILL_CONSTANTS.ATTRIBUTE_SCALING;
    const secondaryBonus = (secondaryAttrValue - 5) * SKILL_CONSTANTS.ATTRIBUTE_SCALING * 0.5;
    
    // Calculate synergy bonus
    const synergyBonus = calculateSkillSynergy(skillId);
    
    // Calculate effective growth rate
    const effectiveRate = (skill.growthRate || 1.0) * (1 + primaryBonus + secondaryBonus + synergyBonus);
    
    // Store in cache
    skillCache.effectiveGrowthRates[skillId] = effectiveRate;
    
    return effectiveRate;
}

/**
 * Calculate all effective growth rates (for cache)
 */
function calculateEffectiveGrowthRates() {
    for (const skillId in gameState.skills) {
        calculateEffectiveGrowthRate(skillId);
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
    
    // Adjust amount by effective growth rate
    const effectiveRate = calculateEffectiveGrowthRate(skillId);
    const adjustedAmount = amount * effectiveRate;
    
    // Add XP
    skill.xp = (skill.xp || 0) + adjustedAmount;
    
    // Update last updated timestamp
    skill.lastUpdated = Date.now();
    
    // Check for level up
    checkSkillLevelUp(skillId);
    
    // Invalidate cache
    invalidateSkillCache();
    
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
        skill.level = skill.baseValue || 0;
    }
    
    // Calculate XP needed for next level
    const xpNeeded = calculateXPForLevel(skill.level);
    
    // Check if we have enough XP to level up
    if (skill.xp >= xpNeeded && skill.level < (skill.maxLevel || 100)) {
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
 * Invalidate skill cache
 */
function invalidateSkillCache() {
    skillCache.calculatedSynergies = {};
    skillCache.effectiveGrowthRates = {};
    skillCache.lastUpdateTime = Date.now();
}

/**
 * Train a specific skill
 * @param {string} skillId - Skill identifier
 * @param {number} hoursSpent - Hours spent training
 * @param {number} focusLevel - Focus level (0-2)
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
    const baseXPGain = 10 * hoursSpent;
    
    // Apply focus modifier
    const focusModifier = 0.5 + (focusLevel * 0.5); // 0.5 to 1.5 based on focus level 0-2
    
    // Apply focus attribute
    const focusAttribute = getAttributeValue("focus");
    const focusBonus = 1 + ((focusAttribute - 5) / 15); // -0.27 to +1 based on focus attribute 1-20
    
    // Calculate total XP gain
    const totalXPGain = baseXPGain * focusModifier * focusBonus;
    
    // Energy cost for training
    const energyCost = 5 * hoursSpent * (focusLevel + 1);
    
    // Check if player has enough energy
    if (gameState.energy < energyCost) {
        console.log(`trainSkill() - Not enough energy. Needed: ${energyCost}, Current: ${gameState.energy}`);
        
        if (typeof window.showNotification === 'function') {
            window.showNotification("Training Failed", "Not enough energy to train this skill", "error");
        }
        
        return false;
    }
    
    // Deduct energy
    gameState.energy -= energyCost;
    
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
 * Increase an attribute
 * @param {string} attributeId - Attribute identifier
 * @param {number} amount - Amount to increase
 * @returns {boolean} - Success/failure
 */
export function increaseAttribute(attributeId, amount = 1) {
    console.log(`increaseAttribute() - Increasing ${attributeId} by ${amount}`);
    
    if (!gameState.attributes || !gameState.attributes[attributeId]) {
        console.error(`increaseAttribute() - Attribute ${attributeId} not found`);
        return false;
    }
    
    const attribute = gameState.attributes[attributeId];
    
    // Check if at max value
    if (attribute.value >= SKILL_CONSTANTS.MAX_ATTRIBUTE_VALUE) {
        console.log(`increaseAttribute() - Attribute ${attributeId} already at max value`);
        
        if (typeof window.showNotification === 'function') {
            window.showNotification("Max Value", `${attribute.name} is already at maximum value`, "info");
        }
        
        return false;
    }
    
    // Increase attribute value
    attribute.value = Math.min(SKILL_CONSTANTS.MAX_ATTRIBUTE_VALUE, attribute.value + amount);
    
    // Log attribute increase
    if (typeof window.logEvent === 'function') {
        window.logEvent(`${attribute.name} increased to ${attribute.value}.`, 'attribute');
    }
    
    // Invalidate cache since attributes affect growth rates
    invalidateSkillCache();
    
    // Update display
    if (typeof window.updateSkillDisplay === 'function') {
        window.updateSkillDisplay();
    }
    
    return true;
}

/**
 * Calculate specialization bonus for a category
 * @param {string} categoryId - Category identifier
 * @returns {number} - Specialization bonus
 */
export function calculateSpecializationBonus(categoryId) {
    if (!gameState.skillCategories || !gameState.skillCategories[categoryId]) {
        return 0;
    }
    
    // Count skills in this category
    let skillCount = 0;
    let totalLevel = 0;
    let highestLevel = 0;
    
    // Calculate total levels and highest level
    for (const skillId in gameState.skills) {
        const skill = gameState.skills[skillId];
        if (skill.categoryId === categoryId) {
            skillCount++;
            totalLevel += skill.level;
            highestLevel = Math.max(highestLevel, skill.level);
        }
    }
    
    if (skillCount === 0) {
        return 0;
    }
    
    // Calculate average level in category
    const averageLevel = totalLevel / skillCount;
    
    // Calculate specialization bonus (higher if skills are more balanced)
    const balanceFactor = averageLevel / (highestLevel || 1);
    const specializationBonus = (averageLevel / 100) * balanceFactor;
    
    return specializationBonus;
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
    
    // Calculate effective growth rate
    const effectiveGrowthRate = calculateEffectiveGrowthRate(skillId);
    
    // Calculate synergy bonus
    const synergyBonus = calculateSkillSynergy(skillId);
    
    // Calculate XP needed for next level
    const xpForNextLevel = calculateXPForLevel(skill.level);
    
    // Calculate percentage to next level
    const percentToNextLevel = (skill.xp / xpForNextLevel) * 100;
    
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
        growthRate: skill.growthRate || 1.0,
        effectiveGrowthRate,
        synergyBonus,
        synergies: skill.synergies || []
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
            primaryAttribute: category.primaryAttribute || 'intelligence',
            secondaryAttribute: category.secondaryAttribute || 'focus',
            skillCount: getSkillsByCategory(categoryId).length
        });
    }
    
    return categories;
}

/**
 * Get all attributes
 * @returns {Array} - Array of attribute objects
 */
export function getAllAttributes() {
    if (!gameState.attributes) {
        return [];
    }
    
    const attributes = [];
    
    for (const attributeId in gameState.attributes) {
        const attribute = gameState.attributes[attributeId];
        attributes.push({
            id: attribute.id || attributeId,
            name: attribute.name || attributeId,
            description: attribute.description || '',
            icon: attribute.icon || '',
            value: attribute.value || 5,
            modifiers: attribute.modifiers || []
        });
    }
    
    return attributes;
}

// Make functions available globally
window.initializeSkillSystem = initializeSkillSystem;
window.getAttributeValue = getAttributeValue;
window.calculateSkillSynergy = calculateSkillSynergy;
window.calculateEffectiveGrowthRate = calculateEffectiveGrowthRate;
window.addSkillXP = addSkillXP;
window.trainSkill = trainSkill;
window.increaseAttribute = increaseAttribute;
window.calculateSpecializationBonus = calculateSpecializationBonus;
window.getSkillInfo = getSkillInfo;
window.getSkillsByCategory = getSkillsByCategory;
window.getAllCategories = getAllCategories;
window.getAllAttributes = getAllAttributes;
window.calculateXPForLevel = calculateXPForLevel;
window.processSkillDecay = processSkillDecay;

console.log("skill-system.js - Consolidated skill system loaded successfully");

// Export functions for ES module usage
export {
    initializeSkillSystem,
    getAttributeValue,
    calculateSkillSynergy,
    calculateEffectiveGrowthRate,
    addSkillXP,
    trainSkill,
    increaseAttribute,
    calculateSpecializationBonus,
    getSkillInfo,
    getSkillsByCategory,
    getAllCategories,
    getAllAttributes,
    calculateXPForLevel,
    processSkillDecay
};