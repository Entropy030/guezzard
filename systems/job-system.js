// job-system.js - Enhanced job system for career tracks and organization-based structure
// This file extends and modifies the original job-system.js

console.log("job-system.js - Loading enhanced job system");

// Constants for job system
const JOB_CONSTANTS = {
    BASE_XP_REQUIRED: 100,      // Base XP needed for job level up
    XP_SCALING_FACTOR: 1.1,     // How much XP requirements increase per level
    PERFORMANCE_BASE: 100,      // Base performance value (100%)
    MAX_PERFORMANCE: 150,       // Maximum performance value (150%)
    MIN_PERFORMANCE: 50,        // Minimum performance value (50%)
    SKILL_MATCH_FACTOR: 0.05,   // How much each skill level contributes to performance
    PERFORMANCE_CHECK_INTERVAL: 3600, // How often to update job performance (in ms)
    PROMOTION_CHECK_INTERVAL: 60000   // How often to check for promotions (in ms)
};

/**
 * Initialize the job system
 */
export function initializeJobSystem() {
    console.log("initializeJobSystem() - Setting up job system");
    
    // Ensure job-related structures exist in game state
    initializeJobStructures();
    
    // Set up job performance tracking
    initializeJobPerformance();
    
    // Set up periodic checks
    setupPeriodicChecks();
    
    console.log("Job system initialized successfully");
    return true;
}

/**
 * Initialize job-related structures in game state
 */
function initializeJobStructures() {
    // Initialize job levels tracking
    if (!gameState.jobLevels) {
        gameState.jobLevels = {};
    }
    
    // Initialize job bonuses
    if (!gameState.jobBonuses) {
        gameState.jobBonuses = {};
    }
    
    // Initialize job time tracking
    if (!gameState.jobTime) {
        gameState.jobTime = {};
    }
    
    // Initialize shown promotions tracking
    if (!gameState.shownPromotions) {
        gameState.shownPromotions = {};
    }
    
    // Initialize organizations (career tracks) and jobs
    if (!gameState.organizations) {
        gameState.organizations = [];
    }
    
    // Convert jobs data from flat array to organization-based structure if needed
    if (gameState.jobs && Array.isArray(gameState.jobs) && gameState.jobs.length > 0 && 
        (!gameState.organizations || gameState.organizations.length === 0)) {
        convertJobsToOrganizations();
    }
}

/**
 * Convert old jobs format to organization-based structure
 */
function convertJobsToOrganizations() {
    console.log("convertJobsToOrganizations() - Converting job data to organization structure");
    
    // Get career tracks from jobs.json (assuming it has been loaded with the new structure)
    fetch("data/jobs.json")
        .then(response => response.json())
        .then(orgData => {
            gameState.organizations = orgData;
            console.log(`Loaded ${orgData.length} organizations with career tracks`);
        })
        .catch(error => {
            console.error("Error loading organization data:", error);
            
            // Fallback - create basic structure from existing jobs
            const orgMap = {};
            
            // Group jobs by potential organization
            gameState.jobs.forEach(job => {
                const orgId = job.id.split('_')[0]; // Simple guess at organization from job id
                if (!orgMap[orgId]) {
                    orgMap[orgId] = {
                        id: orgId,
                        name: orgId.charAt(0).toUpperCase() + orgId.slice(1) + " Track",
                        jobs: []
                    };
                }
                
                orgMap[orgId].jobs.push(job);
            });
            
            // Convert map to array
            gameState.organizations = Object.values(orgMap);
        });
}

/**
 * Initialize job performance tracking
 */
function initializeJobPerformance() {
    console.log("initializeJobPerformance() - Setting up job performance tracking");
    
    // Initialize performance object if it doesn't exist
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
    
    // If player has an active job, track start time
    if (gameState.activeJob) {
        trackJobStartTime();
    }
}

/**
 * Set up periodic checks for job-related systems
 */
