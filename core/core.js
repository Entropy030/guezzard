// core.js - Fully Integrated Core System

console.log("core.js - Loading fully integrated core system");

// -------------------------------------------------------------------------
// Game State Functions
// -------------------------------------------------------------------------

/**
 * Default game state - Initial values for a new game
 */
function getDefaultGameState() {
    return {
        // Game settings
        settings: {
            tickRate: 1000,
            autoSaveInterval: 30,
            soundEnabled: true
        },
        
        // System values
        lastTickTime: 0,
        ticksSinceDayStart: 0,
        gameSpeed: 1,
        gameActive: true,
        gamePaused: false,
        
        // Time tracking
        day: 1,
        seasonTimeLeft: CONFIG.settings.seasonDuration || 150,
        currentSeason: "Spring",
        seasonNumber: 0,
        year: 1,
        timePlayedSeconds: 0,
        
        // Player stats
        prestigeLevel: 0,
        prestigePoints: 0,
        gold: 0,
        age: 18,
        lifeQuality: 50,
        energy: 100,
        maxEnergy: 100,
        energyRechargeRate: 0.1,
        
        // Mortality tracking
        mortalityRate: 0.001, // Base mortality rate for young age
        avgYearsLeft: 47,     // Initial estimate
        
        // Lifestyle system
        lifestyle: {
            housing: "Shared Room",
            transportation: "Walking",
            diet: "Basic Food"
        },
        lifestyleEffects: {
            mortalityModifier: 1.0,
            timeAllocation: {
                sleep: 8,
                commute: 2,
                meals: 3
            },
            satisfactionBonus: 0,
            costPerDay: 7 // Default cost (4 for housing + 0 for walking + 3 for basic food)
        },
        
        // Career & skills
        currentJobTier: 0,
        activeJob: null,
        jobs: [],
        jobLevels: {},
        jobProgress: 0,
        skills: {
            "map_awareness": 1
        },
        skillProgress: {
            "map_awareness": 0
        },
        currentTrainingSkill: null,
        
        // Time allocation
        timeAllocation: {
            working: 5,
            training: 3,
            sleeping: 8,
            traveling: 2,
            cooking: 3,
            cleaning: 0.5,
            freeTime: 2.5
        },
        
        // Progress tracking
        achievements: [],
        unlockedAchievements: [],
        eventLog: [],
        statistics: {
            timePlayedSeconds: 0,
            totalGoldEarned: 0,
            jobsHeld: 0,
            prestigeCount: 0,
            lifetimeCount: 0
        },
        
        // Income tracking
        income: {
            job: 0,
            total: 0,
        },
        
        // Additional statistics
        gameStats: {
            totalGoldEarned: 0
        }
    };
}

/**
 * Initialize game state (create if not exists)
 */
function initializeGameState() {
    console.log("initializeGameState() - Creating or loading game state");
    
    // If gameState is not defined globally, create it
    if (typeof window.gameState === 'undefined') {
        window.gameState = getDefaultGameState();
    }
    
    return window.gameState;
}

/**
 * Save game state to localStorage
 */
function saveGameState() {
    try {
        console.log("saveGameState() - Saving game state to localStorage");
        // Add timestamp to save data
        const saveData = {
            gameState: window.gameState,
            savedAt: new Date().toISOString(),
            version: '1.0.0' // Add version for future compatibility
        };
        
        // Save to localStorage
        localStorage.setItem('guezzardGameSave', JSON.stringify(saveData));
        
        // Log success
        console.log("Game saved successfully!");
        return true;
    } catch (error) {
        console.error("Error saving game:", error);
        return false;
    }
}

/**
 * Load game state from localStorage
 */
function loadGameState() {
    try {
        console.log("loadGameState() - Loading game state from localStorage");
        
        // Get save data from localStorage
        const saveData = localStorage.getItem('guezzardGameSave');
        
        // If no save data exists, return null
        if (!saveData) {
            console.log("No saved game found");
            return null;
        }
        
        // Parse saved data
        const parsedData = JSON.parse(saveData);
        
        // Basic validation - check if the structure makes sense
        if (!parsedData.gameState || typeof parsedData.gameState !== 'object') {
            console.warn("Invalid save data format");
            return null;
        }
        
        // Log successful load
        console.log("Game loaded successfully from save dated:", parsedData.savedAt);
        
        // Return the saved game state
        return parsedData.gameState;
    } catch (error) {
        console.error("Error loading game:", error);
        return null;
    }
}

/**
 * Reset game state to defaults
 */
function resetGameState() {
    console.log("resetGameState() - Resetting game to defaults");
    window.gameState = getDefaultGameState();
    return window.gameState;
}

// Auto-save system
let autoSaveInterval = null;

/**
 * Start auto-save system
 */
