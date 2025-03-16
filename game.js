// Debug helper - already at the top of game.js
window.onerror = function(message, source, lineno, colno, error) {
    console.log(`Error at line ${lineno}, column ${colno}:`);
    console.log(`Message: ${message}`);
    console.log('Stack trace:');
    console.log(error.stack);
    return false; // Let the default handler run as well
};

// Add debugging functions here
function debugGameData() {
  console.log('DEBUG: GameData available?', !!GameData);
  console.log('DEBUG: TYPES available?', !!TYPES);
  
  if (GameData) {
    console.log('DEBUG: Career tracks', Object.keys(GameData.careers || {}));
    console.log('DEBUG: Sample career track', GameData.careers[Object.keys(GameData.careers)[0]]);
    console.log('DEBUG: Lifestyle options', {
      housing: Object.keys(GameData.lifestyle?.housing || {}),
      transport: Object.keys(GameData.lifestyle?.transport || {}),
      food: Object.keys(GameData.lifestyle?.food || {})
    });
  }
}

function debugGameState() {
  console.log('DEBUG: GameState initialized?', !!gameState);
  
  if (gameState) {
    console.log('DEBUG: Current job', gameState.currentJob);
    console.log('DEBUG: Current career track', gameState.currentCareerTrack);
    console.log('DEBUG: Active game loop?', !!gameState.tickInterval);
    console.log('DEBUG: Game paused?', gameState.isPaused);
    console.log('DEBUG: Game over?', gameState.isGameOver);
  }
}
// ============== Game.js - Main Game Logic ==============
import GameState from './game-state.js';
import GameData, { TYPES } from './game-data.js';

// Global game state instance
let gameState = null;

// ============== Initialization ==============
/**
 * Initialize the game
 * Loads saved game or creates a new one
 */
function initializeGame() {
    try {
        // Try to load a saved game
        const savedGame = GameState.loadGame();
        
        if (savedGame) {
            gameState = savedGame;
            showNotification("Game Loaded", "Your saved game has been loaded.");
        } else {
            // Create a new game
            gameState = GameState.createNewState();
            gameState = GameState.initializeSkills(gameState);
        }

        // Debug game state
        debugGameState();
        
        // Ensure default lifestyle options are set if missing
        if (!gameState.housingType) {
            // Find the free housing option
            for (const id in GameData.lifestyle.housing) {
                if (GameData.lifestyle.housing[id].cost === 0) {
                    gameState.housingType = id;
                    break;
                }
            }
        }
        
        if (!gameState.transportType) {
            // Find the free transport option
            for (const id in GameData.lifestyle.transport) {
                if (GameData.lifestyle.transport[id].cost === 0) {
                    gameState.transportType = id;
                    break;
                }
            }
        }
        
        if (!gameState.foodType) {
            // Find the free food option
            for (const id in GameData.lifestyle.food) {
                if (GameData.lifestyle.food[id].cost === 0) {
                    gameState.foodType = id;
                    break;
                }
            }
        }
        


        // Set up event listeners
        setupEventListeners();

        debugGameData();
        console.log('DEBUG: DOM ready?', !!document.getElementById('career-tracks-container'));
        
        // Update UI with initial state
        updateUI();
        
        // Set up autosave
        setupAutosave();
        
        // Start the game
        if (!gameState.isPaused) {
            resumeGame();
        }
    } catch (error) {
        console.error("Error initializing game:", error);
        // Show error to user and create a fresh game state as fallback
        showNotification("Error", "Failed to initialize game. Starting a new game.");
        gameState = GameState.createNewState();
        gameState = GameState.initializeSkills(gameState);
        updateUI();
    }
}

/**
 * Set up event listeners for UI interactions
 */
function setupEventListeners() {
    // Pause/resume button
    document.getElementById('toggle-pause').addEventListener('click', togglePause);
    
    // Time allocation controls
    document.getElementById('work-decrease').addEventListener('click', () => adjustWorkHours(-1));
    document.getElementById('work-increase').addEventListener('click', () => adjustWorkHours(1));
    document.getElementById('training-decrease').addEventListener('click', () => adjustTrainingHours(-1));
    document.getElementById('training-increase').addEventListener('click', () => adjustTrainingHours(1));
    
    // Slider drag functionality
    setupSliders();
    
    // Tab navigation
    setupTabs();
    
    // Reincarnation button
    document.getElementById('reincarnate-button').addEventListener('click', reincarnate);
    
    // Add autosave toggle in settings (can be added later)
    
    // Setup save button if added to UI
    // document.getElementById('save-game').addEventListener('click', manualSave);
}

