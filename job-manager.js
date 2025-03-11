// enhanced-job-manager.js
// An enhanced version of the job system that integrates with the new skill system

console.log("enhanced-job-manager.js - Module loading");

// Constants for job system
const JOB_CONSTANTS = {
    BASE_XP_REQUIRED: 100,      // Base XP needed for job level up
    XP_SCALING_FACTOR: 1.1,     // How much XP requirements increase per level
    PERFORMANCE_BASE: 100,      // Base performance value (100%)
    MAX_PERFORMANCE: 150,       // Maximum performance value (150%)
    MIN_PERFORMANCE: 50,        // Minimum performance value (50%)
    SKILL_MATCH_FACTOR: 0.05,   // How much each skill level contributes to performance
    PERFORMANCE_CHECK_INTERVAL: 3600 // How often to update job performance (1 hour)
};

// Initialize the enhanced job system
export function initializeEnhancedJobSystem() {
    console.log("initializeEnhancedJobSystem() - Setting up enhanced job system");
    
    // Check if the original job system is available
    if (typeof window.processJobProgress !== 'function') {
        console.error("initializeEnhancedJobSystem() - Original job system functions not found");
        return false;
    }
    
    // Ensure gameState has the necessary job-related structures
    if (!gameState.jobLevels) {
        gameState.jobLevels = {};
    }
    
    if (!gameState.jobBonuses) {
        gameState.jobBonuses = {};
    }
    
    if (!gameState.jobPerformance) {
        gameState.jobPerformance = {
            current: JOB_CONSTANTS.PERFORMANCE_BASE,
            factors: {
                skillMatch: 0,
                consistency: 0,
                energy: 0,
                attributeBonus: 0
            },
            history: []
        };
    }
    
    // Set up job performance update timer
    setupPerformanceUpdateTimer();
    
    // Wrap or replace original functions
    wrapOriginalJobFunctions();
    
    console.log("initializeEnhancedJobSystem() - Enhanced job system initialized");
    return true;
}

// Set up job performance update timer
function setupPerformanceUpdateTimer() {
    console.log("setupPerformanceUpdateTimer() - Setting up performance timer");
    
    // Clear any existing timer
    if (window.performanceUpdateTimer) {
        clearInterval(window.performanceUpdateTimer);
    }
    
    // Set up new timer
    window.performanceUpdateTimer = setInterval(() => {
        if (!gameState.gamePaused && gameState.activeJob) {
            updateJobPerformance();
        }
    }, JOB_CONSTANTS.PERFORMANCE_CHECK_INTERVAL);
    
    console.log(`setupPerformanceUpdateTimer() - Performance timer set to check every ${JOB_CONSTANTS.PERFORMANCE_CHECK_INTERVAL}ms`);
}

// Wrap or replace original job system functions
function wrapOriginalJobFunctions() {
    console.log("wrapOriginalJobFunctions() - Wrapping original job functions");
    
    // Store original functions
    window.originalApplyForJob = window.applyForJob;
    window.originalProcessJobProgress = window.processJobProgress;
    window.originalQuitJob = window.quitJob;
    
    // Replace applyForJob with enhanced version
    window.applyForJob = enhancedApplyForJob;
    
    // Replace processJobProgress with enhanced version
    window.processJobProgress = enhancedProcessJobProgress;
    
    // Replace quitJob with enhanced version
    window.quitJob = enhancedQuitJob;
    
    console.log("wrapOriginalJobFunctions() - Original job functions wrapped successfully");
}

