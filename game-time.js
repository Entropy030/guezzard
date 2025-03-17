// ============== game-time.js - Time Management ==============
import { GameEvents } from './game-state.js';
import GameData from './game-data.js';

/**
 * Handles all time-related functionality for the game
 */
const TimeManager = {
    // Current game state reference
    gameState: null,
    
    /**
     * Initialize the time manager with the current game state
     * @param {Object} state - Current game state
     */
    initialize(state) {
        this.gameState = state;
    },
    
    /**
     * Set work hours based on a percentage of allocatable time
     * @param {number} percent - Percentage of allocatable time
     */
    setWorkHoursByPercent(percent) {
        const timeInfo = this.calculateAllocatableHours(this.gameState);
        const newHours = Math.round((percent / 100) * timeInfo.allocatableHours * 2) / 2; // Round to nearest 0.5
        
        // Ensure total hours don't exceed allocatable time
        const totalPossibleHours = Math.min(newHours, timeInfo.allocatableHours);
        const remainingHours = timeInfo.allocatableHours - totalPossibleHours;
        
        // Adjust training hours if needed
        const trainingHours = Math.min(this.gameState.trainingHours, remainingHours);
        
        this.gameState.workHours = totalPossibleHours;
        this.gameState.trainingHours = trainingHours;
        
        // Update UI
        GameEvents.publish('timeAllocationChanged', { gameState: this.gameState });
    },
    
    /**
     * Set training hours based on a percentage of allocatable time
     * @param {number} percent - Percentage of allocatable time
     */
    setTrainingHoursByPercent(percent) {
        const timeInfo = this.calculateAllocatableHours(this.gameState);
        const newHours = Math.round((percent / 100) * timeInfo.allocatableHours * 2) / 2; // Round to nearest 0.5
        
        this.gameState.trainingHours = Math.max(0, Math.min(newHours, timeInfo.allocatableHours - this.gameState.workHours));
        
        // Update UI
        GameEvents.publish('timeAllocationChanged', { gameState: this.gameState });
    },
    
    /**
     * Adjust work hours by the specified amount
     * @param {number} amount - Amount to adjust by
     */
    adjustWorkHours(amount) {
        const timeInfo = this.calculateAllocatableHours(this.gameState);
        const newHours = this.gameState.workHours + amount;
        
        // Ensure we don't go below 0 or exceed allocatable hours
        this.gameState.workHours = Math.max(0, Math.min(newHours, timeInfo.allocatableHours - this.gameState.trainingHours));
        
        // Update UI
        GameEvents.publish('timeAllocationChanged', { gameState: this.gameState });
    },
    
    /**
     * Adjust training hours by the specified amount
     * @param {number} amount - Amount to adjust by
     */
    adjustTrainingHours(amount) {
        const timeInfo = this.calculateAllocatableHours(this.gameState);
        const newHours = this.gameState.trainingHours + amount;
        
        // Ensure we don't go below 0 or exceed allocatable hours
        this.gameState.trainingHours = Math.max(0, Math.min(newHours, timeInfo.allocatableHours - this.gameState.workHours));
        
        // Update UI
        GameEvents.publish('timeAllocationChanged', { gameState: this.gameState });
    },
    
    /**
     * Calculate allocatable hours per day
     * @param {Object} state - Game state to calculate for
     * @returns {Object} - Time allocation details
     */
    calculateAllocatableHours(state) {
        try {
            // Apply lifestyle modifiers to fixed time costs
            const housingOption = GameData.lifestyle.housing[state.housingType];
            const transportOption = GameData.lifestyle.transport[state.transportType];
            const foodOption = GameData.lifestyle.food[state.foodType];
            
            if (!housingOption || !transportOption || !foodOption) {
                throw new Error("Invalid lifestyle options");
            }
            
            const adjustedSleepHours = state.sleepHours * (1 - housingOption.sleepTimeReduction);
            const adjustedCommuteHours = state.commuteHours * (1 - transportOption.commuteTimeReduction);
            const adjustedMealHours = state.mealHours * (1 - foodOption.mealTimeReduction);
            
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
    },
    
    /**
     * Validate time allocation to ensure it fits within allocatable hours
     * @param {Object} state - Game state to validate
     * @returns {Object} - Time allocation info
     */
    validateTimeAllocation(state) {
        if (!state) state = this.gameState;
        
        // Calculate allocatable time
        const timeInfo = this.calculateAllocatableHours(state);
        
        // Check if time allocation is valid
        const totalAllocatedHours = state.workHours + state.trainingHours;
        if (totalAllocatedHours > timeInfo.allocatableHours) {
            // Automatically adjust work hours to fit
            state.workHours = Math.max(0, timeInfo.allocatableHours - state.trainingHours);
            
            if (state.workHours + state.trainingHours > timeInfo.allocatableHours) {
                state.trainingHours = Math.max(0, timeInfo.allocatableHours - state.workHours);
            }
            
            // Publish time allocation changed event
            GameEvents.publish('timeAllocationChanged', { gameState: state });
        }
        
        return timeInfo;
    }
};

export default TimeManager;
