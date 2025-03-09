// ui-setup.js
console.log("ui-setup.js - Module LOADED and EXECUTING");

// Helper function to safely get or create container elements
function getOrCreateContainer(parentId, containerId, className = '') {
    console.log(`Checking for container #${containerId} inside #${parentId}`);
    let parent = document.getElementById(parentId);
    if (!parent) {
        console.warn(`Parent element #${parentId} not found, creating it`);
        parent = document.createElement('div');
        parent.id = parentId;
        document.body.appendChild(parent);
    }
    
    let container = document.getElementById(containerId);
    if (!container) {
        console.log(`Creating container #${containerId} because it doesn't exist`);
        container = document.createElement('div');
        container.id = containerId;
        if (className) {
            container.className = className;
        }
        parent.appendChild(container);
    }
    
    return container;
}

// Export utility functions that UI functions might need
export function showNotification(title, message, type) {
    console.log(`Notification (${type}): ${title} - ${message}`);
    alert(`${title}: ${message}`); // Keep simple for now
}

export function showErrorNotification(message) {
    console.error(`Error Notification: ${message}`);
    alert(`Error: ${message}`);
}

export function logEvent(message, category = 'game') {
    console.log(`logEvent() - ${category.toUpperCase()} - Message:`, message);
    
    // Get or create event log list if it doesn't exist
    const eventLogContainer = getOrCreateContainer('event-log', 'event-log-container');
    let eventLogList = document.getElementById('event-log-list');
    
    if (!eventLogList) {
        console.log("Creating #event-log-list because it doesn't exist");
        eventLogList = document.createElement('ul');
        eventLogList.id = 'event-log-list';
        eventLogContainer.appendChild(eventLogList);
    }
    
    const newEventItem = document.createElement('li');
    newEventItem.textContent = message;
    newEventItem.classList.add(`event-log-item`, `event-category-${category}`);
    eventLogList.prepend(newEventItem);
    
    // Limit event log entries if CONFIG exists
    const maxEntries = window.CONFIG?.settings?.maxEventLogEntries || 5;
    while (eventLogList.children.length > maxEntries) {
        eventLogList.removeChild(eventLogList.lastElementChild);
    }
}

// UI Management Functions
export function setupJobsUI() {
    console.log("Setting up jobs UI...");
    
    // Get or create jobs panel and list
    const jobsPanel = document.getElementById('jobs-panel') || document.createElement('div');
    if (!jobsPanel.id) {
        jobsPanel.id = 'jobs-panel';
        jobsPanel.classList.add('hidden-panel');
        document.getElementById('game-container').appendChild(jobsPanel);
    }
    
    let jobsList = document.getElementById('jobs-list');
    if (!jobsList) {
        console.log("Creating #jobs-list because it doesn't exist");
        jobsList = document.createElement('ul');
        jobsList.id = 'jobs-list';
        jobsPanel.appendChild(jobsList);
    }
    
    // Clear existing jobs
    jobsList.innerHTML = '';
    
    // Check if jobs data is available
    if (!gameState.jobs || !Array.isArray(gameState.jobs) || gameState.jobs.length === 0) {
        console.warn("No jobs data available to display");
        jobsList.innerHTML = '<li class="no-jobs">No jobs available yet. Check back later!</li>';
        return;
    }
    
    // Add jobs to the list
    gameState.jobs.forEach((job, index) => {
        const jobItem = document.createElement('li');
        jobItem.classList.add('job-item');
        
        // Default job tiers if missing
        const tierData = job.tiers && job.tiers.length > 0 ? job.tiers[0] : { minSkill: 0 };
        
        // Check if player meets requirements
        const requiredSkill = "Map Awareness";
        const requiredLevel = tierData.minSkill || 0;
        const currentLevel = gameState.skills[requiredSkill] || 0;
        const meetsRequirements = currentLevel >= requiredLevel;
        
        if (!meetsRequirements) {
            jobItem.classList.add('job-locked');
        }
        
        jobItem.innerHTML = `
            <h3>${job.title}</h3>
            <p>Income: ${tierData.incomePerYear || 0} gold per year</p>
            <div class="job-requirements">
                <h4>Requirements:</h4>
                <ul>
                    <li class="${meetsRequirements ? 'requirement-met' : 'requirement-not-met'}">
                        ${requiredSkill}: ${currentLevel}/${requiredLevel}
                    </li>
                </ul>
            </div>
            <button class="apply-button" ${!meetsRequirements ? 'disabled' : ''}>Apply</button>
        `;
        
        // Add click listener to the apply button
        const applyButton = jobItem.querySelector('.apply-button');
        if (applyButton) {
            applyButton.addEventListener('click', () => {
                if (meetsRequirements) {
                    applyForJob(index);
                }
            });
        }
        
        jobsList.appendChild(jobItem);
    });
    
    console.log(`setupJobsUI() - Added ${gameState.jobs.length} jobs to the UI`);
}

