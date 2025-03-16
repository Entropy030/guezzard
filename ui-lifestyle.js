/**
 * UI Lifestyle - Handles lifestyle panel UI
 */

import GameData from './game-data.js';
import { GameEvents } from './game-state.js';
import { DOMCache } from './ui-manager.js';

export const LifestyleUI = {
    // Track if we need to rebuild the lifestyle panel
    needsRefresh: true,
    
    /**
     * Update lifestyle panel with housing, transportation, and food options
     * @param {Object} gameState - Current game state
     */
    updateLifestylePanel(gameState) {
        try {
            this.updateHousingOptions(gameState);
            this.updateTransportOptions(gameState);
            this.updateFoodOptions(gameState);
            
            // Reset flag after update
            this.needsRefresh = false;
        } catch (error) {
            console.error("Error updating lifestyle panel:", error);
        }
    },
    
    /**
     * Update housing options
     * @param {Object} gameState - Current game state
     */
    updateHousingOptions(gameState) {
        const container = DOMCache.get('housing-options-container');
        if (!container) return;
        
        // Only rebuild if needed
        if (container.children.length === 0 || this.needsRefresh) {
            container.innerHTML = '';
            
            // Add each housing option
            for (const housingId in GameData.lifestyle.housing) {
                const housingData = GameData.lifestyle.housing[housingId];
                const isCurrent = gameState.housingType === housingId;
                
                // Create housing element
                const housingElement = this.createLifestyleOptionElement(
                    housingId,
                    housingData.name,
                    housingData.cost,
                    [
                        `Sleep: -${(housingData.sleepTimeReduction * 100).toFixed(0)}%`,
                        `Mortality: ${housingData.mortalityReduction > 0 ? '-' : '+'}${Math.abs(housingData.mortalityReduction * 100).toFixed(0)}%`
                    ],
                    isCurrent,
                    'housing',
                    this.canAffordLifestyleOption(housingData.cost, gameState),
                    this.meetsRequirements(housingData.requirements, gameState)
                );
                
                container.appendChild(housingElement);
            }
        } else {
            // Just update affordability and current status
            this.updateLifestyleOptionStatus(container, 'housing', gameState);
        }
    },
    
    /**
     * Update transportation options
     * @param {Object} gameState - Current game state
     */
    updateTransportOptions(gameState) {
        const container = DOMCache.get('transportation-options-container');
        if (!container) return;
        
        // Only rebuild if needed
        if (container.children.length === 0 || this.needsRefresh) {
            container.innerHTML = '';
            
            // Add each transport option
            for (const transportId in GameData.lifestyle.transport) {
                const transportData = GameData.lifestyle.transport[transportId];
                const isCurrent = gameState.transportType === transportId;
                
                // Create transport element
                const transportElement = this.createLifestyleOptionElement(
                    transportId,
                    transportData.name,
                    transportData.cost,
                    [
                        `Commute: -${(transportData.commuteTimeReduction * 100).toFixed(0)}%`
                    ],
                    isCurrent,
                    'transport',
                    this.canAffordLifestyleOption(transportData.cost, gameState),
                    this.meetsRequirements(transportData.requirements, gameState)
                );
                
                container.appendChild(transportElement);
            }
        } else {
            // Just update affordability and current status
            this.updateLifestyleOptionStatus(container, 'transport', gameState);
        }
    },
    
    /**
     * Update food options
     * @param {Object} gameState - Current game state
     */
    updateFoodOptions(gameState) {
        const container = DOMCache.get('food-options-container');
        if (!container) return;
        
        // Only rebuild if needed
        if (container.children.length === 0 || this.needsRefresh) {
            container.innerHTML = '';
            
            // Add each food option
            for (const foodId in GameData.lifestyle.food) {
                const foodData = GameData.lifestyle.food[foodId];
                const isCurrent = gameState.foodType === foodId;
                
                // Create food element
                const foodElement = this.createLifestyleOptionElement(
                    foodId,
                    foodData.name,
                    foodData.cost,
                    [
                        `Meals: -${(foodData.mealTimeReduction * 100).toFixed(0)}%`,
                        `Mortality: ${foodData.mortalityReduction > 0 ? '-' : '+'}${Math.abs(foodData.mortalityReduction * 100).toFixed(0)}%`
                    ],
                    isCurrent,
                    'food',
                    this.canAffordLifestyleOption(foodData.cost, gameState),
                    this.meetsRequirements(foodData.requirements, gameState)
                );
                
                container.appendChild(foodElement);
            }
        } else {
            // Just update affordability and current status
            this.updateLifestyleOptionStatus(container, 'food', gameState);
        }
    },
    
    /**
     * Create a lifestyle option element
     * @param {string} id - The option ID
     * @param {string} name - The option name
     * @param {number} cost - The option cost
     * @param {Array} effects - Array of effect descriptions
     * @param {boolean} isCurrent - Whether this is the current option
     * @param {string} type - The type of lifestyle option (housing, transport, food)
     * @param {boolean} canAfford - Whether the player can afford this option
     * @param {boolean} meetsRequirements - Whether the player meets requirements
     * @returns {HTMLElement} - The lifestyle option element
     */
    createLifestyleOptionElement(id, name, cost, effects, isCurrent, type, canAfford, meetsRequirements) {
        const element = document.createElement('div');
        element.className = 'lifestyle-option';
        element.dataset.id = id;
        element.dataset.type = type;
        
        // Add current-lifestyle class if applicable
        if (isCurrent) {
            element.classList.add('current-lifestyle');
        }
        
        // Add locked-lifestyle class if cannot afford or doesn't meet requirements
        if (!canAfford || !meetsRequirements) {
            element.classList.add('locked-lifestyle');
        }
        
        // Create details section
        const details = document.createElement('div');
        details.className = 'lifestyle-details';
        
        // Option name
        const nameElement = document.createElement('div');
        nameElement.className = 'lifestyle-name';
        nameElement.textContent = name;
        details.appendChild(nameElement);
        
        // Option effects
        if (effects && effects.length > 0) {
            const effectsElement = document.createElement('div');
            effectsElement.className = 'lifestyle-effects';
            effectsElement.textContent = effects.join(' • ');
            details.appendChild(effectsElement);
        }
        
        element.appendChild(details);
        
        // Cost display
        const costElement = document.createElement('div');
        costElement.className = 'lifestyle-cost';
        costElement.textContent = `${cost} kudos/day`;
        element.appendChild(costElement);
        
        // Add purchase button if not current option
        if (!isCurrent) {
            const purchaseButton = document.createElement('button');
            purchaseButton.textContent = "Purchase";
            purchaseButton.disabled = !canAfford || !meetsRequirements;
            
            purchaseButton.addEventListener('click', () => {
                GameEvents.publish('purchaseLifestyle', { type, id });
            });
            
            element.appendChild(purchaseButton);
        }
        
        return element;
    },
    
    /**
     * Update lifestyle option status (affordability and current)
     * @param {HTMLElement} container - Container element
     * @param {string} type - Lifestyle type (housing, transport, food)
     * @param {Object} gameState - Current game state
     */
    updateLifestyleOptionStatus(container, type, gameState) {
        const options = container.querySelectorAll('.lifestyle-option');
        
        options.forEach(option => {
            const id = option.dataset.id;
            
            // Update current status
            const isCurrent = (
                (type === 'housing' && gameState.housingType === id) ||
                (type === 'transport' && gameState.transportType === id) ||
                (type === 'food' && gameState.foodType === id)
            );
            
            option.classList.toggle('current-lifestyle', isCurrent);
            
            // Update affordability if not current
            if (!isCurrent) {
                const optionData = (
                    type === 'housing' ? GameData.lifestyle.housing[id] :
                    type === 'transport' ? GameData.lifestyle.transport[id] :
                    GameData.lifestyle.food[id]
                );
                
                const canAfford = this.canAffordLifestyleOption(optionData.cost, gameState);
                const meetsRequirements = this.meetsRequirements(optionData.requirements, gameState);
                
                option.classList.toggle('locked-lifestyle', !canAfford || !meetsRequirements);
                
                const purchaseButton = option.querySelector('button');
                if (purchaseButton) {
                    purchaseButton.disabled = !canAfford || !meetsRequirements;
                }
            }
        });
    },
    
    /**
     * Check if player can afford a lifestyle option
     * @param {number} cost - The cost of the option
     * @param {Object} gameState - Current game state
     * @returns {boolean} - Whether the player can afford it
     */
    canAffordLifestyleOption(cost, gameState) {
        return gameState.kudos >= cost;
    },
    
    /**
     * Check if player meets requirements for a lifestyle option
     * @param {Object} requirements - Requirements object
     * @param {Object} gameState - Current game state
     * @returns {boolean} - Whether the player meets requirements
     */
    meetsRequirements(requirements, gameState) {
        if (!requirements) return true;
        
        // Check kudos requirement
        if (requirements.kudos && gameState.kudos < requirements.kudos) {
            return false;
        }
        
        // Check housing requirement
        if (requirements.housing) {
            const requiredHousing = Array.isArray(requirements.housing) 
                ? requirements.housing 
                : [requirements.housing];
            
            if (!requiredHousing.includes(gameState.housing)) {
                return false;
            }
        }
        
        // Check career track completion requirement
        if (requirements.carrierTrackComplete) {
            const requiredTracks = Array.isArray(requirements.carrierTrackComplete)
                ? requirements.carrierTrackComplete
                : [requirements.carrierTrackComplete];
            
            for (const trackId of requiredTracks) {
                if (!gameState.completedCareerTracks.includes(trackId)) {
                    return false;
                }
            }
        }
        
        return true;
    }
};
