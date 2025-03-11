// skill-system.js
// Enhanced skill system with attributes, categories, decay, synergies, and specialization

console.log("skill-system.js - Module loading");

// Cache for optimizing skill calculations
const skillCache = {
    calculatedSynergies: {},
    effectiveGrowthRates: {},
    lastUpdateTime: 0
};

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

// Initialize the skill system
export function initializeSkillSystem() {
    console.log("initializeSkillSystem() - Setting up enhanced skill system");
    
    // Ensure gameState has the necessary structures
    if (!gameState.skills) {
        gameState.skills = {};
    }
    
    if (!gameState.attributes) {
        gameState.attributes = {};
    }
    
    if (!gameState.skillCategories) {
        gameState.skillCategories = {};
    }
    
    // Load skills data
    loadSkillsData();
    
    // Set up skill decay timer
    setupSkillDecay();
    
    // Set up skill UI
    if (typeof window.setupSkillUI === 'function') {
        window.setupSkillUI();
    }
    
    console.log("initializeSkillSystem() - Skill system initialized");
    return true;
}

// Load skills data from JSON file
async function loadSkillsData() {
    console.log("loadSkillsData() - Loading skills data");
    
    try {
        // Fetch the skills.json file
        const response = await fetch('skills.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load skills.json: ${response.status} ${response.statusText}`);
        }
        
        const skillsData = await response.json();
        
        // Process the skills data
        processSkillsData(skillsData);
        
        console.log("loadSkillsData() - Skills data loaded successfully");
        return true;
    } catch (error) {
        console.error("Error loading skills data:", error);
        
        // Fall back to default skills if loading fails
        setupDefaultSkills();
        return false;
    }
}

// Process skills data and update game state
function processSkillsData(skillsData) {
    console.log("processSkillsData() - Processing skills data");
    
    // Process each category in the skills data
    skillsData.forEach(category => {
        // Special handling for attributes
        if (category.id === 'attributes') {
            processAttributes(category);
        } else {
            // Process regular skill categories
            processSkillCategory(category);
        }
    });
    
    // Initialize calculated values
    calculateAllSynergies();
    calculateEffectiveGrowthRates();
    
    console.log("processSkillsData() - Skills data processed");
}

// Process attributes category
function processAttributes(attributesCategory) {
    console.log("processAttributes() - Processing attributes");
    
    // Store the category in gameState
    gameState.attributesCategory = {
        id: attributesCategory.id,
        name: attributesCategory.name,
        description: attributesCategory.description
    };
    
    // Process each attribute
    attributesCategory.items.forEach(attribute => {
        // Check if attribute already exists in game state
        if (!gameState.attributes[attribute.id]) {
            // Initialize the attribute with default values
            gameState.attributes[attribute.id] = {
                id: attribute.id,
                name: attribute.name,
                description: attribute.description,
                icon: attribute.icon,
                value: attribute.baseValue,
                modifiers: attribute.modifiers || []
            };
        } else {
            // Update attribute metadata but keep the value
            gameState.attributes[attribute.id].name = attribute.name;
            gameState.attributes[attribute.id].description = attribute.description;
            gameState.attributes[attribute.id].icon = attribute.icon;
            gameState.attributes[attribute.id].modifiers = attribute.modifiers || [];
        }
    });
}

// Process a skill category
function processSkillCategory(category) {
    console.log(`processSkillCategory() - Processing category: ${category.id}`);
    
    // Store the category in gameState
    gameState.skillCategories[category.id] = {
        id: category.id,
        name: category.name,
        description: category.description,
        primaryAttribute: category.primaryAttribute,
        secondaryAttribute: category.secondaryAttribute
    };
    
    // Process each skill in the category
    category.items.forEach(skill => {
        processSkill(skill, category.id);
    });
}

