// integration-script.js
// This script fixes module loading issues and integrates career progression enhancements

console.log("integration-script.js - Starting integration and fixes");

// =========================================================================
// 1. Fix for missing UI functions
// =========================================================================

// First, check if basic UI functions are available
function checkUIFunctions() {
    const missingFunctions = [];
    
    const requiredFunctions = [
        'displayNotification',
        'showNotification',
        'logEvent',
        'setupJobsUI',
        'updateSkillDisplay',
        'setupAchievementsUI',
        'setupGameControls',
        'setupEventLog',
        'updateDisplay',
        'gameLoop',
        'startGameLoop'
    ];
    
    requiredFunctions.forEach(funcName => {
        if (typeof window[funcName] !== 'function') {
            missingFunctions.push(funcName);
        }
    });
    
    return {
        allAvailable: missingFunctions.length === 0,
        missing: missingFunctions
    };
}

// In case the UI functions are missing, define minimal versions
function defineMinimalUIFunctions() {
    // Basic notification function
    if (typeof window.displayNotification !== 'function') {
        window.displayNotification = function(message, type = 'info', duration = 3000) {
            console.log(`Notification: ${message} (${type})`);
            
            // Create notification element
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.padding = '12px 20px';
            notification.style.borderRadius = '8px';
            notification.style.color = 'white';
            notification.style.zIndex = '9999';
            notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            notification.style.transition = 'all 0.3s ease';
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(50px)';
            
            // Set background color based on type
            if (type === 'error') {
                notification.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
            } else if (type === 'success') {
                notification.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
            } else {
                notification.style.backgroundColor = 'rgba(123, 104, 238, 0.9)';
            }
            
            notification.textContent = message;
            
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
            
            return notification;
        };
    }
    
    // Wrapper for displayNotification with title
    if (typeof window.showNotification !== 'function') {
        window.showNotification = function(title, message, type = 'info') {
            return window.displayNotification(`${title}: ${message}`, type);
        };
    }
    
    // Error notification
    if (typeof window.showErrorNotification !== 'function') {
        window.showErrorNotification = function(message) {
            console.error(`Error: ${message}`);
            return window.displayNotification(message, 'error');
        };
    }
    
    // Event logging
    if (typeof window.logEvent !== 'function') {
        window.logEvent = function(message, category = 'general') {
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
        };
    }
    
    // Basic setup for event log
    if (typeof window.setupEventLog !== 'function') {
        window.setupEventLog = function() {
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
        };
    }
    
    // Update event log display
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
    
    // Make the event log update function available
    window.updateEventLogDisplay = updateEventLogDisplay;
    
    // Basic display update function
    if (typeof window.updateDisplay !== 'function') {
        window.updateDisplay = function() {
            console.log("Updating game display...");
            
            // Update top bar indicators
            updateTopBarDisplay();
            
            // Update job display
            updateJobDisplay();
            
            // Update event log
            updateEventLogDisplay();
        };
    }
    
    // Update top bar display
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
    const day = gameState.day || 1;
    const season = gameState.currentSeason || 'Spring';
    const year = gameState.year || 1;
    seasonDisplay.textContent = `Day ${day}, ${season}, Year ${year}`;
}
    }
    
    // Update job display
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
    
    // Make these functions available
    window.updateTopBarDisplay = updateTopBarDisplay;
    window.updateJobDisplay = updateJobDisplay;
    
    // Game loop function (simplified version if not available)
    if (typeof window.gameLoop !== 'function') {
        window.gameLoop = function(timestamp) {
            console.log("gameLoop tick"); // Keep this for debugging

            if (gameState.gamePaused) {
                requestAnimationFrame(gameLoop);
                return;
            }

            // Initialize lastTimestamp if it's the first call
            if (!window.lastTimestamp) {
                window.lastTimestamp = timestamp;
            }

            const effectiveTickRate = 1000 / (CONFIG.settings.tickInterval * gameState.gameSpeed);
            const deltaTime = timestamp - window.lastTimestamp;

            console.log("deltaTime:", deltaTime, "effectiveTickRate:", effectiveTickRate); // Log these values

            if (deltaTime >= effectiveTickRate) {
                window.lastTimestamp = timestamp;  // Update lastTimestamp ONLY when a tick occurs

                // Simulate game tick
                gameState.gold += 1; // Simple gold increment per tick
                
                // Update display
                if (typeof window.updateDisplay === 'function') {
                    window.updateDisplay();
                }
            }

            requestAnimationFrame(gameLoop);
        };
    }
    
    // Start game loop function (simplified version if not available)
    if (typeof window.startGameLoop !== 'function') {
        window.startGameLoop = function() {
            console.log("startGameLoop() - Starting game loop with requestAnimationFrame");
            window.lastTimestamp = 0; // Reset lastTimestamp
            requestAnimationFrame(window.gameLoop);
        };
    }
    
    // Basic game controls setup
    if (typeof window.setupGameControls !== 'function') {
        window.setupGameControls = function() {
            console.log("Setting up game controls...");
            
            // Pause button
            const pauseButton = document.getElementById('pause-button');
            if (pauseButton) {
                pauseButton.addEventListener('click', function() {
                    gameState.gamePaused = !gameState.gamePaused;
                    this.textContent = gameState.gamePaused ? '▶ Resume' : '|| Pause';
                    if (typeof window.logEvent === 'function') {
                        window.logEvent(gameState.gamePaused ? "Game paused" : "Game resumed", 'system');
                    }
                });
            }
            
            // Speed button
            const speedButton = document.getElementById('speed-button');
            if (speedButton) {
                speedButton.addEventListener('click', function() {
                    // Get available speed multipliers from config
                    const speedMultipliers = CONFIG.settings.speedMultipliers || [1, 2, 4];
                    
                    // Find current speed index
                    let currentIndex = speedMultipliers.indexOf(gameState.gameSpeed);
                    
                    // Go to next speed (or back to first if at end)
                    currentIndex = (currentIndex + 1) % speedMultipliers.length;
                    gameState.gameSpeed = speedMultipliers[currentIndex];
                    
                    // Update button text
                    this.textContent = `▶ ${gameState.gameSpeed}x Speed`;
                    
                    if (typeof window.logEvent === 'function') {
                        window.logEvent(`Game speed set to ${gameState.gameSpeed}x`, 'system');
                    }
                });
            }
            
            // Set up panel close buttons
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
            
            // Set up action buttons
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
                    
                    // Update job listings if function exists
                    if (typeof window.setupJobsUI === 'function') {
                        window.setupJobsUI();
                    }
                    
                    // Show the panel
                    jobsPanel.style.display = 'block';
                });
            }
        };
    }
    
    // Basic jobs UI setup
    if (typeof window.setupJobsUI !== 'function') {
        window.setupJobsUI = function() {
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
                    <div>${job.title} ${job.tier > 0 ? `(Tier ${job.tier})` : ''}</div>
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
                            jobsPanel.style.display = 'none';
                            window.updateDisplay();
                        }
                    } else {
                        console.error("applyForJob function not available globally");
                    }
                });
            });
        };
    }
    
    // Simple skills UI setup
    if (typeof window.updateSkillDisplay !== 'function') {
        window.updateSkillDisplay = function() {
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
        };
    }
    
    // Simple achievements UI setup
    if (typeof window.setupAchievementsUI !== 'function') {
        window.setupAchievementsUI = function() {
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
                
                // Check if achievement is unlocked
                const isUnlocked = achievement.unlocked || false;
                
                // Simple achievement HTML
                achievementItem.innerHTML = `
                    <div>${achievement.name} - ${isUnlocked ? 'Unlocked' : 'Locked'}</div>
                    <div>${achievement.description}</div>
                `;
                
                achievementsList.appendChild(achievementItem);
            });
        };
    }
}

