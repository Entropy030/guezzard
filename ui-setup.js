// ui-setup.js - Enhanced version for job panel functionality

// Define displayNotification function first
function displayNotification(message, type = 'info', duration = 3000) {
    console.log(`Notification: ${message} (${type})`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add to notification container
    let container = document.getElementById('notification-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);

    // Add entry animation
    notification.classList.add('notification-enter');

    // Set up removal after duration
    setTimeout(() => {
        // Add exit animation
        notification.classList.add('notification-exit');

        // Remove from DOM after animation completes
        notification.addEventListener('animationend', () => {
            notification.remove();
        });
    }, duration);

    return notification;
}

// Notifications and event logging
function showNotification(title, message, type = 'info') {
    console.log(`Notification: ${title} - ${message} (${type})`);
    displayNotification(`${title}: ${message}`, type);
}

function showErrorNotification(message) {
    console.error(`Error: ${message}`);
    displayNotification(message, 'error');
}

function logEvent(message, category = 'general') {
    console.log(`Event Log (${category}): ${message}`);
    
    // Create event log entry
    const eventEntry = {
        timestamp: new Date().toISOString(),
        message: message,
        category: category,
        day: gameState.day || 1
    };

    // Add to event log array
    if (!gameState.eventLog) {
        gameState.eventLog = [];
    }
    gameState.eventLog.unshift(eventEntry);

    // Keep log at a reasonable size
    if (gameState.eventLog.length > 100) {
        gameState.eventLog.pop();
    }

    // Update event log display if it exists
    updateEventLogDisplay();
}

// Event log display
function setupEventLog() {
    console.log("Setting up event log display...");
    const eventLogList = document.getElementById('event-log-list');
    
    if (!eventLogList) {
        console.error("Event log list element not found");
        return;
    }
    
    // Clear existing log entries
    eventLogList.innerHTML = '';
    
    // Add initial welcome messages
    const welcomeEntry = document.createElement('li');
    welcomeEntry.textContent = 'Welcome to Guezzard, the Career Master Game!';
    eventLogList.appendChild(welcomeEntry);
    
    const startEntry = document.createElement('li');
    startEntry.textContent = 'Your journey begins. What will you become?';
    eventLogList.appendChild(startEntry);
}

function updateEventLogDisplay() {
    const eventLogList = document.getElementById('event-log-list');
    
    if (!eventLogList || !gameState.eventLog) {
        return;
    }
    
    // Clear existing log entries
    eventLogList.innerHTML = '';
    
    // Get the most recent entries (limit to 5 for now)
    const recentEntries = gameState.eventLog.slice(0, 5);
    
    // Add entries to the log display
    recentEntries.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = entry.message;
        
        // Add category as a class for potential styling
        if (entry.category) {
            listItem.classList.add(`event-${entry.category}`);
        }
        
        eventLogList.appendChild(listItem);
    });
}

// Game controls setup
function setupGameControls() {
    console.log("Setting up game controls...");
    
    // Pause button
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.addEventListener('click', togglePause);
    }
    
    // Speed button
    const speedButton = document.getElementById('speed-button');
    if (speedButton) {
        speedButton.addEventListener('click', cycleGameSpeed);
    }
    
    // Set up action buttons
    setupActionButtons();
    
    // Set up panel close buttons
    setupPanelCloseButtons();
}

function togglePause() {
    gameState.gamePaused = !gameState.gamePaused;
    
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.textContent = gameState.gamePaused ? '▶ Resume' : '|| Pause';
    }
    
    logEvent(gameState.gamePaused ? "Game paused" : "Game resumed", 'system');
}

function cycleGameSpeed() {
    // Get available speed multipliers from config
    const speedMultipliers = CONFIG.settings.speedMultipliers || [1, 2, 4];
    
    // Find current speed index
    let currentIndex = speedMultipliers.indexOf(gameState.gameSpeed);
    
    // Go to next speed (or back to first if at end)
    currentIndex = (currentIndex + 1) % speedMultipliers.length;
    gameState.gameSpeed = speedMultipliers[currentIndex];
    
    // Update speed button text
    const speedButton = document.getElementById('speed-button');
    if (speedButton) {
        speedButton.textContent = `▶ ${gameState.gameSpeed}x Speed`;
    }
    
    logEvent(`Game speed set to ${gameState.gameSpeed}x`, 'system');
}

