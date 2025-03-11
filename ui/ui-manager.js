// ui-manager.js - Unified UI system
// This file consolidates functionality from:
// - ui-setup.js
// - display-module.js
// - notifications.js
// - parts of career-progression-ui.js
// - parts of skill-ui.js

console.log("ui-manager.js - Loading unified UI system");

// Import specialized UI modules
import { setupSkillUI } from './skill-ui.js';
import { setupJobUI } from './job-ui.js';
import { setupCareerUI } from './career-ui.js';

/**
 * Initialize the UI system
 */
export function initializeUISystem() {
    console.log("initializeUISystem() - Setting up UI system");
    
    // Set up base UI components
    setupEventLog();
    setupGameControls();
    setupPanels();
    setupNotificationSystem();
    
    // Initialize specialized UI modules
    if (typeof setupSkillUI === 'function') setupSkillUI();
    if (typeof setupJobUI === 'function') setupJobUI();
    if (typeof setupCareerUI === 'function') setupCareerUI();
    
    // Set up event listeners for action buttons
    setupActionButtons();
    
    // Initial UI update
    updateAllDisplays();
    
    console.log("UI system initialized successfully");
    return true;
}

/**
 * Set up notification system
 */
function setupNotificationSystem() {
    console.log("setupNotificationSystem() - Setting up notification container");
    
    // Create notification container if it doesn't exist
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
}

/**
 * Display a notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('info', 'success', 'error', 'warning')
 * @param {number} duration - Duration in milliseconds
 * @returns {HTMLElement} - The notification element
 */