// Enhanced apply for job function
function enhancedApplyForJob(jobIndex, tierLevel = 0) {
    console.log(`enhancedApplyForJob() - Applying for job at index ${jobIndex}, tier ${tierLevel}`);
    
    // Get the job data
    const jobData = typeof window.getJobData === 'function' ? 
        window.getJobData(jobIndex, tierLevel) : null;
    
    if (!jobData) {
        console.error("enhancedApplyForJob() - Job data not found");
        return false;
    }
    
    // Check if player meets enhanced requirements
    if (!meetsEnhancedJobRequirements(jobData, tierLevel)) {
        console.warn("enhancedApplyForJob() - Player does not meet enhanced requirements");
        
        if (typeof window.showNotification === 'function') {
            window.showNotification("Job Application", "You don't meet the skill requirements for this job", "error");
        }
        
        return false;
    }
    
    // Call the original applyForJob function
    const success = window.originalApplyForJob(jobIndex, tierLevel);
    
    if (success) {
        // Initialize performance tracking for the new job
        resetJobPerformance();
        
        // Additional logic for the enhanced job system
        trackJobStartTime();
        
        // Log the event with more details
        if (typeof window.logEvent === 'function') {
            window.logEvent(`Started a new job as a ${jobData.title}. Use your skills effectively to increase performance!`, 'career');
        }
    }
    
    return success;
}

// Enhanced process job progress function
function enhancedProcessJobProgress(deltaTime) {
    // Skip if no active job or game is paused
    if (!gameState.activeJob || gameState.gamePaused) {
        return;
    }
    
    const job = gameState.activeJob;
    const jobId = job.id;
    
    // Calculate performance modifier
    const performanceModifier = gameState.jobPerformance ? 
        (gameState.jobPerformance.current / JOB_CONSTANTS.PERFORMANCE_BASE) : 1.0;
    
    // Enhanced XP gain based on performance and skills
    const baseProgressRate = 1.0; // Base units per tick
    
    // Calculate enhanced XP gain
    const progressGain = baseProgressRate * performanceModifier * (deltaTime / 1000);
    
    // Update job progress
    gameState.jobProgress += progressGain;
    
    // Get current job level
    const currentLevel = gameState.jobLevels && gameState.jobLevels[jobId] ? 
        gameState.jobLevels[jobId] : 1;
    
    // Calculate XP needed for next level
    const progressNeeded = calculateXPForJobLevel(currentLevel);
    
    // Check for level up
    if (gameState.jobProgress >= progressNeeded) {
        // Level up the job
        levelUpEnhancedJob(jobId);
        
        // Reset progress
        gameState.jobProgress = 0;
    }
    
    // Process enhanced income with performance factor
    processEnhancedJobIncome(job, deltaTime, performanceModifier);
    
    // Process enhanced skill gains
    processEnhancedSkillGains(job, deltaTime, performanceModifier);
}

// Enhanced quit job function
function enhancedQuitJob() {
    console.log("enhancedQuitJob() - Quitting current job");
    
    if (!gameState.activeJob) {
        console.warn("enhancedQuitJob() - No active job to quit");
        return false;
    }
    
    const oldJobTitle = gameState.activeJob.title;
    
    // Call original quit job function
    const success = window.originalQuitJob();
    
    if (success) {
        // Additional cleanup for enhanced job system
        resetJobPerformance();
        
        // Add additional logging
        if (typeof window.logEvent === 'function') {
            window.logEvent(`You quit your job as a ${oldJobTitle}. All job-related bonuses have been removed.`, 'career');
        }
    }
    
    return success;
}

// Check if player meets enhanced job requirements
function meetsEnhancedJobRequirements(jobData, tierLevel = 0) {
    console.log(`meetsEnhancedJobRequirements() - Checking requirements for job ${jobData?.id}, tier ${tierLevel}`);
    
    // Call original function first
    if (typeof window.meetsJobRequirements === 'function') {
        const basicRequirementsMet = window.meetsJobRequirements(jobData, tierLevel);
        
        if (!basicRequirementsMet) {
            return false;
        }
    }
    
    // Enhanced skill checks
    const requiredSkills = getRequiredSkillsForJob(jobData);
    
    for (const [skillId, requiredLevel] of Object.entries(requiredSkills)) {
        // Get player's current level in this skill
        const playerSkillLevel = getPlayerSkillLevel(skillId);
        
        // Check if player meets the requirement
        if (playerSkillLevel < requiredLevel) {
            console.warn(`meetsEnhancedJobRequirements() - Player's ${skillId} level (${playerSkillLevel}) is below required level (${requiredLevel})`);
            return false;
        }
    }
    
    // Check attribute requirements if any
    const requiredAttributes = getRequiredAttributesForJob(jobData);
    
    for (const [attributeId, requiredValue] of Object.entries(requiredAttributes)) {
        // Get player's attribute value
        const playerAttributeValue = typeof window.getAttributeValue === 'function' ?
            window.getAttributeValue(attributeId) : (gameState.attributes?.[attributeId]?.value || 0);
        
        // Check if player meets the requirement
        if (playerAttributeValue < requiredValue) {
            console.warn(`meetsEnhancedJobRequirements() - Player's ${attributeId} (${playerAttributeValue}) is below required value (${requiredValue})`);
            return false;
        }
    }
    
    return true;
}

