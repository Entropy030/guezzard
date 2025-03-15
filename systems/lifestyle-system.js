// lifestyle-system.js - Comprehensive lifestyle management system
// Implements housing, transportation, and diet options with their effects

console.log("lifestyle-system.js - Loading lifestyle system");

// Constants for lifestyle system
const LIFESTYLE_CONSTANTS = {
    // Base costs and effects
    BASE_HOUSING_COST: 4,      // Base cost for housing per day
    BASE_TRANSPORT_COST: 2,    // Base cost for transportation per day
    BASE_DIET_COST: 3,         // Base cost for diet per day
    
    // Lifestyle effect multipliers (mortality reduction)
    HOUSING_MORTALITY_FACTOR: 0.15,    // How much housing affects mortality rate
    TRANSPORT_MORTALITY_FACTOR: 0.05,  // How much transportation affects mortality rate
    DIET_MORTALITY_FACTOR: 0.10,       // How much diet affects mortality rate
    
    // Time allocation effects (hours)
    BASE_SLEEP_HOURS: 8,               // Base sleep time required
    BASE_COMMUTE_HOURS: 2,             // Base commute time without transportation
    BASE_MEAL_HOURS: 3,                // Base meal time without diet improvements
};

/**
 * Initialize the lifestyle system
 */
export function initializeLifestyleSystem() {
    console.log("initializeLifestyleSystem() - Setting up lifestyle system");
    
    // Ensure lifestyle-related structures exist in game state
    ensureLifestyleStructures();
    
    // Make initial lifestyle selections if none exist
    setDefaultLifestyleChoices();
    
    // Calculate initial lifestyle effects
    calculateLifestyleEffects();
    
    console.log("Lifestyle system initialized successfully");
    return true;
}

/**
 * Ensure all necessary lifestyle-related structures exist in game state
 */
function ensureLifestyleStructures() {
    // Ensure lifestyle object exists
    if (!gameState.lifestyle) {
        gameState.lifestyle = {};
    }
    
    // Ensure lifestyle options object exists
    if (!gameState.lifestyleOptions) {
        gameState.lifestyleOptions = {
            housing: [],
            transportation: [],
            diet: []
        };
    }
    
    // Ensure lifestyle effects object exists
    if (!gameState.lifestyleEffects) {
        gameState.lifestyleEffects = {
            mortalityModifier: 1.0,
            timeAllocation: {
                sleep: LIFESTYLE_CONSTANTS.BASE_SLEEP_HOURS,
                commute: LIFESTYLE_CONSTANTS.BASE_COMMUTE_HOURS,
                meals: LIFESTYLE_CONSTANTS.BASE_MEAL_HOURS
            },
            satisfactionBonus: 0,
            costPerDay: 0
        };
    }
}

/**
 * Set default lifestyle choices if none exist
 */
function setDefaultLifestyleChoices() {
    // Set initial housing if not set
    if (!gameState.lifestyle.housing) {
        gameState.lifestyle.housing = "Shared Room";
    }
    
    // Set initial transportation if not set
    if (!gameState.lifestyle.transportation) {
        gameState.lifestyle.transportation = "Walking";
    }
    
    // Set initial diet if not set
    if (!gameState.lifestyle.diet) {
        gameState.lifestyle.diet = "Basic Food";
    }
}

/**
 * Define all available lifestyle options
 */
