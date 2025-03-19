// ============== game-career.js - Career Management ==============
import { GameEvents } from './game-state.js';
import GameData from './game-data.js';
import UIManager from './ui-manager.js';

/**
 * Handles all career-related functionality for the game
 */
const CareerManager = {
    // Current game state reference
    gameState: null,
    
    /**
     * Initialize the career manager with the current game state
     * @param {Object} state - Current game state
     */
    initialize(state) {
        this.gameState = state;
    },
    
// Modify the applyForJob function in game-career.js
// Replace or update the existing function with this version

/**
 * Apply for a new job
 * @param {string} jobId - ID of the job to apply for
 */
applyForJob(jobId) {
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
            UIManager.showNotification("Error", "Job not found. Please try again.");
            return;
        }
        
        // Check requirements
        if (!this.checkJobRequirements(jobTier, this.gameState)) {
            UIManager.showNotification("Cannot Apply", "You don't meet the requirements for this job.");
            return;
        }
        
        // Apply for the job
        this.gameState.currentCareerTrack = careerTrackId;
        this.gameState.currentJob = jobId;
        this.gameState.jobLevel = 1;
        this.gameState.jobExperience = 0;
        
        // Publish job changed event
        GameEvents.publish('jobChanged', { 
            careerTrack: careerTrackId,
            job: jobId,
            jobName: jobTier.name
        });
        
        // Complete state update - this triggers a full UI refresh
        GameEvents.publish('gameStateUpdated', { gameState: this.gameState });
        
    } catch (error) {
        console.error("Error applying for job:", error);
        UIManager.showNotification("Error", "Something went wrong while applying for job.");
    }
},
    
    /**
     * Check if job requirements are met
     * @param {Object} jobTier - The job tier to check
     * @param {Object} state - Game state to check against
     * @returns {boolean} - Whether requirements are met
     */
    checkJobRequirements(jobTier, state) {
        try {
            // If it's the current job, requirements are already met
            if (state.currentJob === jobTier.id) {
                return true;
            }
            
            // If no requirements, return true
            if (!jobTier.requirements) {
                return true;
            }
            
            // Check previous job requirement
            if (jobTier.requirements.previousJob && 
                (state.currentJob !== jobTier.requirements.previousJob || 
                 state.jobLevel < jobTier.requirements.previousJobLevel)) {
                return false;
            }
            
            // Check general skill requirements
            if (jobTier.requirements.generalSkills) {
                for (const [skillId, level] of Object.entries(jobTier.requirements.generalSkills)) {
                    if (!state.generalSkills[skillId] || state.generalSkills[skillId].level < level) {
                        return false;
                    }
                }
            }
            
            // Check professional skill requirements
            if (jobTier.requirements.professionalSkills) {
                for (const [skillId, level] of Object.entries(jobTier.requirements.professionalSkills)) {
                    if (!state.professionalSkills[skillId] || state.professionalSkills[skillId].level < level) {
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
     * Calculate daily income based on job
     * @param {Object} state - Game state to calculate for
     * @returns {number} - Daily income
     */
    calculateDailyIncome(state) {
        try {
            const trackInfo = GameData.careers[state.currentCareerTrack];
            const jobTier = trackInfo.tiers.find(tier => tier.id === state.currentJob);
            
            if (!jobTier) return 0;
            
            const baseRate = jobTier.baseSalary;
            const levelMultiplier = 1 + (state.jobLevel / 100);
            const hourlyRate = baseRate * levelMultiplier;
            
            return hourlyRate * state.workHours;
        } catch (error) {
            console.error("Error calculating daily income:", error);
            return 0;
        }
    },
    
    /**
     * Process job experience for the day
     * @param {Object} state - Game state to process for
     * @param {number} workHours - Hours spent working
     */
    processJobExperience(state, workHours) {
        // Base experience rate per hour depends on job tier
        const trackInfo = GameData.careers[state.currentCareerTrack];
        if (!trackInfo) return;
        
        const jobTier = trackInfo.tiers.find(tier => tier.id === state.currentJob);
        if (!jobTier) return;
        
        // Base experience is proportional to job tier (higher tier = more exp)
        const tierIndex = trackInfo.tiers.findIndex(tier => tier.id === state.currentJob);
        const BASE_JOB_EXP_RATE = 5 + (tierIndex * 3); // 5 for tier 1, 8 for tier 2, etc.
        
        // Calculate experience gain with Eternal Echo multiplier
        const echoMultiplier = state.jobEchoes[state.currentJob] || 1;
        const expGain = workHours * BASE_JOB_EXP_RATE * echoMultiplier;
        
        // Add experience
        state.jobExperience += expGain;
        
        // Check for level up
        this.checkJobLevelUp(state);
    },
    
    /**
     * Check if job levels up
     * @param {Object} state - Game state to check for
     */
    checkJobLevelUp(state) {
        // Calculate experience needed for next level
        // Each level requires more exp than the previous (10% increase per level)
        const expForNextLevel = 100 * Math.pow(1.1, state.jobLevel);
        
        // Check if enough experience has been gained
        if (state.jobExperience >= expForNextLevel) {
            // Level up
            state.jobExperience -= expForNextLevel;
            state.jobLevel++;
            
            // Track highest job level for statistics
            if (state.jobLevel > (state.maxJobLevelReached || 0)) {
                state.maxJobLevelReached = state.jobLevel;
            }
            
            // Get job title
            const jobTitle = this.getJobTitle(state);
            
            // Publish job level up event
            GameEvents.publish('jobLevelUp', {
                jobId: state.currentJob,
                jobTitle,
                newLevel: state.jobLevel
            });
            
            // Check if this level grants an Eternal Echo increase (every 10 levels)
            if (state.jobLevel % 10 === 0 && state.jobLevel <= 100) {
                this.updateJobEchoMultiplier(state, state.currentJob, state.jobLevel / 10);
            }
            
            // Check for multiple level ups
            this.checkJobLevelUp(state);
        }
    },
    
    /**
     * Update Eternal Echo multiplier for a job
     * @param {Object} state - Game state to update
     * @param {string} jobId - The ID of the job
     * @param {number} echoLevel - The echo level (1-10)
     */
    updateJobEchoMultiplier(state, jobId, echoLevel) {
        // 10% bonus per 10 levels, capped at 100% (2x multiplier)
        const bonusMultiplier = 1 + (Math.min(echoLevel, 10) * 0.1);
        
        // Update the echo multiplier if it's higher than the current one
        if (!state.jobEchoes[jobId] || bonusMultiplier > state.jobEchoes[jobId]) {
            state.jobEchoes[jobId] = bonusMultiplier;
            
            // Show notification
            UIManager.showNotification("Eternal Echo Increased!", 
                `Your experience in this job will be ${Math.floor((bonusMultiplier - 1) * 100)}% faster in future lives!`);
        }
    },
    
    /**
     * Get the title of the current job
     * @param {Object} state - Game state to get title from
     * @returns {string} - Job title
     */
    getJobTitle(state) {
        try {
            const trackInfo = GameData.careers[state.currentCareerTrack];
            if (!trackInfo) return "Unemployed";
            
            const jobTier = trackInfo.tiers.find(tier => tier.id === state.currentJob);
            if (!jobTier) return "Unemployed";
            
            return jobTier.name;
        } catch (error) {
            console.error("Error getting job title:", error);
            return "Unemployed";
        }
    }
};

export default CareerManager;