export function closeJobsPanel() {
    console.log("Closing jobs panel...");
    const jobsPanel = document.getElementById('jobs-panel');
    if (jobsPanel) {
        jobsPanel.classList.remove('active');
    }
}

export function updateSkillDisplay() {
    console.log("Updating skill display...");
    
    // Update game stats display
    const goldDisplay = document.getElementById('gold-display');
    const ageDisplay = document.getElementById('age-display');
    const lifeQualityDisplay = document.getElementById('life-quality-display');
    const seasonDisplay = document.getElementById('season-display');
    const currentJobNameDisplay = document.getElementById('current-job-name');

    // Update displays if elements exist
    if (goldDisplay) goldDisplay.textContent = Math.floor(gameState.gold);
    if (ageDisplay) ageDisplay.textContent = gameState.age;
    if (lifeQualityDisplay) lifeQualityDisplay.textContent = 
        typeof gameState.lifeQuality === 'number' ? gameState.lifeQuality.toFixed(2) : gameState.lifeQuality;
    if (seasonDisplay) seasonDisplay.textContent = `Season: ${gameState.currentSeason}, Year ${gameState.year}`;
    if (currentJobNameDisplay) {
        currentJobNameDisplay.textContent = gameState.activeJob ? gameState.activeJob.title : "No Job";
    }
    
    // Get or create skills container
    const skillsPanel = document.getElementById('skills-panel') || document.createElement('div');
    if (!skillsPanel.id) {
        skillsPanel.id = 'skills-panel';
        skillsPanel.classList.add('hidden-panel');
        document.getElementById('game-container').appendChild(skillsPanel);
    }
    
    let skillsContainer = document.getElementById('skills-container');
    if (!skillsContainer) {
        console.log("Creating #skills-container because it doesn't exist");
        skillsContainer = document.createElement('div');
        skillsContainer.id = 'skills-container';
        skillsPanel.appendChild(skillsContainer);
    }
    
    skillsContainer.innerHTML = '';
    
    // Check if skills data is available
    if (!gameState.skills || Object.keys(gameState.skills).length === 0) {
        console.warn("No skills data available to display");
        skillsContainer.innerHTML = '<div class="no-skills">No skills available yet.</div>';
        return;
    }
    
    // Sort skills by level (descending)
    const sortedSkills = Object.entries(gameState.skills)
        .sort(([, skillA], [, skillB]) => {
            const levelA = typeof skillA === 'object' ? (skillA.level || 0) : skillA;
            const levelB = typeof skillB === 'object' ? (skillB.level || 0) : skillB;
            return levelB - levelA;
        });
    
    sortedSkills.forEach(([skillName, skillData]) => {
        const skillElement = document.createElement('div');
        skillElement.classList.add('skill-item');
        
        // Handle both object and primitive skill data
        const skillLevel = typeof skillData === 'object' ? (skillData.level || 0) : skillData;
        const skillDescription = typeof skillData === 'object' ? (skillData.description || '') : '';
        const skillIcon = typeof skillData === 'object' && skillData.icon ? 
            `<div class="skill-icon">${skillData.icon}</div>` : '';
        
        skillElement.innerHTML = `
            ${skillIcon}
            <div class="skill-info">
                <div class="skill-name">${skillName}</div>
                <div class="skill-level">Level: ${skillLevel}</div>
                ${skillDescription ? `<div class="skill-description">${skillDescription}</div>` : ''}
            </div>
        `;
        
        skillsContainer.appendChild(skillElement);
    });
    
    console.log(`updateSkillDisplay() - Updated ${sortedSkills.length} skills in the UI`);
}