/**
 * Set up tab switching functionality
 */
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab panes
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.add('hidden');
            });
            
            // Show the selected tab pane
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        });
    });
}

/**
 * Set up slider drag functionality
 */
function setupSliders() {
    // Work slider
    const workSlider = document.getElementById('work-slider');
    const workHandle = document.getElementById('work-handle');
    
    makeSliderDraggable(workSlider, workHandle, (percent) => {
        const timeInfo = calculateAllocatableHours();
        const newHours = Math.round((percent / 100) * timeInfo.allocatableHours * 2) / 2; // Round to nearest 0.5
        gameState.workHours = Math.max(0, Math.min(newHours, timeInfo.allocatableHours - gameState.trainingHours));
        updateTimeAllocation();
    });
    
    // Training slider
    const trainingSlider = document.getElementById('training-slider');
    const trainingHandle = document.getElementById('training-handle');
    
    makeSliderDraggable(trainingSlider, trainingHandle, (percent) => {
        const timeInfo = calculateAllocatableHours();
        const newHours = Math.round((percent / 100) * timeInfo.allocatableHours * 2) / 2; // Round to nearest 0.5
        gameState.trainingHours = Math.max(0, Math.min(newHours, timeInfo.allocatableHours - gameState.workHours));
        updateTimeAllocation();
    });
}

/**
 * Make a slider element draggable
 */
function makeSliderDraggable(sliderElement, handleElement, callback) {
    let isDragging = false;
    
    // Start dragging on mousedown
    handleElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateSliderPosition(e);
        e.preventDefault(); // Prevent text selection
    });
    
    // Handle touch events for mobile
    handleElement.addEventListener('touchstart', (e) => {
        isDragging = true;
        updateSliderPosition(e.touches[0]);
        e.preventDefault(); // Prevent scrolling
    });
    
    // Track drag on mousemove
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateSliderPosition(e);
        }
    });
    
    // Track touch movement
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            updateSliderPosition(e.touches[0]);
            e.preventDefault(); // Prevent scrolling
        }
    });
    
    // End drag on mouseup
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // End drag on touch end
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // Helper to update slider position
    function updateSliderPosition(event) {
        const rect = sliderElement.getBoundingClientRect();
        let x = event.clientX - rect.left;
        
        // Constrain to slider width
        x = Math.max(0, Math.min(x, rect.width));
        
        // Calculate percentage
        const percent = (x / rect.width) * 100;
        
        // Update handle position
        handleElement.style.left = `${percent}%`;
        
        // Call the callback with the percentage
        callback(percent);
    }
}

/**
 * Set up autosave functionality
 */
function setupAutosave() {
    // Autosave every 5 minutes
    setInterval(() => {
        if (gameState.autosaveEnabled && !gameState.isGameOver) {
            const success = GameState.saveGame(gameState);
            if (success) {
                console.log("Game autosaved");
            }
        }
    }, 5 * 60 * 1000); // 5 minutes
}

/**
 * Manually save the game
 */
function manualSave() {
    if (gameState.isGameOver) {
        showNotification("Cannot Save", "Cannot save the game while dead. Reincarnate first.");
        return;
    }
    
    const success = GameState.saveGame(gameState);
    if (success) {
        showNotification("Game Saved", "Your game has been saved successfully.");
    } else {
        showNotification("Save Failed", "Failed to save the game. Check browser storage permissions.");
    }
}

// ============== UI Interaction Functions ==============


/**
 * Update career panel
 */