function setupPeriodicChecks() {
    // Set up performance update timer
    if (window.performanceUpdateTimer) {
        clearInterval(window.performanceUpdateTimer);
    }
    
    window.performanceUpdateTimer = setInterval(() => {
        if (!gameState.gamePaused && gameState.activeJob) {
            updateJobPerformance();
        }
    }, JOB_CONSTANTS.PERFORMANCE_CHECK_INTERVAL);
    
    // Set up promotion check timer
    if (window.promotionCheckTimer) {
        clearInterval(window.promotionCheckTimer);
    }
    
    window.promotionCheckTimer = setInterval(() => {
        if (!gameState.gamePaused && gameState.activeJob) {
            const promotions = checkForPromotions();
            if (promotions && promotions.length > 0) {
                showPromotionNotification(promotions[0]);
            }
        }
    }, JOB_CONSTANTS.PROMOTION_CHECK_INTERVAL);
}

/**
 * Get all organizations with their jobs
 * @returns {Array} - Array of organizations with job availability info
 */
export function getOrganizationsWithJobs() {
    console.log("getOrganizationsWithJobs() - Getting all career tracks and jobs");
    
    const result = [];
    
    // Check if organizations are loaded
    if (!gameState.organizations || gameState.organizations.length === 0) {
        console.warn("getOrganizationsWithJobs() - No organizations found");
        return [];
    }
    
    // Process each organization
    gameState.organizations.forEach(org => {
        // Check if organization has requirements
        const orgAvailable = checkOrganizationAvailability(org);
        
        // Get jobs in this organization with availability info
        const jobsWithAvailability = [];
        
        // Process each job in the organization
        (org.jobs || []).forEach(job => {
            const jobsInOrg = getJobsForOrganization(job, orgAvailable);
            jobsWithAvailability.push(...jobsInOrg);
        });
        
        // Add organization with its jobs
        result.push({
            id: org.id,
            name: org.name,
            description: org.description,
            available: orgAvailable,
            jobs: jobsWithAvailability
        });
    });
    
    return result;
}

/**
 * Check if an organization is available based on its requirements
 * @param {Object} org - Organization data
 * @returns {boolean} - Whether the organization is available
 */
function checkOrganizationAvailability(org) {
    // If no requirements, organization is available
    if (!org.requirements) {
        return true;
    }
    
    // Check skill requirements
    if (org.requirements.skills) {
        for (const [skillId, requiredLevel] of Object.entries(org.requirements.skills)) {
            const playerSkillLevel = getPlayerSkillLevel(skillId);
            if (playerSkillLevel < requiredLevel) {
                return false;
            }
        }
    }
    
    // Check attribute requirements
    if (org.requirements.attributes) {
        for (const [attrId, requiredValue] of Object.entries(org.requirements.attributes)) {
            const playerAttrValue = getAttributeValue(attrId);
            if (playerAttrValue < requiredValue) {
                return false;
            }
        }
    }
    
    return true;
}

/**
 * Get jobs for an organization with availability info
 * @param {Object} job - Job data
 * @param {boolean} orgAvailable - Whether the parent organization is available
 * @returns {Array} - Array of jobs with availability info
 */
function getJobsForOrganization(job, orgAvailable) {
    const result = [];
    
    // Skip if organization is not available
    if (!orgAvailable) {
        // Add job with unavailable status
        result.push({
            ...job,
            available: false,
            level: 0,
            hourlyRate: 0
        });
        return result;
    }
    
    // Get current job level if player has worked this job
    const jobLevel = gameState.jobLevels[job.id] || 0;
    
    // Process job tiers
    job.tiers.forEach(tier => {
        // Check if player meets requirements for this tier
        const isAvailable = meetsJobRequirements(job, tier.tier);
        
        // Calculate hourly rate
        const hourlyRate = calculateHourlyRate(job, tier);
        
        // Add job with availability info
        result.push({
            ...job,
            ...tier,
            id: job.id,  // Ensure ID is preserved
            available: isAvailable,
            level: jobLevel,
            hourlyRate: hourlyRate
        });
    });
    
    return result;
}

/**
 * Calculate hourly rate for a job
 * @param {Object} job - Job data
 * @param {Object} tier - Tier data
 * @returns {number} - Hourly rate
 */
function calculateHourlyRate(job, tier) {
    // Use tier's hourly rate if provided
    if (tier.incomePerHour) {
        return tier.incomePerHour;
    }
    
    // Calculate from yearly income
    if (tier.incomePerYear) {
        // Default to 2000 working hours per year if CONFIG not available
        const workingHoursPerYear = (window.CONFIG && window.CONFIG.settings && 
            window.CONFIG.settings.ticksInOneGameYear) ? 
            window.CONFIG.settings.ticksInOneGameYear / 5 : 2000;
        
        return tier.incomePerYear / workingHoursPerYear;
    }
    
    return 0;
}

