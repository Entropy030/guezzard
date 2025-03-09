// display.js
// Handles all UI updates and display functionality

console.log("display.js - Module loading");

// Import settings from CONFIG (available globally)
const SETTINGS = CONFIG?.settings || {
    tickInterval: 25,
    ticksInOneGameDay: 5,
    seasonDuration: 150,
    ticksInOneGameYear: 600
};

// Main function to update all displays
export function updateAllDisplays() {
    console.log("updateAllDisplays() - Updating all UI elements");
    
    // Update status displays
    updateStatusDisplay();
    
    // Update resource displays
    updateResourceDisplay();
    
    // Update job/career displays
    updateJobDisplay();
    
    // Update skill displays
    updateSkillDisplay();
    
    // Update time and season displays
    updateTimeDisplay();
    
    // Update event log
    updateEventLog();
}

// Update player status indicators (gold, age, etc.)
export function updateStatusDisplay() {
    // Get elements
    const goldDisplay = document.getElementById('gold-display');
    const ageDisplay = document.getElementById('age-display');
    const lifeQualityDisplay = document.getElementById('life-quality-display');
    
    // Update gold display
    if (goldDisplay) {
        goldDisplay.textContent = Math.floor(gameState.gold);
    }
    
    // Update age display
    if (ageDisplay) {
        ageDisplay.textContent = gameState.age || 18;
    }
    
    // Update life quality display
    if (lifeQualityDisplay) {
        lifeQualityDisplay.textContent = gameState.lifeQuality || 50;
    }
}

// Update resource displays (energy, etc.)
export function updateResourceDisplay() {
    // Get elements
    const energyDisplay = document.getElementById('energy-display');
    const energyBarFill = document.getElementById('energy-bar-fill');
    
    // Update energy display if elements exist
    if (energyDisplay) {
        energyDisplay.textContent = `${Math.floor(gameState.energy)}/${gameState.maxEnergy}`;
    }
    
    // Update energy bar fill
    if (energyBarFill) {
        const energyPercentage = (gameState.energy / gameState.maxEnergy) * 100;
        energyBarFill.style.width = `${energyPercentage}%`;
    }
    
    // Update prestige display if it exists
    const prestigeDisplay = document.getElementById('prestige-display');
    if (prestigeDisplay) {
        prestigeDisplay.textContent = gameState.prestigeLevel || 0;
    }
}

// Update job displays
export function updateJobDisplay() {
    // Get elements
    const currentJobName = document.getElementById('current-job-name');
    const jobProgressFill = document.getElementById('job-progress-fill');
    const jobProgressText = document.getElementById('job-progress-text');
    
    // Update current job name
    if (currentJobName) {
        const jobTitle = gameState.activeJob ? gameState.activeJob.title : 'Unemployed';
        currentJobName.textContent = jobTitle;
        
        // Add tooltip with job details if employed
        if (gameState.activeJob) {
            const tier = gameState.currentJobTier || 0;
            const level = gameState.jobLevels && gameState.jobLevels[gameState.activeJob.id] || 1;
            currentJobName.title = `${jobTitle} (Tier ${tier}, Level ${level})`;
        } else {
            currentJobName.title = '';
        }
    }
    
    // Update job progress bar
    if (jobProgressFill && jobProgressText) {
        if (gameState.activeJob) {
            // Get current job level
            const jobId = gameState.activeJob.id;
            const currentLevel = gameState.jobLevels && gameState.jobLevels[jobId] || 1;
            
            // Calculate progress percentage
            let progressPercent = 0;
            
            // Use getJobProgressPercentage if available (from job-manager.js)
            if (typeof window.getJobProgressPercentage === 'function') {
                progressPercent = window.getJobProgressPercentage();
            } else {
                // Fallback calculation - basic formula
                const baseProgressNeeded = 100;
                const progressNeeded = baseProgressNeeded * Math.pow(1.1, currentLevel - 1);
                progressPercent = Math.min(100, (gameState.jobProgress / progressNeeded) * 100);
            }
            
            // Update progress bar width
            jobProgressFill.style.width = `${progressPercent}%`;
            
            // Update progress text
            jobProgressText.textContent = `Job Level ${currentLevel} - ${Math.floor(progressPercent)}%`;
        } else {
            // No active job
            jobProgressFill.style.width = '0%';
            jobProgressText.textContent = 'No Active Job';
        }
    }
}