export function displayNotification(message, type = 'info', duration = 3000) {
    console.log(`Notification: ${message} (${type})`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add to notification container
    let container = document.getElementById('notification-container');
    
    if (!container) {
        setupNotificationSystem();
        container = document.getElementById('notification-container');
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

/**
 * Show a notification with title and message
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 */
export function showNotification(title, message, type = 'info') {
    displayNotification(`${title}: ${message}`, type);
}

/**
 * Show an error notification
 * @param {string} message - Error message
 */
export function showErrorNotification(message) {
    console.error(`Error: ${message}`);
    displayNotification(message, 'error');
}

/**
 * Log an event to the event log
 * @param {string} message - Event message
 * @param {string} category - Event category
 */
export function logEvent(message, category = 'general') {
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

    // Update event log display
    updateEventLogDisplay();
}

/**
 * Set up the event log display
 */
export function setupEventLog() {
    console.log("setupEventLog() - Setting up event log display");
    
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

/**
 * Update the event log display
 */
function updateEventLogDisplay() {
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

/**
 * Set up game controls
 */
export function setupGameControls() {
    console.log("setupGameControls() - Setting up game controls");
    
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
}

/**
 * Toggle game pause state
 */
function togglePause() {
    gameState.gamePaused = !gameState.gamePaused;
    
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.textContent = gameState.gamePaused ? '▶ Resume' : '|| Pause';
    }
    
    logEvent(gameState.gamePaused ? "Game paused" : "Game resumed", 'system');
}

/**
 * Cycle through game speed options
 */
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

/**
 * Set up UI panels
 */
function setupPanels() {
    console.log("setupPanels() - Setting up panel system");
    
    // Set up panel close buttons
    setupPanelCloseButtons();
}

/**
 * Set up panel close buttons
 */
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

/**
 * Set up action buttons
 */
function setupActionButtons() {
    console.log("setupActionButtons() - Setting up action buttons");
    
    // Job button
    const jobButton = document.getElementById('job-button');
    if (jobButton) {
        jobButton.addEventListener('click', () => {
            const jobsPanel = document.getElementById('jobs-panel');
            if (jobsPanel) {
                setupJobsUI();
                jobsPanel.style.display = 'block';
            }
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
                setupShopUI();
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
                if (typeof window.setupPrestigeUI === 'function') {
                    window.setupPrestigeUI();
                }
                prestigePanel.style.display = 'block';
            }
        });
    }
}

/**
 * Update all displays
 */
export function updateAllDisplays() {
    updateStatusDisplay();
    updateResourceDisplay();
    updateJobDisplay();
    updateSkillDisplay();
    updateTimeDisplay();
    updateEventLog();
}

/**
 * Update status displays (gold, age, etc.)
 */
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

/**
 * Update resource displays (energy, etc.)
 */
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

/**
 * Update job display
 */
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
            
            // Use getJobProgressPercentage if available
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

/**
 * Set up jobs UI
 */
export function setupJobsUI() {
    console.log("setupJobsUI() - Setting up jobs UI");
    
    // Get jobs panel and list
    const jobsPanel = document.getElementById('jobs-panel');
    const jobsList = document.getElementById('jobs-list');
    
    if (!jobsList) {
        console.error("Jobs list element not found");
        return;
    }
    
    // Clear existing jobs
    jobsList.innerHTML = '';
    
    // Add a default message if no functions exist to get jobs
    if (typeof window.getAvailableJobs !== 'function') {
        jobsList.innerHTML = '<li class="no-jobs">Job system not fully initialized yet.</li>';
        return;
    }
    
    // Get available jobs
    const availableJobs = window.getAvailableJobs();
    
    // Check if jobs data is available
    if (!availableJobs || availableJobs.length === 0) {
        jobsList.innerHTML = '<li class="no-jobs">No jobs available yet. Gain some skills first!</li>';
        return;
    }
    
    // Add jobs to the list
    availableJobs.forEach(job => {
        const jobItem = document.createElement('li');
        jobItem.className = 'job-item';
        
        // Highlight if it's the player's current job
        if (gameState.activeJob && gameState.activeJob.id === job.id && gameState.currentJobTier === job.tier) {
            jobItem.classList.add('current-job');
        }
        
        // Simple job HTML
        jobItem.innerHTML = `
            <div class="job-header">
                <h3>${job.title} ${job.tier > 0 ? `(Tier ${job.tier})` : ''}</h3>
            </div>
            <div class="job-details">
                <div class="job-income">Income: ${job.incomePerYear} gold/year</div>
                <div class="job-requirements">
                    <h4>Requirements:</h4>
                    <!-- Add requirements here -->
                </div>
                <div class="job-skills">
                    <h4>Skill Gains:</h4>
                    <!-- Add skill gains here -->
                </div>
            </div>
            <button class="apply-button" data-job-index="${availableJobs.indexOf(job)}" data-job-tier="${job.tier}">
                ${gameState.activeJob && gameState.activeJob.id === job.id && gameState.currentJobTier === job.tier ? 'Current Job' : 'Apply'}
            </button>
        `;
        
        jobsList.appendChild(jobItem);
    });
    
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
                    updateAllDisplays();
                }
            } else {
                console.error("applyForJob function not available globally");
            }
        });
    });
}

/**
 * Close jobs panel
 */
export function closeJobsPanel() {
    const jobsPanel = document.getElementById('jobs-panel');
    if (jobsPanel) {
        jobsPanel.style.display = 'none';
    }
}

/**
 * Update skill display
 */
export function updateSkillDisplay() {
    console.log("updateSkillDisplay() - Updating skill display");
    
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
        
        // Handle different skill data formats
        let skillLevel = 0;
        
        if (typeof skillData === 'object') {
            skillLevel = skillData.level || 0;
        } else if (typeof skillData === 'number') {
            skillLevel = skillData;
        }
        
        // Simple skill HTML
        skillItem.innerHTML = `
            <div>${skillName}: Level ${skillLevel}</div>
        `;
        
        skillsList.appendChild(skillItem);
    }
}

/**
 * Set up achievements UI
 */
