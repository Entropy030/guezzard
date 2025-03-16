// ============== game-skills.js - Skills Management ==============
import { GameEvents } from './game-state.js';
import GameData from './game-data.js';
import UIManager from './ui-manager.js';

/**
 * Handles all skill-related functionality for the game
 */
const SkillManager = {
    // Current game state reference
    gameState: null,
    
    /**
     * Initialize the skill manager with the current game state
     * @param {Object} state - Current game state
     */
    initialize(state) {
        this.gameState = state;
    },
    
    /**
     * Switch to a different skill for training
     * @param {string} skillId - ID of the skill to train
     * @param {string} skillType - 'general' or 'professional'
     */
    switchTrainingSkill(skillId, skillType) {
        this.gameState.currentTrainingSkill = skillId;
        
        // Get skill name based on type
        let skillName = "";
        if (skillType === 'general') {
            skillName = GameData.skills.general[skillId].name;
        } else if (skillType === 'professional') {
            skillName = GameData.skills.professional[skillId].name;
        }
        
        UIManager.showNotification("Training Changed", `Now training ${skillName}.`);
        
        // Update UI
        GameEvents.publish('gameStateUpdated', { gameState: this.gameState });
    },
    
    /**
     * Process skill training for the day
     * @param {Object} state - Game state to process for
     * @param {string} skillId - The ID of the skill being trained
     * @param {number} trainingHours - Hours spent training
     */
    processSkillTraining(state, skillId, trainingHours) {
        // Base experience rate per hour
        const BASE_SKILL_EXP_RATE = 5;
        
        // Determine if it's a general or professional skill
        let skillObj = null;
        let skillType = "";
        
        if (skillId.startsWith("skill_")) {
            skillObj = state.generalSkills[skillId];
            skillType = "general";
        } else if (skillId.startsWith("professionalSkill_")) {
            skillObj = state.professionalSkills[skillId];
            skillType = "professional";
        }
        
        if (!skillObj) {
            console.error(`Skill not found: ${skillId}`);
            return;
        }
        
        // Calculate experience gain with Eternal Echo multiplier
        const echoMultiplier = state.skillEchoes[skillId] || 1;
        const expGain = trainingHours * BASE_SKILL_EXP_RATE * echoMultiplier;
        
        // Add experience
        skillObj.experience += expGain;
        
        // Check for level up
        this.checkSkillLevelUp(state, skillId, skillType);
    },
    
    /**
     * Check if a skill levels up
     * @param {Object} state - Game state to check for
     * @param {string} skillId - The ID of the skill
     * @param {string} skillType - "general" or "professional"
     */
    checkSkillLevelUp(state, skillId, skillType) {
        // Get skill object
        const skillObj = skillType === "general" 
            ? state.generalSkills[skillId] 
            : state.professionalSkills[skillId];
        
        if (!skillObj) return;
        
        // Calculate experience needed for next level
        // Each level requires more exp than the previous (8% increase per level)
        const expForNextLevel = 100 * Math.pow(1.08, skillObj.level);
        
        // Check if enough experience has been gained
        if (skillObj.experience >= expForNextLevel) {
            // Level up
            skillObj.experience -= expForNextLevel;
            skillObj.level++;
            
            // Track highest level for statistics
            if (skillObj.level > (state.maxSkillLevelReached || 0)) {
                state.maxSkillLevelReached = skillObj.level;
            }
            
            // Get skill name
            const skillName = skillType === "general" 
                ? GameData.skills.general[skillId].name 
                : GameData.skills.professional[skillId].name;
            
            // Publish skill level up event
            GameEvents.publish('skillLevelUp', {
                skillId,
                skillType,
                skillName,
                newLevel: skillObj.level
            });
            
            // Check if this level grants an Eternal Echo increase (every 10 levels)
            if (skillObj.level % 10 === 0 && skillObj.level <= 100) {
                this.updateEternalEchoMultiplier(state, skillId, skillObj.level / 10);
            }
            
            // Check for multiple level ups
            this.checkSkillLevelUp(state, skillId, skillType);
        }
    },
    
    /**
     * Update Eternal Echo multiplier for a skill
     * @param {Object} state - Game state to update
     * @param {string} skillId - The ID of the skill
     * @param {number} echoLevel - The echo level (1-10)
     */
    updateEternalEchoMultiplier(state, skillId, echoLevel) {
        // 10% bonus per 10 levels, capped at 100% (2x multiplier)
        const bonusMultiplier = 1 + (Math.min(echoLevel, 10) * 0.1);
        
        // Update the echo multiplier if it's higher than the current one
        if (!state.skillEchoes[skillId] || bonusMultiplier > state.skillEchoes[skillId]) {
            state.skillEchoes[skillId] = bonusMultiplier;
            
            // Show notification
            UIManager.showNotification("Eternal Echo Increased!", 
                `Your training in this skill will be ${Math.floor((bonusMultiplier - 1) * 100)}% faster in future lives!`);
        }
    },
    
    /**
     * Get the highest level skill
     * @param {Object} state - Game state to check
     * @returns {Object} - Highest level skill info
     */
    getHighestSkill(state) {
        let highestLevel = 0;
        let highestSkill = null;
        let highestType = null;
        
        // Check general skills
        for (const skillId in state.generalSkills) {
            const skillObj = state.generalSkills[skillId];
            if (skillObj.level > highestLevel) {
                highestLevel = skillObj.level;
                highestSkill = skillId;
                highestType = "general";
            }
        }
        
        // Check professional skills
        for (const skillId in state.professionalSkills) {
            const skillObj = state.professionalSkills[skillId];
            if (skillObj.level > highestLevel) {
                highestLevel = skillObj.level;
                highestSkill = skillId;
                highestType = "professional";
            }
        }
        
        if (!highestSkill) return { level: 1 };
        
        // Get skill name
        const skillName = highestType === "general" 
            ? GameData.skills.general[highestSkill].name 
            : GameData.skills.professional[highestSkill].name;
        
        return {
            id: highestSkill,
            type: highestType,
            name: skillName,
            level: highestLevel
        };
    }
};

export default SkillManager;