/**
 * Select and apply for a job
 * @param {string} jobId - ID of the job
 * @param {number} tierLevel - Tier level of the job
 * @returns {boolean} - Success/failure of job selection
 */
export function selectJob(jobId, tierLevel = 0) {
    console.log(`selectJob() - Selecting job ${jobId}, tier ${tierLevel}`);
    
    // Get job data
    const jobData = getJobByIdAndTier(jobId, tierLevel);
    
    if (!jobData) {
        console.error(`selectJob() - Job ${jobId} at tier ${tierLevel} not found`);
        return false;
    }
    
    // Apply for the job using the existing system
    return applyForJob(jobData, tierLevel);
}

/**
 * Get job data by ID and tier
 * @param {string} jobId - ID of the job
 * @param {number} tierLevel - Tier level of the job
 * @returns {Object|null} - Job data or null if not found
 */
function getJobByIdAndTier(jobId, tierLevel = 0) {
    // Search through organizations
    for (const org of gameState.organizations || []) {
        for (const job of org.jobs || []) {
            if (job.id === jobId) {
                // Find the specific tier
                const tier = job.tiers.find(t => t.tier === tierLevel);
                if (tier) {
                    // Combine job and tier data
                    return {
                        ...job,
                        ...tier,
                        id: job.id,  // Ensure ID is preserved
                        organizationId: org.id
                    };
                }
            }
        }
    }
    
    return null;
}

/**
 * Apply for a job
 * @param {Object} jobData - Job data
 * @param {number} tierLevel - Tier level of the job
 * @returns {boolean} - Success/failure of job application
 */
export function applyForJob(jobData, tierLevel = 0) {
    console.log(`applyForJob() - Applying for job ${jobData.title}, tier ${tierLevel}`);
    
    if (!jobData) {
        console.error("applyForJob() - Job data not provided");
        return false;
    }
    
    // Check if player meets requirements
    if (!meetsJobRequirements(jobData, tierLevel)) {
        console.warn("applyForJob() - Player does not meet job requirements");
        
        if (typeof window.showNotification === 'function') {
            window.showNotification("Job Selection", "You don't meet the requirements for this job", "error");
        }
        
        return false;
    }
    
    // Quit current job if any
    if (gameState.activeJob) {
        quitJob();
    }
    
    // Apply for the job
    gameState.activeJob = { ...jobData };
    gameState.currentJobTier = tierLevel;
    gameState.jobProgress = 0;
    
    // Initialize job level if not exist
    if (!gameState.jobLevels[jobData.id]) {
        gameState.jobLevels[jobData.id] = 1;
    }
    
    // Initialize job time tracking
    trackJobStartTime();
    
    // Reset job performance
    resetJobPerformance();
    
    // Update statistics
    if (!gameState.statistics) {
        gameState.statistics = {};
    }
    
    gameState.statistics.jobsHeld = (gameState.statistics.jobsHeld || 0) + 1;
    
    // Log the event
    if (typeof window.logEvent === 'function') {
        window.logEvent(`You got a new job as a ${jobData.title}!`, 'career');
    }
    
    // Update UI
    if (typeof window.updateDisplay === 'function') {
        window.updateDisplay();
    }
    
    return true;
}

/**
 * Check if player meets job requirements
 * @param {Object} jobData - Job data
 * @param {number} tierLevel - Tier level of the job
 * @returns {boolean} - Whether player meets requirements
 */