// Get required skills for a job
function getRequiredSkillsForJob(jobData) {
    // Default to just Map Awareness if no specific requirements
    const requiredSkills = {
        "map_awareness": jobData.minSkill || 0
    };
    
    // Check for explicit skill requirements in the job data
    if (jobData.requiredSkills) {
        Object.assign(requiredSkills, jobData.requiredSkills);
    }
    
    return requiredSkills;
}

// Get required attributes for a job
function getRequiredAttributesForJob(jobData) {
    // Default to no attribute requirements
    const requiredAttributes = {};
    
    // Check for explicit attribute requirements in the job data
    if (jobData.requiredAttributes) {
        Object.assign(requiredAttributes, jobData.requiredAttributes);
    }
    
    return requiredAttributes;
}

// Get player's skill level
function getPlayerSkillLevel(skillId) {
    // Check if the enhanced skill system is available
    if (gameState.skills && gameState.skills[skillId]) {
        return gameState.skills[skillId].level || 0;
    }
    
    // Fallback for old skill system
    if (typeof gameState.skills === 'object' && gameState.skills.hasOwnProperty(skillId)) {
        if (typeof gameState.skills[skillId] === 'object') {
            return gameState.skills[skillId].level || 0;
        } else {
            return gameState.skills[skillId] || 0;
        }
    }
    
    return 0;
}

// Reset job performance tracking
function resetJobPerformance() {
    console.log("resetJobPerformance() - Resetting job performance tracking");
    
    // Initialize with base performance
    gameState.jobPerformance = {
        current: JOB_CONSTANTS.PERFORMANCE_BASE,
        factors: {
            skillMatch: 0,
            consistency: 0,
            energy: 0,
            attributeBonus: 0
        },
        history: []
    };
}

// Track job start time
function trackJobStartTime() {
    console.log("trackJobStartTime() - Tracking job start time");
    
    if (!gameState.jobTime) {
        gameState.jobTime = {};
    }
    
    if (gameState.activeJob) {
        gameState.jobTime[gameState.activeJob.id] = {
            startTime: Date.now(),
            totalTime: gameState.jobTime[gameState.activeJob.id]?.totalTime || 0
        };
    }
}

// Update job performance
function updateJobPerformance() {
    console.log("updateJobPerformance() - Updating job performance");
    
    if (!gameState.activeJob) {
        return;
    }
    
    // Calculate performance factors
    const factors = calculatePerformanceFactors();
    
    // Store factors
    gameState.jobPerformance.factors = factors;
    
    // Calculate overall performance (base 100 + factors)
    let newPerformance = JOB_CONSTANTS.PERFORMANCE_BASE + 
        factors.skillMatch + 
        factors.consistency + 
        factors.energy + 
        factors.attributeBonus;
    
    // Ensure it stays within reasonable bounds
    newPerformance = Math.max(
        JOB_CONSTANTS.MIN_PERFORMANCE, 
        Math.min(JOB_CONSTANTS.MAX_PERFORMANCE, newPerformance)
    );
    
    // Update current performance (with smoothing)
    const currentPerformance = gameState.jobPerformance.current;
    gameState.jobPerformance.current = currentPerformance * 0.8 + newPerformance * 0.2;
    
    // Add to history (once per game day)
    if (gameState.ticksSinceDayStart === 0) {
        gameState.jobPerformance.history.push({
            day: gameState.day,
            performance: gameState.jobPerformance.current
        });
        
        // Keep history length reasonable
        if (gameState.jobPerformance.history.length > 30) {
            gameState.jobPerformance.history.shift();
        }
    }
    
    console.log(`updateJobPerformance() - New performance: ${gameState.jobPerformance.current.toFixed(1)}%`);
}

