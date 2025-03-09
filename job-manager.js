// job-manager.js
console.log("job-manager.js - Module loading");

// We don't need to import logEvent here since it might cause circular dependencies
// Instead, we'll call it from the window object when needed

// Get job data with proper tier information
export function getJobData(jobIndex, currentJobTier) {
    console.log(`getJobData() - Getting job data for index ${jobIndex}, tier ${currentJobTier}`);
    
    if (!gameState.jobs || jobIndex < 0 || jobIndex >= gameState.jobs.length) {
        console.error("Invalid job index:", jobIndex);
        return null; // Or a default job object
    }
    
    const jobData = gameState.jobs[jobIndex];
    
    if (jobData && jobData.tiers) {
        const jobTierData = jobData.tiers.find(tier => tier.tier === currentJobTier);
        if (jobTierData) {
            // Create a copy to avoid modifying original data
            const jobDataWithTier = { ...jobData, ...jobTierData};
            console.log(`getJobData() - Found tier data for job ${jobData.id}, tier ${currentJobTier}:`, jobDataWithTier);
            return jobDataWithTier;
        } else {
            console.warn(`No tier data found for job ${jobData.id} at tier ${currentJobTier}. Returning base job data.`);
            return jobData; // Return base data if tier not found (could be an issue)
        }
    } else {
        console.warn(`No tier data found for job index ${jobIndex}.`);
        return jobData;
    }
}

// Get job by ID (useful for finding specific jobs)
export function getJobById(jobId) {
    console.log(`getJobById() - Finding job with ID: ${jobId}`);
    
    if (!gameState.jobs || !Array.isArray(gameState.jobs)) {
        console.error("Jobs array is not available");
        return null;
    }
    
    const job = gameState.jobs.find(job => job.id === jobId);
    return job || null;
}

// Get job index by ID
export function getJobIndexById(jobId) {
    console.log(`getJobIndexById() - Finding index for job ID: ${jobId}`);
    
    if (!gameState.jobs || !Array.isArray(gameState.jobs)) {
        console.error("Jobs array is not available");
        return -1;
    }
    
    return gameState.jobs.findIndex(job => job.id === jobId);
}

// Check if player meets requirements for a job
export function meetsJobRequirements(jobData, tierLevel = 0) {
    console.log(`meetsJobRequirements() - Checking requirements for job ${jobData?.id}, tier ${tierLevel}`);
    
    if (!jobData || !jobData.tiers) {
        console.error("Invalid job data provided");
        return false;
    }
    
    // Find the correct tier data
    const tierData = jobData.tiers.find(tier => tier.tier === tierLevel);
    if (!tierData) {
        console.warn(`No tier data found for job ${jobData.id} at tier ${tierLevel}`);
        return false;
    }
    
    // Check skill requirements
    if (tierData.minSkill) {
        const requiredSkill = "Map Awareness"; // Default skill for most jobs
        const playerSkillLevel = gameState.skills[requiredSkill] || 0;
        
        if (playerSkillLevel < tierData.minSkill) {
            console.warn(`Player skill ${requiredSkill} (${playerSkillLevel}) is below required level (${tierData.minSkill})`);
            return false;
        }
    }
    
    // Check required previous job level if specified
    if (tierData.requiredJobId && tierData.requiredJobLevel) {
        const previousJobLevel = gameState.jobLevels[tierData.requiredJobId] || 0;
        
        if (previousJobLevel < tierData.requiredJobLevel) {
            console.warn(`Required job ${tierData.requiredJobId} level (${previousJobLevel}) is below required level (${tierData.requiredJobLevel})`);
            return false;
        }
    }
    
    return true;
}

// Apply for a job
export function applyForJob(jobIndex, tierLevel = 0) {
    console.log(`applyForJob() - Attempting to apply for job at index ${jobIndex}, tier ${tierLevel}`);
    
    // Get the job data
    const jobData = getJobData(jobIndex, tierLevel);
    
    if (!jobData) {
        console.error("Could not apply for job: Job data not found");
        return false;
    }
    
    // Check if player meets requirements
    if (!meetsJobRequirements(jobData, tierLevel)) {
        console.warn("Player does not meet requirements for this job");
        if (window.showNotification) {
            window.showNotification("Job Application", "You don't meet the requirements for this job", "error");
        }
        return false;
    }
    
    // Apply for the job (success)
    gameState.activeJob = { ...jobData, progress: 0 };
    gameState.currentJobTier = tierLevel;
    gameState.jobProgress = 0;
    
    // Initialize job levels tracking if needed
    if (!gameState.jobLevels) {
        gameState.jobLevels = {};
    }
    
    if (!gameState.jobLevels[jobData.id]) {
        gameState.jobLevels[jobData.id] = 1; // Start at level 1
    }
    
    // Initialize job bonuses tracking if needed
    if (!gameState.jobBonuses) {
        gameState.jobBonuses = {};
    }
    
    if (!gameState.jobBonuses[jobData.id]) {
        gameState.jobBonuses[jobData.id] = {
            jobXpMultiplier: 0,
            goldMultiplier: 0
        };
    }
    
    // Track statistics
    gameState.statistics.jobsHeld = (gameState.statistics.jobsHeld || 0) + 1;
    
    // Log the event (using window.logEvent to avoid import issues)
    if (window.logEvent) {
        window.logEvent(`You got a new job as a ${jobData.title}!`, 'career');
    } else {
        console.log(`Career Event: You got a new job as a ${jobData.title}!`);
    }
    
    console.log(`applyForJob() - Successfully applied for job: ${jobData.title}`);
    return true;
}