export function meetsJobRequirements(jobData, tierLevel = 0) {
    console.log(`meetsJobRequirements() - Checking requirements for job ${jobData?.id}, tier ${tierLevel}`);
    
    // Get tier data
    let tierData = jobData;
    if (jobData.tiers) {
        tierData = jobData.tiers.find(tier => tier.tier === tierLevel) || jobData;
    }
    
    // Check skill requirements first
    if (tierData.requiredSkills) {
        for (const [skillId, requiredLevel] of Object.entries(tierData.requiredSkills)) {
            const playerSkillLevel = getPlayerSkillLevel(skillId);
            if (playerSkillLevel < requiredLevel) {
                console.log(`meetsJobRequirements() - Player's ${skillId} level (${playerSkillLevel}) is below required level (${requiredLevel})`);
                return false;
            }
        }
    }
    
    // Check minimum skill level (back-compat)
    if (tierData.minSkill) {
        // Use map_awareness as default skill
        const skillId = "map_awareness";
        const playerSkillLevel = getPlayerSkillLevel(skillId);
        if (playerSkillLevel < tierData.minSkill) {
            console.log(`meetsJobRequirements() - Player's ${skillId} level (${playerSkillLevel}) is below minimum level (${tierData.minSkill})`);
            return false;
        }
    }
    
    // Check previous job requirement if applicable
    if (tierData.requiredJobId && tierData.requiredJobLevel) {
        const requiredJobLevel = tierData.requiredJobLevel;
        const currentPrevJobLevel = gameState.jobLevels && gameState.jobLevels[tierData.requiredJobId] || 0;
        
        if (currentPrevJobLevel < requiredJobLevel) {
            console.log(`meetsJobRequirements() - Player's previous job level (${currentPrevJobLevel}) is below required level (${requiredJobLevel})`);
            return false;
        }
    }
    
    // Check attribute requirements if any
    if (tierData.requiredAttributes) {
        for (const [attrId, requiredValue] of Object.entries(tierData.requiredAttributes)) {
            const playerAttrValue = getAttributeValue(attrId);
            
            if (playerAttrValue < requiredValue) {
                console.log(`meetsJobRequirements() - Player's ${attrId} (${playerAttrValue}) is below required value (${requiredValue})`);
                return false;
            }
        }
    }
    
    // All requirements met
    return true;
}

/**
 * Get player's skill level for a specific skill
 * @param {string} skillId - Skill identifier
 * @returns {number} - Skill level
 */
function getPlayerSkillLevel(skillId) {
    // Check if the skill system is available
    if (gameState.skills && gameState.skills[skillId]) {
        if (typeof gameState.skills[skillId] === 'object') {
            return gameState.skills[skillId].level || 0;
        } else {
            return gameState.skills[skillId] || 0;
        }
    }
    
    return 0;
}

/**
 * Get attribute value with modifiers applied
 * @param {string} attributeId - Attribute identifier
 * @returns {number} - Attribute value
 */
function getAttributeValue(attributeId) {
    // Use the global function if available
    if (typeof window.getAttributeValue === 'function') {
        return window.getAttributeValue(attributeId);
    }
    
    // Fallback implementation
    if (!gameState.attributes || !gameState.attributes[attributeId]) {
        return 5; // Default value
    }
    
    const attribute = gameState.attributes[attributeId];
    let value = attribute.value || 5;
    
    // Apply modifiers if any
    if (attribute.modifiers && Array.isArray(attribute.modifiers)) {
        attribute.modifiers.forEach(modifier => {
            if (modifier.active) {
                value += modifier.value;
            }
        });
    }
    
    // Ensure value is within reasonable range
    return Math.max(1, Math.min(20, value));
}

/**
 * Quit current job
 * @returns {boolean} - Success/failure of quitting
 */
export function quitJob() {
    console.log("quitJob() - Quitting current job");
    
    if (!gameState.activeJob) {
        console.warn("quitJob() - No active job to quit");
        return false;
    }
    
    const oldJobTitle = gameState.activeJob.title;
    
    // Clear active job
    gameState.activeJob = null;
    gameState.currentJobTier = 0;
    gameState.jobProgress = 0;
    
    // Log event
    if (typeof window.logEvent === 'function') {
        window.logEvent(`You quit your job as a ${oldJobTitle}.`, 'career');
    }
    
    // Update UI
    if (typeof window.updateDisplay === 'function') {
        window.updateDisplay();
    }
    
    return true;
}

/**
 * Process job progress (called from game loop)
 * @param {number} deltaTime - Time since last update in milliseconds
 */
export function processJobProgress(deltaTime) {
    // Skip if no active job or game is paused
    if (!gameState.activeJob || gameState.gamePaused) {
        return;
    }
    
    const job = gameState.activeJob;
    const jobId = job.id;
    
    // Calculate performance modifier
    const performanceModifier = gameState.jobPerformance ? 
        (gameState.jobPerformance.current / JOB_CONSTANTS.PERFORMANCE_BASE) : 1.0;
    
    // Base progress rate (XP gained per second)
    const baseProgressRate = 1.0;
    
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
        levelUpJob(jobId);
        
        // Reset progress
        gameState.jobProgress = 0;
    }
    
    // Process income and skill gains
    processJobIncome(job, deltaTime, performanceModifier);
    processSkillGains(job, deltaTime, performanceModifier);
}