export function setupAchievementsUI() {
    console.log("Setting up achievements UI...");
    
    // Get or create achievements container
    const achievementsPanel = document.getElementById('achievements-panel') || document.createElement('div');
    if (!achievementsPanel.id) {
        achievementsPanel.id = 'achievements-panel';
        achievementsPanel.classList.add('hidden-panel');
        document.getElementById('game-container').appendChild(achievementsPanel);
    }
    
    let achievementsContainer = document.getElementById('achievements-container');
    if (!achievementsContainer) {
        console.log("Creating #achievements-container because it doesn't exist");
        achievementsContainer = document.createElement('div');
        achievementsContainer.id = 'achievements-container';
        achievementsPanel.appendChild(achievementsContainer);
    }
    
    achievementsContainer.innerHTML = '';
    
    // Check if achievements data is available
    if (!gameState.achievements || !Array.isArray(gameState.achievements) || gameState.achievements.length === 0) {
        console.warn("No achievements data available to display");
        achievementsContainer.innerHTML = '<div class="no-achievements">No achievements available yet.</div>';
        return;
    }
    
    gameState.achievements.forEach(achievement => {
        const isUnlocked = achievement.unlocked || false;
        
        const achievementElement = document.createElement('div');
        achievementElement.classList.add('achievement-item');
        if (isUnlocked) {
            achievementElement.classList.add('achievement-unlocked');
        } else {
            achievementElement.classList.add('achievement-locked');
        }
        
        achievementElement.innerHTML = `
            <div class="achievement-icon">${achievement.icon || '🏆'}</div>
            <div class="achievement-info">
                <div class="achievement-name">${isUnlocked ? achievement.name : '???'}</div>
                <div class="achievement-description">
                    ${isUnlocked ? achievement.description : 'Achievement locked'}
                </div>
            </div>
        `;
        
        achievementsContainer.appendChild(achievementElement);
    });
    
    console.log(`setupAchievementsUI() - Added ${gameState.achievements.length} achievements to the UI`);
}

export function setupGameControls() {
    console.log("Setting up game controls...");
    const pauseButton = document.getElementById('pause-button');
    const speedButton = document.getElementById('speed-button');
    
    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            gameState.gamePaused = !gameState.gamePaused;
            pauseButton.textContent = gameState.gamePaused ? '▶ Resume' : '|| Pause';
            console.log(`Game ${gameState.gamePaused ? 'paused' : 'resumed'}`);
        });
    } else {
        console.warn("#pause-button not found");
    }
    
    if (speedButton) {
        speedButton.addEventListener('click', () => {
            // Get available speed multipliers
            const speedMultipliers = window.CONFIG?.settings?.speedMultipliers || [1, 2, 4];
            
            // Find next speed in the sequence
            const currentIndex = speedMultipliers.indexOf(gameState.gameSpeed);
            const nextIndex = (currentIndex + 1) % speedMultipliers.length;
            gameState.gameSpeed = speedMultipliers[nextIndex];
            
            speedButton.textContent = `▶ ${gameState.gameSpeed}x Speed`;
            console.log(`Game speed changed to ${gameState.gameSpeed}x`);
        });
    } else {
        console.warn("#speed-button not found");
    }
    
    // Setup action buttons
    const jobButton = document.getElementById('job-button');
    const skillButton = document.getElementById('skill-button');
    const shopButton = document.getElementById('shop-button');
    const achievementsButton = document.getElementById('achievements-button');
    
    if (jobButton) {
        jobButton.addEventListener('click', () => {
            const jobsPanel = document.getElementById('jobs-panel');
            if (jobsPanel) {
                jobsPanel.classList.add('active');
                console.log("Jobs panel opened");
            }
        });
    }
    
    if (skillButton) {
        skillButton.addEventListener('click', () => {
            const skillsPanel = document.getElementById('skills-panel');
            if (skillsPanel) {
                skillsPanel.classList.add('active');
                console.log("Skills panel opened");
            }
        });
    }
    
    if (shopButton) {
        shopButton.addEventListener('click', () => {
            const shopPanel = document.getElementById('shop-panel');
            if (shopPanel) {
                shopPanel.classList.add('active');
                console.log("Shop panel opened");
            }
        });
    }
    
    if (achievementsButton) {
        achievementsButton.addEventListener('click', () => {
            const achievementsPanel = document.getElementById('achievements-panel');
            if (achievementsPanel) {
                achievementsPanel.classList.add('active');
                console.log("Achievements panel opened");
            }
        });
    }
    
    // Setup close buttons for all panels
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        const panelId = button.getAttribute('data-panel');
        if (panelId) {
            button.addEventListener('click', () => {
                const panel = document.getElementById(panelId);
                if (panel) {
                    panel.classList.remove('active');
                    console.log(`${panelId} panel closed`);
                }
            });
        }
    });
}