// Quit current job
export function quitJob() {
    console.log("quitJob() - Quitting current job");
    
    if (!gameState.activeJob) {
        console.warn("No active job to quit");
        return false;
    }
    
    const oldJobTitle = gameState.activeJob.title;
    
    // Reset job-related state
    gameState.activeJob = null;
    gameState.currentJobTier = 0;
    gameState.jobProgress = 0;
    
    // Log the event (using window.logEvent to avoid import issues)
    if (window.logEvent) {
        window.logEvent(`You quit your job as a ${oldJobTitle}.`, 'career');
    } else {
        console.log(`Career Event: You quit your job as a ${oldJobTitle}.`);
    }
    
    console.log(`quitJob() - Successfully quit job: ${oldJobTitle}`);
    return true;
}

// Process job progression (to be called in game loop)
export function processJobProgress(deltaTime) {
    // Skip if no active job or game is paused
    if (!gameState.activeJob || gameState.gamePaused) {
        return;
    }
    
    const job = gameState.activeJob;
    const jobId = job.id;
    const tier = gameState.currentJobTier;
    
    // Get full job data with current tier
    const fullJobData = getJobData(getJobIndexById(jobId), tier);
    
    if (!fullJobData) {
        console.error("Could not process job progress: Invalid job data");
        return;
    }
    
    // Calculate progression factors
    const baseProgressRate = 1.0; // Base units per tick
    const tierMultiplier = 1.0 + (tier * 0.2); // Higher tiers progress faster
    const skillBonus = calculateJobSkillBonus(fullJobData);
    
    // Get job XP multiplier from bonuses if available
    const bonusMultiplier = gameState.jobBonuses && gameState.jobBonuses[jobId] ? 
        (1 + gameState.jobBonuses[jobId].jobXpMultiplier) : 1;
    
    // Apply progress with all multipliers
    const progressGain = baseProgressRate * tierMultiplier * skillBonus * bonusMultiplier * (deltaTime / 1000);
    gameState.jobProgress += progressGain;
    
    // Get current job level
    const currentLevel = gameState.jobLevels[jobId] || 1;
    
    // Calculate XP needed for next level - increases with level
    const progressNeeded = calculateXpForLevel(currentLevel);
    
    // Check for level up
    if (gameState.jobProgress >= progressNeeded) {
        // Level up the job
        levelUpJob(jobId);
        
        // Reset progress
        gameState.jobProgress = 0;
    }
    
    // Process income
    processJobIncome(fullJobData, deltaTime);
    
    // Process skill gains from job
    processJobSkillGains(fullJobData, deltaTime);
}

// Calculate XP needed for a specific job level
function calculateXpForLevel(level) {
    // Formula: Base value (100) multiplied by a factor that increases with level
    // This makes each level progressively harder to attain
    return 100 * Math.pow(1.1, level - 1);
}

// Level up job
function levelUpJob(jobId) {
    console.log(`levelUpJob() - Leveling up job: ${jobId}`);
    
    // Initialize job levels if not exists
    if (!gameState.jobLevels) {
        gameState.jobLevels = {};
    }
    
    // Increment job level
    if (!gameState.jobLevels[jobId]) {
        gameState.jobLevels[jobId] = 1;
    } else {
        gameState.jobLevels[jobId]++;
    }
    
    const newLevel = gameState.jobLevels[jobId];
    const maxLevel = gameState.activeJob.maxLevel || 100;
    
    // Cap at max level
    if (newLevel > maxLevel) {
        gameState.jobLevels[jobId] = maxLevel;
        console.log(`Job ${jobId} reached max level: ${maxLevel}`);
    }
    
    // Check for level milestone bonuses
    applyLevelBonuses(jobId, newLevel);
    
    // Log the event (using window.logEvent to avoid import issues)
    if (window.logEvent) {
        window.logEvent(`You've reached level ${newLevel} as a ${gameState.activeJob.title}!`, 'career');
    } else {
        console.log(`Career Event: You've reached level ${newLevel} as a ${gameState.activeJob.title}!`);
    }
    
    return newLevel;
}