function startAutoSave(intervalSeconds = 30) {
    console.log(`startAutoSave() - Setting up auto-save every ${intervalSeconds} seconds`);
    
    // Clear any existing interval
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    // Set up new interval
    autoSaveInterval = setInterval(() => {
        saveGameState();
        console.log("Auto-save completed");
    }, intervalSeconds * 1000);
}

/**
 * Stop auto-save system
 */
function stopAutoSave() {
    console.log("stopAutoSave() - Stopping auto-save system");
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// -------------------------------------------------------------------------
// Game Initialization Functions
// -------------------------------------------------------------------------

/**
 * Set up all game systems
 */
function setupGameSystems() {
    console.log("setupGameSystems() - Setting up core game systems");
    
    // Initialize job system if available
    if (typeof window.initializeJobSystem === 'function') {
        window.initializeJobSystem();
    }

    // Initialize skill system if available
    if (typeof window.initializeSkillSystem === 'function') {
        window.initializeSkillSystem();
    }

    // Initialize prestige system if available
    if (typeof window.initializePrestigeSystem === 'function') {
        window.initializePrestigeSystem();
    }
    
    // Initialize lifestyle system if available
    if (typeof window.initializeLifestyleSystem === 'function') {
        window.initializeLifestyleSystem();
    }
    
    return true;
}

/**
 * Load game data from JSON files
 */
async function loadGameData() {
    console.log("loadGameData() - Loading game data");
    
    try {
        // Create an array of promises for each fetch
        const promises = [
            fetch("data/skills.json").then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load skills.json: ${response.status} ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error("Error loading skills:", error);
                return []; // Default empty array on error
            }),
            
            fetch("data/jobs.json").then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load jobs.json: ${response.status} ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error("Error loading jobs:", error);
                return []; // Default empty array on error
            }),
            
            fetch("data/achievements.json").then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load achievements.json: ${response.status} ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error("Error loading achievements:", error);
                return []; // Default empty array on error
            }),
            
            fetch("data/events.json").then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load events.json: ${response.status} ${response.statusText}`);
                }
                return response.json();
            }).catch(error => {
                console.error("Error loading events:", error);
                return []; // Default empty array on error
            })
        ];

        // Wait for all promises to resolve
        const [loadedSkills, loadedJobs, loadedAchievements, loadedEvents] = await Promise.all(promises);

        console.log("Skills data loaded:", loadedSkills.length || 0, "categories");
        console.log("Jobs data loaded:", loadedJobs.length || 0, "jobs");
        console.log("Achievements data loaded:", loadedAchievements.length || 0, "achievements");
        console.log("Events data loaded:", loadedEvents.length || 0, "events");

        // Process skills data
        processSkillsData(loadedSkills);
        
        // Store jobs data
        window.gameState.jobs = loadedJobs;
        
        // Store achievements data
        window.gameState.achievements = loadedAchievements;
        
        // Store events data
        window.gameState.events = loadedEvents;
        
        console.log("All game data loaded successfully");
        return true;
    } catch (error) {
        console.error("Error loading game data:", error);
        console.log("Using fallback default data");
        
        // Set up fallback data
        setupDefaultData();
        return false;
    }
}

/**
 * Process skills data from loaded JSON
 */
function processSkillsData(skillsData) {
    // Check if we have the expected format (categories with items)
    if (Array.isArray(skillsData) && skillsData.length > 0 && skillsData[0].items) {
        // Process skill categories
        processSkillCategories(skillsData);
    } else {
        // Handle simple array of skills
        processSimpleSkillsList(skillsData);
    }
    
    // Ensure Map Awareness skill exists (core skill for the game)
    if (!window.gameState.skills["map_awareness"]) {
        window.gameState.skills["map_awareness"] = {
            id: "map_awareness",
            name: "Map Awareness",
            description: "Ability to read and understand maps",
            level: 1,
            xp: 0,
            maxLevel: 100
        };
    }
}

/**
 * Process skill categories and their items
 */
function processSkillCategories(categories) {
    // Initialize skills object
    if (!window.gameState.skills) {
        window.gameState.skills = {};
    }
    
    // Initialize skill categories
    if (!window.gameState.skillCategories) {
        window.gameState.skillCategories = {};
    }
    
    // Process each category
    categories.forEach(category => {
        // Skip attributes category for special handling
        if (category.id === 'attributes') {
            processAttributes(category);
            return;
        }
        
        // Store category data
        window.gameState.skillCategories[category.id] = {
            id: category.id,
            name: category.name,
            description: category.description,
            primaryAttribute: category.primaryAttribute,
            secondaryAttribute: category.secondaryAttribute
        };
        
        // Process skills in this category
        if (Array.isArray(category.items)) {
            category.items.forEach(skill => {
                if (skill && skill.id) {
                    // Check if skill already exists to preserve progress
                    if (window.gameState.skills[skill.id]) {
                        // Update metadata but preserve level/xp
                        const existingSkill = window.gameState.skills[skill.id];
                        const level = existingSkill.level || existingSkill.baseValue || 0;
                        const xp = existingSkill.xp || 0;
                        
                        window.gameState.skills[skill.id] = {
                            id: skill.id,
                            name: skill.name || skill.id,
                            description: skill.description || '',
                            categoryId: category.id,
                            level: level,
                            xp: xp,
                            maxLevel: skill.maxLevel || 100,
                            baseValue: skill.baseValue || 0,
                            growthRate: skill.growthRate || 1.0,
                            decayRate: skill.decayRate || 0.1,
                            synergies: skill.synergies || []
                        };
                    } else {
                        // Create new skill
                        window.gameState.skills[skill.id] = {
                            id: skill.id,
                            name: skill.name || skill.id,
                            description: skill.description || '',
                            categoryId: category.id,
                            level: skill.level || skill.baseValue || 0,
                            xp: 0,
                            maxLevel: skill.maxLevel || 100,
                            baseValue: skill.baseValue || 0,
                            growthRate: skill.growthRate || 1.0,
                            decayRate: skill.decayRate || 0.1,
                            synergies: skill.synergies || []
                        };
                    }
                }
            });
        }
    });
}

/**
 * Process attributes from the skills data
 */
function processAttributes(attributesCategory) {
    // Initialize attributes object
    if (!window.gameState.attributes) {
        window.gameState.attributes = {};
    }
    
    // Process each attribute
    attributesCategory.items.forEach(attribute => {
        if (attribute && attribute.id) {
            // Check if attribute already exists
            if (window.gameState.attributes[attribute.id]) {
                // Preserve value but update metadata
                const currentValue = window.gameState.attributes[attribute.id].value;
                
                window.gameState.attributes[attribute.id] = {
                    id: attribute.id,
                    name: attribute.name || attribute.id,
                    description: attribute.description || '',
                    icon: attribute.icon || '',
                    value: currentValue || attribute.baseValue || 5,
                    modifiers: attribute.modifiers || []
                };
            } else {
                // Create new attribute
                window.gameState.attributes[attribute.id] = {
                    id: attribute.id,
                    name: attribute.name || attribute.id,
                    description: attribute.description || '',
                    icon: attribute.icon || '',
                    value: attribute.baseValue || 5,
                    modifiers: attribute.modifiers || []
                };
            }
        }
    });
}

/**
 * Process simple list of skills (fallback)
 */
function processSimpleSkillsList(skills) {
    // Initialize skills object
    if (!window.gameState.skills) {
        window.gameState.skills = {};
    }
    
    // Process each skill
    if (Array.isArray(skills)) {
        skills.forEach(skill => {
            if (skill && skill.name) {
                window.gameState.skills[skill.name] = {
                    name: skill.name,
                    description: skill.description || '',
                    level: skill.level || 0,
                    xp: 0
                };
            }
        });
    }
}

/**
 * Setup default data if loading fails
 */
function setupDefaultData() {
    // Set up default skills
    window.gameState.skills = {
        "map_awareness": {
            id: "map_awareness",
            name: "Map Awareness",
            description: "Ability to read and understand maps",
            level: 1,
            xp: 0
        }
    };
    
    // Set up default jobs from CONFIG
    window.gameState.jobs = CONFIG.geoguesserCareerPath || [];
    
    // Set up empty achievements array
    window.gameState.achievements = [];
    
    // Set up empty events array
    window.gameState.events = [];
}

/**
 * Initialize UI system
 */
function initializeUI() {
    if (typeof window.initializeUISystem === 'function') {
        window.initializeUISystem();
    } else {
        // Fallback to separate UI initialization functions
        if (typeof window.setupEventLog === 'function') {
            window.setupEventLog();
        }
        
        if (typeof window.setupGameControls === 'function') {
            window.setupGameControls();
        }
        
        if (typeof window.setupJobsUI === 'function') {
            window.setupJobsUI();
        }
    }
}

// -------------------------------------------------------------------------
// Game Loop Functions (merged from game-loop.js)
// -------------------------------------------------------------------------

// Variables for game loop timing
let lastTimestamp = 0;

/**
 * Main game loop function
 */
function gameLoop(timestamp) {
    if (gameState.gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // Initialize lastTimestamp if it's the first call
    if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
    }

    const effectiveTickRate = 1000 / (CONFIG.settings.tickInterval * gameState.gameSpeed);
    const deltaTime = timestamp - lastTimestamp;

    if (deltaTime >= effectiveTickRate) {
        lastTimestamp = timestamp;  // Update lastTimestamp ONLY when a tick occurs

        // Regenerate energy
        regenerateEnergy();

        // Handle season time
        if (gameState.seasonTimeLeft > 0) {
            gameState.seasonTimeLeft -= 1;
        } else {
            // Season End & Transition
            gameState.seasonTimeLeft = CONFIG.settings.seasonDuration; 
        }
        
        // Advance the game day
        advanceDay();
        
        // Process job progress (if player has a job)
        if (typeof window.processJobProgress === 'function' && gameState.activeJob) {
            window.processJobProgress(deltaTime);
        }

        // Update UI
        if (typeof window.updateAllDisplays === 'function') {
            window.updateAllDisplays();
        } else if (typeof window.updateDisplay === 'function') {
            window.updateDisplay();
        }
        
        // Check for achievements
        if (typeof window.checkAchievements === 'function') {
            window.checkAchievements();
        }
        
        // Process random events (if enabled)
        if (typeof window.processRandomEvents === 'function') {
            window.processRandomEvents();
        }
    }

    requestAnimationFrame(gameLoop);
}

/**
 * Function to start the game loop
 */
function startGameLoop() {
    console.log("startGameLoop() - Starting game loop");
    lastTimestamp = 0; // Reset lastTimestamp
    requestAnimationFrame(gameLoop);
}

/**
 * Energy regeneration function
 */
function regenerateEnergy() {
    const energyRegenBase = 1;
    const prestigeBonus = gameState.prestigeLevel * 0.2;
    const regenRate = energyRegenBase + prestigeBonus;

    let newEnergy = gameState.energy + regenRate;
    gameState.energy = Math.min(gameState.maxEnergy, newEnergy);
    
    // Update energy display if function exists
    if (typeof window.updateEnergyDisplay === 'function') {
        window.updateEnergyDisplay();
    }
}

/**
 * Advance the game day, handle season/year transitions
 */
function advanceDay() {
    // Skip if game is paused
    if (gameState.gamePaused) {
        return;
    }

    gameState.ticksSinceDayStart++; // Increment at the beginning

    // Check if a new day has started
    if (gameState.ticksSinceDayStart >= CONFIG.settings.ticksInOneGameDay) {
        gameState.day++;
        gameState.ticksSinceDayStart = 0; // Reset at the START of the new day
        
        // Apply lifestyle costs at the start of each day
        if (typeof window.applyLifestyleCosts === 'function') {
            window.applyLifestyleCosts();
        }
        
        // Check for natural death based on mortality rate
        if (checkForNaturalDeath()) {
            return; // Stop processing if player died
        }
        
        // Update day display
        updateDaySeasonDisplay();
    }

    // Calculate season length in days
    const seasonLengthInDays = CONFIG.settings.seasonDuration / CONFIG.settings.ticksInOneGameDay;

    // Check if a new season should start
    if (gameState.day > seasonLengthInDays) {
        // Reset day counter
        gameState.day = 1;
        gameState.seasonNumber++;

        // Update season
        const seasons = ["Spring", "Summer", "Autumn", "Winter"];
        gameState.currentSeason = seasons[(gameState.seasonNumber) % seasons.length];

        // Check if it's the start of a new year (Spring)
        if (gameState.currentSeason === "Spring") {
            gameState.year++; // New year starts in Spring
            
            // IMPORTANT: Increment age with each new year
            gameState.age++;
            console.log(`Year incremented to ${gameState.year}, Age incremented to ${gameState.age}`);
            
            // Update mortality rate based on new age
            calculateMortality();
            
            // Check for retirement age (max age)
            if (gameState.age >= CONFIG.settings.maxAge) {
                handleRetirement();
                return; // Stop after retirement handling
            }
        }
        
        // Reset season time
        gameState.seasonTimeLeft = CONFIG.settings.seasonDuration;
        
        // Update display
        updateDaySeasonDisplay();
    }

    // Increment played time and save game periodically
    gameState.timePlayedSeconds++;
    
    // Save only occasionally to improve performance (every 60 seconds of game time)
    if (gameState.timePlayedSeconds % 60 === 0) {
        saveGameState();
    }
}

/**
 * Update day and season display
 */
function updateDaySeasonDisplay() {
    const dateDisplay = document.getElementById('season-display');
    if (dateDisplay) {
        dateDisplay.textContent = `Day ${gameState.day}, ${gameState.currentSeason}, Year ${gameState.year}`;
    }
    
    const ageDisplay = document.querySelector('.age-display');
    if (ageDisplay) {
        ageDisplay.textContent = `Age: ${gameState.age}`;
    }
}

/**
 * Calculate current mortality rate based on age and lifestyle
 * Implements the sigmoid mortality curve from the game mechanics document
 * @returns {number} Current mortality rate (0-1)
 */
function calculateMortality() {
    // Base mortality factors (adjusted to match documentation)
    const baseMortality = 0.001; // Base rate at young age
    const midpointAge = 65;      // Age at which mortality is 50% of maximum
    const kFactor = 0.15;        // Steepness of the sigmoid curve (lower = flatter curve)
    
    // Apply lifestyle modifier to the k factor (steepness)
    let lifestyleModifier = 1.0; // Default modifier
    
    // Use lifestyle system if available
    if (typeof window.getLifestyleMortalityModifier === 'function') {
        lifestyleModifier = window.getLifestyleMortalityModifier();
    } else {
        // Fallback to basic lifestyle calculation
        lifestyleModifier = getLifestyleKFactorModifier();
    }
    
    const finalKFactor = kFactor * lifestyleModifier;
    
    // Calculate mortality using sigmoid function as described in game mechanics document
    // Formula: Mortality Rate = Base × (1 / (1 + e^(-k × (Age - Midpoint))))
    const ageDifference = gameState.age - midpointAge;
    const sigmoidValue = 1 / (1 + Math.exp(-finalKFactor * ageDifference));
    
    // Combine base mortality with sigmoid scaling
    const mortalityRate = baseMortality + (1 - baseMortality) * sigmoidValue;
    
    // Calculate average years left (improved estimate based on mortality)
    // Using actuarial approximation: higher mortality = fewer years left
    let avgYearsLeft = Math.max(0, Math.round((1 - mortalityRate) * (100 - gameState.age)));
    
    // Apply diminishing returns at very old ages
    if (gameState.age > 90) {
        avgYearsLeft = Math.min(avgYearsLeft, 10);
    }
    
    // Store in game state
    gameState.mortalityRate = mortalityRate;
    gameState.avgYearsLeft = avgYearsLeft;
    
    return mortalityRate;
}

/**
 * Get lifestyle impact on mortality curve steepness
 * @returns {number} Modifier to k-factor (lower is better)
 */
function getLifestyleKFactorModifier() {
    // Default modifier (higher = steeper curve = higher mortality)
    let modifier = 1.0;
    
    if (!gameState.lifestyle) {
        return modifier;
    }
    
    // Housing impact - Significant effect (30% of total lifestyle effect)
    const housing = gameState.lifestyle.housing || "Shared Room";
    if (housing === "Castle") modifier *= 0.7;        // -30% mortality rate
    else if (housing === "Mansion") modifier *= 0.75; // -25% mortality rate
    else if (housing === "Luxury Condo") modifier *= 0.8;  // -20% mortality rate
    else if (housing === "Townhouse") modifier *= 0.85;    // -15% mortality rate
    else if (housing === "Apartment") modifier *= 0.9;     // -10% mortality rate
    else if (housing === "Tiny Apartment") modifier *= 0.95; // -5% mortality rate
    else if (housing === "Shared Room") modifier *= 1.0;   // No effect
    else if (housing === "Homeless") modifier *= 1.2;      // +20% mortality rate
    
    // Diet impact - Moderate effect (20% of total lifestyle effect)
    const diet = gameState.lifestyle.diet || "Basic Food";
    if (diet === "Nutrient Optimization") modifier *= 0.8;  // -20% mortality rate
    else if (diet === "Personal Chef") modifier *= 0.85;    // -15% mortality rate
    else if (diet === "Organic Market") modifier *= 0.92;   // -8% mortality rate
    else if (diet === "Meal Delivery") modifier *= 0.95;    // -5% mortality rate
    else if (diet === "Grocery Store") modifier *= 0.97;    // -3% mortality rate
    else if (diet === "Basic Food") modifier *= 1.05;       // +5% mortality rate
    else if (diet === "Homeless Shelter") modifier *= 1.15; // +15% mortality rate
    
    // Transportation impact - Minor effect (5% of total lifestyle effect)
    const transport = gameState.lifestyle.transportation || "Walking";
    if (transport === "Teleportation") modifier *= 0.95;    // -5% mortality rate (no travel risks)
    else if (transport === "Helicopter") modifier *= 1.02;  // +2% mortality rate (slight risk)
    else if (transport === "Luxury Car") modifier *= 0.98;  // -2% mortality rate (safety features)
    else if (transport === "Car") modifier *= 1.01;         // +1% mortality rate (accident risk)
    else if (transport === "Public Transit") modifier *= 1.0; // No effect
    else if (transport === "Bicycle") modifier *= 0.97;     // -3% mortality rate (exercise benefit)
    else if (transport === "Walking") modifier *= 0.99;     // -1% mortality rate (small exercise benefit)
    
    return modifier;
}

/**
 * Check for natural death based on mortality rate
 * @returns {boolean} Whether death occurred
 */
function checkForNaturalDeath() {
    // Skip if game is paused
    if (gameState.gamePaused) {
        return false;
    }
    
    // Calculate current mortality
    const mortalityRate = calculateMortality();
    
    // Daily death chance (convert annual rate to daily)
    const dailyMortalityRate = mortalityRate / 365;
    
    // Check for death (random roll against daily mortality rate)
    if (Math.random() < dailyMortalityRate) {
        handlePlayerDeath();
        return true;
    }
    
    return false;
}

/**
 * Apply daily lifestyle costs
 * Called from the game loop during day advancement
 */
function applyLifestyleCosts() {
    // Skip if lifestyle effects not calculated
    if (!gameState.lifestyleEffects) {
        return;
    }
    
    // Get daily cost
    const dailyCost = gameState.lifestyleEffects.costPerDay;
    
    // Deduct from gold
    if (dailyCost > 0) {
        gameState.gold -= dailyCost;
        
        // Track expenses in statistics
        if (gameState.statistics) {
            gameState.statistics.totalExpenses = (gameState.statistics.totalExpenses || 0) + dailyCost;
        }
        
        // Ensure gold doesn't go negative
        if (gameState.gold < 0) {
            // If can't afford lifestyle, downgrade to cheapest options
            downgradeLifestyleIfNeeded();
            
            // Log the financial difficulty
            if (typeof window.logEvent === 'function') {
                window.logEvent("You've run out of kudos! Your lifestyle has been downgraded.", 'financial');
            }
        }
    }
}

/**
 * Handle player death and start new life
 */
function handlePlayerDeath() {
    // Log event
    if (typeof window.logEvent === 'function') {
        window.logEvent(`You have died of natural causes at age ${gameState.age}.`, 'life');
    }
    
    // Save multipliers from this life
    saveMultipliersFromCurrentLife();
    
    // Show death message/screen
    const message = `You have died of natural causes at age ${gameState.age}.`;
    
    if (typeof window.showDeathScreen === 'function') {
        window.showDeathScreen(message);
    } else {
        alert(message);
        startNewLife();
    }
}

/**
 * Handle player retirement
 */
function handleRetirement() {
    // Log event
    if (typeof window.logEvent === 'function') {
        window.logEvent(`You have reached retirement age (${CONFIG.settings.maxAge}).`, 'life');
    }
    
    // Show retirement message or screen
    const message = `You have reached retirement age (${CONFIG.settings.maxAge}) and will begin a new life.`;
    
    if (typeof window.showRetirementScreen === 'function') {
        window.showRetirementScreen(message);
    } else {
        alert(message);
        // Save multipliers and start new life
        saveMultipliersFromCurrentLife();
        startNewLife();
    }
}

/**
 * Save multipliers from current life for next life
 */
function saveMultipliersFromCurrentLife() {
    // Simple implementation - create skill multipliers based on current skill levels
    if (!gameState.skillMultipliers) {
        gameState.skillMultipliers = {};
    }
    
    // For each skill, calculate multiplier (1% per level, max 100%)
    for (const skillId in gameState.skills) {
        const skill = gameState.skills[skillId];
        const skillLevel = typeof skill === 'object' ? skill.level : skill;
        
        // Create or update multiplier (taking max value)
        const newMultiplier = Math.min(1.0, skillLevel / 100);
        gameState.skillMultipliers[skillId] = Math.max(
            newMultiplier,
            gameState.skillMultipliers[skillId] || 0
        );
    }
    
    // Also save job multipliers if needed
    if (gameState.jobLevels && !gameState.jobMultipliers) {
        gameState.jobMultipliers = {};
    }
    
    if (gameState.jobLevels) {
        for (const jobId in gameState.jobLevels) {
            const jobLevel = gameState.jobLevels[jobId];
            
            // Create or update multiplier (taking max value)
            const newMultiplier = Math.min(1.0, jobLevel / 100);
            gameState.jobMultipliers[jobId] = Math.max(
                newMultiplier,
                gameState.jobMultipliers[jobId] || 0
            );
        }
    }
    
    // Save skill levels for the skill system if that function exists
    if (typeof window.saveSkillLevelsForNextLife === 'function') {
        window.saveSkillLevelsForNextLife();
    }
}

/**
 * Start a new life with multipliers from previous lives
 */
function startNewLife() {
    // Save some data to keep
    const keepData = {
        skillMultipliers: gameState.skillMultipliers || {},
        jobMultipliers: gameState.jobMultipliers || {},
        achievements: gameState.achievements || [],
        unlockedAchievements: gameState.unlockedAchievements || [],
        statistics: gameState.statistics || {},
        settings: gameState.settings || {},
        previousLivesSkillLevels: gameState.previousLivesSkillLevels || {}
    };
    
    // Update life count
    if (!keepData.statistics.lifetimeCount) {
        keepData.statistics.lifetimeCount = 0;
    }
    keepData.statistics.lifetimeCount++;
    
    // Reset game state
    const defaultState = getDefaultGameState();
    Object.assign(gameState, defaultState);
    
    // Restore saved data
    gameState.skillMultipliers = keepData.skillMultipliers;
    gameState.jobMultipliers = keepData.jobMultipliers;
    gameState.achievements = keepData.achievements;
    gameState.unlockedAchievements = keepData.unlockedAchievements;
    gameState.statistics = keepData.statistics;
    gameState.settings = keepData.settings;
    gameState.previousLivesSkillLevels = keepData.previousLivesSkillLevels;
    
    // Apply multipliers to new life
    applyPreviousLifeMultipliers();
    
    // Initialize lifestyle system if available
    if (typeof window.initializeLifestyleSystem === 'function') {
        window.initializeLifestyleSystem();
    }
    
    // Update UI
    if (typeof window.updateAllDisplays === 'function') {
        window.updateAllDisplays();
    }
    
    // Log event
    if (typeof window.logEvent === 'function') {
        window.logEvent(`Starting life #${gameState.statistics.lifetimeCount}!`, 'life');
    }
}