function updateCareerPanel() {
    try {
        console.log('DEBUG: Updating career panel');
        console.log('DEBUG: Career container exists?', !!document.getElementById('career-tracks-container'));
        console.log('DEBUG: Available careers', Object.keys(GameData.careers || {}));
        
        const careerContainer = document.getElementById('career-tracks-container');
        if (!careerContainer) {
            console.error('DEBUG: Career container not found in DOM');
            return;
        }
        
        careerContainer.innerHTML = '';
        
        // Add career tracks
        for (const trackId in GameData.careers) {
            const track = GameData.careers[trackId];
            console.log(`DEBUG: Processing career track ${trackId}`, track);
            
            // Create career track element
            const trackElement = document.createElement('div');
            trackElement.className = 'career-track';
            
            // Create track header
            const trackHeader = document.createElement('div');
            trackHeader.className = 'career-track-header';
            
            const trackTitle = document.createElement('div');
            trackTitle.className = 'career-track-title';
            trackTitle.textContent = track.name;
            
            const trackDescription = document.createElement('div');
            trackDescription.className = 'career-track-description';
            trackDescription.textContent = track.description;
            
            trackHeader.appendChild(trackTitle);
            trackElement.appendChild(trackHeader);
            trackElement.appendChild(trackDescription);
            
            // Add job tiers - but only show the current one and the next one
            const currentTrackIndex = track.tiers.findIndex(tier => tier.id === gameState.currentJob);
            console.log(`DEBUG: Current track index for ${trackId}:`, currentTrackIndex);
            
            // Default to showing first two tiers if not on this track
            let startIndex = 0;
            let endIndex = 1;
            
            if (trackId === gameState.currentCareerTrack) {
                // If on this track, show current and next tier
                startIndex = currentTrackIndex;
                endIndex = Math.min(currentTrackIndex + 1, track.tiers.length - 1);
            }
            
            for (let i = startIndex; i <= endIndex; i++) {
                if (!track.tiers[i]) {
                    console.warn(`DEBUG: No tier at index ${i} for track ${trackId}`);
                    continue;
                }
                
                const tier = track.tiers[i];
                console.log(`DEBUG: Adding job tier ${tier.id}`, tier);
                
                const tierElement = document.createElement('div');
                tierElement.className = 'job-tier';
                
                if (tier.id === gameState.currentJob) {
                    tierElement.classList.add('current-job');
                }
                
                // Only allow next tier if requirements are met
                const canApply = checkJobRequirements(tier);
                if (!canApply && tier.id !== gameState.currentJob) {
                    tierElement.classList.add('locked-job');
                }
                
                const jobDetails = document.createElement('div');
                jobDetails.className = 'job-details';
                
                const jobTitle = document.createElement('div');
                jobTitle.className = 'job-title';
                jobTitle.textContent = tier.name;
                
                const jobQuote = document.createElement('div');
                jobQuote.className = 'job-quote';
                jobQuote.textContent = tier.quote;
                
                const jobSalary = document.createElement('div');
                jobSalary.className = 'job-salary';
                jobSalary.textContent = `${tier.baseSalary} kudos/hr`;
                
                jobDetails.appendChild(jobTitle);
                jobDetails.appendChild(jobQuote);
                
                const applyButton = document.createElement('button');
                
                if (tier.id === gameState.currentJob) {
                    applyButton.textContent = 'Current Job';
                    applyButton.disabled = true;
                } else {
                    applyButton.textContent = canApply ? 'Apply' : 'Requirements Not Met';
                    applyButton.disabled = !canApply;
                    
                    if (canApply) {
                        applyButton.addEventListener('click', () => applyForJob(tier.id));
                    } else {
                        // Show requirements when hovering over locked job
                        const requirementsText = getJobRequirementsText(tier);
                        tierElement.setAttribute('title', requirementsText);
                        
                        // Display requirements below the job
                        const requirementsDisplay = document.createElement('div');
                        requirementsDisplay.className = 'job-requirements';
                        requirementsDisplay.innerHTML = requirementsText.replace(/\n/g, '<br>');
                        jobDetails.appendChild(requirementsDisplay);
                    }
                }
                
                tierElement.appendChild(jobDetails);
                tierElement.appendChild(jobSalary);
                tierElement.appendChild(applyButton);
                
                trackElement.appendChild(tierElement);
            }
            
            careerContainer.appendChild(trackElement);
        }
    } catch (error) {
        console.error("DEBUG: Error updating career panel:", error);
    }
}

/**
 * Adjust work hours by the specified amount
 */
function adjustWorkHours(amount) {
    const timeInfo = calculateAllocatableHours();
    const newHours = gameState.workHours + amount;
    
    // Ensure we don't go below 0 or exceed allocatable hours
    gameState.workHours = Math.max(0, Math.min(newHours, timeInfo.allocatableHours - gameState.trainingHours));
    
    updateTimeAllocation();
}

/**
 * Adjust training hours by the specified amount
 */
function adjustTrainingHours(amount) {
    const timeInfo = calculateAllocatableHours();
    const newHours = gameState.trainingHours + amount;
    
    // Ensure we don't go below 0 or exceed allocatable hours
    gameState.trainingHours = Math.max(0, Math.min(newHours, timeInfo.allocatableHours - gameState.workHours));
    
    updateTimeAllocation();
}

/**
 * Apply for a new job
 */