// Update skill displays
export function updateSkillDisplay() {
    // Get elements
    const skillProgressFill = document.getElementById('skill-progress-fill');
    const skillProgressText = document.getElementById('skill-progress-text');
    
    // Update skill progress bar
    if (skillProgressFill && skillProgressText) {
        if (gameState.currentTrainingSkill) {
            // Get skill data
            const skillName = gameState.currentTrainingSkill;
            const skillLevel = typeof gameState.skills[skillName] === 'object' ?
                gameState.skills[skillName].level || 0 :
                gameState.skills[skillName] || 0;
            
            // Get skill progress
            const skillProgress = gameState.skillProgress && gameState.skillProgress[skillName] || 0;
            
            // Calculate progress needed (same formula as in job-manager.js)
            const progressNeeded = 10 + (skillLevel * 5);
            
            // Calculate percentage
            const progressPercent = Math.min(100, (skillProgress / progressNeeded) * 100);
            
            // Update progress bar
            skillProgressFill.style.width = `${progressPercent}%`;
            skillProgressText.textContent = `${skillName} Level ${skillLevel} - ${Math.floor(progressPercent)}%`;
        } else {
            // No skill training
            skillProgressFill.style.width = '0%';
            skillProgressText.textContent = 'No Skill Training';
        }
    }
    
    // Update skills list if panel is open
    const skillsPanel = document.getElementById('skills-panel');
    if (skillsPanel && skillsPanel.style.display === 'block') {
        // This will call the updateSkillDisplay function from ui-setup.js
        if (typeof window.updateSkillDisplay === 'function') {
            window.updateSkillDisplay();
        }
    }
}

// Update time and season displays
export function updateTimeDisplay() {
    // Get elements
    const seasonDisplay = document.getElementById('season-display');
    
    // Update season display
    if (seasonDisplay) {
        const season = gameState.currentSeason || 'Spring';
        const year = gameState.year || 1;
        const day = gameState.day || 1;
        
        seasonDisplay.textContent = `Season: ${season}, Year ${year}, Day ${day}`;
    }
    
    // Update other time-related displays as needed
}

// Update event log
export function updateEventLog() {
    const eventLogList = document.getElementById('event-log-list');
    
    if (!eventLogList || !gameState.eventLog) {
        return;
    }
    
    // Don't update if no new events (optimization)
    if (eventLogList._lastUpdateCount === gameState.eventLog.length) {
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
    
    // Store the update count to prevent unnecessary re-renders
    eventLogList._lastUpdateCount = gameState.eventLog.length;
}

// Function to show a notification
export function displayNotification(message, type = 'info', duration = 3000) {
    // Get or create notification container
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
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style notification based on type
    notification.style.backgroundColor = type === 'error' ? 'rgba(220, 53, 69, 0.9)' :
                                         type === 'success' ? 'rgba(40, 167, 69, 0.9)' :
                                         'rgba(123, 104, 238, 0.9)';
    notification.style.color = 'white';
    notification.style.padding = '12px 18px';
    notification.style.borderRadius = '8px';
    notification.style.marginBottom = '10px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    notification.style.transition = 'all 0.3s ease';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(50px)';
    
    // Add to container
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Set up removal
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50px)';
        
        // Remove from DOM after animation
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
    
    // Return the notification element for potential future reference
    return notification;
}