/**
 * Apply multipliers from previous lives
 */
function applyPreviousLifeMultipliers() {
    // Apply skill multipliers
    if (gameState.skillMultipliers) {
        for (const skillId in gameState.skillMultipliers) {
            const multiplier = gameState.skillMultipliers[skillId];
            
            // Skip if no multiplier
            if (!multiplier) continue;
            
            // Apply to skill growth rate if skill exists
            if (gameState.skills && gameState.skills[skillId]) {
                if (typeof gameState.skills[skillId] === 'object') {
                    gameState.skills[skillId].growthMultiplier = 1 + multiplier;
                }
            }
        }
    }
    
    // Apply job multipliers to global multipliers
    if (gameState.jobMultipliers) {
        let totalMultiplier = 0;
        let jobCount = 0;
        
        for (const jobId in gameState.jobMultipliers) {
            totalMultiplier += gameState.jobMultipliers[jobId];
            jobCount++;
        }
        
        // Apply average multiplier to gold and skill gains
        if (jobCount > 0) {
            const avgMultiplier = totalMultiplier / jobCount;
            
            if (!gameState.multipliers) {
                gameState.multipliers = { gold: 1, skill: 1 };
            }
            
            gameState.multipliers.gold = 1 + avgMultiplier;
            gameState.multipliers.skill = 1 + (avgMultiplier * 0.5); // Half effect on skills
        }
    }
}