function applyForJob(jobId) {
    try {
        // Find which career track this job belongs to
        let careerTrackId = null;
        let jobTier = null;
        
        for (const trackId in GameData.careers) {
            const track = GameData.careers[trackId];
            const foundTier = track.tiers.find(tier => tier.id === jobId);
            
            if (foundTier) {
                careerTrackId = trackId;
                jobTier = foundTier;
                break;
            }
        }
        
        if (!careerTrackId || !jobTier) {
            showNotification("Error", "Job not found. Please try again.");
            return;
        }
        
        // Check requirements
        if (!checkJobRequirements(jobTier)) {
            showNotification("Cannot Apply", "You don't meet the requirements for this job.");
            return;
        }
        
        // Apply for the job
        gameState.currentCareerTrack = careerTrackId;
        gameState.currentJob = jobId;
        gameState.jobLevel = 1;
        gameState.jobExperience = 0;
        
        showNotification("New Job!", `You are now a ${jobTier.name}.`);
        
        // Update UI
        updateUI();
    } catch (error) {
        console.error("Error applying for job:", error);
        showNotification("Error", "Something went wrong while applying for job.");
    }
}

/**
 * Switch to a different skill for training
 */
function switchTrainingSkill(skillId, skillType) {
    gameState.currentTrainingSkill = skillId;
    
    // Get skill name based on type
    let skillName = "";
    if (skillType === 'general') {
        skillName = GameData.skills.general[skillId].name;
    } else if (skillType === 'professional') {
        skillName = GameData.skills.professional[skillId].name;
    }
    
    showNotification("Training Changed", `Now training ${skillName}.`);
    updateUI();
}

/**
 * Purchase a lifestyle upgrade
 */
function purchaseLifestyleUpgrade(category, typeId) {
    try {
        let option = null;
        let currentTypeId = null;
        
        // Get current and new option based on category
        switch (category) {
            case 'housing':
                option = GameData.lifestyle.housing[typeId];
                currentTypeId = gameState.housingType;
                break;
            case 'transport':
                option = GameData.lifestyle.transport[typeId];
                currentTypeId = gameState.transportType;
                break;
            case 'food':
                option = GameData.lifestyle.food[typeId];
                currentTypeId = gameState.foodType;
                break;
            default:
                throw new Error(`Unknown lifestyle category: ${category}`);
        }
        
        if (!option) {
            showNotification("Error", `Invalid ${category} option.`);
            return false;
        }
        
        // Check if already owned
        if (currentTypeId === typeId) {
            showNotification("Already Owned", `You already have this ${category} option.`);
            return false;
        }
        
        // Check if player has enough kudos
        if (gameState.kudos < option.cost) {
            showNotification("Cannot Afford", `You need ${option.cost} kudos to purchase this ${category}.`);
            return false;
        }
        
        // Check other requirements
        if (option.requirements) {
            // Check housing requirement
            if (option.requirements.housing) {
                const requiredHousing = Array.isArray(option.requirements.housing) 
                    ? option.requirements.housing 
                    : [option.requirements.housing];
                
                if (!requiredHousing.includes(gameState.housingType)) {
                    showNotification("Requirements Not Met", `You need appropriate housing to get this ${category}.`);
                    return false;
                }
            }
            
            // Check kudos requirement (additional to cost)
            if (option.requirements.kudos && gameState.kudos < option.requirements.kudos) {
                showNotification("Requirements Not Met", `You need at least ${option.requirements.kudos} kudos to unlock this ${category}.`);
                return false;
            }
            
            // Check career track completion
            if (option.requirements.carrierTrackComplete) {
                const requiredTracks = Array.isArray(option.requirements.carrierTrackComplete)
                    ? option.requirements.carrierTrackComplete
                    : [option.requirements.carrierTrackComplete];
                
                for (const trackId of requiredTracks) {
                    if (!gameState.completedCareerTracks.includes(trackId)) {
                        showNotification("Requirements Not Met", `You need to complete specific career tracks first.`);
                        return false;
                    }
                }
            }
        }
        
        // Purchase the upgrade
        gameState.kudos -= option.cost;
        
        // Apply the purchase based on category
        switch (category) {
            case 'housing':
                gameState.housingType = typeId;
                break;
            case 'transport':
                gameState.transportType = typeId;
                break;
            case 'food':
                gameState.foodType = typeId;
                break;
        }
        
        showNotification("Purchased", `You've upgraded your ${category}!`);
        updateUI();
        return true;
    } catch (error) {
        console.error(`Error purchasing ${category}:`, error);
        showNotification("Error", `Something went wrong while purchasing ${category}.`);
        return false;
    }
}

