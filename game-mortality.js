// ============== game-mortality.js - Mortality Management ==============
import { GameEvents } from './game-state.js';
import GameData from './game-data.js';
import LifestyleManager from './game-lifestyle.js';

/**
 * Handles mortality-related functionality for the game
 */
const MortalityManager = {
    // Current game state reference
    gameState: null,
    
    // Death handler function
    deathHandler: null,
    
    /**
     * Initialize the mortality manager with the current game state
     * @param {Object} state - Current game state
     */
    initialize(state) {
        this.gameState = state;
    },
    
    /**
     * Set the death handler function
     * @param {Function} handler - Function to call when player dies
     */
    setDeathHandler(handler) {
        this.deathHandler = handler;
    },
    
    /**
     * Process mortality check for the day
     * @param {Object} state - Game state to process for
     */
    processMortalityCheck(state) {
        // Only start mortality checks after age 30
        if (state.age < 30) return;
        
        // Calculate current mortality rate
        const dailyMortalityChance = this.calculateMortalityRate(state);
        
        // Check for death
        if (Math.random() < dailyMortalityChance) {
            this.handleDeath(state);
        }
    },
    
    /**
     * Calculate mortality rate based on age and lifestyle
     * @param {Object} state - Game state to calculate for
     * @returns {number} - Daily mortality rate (0-1)
     */
    calculateMortalityRate(state) {
        // Base parameters for mortality curve
        const BASE_MORTALITY = 1.0; // Max mortality rate (100%)
        const BASE_K_VALUE = 0.1;   // Steepness of the curve
        const MIDPOINT_AGE = 75;    // Age at which mortality rate is 50%
        
        try {
            // Get lifestyle modifier from LifestyleManager
            const mortalityReduction = LifestyleManager.getLifestyleMortalityReduction(state);
            
            // Calculate adjusted k-value with lifestyle modifiers
            const adjustedK = BASE_K_VALUE * (1 - mortalityReduction);
            
            // Calculate current mortality rate using sigmoid function
            const mortalityRate = BASE_MORTALITY * (1 / (1 + Math.exp(-adjustedK * (state.age - MIDPOINT_AGE))));
            
            // Convert to daily probability
            return mortalityRate / 365;
        } catch (error) {
            console.error("Error calculating mortality rate:", error);
            return 0;
        }
    },
    
    /**
     * Handle player death
     * @param {Object} state - Game state of the dying player
     */
    handleDeath(state) {
        // Call death handler if set
        if (this.deathHandler) {
            this.deathHandler(state);
        } else {
            console.error("Death handler not set for MortalityManager");
        }
    },
    
    /**
     * Calculate expected remaining lifespan
     * @param {Object} state - Game state to calculate for
     * @returns {number} - Expected remaining years (approximate)
     */
    calculateExpectedLifespan(state) {
        // Start with base life expectancy
        const BASE_LIFE_EXPECTANCY = 80;
        
        // Adjust for age
        const remainingYears = BASE_LIFE_EXPECTANCY - state.age;
        
        // Apply lifestyle modifiers
        const mortalityReduction = LifestyleManager.getLifestyleMortalityReduction(state);
        
        // Positive reductions extend life, negative reduce it
        const modifiedRemainingYears = remainingYears * (1 + mortalityReduction);
        
        return Math.max(0, modifiedRemainingYears);
    }
};

export default MortalityManager;
