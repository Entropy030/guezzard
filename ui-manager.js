/**
 * UI Manager - Handles all direct DOM manipulation and UI updates
 * Separates UI logic from game logic for better maintainability
 * Part 1: Core UI functionality and status updates
 */

import { GameEvents } from './game-state.js';
import GameData from './game-data.js';

// Cache DOM elements for performance
export const DOMCache = {
    elements: {},
    
    /**
     * Get a DOM element by ID, caching it for future use
     * @param {string} id - Element ID
     * @returns {HTMLElement} - The DOM element
     */
    get(id) {
        if (!this.elements[id]) {
            this.elements[id] = document.getElementById(id);
        }
        return this.elements[id];
    },
    
    /**
     * Clear the cache, useful when DOM is rebuilt
     */
    clear() {
        this.elements = {};
    }
};

const UIManager = {
    // Current tab being displayed
    currentTab: 'career',
    
    // Flag to prevent multiple UI updates at once
    updatePending: false,
    
    /**
     * Initialize UI elements and event listeners
     */
    initialize() {
        // Setup UI event listeners
        this.setupEventListeners();
        
        // Make panels collapsible
        this.setupCollapsiblePanels();
        
        // Show loading screen
        this.showLoadingScreen();
        
        // Subscribe to game events
        this.subscribeToEvents();
        
        console.log('UI Manager initialized');
    },
    
    /**
     * Setup all UI event listeners
     */
    setupEventListeners() {
        // Tab navigation - desktop
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Tab navigation - mobile fixed navigation
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });
        
        // Pause/resume button
        const pauseButton = DOMCache.get('toggle-pause');
        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                GameEvents.publish('togglePause');
            });
        }
        
        // Time allocation buttons
        this.setupTimeButtons();
        
        // Reincarnation button
        const reincarnateButton = DOMCache.get('reincarnate-button');
        if (reincarnateButton) {
            reincarnateButton.addEventListener('click', () => {
                GameEvents.publish('reincarnate');
            });
        }
    },
    
    /**
     * Setup time adjustment buttons and sliders
     */
    setupTimeButtons() {
        // Work time buttons
        DOMCache.get('work-decrease')?.addEventListener('click', () => {
            GameEvents.publish('adjustWorkHours', { amount: -0.5 });
        });
        
        DOMCache.get('work-increase')?.addEventListener('click', () => {
            GameEvents.publish('adjustWorkHours', { amount: 0.5 });
        });
        
        // Training time buttons
        DOMCache.get('training-decrease')?.addEventListener('click', () => {
            GameEvents.publish('adjustTrainingHours', { amount: -0.5 });
        });
        
        DOMCache.get('training-increase')?.addEventListener('click', () => {
            GameEvents.publish('adjustTrainingHours', { amount: 0.5 });
        });
        
        // Setup sliders
        this.setupTimeSliders();
    },
    
    /**
     * Make sliders draggable for time allocation
     */
    setupTimeSliders() {
        this.createSlider('work-slider', 'work-handle', (percent) => {
            GameEvents.publish('setWorkHoursByPercent', { percent });
        });
        
        this.createSlider('training-slider', 'training-handle', (percent) => {
            GameEvents.publish('setTrainingHoursByPercent', { percent });
        });
    },
    
    /**
     * Create a draggable slider
     * @param {string} sliderId - ID of the slider element
     * @param {string} handleId - ID of the slider handle element
     * @param {Function} onUpdate - Callback when slider position changes
     */
    createSlider(sliderId, handleId, onUpdate) {
        const slider = DOMCache.get(sliderId);
        const handle = DOMCache.get(handleId);
        
        if (!slider || !handle) return;
        
        let isDragging = false;
        
        // Mouse events
        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.updateSliderPosition(e, slider, handle, onUpdate);
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                this.updateSliderPosition(e, slider, handle, onUpdate);
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Touch events for mobile
        handle.addEventListener('touchstart', (e) => {
            isDragging = true;
            this.updateSliderPosition(e.touches[0], slider, handle, onUpdate);
            e.preventDefault();
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                this.updateSliderPosition(e.touches[0], slider, handle, onUpdate);
                e.preventDefault();
            }
        });
        
        document.addEventListener('touchend', () => {
            isDragging = false;
        });
        
        // Allow clicking on the slider itself
        slider.addEventListener('click', (e) => {
            this.updateSliderPosition(e, slider, handle, onUpdate);
        });
    },
    
    /**
     * Update a slider position based on mouse/touch event
     * @param {Event} event - Mouse or touch event
     * @param {HTMLElement} slider - Slider element
     * @param {HTMLElement} handle - Handle element
     * @param {Function} onUpdate - Callback with percentage
     */
    updateSliderPosition(event, slider, handle, onUpdate) {
        const rect = slider.getBoundingClientRect();
        let x = event.clientX - rect.left;
        
        // Constrain to slider width
        x = Math.max(0, Math.min(x, rect.width));
        
        // Calculate percentage
        const percent = (x / rect.width) * 100;
        
        // Update handle position
        handle.style.left = `${percent}%`;
        
        // Call the callback with the percentage
        if (onUpdate) onUpdate(percent);
    },
    
    /**
     * Make panels collapsible
     */
    setupCollapsiblePanels() {
        document.querySelectorAll('.panel-title').forEach(title => {
            const panel = title.closest('.panel');
            const content = panel.querySelector('.panel-content');
            
            if (content) {
                title.addEventListener('click', () => {
                    content.classList.toggle('collapsed');
                    title.classList.toggle('collapsed');
                });
            }
        });
    },
    
    /**
     * Subscribe to game events
     */
    subscribeToEvents() {
        // Game state updates
        GameEvents.subscribe('gameStateUpdated', (data) => this.throttledUpdateUI(data.gameState));
        
        // Status-specific updates
        GameEvents.subscribe('timeAllocationChanged', (data) => this.updateTimeAllocation(data.gameState));
        GameEvents.subscribe('jobChanged', (data) => this.updateJobDisplay(data));
        GameEvents.subscribe('skillLevelUp', (data) => this.showSkillLevelUp(data));
        GameEvents.subscribe('jobLevelUp', (data) => this.showJobLevelUp(data));
        
        // Economy updates
        GameEvents.subscribe('economyUpdated', (data) => this.updateEconomyDisplay(data));
        
        // Game state changes
        GameEvents.subscribe('gamePaused', () => this.updatePauseButton(true));
        GameEvents.subscribe('gameResumed', () => this.updatePauseButton(false));
        GameEvents.subscribe('playerDied', (data) => this.showDeathScreen(data));
        GameEvents.subscribe('gameLoaded', () => this.hideLoadingScreen());
    },
    

    updateEconomyDisplay(data) {
        if (!data) return;
        
        const income = data.income || 0;
        const expenses = data.expenses || 0;
        const balance = data.balance || 0;
        
        this.updateTextContent('income-display', `${income.toFixed(1)} kudos/day`);
        this.updateTextContent('expenses-display', `${expenses.toFixed(1)} kudos/day`);
        this.updateTextContent('kudos-display', Math.floor(balance));
    },
    /**
     * Switch active tab
     * @param {string} tabId - ID of tab to switch to
     */
    switchTab(tabId) {
        // Update tab buttons - desktop
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
        
        // Update tab buttons - mobile
        document.querySelectorAll('.nav-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabId);
        });
        
        // Hide all tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.add('hidden');
        });
        
        // Show selected tab pane
        const tabPane = document.getElementById(`${tabId}-tab`);
        if (tabPane) {
            tabPane.classList.remove('hidden');
        }
        
        // Save current tab
        this.currentTab = tabId;
        
        // Publish tab switch event
        GameEvents.publish('tabChanged', { tab: tabId });
    },
    
    /**
     * Throttle UI updates to prevent performance issues
     * @param {Object} gameState - Current game state
     */
    throttledUpdateUI(gameState) {
        if (this.updatePending) return;
        
        // Store reference to current game state
        this.gameState = gameState;

        
        this.updatePending = true;
        requestAnimationFrame(() => {
            this.updateUI(gameState);
            this.updatePending = false;
        });
    },
    
    /**
     * Update all UI elements
     * @param {Object} gameState - Current game state
     */
    updateUI(gameState) {
        if (!gameState) return;
        
        // Update based on current tab
        switch (this.currentTab) {
            case 'career':
                // Import and call CareerUI.updateCareerPanel
                import('./ui-panels.js').then(module => {
                    module.CareerUI.updateCareerPanel(gameState);
                });
                break;
            case 'skills':
                // Import and call SkillsUI.updateSkillsPanel
                import('./ui-panels.js').then(module => {
                    module.SkillsUI.updateSkillsPanel(gameState);
                });
                break;
            case 'lifestyle':
                // Import and call LifestyleUI.updateLifestylePanel
                import('./ui-panels.js').then(module => {
                    module.LifestyleUI.updateLifestylePanel(gameState);
                });
                break;
            case 'achievements':
                // Import and call AchievementsUI.updateAchievementsPanel
                import('./ui-panels.js').then(module => {
                    module.AchievementsUI.updateAchievementsPanel(gameState);
                });
                break;
        }
        
        // Always update these elements
        this.updateStatusPanel(gameState);
        this.updateTimeAllocation(gameState);
    },
    
    /**
     * Update the status panel
     * @param {Object} gameState - Current game state
     */
    updateStatusPanel(gameState) {
        if (!gameState) return;
        
        // Update basic info
        this.updateTextContent('date-display', `Day ${gameState.day}, Year ${gameState.year - 2024}`);
        this.updateTextContent('age-display', gameState.age);
        this.updateTextContent('kudos-display', Math.floor(gameState.kudos));
        
        // Update job info
        this.updateTextContent('job-display', this.getJobTitle(gameState));
        this.updateTextContent('job-level-display', gameState.jobLevel);
        
        // Update job progress bar
        const expForNextLevel = 100 * Math.pow(1.1, gameState.jobLevel);
        this.updateProgressBar('job-progress', gameState.jobExperience, expForNextLevel);
        this.updateTextContent('job-progress-text', 
            `${Math.floor(gameState.jobExperience)}/${Math.floor(expForNextLevel)} XP`);
        
        // Update income and expenses
        const dailyIncome = this.calculateDailyIncome(gameState);
        const dailyExpenses = this.calculateDailyExpenses(gameState);
        
        this.updateTextContent('income-display', `${dailyIncome.toFixed(1)} kudos/day`);
        this.updateTextContent('expenses-display', `${dailyExpenses.toFixed(1)} kudos/day`);
        
        // Update mortality display
        const mortalityRate = this.calculateMortalityRate(gameState);
        this.updateTextContent('mortality-display', `${(mortalityRate * 100).toFixed(2)}%`);
    },
    
    /**
     * Update text content of an element if it has changed
     * @param {string} id - Element ID
     * @param {string|number} value - New text content
     */
    updateTextContent(id, value) {
        const element = DOMCache.get(id);
        if (element && element.textContent !== String(value)) {
            element.textContent = value;
        }
    },
    
    /**
     * Update a progress bar element
     * @param {string} id - Progress bar element ID
     * @param {number} current - Current value
     * @param {number} max - Maximum value
     */
    updateProgressBar(id, current, max) {
        const progressBar = DOMCache.get(id);
        if (progressBar) {
            const percent = Math.min(100, (current / max) * 100);
            progressBar.style.width = `${percent}%`;
        }
    },
    
    /**
     * Show a notification popup
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     */
    showNotification(title, message) {
        // Create or get notification element
        let notification = document.getElementById('notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            
            const notificationTitle = document.createElement('div');
            notificationTitle.className = 'notification-title';
            notification.appendChild(notificationTitle);
            
            const notificationMessage = document.createElement('div');
            notificationMessage.className = 'notification-message';
            notification.appendChild(notificationMessage);
            
            document.body.appendChild(notification);
        }
        
        // Update content
        notification.querySelector('.notification-title').textContent = title;
        notification.querySelector('.notification-message').textContent = message;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after delay
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    },
    
    /**
     * Show skill level up notification
     * @param {Object} data - Skill level up data
     */
    showSkillLevelUp(data) {
        this.showNotification(
            "Skill Level Up!", 
            `${data.skillName} is now level ${data.newLevel}!`
        );
    },
    
    /**
     * Show job level up notification
     * @param {Object} data - Job level up data
     */
    showJobLevelUp(data) {
        this.showNotification(
            "Job Level Up!", 
            `You are now a level ${data.newLevel} ${data.jobTitle}!`
        );
    },
    
    /**
     * Update the pause button based on game state
     * @param {boolean} isPaused - Whether the game is paused
     */
    updatePauseButton(isPaused) {
        const pauseButton = DOMCache.get('toggle-pause');
        if (pauseButton) {
            const icon = pauseButton.querySelector('i');
            if (icon) {
                if (isPaused) {
                    icon.className = 'fas fa-play';
                } else {
                    icon.className = 'fas fa-pause';
                }
            }
        }
    },
    
    /**
     * Show the death screen with final stats
     * @param {Object} data - Death data including age and stats
     */
    showDeathScreen(data) {
        const deathScreen = DOMCache.get('death-screen');
        if (!deathScreen) return;
        
        // Update death stats
        this.updateTextContent('death-age', data.age);
        this.updateTextContent('death-job-level', data.maxJobLevel);
        this.updateTextContent('death-skill-level', data.maxSkillLevel);
        this.updateTextContent('death-mortality-rate', `${(data.mortalityRate * 100).toFixed(2)}%`);
        this.updateTextContent('death-kudos-earned', Math.floor(data.kudosEarned));
        
        // Show the screen
        deathScreen.style.display = 'flex';
    },
    
    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = DOMCache.get('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    },
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = DOMCache.get('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    },
    
    /**
     * Update time allocation display
     * @param {Object} gameState - Current game state or time data object
     */
    updateTimeAllocation(gameState) {
        if (!gameState) return;
        
        // Calculate allocatable hours
        const timeInfo = this.calculateAllocatableHours(gameState);
        
        // Update fixed time displays
        this.updateTextContent('fixed-time-display', `${timeInfo.fixedTimeTotal.toFixed(1)} hours/day`);
        this.updateTextContent('sleep-time-display', `${timeInfo.adjustedSleepHours.toFixed(1)} hours`);
        this.updateTextContent('commute-time-display', `${timeInfo.adjustedCommuteHours.toFixed(1)} hours`);
        this.updateTextContent('meal-time-display', `${timeInfo.adjustedMealHours.toFixed(1)} hours`);
        
        // Update allocatable time
        this.updateTextContent('allocatable-time-display', `${timeInfo.allocatableHours.toFixed(1)} hours/day`);
        
        // Update work and training time displays
        this.updateTextContent('work-time-display', `${gameState.workHours.toFixed(1)} hours`);
        this.updateTextContent('training-time-display', `${gameState.trainingHours.toFixed(1)} hours`);
        
        // Update slider positions
        this.updateTimeSliders(gameState, timeInfo.allocatableHours);
        
        // Enable/disable buttons based on current values
        this.updateTimeButtons(gameState, timeInfo.allocatableHours);
    },
    
    /**
     * Update time slider positions
     * @param {Object} gameState - Current game state
     * @param {number} allocatableHours - Total allocatable hours
     */
    updateTimeSliders(gameState, allocatableHours) {
        // Work slider
        const workHandle = DOMCache.get('work-handle');
        if (workHandle) {
            const workPercentage = allocatableHours > 0 ? 
                Math.min(100, (gameState.workHours / allocatableHours) * 100) : 0;
            workHandle.style.left = `${workPercentage}%`;
        }
        
        // Training slider
        const trainingHandle = DOMCache.get('training-handle');
        if (trainingHandle) {
            const trainingPercentage = allocatableHours > 0 ? 
                Math.min(100, (gameState.trainingHours / allocatableHours) * 100) : 0;
            trainingHandle.style.left = `${trainingPercentage}%`;
        }
    },
    
    /**
     * Update time buttons enabled/disabled state
     * @param {Object} gameState - Current game state
     * @param {number} allocatableHours - Total allocatable hours
     */
    updateTimeButtons(gameState, allocatableHours) {
        const workDecrease = DOMCache.get('work-decrease');
        const workIncrease = DOMCache.get('work-increase');
        const trainingDecrease = DOMCache.get('training-decrease');
        const trainingIncrease = DOMCache.get('training-increase');
        
        if (workDecrease) workDecrease.disabled = gameState.workHours <= 0;
        if (workIncrease) workIncrease.disabled = gameState.workHours + gameState.trainingHours >= allocatableHours;
        if (trainingDecrease) trainingDecrease.disabled = gameState.trainingHours <= 0;
        if (trainingIncrease) trainingIncrease.disabled = gameState.workHours + gameState.trainingHours >= allocatableHours;
    },
    
    /**
     * Calculate allocatable hours per day
     * @param {Object} gameState - Current game state
     * @returns {Object} - Time allocation details
     */
    calculateAllocatableHours(gameState) {
        try {
            // Get lifestyle options
            const housingOption = GameData.lifestyle.housing[gameState.housingType] || { sleepTimeReduction: 0 };
            const transportOption = GameData.lifestyle.transport[gameState.transportType] || { commuteTimeReduction: 0 };
            const foodOption = GameData.lifestyle.food[gameState.foodType] || { mealTimeReduction: 0 };
            
            // Apply lifestyle modifiers
            const adjustedSleepHours = gameState.sleepHours * (1 - housingOption.sleepTimeReduction);
            const adjustedCommuteHours = gameState.commuteHours * (1 - transportOption.commuteTimeReduction);
            const adjustedMealHours = gameState.mealHours * (1 - foodOption.mealTimeReduction);
            
            // Calculate allocatable hours
            const fixedTimeTotal = adjustedSleepHours + adjustedCommuteHours + adjustedMealHours;
            const allocatableHours = 24 - fixedTimeTotal;
            
            return {
                allocatableHours,
                adjustedSleepHours,
                adjustedCommuteHours,
                adjustedMealHours,
                fixedTimeTotal
            };
        } catch (error) {
            console.error("Error calculating allocatable hours:", error);
            // Return fallback values to prevent crashes
            return {
                allocatableHours: 6,
                adjustedSleepHours: 10,
                adjustedCommuteHours: 4,
                adjustedMealHours: 4,
                fixedTimeTotal: 18
            };
        }
    },
    
    /**
     * Calculate daily income based on job
     * @param {Object} gameState - Current game state
     * @returns {number} - Daily income
     */
    calculateDailyIncome(gameState) {
        try {
            const trackInfo = GameData.careers[gameState.currentCareerTrack];
            const jobTier = trackInfo.tiers.find(tier => tier.id === gameState.currentJob);
            
            if (!jobTier) return 0;
            
            const baseRate = jobTier.baseSalary;
            const levelMultiplier = 1 + (gameState.jobLevel / 100);
            const hourlyRate = baseRate * levelMultiplier;
            
            return hourlyRate * gameState.workHours;
        } catch (error) {
            console.error("Error calculating daily income:", error);
            return 0;
        }
    },
    
    /**
     * Calculate daily expenses based on lifestyle
     * @param {Object} gameState - Current game state
     * @returns {number} - Daily expenses
     */
    calculateDailyExpenses(gameState) {
        try {
            const housingCost = GameData.lifestyle.housing[gameState.housingType]?.cost || 0;
            const transportCost = GameData.lifestyle.transport[gameState.transportType]?.cost || 0;
            const foodCost = GameData.lifestyle.food[gameState.foodType]?.cost || 0;
            
            return housingCost + transportCost + foodCost;
        } catch (error) {
            console.error("Error calculating daily expenses:", error);
            return 0;
        }
    },
    
    /**
     * Calculate mortality rate based on age and lifestyle
     * @param {Object} gameState - Current game state
     * @returns {number} - Daily mortality rate (0-1)
     */
    calculateMortalityRate(gameState) {
        // Only start mortality checks after age 30
        if (gameState.age < 30) return 0;
        
        // Base parameters for mortality curve
        const BASE_MORTALITY = 1.0; // Max mortality rate (100%)
        const BASE_K_VALUE = 0.1;   // Steepness of the curve
        const MIDPOINT_AGE = 75;    // Age at which mortality rate is 50%
        
        try {
            // Get lifestyle modifiers
            const housingOption = GameData.lifestyle.housing[gameState.housingType] || { mortalityReduction: 0 };
            const foodOption = GameData.lifestyle.food[gameState.foodType] || { mortalityReduction: 0 };
            
            // Calculate adjusted k-value with lifestyle modifiers
            const adjustedK = BASE_K_VALUE * (1 - (housingOption.mortalityReduction + foodOption.mortalityReduction));
            
            // Calculate current mortality rate using sigmoid function
            const mortalityRate = BASE_MORTALITY * (1 / (1 + Math.exp(-adjustedK * (gameState.age - MIDPOINT_AGE))));
            
            // Convert to daily probability
            return mortalityRate / 365;
        } catch (error) {
            console.error("Error calculating mortality rate:", error);
            return 0;
        }
    },
    
    /**
     * Get the title of the current job
     * @param {Object} gameState - Current game state
     * @returns {string} - Job title
     */
    getJobTitle(gameState) {
        try {
            const trackInfo = GameData.careers[gameState.currentCareerTrack];
            if (!trackInfo) return "Unemployed";
            
            const jobTier = trackInfo.tiers.find(tier => tier.id === gameState.currentJob);
            if (!jobTier) return "Unemployed";
            
            return jobTier.name;
        } catch (error) {
            console.error("Error getting job title:", error);
            return "Unemployed";
        }
    },
    
    /** 
    * Update job display after job change
    * @param {Object} data - Job change data
    */
    updateJobDisplay(data) {
    if (!data) return;
    
    try {
        // Update job display elements
        this.updateTextContent('job-display', data.jobName || "Unemployed");
        this.updateTextContent('job-level-display', 1); // Reset level to 1 for new job
        
        // Reset job progress bar
        this.updateProgressBar('job-progress', 0, 100);
        this.updateTextContent('job-progress-text', '0/100 XP');
        
        // Show notification
        this.showNotification("New Job!", `You are now a ${data.jobName}.`);
        
        // Refresh career panel
        import('./ui-panels.js').then(module => {
            module.CareerUI.needsRefresh = true;
            module.CareerUI.updateCareerPanel(this.gameState);
        });
    } catch (error) {
        console.error("Error updating job display:", error);
    }
}


};

export default UIManager;