/**
 * Check if job requirements are met
 */
function checkJobRequirements(jobTier) {
    try {
        // If it's the current job, requirements are already met
        if (gameState.currentJob === jobTier.id) {
            return true;
        }
        
        // Check previous job requirement
        if (jobTier.requirements.previousJob && gameState.currentJob !== jobTier.requirements.previousJob) {
            return false;
        }
        
        // Check previous job level requirement
        if (jobTier.requirements.previousJobLevel && gameState.jobLevel < jobTier.requirements.previousJobLevel) {
            return false;
        }
        
        // Check general skills requirements
        if (jobTier.requirements.generalSkills) {
            for (const [skillId, requiredLevel] of Object.entries(jobTier.requirements.generalSkills)) {
                if (!gameState.generalSkills[skillId] || gameState.generalSkills[skillId].level < requiredLevel) {
                    return false;
                }
            }
        }
        
        // Check professional skills requirements
        if (jobTier.requirements.professionalSkills) {
            for (const [skillId, requiredLevel] of Object.entries(jobTier.requirements.professionalSkills)) {
                if (!gameState.professionalSkills[skillId] || gameState.professionalSkills[skillId].level < requiredLevel) {
                    return false;
                }
            }
        }
        
        return true;
    } catch (error) {
        console.error("Error checking job requirements:", error);
        return false;
    }
}

/**
 * Get job requirements text for displaying
 */
function getJobRequirementsText(jobTier) {
    let reqText = "Requirements:\n";
    
    // Previous job requirement
    if (jobTier.requirements.previousJob) {
        reqText += `- Previous Job: ${getJobName(jobTier.requirements.previousJob)} (Level ${jobTier.requirements.previousJobLevel})\n`;
    }
    
    // General skills requirements
    if (jobTier.requirements.generalSkills) {
        reqText += "- General Skills:\n";
        for (const [skillId, requiredLevel] of Object.entries(jobTier.requirements.generalSkills)) {
            const skillName = GameData.skills.general[skillId]?.name || skillId;
            reqText += `  • ${skillName}: Level ${requiredLevel}\n`;
        }
    }
    
    // Professional skills requirements
    if (jobTier.requirements.professionalSkills) {
        reqText += "- Professional Skills:\n";
        for (const [skillId, requiredLevel] of Object.entries(jobTier.requirements.professionalSkills)) {
            const skillName = GameData.skills.professional[skillId]?.name || skillId;
            reqText += `  • ${skillName}: Level ${requiredLevel}\n`;
        }
    }
    
    return reqText;
}

/**
 * Get job name from id
 */
function getJobName(jobId) {
    for (const trackId in GameData.careers) {
        const track = GameData.careers[trackId];
        const jobTier = track.tiers.find(tier => tier.id === jobId);
        if (jobTier) {
            return jobTier.name;
        }
    }
    return "Unknown Job";
}

// ============== Core Game Functions ==============

/**
 * Calculate allocatable hours per day
 */
function calculateAllocatableHours() {
    try {
        // Apply lifestyle modifiers to fixed time costs
        const housingOption = GameData.lifestyle.housing[gameState.housingType];
        const transportOption = GameData.lifestyle.transport[gameState.transportType];
        const foodOption = GameData.lifestyle.food[gameState.foodType];
        
        if (!housingOption || !transportOption || !foodOption) {
            throw new Error("Invalid lifestyle options");
        }
        
        const adjustedSleepHours = gameState.sleepHours * (1 - housingOption.sleepTimeReduction);
        const adjustedCommuteHours = gameState.commuteHours * (1 - transportOption.commuteTimeReduction);
        const adjustedMealHours = gameState.mealHours * (1 - foodOption.mealTimeReduction);
        
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
        // Return fallback values to prevent game crashes
        return {
            allocatableHours: 6,
            adjustedSleepHours: 10,
            adjustedCommuteHours: 4,
            adjustedMealHours: 4,
            fixedTimeTotal: 18
        };
    }
}

/**
 * Calculate daily income based on job
 */
function calculateDailyIncome() {
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
}

/**
 * Calculate daily expenses based on lifestyle
 */
function calculateDailyExpenses() {
    try {
        const housingCost = GameData.lifestyle.housing[gameState.housingType].cost;
        const transportCost = GameData.lifestyle.transport[gameState.transportType].cost;
        const foodCost = GameData.lifestyle.food[gameState.foodType].cost;
        
        return housingCost + transportCost + foodCost;
    } catch (error) {
        console.error("Error calculating daily expenses:", error);
        return 0;
    }
}