// Function to show confirmation dialog
export function showConfirmDialog(title, message, onConfirm, onCancel = null) {
    // Create dialog container
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';
    dialogOverlay.style.position = 'fixed';
    dialogOverlay.style.top = '0';
    dialogOverlay.style.left = '0';
    dialogOverlay.style.width = '100%';
    dialogOverlay.style.height = '100%';
    dialogOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    dialogOverlay.style.display = 'flex';
    dialogOverlay.style.justifyContent = 'center';
    dialogOverlay.style.alignItems = 'center';
    dialogOverlay.style.zIndex = '10000';
    
    // Create dialog box
    const dialogBox = document.createElement('div');
    dialogBox.className = 'dialog-box';
    dialogBox.style.backgroundColor = 'rgba(30, 30, 45, 0.95)';
    dialogBox.style.borderRadius = '12px';
    dialogBox.style.padding = '25px';
    dialogBox.style.maxWidth = '400px';
    dialogBox.style.width = '90%';
    dialogBox.style.boxShadow = '0 0 30px rgba(123, 104, 238, 0.5)';
    dialogBox.style.border = '1px solid rgba(123, 104, 238, 0.6)';
    
    // Add title
    const dialogTitle = document.createElement('h3');
    dialogTitle.textContent = title;
    dialogTitle.style.margin = '0 0 15px 0';
    dialogTitle.style.color = '#a496ff';
    dialogTitle.style.textAlign = 'center';
    
    // Add message
    const dialogMessage = document.createElement('p');
    dialogMessage.textContent = message;
    dialogMessage.style.marginBottom = '20px';
    
    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-around';
    
    // Confirm button
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.style.padding = '10px 20px';
    confirmButton.style.backgroundColor = '#4776E6';
    confirmButton.style.color = 'white';
    confirmButton.style.border = 'none';
    confirmButton.style.borderRadius = '20px';
    confirmButton.style.cursor = 'pointer';
    
    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.backgroundColor = '#6c757d';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '20px';
    cancelButton.style.cursor = 'pointer';
    
    // Add buttons to container
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    
    // Add elements to dialog box
    dialogBox.appendChild(dialogTitle);
    dialogBox.appendChild(dialogMessage);
    dialogBox.appendChild(buttonContainer);
    
    // Add dialog box to overlay
    dialogOverlay.appendChild(dialogBox);
    
    // Add overlay to body
    document.body.appendChild(dialogOverlay);
    
    // Add event listeners
    confirmButton.addEventListener('click', () => {
        dialogOverlay.remove();
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });
    
    cancelButton.addEventListener('click', () => {
        dialogOverlay.remove();
        if (typeof onCancel === 'function') {
            onCancel();
        }
    });
    
    // Also allow clicking outside to cancel
    dialogOverlay.addEventListener('click', (e) => {
        if (e.target === dialogOverlay) {
            dialogOverlay.remove();
            if (typeof onCancel === 'function') {
                onCancel();
            }
        }
    });
    
    return dialogOverlay;
}

// Function to play sound effect
export function playSound(soundName) {
    // This is a placeholder for actual sound implementation
    console.log(`Playing sound: ${soundName}`);
    
    // When you implement sound, you might do something like:
    /*
    const sound = new Audio(`sounds/${soundName}.mp3`);
    sound.volume = gameState.settings.soundVolume || 0.5;
    sound.play();
    */
}

// Function to show prestige animation
export function showPrestigeAnimation() {
    // Create animation container
    const animationContainer = document.createElement('div');
    animationContainer.className = 'prestige-animation';
    animationContainer.style.position = 'fixed';
    animationContainer.style.top = '0';
    animationContainer.style.left = '0';
    animationContainer.style.width = '100%';
    animationContainer.style.height = '100%';
    animationContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    animationContainer.style.display = 'flex';
    animationContainer.style.justifyContent = 'center';
    animationContainer.style.alignItems = 'center';
    animationContainer.style.zIndex = '10000';
    animationContainer.style.opacity = '0';
    animationContainer.style.transition = 'opacity 0.5s ease';
    
    // Create animation text
    const animationText = document.createElement('div');
    animationText.textContent = 'PRESTIGE!';
    animationText.style.fontSize = '5rem';
    animationText.style.color = '#8E54E9';
    animationText.style.textShadow = '0 0 20px rgba(123, 104, 238, 0.8)';
    animationText.style.fontWeight = 'bold';
    animationText.style.transform = 'scale(0.5)';
    animationText.style.transition = 'all 1s ease';
    
    // Add text to container
    animationContainer.appendChild(animationText);
    
    // Add container to body
    document.body.appendChild(animationContainer);
    
    // Start animation
    setTimeout(() => {
        animationContainer.style.opacity = '1';
        animationText.style.transform = 'scale(1.2)';
        
        // Add particles or other effects here
        
        // End animation
        setTimeout(() => {
            animationText.style.transform = 'scale(5)';
            animationText.style.opacity = '0';
            
            setTimeout(() => {
                animationContainer.style.opacity = '0';
                
                // Remove from DOM after animation
                setTimeout(() => {
                    animationContainer.remove();
                }, 500);
            }, 800);
        }, 1500);
    }, 100);
}

// Make all functions available globally
window.updateAllDisplays = updateAllDisplays;
window.updateStatusDisplay = updateStatusDisplay;
window.updateResourceDisplay = updateResourceDisplay;
window.updateJobDisplay = updateJobDisplay;
window.updateSkillDisplay = updateSkillDisplay;
window.updateTimeDisplay = updateTimeDisplay;
window.updateEventLog = updateEventLog;
window.displayNotification = displayNotification;
window.showConfirmDialog = showConfirmDialog;
window.playSound = playSound;
window.showPrestigeAnimation = showPrestigeAnimation;

console.log("display.js - Module loaded successfully");