// Process an individual skill
function processSkill(skill, categoryId) {
    console.log(`processSkill() - Processing skill: ${skill.id}`);
    
    // Check if skill already exists in game state
    if (!gameState.skills[skill.id]) {
        // Initialize the skill with default values
        gameState.skills[skill.id] = {
            id: skill.id,
            name: skill.name,
            description: skill.description,
            icon: skill.icon,
            categoryId: categoryId,
            baseValue: skill.baseValue,
            growthRate: skill.growthRate,
            decayRate: skill.decayRate,
            synergies: skill.synergies || [],
            level: skill.level || skill.baseValue,
            xp: skill.xp || 0,
            maxLevel: skill.maxLevel || 100,
            lastUpdated: Date.now()
        };
    } else {
        // Update skill metadata but keep progress values
        const existingSkill = gameState.skills[skill.id];
        existingSkill.name = skill.name;
        existingSkill.description = skill.description;
        existingSkill.icon = skill.icon;
        existingSkill.categoryId = categoryId;
        existingSkill.baseValue = skill.baseValue;
        existingSkill.growthRate = skill.growthRate;
        existingSkill.decayRate = skill.decayRate;
        existingSkill.synergies = skill.synergies || [];
        existingSkill.maxLevel = skill.maxLevel || 100;
        
        // Initialize lastUpdated if not present
        if (!existingSkill.lastUpdated) {
            existingSkill.lastUpdated = Date.now();
        }
    }
}

// Set up default skills if loading fails
function setupDefaultSkills() {
    console.log("setupDefaultSkills() - Setting up default skills");
    
    // Set up attributes
    gameState.attributes = {
        intelligence: { name: "Intelligence", value: 5 },
        creativity: { name: "Creativity", value: 5 },
        focus: { name: "Focus", value: 5 },
        adaptability: { name: "Adaptability", value: 5 },
        discipline: { name: "Discipline", value: 5 }
    };
    
    // Set up basic skill categories
    gameState.skillCategories = {
        analytical: { 
            name: "Analytical Skills", 
            primaryAttribute: "intelligence",
            secondaryAttribute: "focus"
        },
        practical: {
            name: "Practical Skills",
            primaryAttribute: "discipline",
            secondaryAttribute: "focus"
        }
    };
    
    // Set up basic skills
    gameState.skills = {
        map_awareness: {
            id: "map_awareness",
            name: "Map Awareness",
            description: "Ability to read and understand maps and geographical layouts",
            categoryId: "analytical",
            baseValue: 1,
            growthRate: 1.0,
            decayRate: 0.1,
            synergies: ["navigation"],
            level: 1,
            xp: 0,
            maxLevel: 100,
            lastUpdated: Date.now()
        },
        navigation: {
            id: "navigation",
            name: "Navigation",
            description: "Ability to find and follow routes in various environments",
            categoryId: "practical",
            baseValue: 1,
            growthRate: 0.9,
            decayRate: 0.1,
            synergies: ["map_awareness"],
            level: 1,
            xp: 0,
            maxLevel: 100,
            lastUpdated: Date.now()
        }
    };
}

// Set up skill decay timer
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

// Process skill decay for all skills
function processSkillDecay() {
    console.log("processSkillDecay() - Processing skill decay");
    
    const now = Date.now();
    
    // Process each skill
    for (const skillId in gameState.skills) {
        const skill = gameState.skills[skillId];
        
        // Calculate time since last update
        const timeSinceUpdate = now - (skill.lastUpdated || now);
        
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

// Get attribute value with modifiers applied
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

// Calculate synergy bonus for a skill
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

// Calculate all skill synergies (for cache)
function calculateAllSynergies() {
    for (const skillId in gameState.skills) {
        calculateSkillSynergy(skillId);
    }
}

// Calculate effective growth rate for a skill
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
        return skill.growthRate;
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
    const effectiveRate = skill.growthRate * (1 + primaryBonus + secondaryBonus + synergyBonus);
    
    // Store in cache
    skillCache.effectiveGrowthRates[skillId] = effectiveRate;
    
    return effectiveRate;
}

// Calculate all effective growth rates (for cache)
function calculateEffectiveGrowthRates() {
    for (const skillId in gameState.skills) {
        calculateEffectiveGrowthRate(skillId);
    }
}

// Add experience to a skill
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
    skill.xp += adjustedAmount;
    
    // Update last updated timestamp
    skill.lastUpdated = Date.now();
    
    // Check for level up
    checkSkillLevelUp(skillId);
    
    // Invalidate cache
    invalidateSkillCache();
    
    return true;
}