export function setupEventLog() {
    console.log("Setting up event log...");
    
    // Get or create event log container
    const eventLogContainer = getOrCreateContainer('game-container', 'event-log');
    
    // Add header if needed
    if (!eventLogContainer.querySelector('h3')) {
        const header = document.createElement('h3');
        header.textContent = 'Event Log';
        eventLogContainer.insertBefore(header, eventLogContainer.firstChild);
    }
    
    // Get or create event log list
    let eventLogList = document.getElementById('event-log-list');
    if (!eventLogList) {
        console.log("Creating #event-log-list because it doesn't exist");
        eventLogList = document.createElement('ul');
        eventLogList.id = 'event-log-list';
        eventLogContainer.appendChild(eventLogList);
    }
    
    // Add initial log entries if the list is empty
    if (eventLogList.children.length === 0) {
        logEvent('Welcome to Guezzard, the Career Master Game!', 'system');
        logEvent('Your journey begins at 18 years old. What will you become?', 'system');
    }
    
    console.log("Event log setup complete");
}

export function updateDisplay() {
    console.log("Updating display...");
    
    // Update all UI elements with current gameState values
    const goldDisplay = document.getElementById('gold-display');
    const ageDisplay = document.getElementById('age-display');
    const lifeQualityDisplay = document.getElementById('life-quality-display');
    const seasonDisplay = document.getElementById('season-display');
    
    if (goldDisplay) goldDisplay.textContent = Math.floor(gameState.gold);
    if (ageDisplay) ageDisplay.textContent = gameState.age;
    if (lifeQualityDisplay) {
        lifeQualityDisplay.textContent = 
            typeof gameState.lifeQuality === 'number' ? gameState.lifeQuality.toFixed(2) : gameState.lifeQuality;
    }
    if (seasonDisplay) {
        seasonDisplay.textContent = `Season: ${gameState.currentSeason}, Year ${gameState.year}`;
    }
    
    // Update job-related UI
    updateJobUI();
    
    // Update skill-related UI
    updateSkillDisplay();
    
    // Update progress bars
    updateProgressBars();
}

function updateJobUI() {
    // Update job-related UI elements
    const currentJobNameDisplay = document.getElementById('current-job-name');
    
    if (currentJobNameDisplay) {
        currentJobNameDisplay.textContent = gameState.activeJob ? gameState.activeJob.title : "No Job";
    }
}