export function defineLifestyleOptions() {
    // Housing options
    gameState.lifestyleOptions.housing = [
        {
            id: "homeless",
            name: "Homeless",
            cost: 0,
            mortalityEffect: 0.2,      // Increases mortality rate by 20%
            comfortEffect: -0.2,       // Reduces comfort by 20%
            description: "Living on the streets. No rent, but significantly increases mortality."
        },
        {
            id: "shared_room",
            name: "Shared Room",
            cost: LIFESTYLE_CONSTANTS.BASE_HOUSING_COST,
            mortalityEffect: 0,        // Neutral effect on mortality
            comfortEffect: 0,          // Neutral effect on comfort
            description: "A shared room in a house. Basic but affordable.",
            requiredGold: 0
        },
        {
            id: "tiny_apartment",
            name: "Tiny Apartment",
            cost: LIFESTYLE_CONSTANTS.BASE_HOUSING_COST * 3,
            mortalityEffect: -0.05,    // Reduces mortality by 5%
            comfortEffect: 0.05,       // Increases comfort by 5%
            description: "A small studio apartment. Your own space, though cramped.",
            requiredGold: 200
        },
        {
            id: "apartment",
            name: "Apartment",
            cost: LIFESTYLE_CONSTANTS.BASE_HOUSING_COST * 8,
            mortalityEffect: -0.10,    // Reduces mortality by 10%
            comfortEffect: 0.10,       // Increases comfort by 10%
            description: "A comfortable apartment with separate rooms.",
            requiredGold: 1000
        },
        {
            id: "townhouse",
            name: "Townhouse",
            cost: LIFESTYLE_CONSTANTS.BASE_HOUSING_COST * 15,
            mortalityEffect: -0.15,    // Reduces mortality by 15%
            comfortEffect: 0.15,       // Increases comfort by 15%
            description: "A multi-level townhouse with plenty of space.",
            requiredGold: 5000
        },
        {
            id: "luxury_condo",
            name: "Luxury Condo",
            cost: LIFESTYLE_CONSTANTS.BASE_HOUSING_COST * 30,
            mortalityEffect: -0.20,    // Reduces mortality by 20%
            comfortEffect: 0.20,       // Increases comfort by 20%
            description: "An upscale condominium with amenities.",
            requiredGold: 15000
        },
        {
            id: "mansion",
            name: "Mansion",
            cost: LIFESTYLE_CONSTANTS.BASE_HOUSING_COST * 50,
            mortalityEffect: -0.25,    // Reduces mortality by 25%
            comfortEffect: 0.25,       // Increases comfort by 25%
            description: "A large mansion with extensive grounds and facilities.",
            requiredGold: 50000
        },
        {
            id: "castle",
            name: "Castle",
            cost: LIFESTYLE_CONSTANTS.BASE_HOUSING_COST * 100,
            mortalityEffect: -0.30,    // Reduces mortality by 30%
            comfortEffect: 0.30,       // Increases comfort by 30%
            description: "Your own medieval castle, fully modernized.",
            requiredGold: 200000
        }
    ];
    
    // Transportation options
    gameState.lifestyleOptions.transportation = [
        {
            id: "walking",
            name: "Walking",
            cost: 0,
            commuteTimeEffect: 0,      // No reduction in commute time
            mortalityEffect: 0,        // Neutral effect on mortality (exercise is good!)
            description: "Getting around on foot. Free but time-consuming."
        },
        {
            id: "bicycle",
            name: "Bicycle",
            cost: LIFESTYLE_CONSTANTS.BASE_TRANSPORT_COST,
            commuteTimeEffect: -0.25,  // Reduces commute time by 25%
            mortalityEffect: -0.03,    // Reduces mortality by 3% (exercise benefit)
            description: "Cycling to get around. Faster than walking and provides exercise.",
            requiredGold: 100
        },
        {
            id: "public_transit",
            name: "Public Transit",
            cost: LIFESTYLE_CONSTANTS.BASE_TRANSPORT_COST * 3,
            commuteTimeEffect: -0.40,  // Reduces commute time by 40%
            mortalityEffect: 0,        // Neutral effect on mortality
            description: "Using buses, subways, and other public transportation.",
            requiredGold: 300
        },
        {
            id: "car",
            name: "Car",
            cost: LIFESTYLE_CONSTANTS.BASE_TRANSPORT_COST * 8,
            commuteTimeEffect: -0.60,  // Reduces commute time by 60%
            mortalityEffect: 0.01,     // Slight increase in mortality (stress, accidents)
            description: "Your own car for convenient travel.",
            requiredGold: 2000
        },
        {
            id: "luxury_car",
            name: "Luxury Car",
            cost: LIFESTYLE_CONSTANTS.BASE_TRANSPORT_COST * 15,
            commuteTimeEffect: -0.65,  // Reduces commute time by 65%
            mortalityEffect: -0.02,    // Small reduction in mortality (safety features)
            description: "A high-end vehicle with comfort and safety features.",
            requiredGold: 10000
        },
        {
            id: "helicopter",
            name: "Helicopter",
            cost: LIFESTYLE_CONSTANTS.BASE_TRANSPORT_COST * 50,
            commuteTimeEffect: -0.85,  // Reduces commute time by 85%
            mortalityEffect: 0.02,     // Slight increase in mortality (risk)
            description: "A private helicopter for rapid transit. Requires Castle housing.",
            requiredHousing: "castle",
            requiredGold: 100000
        },
        {
            id: "teleportation",
            name: "Teleportation",
            cost: LIFESTYLE_CONSTANTS.BASE_TRANSPORT_COST * 100,
            commuteTimeEffect: -1.0,   // Eliminates commute time completely
            mortalityEffect: -0.05,    // Reduces mortality by 5% (no travel risks)
            description: "Cutting-edge teleportation technology. Requires completion of Physics and AI career tracks.",
            requiredCareerCompletion: ["theoretical_physics", "ai_evolution"],
            requiredGold: 500000
        }
    ];
    
    // Diet options
    gameState.lifestyleOptions.diet = [
        {
            id: "homeless_shelter",
            name: "Homeless Shelter",
            cost: 0,
            mealTimeEffect: 0.33,      // 4h for meals (33% increase from default 3h)
            mortalityEffect: 0.15,     // Increases mortality by 15%
            description: "Relying on homeless shelters and soup kitchens for food."
        },
        {
            id: "basic_food",
            name: "Basic Food",
            cost: LIFESTYLE_CONSTANTS.BASE_DIET_COST,
            mealTimeEffect: 0,         // Default 3h for meals
            mortalityEffect: 0.05,     // Slight increase in mortality (poor nutrition)
            description: "Simple, inexpensive meals with minimal nutrition.",
            requiredGold: 0
        },
        {
            id: "grocery_store",
            name: "Grocery Store",
            cost: LIFESTYLE_CONSTANTS.BASE_DIET_COST * 2.5,
            mealTimeEffect: -0.25,     // 2.25h for meals (25% decrease)
            mortalityEffect: -0.03,    // Small reduction in mortality
            description: "Regular grocery shopping with better food quality.",
            requiredGold: 300
        },
        {
            id: "meal_delivery",
            name: "Meal Delivery",
            cost: LIFESTYLE_CONSTANTS.BASE_DIET_COST * 6,
            mealTimeEffect: -0.33,     // 2h for meals (33% decrease)
            mortalityEffect: -0.05,    // Moderate reduction in mortality
            description: "Healthy prepared meals delivered to your door.",
            requiredGold: 1000
        },
        {
            id: "organic_market",
            name: "Organic Market",
            cost: LIFESTYLE_CONSTANTS.BASE_DIET_COST * 10,
            mealTimeEffect: -0.16,     // 2.5h for meals (cooking takes time!)
            mortalityEffect: -0.08,    // Significant reduction in mortality
            description: "Premium organic ingredients for home cooking.",
            requiredGold: 2000
        },
        {
            id: "personal_chef",
            name: "Personal Chef",
            cost: LIFESTYLE_CONSTANTS.BASE_DIET_COST * 25,
            mealTimeEffect: -0.66,     // 1h for meals (66% decrease)
            mortalityEffect: -0.15,    // Major reduction in mortality
            description: "A dedicated chef preparing optimized meals.",
            requiredGold: 10000
        },
        {
            id: "nutrient_optimization",
            name: "Nutrient Optimization",
            cost: LIFESTYLE_CONSTANTS.BASE_DIET_COST * 50,
            mealTimeEffect: -0.83,     // 0.5h for meals (83% decrease)
            mortalityEffect: -0.20,    // Maximum reduction in mortality
            description: "Scientifically optimized nutrient intake. Requires completion of the Theoretical Physics career.",
            requiredCareerCompletion: ["theoretical_physics"],
            requiredGold: 50000
        }
    ];
}

