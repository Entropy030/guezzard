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

// Apply for a job
export function applyForJob(jobIndex) {
    console.log(`applyForJob() - Attempting to apply for job at index ${jobIndex}`);
    
    // Get the job data
    const jobData = getJobData(jobIndex, 0); // Default to tier 0 for new job applications
    
    if (!jobData) {
        console.error("Could not apply for job: Job data not found");
        return false;
    }
    
    // Check if player meets skill requirements
    let meetsRequirements = true;
    
    // Get the tier data for the job
    const tierData = jobData.tiers ? jobData.tiers.find(tier => tier.tier === 0) : null;
    
    // Check skill requirements if they exist
    if (tierData && tierData.minSkill) {
        const requiredSkill = "Map Awareness"; // Default skill for most jobs
        const playerSkillLevel = gameState.skills[requiredSkill] || 0;
        
        if (playerSkillLevel < tierData.minSkill) {
            console.warn(`Player skill ${requiredSkill} (${playerSkillLevel}) is below required level (${tierData.minSkill})`);
            meetsRequirements = false;
        }
    }
    
    if (!meetsRequirements) {
        console.warn("Player does not meet requirements for this job");
        return false;
    }
    
    // Apply for the job (success)
    gameState.activeJob = { ...jobData, progress: 0 };
    gameState.currentJobTier = 0;
    gameState.jobProgress = 0;
    
    // Update job levels tracking if needed
    if (!gameState.jobLevels[jobData.id]) {
        gameState.jobLevels[jobData.id] = 1; // Start at level 1
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
    
    // Apply progress
    const progressGain = baseProgressRate * tierMultiplier * skillBonus * (deltaTime / 1000);
    gameState.jobProgress += progressGain;
    
    // Check for level up
    const progressNeeded = 100 + (gameState.jobLevels[jobId] * 20); // Increases with job level
    
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

// Level up job
function levelUpJob(jobId) {
    console.log(`levelUpJob() - Leveling up job: ${jobId}`);
    
    // Increment job level
    if (!gameState.jobLevels[jobId]) {
        gameState.jobLevels[jobId] = 1;
    } else {
        gameState.jobLevels[jobId]++;
    }
    
    const newLevel = gameState.jobLevels[jobId];
    
    // Check for tier promotions
    const job = getJobById(jobId);
    
    if (job && job.tiers) {
        const currentTier = gameState.currentJobTier;
        const nextTier = currentTier + 1;
        
        // Check if there's a next tier available
        const nextTierData = job.tiers.find(tier => tier.tier === nextTier);
        
        if (nextTierData && newLevel >= 5) { // Assuming promotion tier is every 5 levels
            promoteTier(jobId, nextTier);
        }
    }
    
    // Log the event (using window.logEvent to avoid import issues)
    if (window.logEvent) {
        window.logEvent(`You've reached level ${newLevel} as a ${gameState.activeJob.title}!`, 'career');
    } else {
        console.log(`Career Event: You've reached level ${newLevel} as a ${gameState.activeJob.title}!`);
    }
    
    return newLevel;
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
    if (nextTierData.minSkill) {
        const requiredSkill = "Map Awareness";
        const playerSkillLevel = gameState.skills[requiredSkill] || 0;
        
        if (playerSkillLevel < nextTierData.minSkill) {
            console.warn(`Player skill ${requiredSkill} (${playerSkillLevel}) is below required level for promotion (${nextTierData.minSkill})`);
            if (window.logEvent) {
                window.logEvent(`You need more ${requiredSkill} skill to get promoted to the next level.`, 'career');
            } else {
                console.log(`Career Event: You need more ${requiredSkill} skill to get promoted to the next level.`);
            }
            return false;
        }
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
    
    // Calculate income per second
    const incomePerSecond = jobData.incomePerYear / (600); // 600 ticks per year (assumed)
    
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
    
    // Filter jobs based on player's current skills
    const availableJobs = gameState.jobs.filter(job => {
        // If the job has tiers, check the lowest tier's requirements
        if (job.tiers && job.tiers.length > 0) {
            const lowestTier = job.tiers.reduce((prev, curr) => 
                prev.tier < curr.tier ? prev : curr
            );
            
            if (lowestTier.minSkill) {
                const requiredSkill = "Map Awareness";
                const playerSkillLevel = gameState.skills[requiredSkill] || 0;
                return playerSkillLevel >= lowestTier.minSkill;
            }
        }
        
        // If no tiers or no requirements, job is available
        return true;
    });
    
    console.log(`getAvailableJobs() - Found ${availableJobs.length} available jobs`);
    return availableJobs;
}

// Make functions available globally for non-module scripts
window.getJobData = getJobData;
window.getJobById = getJobById;
window.getJobIndexById = getJobIndexById;
window.applyForJob = applyForJob;
window.quitJob = quitJob;
window.processJobProgress = processJobProgress;
window.getAvailableJobs = getAvailableJobs;

console.log("job-manager.js - Module loaded successfully");