/**
 * Update job progress bar
 */
function updateJobProgressBar() {
    const jobProgressBarFill = document.querySelector('.progressFill') || document.getElementById('job-progress-fill');
    const jobProgressText = document.querySelector('.progress-text.name') || document.getElementById('job-progress-text');
    
    if (!jobProgressBarFill || !jobProgressText) {
        // Elements not found, may be early in loading process
        return;
    }
    
    if (gameState.activeJob) {
        let progressPercent = 0;
        
        // Use getJobProgressPercentage if available
        if (typeof window.getJobProgressPercentage === 'function') {
            progressPercent = window.getJobProgressPercentage();
        } else {
            // Fallback calculation
            const progressNeeded = gameState.activeJob.progressNeeded || 100;
            progressPercent = (gameState.jobProgress / progressNeeded) * 100;
        }
        
        jobProgressBarFill.style.width = `${Math.min(100, progressPercent)}%`;
        jobProgressText.textContent = `${gameState.activeJob.title} Progress: ${Math.floor(progressPercent)}%`;
    } else {
        jobProgressBarFill.style.width = '0%';
        jobProgressText.textContent = 'No Active Job';
    }
}

/**
 * Update skill progress bar
 */
function updateSkillProgressBar() {
    const skillProgressBarFill = document.getElementById('skill-progress-fill');
    const skillProgressText = document.getElementById('skill-progress-text');
    
    if (!skillProgressBarFill || !skillProgressText) {
        // Elements not found, may be early in loading process
        return;
    }
    
    // Example for a currently training skill
    if (gameState.currentTrainingSkill) {
        const skill = gameState.skills[gameState.currentTrainingSkill];
        
        if (skill) {
            let progressPercent = 0;
            
            if (typeof skill === 'object' && skill.progress !== undefined && skill.progressNeeded !== undefined) {
                progressPercent = (skill.progress / skill.progressNeeded) * 100;
            } else if (gameState.skillProgress && gameState.skillProgress[gameState.currentTrainingSkill] !== undefined) {
                // Fallback to older skill system
                const progress = gameState.skillProgress[gameState.currentTrainingSkill];
                const skillLevel = typeof skill === 'object' ? skill.level : skill;
                const progressNeeded = 10 + (skillLevel * 5); // Simple progression formula
                progressPercent = (progress / progressNeeded) * 100;
            }
            
            skillProgressBarFill.style.width = `${Math.min(100, progressPercent)}%`;
            skillProgressText.textContent = `${gameState.currentTrainingSkill} Progress: ${Math.floor(progressPercent)}%`;
        } else {
            skillProgressBarFill.style.width = '0%';
            skillProgressText.textContent = 'No Skill Training';
        }
    } else {
        skillProgressBarFill.style.width = '0%';
        skillProgressText.textContent = 'No Skill Training';
    }
}