/**
 * Calculate lifestyle effects based on current choices
 */
export function calculateLifestyleEffects() {
    // Skip if lifestyle not initialized
    if (!gameState.lifestyle) {
        return;
    }
    
    // Ensure options are defined
    if (!gameState.lifestyleOptions || 
        !gameState.lifestyleOptions.housing || 
        gameState.lifestyleOptions.housing.length === 0) {
        defineLifestyleOptions();
    }

    // Default starting values
    let mortalityModifier = 1.0;
    let satisfactionBonus = 0;
    let costPerDay = 0;
    
    // Time allocation defaults
    let sleepHours = LIFESTYLE_CONSTANTS.BASE_SLEEP_HOURS;
    let commuteHours = LIFESTYLE_CONSTANTS.BASE_COMMUTE_HOURS;
    let mealHours = LIFESTYLE_CONSTANTS.BASE_MEAL_HOURS;
    
    // Apply housing effects
    const housing = getLifestyleOptionDetails('housing', gameState.lifestyle.housing);
    if (housing) {
        mortalityModifier += housing.mortalityEffect * LIFESTYLE_CONSTANTS.HOUSING_MORTALITY_FACTOR;
        satisfactionBonus += housing.comfortEffect;
        costPerDay += housing.cost;
    }
    
    // Apply transportation effects
    const transportation = getLifestyleOptionDetails('transportation', gameState.lifestyle.transportation);
    if (transportation) {
        mortalityModifier += transportation.mortalityEffect * LIFESTYLE_CONSTANTS.TRANSPORT_MORTALITY_FACTOR;
        
        // Adjust commute time
        if (transportation.commuteTimeEffect) {
            commuteHours = LIFESTYLE_CONSTANTS.BASE_COMMUTE_HOURS * (1 + transportation.commuteTimeEffect);
            // Ensure minimum of 0 hours
            commuteHours = Math.max(0, commuteHours);
        }
        
        satisfactionBonus += transportation.comfortEffect || 0;
        costPerDay += transportation.cost;
    }
    
    // Apply diet effects
    const diet = getLifestyleOptionDetails('diet', gameState.lifestyle.diet);
    if (diet) {
        mortalityModifier += diet.mortalityEffect * LIFESTYLE_CONSTANTS.DIET_MORTALITY_FACTOR;
        
        // Adjust meal time
        if (diet.mealTimeEffect) {
            mealHours = LIFESTYLE_CONSTANTS.BASE_MEAL_HOURS * (1 + diet.mealTimeEffect);
            // Ensure minimum of 0.5 hours
            mealHours = Math.max(0.5, mealHours);
        }
        
        satisfactionBonus += diet.comfortEffect || 0;
        costPerDay += diet.cost;
    }
    
    // Ensure mortality modifier doesn't go too low
    mortalityModifier = Math.max(0.25, mortalityModifier);
    
    // Store calculated effects
    gameState.lifestyleEffects = {
        mortalityModifier,
        timeAllocation: {
            sleep: sleepHours,
            commute: commuteHours,
            meals: mealHours
        },
        satisfactionBonus,
        costPerDay
    };
    
    // Update time allocation if that system is initialized
    updateTimeAllocation();
    
    return gameState.lifestyleEffects;
}

