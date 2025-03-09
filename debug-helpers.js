// debug-helpers.js
// A set of helper functions to debug the job system from the browser console

// Test the job system directly from console
function testJobSystem() {
    console.log("=== JOB SYSTEM TEST ===");
    
    // 1. Check available jobs
    const availableJobs = window.getAvailableJobs();
    console.log("Available Jobs:", availableJobs);
    
    // 2. Apply for the first available job
    if (availableJobs.length > 0) {
        const jobIndex = window.gameState.jobs.findIndex(job => job.id === availableJobs[0].id);
        const tierLevel = availableJobs[0].tier;
        
        console.log(`Applying for job: ${availableJobs[0].title} (index: ${jobIndex}, tier: ${tierLevel})`);
        const success = window.applyForJob(jobIndex, tierLevel);
        console.log("Application successful:", success);
    } else {
        console.log("No jobs available to apply for");
    }
    
    // 3. Check job progress
    console.log("Current job:", window.gameState.activeJob);
    console.log("Job levels:", window.gameState.jobLevels);
    console.log("Job progress:", window.gameState.jobProgress);
    
    // 4. Simulate job progression
    console.log("Simulating job progression...");
    for (let i = 0; i < 50; i++) {
        window.processJobProgress(1000); // Simulate 1 second of progress
    }
    
    console.log("Job progress after simulation:", window.gameState.jobProgress);
    console.log("Job levels after simulation:", window.gameState.jobLevels);
    console.log("Job bonuses:", window.gameState.jobBonuses);
    
    return "Job system test complete";
}

// Force skill level to test job requirements
function setSkillLevel(skillName, level) {
    if (!window.gameState.skills) {
        window.gameState.skills = {};
    }
    
    window.gameState.skills[skillName] = level;
    console.log(`Set ${skillName} to level ${level}`);
    
    // Refresh available jobs display
    if (window.setupJobsUI) {
        window.setupJobsUI();
    }
    
    return window.gameState.skills;
}

// Force job level to test tier requirements
function setJobLevel(jobId, level) {
    if (!window.gameState.jobLevels) {
        window.gameState.jobLevels = {};
    }
    
    window.gameState.jobLevels[jobId] = level;
    console.log(`Set job ${jobId} to level ${level}`);
    
    // Refresh available jobs display
    if (window.setupJobsUI) {
        window.setupJobsUI();
    }
    
    return window.gameState.jobLevels;
}

// Show all the job data
function showAllJobs() {
    return window.gameState.jobs;
}

// Get job bonuses for a specific job
function getJobBonuses(jobId) {
    if (!window.gameState.jobBonuses || !window.gameState.jobBonuses[jobId]) {
        return "No bonuses found for this job";
    }
    
    return window.gameState.jobBonuses[jobId];
}

// Make these functions available globally
window.testJobSystem = testJobSystem;
window.setSkillLevel = setSkillLevel;
window.setJobLevel = setJobLevel;
window.showAllJobs = showAllJobs;
window.getJobBonuses = getJobBonuses;

console.log("Debug helpers loaded. Available commands:");
console.log("- testJobSystem() - Run a full test of the job system");
console.log("- setSkillLevel('Map Awareness', 20) - Set skill level to test job requirements");
console.log("- setJobLevel('google_maps_user', 50) - Set job level to test tier requirements");
console.log("- showAllJobs() - Show all job data");
console.log("- getJobBonuses('google_maps_user') - Get bonuses for a specific job");