/**
 * Update energy display
 */
function updateEnergyDisplay() {
    const energyDisplay = document.getElementById('energy-display');
    const energyBarFill = document.getElementById('energy-bar-fill');
    
    if(energyDisplay && typeof window.gameState !== 'undefined') {
        energyDisplay.textContent = `${Math.floor(window.gameState.energy)}/${window.gameState.maxEnergy}`;
    }
    
    if(energyBarFill && typeof window.gameState !== 'undefined') {
        const energyPercentage = (window.gameState.energy / window.gameState.maxEnergy) * 100;
        energyBarFill.style.width = `${energyPercentage}%`;
    }
}

/**
 * Check achievements and unlock if conditions are met
 */
function checkAchievements() {
    // Skip if achievements aren't loaded yet
    if (!gameState.achievements || !Array.isArray(gameState.achievements)) {
        return;
    }
    
    // Check each achievement's conditions
    gameState.achievements.forEach(achievement => {
        // Skip already unlocked achievements
        if (achievement.unlocked) {
            return;
        }
        
        let conditionsMet = false;
        
        // Handle different achievement types
        if (achievement.condition && achievement.condition.type === 'gold') {
            conditionsMet = gameState.gold >= achievement.condition.value;
        } else if (achievement.id) {
            // Check specific achievement conditions by ID
            switch (achievement.id) {
                case 'rich1':
                case 'rich2':
                case 'rich3':
                    if (achievement.condition && achievement.condition.type === 'gold') {
                        conditionsMet = gameState.gold >= achievement.condition.value;
                    }
                    break;
                    
                case 'first_job':
                    conditionsMet = gameState.jobsHeld && gameState.jobsHeld.length > 0;
                    break;
                    
                case 'reach_age_30':
                    conditionsMet = gameState.age >= 30;
                    break;
                    
                case 'earn_1000_gold':
                    conditionsMet = gameState.statistics && gameState.statistics.totalGoldEarned >= 1000;
                    break;
                    
                case 'max_skill':
                    // Check if any skill has reached max level
                    conditionsMet = Object.values(gameState.skills).some(skill => {
                        const skillLevel = typeof skill === 'object' ? skill.level : skill;
                        return skillLevel >= 10;
                    });
                    break;
                    
                default:
                    // No specific check for this achievement ID
                    conditionsMet = false;
            }
        }
        
        if (conditionsMet) {
            achievement.unlocked = true;
            
            // Add to unlocked achievements array
            if (!gameState.unlockedAchievements) {
                gameState.unlockedAchievements = [];
            }
            gameState.unlockedAchievements.push(achievement.id);
            
            // Log the achievement
            if (typeof window.logEvent === 'function') {
                window.logEvent(`Achievement Unlocked: ${achievement.name}`, 'achievement');
            }
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification("Achievement Unlocked", achievement.name, "success");
            }
        }
    });
}

