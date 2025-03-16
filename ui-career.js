/**
 * UI Career - Handles career panel UI
 */

import GameData from './game-data.js';
import { GameEvents } from './game-state.js';
import { DOMCache } from './ui-manager.js';
import { UIHelpers } from './ui-panels.js';

export const CareerUI = {
    // Track if we need to rebuild the career panel
    needsRefresh: true,
    
    /**
     * Update career panel with career tracks and job tiers
     * @param {Object} gameState - Current game state
     */
    updateCareerPanel(gameState) {
        try {
            const container = DOMCache.get('career-tracks-container');
            if (!container) return;
            
            // Only rebuild if needed (first time or career change)
            if (container.children.length === 0 || this.needsRefresh) {
                container.innerHTML = '';
                
                // Create career tracks 
                for (const trackId in GameData.careers) {
                    const track = GameData.careers[trackId];
                    const trackElement = this.createCareerTrackElement(trackId, track, gameState);
                    container.appendChild(trackElement);
                }
                
                this.needsRefresh = false;
            } else {
                // Just update job levels and progress
                this.updateJobsProgress(gameState);
            }
        } catch (error) {
            console.error("Error updating career panel:", error);
        }
    },
    
    /**
     * Create a career track element
     * @param {string} trackId - Career track ID
     * @param {Object} track - Career track data
     * @param {Object} gameState - Current game state
     * @returns {HTMLElement} - Career track element
     */
    createCareerTrackElement(trackId, track, gameState) {
        const trackElement = document.createElement('div');
        trackElement.className = 'career-track';
        trackElement.dataset.trackId = trackId;
        
        // Create header
        const header = document.createElement('div');
        header.className = 'career-track-header';
        
        const title = document.createElement('div');
        title.className = 'career-track-title';
        title.textContent = track.name;
        header.appendChild(title);
        
        trackElement.appendChild(header);
        
        // Add description
        if (track.description) {
            const description = document.createElement('div');
            description.className = 'career-track-description';
            description.textContent = track.description;
            trackElement.appendChild(description);
        }
        
        // Add job tiers
        const jobsContainer = document.createElement('div');
        jobsContainer.className = 'job-tiers-container';
        
        // Determine visible tiers
        const visibleTiers = this.getVisibleTiers(track.tiers, gameState);
        
        // Add visible job tiers
        track.tiers.forEach((tier, index) => {
            if (visibleTiers.has(index)) {
                const tierElement = this.createJobTierElement(tier, track.tiers, trackId, gameState);
                jobsContainer.appendChild(tierElement);
            }
        });
        
        trackElement.appendChild(jobsContainer);
        
        return trackElement;
    },
    
    /**
     * Determine which job tiers should be visible
     * @param {Array} tiers - All tiers in the career track
     * @param {Object} gameState - Current game state
     * @returns {Set} - Set of tier indices that should be visible
     */
    getVisibleTiers(tiers, gameState) {
        const visibleTiers = new Set();
        
        // Always show the first tier
        visibleTiers.add(0);
        
        // Find current job's tier index
        const currentTierIndex = tiers.findIndex(tier => tier.id === gameState.currentJob);
        
        if (currentTierIndex >= 0) {
            // Show current tier
            visibleTiers.add(currentTierIndex);
            
            // Show previous tier if not the first
            if (currentTierIndex > 0) {
                visibleTiers.add(currentTierIndex - 1);
            }
            
            // Show next tier if available
            if (currentTierIndex + 1 < tiers.length) {
                visibleTiers.add(currentTierIndex + 1);
                
                // Show next next tier if the player has high enough level
                // in current job to potentially qualify
                if (currentTierIndex + 2 < tiers.length && 
                    gameState.jobLevel >= tiers[currentTierIndex + 1].requirements?.previousJobLevel * 0.7) {
                    visibleTiers.add(currentTierIndex + 2);
                }
            }
        }
        
        return visibleTiers;
    },
    
    /**
     * Create a job tier element
     * @param {Object} tier - Job tier data
     * @param {Array} allTiers - All tiers in the career track
     * @param {string} trackId - Career track ID
     * @param {Object} gameState - Current game state
     * @returns {HTMLElement} - Job tier element
     */
    createJobTierElement(tier, allTiers, trackId, gameState) {
        const element = document.createElement('div');
        element.className = 'job-tier';
        element.dataset.jobId = tier.id;
        
        // Add current-job class if this is the player's current job
        if (tier.id === gameState.currentJob) {
            element.classList.add('current-job');
        }
        
        // Create job details section
        const detailsElement = document.createElement('div');
        detailsElement.className = 'job-details';
        
        // Job title
        const titleElement = document.createElement('div');
        titleElement.className = 'job-title';
        titleElement.textContent = tier.name;
        detailsElement.appendChild(titleElement);
        
        // Job quote
        if (tier.quote) {
            const quoteElement = document.createElement('div');
            quoteElement.className = 'job-quote';
            quoteElement.textContent = `"${tier.quote}"`;
            detailsElement.appendChild(quoteElement);
        }
        
        // Job salary
        const salaryElement = document.createElement('div');
        salaryElement.className = 'job-salary';
        salaryElement.textContent = `${tier.baseSalary} kudos/hr`;
        detailsElement.appendChild(salaryElement);
        
        element.appendChild(detailsElement);
        
        // Add requirements if not current job
        if (tier.id !== gameState.currentJob) {
            const requirementsMet = UIHelpers.checkJobRequirements(tier, gameState);
            
            if (requirementsMet) {
                // Can apply for this job
                const applyButton = document.createElement('button');
                applyButton.textContent = "Apply for Job";
                applyButton.addEventListener('click', () => {
                    GameEvents.publish('applyForJob', { jobId: tier.id });
                });
                element.appendChild(applyButton);
            } else {
                // Show requirements
                const requirementsElement = document.createElement('div');
                requirementsElement.className = 'job-requirements';
                
                // Add skill requirements
                this.addSkillRequirements(requirementsElement, tier, gameState);
                
                // Add previous job requirement if applicable
                if (tier.requirements?.previousJob) {
                    this.addPreviousJobRequirement(requirementsElement, tier, allTiers, gameState);
                }
                
                element.appendChild(requirementsElement);
            }
        } else {
            // Add progress bar for current job
            const progressElement = document.createElement('div');
            progressElement.className = 'job-progress';
            
            const progressBar = UIHelpers.createProgressBar(
                gameState.jobExperience,
                UIHelpers.calculateExpForJobLevel(gameState.jobLevel)
            );
            
            progressElement.appendChild(progressBar);
            element.appendChild(progressElement);
        }
        
        return element;
    },
    
    /**
     * Add skill requirements to a requirements element
     * @param {HTMLElement} requirementsElement - Requirements container element
     * @param {Object} tier - Job tier data
     * @param {Object} gameState - Current game state
     */
    addSkillRequirements(requirementsElement, tier, gameState) {
        // Add general skill requirements
        if (tier.requirements?.generalSkills && Object.keys(tier.requirements.generalSkills).length > 0) {
            const skillReqs = document.createElement('div');
            skillReqs.className = 'skill-requirements';
            skillReqs.textContent = "Required Skills:";
            
            const skillList = document.createElement('ul');
            for (const [skillId, level] of Object.entries(tier.requirements.generalSkills)) {
                const skillName = GameData.skills.general[skillId]?.name || skillId;
                const playerLevel = gameState.generalSkills[skillId]?.level || 0;
                
                const listItem = document.createElement('li');
                listItem.textContent = `${skillName}: ${playerLevel}/${level}`;
                
                // Highlight if requirement not met
                if (playerLevel < level) {
                    listItem.style.color = 'var(--error)';
                } else {
                    listItem.style.color = 'var(--success)';
                }
                
                skillList.appendChild(listItem);
            }
            skillReqs.appendChild(skillList);
            requirementsElement.appendChild(skillReqs);
        }
        
        // Add professional skill requirements
        if (tier.requirements?.professionalSkills && Object.keys(tier.requirements.professionalSkills).length > 0) {
            const profSkillReqs = document.createElement('div');
            profSkillReqs.className = 'prof-skill-requirements';
            profSkillReqs.textContent = "Professional Skills:";
            
            const skillList = document.createElement('ul');
            for (const [skillId, level] of Object.entries(tier.requirements.professionalSkills)) {
                const skillName = GameData.skills.professional[skillId]?.name || skillId;
                const playerLevel = gameState.professionalSkills[skillId]?.level || 0;
                
                const listItem = document.createElement('li');
                listItem.textContent = `${skillName}: ${playerLevel}/${level}`;
                
                // Highlight if requirement not met
                if (playerLevel < level) {
                    listItem.style.color = 'var(--error)';
                } else {
                    listItem.style.color = 'var(--success)';
                }
                
                skillList.appendChild(listItem);
            }
            profSkillReqs.appendChild(skillList);
            requirementsElement.appendChild(profSkillReqs);
        }
    },
    
    /**
     * Add previous job requirement to a requirements element
     * @param {HTMLElement} requirementsElement - Requirements container element
     * @param {Object} tier - Job tier data
     * @param {Array} allTiers - All tiers in the career track
     * @param {Object} gameState - Current game state
     */
    addPreviousJobRequirement(requirementsElement, tier, allTiers, gameState) {
        const prevJobReq = document.createElement('div');
        prevJobReq.className = 'previous-job-requirement';
        
        // Find previous job info
        const prevJobTier = allTiers.find(t => t.id === tier.requirements.previousJob);
        const prevJobName = prevJobTier ? prevJobTier.name : tier.requirements.previousJob;
        
        // Get current level in previous job
        const currentLevelInPrevJob = gameState.currentJob === tier.requirements.previousJob 
            ? gameState.jobLevel : 0;
        
        prevJobReq.textContent = `Previous Job: ${prevJobName} (Level ${currentLevelInPrevJob}/${tier.requirements.previousJobLevel})`;
        
        // Highlight if requirement not met
        if (currentLevelInPrevJob < tier.requirements.previousJobLevel) {
            prevJobReq.style.color = 'var(--error)';
        } else {
            prevJobReq.style.color = 'var(--success)';
        }
        
        requirementsElement.appendChild(prevJobReq);
    },
    
    /**
     * Update job progress bars
     * @param {Object} gameState - Current game state
     */
    updateJobsProgress(gameState) {
        const currentJobElement = document.querySelector(`.job-tier[data-job-id="${gameState.currentJob}"]`);
        if (!currentJobElement) return;
        
        const progressBar = currentJobElement.querySelector('.progress-bar');
        if (progressBar) {
            const expForNextLevel = UIHelpers.calculateExpForJobLevel(gameState.jobLevel);
            const percent = Math.min(100, (gameState.jobExperience / expForNextLevel) * 100);
            progressBar.style.width = `${percent}%`;
            
            // Update progress text if present
            const progressValue = currentJobElement.querySelector('.progress-value');
            if (progressValue) {
                progressValue.textContent = `${Math.floor(gameState.jobExperience)}/${Math.floor(expForNextLevel)} XP`;
            }
        }
    }
};
