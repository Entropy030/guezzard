// ============== game-lifestyle.js - Lifestyle Management ==============
import { GameEvents } from './game-state.js';
import GameData from './game-data.js';
import UIManager from './ui-manager.js';

/**
 * Handles all lifestyle-related functionality for the game
 */
const LifestyleManager = {
    // Current game state reference
    gameState: null,
    
    /**
     * Initialize the lifestyle manager with the current game state
     * @param {Object} state - Current game state
     */
    initialize(state) {
        this.gameState = state;
    },
    
    /**
     * Purchase a lifestyle upgrade
     * @param {string} category - Category type ('housing', 'transport', 'food')
     * @param {string} typeId - Type ID to purchase
     * @returns {boolean} - Whether the purchase was successful
     */
    purchaseLifestyleUpgrade(category, typeId) {
        try {
            let option = null;
            let currentTypeId = null;
            
            // Get current and new option based on category
            switch (category) {
                case 'housing':
                    option = GameData.lifestyle.housing[typeId];
                    currentTypeId = this.gameState.housingType;
                    break;
                case 'transport':
                    option = GameData.lifestyle.transport[typeId];
                    currentTypeId = this.gameState.transportType;
                    break;
                case 'food':
                    option = GameData.lifestyle.food[typeId];
                    currentTypeId = this.gameState.foodType;
                    break;
                default:
                    throw new Error(`Unknown lifestyle category: ${category}`);
            }
            
            if (!option) {
                UIManager.showNotification("Error", `Invalid ${category} option.`);
                return false;
            }
            
            // Check if already owned
            if (currentTypeId === typeId) {
                UIManager.showNotification("Already Owned", `You already have this ${category} option.`);
                return false;
            }
            
            // Check if player has enough kudos
            if (this.gameState.kudos < option.cost) {
                UIManager.showNotification("Cannot Afford", `You need ${option.cost} kudos to purchase this ${category}.`);
                return false;
            }
            
            // Check other requirements
            if (option.requirements && !GameData.meetsRequirements(option.requirements, this.gameState)) {
                UIManager.showNotification("Requirements Not Met", `You don't meet the requirements for this ${category}.`);
                return false;
            }
            
            // Purchase the upgrade
            this.gameState.kudos -= option.cost;
            
            // Apply the purchase based on category
            switch (category) {
                case 'housing':
                    this.gameState.housingType = typeId;
                    break;
                case 'transport':
                    this.gameState.transportType = typeId;
                    break;
                case 'food':
                    this.gameState.foodType = typeId;
                    break;
            }
            
            UIManager.showNotification("Purchased", `You've upgraded your ${category}!`);
            
            // Update UI
            GameEvents.publish('gameStateUpdated', { gameState: this.gameState });
            
            return true;
        } catch (error) {
            console.error(`Error purchasing ${category}:`, error);
            UIManager.showNotification("Error", `Something went wrong while purchasing ${category}.`);
            return false;
        }
    },
    
    /**
     * Calculate daily expenses based on lifestyle
     * @param {Object} state - Game state to calculate for
     * @returns {number} - Daily expenses
     */
    calculateDailyExpenses(state) {
        try {
            const housingCost = GameData.lifestyle.housing[state.housingType].cost;
            const transportCost = GameData.lifestyle.transport[state.transportType].cost;
            const foodCost = GameData.lifestyle.food[state.foodType].cost;
            
            return housingCost + transportCost + foodCost;
        } catch (error) {
            console.error("Error calculating daily expenses:", error);
            return 0;
        }
    },
    
    /**
     * Get mortality reduction from lifestyle choices
     * @param {Object} state - Game state to calculate for
     * @returns {number} - Total mortality reduction (0-1)
     */
    getLifestyleMortalityReduction(state) {
        try {
            const housingOption = GameData.lifestyle.housing[state.housingType] || { mortalityReduction: 0 };
            const foodOption = GameData.lifestyle.food[state.foodType] || { mortalityReduction: 0 };
            
            // Sum up reductions (can be negative for food)
            return housingOption.mortalityReduction + foodOption.mortalityReduction;
        } catch (error) {
            console.error("Error calculating lifestyle mortality reduction:", error);
            return 0;
        }
    },
    
    /**
     * Check if requirements are met for a lifestyle option
     * @param {Object} requirements - Requirements object
     * @param {Object} state - Game state to check against
     * @returns {boolean} - Whether requirements are met
     */
    meetsRequirements(requirements, state) {
        if (!requirements) return true;
        
        // Check kudos requirement
        if (requirements.kudos && state.kudos < requirements.kudos) {
            return false;
        }
        
        // Check housing requirement
        if (requirements.housing) {
            const requiredHousing = Array.isArray(requirements.housing) 
                ? requirements.housing 
                : [requirements.housing];
            
            if (!requiredHousing.includes(state.housing)) {
                return false;
            }
        }
        
        // Check career track completion requirement
        if (requirements.carrierTrackComplete) {
            const requiredTracks = Array.isArray(requirements.carrierTrackComplete)
                ? requirements.carrierTrackComplete
                : [requirements.carrierTrackComplete];
            
            for (const trackId of requiredTracks) {
                if (!state.completedCareerTracks.includes(trackId)) {
                    return false;
                }
            }
        }
        
        return true;
    }
};

export default LifestyleManager;