// Calculate performance factors
function calculatePerformanceFactors() {
    console.log("calculatePerformanceFactors() - Calculating job performance factors");
    
    const factors = {
        skillMatch: 0,
        consistency: 0,
        energy: 0,
        attributeBonus: 0
    };
    
    if (!gameState.activeJob) {
        return factors;
    }
    
    // Skill match factor - how well the player's skills match the job
    const jobSkills = getRelevantSkillsForJob(gameState.activeJob);
    let skillSum = 0;
    let skillCount = 0;
    
    for (const [skillId, weight] of Object.entries(jobSkills)) {
        const skillLevel = getPlayerSkillLevel(skillId);
        skillSum += skillLevel * weight;
        skillCount += weight;
    }
    
    if (skillCount > 0) {
        const avgWeightedSkill = skillSum / skillCount;
        // Each 5 levels of average skill adds 5% performance
        factors.skillMatch = Math.floor(avgWeightedSkill / 5) * 5;
    }
    
    // Consistency factor - time in current job
    const jobId = gameState.activeJob.id;
    const jobStartTime = gameState.jobTime && gameState.jobTime[jobId] ? 
        gameState.jobTime[jobId].startTime : Date.now();
    
    const timeInJob = (Date.now() - jobStartTime) / (1000 * 60 * 60 * 24); // in days
    
    // Each 30 days at job adds 2% up to 10%
    factors.consistency = Math.min(10, Math.floor(timeInJob / 30) * 2);
    
    // Energy factor
    const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
    // Below 30% energy reduces performance, above 70% improves it
    if (energyPercent < 30) {
        factors.energy = -10; // Penalty for low energy
    } else if (energyPercent > 70) {
        factors.energy = 5; // Bonus for high energy
    }
    
    // Attribute bonus - based on relevant attributes for the job
    if (typeof window.getAttributeValue === 'function') {
        const relevantAttributes = getRelevantAttributesForJob(gameState.activeJob);
        let attrSum = 0;
        
        for (const [attrId, weight] of Object.entries(relevantAttributes)) {
            const attrValue = window.getAttributeValue(attrId);
            // Each point above 5 adds a small bonus weighted by importance
            attrSum += (attrValue - 5) * weight * 0.5;
        }
        
        factors.attributeBonus = Math.floor(attrSum);
    }
    
    return factors;
}

// Get relevant skills for a job with weights
function getRelevantSkillsForJob(jobData) {
    // Default to map awareness if no specific skills
    const relevantSkills = {
        "map_awareness": 1.0
    };
    
    // Check for explicit relevant skills in the job data
    if (jobData.relevantSkills) {
        Object.assign(relevantSkills, jobData.relevantSkills);
    } else if (jobData.skillGainPerYear) {
        // Use skills that gain experience as relevant skills
        for (const skillId in jobData.skillGainPerYear) {
            const gainRate = jobData.skillGainPerYear[skillId];
            // Use gain rate as weight
            relevantSkills[skillId] = gainRate / 5; // Normalize weight
        }
    }
    
    return relevantSkills;
}