/**
 * Calculate XP needed for a specific job level
 * @param {number} level - Job level
 * @returns {number} - XP needed for next level
 */
export function calculateXPForJobLevel(level) {
    return Math.floor(JOB_CONSTANTS.BASE_XP_REQUIRED * Math.pow(JOB_CONSTANTS.XP_SCALING_FACTOR, level - 1));
}

/**
 * Level up a job
 * @param {string} jobId - Job identifier
 * @returns {number} - New job level
 */
function levelUpJob(jobId) {
    console.log(`levelUpJob() - Leveling up job: ${jobId}`);
    
    // Initialize job levels if needed
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
    
    // Apply level bonuses if any
    applyJobLevelBonuses(jobId, newLevel);
    
    // Log the level up
    if (typeof window.logEvent === 'function') {
        window.logEvent(`Your job level increased to ${newLevel}!`, 'career');
    }
    
    // Temporary performance boost on level up
    if (gameState.jobPerformance) {
        gameState.jobPerformance.current += 5;
        
        // Ensure it's within limits
        gameState.jobPerformance.current = Math.min(
            JOB_CONSTANTS.MAX_PERFORMANCE, 
            gameState.jobPerformance.current
        );
    }
    
    // Update UI
    if (typeof window.updateDisplay === 'function') {
        window.updateDisplay();
    }
    
    return newLevel;
}

/**
 * Apply job level bonuses
 * @param {string} jobId - Job identifier
 * @param {number} level - New job level
 */
function applyJobLevelBonuses(jobId, level) {
    console.log(`applyJobLevelBonuses() - Applying bonuses for job ${jobId} at level ${level}`);
    
    // Skip if no active job or job ID doesn't match
    if (!gameState.activeJob || gameState.activeJob.id !== jobId) {
        return;
    }
    
    // Check for level bonuses
    const levelBonuses = gameState.activeJob.levelBonuses;
    if (!levelBonuses || !Array.isArray(levelBonuses)) {
        return;
    }
    
    // Initialize job bonuses object if needed
    if (!gameState.jobBonuses) {
        gameState.jobBonuses = {};
    }
    
    if (!gameState.jobBonuses[jobId]) {
        gameState.jobBonuses[jobId] = {
            jobXpMultiplier: 0,
            goldMultiplier: 0,
            skillGainMultiplier: 0
        };
    }
    
    // Check each level bonus to see if it applies
    levelBonuses.forEach(bonus => {
        // Only apply if the bonus is for this level or below and hasn't been applied yet
        if (bonus.level <= level) {
            // Apply based on bonus type
            switch (bonus.bonusType) {
                case 'jobXpMultiplier':
                    gameState.jobBonuses[jobId].jobXpMultiplier += bonus.bonusValue;
                    
                    // Log the bonus
                    if (bonus.level === level && typeof window.logEvent === 'function') {
                        window.logEvent(`Job level ${level} bonus: +${bonus.bonusValue * 100}% Job XP gain!`, 'career');
                    }
                    break;
                    
                case 'goldMultiplier':
                    gameState.jobBonuses[jobId].goldMultiplier += bonus.bonusValue;
                    
                    // Log the bonus
                    if (bonus.level === level && typeof window.logEvent === 'function') {
                        window.logEvent(`Job level ${level} bonus: +${bonus.bonusValue * 100}% Gold gain!`, 'career');
                    }
                    break;
                    
                case 'skillGainMultiplier':
                    gameState.jobBonuses[jobId].skillGainMultiplier += bonus.bonusValue;
                    
                    // Log the bonus
                    if (bonus.level === level && typeof window.logEvent === 'function') {
                        window.logEvent(`Job level ${level} bonus: +${bonus.bonusValue * 100}% Skill XP gain!`, 'career');
                    }
                    break;
            }
        }
    });
}

/**
 * Process job income
 * @param {object} job - Job data
 * @param {number} deltaTime - Time since last update in milliseconds
 * @param {number} performanceModifier - Performance modifier (percentage as decimal)
 */