/**
 * Get details for a specific lifestyle option
 * @param {string} category - Category (housing, transportation, diet)
 * @param {string} optionName - Option name
 * @returns {object|null} - Option details or null if not found
 */
function getLifestyleOptionDetails(category, optionName) {
    // Skip if not initialized
    if (!gameState.lifestyleOptions || !gameState.lifestyleOptions[category]) {
        return null;
    }
    
    // Find the option
    return gameState.lifestyleOptions[category].find(option => 
        option.name === optionName || option.id === optionName
    );
}

/**
 * Make a lifestyle selection
 * @param {string} category - Category (housing, transportation, diet)
 * @param {string} optionId - Option ID to select
 * @returns {boolean} - Success/failure
 */
export function selectLifestyleOption(category, optionId) {
    console.log(`selectLifestyleOption() - Selecting ${optionId} for ${category}`);
    
    // Skip if not initialized
    if (!gameState.lifestyle || !gameState.lifestyleOptions || !gameState.lifestyleOptions[category]) {
        console.error(`selectLifestyleOption() - Lifestyle system not properly initialized`);
        return false;
    }
    
    // Find the option
    const option = gameState.lifestyleOptions[category].find(opt => opt.id === optionId);
    
    if (!option) {
        console.error(`selectLifestyleOption() - Option ${optionId} not found in ${category}`);
        return false;
    }
    
    // Check requirements
    if (!checkLifestyleRequirements(option)) {
        console.warn(`selectLifestyleOption() - Requirements not met for ${optionId}`);
        
        if (typeof window.displayNotification === 'function') {
            window.displayNotification(`Requirements not met for ${option.name}`, "error");
        }
        
        return false;
    }
    
    // Make the selection
    gameState.lifestyle[category] = option.name;
    
    // Recalculate effects
    calculateLifestyleEffects();
    
    // Log the change
    if (typeof window.logEvent === 'function') {
        window.logEvent(`You've upgraded your ${category} to ${option.name}.`, 'lifestyle');
    }
    
    // Update UI
    updateLifestyleDisplay();
    
    return true;
}