// Action buttons setup
function setupActionButtons() {
    console.log("Setting up action buttons...");
    
    // Job button
    const jobButton = document.getElementById('job-button');
    if (jobButton) {
        jobButton.addEventListener('click', () => {
            console.log("Jobs button clicked");
            
            // Get the jobs panel
            const jobsPanel = document.getElementById('jobs-panel');
            if (!jobsPanel) {
                console.error("Jobs panel not found in DOM");
                return;
            }
            
            // Update job listings
            setupJobsUI();
            
            // Show the panel
            jobsPanel.style.display = 'block';
        });
    }
    
    // Skill button
    const skillButton = document.getElementById('skill-button');
    if (skillButton) {
        skillButton.addEventListener('click', () => {
            const skillsPanel = document.getElementById('skills-panel');
            if (skillsPanel) {
                updateSkillDisplay();
                skillsPanel.style.display = 'block';
            }
        });
    }
    
    // Shop button
    const shopButton = document.getElementById('shop-button');
    if (shopButton) {
        shopButton.addEventListener('click', () => {
            const shopPanel = document.getElementById('shop-panel');
            if (shopPanel) {
                // TODO: Implement setupShopUI function
                // setupShopUI();
                shopPanel.style.display = 'block';
            }
        });
    }
    
    // Achievements button
    const achievementsButton = document.getElementById('achievements-button');
    if (achievementsButton) {
        achievementsButton.addEventListener('click', () => {
            const achievementsPanel = document.getElementById('achievements-panel');
            if (achievementsPanel) {
                setupAchievementsUI();
                achievementsPanel.style.display = 'block';
            }
        });
    }
    
    // Prestige button
    const prestigeButton = document.getElementById('prestige-button');
    if (prestigeButton) {
        prestigeButton.addEventListener('click', () => {
            const prestigePanel = document.getElementById('prestige-panel');
            if (prestigePanel) {
                // TODO: Implement setupPrestigeUI function
                if (typeof window.setupPrestigeUI === 'function') {
                    window.setupPrestigeUI();
                }
                prestigePanel.style.display = 'block';
            }
        });
    }
}

// Panel close buttons
function setupPanelCloseButtons() {
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const panelId = button.getAttribute('data-panel');
            if (panelId) {
                const panel = document.getElementById(panelId);
                if (panel) {
                    panel.style.display = 'none';
                }
            }
        });
    });
}