// Check if a skill should level up
function checkSkillLevelUp(skillId) {
    const skill = gameState.skills[skillId];
    if (!skill) {
        return false;
    }
    
    // Calculate XP needed for next level
    const xpNeeded = calculateXPForLevel(skill.level);
    
    // Check if we have enough XP to level up
    if (skill.xp >= xpNeeded && skill.level < skill.maxLevel) {
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

// Calculate XP needed for a specific level
function calculateXPForLevel(level) {
    return Math.floor(SKILL_CONSTANTS.BASE_XP_REQUIRED * Math.pow(SKILL_CONSTANTS.XP_SCALING_FACTOR, level - 1));
}

// Invalidate skill cache
function invalidateSkillCache() {
    skillCache.calculatedSynergies = {};
    skillCache.effectiveGrowthRates = {};
    skillCache.lastUpdateTime = Date.now();
}

// Train a specific skill
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
    
    // Add the XP
    addSkillXP(skillId, totalXPGain);
    
    // Energy cost for training
    const energyCost = 5 * hoursSpent * focusLevel;
    if (gameState.energy >= energyCost) {
        gameState.energy -= energyCost;
    } else {
        // Not enough energy, reduce effectiveness
        const energyRatio = gameState.energy / energyCost;
        gameState.energy = 0;
        
        // Log low energy warning
        if (typeof window.logEvent === 'function') {
            window.logEvent(`Low energy reduced training effectiveness for ${skill.name}.`, 'skill');
        }
    }
    
    // Log training activity
    if (typeof window.logEvent === 'function') {
        window.logEvent(`Trained ${skill.name} for ${hoursSpent} hours.`, 'skill');
    }
    
    // Update display
    if (typeof window.updateSkillDisplay === 'function') {
        window.updateSkillDisplay();
    }
    
    return true;
}

// Increase an attribute
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

// Calculate specialization bonus for a category
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

// Get skill info by ID
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
        id: skill.id,
        name: skill.name,
        description: skill.description,
        icon: skill.icon,
        level: skill.level,
        xp: skill.xp,
        xpForNextLevel,
        percentToNextLevel,
        category: category,
        growthRate: skill.growthRate,
        effectiveGrowthRate,
        synergyBonus,
        synergies: skill.synergies
    };
}

// Get all skills in a category
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

// Get all categories with skills
export function getAllCategories() {
    if (!gameState.skillCategories) {
        return [];
    }
    
    const categories = [];
    
    for (const categoryId in gameState.skillCategories) {
        const category = gameState.skillCategories[categoryId];
        categories.push({
            id: category.id,
            name: category.name,
            description: category.description,
            primaryAttribute: category.primaryAttribute,
            secondaryAttribute: category.secondaryAttribute,
            skillCount: getSkillsByCategory(categoryId).length
        });
    }
    
    return categories;
}

// Get all attributes
export function getAllAttributes() {
    if (!gameState.attributes) {
        return [];
    }
    
    const attributes = [];
    
    for (const attributeId in gameState.attributes) {
        const attribute = gameState.attributes[attributeId];
        attributes.push({
            id: attribute.id,
            name: attribute.name,
            description: attribute.description,
            icon: attribute.icon,
            value: attribute.value,
            modifiers: attribute.modifiers || []
        });
    }
    
    return attributes;
}

// Export functions for module usage
export {
    calculateXPForLevel,
    processSkillDecay,
    invalidateSkillCache
};

// Make all functions available globally
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

console.log("skill-system.js - Module loaded successfully");