export function setupAchievementsUI() {
    console.log("setupAchievementsUI() - Setting up achievements UI");
    
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
        
        // Check if achievement is unlocked
        const isUnlocked = achievement.unlocked || false;
        
        // Simple achievement HTML
        achievementItem.innerHTML = `
            <div>${achievement.name} - ${isUnlocked ? 'Unlocked' : 'Locked'}</div>
            <div>${achievement.description}</div>
        `;
        
        achievementsList.appendChild(achievementItem);
    });
}

/**
 * Update time display
 */
export function updateTimeDisplay() {
    // Get elements
    const seasonDisplay = document.getElementById('season-display');
    
    // Update season display
    if (seasonDisplay) {
        const season = gameState.currentSeason || 'Spring';
        const year = gameState.year || 1;
        const day = gameState.day || 1;
        
        seasonDisplay.textContent = `Day ${day}, ${season}, Year ${year}`;
    }
}

/**
 * Set up shop UI
 */
export function setupShopUI() {
    console.log("setupShopUI() - Setting up shop UI");
    
    const shopItemsList = document.getElementById('shop-items-list');
    
    if (!shopItemsList) {
        console.error("Shop items list element not found");
        return;
    }
    
    // Clear existing shop items
    shopItemsList.innerHTML = '';
    
    // Get shop items from config
    const shopItems = CONFIG.shopItems || [];
    
    // Check if shop items are available
    if (!shopItems || shopItems.length === 0) {
        shopItemsList.innerHTML = '<li class="no-items">No items available in the shop.</li>';
        return;
    }
    
    // Add shop items to the list
    shopItems.forEach(item => {
        const itemElement = document.createElement('li');
        itemElement.className = 'shop-item';
        
        // Check if player can afford the item
        const canAfford = gameState.gold >= item.price;
        
        // Check if player has reached max purchases
        const purchasedCount = gameState.purchasedItems && gameState.purchasedItems[item.id] ? 
            gameState.purchasedItems[item.id] : 0;
        const reachedMaxPurchases = item.maxPurchases && purchasedCount >= item.maxPurchases;
        
        // Create shop item HTML
        itemElement.innerHTML = `
            <div class="item-header">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${item.price} gold</div>
            </div>
            <div class="item-description">${item.description}</div>
            ${item.maxPurchases ? `<div class="item-limit">Purchased: ${purchasedCount}/${item.maxPurchases}</div>` : ''}
            <button class="buy-button" data-item-id="${item.id}" 
                ${!canAfford || reachedMaxPurchases ? 'disabled' : ''}>
                ${!canAfford ? 'Not enough gold' : (reachedMaxPurchases ? 'Limit reached' : 'Buy')}
            </button>
        `;
        
        shopItemsList.appendChild(itemElement);
    });
    
    // Add event listeners to buy buttons
    const buyButtons = shopItemsList.querySelectorAll('.buy-button');
    buyButtons.forEach(button => {
        // Skip if button is disabled
        if (button.disabled) {
            return;
        }
        
        button.addEventListener('click', (e) => {
            const itemId = e.target.getAttribute('data-item-id');
            
            if (typeof window.buyShopItem === 'function') {
                const success = window.buyShopItem(itemId);
                
                if (success) {
                    // Refresh shop UI
                    setupShopUI();
                    
                    // Update displays
                    updateAllDisplays();
                }
            } else {
                console.error("buyShopItem function not available globally");
            }
        });
    });
}

/**
 * Function to show confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {Function} onConfirm - Function to call on confirm
 * @param {Function} onCancel - Function to call on cancel
 * @returns {HTMLElement} - The dialog element
 */
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

/**
 * End game function
 */