function processJobIncome(job, deltaTime, performanceModifier = 1.0) {
    // Skip if job has no income
    if (!job || (!job.incomePerYear && !job.incomePerHour)) {
        return;
    }
    
    // Get gold multiplier from job bonuses
    const jobId = job.id;
    let goldMultiplier = 1.0;
    
    if (gameState.jobBonuses && gameState.jobBonuses[jobId]) {
        goldMultiplier += gameState.jobBonuses[jobId].goldMultiplier || 0;
    }
    
    // Apply global gold multiplier if any
    if (gameState.multipliers && gameState.multipliers.gold) {
        goldMultiplier *= gameState.multipliers.gold;
    }
    
    // Get income per year (either directly or calculated from hourly rate)
    let incomePerYear = job.incomePerYear;
    if (!incomePerYear && job.incomePerHour) {
        // Default to 2000 working hours per year if CONFIG not available
        const workingHoursPerYear = (window.CONFIG && window.CONFIG.settings && 
            window.CONFIG.settings.ticksInOneGameYear) ? 
            window.CONFIG.settings.ticksInOneGameYear / 5 : 2000;
        
        incomePerYear = job.incomePerHour * workingHoursPerYear;
    }
    
    // Safe access to CONFIG for tick values
    const ticksInOneGameYear = (window.CONFIG && window.CONFIG.settings && 
        window.CONFIG.settings.ticksInOneGameYear) ? 
        window.CONFIG.settings.ticksInOneGameYear : 600;
    
    const tickInterval = (window.CONFIG && window.CONFIG.settings && 
        window.CONFIG.settings.tickInterval) ? 
        window.CONFIG.settings.tickInterval : 25;
    
    // Calculate income per second with all modifiers
    const incomePerSecond = (incomePerYear / (ticksInOneGameYear * (1000 / tickInterval))) * 
        performanceModifier * goldMultiplier;
    
    // Apply income for this tick
    const income = incomePerSecond * deltaTime;
    
    // Add to gold
    gameState.gold += income;
    
    // Track in statistics
    if (!gameState.statistics) {
        gameState.statistics = {};
    }
    
    gameState.statistics.totalGoldEarned = (gameState.statistics.totalGoldEarned || 0) + income;
}

/**
 * Process skill gains from job
 * @param {object} job - Job data
 * @param {number} deltaTime - Time since last update in milliseconds
 * @param {number} performanceModifier - Performance modifier (percentage as decimal)
 */
function processSkillGains(job, deltaTime, performanceModifier = 1.0) {
    // Skip if job has no skill gains
    if (!job || !job.skillGainPerYear) {
        return;
    }
    
    // Get skill gain multiplier from job bonuses
    const jobId = job.id;
    let skillMultiplier = 1.0;
    
    if (gameState.jobBonuses && gameState.jobBonuses[jobId]) {
        skillMultiplier += gameState.jobBonuses[jobId].skillGainMultiplier || 0;
    }
    
    // Apply global skill multiplier if any
    if (gameState.multipliers && gameState.multipliers.skill) {
        skillMultiplier *= gameState.multipliers.skill;
    }
    
    // Safe access to CONFIG for tick values
    const ticksInOneGameYear = (window.CONFIG && window.CONFIG.settings && 
        window.CONFIG.settings.ticksInOneGameYear) ? 
        window.CONFIG.settings.ticksInOneGameYear : 600;
    
    const tickInterval = (window.CONFIG && window.CONFIG.settings && 
        window.CONFIG.settings.tickInterval) ? 
        window.CONFIG.settings.tickInterval : 25;
    
    // Process each skill gain
    for (const [skillId, gainPerYear] of Object.entries(job.skillGainPerYear)) {
        // Convert yearly gain to per millisecond
        const gainPerMs = gainPerYear / (ticksInOneGameYear * (1000 / tickInterval));
        
        // Apply gain for this tick with modifiers
        const gain = gainPerMs * deltaTime * performanceModifier * skillMultiplier;
        
        // Add to skill XP using the skill system's function if available
        if (typeof window.addSkillXP === 'function') {
            window.addSkillXP(skillId, gain);
        } else {
            // Fallback for old skill system
            addSkillXPFallback(skillId, gain);
        }
    }
}

/**
 * Fallback function to add skill XP in case the skill system is not available
 * @param {string} skillId - Skill identifier
 * @param {number} amount - Amount of XP to add
 */