// Get relevant attributes for a job with weights
function getRelevantAttributesForJob(jobData) {
    // Default to intelligence if no specific attributes
    const relevantAttributes = {
        "intelligence": 1.0
    };
    
    // Check for explicit relevant attributes in the job data
    if (jobData.relevantAttributes) {
        Object.assign(relevantAttributes, jobData.relevantAttributes);
    } else {
        // Try to infer from category if using new skill system
        const categoryPrimaryAttrs = {};
        const categorySecondaryAttrs = {};
        
        // Build lookup of category to attributes
        if (gameState.skillCategories) {
            for (const categoryId in gameState.skillCategories) {
                const category = gameState.skillCategories[categoryId];
                if (category.primaryAttribute) {
                    categoryPrimaryAttrs[categoryId] = category.primaryAttribute;
                }
                if (category.secondaryAttribute) {
                    categorySecondaryAttrs[categoryId] = category.secondaryAttribute;
                }
            }
        }
        
        // Check each relevant skill for its category
        for (const skillId in getRelevantSkillsForJob(jobData)) {
            const skill = gameState.skills[skillId];
            if (skill && skill.categoryId) {
                // Add primary attribute with weight 1.0
                const primaryAttr = categoryPrimaryAttrs[skill.categoryId];
                if (primaryAttr) {
                    relevantAttributes[primaryAttr] = (relevantAttributes[primaryAttr] || 0) + 1.0;
                }
                
                // Add secondary attribute with weight 0.5
                const secondaryAttr = categorySecondaryAttrs[skill.categoryId];
                if (secondaryAttr) {
                    relevantAttributes[secondaryAttr] = (relevantAttributes[secondaryAttr] || 0) + 0.5;
                }
            }
        }
    }
    
    return relevantAttributes;
}

// Calculate XP needed for a specific job level
function calculateXPForJobLevel(level) {
    return Math.floor(JOB_CONSTANTS.BASE_XP_REQUIRED * Math.pow(JOB_CONSTANTS.XP_SCALING_FACTOR, level - 1));
}

// Level up the job with enhanced effects
function levelUpEnhancedJob(jobId) {
    console.log(`levelUpEnhancedJob() - Leveling up job: ${jobId}`);
    
    // Call original level up if available
    if (typeof window.levelUpJob === 'function') {
        const newLevel = window.levelUpJob(jobId);
        
        // Enhanced level up effects
        if (newLevel) {
            // Boost performance temporarily
            gameState.jobPerformance.current += 5;
            
            // Add special level up event
            if (typeof window.logEvent === 'function') {
                window.logEvent(`Your exceptional work has earned you a promotion to level ${newLevel}!`, 'career');
            }
            
            // Play level up sound
            if (typeof window.playSound === 'function') {
                window.playSound('job-level-up');
            }
        }
        
        return newLevel;
    }
    
    // Fallback implementation
    if (!gameState.jobLevels) {
        gameState.jobLevels = {};
    }
    
    // Initialize or increment job level
    if (!gameState.jobLevels[jobId]) {
        gameState.jobLevels[jobId] = 1;
    } else {
        gameState.jobLevels[jobId]++;
    }
    
    const newLevel = gameState.jobLevels[jobId];
    
    // Log the level up
    if (typeof window.logEvent === 'function') {
        window.logEvent(`You've reached level ${newLevel} in your job!`, 'career');
    }
    
    return newLevel;
}

// Process job income with enhanced modifiers
function processEnhancedJobIncome(jobData, deltaTime, performanceModifier = 1.0) {
    console.log("processEnhancedJobIncome() - Processing job income with performance modifier");
    
    if (!jobData || !jobData.incomePerYear) {
        return;
    }
    
    // Get gold multiplier from job bonuses
    const jobId = jobData.id;
    const goldMultiplier = gameState.jobBonuses && gameState.jobBonuses[jobId] ?
        (1 + gameState.jobBonuses[jobId].goldMultiplier) : 1;
    
    // Apply attribute bonus for earnings if available
    let attributeBonus = 1.0;
    if (typeof window.getAttributeValue === 'function') {
        const relevantAttributes = getRelevantAttributesForJob(jobData);
        let highestWeight = 0;
        let bestAttribute = null;
        
        // Find the attribute with highest weight
        for (const [attrId, weight] of Object.entries(relevantAttributes)) {
            if (weight > highestWeight) {
                highestWeight = weight;
                bestAttribute = attrId;
            }
        }
        
        if (bestAttribute) {
            const attrValue = window.getAttributeValue(bestAttribute);
            // Each point above 5 adds 1% to earnings
            attributeBonus = 1.0 + Math.max(0, (attrValue - 5) * 0.01);
        }
    }
    
    // Calculate income per second with all modifiers
    const incomePerSecond = (jobData.incomePerYear / 31536000) * // Convert yearly to per second
        performanceModifier * goldMultiplier * attributeBonus;
    
    // Apply income for this tick
    const income = incomePerSecond * deltaTime;
    
    // Add to gold
    gameState.gold += income;
    
    // Track in statistics
    gameState.statistics.totalGoldEarned = (gameState.statistics.totalGoldEarned || 0) + income;
    gameState.gameStats.totalGoldEarned = (gameState.gameStats.totalGoldEarned || 0) + income;
    
    // Track income sources
    gameState.income = gameState.income || {};
    gameState.income.job = income;
    gameState.income.total = (gameState.income.total || 0) + income;
}