export function endGame() {
    console.log("endGame() - Game has ended");
    
    // Display end game message
    const message = `
        <h2>${CONFIG.uiText.endGameTitle}</h2>
        <p>You've reached age ${gameState.age} and it's time to retire.</p>
        <p>Your final stats:</p>
        <ul>
            <li>Total Gold Earned: ${Math.floor(gameState.statistics?.totalGoldEarned || 0)}</li>
            <li>Jobs Held: ${gameState.statistics?.jobsHeld || 0}</li>
            <li>Prestige Level: ${gameState.prestigeLevel || 0}</li>
        </ul>
        <p>Would you like to start a new life?</p>
        <button id="prestige-button" style="margin-right: 10px;">Prestige & Start New Life</button>
        <button id="new-life-button">${CONFIG.uiText.newLifeButton}</button>
    `;
    
    // Create modal for end game
    const endGameModal = document.createElement('div');
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
    
    // Create content container
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'rgba(30, 30, 45, 0.95)';
    modalContent.style.padding = '30px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.maxWidth = '500px';
    modalContent.style.width = '80%';
    modalContent.style.textAlign = 'center';
    modalContent.innerHTML = message;
    
    endGameModal.appendChild(modalContent);
    document.body.appendChild(endGameModal);
    
    // Pause the game
    gameState.gamePaused = true;
    
    // Add event listener to prestige button
    const prestigeButton = document.getElementById('prestige-button');
    if (prestigeButton) {
        prestigeButton.addEventListener('click', () => {
            endGameModal.remove();
            
            // Call prestige function if available
            if (typeof window.performPrestige === 'function') {
                window.performPrestige();
            } else {
                // Fallback to starting new life
                startNewLife();
            }
        });
    }
    
    // Add event listener to new life button
    const newLifeButton = document.getElementById('new-life-button');
    if (newLifeButton) {
        newLifeButton.addEventListener('click', () => {
            endGameModal.remove();
            startNewLife();
        });
    }
}

/**
 * Start a new life
 */
export function startNewLife() {
    console.log("startNewLife() - Starting a new life");
    
    // Remove end game modal if it exists
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
    updateAllDisplays();
    
    // Log event
    logEvent("Starting a new life!", 'system');
}

/**
 * Play sound effect
 * @param {string} soundName - Name of the sound to play
 */
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

/**
 * Show prestige animation
 */
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

// Expose essential functions globally
function exposeGlobalFunctions() {
    window.displayNotification = displayNotification;
    window.showNotification = showNotification;
    window.showErrorNotification = showErrorNotification;
    window.logEvent = logEvent;
    window.setupJobsUI = setupJobsUI;
    window.updateSkillDisplay = updateSkillDisplay;
    window.setupAchievementsUI = setupAchievementsUI;
    window.setupGameControls = setupGameControls;
    window.setupEventLog = setupEventLog;
    window.updateAllDisplays = updateAllDisplays;
    window.closeJobsPanel = closeJobsPanel;
    window.showConfirmDialog = showConfirmDialog;
    window.endGame = endGame;
    window.startNewLife = startNewLife;
    window.playSound = playSound;
    window.showPrestigeAnimation = showPrestigeAnimation;
}

// Call this at the end of initialize function
function initializeUI() {
    // Set up UI components
    setupNotificationSystem();
    setupEventLog();
    setupGameControls();
    setupPanels();
    
    // Initialize specialized UI modules
    if (typeof setupSkillUI === 'function') setupSkillUI();
    if (typeof setupJobUI === 'function') setupJobUI();
    if (typeof setupCareerUI === 'function') setupCareerUI();
    
    // Set up event listeners for action buttons
    setupActionButtons();
    
    // Make functions available globally
    exposeGlobalFunctions();
    
    // Initial UI update
    updateAllDisplays();
    
    console.log("UI system initialized successfully");
    return true;
}

// Export core functionality
export {
    initializeUI,
    displayNotification,
    showNotification,
    showErrorNotification,
    logEvent,
    setupJobsUI,
    updateSkillDisplay,
    setupAchievementsUI,
    setupGameControls,
    setupEventLog,
    updateAllDisplays,
    closeJobsPanel,
    showConfirmDialog,
    endGame,
    startNewLife,
    playSound
};