// -------------------------------------------------------------------------
// Export and Global Registration
// -------------------------------------------------------------------------

// Make all functions available globally for non-module scripts
window.getDefaultGameState = getDefaultGameState;
window.initializeGameState = initializeGameState;
window.saveGameState = saveGameState;
window.loadGameState = loadGameState;
window.resetGameState = resetGameState;
window.startAutoSave = startAutoSave;
window.stopAutoSave = stopAutoSave;
window.loadGameData = loadGameData;
window.setupGameSystems = setupGameSystems;
window.initializeUI = initializeUI;
window.gameLoop = gameLoop;
window.startGameLoop = startGameLoop;
window.regenerateEnergy = regenerateEnergy;
window.advanceDay = advanceDay;
window.updateDaySeasonDisplay = updateDaySeasonDisplay;
window.calculateMortality = calculateMortality;
window.getLifestyleKFactorModifier = getLifestyleKFactorModifier;
window.checkForNaturalDeath = checkForNaturalDeath;
window.handlePlayerDeath = handlePlayerDeath;
window.handleRetirement = handleRetirement;
window.saveMultipliersFromCurrentLife = saveMultipliersFromCurrentLife;
window.startNewLife = startNewLife;
window.applyPreviousLifeMultipliers = applyPreviousLifeMultipliers;
window.updateEnergyDisplay = updateEnergyDisplay;
window.updateJobProgressBar = updateJobProgressBar;
window.updateSkillProgressBar = updateSkillProgressBar;
window.checkAchievements = checkAchievements;

console.log("core.js - Fully integrated core system loaded successfully");

// Export functions for ES module usage
export {
    getDefaultGameState,
    initializeGameState,
    saveGameState,
    loadGameState,
    resetGameState,
    startAutoSave,
    stopAutoSave,
    loadGameData,
    setupGameSystems,
    initializeUI,
    gameLoop,
    startGameLoop,
    regenerateEnergy,
    advanceDay,
    updateDaySeasonDisplay,
    calculateMortality,
    getLifestyleKFactorModifier,
    checkForNaturalDeath,
    handlePlayerDeath,
    handleRetirement,
    saveMultipliersFromCurrentLife,
    startNewLife,
    applyPreviousLifeMultipliers,
    updateEnergyDisplay,
    updateJobProgressBar,
    updateSkillProgressBar,
    checkAchievements
};