// Apply bonuses when reaching specific job levels
function applyLevelBonuses(jobId, level) {
    console.log(`applyLevelBonuses() - Checking for bonuses at level ${level} for job ${jobId}`);
    
    // Get job data
    const job = getJobById(jobId);
    if (!job) return;
    
    // Get current tier data
    const tierData = job.tiers.find(tier => tier.tier === gameState.currentJobTier);
    if (!tierData || !tierData.levelBonuses) return;
    
    // Check if there's a bonus for this level
    const levelBonus = tierData.levelBonuses.find(bonus => bonus.level === level);
    if (!levelBonus) return;
    
    // Initialize job bonuses if not exists
    if (!gameState.jobBonuses) {
        gameState.jobBonuses = {};
    }
    
    if (!gameState.jobBonuses[jobId]) {
        gameState.jobBonuses[jobId] = {
            jobXpMultiplier: 0,
            goldMultiplier: 0
        };
    }
    
    // Apply the bonus based on type
    switch (levelBonus.bonusType) {
        case "jobXpMultiplier":
            gameState.jobBonuses[jobId].jobXpMultiplier += levelBonus.bonusValue;
            if (window.logEvent) {
                window.logEvent(`Job milestone! +${(levelBonus.bonusValue * 100).toFixed(0)}% job XP gain for ${job.title}.`, 'career');
            }
            break;
        case "goldMultiplier":
            gameState.jobBonuses[jobId].goldMultiplier += levelBonus.bonusValue;
            if (window.logEvent) {
                window.logEvent(`Job milestone! +${(levelBonus.bonusValue * 100).toFixed(0)}% gold gain for ${job.title}.`, 'career');
            }
            break;
        default:
            console.warn(`Unknown bonus type: ${levelBonus.bonusType}`);
    }
    
    console.log(`Applied ${levelBonus.bonusType} bonus of ${levelBonus.bonusValue} at level ${level} for job ${jobId}`);
}

// Promote to next tier
function promoteTier(jobId, nextTier) {
    console.log(`promoteTier() - Promoting job ${jobId} to tier ${nextTier}`);
    
    const job = getJobById(jobId);
    
    if (!job) {
        console.error("Could not promote: Job not found");
        return false;
    }
    
    const nextTierData = job.tiers.find(tier => tier.tier === nextTier);
    
    if (!nextTierData) {
        console.warn(`No tier ${nextTier} found for job ${jobId}`);
        return false;
    }
    
    // Check if player meets requirements for this tier
    if (!meetsJobRequirements(job, nextTier)) {
        if (window.logEvent) {
            window.logEvent(`You don't meet the requirements for the next tier of ${job.title}.`, 'career');
        }
        return false;
    }
    
    // Promote to next tier
    gameState.currentJobTier = nextTier;
    
    // Update active job data with new tier info
    const updatedJobData = getJobData(getJobIndexById(jobId), nextTier);
    gameState.activeJob = { ...updatedJobData, progress: 0 };
    
    // Log the event (using window.logEvent to avoid import issues)
    if (window.logEvent) {
        window.logEvent(`Congratulations! You've been promoted to ${updatedJobData.title}!`, 'career');
    } else {
        console.log(`Career Event: Congratulations! You've been promoted to ${updatedJobData.title}!`);
    }
    
    return true;
}

// Calculate bonus from skills for job progress
function calculateJobSkillBonus(jobData) {
    // Default bonus is 1.0 (no change)
    let bonus = 1.0;
    
    // Each relevant skill point adds a small bonus
    if (jobData.skillGainPerYear) {
        for (const [skillName, _] of Object.entries(jobData.skillGainPerYear)) {
            const skillLevel = gameState.skills[skillName] || 0;
            bonus += skillLevel * 0.01; // Each skill point adds 1%
        }
    }
    
    return bonus;
}