// Process enhanced skill gains from job
function processEnhancedSkillGains(jobData, deltaTime, performanceModifier = 1.0) {
    console.log("processEnhancedSkillGains() - Processing skill gains with performance modifier");
    
    if (!jobData || !jobData.skillGainPerYear) {
        return;
    }
    
    // Process skill gains
    for (const [skillId, gainPerYear] of Object.entries(jobData.skillGainPerYear)) {
        // Convert yearly gain to per second
        const gainPerSecond = gainPerYear / 31536000;
        
        // Apply gain for this tick with performance modifier
        const gain = gainPerSecond * deltaTime * performanceModifier;
        
        // Add to skill using enhanced skill system if available
        if (typeof window.addSkillXP === 'function') {
            window.addSkillXP(skillId, gain * 100); // Convert small gain to XP
        } else {
            // Fallback for old skill system
            if (!gameState.skillProgress) {
                gameState.skillProgress = {};
            }
            
            if (!gameState.skillProgress[skillId]) {
                gameState.skillProgress[skillId] = 0;
            }
            
            gameState.skillProgress[skillId] += gain;
            
            // Check for skill level up
            const currentLevel = getPlayerSkillLevel(skillId);
            const progressNeeded = 10 + (currentLevel * 5); // Simple progression formula
            
            if (gameState.skillProgress[skillId] >= progressNeeded) {
                // Level up the skill
                if (!gameState.skills[skillId]) {
                    if (typeof gameState.skills[skillId] === 'object') {
                        gameState.skills[skillId].level = 1;
                    } else {
                        gameState.skills[skillId] = 1;
                    }
                } else {
                    if (typeof gameState.skills[skillId] === 'object') {
                        gameState.skills[skillId].level++;
                    } else {
                        gameState.skills[skillId]++;
                    }
                }
                
                // Reset progress
                gameState.skillProgress[skillId] = 0;
                
                // Log event
                const newLevel = getPlayerSkillLevel(skillId);
                if (typeof window.logEvent === 'function') {
                    window.logEvent(`Your ${skillId} skill increased to level ${newLevel}!`, 'skill');
                }
            }
        }
    }
}

// Export functions for module usage
export {
    meetsEnhancedJobRequirements,
    calculatePerformanceFactors,
    getRelevantSkillsForJob,
    getRelevantAttributesForJob,
    calculateXPForJobLevel,
    updateJobPerformance
};

// Make functions available globally
window.initializeEnhancedJobSystem = initializeEnhancedJobSystem;
window.meetsEnhancedJobRequirements = meetsEnhancedJobRequirements;
window.calculatePerformanceFactors = calculatePerformanceFactors;
window.getRelevantSkillsForJob = getRelevantSkillsForJob;
window.getRelevantAttributesForJob = getRelevantAttributesForJob;
window.calculateXPForJobLevel = calculateXPForJobLevel;
window.updateJobPerformance = updateJobPerformance;

console.log("enhanced-job-manager.js - Module loaded successfully");