// =========================================================================
// 2. Import and initialize career progression
// =========================================================================

function loadCareerProgressionScript() {
    return new Promise((resolve, reject) => {
        // Check if the script is already loaded
        if (document.getElementById('career-progression-script')) {
            resolve();
            return;
        }
        
        // Create script element
        const script = document.createElement('script');
        script.id = 'career-progression-script';
        script.type = 'module';
        script.src = 'career-progression.js';
        
        // Set up event listeners
        script.onload = () => {
            console.log("Career progression script loaded successfully");
            resolve();
        };
        
        script.onerror = () => {
            console.error("Failed to load career progression script");
            reject(new Error("Failed to load career progression script"));
        };
        
        // Add to document
        document.head.appendChild(script);
    });
}

// =========================================================================
// 3. Main initialization
// =========================================================================

async function initializeSystem() {
    console.log("Initializing integration system");
    
    // 1. Check for required UI functions
    const uiCheck = checkUIFunctions();
    
    if (!uiCheck.allAvailable) {
        console.warn("Missing UI functions:", uiCheck.missing);
        console.log("Defining minimal UI functions as replacements");
        defineMinimalUIFunctions();
    }
    
    // 2. Load career progression script
    try {
        await loadCareerProgressionScript();
    } catch (error) {
        console.error("Error loading career progression:", error);
    }
    
    // 3. Initialize career progression if available
    if (typeof window.initializeCareerProgression === 'function') {
        setTimeout(() => {
            window.initializeCareerProgression();
        }, 1000);
    }
    
    // 4. Start game loop if not already running
    if (typeof window.startGameLoop === 'function' && !window.gameLoopStarted) {
        window.gameLoopStarted = true;
        window.startGameLoop();
    }
    
    console.log("Integration system initialized successfully");
}

// =========================================================================
// 4. Execute initialization on DOMContentLoaded or immediately if already loaded
// =========================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSystem);
} else {
    // DOMContentLoaded has already fired
    initializeSystem();
}

// Log completion
console.log("integration-script.js - Integration script loaded");
// Add this to integration-script.js or execute it after DOM is loaded

// Initialize the day-season display with the correct format
document.addEventListener('DOMContentLoaded', () => {
    const seasonDisplay = document.getElementById('season-display');
    if (seasonDisplay) {
        // Set the initial format
        seasonDisplay.textContent = `Day ${gameState.day || 1}, ${gameState.currentSeason || 'Spring'}, Year ${gameState.year || 1}`;
    }
    
    // Also update any display functions that might modify this element
    // Patch the updateTimeDisplay function if it exists
    if (typeof window.updateTimeDisplay === 'function') {
        const originalUpdateTimeDisplay = window.updateTimeDisplay;
        
        window.updateTimeDisplay = function() {
            // Call original function first
            if (originalUpdateTimeDisplay) {
                originalUpdateTimeDisplay();
            }
            
            // Then ensure our format is applied
            const seasonDisplay = document.getElementById('season-display');
            if (seasonDisplay) {
                const day = gameState.day || 1;
                const season = gameState.currentSeason || 'Spring';
                const year = gameState.year || 1;
                
                seasonDisplay.textContent = `Day ${day}, ${season}, Year ${year}`;
            }
        };
    }
});