// Process income from job
function processJobIncome(jobData, deltaTime) {
    if (!jobData || !jobData.incomePerYear) {
        return;
    }
    
    // Get gold multiplier bonus if available
    const jobId = jobData.id;
    const goldMultiplier = gameState.jobBonuses && gameState.jobBonuses[jobId] ?
        (1 + gameState.jobBonuses[jobId].goldMultiplier) : 1;
    
    // Calculate income per second with bonus
    const incomePerSecond = (jobData.incomePerYear / 600) * goldMultiplier; // 600 ticks per year (assumed)
    
    // Apply income for this tick
    const income = incomePerSecond * (deltaTime / 1000);
    
    // Add to gold
    gameState.gold += income;
    
    // Track in statistics
    gameState.statistics.totalGoldEarned = (gameState.statistics.totalGoldEarned || 0) + income;
    gameState.gameStats.totalGoldEarned = (gameState.gameStats.totalGoldEarned || 0) + income;
    
    // Track income sources
    gameState.income.job = income;
    gameState.income.total = (gameState.income.total || 0) + income;
}

// Process skill gains from job
function processJobSkillGains(jobData, deltaTime) {
    if (!jobData || !jobData.skillGainPerYear) {
        return;
    }
    
    // Process skill gains
    for (const [skillName, gainPerYear] of Object.entries(jobData.skillGainPerYear)) {
        // Calculate gain per second
        const gainPerSecond = gainPerYear / (600); // 600 ticks per year (assumed)
        
        // Apply gain for this tick
        const gain = gainPerSecond * (deltaTime / 1000);
        
        // Initialize skill progress if needed
        if (!gameState.skillProgress) {
            gameState.skillProgress = {};
        }
        
        // Add to skill progress
        if (!gameState.skillProgress[skillName]) {
            gameState.skillProgress[skillName] = 0;
        }
        
        gameState.skillProgress[skillName] += gain;
        
        // Check for skill level up
        const currentLevel = gameState.skills[skillName] || 0;
        const progressNeeded = 10 + (currentLevel * 5); // Simple progression formula
        
        if (gameState.skillProgress[skillName] >= progressNeeded) {
            // Level up the skill
            if (!gameState.skills[skillName]) {
                gameState.skills[skillName] = 1;
            } else {
                gameState.skills[skillName]++;
            }
            
            // Reset progress
            gameState.skillProgress[skillName] = 0;
            
            // Log event (using window.logEvent to avoid import issues)
            const newLevel = gameState.skills[skillName];
            if (window.logEvent) {
                window.logEvent(`Your ${skillName} skill increased to level ${newLevel}!`, 'skill');
            } else {
                console.log(`Skill Event: Your ${skillName} skill increased to level ${newLevel}!`);
            }
        }
    }
}

// Get available jobs (for UI display)
export function getAvailableJobs() {
    console.log("getAvailableJobs() - Getting available jobs");
    
    if (!gameState.jobs || !Array.isArray(gameState.jobs)) {
        console.warn("Jobs array is not available");
        return [];
    }
    
    // Filter jobs based on player's current skills and job levels
    const availableJobs = [];
    
    gameState.jobs.forEach(job => {
        // Check each job tier
        if (job.tiers && job.tiers.length > 0) {
            // For each job, check which tiers are available
            job.tiers.forEach(tier => {
                const jobWithTier = { ...job, ...tier };
                
                // Check if player meets requirements for this tier
                if (meetsJobRequirements(job, tier.tier)) {
                    availableJobs.push(jobWithTier);
                }
            });
        }
    });
    
    console.log(`getAvailableJobs() - Found ${availableJobs.length} available jobs`);
    return availableJobs;
}

// Get job progress percentage
export function getJobProgressPercentage() {
    if (!gameState.activeJob) {
        return 0;
    }
    
    const jobId = gameState.activeJob.id;
    const currentLevel = gameState.jobLevels[jobId] || 1;
    const progressNeeded = calculateXpForLevel(currentLevel);
    
    return Math.min(100, (gameState.jobProgress / progressNeeded) * 100);
}

// Get available job tiers for a specific job
export function getAvailableJobTiers(jobId) {
    console.log(`getAvailableJobTiers() - Checking available tiers for job ${jobId}`);
    
    const job = getJobById(jobId);
    if (!job || !job.tiers) {
        return [];
    }
    
    // Filter tiers based on requirements
    return job.tiers.filter(tier => meetsJobRequirements(job, tier.tier));
}

// Make functions available globally for non-module scripts
window.getJobData = getJobData;
window.getJobById = getJobById;
window.getJobIndexById = getJobIndexById;
window.applyForJob = applyForJob;
window.quitJob = quitJob;
window.processJobProgress = processJobProgress;
window.getAvailableJobs = getAvailableJobs;
window.meetsJobRequirements = meetsJobRequirements;
window.getJobProgressPercentage = getJobProgressPercentage;
window.getAvailableJobTiers = getAvailableJobTiers;

console.log("job-manager.js - Module loaded successfully");