function addSkillXPFallback(skillId, amount) {
    // Initialize skill progress object if needed
    if (!gameState.skillProgress) {
        gameState.skillProgress = {};
    }
    
    if (!gameState.skillProgress[skillId]) {
        gameState.skillProgress[skillId] = 0;
    }
    
    // Add XP
    gameState.skillProgress[skillId] += amount;
    
    // Check for level up
    const currentLevel = getPlayerSkillLevel(skillId);
    const progressNeeded = 10 + (currentLevel * 5); // Simple progression formula
    
    if (gameState.skillProgress[skillId] >= progressNeeded) {
        // Level up the skill
        if (typeof gameState.skills[skillId] === 'object') {
            gameState.skills[skillId].level = (gameState.skills[skillId].level || 0) + 1;
        } else {
            gameState.skills[skillId] = (gameState.skills[skillId] || 0) + 1;
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

/**
 * Update job performance
 */
function updateJobPerformance() {
    console.log("updateJobPerformance() - Updating job performance");
    
    // Skip if no active job
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
    
    // Update current performance (with smoothing for gradual changes)
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
    
    console.log(`updateJobPerformance() - Performance updated to ${gameState.jobPerformance.current.toFixed(1)}%`);
}

/**
 * Calculate performance factors
 * @returns {object} - Performance factors
 */
function calculatePerformanceFactors() {
    const factors = {
        skillMatch: 0,
        consistency: 0,
        energy: 0,
        attributeBonus: 0
    };
    
    if (!gameState.activeJob) {
        return factors;
    }
    
    // Skill match factor - how well player's skills match the job
    const jobSkills = getRelevantSkillsForJob(gameState.activeJob);
    let totalSkillLevel = 0;
    let skillCount = 0;
    
    for (const [skillId, weight] of Object.entries(jobSkills)) {
        const skillLevel = getPlayerSkillLevel(skillId);
        totalSkillLevel += skillLevel * weight;
        skillCount += weight;
    }
    
    if (skillCount > 0) {
        const avgWeightedSkill = totalSkillLevel / skillCount;
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

/**
 * Get relevant skills for a job with weights
 * @param {object} jobData - Job data
 * @returns {object} - Object mapping skill IDs to their weights
 */
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

/**
 * Get relevant attributes for a job with weights
 * @param {object} jobData - Job data
 * @returns {object} - Object mapping attribute IDs to their weights
 */
function getRelevantAttributesForJob(jobData) {
    // Default to intelligence if no specific attributes
    const relevantAttributes = {
        "intelligence": 1.0
    };
    
    // Check for explicit relevant attributes in the job data
    if (jobData.relevantAttributes) {
        Object.assign(relevantAttributes, jobData.relevantAttributes);
    }
    
    return relevantAttributes;
}

/**
 * Reset job performance tracking
 */
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

/**
 * Track job start time
 */
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

/**
 * Check for promotions based on organization structure
 * @returns {Array} - Array of possible promotions
 */
function checkForPromotions() {
    console.log("checkForPromotions() - Checking for promotion opportunities");
    
    // Skip if no active job
    if (!gameState.activeJob) {
        return [];
    }
    
    const currentJob = gameState.activeJob;
    const currentTier = gameState.currentJobTier;
    const jobId = currentJob.id;
    
    const promotions = [];
    
    // Get all organizations (cached for performance)
    const organizations = gameState.organizations || [];
    
    // Find possible promotions by searching jobs in all organizations
    organizations.forEach(org => {
        // Check organization availability first
        if (checkOrganizationAvailability(org)) {
            org.jobs.forEach(job => {
                // Same job (check higher tier)
                if (job.id === jobId) {
                    for (const tier of job.tiers) {
                        // Higher tier of same job
                        if (tier.tier > currentTier && meetsJobRequirements({...job, ...tier})) {
                            // Already shown?
                            const promotionKey = `${job.id}-${tier.tier}`;
                            if (!gameState.shownPromotions || !gameState.shownPromotions[promotionKey]) {
                                promotions.push({
                                    sourceJob: currentJob,
                                    targetJob: {...job, ...tier, id: job.id},
                                    sourceTier: currentTier,
                                    targetTier: tier.tier,
                                    type: 'tier-promotion',
                                    organizationId: org.id
                                });
                                
                                // Mark as shown
                                if (!gameState.shownPromotions) {
                                    gameState.shownPromotions = {};
                                }
                                gameState.shownPromotions[promotionKey] = true;
                            }
                        }
                    }
                }
                // Different job (check if current job is required)
                else {
                    for (const tier of job.tiers) {
                        if (tier.requiredJobId === jobId && 
                            tier.requiredJobLevel && 
                            gameState.jobLevels[jobId] >= tier.requiredJobLevel) {
                            
                            // Check if meets requirements
                            if (meetsJobRequirements({...job, ...tier})) {
                                // Already shown?
                                const promotionKey = `${job.id}-${tier.tier}`;
                                if (!gameState.shownPromotions || !gameState.shownPromotions[promotionKey]) {
                                    promotions.push({
                                        sourceJob: currentJob,
                                        targetJob: {...job, ...tier, id: job.id},
                                        sourceTier: currentTier,
                                        targetTier: tier.tier,
                                        type: 'job-promotion',
                                        organizationId: org.id
                                    });
                                    
                                    // Mark as shown
                                    if (!gameState.shownPromotions) {
                                        gameState.shownPromotions = {};
                                    }
                                    gameState.shownPromotions[promotionKey] = true;
                                }
                            }
                        }
                    }
                }
            });
        }
    });
    
    return promotions;
}

/**
 * Show promotion notification
 * @param {object} promotion - Promotion data
 */
function showPromotionNotification(promotion) {
    console.log("showPromotionNotification() - Showing promotion notification");
    
    if (!promotion) {
        return;
    }
    
    // Create notification
    if (typeof window.showNotification === 'function') {
        const message = promotion.type === 'tier-promotion' ?
            `You're eligible for a promotion to ${promotion.targetJob.title} (Tier ${promotion.targetTier})!` :
            `You've unlocked a new job: ${promotion.targetJob.title}!`;
            
        window.showNotification(
            "Career Opportunity",
            message,
            "success"
        );
    }
    
    // Log the promotion opportunity
    if (typeof window.logEvent === 'function') {
        const message = promotion.type === 'tier-promotion' ?
            `You're eligible for a promotion to ${promotion.targetJob.title}!` :
            `You've unlocked a new job: ${promotion.targetJob.title}!`;
            
        window.logEvent(message, 'career');
    }
}

/**
 * Calculate job progress percentage
 * @returns {number} - Progress percentage (0-100)
 */
export function getJobProgressPercentage() {
    if (!gameState.activeJob) {
        return 0;
    }
    
    const jobId = gameState.activeJob.id;
    const currentLevel = gameState.jobLevels && gameState.jobLevels[jobId] ? 
        gameState.jobLevels[jobId] : 1;
    
    const progressNeeded = calculateXPForJobLevel(currentLevel);
    return Math.min(100, (gameState.jobProgress / progressNeeded) * 100);
}

/**
 * Get job title by ID
 * @param {string} jobId - Job identifier
 * @returns {string} - Job title or ID if not found
 */
export function getJobTitle(jobId) {
    // Search through organizations
    for (const org of gameState.organizations || []) {
        for (const job of org.jobs || []) {
            if (job.id === jobId) {
                return job.title;
            }
        }
    }
    
    return jobId; // Fallback to ID if not found
}

// Make essential functions available globally
window.getOrganizationsWithJobs = getOrganizationsWithJobs;
window.selectJob = selectJob;
window.applyForJob = applyForJob;
window.quitJob = quitJob;
window.meetsJobRequirements = meetsJobRequirements;
window.processJobProgress = processJobProgress;
window.calculateXPForJobLevel = calculateXPForJobLevel;
window.getJobProgressPercentage = getJobProgressPercentage;
window.checkForPromotions = checkForPromotions;
window.getRelevantSkillsForJob = getRelevantSkillsForJob;
window.getRelevantAttributesForJob = getRelevantAttributesForJob;
window.initializeJobSystem = initializeJobSystem;
window.getJobTitle = getJobTitle;

console.log("job-system.js - Enhanced job system loaded successfully");

// Export functions for ES module usage
export {
    initializeJobSystem,
    getOrganizationsWithJobs,
    selectJob,
    applyForJob,
    quitJob,
    processJobProgress,
    calculateXPForJobLevel,
    getJobProgressPercentage,
    checkForPromotions,
    getRelevantSkillsForJob,
    getRelevantAttributesForJob,
    getJobTitle
};