function updateProgressBars() {
    // Update job progress bar
    const jobProgressFill = document.getElementById('job-progress-fill');
    const jobProgressText = document.getElementById('job-progress-text');
    
    if (jobProgressFill && jobProgressText) {
        if (gameState.activeJob) {
            // Calculate progress percentage (default to 100 units for progression)
            const progressNeeded = 100;
            const progressPercent = (gameState.jobProgress / progressNeeded) * 100;
            
            jobProgressFill.style.width = `${Math.min(100, progressPercent)}%`;
            jobProgressText.textContent = `${gameState.activeJob.title}: ${Math.floor(progressPercent)}%`;
        } else {
            jobProgressFill.style.width = '0%';
            jobProgressText.textContent = 'No Job';
        }
    }
    
    // Update skill progress bar
    const skillProgressFill = document.getElementById('skill-progress-fill');
    const skillProgressText = document.getElementById('skill-progress-text');
    
    if (skillProgressFill && skillProgressText) {
        if (gameState.currentTrainingSkill) {
            const skillName = gameState.currentTrainingSkill;
            const currentLevel = gameState.skills[skillName] || 0;
            const progressNeeded = 10 + (currentLevel * 5); // Simple progression formula
            const progress = gameState.skillProgress[skillName] || 0;
            const progressPercent = (progress / progressNeeded) * 100;
            
            skillProgressFill.style.width = `${Math.min(100, progressPercent)}%`;
            skillProgressText.textContent = `${skillName}: ${Math.floor(progressPercent)}%`;
        } else {
            skillProgressFill.style.width = '0%';
            skillProgressText.textContent = 'No Skill';
        }
    }
}

// Function for job application logic - also related to UI
export function applyForJob(jobIndex) {
    console.log(`Applying for job at index ${jobIndex}`);
    
    if (!gameState.jobs || jobIndex < 0 || jobIndex >= gameState.jobs.length) {
        showErrorNotification("Job not found!");
        return;
    }
    
    const job = gameState.jobs[jobIndex];
    
    // Get tier data
    const tierData = job.tiers && job.tiers.length > 0 ? job.tiers[0] : { minSkill: 0 };
    
    // Check if player meets requirements
    const requiredSkill = "Map Awareness";
    const requiredLevel = tierData.minSkill || 0;
    const currentLevel = gameState.skills[requiredSkill] || 0;
    const meetsRequirements = currentLevel >= requiredLevel;
    
    if (!meetsRequirements) {
        showNotification("Job Application", `You need ${requiredSkill} level ${requiredLevel} for this job!`, "error");
        return;
    }
    
    // Set the job as active with tier data
    gameState.activeJob = {
        ...job,
        ...tierData,
        progress: 0
    };
    
    gameState.currentJobTier = 0;
    gameState.jobProgress = 0;
    
    // Show notification
    showNotification("Job Application", `You got the job as a ${job.title}!`, "success");
    
    // Log the event
    logEvent(`You got a new job as a ${job.title}.`, 'career');
    
    // Close the jobs panel
    closeJobsPanel();
    
    // Update UI
    updateDisplay();
}

// End game function
export function endGame() {
    showNotification("Game Over", "You have reached the end of your career!", "info");

    const finalMapSkill = gameState.skills["Map Awareness"] || 0;
    const finalScore = Math.floor(gameState.gold) + (finalMapSkill * 10);

    // Logic to determine final career title
    let finalCareerTitle = "Unemployed";
    if (gameState.activeJob) {
        finalCareerTitle = gameState.activeJob.title;
    }

    logEvent(`You ended your career as a ${finalCareerTitle} with ${finalMapSkill} Map Awareness and ${Math.floor(gameState.gold)} gold.`, 'game');
    logEvent(`Final score: ${finalScore} points`, 'game');
    
    // Reset game if desired
    if (confirm("Start a new career?")) {
        window.resetGameState();
        updateDisplay();
        setupEventLog();
        logEvent("New career started!", 'game');
    }
}

// Make all functions available globally for non-module scripts
window.showNotification = showNotification;
window.showErrorNotification = showErrorNotification;
window.logEvent = logEvent;
window.setupJobsUI = setupJobsUI;
window.updateSkillDisplay = updateSkillDisplay;
window.setupAchievementsUI = setupAchievementsUI;
window.setupGameControls = setupGameControls;
window.setupEventLog = setupEventLog;
window.updateDisplay = updateDisplay;
window.closeJobsPanel = closeJobsPanel;
window.applyForJob = applyForJob;
window.endGame = endGame;

console.log("ui-setup.js - Module fully loaded and functions exported");