/**
 * Calculate job experience gain for a day
 */
function calculateJobExperience() {
    try {
        const trackInfo = GameData.careers[gameState.currentCareerTrack];
        const jobTierIndex = trackInfo.tiers.findIndex(tier => tier.id === gameState.currentJob);
        
        // Base rate depends on tier
        const baseExpPerHour = 5 + (jobTierIndex * 2);
        
        // Apply echo multiplier if exists
        const eternalEchoMultiplier = gameState.jobEchoes[gameState.currentJob] || 1;
        
        return gameState.workHours * baseExpPerHour * eternalEchoMultiplier;
    } catch (error) {
        console.error("Error calculating job experience:", error);
        return 0;
    }
}

/**
 * Calculate skill experience gain for a day
 */
function calculateSkillExperience(skillId) {
    try {
        const baseExpPerHour = 5;
        
        // Apply echo multiplier if exists
        const eternalEchoMultiplier = gameState.skillEchoes[skillId] || 1;
        
        return gameState.trainingHours * baseExpPerHour * eternalEchoMultiplier;
    } catch (error) {
        console.error("Error calculating skill experience:", error);
        return 0;
    }
}

/**
 * Check if job level up
 */
function checkJobLevelUp() {
    try {
        const expForNextLevel = 100 * Math.pow(1.1, gameState.jobLevel);
        
        if (gameState.jobExperience >= expForNextLevel) {
            gameState.jobExperience -= expForNextLevel;
            gameState.jobLevel++;
            
            showNotification("Level Up!", `Your ${getJobTitle()} job level is now ${gameState.jobLevel}.`);
            
            // Check if completed career track
            const trackInfo = GameData.careers[gameState.currentCareerTrack];
            const maxTierIndex = trackInfo.tiers.length - 1;
            const jobTierIndex = trackInfo.tiers.findIndex(tier => tier.id === gameState.currentJob);
            
            // If at max tier and level 100, consider career track completed
            if (jobTierIndex === maxTierIndex && gameState.jobLevel >= 100) {
                if (!gameState.completedCareerTracks.includes(gameState.currentCareerTrack)) {
                    gameState.completedCareerTracks.push(gameState.currentCareerTrack);
                    showNotification("Career Mastery!", `You've mastered the ${trackInfo.name} career track!`);
                }
            }
            
            // Return true if level up occurred
            return true;
        }
        
        return false;
    } catch (error) {
        console.error("Error checking job level up:", error);
        return false;
    }
}

/**
 * Check if skill level up
 */
function checkSkillLevelUp(skillType, skillId) {
    try {
        const skillData = skillType === 'general' ? 
                        gameState.generalSkills[skillId] : 
                        gameState.professionalSkills[skillId];
        
        if (!skillData) return false;
        
        const expForNextLevel = 100 * Math.pow(1.08, skillData.level);
        
        if (skillData.experience >= expForNextLevel) {
            skillData.experience -= expForNextLevel;
            skillData.level++;
            
            const skillName = skillType === 'general' ? 
                            GameData.skills.general[skillId].name : 
                            GameData.skills.professional[skillId].name;
            
            showNotification("Skill Improved!", `Your ${skillName} skill level is now ${skillData.level}.`);
            
            // Check if this level grants an Eternal Echo increase
            if (skillData.level % 10 === 0 && skillData.level <= 100) {
                updateEternalEchoMultiplier(skillType, skillId, skillData.level / 10);
            }
            
            // Return true if level up occurred
            return true;
        }
        
        return false;
    } catch (error) {
        console.error("Error checking skill level up:", error);
        return false;
    }
}

/**
 * Update eternal echo multiplier
 */
function updateEternalEchoMultiplier(skillType, skillId, multiplierLevel) {
    try {
        // 10% bonus per 10 levels, up to 100% (2x multiplier)
        const bonusPercent = Math.min(multiplierLevel * 10, 100);
        const multiplierValue = 1 + (bonusPercent / 100);
        
        if (skillType === 'general' || skillType === 'professional') {
            gameState.skillEchoes[skillId] = multiplierValue;
            
            const skillName = skillType === 'general' ? 
                            GameData.skills.general[skillId].name : 
                            GameData.skills.professional[skillId].name;
            
            showNotification("Eternal Echo Gained!", `Your ${skillName} skill now has a ${bonusPercent}% Eternal Echo bonus.`);
        } else if (skillType === 'job') {
            gameState.jobEchoes[skillId] = multiplierValue;
            showNotification("Eternal Echo Gained!", `Your ${getJobTitle()} job now has a ${bonusPercent}% Eternal Echo bonus.`);
        }
    } catch (error) {
        console.error("Error updating eternal echo multiplier:", error);
    }
}