/**
 * Check if player meets requirements for a lifestyle option
 * @param {object} option - Lifestyle option to check
 * @returns {boolean} - Whether requirements are met
 */
function checkLifestyleRequirements(option) {
    // Check gold requirement
    if (option.requiredGold && gameState.gold < option.requiredGold) {
        return false;
    }
    
    // Check housing requirement
    if (option.requiredHousing && gameState.lifestyle.housing !== option.requiredHousing) {
        return false;
    }
    
    // Check career completion requirement
    if (option.requiredCareerCompletion && Array.isArray(option.requiredCareerCompletion)) {
        for (const careerTrackId of option.requiredCareerCompletion) {
            // Check if player has completed this career track
            // This is a simplified check - you may need more complex logic based on your career system
            const highestTier = getHighestCompletedTier(careerTrackId);
            if (highestTier < 6) { // Assuming tier 6 is max for each career
                return false;
            }
        }
    }
    
    return true;
}

/**
 * Get highest completed tier for a career track
 * @param {string} careerTrackId - Career track ID
 * @returns {number} - Highest completed tier (0 if none)
 */
function getHighestCompletedTier(careerTrackId) {
    // Skip if job levels not initialized
    if (!gameState.jobLevels) {
        return 0;
    }
    
    // Find all jobs in this career track
    let highestTier = 0;
    
    // Check all organizations in the game state
    if (gameState.organizations) {
        for (const org of gameState.organizations) {
            if (org.id === careerTrackId) {
                // Found the career track, check job levels
                for (const job of org.jobs || []) {
                    const jobLevel = gameState.jobLevels[job.id] || 0;
                    
                    // If job level is high enough (e.g., 50+ out of 100), consider the tier completed
                    if (jobLevel >= 50) {
                        const tier = job.tiers && job.tiers.length > 0 ? job.tiers[0].tier : 0;
                        highestTier = Math.max(highestTier, tier);
                    }
                }
            }
        }
    }
    
    return highestTier;
}

/**
 * Update time allocation based on lifestyle choices
 */
function updateTimeAllocation() {
    // Skip if time allocation system not defined
    if (!gameState.timeAllocation) {
        return;
    }
    
    // Apply lifestyle effects to time allocation
    if (gameState.lifestyleEffects && gameState.lifestyleEffects.timeAllocation) {
        const timeEffects = gameState.lifestyleEffects.timeAllocation;
        
        // Update time allocation directly
        gameState.timeAllocation.sleeping = timeEffects.sleep;
        gameState.timeAllocation.traveling = timeEffects.commute;
        gameState.timeAllocation.cooking = timeEffects.meals;
        
        // Recalculate free time (this depends on your time allocation system's structure)
        recalculateFreeTime();
    }
}

/**
 * Recalculate free time based on fixed deductions
 */
function recalculateFreeTime() {
    // Skip if time allocation not initialized
    if (!gameState.timeAllocation) {
        return;
    }
    
    // Calculate total time spent on fixed activities
    const totalFixedTime = (
        (gameState.timeAllocation.sleeping || 8) +
        (gameState.timeAllocation.traveling || 2) +
        (gameState.timeAllocation.cooking || 3) +
        (gameState.timeAllocation.cleaning || 0.5)
    );
    
    // Calculate time spent on active activities
    const totalActiveTime = (
        (gameState.timeAllocation.working || 5) +
        (gameState.timeAllocation.training || 3)
    );
    
    // Calculate free time (24 hours - fixed - active)
    const freeTime = 24 - totalFixedTime - totalActiveTime;
    
    // Update free time (ensure it's not negative)
    gameState.timeAllocation.freeTime = Math.max(0, freeTime);
}

