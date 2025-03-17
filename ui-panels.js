/**
 * UI Panels - Handles specific UI panels for the game
 * This module contains UI components for careers, skills, lifestyle, and achievements
 */

import GameData from './game-data.js';
import { GameEvents } from './game-state.js';
import { DOMCache } from './ui-manager.js';

// Helper functions shared across UI panel components
export const UIHelpers = {
    /**
     * Create a progress bar element
     * @param {number} current - Current value
     * @param {number} max - Maximum value
     * @param {boolean} showText - Whether to show text in the progress bar
     * @returns {HTMLElement} - Progress bar container element
     */
    createProgressBar(current, max, showText = true) {
        const container = document.createElement('div');
        container.className = 'progress-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        const percent = Math.min(100, (current / max) * 100);
        progressBar.style.width = `${percent}%`;
        
        container.appendChild(progressBar);
        
        if (showText) {
            const text = document.createElement('span');
            text.className = 'progress-value';
            text.textContent = `${Math.floor(current)}/${Math.floor(max)}`;
            container.appendChild(text);
        }
        
        return container;
    },
    
    /**
     * Check if job requirements are met
     * @param {Object} tier - Job tier object
     * @param {Object} gameState - Current game state
     * @returns {boolean} - Whether requirements are met
     */
    checkJobRequirements(tier, gameState) {
        try {
            // If it's the current job, requirements are already met
            if (gameState.currentJob === tier.id) {
                return true;
            }
            
            // If no requirements, return true
            if (!tier.requirements) {
                return true;
            }
            
            // Check previous job requirement
            if (tier.requirements.previousJob && 
                (gameState.currentJob !== tier.requirements.previousJob || 
                 gameState.jobLevel < tier.requirements.previousJobLevel)) {
                return false;
            }
            
            // Check general skill requirements
            if (tier.requirements.generalSkills) {
                for (const skillId in tier.requirements.generalSkills) {
                    const requiredLevel = tier.requirements.generalSkills[skillId];
                    const playerLevel = gameState.generalSkills[skillId]?.level || 0;
                    
                    if (playerLevel < requiredLevel) {
                        return false;
                    }
                }
            }
            
            // Check professional skill requirements
            if (tier.requirements.professionalSkills) {
                for (const skillId in tier.requirements.professionalSkills) {
                    const requiredLevel = tier.requirements.professionalSkills[skillId];
                    const playerLevel = gameState.professionalSkills[skillId]?.level || 0;
                    
                    if (playerLevel < requiredLevel) {
                        return false;
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error("Error checking job requirements:", error);
            return false;
        }
    },
    
    /**
     * Calculate experience needed for next level (skills)
     * @param {number} currentLevel - Current level 
     * @returns {number} - Experience needed for next level
     */
    calculateExpForSkillLevel(currentLevel) {
        return 100 * Math.pow(1.08, currentLevel);
    },
    
    /**
     * Calculate experience needed for next job level
     * @param {number} currentLevel - Current level
     * @returns {number} - Experience needed for next level
     */
    calculateExpForJobLevel(currentLevel) {
        return 100 * Math.pow(1.1, currentLevel);
    }
};

// Import the specific UI panels
import { CareerUI } from './ui-career.js';
import { SkillsUI } from './ui-skills.js';
import { LifestyleUI } from './ui-lifestyle.js';
import { AchievementsUI } from './ui-achievements.js';

// Export all UI panels
export { CareerUI, SkillsUI, LifestyleUI, AchievementsUI };

// Force panel refresh on first load
export function initializePanels(gameState) {
    CareerUI.needsRefresh = true;
    SkillsUI.needsRefresh = true;
    LifestyleUI.needsRefresh = true;
    AchievementsUI.needsRefresh = true;
    
    CareerUI.updateCareerPanel(gameState);
    SkillsUI.updateSkillsPanel(gameState);
    LifestyleUI.updateLifestylePanel(gameState);
    AchievementsUI.updateAchievementsPanel(gameState);
}