/**
 * Calculate mortality rate
 */
function calculateMortalityRate() {
    try {
        const kValue = 0.1; // Base steepness factor
        const midpoint = 75; // Age at which mortality reaches 50%
        
        // Apply lifestyle modifiers
        const housingOption = GameData.lifestyle.housing[gameState.housingType];
        const foodOption = GameData.lifestyle.food[gameState.foodType];
        
        const mortalityModifier = housingOption.mortalityReduction + foodOption.mortalityReduction;
        const adjustedK = kValue * (1 - mortalityModifier);
        
        // Calculate using sigmoid function
        const base = 1.0; // 100% max mortality
        const mortalityRate = base * (1 / (1 + Math.exp(-adjustedK * (gameState.age - midpoint))));
        
        return mortalityRate;
    } catch (error) {
        console.error("Error calculating mortality rate:", error);
        // Return a safe default
        return 0.01;
    }
}

/**
 * Check if death occurs
 */
function checkMortality() {
    try {
        const mortalityRate = calculateMortalityRate();
        const randomValue = Math.random();
        
        // Daily chance of death based on mortality rate
        if (randomValue < mortalityRate) {
            // Death occurred
            handleDeath();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error("Error checking mortality:", error);
        return false;
    }
}

/**
 * Reincarnate player
 */
function reincarnate() {
    try {
        // Save game with death state before reincarnation for posterity
        if (gameState.autosaveEnabled) {
            GameState.saveGame(gameState);
        }
        
        // Reset game state while preserving echoes
        gameState = GameState.resetWithEchoes(gameState);
        
        // Hide death screen
        document.getElementById('death-screen').style.display = 'none';
        
        // Restart the game
        resumeGame();
        
        // Update UI
        updateUI();
        
        showNotification("Reincarnated!", "You've been reincarnated with your Eternal Echo bonuses.");
    } catch (error) {
        console.error("Error during reincarnation:", error);
        showNotification("Error", "Something went wrong during reincarnation. Refreshing the page may help.");
    }
}

/**
 * Start/pause game
 */
function togglePause() {
    if (gameState.isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
    
    updateUI();
}

/**
 * Pause the game
 */
function pauseGame() {
    if (gameState.tickInterval) {
        clearInterval(gameState.tickInterval);
        gameState.tickInterval = null;
    }
    
    gameState.isPaused = true;
    document.getElementById('toggle-pause').textContent = 'Resume';
    
    // Auto-save when pausing if enabled
    if (gameState.autosaveEnabled && !gameState.isGameOver) {
        GameState.saveGame(gameState);
    }
}

function resumeGame() {
    console.log('DEBUG: resumeGame called');
    console.log('DEBUG: Existing tick interval?', !!gameState.tickInterval);
    console.log('DEBUG: Game over?', gameState.isGameOver);
    console.log('DEBUG: Game speed', gameState.gameSpeed || 1);
    
    if (!gameState.tickInterval && !gameState.isGameOver) {
        console.log('DEBUG: Creating new tick interval with speed', gameState.gameSpeed || 1);
        gameState.tickInterval = setInterval(progressDay, (gameState.gameSpeed || 1) * 1000);
    } else {
        console.log('DEBUG: Not creating tick interval - already exists or game over');
    }
    
    gameState.isPaused = false;
    document.getElementById('toggle-pause').textContent = 'Pause';
}

/**
 * Progress one day
 */
function progressDay() {
    if (gameState.isPaused || gameState.isGameOver) {
        console.log('DEBUG: progressDay called but game is paused or over');
        return;
    }
    
    try {
        console.log('DEBUG: Processing day progress');
        
        // Calculate allocatable time
        const timeInfo = calculateAllocatableHours();
        
        // Check if time allocation is valid
        const totalAllocatedHours = gameState.workHours + gameState.trainingHours;
        if (totalAllocatedHours > timeInfo.allocatableHours) {
            // Automatically adjust work hours to fit
            gameState.workHours = Math.max(0, timeInfo.allocatableHours - gameState.trainingHours);
            
            if (gameState.workHours + gameState.trainingHours > timeInfo.allocatableHours) {
                gameState.trainingHours = Math.max(0, timeInfo.allocatableHours - gameState.workHours);
            }
            
            updateUI();
        }
        
        // Calculate income
        const dailyIncome = calculateDailyIncome();
        
        // Calculate expenses
        const dailyExpenses = calculateDailyExpenses();
        
        // Update kudos
        gameState.kudos += (dailyIncome - dailyExpenses);
        
        // Grant job experience
        if (gameState.workHours > 0) {
            gameState.jobExperience += calculateJobExperience();
            // Check for job level up
            checkJobLevelUp();
        }
        
        // Grant skill experience for the currently trained skill
        if (gameState.trainingHours > 0) {
            if (gameState.currentTrainingSkill in gameState.generalSkills) {
                gameState.generalSkills[gameState.currentTrainingSkill].experience += 
                    calculateSkillExperience(gameState.currentTrainingSkill);
                
                // Check for skill level up
                checkSkillLevelUp('general', gameState.currentTrainingSkill);
            } else if (gameState.currentTrainingSkill in gameState.professionalSkills) {
                gameState.professionalSkills[gameState.currentTrainingSkill].experience += 
                    calculateSkillExperience(gameState.currentTrainingSkill);
                
                // Check for skill level up
                checkSkillLevelUp('professional', gameState.currentTrainingSkill);
            }
        }
        
        // Increment day
        gameState.day++;
        
        // Check for month/year changes
        if (gameState.day > 30) {
            gameState.day = 1;
            gameState.month++;
            
            if (gameState.month > 12) {
                gameState.month = 1;
                gameState.year++;
                
                // Age increases each year
                gameState.age++;
                
                // Check mortality on birthdays
                if (checkMortality()) {
                    return; // Game over, stop progression
                }
            }
        }
        
        // Log debug info
        console.log('DEBUG: Day progressed', {
            day: gameState.day,
            month: gameState.month,
            year: gameState.year,
            age: gameState.age,
            kudos: gameState.kudos,
            workHours: gameState.workHours,
            trainingHours: gameState.trainingHours,
            jobExp: gameState.jobExperience,
            jobLevel: gameState.jobLevel
        });
        
        // Update UI
        updateUI();
    } catch (error) {
        console.error("Error progressing day:", error);
        showNotification("Error", "Something went wrong processing the day. Game paused.");
        pauseGame();
    }
}

/**
 * Handle player death
 */
function handleDeath() {
    try {
        // Stop the game
        pauseGame();
        gameState.isGameOver = true;
        
        // Record highest levels for Eternal Echoes before reset
        for (const skillId in gameState.generalSkills) {
            const prevEcho = gameState.skillEchoes[skillId] || 1;
            const newEcho = 1 + (Math.floor(gameState.generalSkills[skillId].level / 10) * 0.1);
            
            if (newEcho > prevEcho) {
                gameState.skillEchoes[skillId] = newEcho;
            }
        }
        
        for (const skillId in gameState.professionalSkills) {
            const prevEcho = gameState.skillEchoes[skillId] || 1;
            const newEcho = 1 + (Math.floor(gameState.professionalSkills[skillId].level / 10) * 0.1);
            
            if (newEcho > prevEcho) {
                gameState.skillEchoes[skillId] = newEcho;
            }
        }
        
        // Add job echo
        const prevJobEcho = gameState.jobEchoes[gameState.currentJob] || 1;
        const newJobEcho = 1 + (Math.floor(gameState.jobLevel / 10) * 0.1);
        
        if (newJobEcho > prevJobEcho) {
            gameState.jobEchoes[gameState.currentJob] = newJobEcho;
        }
        
        // Find highest skill level
        let highestSkillLevel = 0;
        for (const skillId in gameState.generalSkills) {
            if (gameState.generalSkills[skillId].level > highestSkillLevel) {
                highestSkillLevel = gameState.generalSkills[skillId].level;
            }
        }
        for (const skillId in gameState.professionalSkills) {
            if (gameState.professionalSkills[skillId].level > highestSkillLevel) {
                highestSkillLevel = gameState.professionalSkills[skillId].level;
            }
        }
        
        // Show death screen
        document.getElementById('death-age').textContent = gameState.age;
        document.getElementById('death-job-level').textContent = gameState.jobLevel;
        document.getElementById('death-skill-level').textContent = highestSkillLevel;
        document.getElementById('death-screen').style.display = 'flex';
    } catch (error) {
        console.error("Error handling death:", error);
        // Show a simplified death screen in case of error
        document.getElementById('death-screen').style.display = 'flex';
    }
}

// Initialize game when document is loaded
window.addEventListener('DOMContentLoaded', function() {
    console.log('DEBUG: DOMContentLoaded event triggered');
    initializeGame();
});