// Jobs UI setup
function setupJobsUI() {
    console.log("Setting up jobs UI...");
    
    // Get jobs panel and list
    const jobsPanel = document.getElementById('jobs-panel');
    const jobsList = document.getElementById('jobs-list');
    
    if (!jobsList) {
        console.error("Jobs list element not found");
        return;
    }
    
    // Clear existing jobs
    jobsList.innerHTML = '';
    
    // Get available jobs
    const availableJobs = window.getAvailableJobs ? window.getAvailableJobs() : [];
    
    // Check if jobs data is available
    if (!availableJobs || availableJobs.length === 0) {
        jobsList.innerHTML = '<li class="no-jobs">No jobs available yet. Gain some skills first!</li>';
        return;
    }
    
    // Group jobs by their base ID to show progression
    const jobsByBaseId = {};
    
    availableJobs.forEach(job => {
        if (!jobsByBaseId[job.id]) {
            jobsByBaseId[job.id] = [];
        }
        jobsByBaseId[job.id].push(job);
    });
    
    // Add jobs to the list, grouped by progression
    for (const [baseId, jobs] of Object.entries(jobsByBaseId)) {
        // Sort by tier
        jobs.sort((a, b) => a.tier - b.tier);
        
        // Create a job group container
        const jobGroup = document.createElement('div');
        jobGroup.classList.add('job-group');
        
        // Add each job tier
        jobs.forEach((job, index) => {
            const jobItem = document.createElement('li');
            jobItem.classList.add('job-item');
            
            // Highlight if it's the player's current job
            if (gameState.activeJob && gameState.activeJob.id === job.id && gameState.currentJobTier === job.tier) {
                jobItem.classList.add('current-job');
            }
            
            // Get requirements info
            const requiredSkill = "Map Awareness";
            const requiredLevel = job.minSkill || 0;
            const currentSkillLevel = gameState.skills[requiredSkill] || 0;
            
            // Get job level info for this job
            const jobLevel = gameState.jobLevels && gameState.jobLevels[job.id] ? gameState.jobLevels[job.id] : 0;
            
            // Get previous job requirement if applicable
            let previousJobRequirement = '';
            if (job.requiredJobId && job.requiredJobLevel) {
                const requiredJobLevel = job.requiredJobLevel;
                const currentPrevJobLevel = gameState.jobLevels && gameState.jobLevels[job.requiredJobId] || 0;
                const meetsJobLevelReq = currentPrevJobLevel >= requiredJobLevel;
                
                previousJobRequirement = `
                    <div class="requirement ${meetsJobLevelReq ? 'met' : 'not-met'}">
                        Previous Job Level: ${currentPrevJobLevel}/${requiredJobLevel}
                    </div>
                `;
            }
            
            // Create job HTML
            jobItem.innerHTML = `
                <div class="job-header">
                    <h3>${job.title} ${job.tier > 0 ? `(Tier ${job.tier})` : ''}</h3>
                </div>
                <div class="job-details">
                    <div class="job-income">Income: ${job.incomePerYear} gold/year</div>
                    <div class="job-level">Current Level: ${jobLevel}</div>
                    <div class="job-requirements">
                        <h4>Requirements:</h4>
                        <div class="requirement ${currentSkillLevel >= requiredLevel ? 'met' : 'not-met'}">
                            ${requiredSkill}: ${currentSkillLevel}/${requiredLevel}
                        </div>
                        ${previousJobRequirement}
                    </div>
                    <div class="skill-gains">
                        <h4>Skill Gains:</h4>
                        <ul>
                            ${Object.entries(job.skillGainPerYear || {}).map(([skill, gain]) => 
                                `<li>${skill}: +${gain}/year</li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>
                <button class="apply-button" data-job-index="${availableJobs.indexOf(job)}" data-job-tier="${job.tier}">
                    ${gameState.activeJob && gameState.activeJob.id === job.id && gameState.currentJobTier === job.tier ? 'Current Job' : 'Apply'}
                </button>
            `;
            
            jobsList.appendChild(jobItem);
        });
    }
    
    // Add event listeners to apply buttons
    const applyButtons = jobsList.querySelectorAll('.apply-button');
    applyButtons.forEach(button => {
        // Disable the button if it's already the current job
        if (button.textContent.trim() === 'Current Job') {
            button.disabled = true;
        }
        
        button.addEventListener('click', (e) => {
            const jobIndex = parseInt(e.target.getAttribute('data-job-index'), 10);
            const jobTier = parseInt(e.target.getAttribute('data-job-tier'), 10);
            
            // Check if it's a valid job
            if (isNaN(jobIndex) || jobIndex < 0) {
                console.error(`Invalid job index: ${jobIndex}`);
                return;
            }
            
            // Call the applyForJob function with the selected job
            if (typeof window.applyForJob === 'function') {
                const success = window.applyForJob(jobIndex, jobTier);
                if (success) {
                    closeJobsPanel();
                    updateDisplay();
                }
            } else {
                console.error("applyForJob function not available globally");
            }
        });
    });
    
    console.log(`setupJobsUI() - Added ${availableJobs.length} jobs to the UI`);
}

function closeJobsPanel() {
    const jobsPanel = document.getElementById('jobs-panel');
    if (jobsPanel) {
        jobsPanel.style.display = 'none';
    }
}

// Skills UI
function updateSkillDisplay() {
    console.log("Updating skill display...");
    
    const skillsList = document.getElementById('skills-list');
    
    if (!skillsList) {
        console.error("Skills list element not found");
        return;
    }
    
    // Clear existing skills
    skillsList.innerHTML = '';
    
    // Check if skills data is available
    if (!gameState.skills || Object.keys(gameState.skills).length === 0) {
        skillsList.innerHTML = '<li class="no-skills">No skills available yet.</li>';
        return;
    }
    
    // Add skills to the list
    for (const [skillName, skillData] of Object.entries(gameState.skills)) {
        const skillItem = document.createElement('li');
        skillItem.classList.add('skill-item');
        
        // Handle different skill data formats
        let skillLevel = 0;
        let skillDescription = '';
        
        if (typeof skillData === 'object') {
            skillLevel = skillData.level || 0;
            skillDescription = skillData.description || '';
        } else if (typeof skillData === 'number') {
            skillLevel = skillData;
        }
        
        // Get skill progress data
        const skillProgress = gameState.skillProgress && gameState.skillProgress[skillName] || 0;
        const progressNeeded = 10 + (skillLevel * 5); // Same formula as in job-manager.js
        const progressPercent = Math.min(100, (skillProgress / progressNeeded) * 100);
        
        // Create skill HTML
        skillItem.innerHTML = `
            <div class="skill-header">
                <h3>${skillName}</h3>
                <div class="skill-level">Level ${skillLevel}</div>
            </div>
            <div class="skill-details">
                <div class="skill-description">${skillDescription}</div>
                <div class="skill-progress-container">
                    <div class="skill-progress-bar">
                        <div class="skill-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="skill-progress-text">${progressPercent.toFixed(1)}%</div>
                </div>
            </div>
            <button class="train-skill-button" data-skill="${skillName}">Train</button>
        `;
        
        skillsList.appendChild(skillItem);
    }
    
    // Add event listeners to train buttons (placeholder for now)
    const trainButtons = skillsList.querySelectorAll('.train-skill-button');
    trainButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const skillName = e.target.getAttribute('data-skill');
            
            // Placeholder for skill training functionality
            console.log(`Training skill: ${skillName}`);
            logEvent(`Started training ${skillName}.`, 'skill');
            
            // Close the panel
            const skillsPanel = document.getElementById('skills-panel');
            if (skillsPanel) {
                skillsPanel.style.display = 'none';
            }
        });
    });
}

// Achievements UI
function setupAchievementsUI() {
    console.log("Setting up achievements UI...");
    
    const achievementsList = document.getElementById('achievements-list');
    
    if (!achievementsList) {
        console.error("Achievements list element not found");
        return;
    }
    
    // Clear existing achievements
    achievementsList.innerHTML = '';
    
    // Check if achievements data is available
    if (!gameState.achievements || !Array.isArray(gameState.achievements) || gameState.achievements.length === 0) {
        achievementsList.innerHTML = '<li class="no-achievements">No achievements available yet.</li>';
        return;
    }
    
    // Add achievements to the list
    gameState.achievements.forEach(achievement => {
        const achievementItem = document.createElement('li');
        achievementItem.classList.add('achievement-item');
        
        // Check if achievement is unlocked
        const isUnlocked = achievement.unlocked || false;
        
        if (isUnlocked) {
            achievementItem.classList.add('unlocked');
        } else {
            achievementItem.classList.add('locked');
        }
        
        // Create achievement HTML
        achievementItem.innerHTML = `
            <div class="achievement-icon">
                <i class="fas ${isUnlocked ? 'fa-trophy' : 'fa-lock'}"></i>
            </div>
            <div class="achievement-details">
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
            </div>
        `;
        
        achievementsList.appendChild(achievementItem);
    });
}

// General display updating
function updateDisplay() {
    console.log("Updating game display...");
    
    // Update top bar indicators
    updateTopBarDisplay();
    
    // Update job display
    updateJobDisplay();
    
    // Update event log
    updateEventLogDisplay();
}

function updateTopBarDisplay() {
    // Update gold display
    const goldDisplay = document.getElementById('gold-display');
    if (goldDisplay) {
        goldDisplay.textContent = Math.floor(gameState.gold);
    }
    
    // Update age display
    const ageDisplay = document.getElementById('age-display');
    if (ageDisplay) {
        ageDisplay.textContent = gameState.age || 18;
    }
    
    // Update life quality display
    const lifeQualityDisplay = document.getElementById('life-quality-display');
    if (lifeQualityDisplay) {
        lifeQualityDisplay.textContent = gameState.lifeQuality || 50;
    }
    
    // Update season display
    const seasonDisplay = document.getElementById('season-display');
    if (seasonDisplay) {
        seasonDisplay.textContent = `Season: ${gameState.currentSeason || 'Spring'}, Year ${gameState.year || 1}`;
    }
}

function updateJobDisplay() {
    // Update current job display
    const currentJobName = document.getElementById('current-job-name');
    if (currentJobName) {
        currentJobName.textContent = gameState.activeJob ? gameState.activeJob.title : 'Unemployed';
    }
    
    // Update job progress bar
    const jobProgressFill = document.getElementById('job-progress-fill');
    const jobProgressText = document.getElementById('job-progress-text');
    
    if (jobProgressFill && jobProgressText) {
        if (gameState.activeJob) {
            // Calculate job progress percentage
            const progressPercent = window.getJobProgressPercentage ? 
                window.getJobProgressPercentage() : 
                (gameState.jobProgress / 100) * 100; // Fallback calculation
            
            jobProgressFill.style.width = `${progressPercent}%`;
            
            // Get job level
            const jobLevel = gameState.jobLevels && gameState.jobLevels[gameState.activeJob.id] || 1;
            
            jobProgressText.textContent = `${gameState.activeJob.title} (Lvl ${jobLevel}) - ${Math.floor(progressPercent)}%`;
        } else {
            jobProgressFill.style.width = '0%';
            jobProgressText.textContent = 'No Active Job';
        }
    }
}

// Game end function
function endGame() {
    console.log("endGame() - Game has ended");
    
    // Display end game message
    const message = `
        <h2>${CONFIG.uiText.endGameTitle}</h2>
        <p>You've reached age ${gameState.age} and it's time to retire.</p>
        <p>Your final stats:</p>
        <ul>
            <li>Total Gold Earned: ${Math.floor(gameState.statistics.totalGoldEarned || 0)}</li>
            <li>Jobs Held: ${gameState.statistics.jobsHeld || 0}</li>
            <li>Prestige Level: ${gameState.prestigeLevel || 0}</li>
        </ul>
        <p>Would you like to start a new life?</p>
        <button id="new-life-button">${CONFIG.uiText.newLifeButton}</button>
    `;
    
    // Create modal for end game
    const endGameModal = document.createElement('div');
    endGameModal.id = 'end-game-modal';
    endGameModal.innerHTML = message;
    
    // Add modal to body
    document.body.appendChild(endGameModal);
    
    // Add event listener to new life button
    const newLifeButton = document.getElementById('new-life-button');
    if (newLifeButton) {
        newLifeButton.addEventListener('click', startNewLife);
    }
    
    // Pause the game
    gameState.gamePaused = true;
}

function startNewLife() {
    console.log("startNewLife() - Starting a new life");
    
    // Remove end game modal
    const endGameModal = document.getElementById('end-game-modal');
    if (endGameModal) {
        endGameModal.remove();
    }
    
    // Reset game state but keep prestige data
    const prestigeKeepData = {
        prestigePoints: gameState.prestigePoints || 0,
        prestigeLevel: gameState.prestigeLevel || 0,
        statistics: gameState.statistics || {}
    };
    
    // Get default game state
    const defaultState = window.getDefaultGameState ? window.getDefaultGameState() : {};
    
    // Apply default state
    Object.assign(gameState, defaultState);
    
    // Restore prestige data
    gameState.prestigePoints = prestigeKeepData.prestigePoints;
    gameState.prestigeLevel = prestigeKeepData.prestigeLevel;
    gameState.statistics = prestigeKeepData.statistics;
    
    // Unpause the game
    gameState.gamePaused = false;
    
    // Update display
    updateDisplay();
    
    // Log event
    logEvent("Starting a new life!", 'system');
}

// Correctly export functions
export {
    showNotification,
    showErrorNotification,
    logEvent,
    setupJobsUI,
    updateSkillDisplay,
    setupAchievementsUI,
    setupGameControls,
    setupEventLog,
    updateDisplay,
    closeJobsPanel,
    displayNotification,
    updateTopBarDisplay,
    updateJobDisplay,
    endGame,
    startNewLife
};

// Add this to ui-setup.js or another appropriate file
function endGame() {
    console.log("endGame() - Player has reached retirement age: " + gameState.age);
    
    // Pause the game
    gameState.gamePaused = true;
    
    // Create end game modal if it doesn't exist
    let endGameModal = document.getElementById('end-game-modal');
    
    if (!endGameModal) {
        endGameModal = document.createElement('div');
        endGameModal.id = 'end-game-modal';
        endGameModal.style.position = 'fixed';
        endGameModal.style.top = '0';
        endGameModal.style.left = '0';
        endGameModal.style.width = '100%';
        endGameModal.style.height = '100%';
        endGameModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        endGameModal.style.display = 'flex';
        endGameModal.style.justifyContent = 'center';
        endGameModal.style.alignItems = 'center';
        endGameModal.style.zIndex = '9999';
        
        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = '#f7f5f0';
        modalContent.style.padding = '30px';
        modalContent.style.borderRadius = '10px';
        modalContent.style.maxWidth = '500px';
        modalContent.style.width = '80%';
        modalContent.style.textAlign = 'center';
        
        modalContent.innerHTML = `
            <h2 style="color: #e67e22;">Retirement Day!</h2>
            <p>You've reached age ${gameState.age} and it's time to retire.</p>
            <p>Your final stats:</p>
            <ul style="text-align: left; padding-left: 20px;">
                <li>Total Gold: ${Math.floor(gameState.gold || 0)}</li>
                <li>Final Job: ${gameState.activeJob ? gameState.activeJob.title : 'Unemployed'}</li>
                <li>Years Worked: ${gameState.year - 1}</li>
            </ul>
            <button id="prestige-button" style="background-color: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">Prestige & Start New Life</button>
            <button id="new-game-button" style="background-color: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">New Game</button>
        `;
        
        endGameModal.appendChild(modalContent);
        document.body.appendChild(endGameModal);
        
        // Add event listeners to buttons
        document.getElementById('prestige-button').addEventListener('click', () => {
            // Handle prestige logic
            if (typeof window.performPrestige === 'function') {
                window.performPrestige();
            } else {
                // Basic prestige fallback
                gameState.prestigeLevel = (gameState.prestigeLevel || 0) + 1;
                resetGame();
            }
            endGameModal.remove();
        });
        
        document.getElementById('new-game-button').addEventListener('click', () => {
            // Reset without prestige
            resetGame();
            endGameModal.remove();
        });
    } else {
        // Show existing modal
        endGameModal.style.display = 'flex';
    }
}

// Basic game reset function
function resetGame() {
    // Create default game state
    if (typeof window.getDefaultGameState === 'function') {
        const defaultState = window.getDefaultGameState();
        
        // Preserve prestige level
        const prestigeLevel = gameState.prestigeLevel || 0;
        
        // Reset game state
        Object.assign(gameState, defaultState);
        
        // Restore prestige level
        gameState.prestigeLevel = prestigeLevel;
    } else {
        // Simple reset
        gameState.age = 18;
        gameState.day = 1;
        gameState.year = 1;
        gameState.currentSeason = "Spring";
        gameState.seasonTimeLeft = CONFIG.settings.seasonDuration;
        gameState.gold = 0;
        gameState.activeJob = null;
        gameState.skills = { "Map Awareness": 1 };
        gameState.skillProgress = { "Map Awareness": 0 };
        gameState.gamePaused = false;
    }
    
    // Update display
    if (typeof window.updateDisplay === 'function') {
        window.updateDisplay();
    }
    
    // Log event
    if (typeof window.logEvent === 'function') {
        window.logEvent("Starting a new life!", 'system');
    }
}




// Make functions available globally
window.displayNotification = displayNotification;
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
window.endGame = endGame;
window.resetGame = resetGame;