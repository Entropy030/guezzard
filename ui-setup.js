// ui-setup.js
console.log("ui-setup.js - Module LOADED and EXECUTING");

// Export utility functions that UI functions might need
export function showNotification(title, message, type) {
    alert(`${title}: ${message}`); // Keep simple for now
}

export function showErrorNotification(message) {
    alert(`Error: ${message}`);
}

export function logEvent(message, category = 'game') {
    console.log(`logEvent() - ${category.toUpperCase()} - Message:`, message);
    const eventLogList = document.getElementById('event-log-list');
    if (!eventLogList) {
        console.error("Error: #event-log-list element NOT FOUND in logEvent()! Cannot log event:", message);
        return;
    }
    const newEventItem = document.createElement('li');
    newEventItem.textContent = message;
    newEventItem.classList.add(`event-log-item`, `event-category-${category}`);
    eventLogList.prepend(newEventItem);
    if (eventLogList.children.length > CONFIG.settings.maxEventLogEntries) {
        eventLogList.removeChild(eventLogList.lastElementChild);
    }
}

// UI Management Functions
export function setupJobsUI() {
    console.log("Setting up jobs UI...");
    const jobsPanel = document.getElementById('jobs-panel');
    const jobsList = document.getElementById('jobs-list');
    const openJobsButton = document.getElementById('open-jobs-button');
    const closeJobsButton = document.getElementById('close-jobs-button');
    
    if (!jobsPanel || !jobsList || !openJobsButton || !closeJobsButton) {
        console.error("Error: One or more jobs UI elements not found!");
        return;
    }
    
    // Clear existing jobs
    jobsList.innerHTML = '';
    
    // Add jobs to the list
    gameState.jobs.forEach((job, index) => {
        const jobItem = document.createElement('div');
        jobItem.classList.add('job-item');
        
        // Check if player meets requirements
        const meetsRequirements = Object.entries(job.requirements).every(([skill, level]) => 
            (gameState.skills[skill]?.level || 0) >= level
        );
        
        if (!meetsRequirements) {
            jobItem.classList.add('job-locked');
        }
        
        jobItem.innerHTML = `
            <h3>${job.title}</h3>
            <p>Salary: ${job.salary}€</p>
            <div class="job-requirements">
                <h4>Requirements:</h4>
                <ul>
                    ${Object.entries(job.requirements).map(([skill, level]) => {
                        const currentLevel = gameState.skills[skill]?.level || 0;
                        const meetsSkill = currentLevel >= level;
                        return `<li class="${meetsSkill ? 'requirement-met' : 'requirement-not-met'}">
                                    ${skill}: ${currentLevel}/${level}
                                </li>`;
                    }).join('')}
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
    
    // Open jobs panel button
    openJobsButton.addEventListener('click', () => {
        jobsPanel.classList.add('active');
    });
    
    // Close jobs panel button
    closeJobsButton.addEventListener('click', () => {
        closeJobsPanel();
    });
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
    const currentJobNameDisplay = document.getElementById('current-job-name');

    // Get other display elements here for efficiency
    const goldDisplay = document.getElementById('gold-display');
    const ageDisplay = document.getElementById('age-display');
    const lifeQualityDisplay = document.getElementById('life-quality-display');
    const seasonDisplay = document.getElementById('season-display');

    // Error handling for missing elements
    if (goldDisplay) goldDisplay.textContent = Math.floor(gameState.gold);
    if (ageDisplay) ageDisplay.textContent = gameState.age; //Correct use of age property
    if (lifeQualityDisplay) lifeQualityDisplay.textContent = gameState.lifeQuality.toFixed(2);

    if (currentJobNameDisplay) {
        currentJobNameDisplay.textContent = gameState.activeJob ? gameState.activeJob.title : "No Job";
    }

    if (seasonDisplay) seasonDisplay.textContent = `Season: ${gameState.currentSeason}, Year ${gameState.year}`;
    
    // Update skills display (assuming this is part of the function)
    const skillsContainer = document.getElementById('skills-container');
    if (!skillsContainer) {
        console.error("Error: #skills-container element not found!");
        return;
    }
    
    skillsContainer.innerHTML = '';
    
    // Sort skills by level (descending)
    const sortedSkills = Object.entries(gameState.skills)
        .sort(([, skillA], [, skillB]) => (skillB.level || 0) - (skillA.level || 0));
    
    sortedSkills.forEach(([skillName, skillData]) => {
        const skillElement = document.createElement('div');
        skillElement.classList.add('skill-item');
        
        const iconHTML = skillData.icon ? 
            `<div class="skill-icon">${skillData.icon}</div>` : '';
        
        skillElement.innerHTML = `
            ${iconHTML}
            <div class="skill-info">
                <div class="skill-name">${skillName}</div>
                <div class="skill-level">Level: ${skillData.level || 0}</div>
                ${skillData.description ? `<div class="skill-description">${skillData.description}</div>` : ''}
            </div>
        `;
        
        skillsContainer.appendChild(skillElement);
    });
}

export function setupAchievementsUI() {
    console.log("Setting up achievements UI...");
    const achievementsContainer = document.getElementById('achievements-container');
    if (!achievementsContainer) {
        console.error("Error: #achievements-container element not found!");
        return;
    }
    
    achievementsContainer.innerHTML = '';
    
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
}

export function setupGameControls() {
    console.log("Setting up game controls...");
    const endGameButton = document.getElementById('end-game-button');
    if (endGameButton) {
        endGameButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to end your current life?')) {
                endGame();
            }
        });
    }
    
    // Additional game controls setup can go here
}

export function setupEventLog() {
    console.log("Setting up event log...");
    const eventLogContainer = document.getElementById('event-log-container');
    const eventLogList = document.getElementById('event-log-list');
    const clearLogButton = document.getElementById('clear-log-button');
    
    if (!eventLogContainer || !eventLogList) {
        console.error("Error: Event log elements not found!");
        return;
    }
    
    // Clear existing log
    eventLogList.innerHTML = '';
    
    // Add clear log button functionality
    if (clearLogButton) {
        clearLogButton.addEventListener('click', () => {
            eventLogList.innerHTML = '';
            logEvent('Event log cleared.', 'system');
        });
    }
    
    // Add initial log entry
    logEvent('Game started.', 'system');
}

export function updateDisplay() {
    console.log("Updating display...");
    // Update UI elements with current gameState values
    const goldDisplay = document.getElementById('gold-display');
    const ageDisplay = document.getElementById('age-display');
    const lifeQualityDisplay = document.getElementById('life-quality-display');
    const seasonDisplay = document.getElementById('season-display');
    
    if (goldDisplay) goldDisplay.textContent = Math.floor(gameState.gold);
    if (ageDisplay) ageDisplay.textContent = gameState.age;
    if (lifeQualityDisplay) lifeQualityDisplay.textContent = gameState.lifeQuality.toFixed(2);
    if (seasonDisplay) seasonDisplay.textContent = `Season: ${gameState.currentSeason}, Year ${gameState.year}`;
    
    // Update job-related UI
    updateJobUI();
    
    // Update skill-related UI
    updateSkillDisplay();
}

function updateJobUI() {
    // Update job-related UI elements
    const currentJobNameDisplay = document.getElementById('current-job-name');
    const currentJobSalaryDisplay = document.getElementById('current-job-salary');
    
    if (currentJobNameDisplay) {
        currentJobNameDisplay.textContent = gameState.activeJob ? gameState.activeJob.title : "No Job";
    }
    
    if (currentJobSalaryDisplay && gameState.activeJob) {
        currentJobSalaryDisplay.textContent = `${gameState.activeJob.salary}€`;
    } else if (currentJobSalaryDisplay) {
        currentJobSalaryDisplay.textContent = "0€";
    }
}

// Function for job application logic - also related to UI
export function applyForJob(jobIndex) {
    console.log(`Applying for job at index ${jobIndex}`);
    const job = gameState.jobs[jobIndex];
    
    if (!job) {
        showErrorNotification("Job not found!");
        return;
    }
    
    // Check if player meets all requirements
    const meetsRequirements = Object.entries(job.requirements).every(([skill, level]) => 
        (gameState.skills[skill]?.level || 0) >= level
    );
    
    if (!meetsRequirements) {
        showNotification("Job Application", "You don't meet the requirements for this job.", "error");
        return;
    }
    
    // Set the job as active
    gameState.activeJob = job;
    
    // Show notification
    showNotification("Job Application", `You got the job as a ${job.title}!`, "success");
    
    // Log the event
    logEvent(`You got a new job as a ${job.title}.`, 'career');
    
    // Close the jobs panel
    closeJobsPanel();
    
    // Update UI
    updateDisplay();
}

// Also export the endGame function as it's somewhat UI-related
export function endGame() {
    showNotification(CONFIG.uiText.endGameTitle, "You have reached the end of your life.", "info");

    const finalMapSkill = gameState.skills["Map Awareness"]?.level || 0; // Optional chaining for safety

    // Logic to determine final career title could be improved/simplified
    let finalCareerTitle = "Google Maps User"; // Default
    if (gameState.activeJob) {
      finalCareerTitle = gameState.activeJob.title;
    }

    logEvent(`You ended your career as a ${finalCareerTitle} with ${finalMapSkill} map skill and ${Math.floor(gameState.gold)}€.`);
}