/**
 * Update the lifestyle display
 */
function updateLifestyleDisplay() {
    // Check if the core UI update function exists
    if (typeof window.updateLifestylePanel === 'function') {
        window.updateLifestylePanel();
        return;
    }
    
    // Fallback to updating lifestyle stats directly
    if (typeof window.updateLifestyleStats === 'function') {
        window.updateLifestyleStats();
    }
}

/**
 * Get a list of available options for a category
 * @param {string} category - Category (housing, transportation, diet)
 * @returns {Array} - List of available options with availability info
 */
export function getAvailableLifestyleOptions(category) {
    // Skip if not initialized
    if (!gameState.lifestyleOptions || !gameState.lifestyleOptions[category]) {
        return [];
    }
    
    // Get all options with availability info
    return gameState.lifestyleOptions[category].map(option => ({
        ...option,
        available: checkLifestyleRequirements(option),
        current: gameState.lifestyle[category] === option.name
    }));
}

/**
 * Get the lifestyle mortality modifier
 * @returns {number} - Current mortality modifier
 */
export function getLifestyleMortalityModifier() {
    if (!gameState.lifestyleEffects) {
        calculateLifestyleEffects();
    }
    
    return gameState.lifestyleEffects.mortalityModifier;
}

/**
 * Apply daily lifestyle costs
 * Called from the game loop during day advancement
 */
export function applyLifestyleCosts() {
    // Skip if lifestyle effects not calculated
    if (!gameState.lifestyleEffects) {
        return;
    }
    
    // Get daily cost
    const dailyCost = gameState.lifestyleEffects.costPerDay;
    
    // Deduct from gold
    if (dailyCost > 0) {
        gameState.gold -= dailyCost;
        
        // Ensure gold doesn't go negative
        if (gameState.gold < 0) {
            // If can't afford lifestyle, downgrade to cheapest options
            downgradeLifestyleIfNeeded();
        }
    }
}

/**
 * Downgrade lifestyle if player can't afford current options
 */
function downgradeLifestyleIfNeeded() {
    // Set gold back to 0
    gameState.gold = 0;
    
    // Downgrade housing to cheapest option
    const cheapestHousing = gameState.lifestyleOptions.housing.find(option => option.cost === 0);
    if (cheapestHousing) {
        gameState.lifestyle.housing = cheapestHousing.name;
    }
    
    // Downgrade transportation to cheapest option
    const cheapestTransport = gameState.lifestyleOptions.transportation.find(option => option.cost === 0);
    if (cheapestTransport) {
        gameState.lifestyle.transportation = cheapestTransport.name;
    }
    
    // Downgrade diet to cheapest option
    const cheapestDiet = gameState.lifestyleOptions.diet.find(option => option.cost === 0);
    if (cheapestDiet) {
        gameState.lifestyle.diet = cheapestDiet.name;
    }
    
    // Recalculate effects
    calculateLifestyleEffects();
    
    // Log the change
    if (typeof window.logEvent === 'function') {
        window.logEvent("You can't afford your lifestyle! You've been downgraded to the cheapest options.", 'lifestyle');
    }
    
    // Update UI
    updateLifestyleDisplay();
}

// Make functions available globally
window.initializeLifestyleSystem = initializeLifestyleSystem;
window.defineLifestyleOptions = defineLifestyleOptions;
window.calculateLifestyleEffects = calculateLifestyleEffects;
window.selectLifestyleOption = selectLifestyleOption;
window.getAvailableLifestyleOptions = getAvailableLifestyleOptions;
window.getLifestyleMortalityModifier = getLifestyleMortalityModifier;
window.applyLifestyleCosts = applyLifestyleCosts;

console.log("lifestyle-system.js - Lifestyle system loaded successfully");

// Export functions for ES module usage
export {
    initializeLifestyleSystem,
    defineLifestyleOptions,
    calculateLifestyleEffects,
    selectLifestyleOption,
    getAvailableLifestyleOptions,
    getLifestyleMortalityModifier,
    applyLifestyleCosts
};
