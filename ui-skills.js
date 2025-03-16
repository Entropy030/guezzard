/**
 * UI Skills - Handles skills panel UI
 */

import GameData from './game-data.js';
import { GameEvents } from './game-state.js';
import { DOMCache } from './ui-manager.js';
import { UIHelpers } from './ui-panels.js';

export const SkillsUI = {
    // Track if we need to rebuild the skills panel
    needsRefresh: true,
    
    /**
     * Update skills panel with general and professional skills
     * @param {Object} gameState - Current game state
     */
    updateSkillsPanel(gameState) {
        try {
            this.updateGeneralSkills(gameState);
            this.updateProfessionalSkills(gameState);
        } catch (error) {
            console.error("Error updating skills panel:", error);
        }
    },
    
    /**
     * Update general skills section
     * @param {Object} gameState - Current game state
     */
    updateGeneralSkills(gameState) {
        const container = DOMCache.get('general-skills-container');
        if (!container) return;
        
        // Only rebuild if needed
        if (container.children.length === 0 || this.needsRefresh) {
            container.innerHTML = '';
            
            // Group skills by category
            const skillCategories = this.groupSkillsByCategory(GameData.skills.general, 'general');
            
            // Create each category
            for (const category in skillCategories) {
                const categoryElement = this.createSkillCategoryElement(
                    category, 
                    skillCategories[category],
                    gameState,
                    'general'
                );
                container.appendChild(categoryElement);
            }
            
            this.needsRefresh = false;
        } else {
            // Just update progress bars and levels
            this.updateSkillsProgress(container, gameState.generalSkills);
        }
    },
    
    /**
     * Update professional skills section
     * @param {Object} gameState - Current game state
     */
    updateProfessionalSkills(gameState) {
        const container = DOMCache.get('professional-skills-container');
        if (!container) return;
        
        // Only rebuild if needed
        if (container.children.length === 0 || this.needsRefresh) {
            container.innerHTML = '';
            
            // Group skills by category (based on career track)
            const skillCategories = this.groupSkillsByCareerTrack(GameData.skills.professional);
            
            // Create each category
            for (const category in skillCategories) {
                const categoryElement = this.createSkillCategoryElement(
                    category, 
                    skillCategories[category],
                    gameState,
                    'professional'
                );
                container.appendChild(categoryElement);
            }
        } else {
            // Just update progress bars and levels
            this.updateSkillsProgress(container, gameState.professionalSkills);
        }
    },
    
    /**
     * Group general skills into categories
     * @param {Object} skills - Skills data
     * @param {string} skillType - 'general' or 'professional'
     * @returns {Object} - Grouped skills by category
     */
    groupSkillsByCategory(skills, skillType) {
        // For now, just group general skills into a single category
        const categories = {
            'General Skills': []
        };
        
        for (const skillId in skills) {
            categories['General Skills'].push({
                id: skillId,
                ...skills[skillId]
            });
        }
        
        return categories;
    },
    
    /**
     * Group professional skills by career track
     * @param {Object} skills - Professional skills data
     * @returns {Object} - Grouped skills by career track
     */
    groupSkillsByCareerTrack(skills) {
        const categories = {};
        
        // Create categories for each career track
        for (const trackId in GameData.careers) {
            const track = GameData.careers[trackId];
            categories[track.name] = [];
        }
        
        // Add skills to their primary career tracks
        for (const skillId in skills) {
            const skill = skills[skillId];
            
            if (skill.primaryCareerTracks && skill.primaryCareerTracks.length > 0) {
                // Add to each primary career track
                for (const trackId of skill.primaryCareerTracks) {
                    const track = GameData.careers[trackId];
                    if (track) {
                        categories[track.name].push({
                            id: skillId,
                            ...skill
                        });
                    }
                }
            } else {
                // If no primary tracks, add to "Other" category
                if (!categories['Other']) {
                    categories['Other'] = [];
                }
                categories['Other'].push({
                    id: skillId,
                    ...skill
                });
            }
        }
        
        // Remove empty categories
        for (const category in categories) {
            if (categories[category].length === 0) {
                delete categories[category];
            }
        }
        
        return categories;
    },
    
    /**
     * Create a skill category element
     * @param {string} categoryName - Category name
     * @param {Array} skills - Skills in this category
     * @param {Object} gameState - Current game state
     * @param {string} skillType - 'general' or 'professional'
     * @returns {HTMLElement} - Category element
     */
    createSkillCategoryElement(categoryName, skills, gameState, skillType) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'skill-category';
        
        // Category header
        const header = document.createElement('div');
        header.className = 'skill-category-header';
        
        const title = document.createElement('div');
        title.className = 'skill-category-title';
        title.textContent = categoryName;
        header.appendChild(title);
        
        // Toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'skill-category-toggle';
        toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
        header.appendChild(toggleButton);
        
        categoryElement.appendChild(header);
        
        // Skills container
        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'skill-category-items';
        
        // Add skills
        skills.forEach(skill => {
            const skillData = skillType === 'general' 
                ? gameState.generalSkills[skill.id] 
                : gameState.professionalSkills[skill.id];
            
            const skillElement = this.createSkillElement(
                skill.id,
                skill.name,
                skill.description,
                skillData?.level || 1,
                skillData?.experience || 0,
                UIHelpers.calculateExpForSkillLevel(skillData?.level || 1),
                skillType,
                gameState.currentTrainingSkill === skill.id
            );
            
            skillsContainer.appendChild(skillElement);
        });
        
        categoryElement.appendChild(skillsContainer);
        
        // Add toggle functionality
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent header click
            skillsContainer.classList.toggle('collapsed');
            toggleButton.querySelector('i').classList.toggle('fa-chevron-down');
            toggleButton.querySelector('i').classList.toggle('fa-chevron-right');
        });
        
        header.addEventListener('click', () => {
            skillsContainer.classList.toggle('collapsed');
            toggleButton.querySelector('i').classList.toggle('fa-chevron-down');
            toggleButton.querySelector('i').classList.toggle('fa-chevron-right');
        });
        
        return categoryElement;
    },
    
    /**
     * Create a skill element
     * @param {string} skillId - Skill ID
     * @param {string} name - Skill name
     * @param {string} description - Skill description
     * @param {number} level - Current skill level
     * @param {number} experience - Current experience
     * @param {number} expForNextLevel - Experience needed for next level
     * @param {string} skillType - "general" or "professional"
     * @param {boolean} isTraining - Whether this skill is currently being trained
     * @returns {HTMLElement} - Skill element
     */
    createSkillElement(skillId, name, description, level, experience, expForNextLevel, skillType, isTraining) {
        const skillElement = document.createElement('div');
        skillElement.className = 'skill-item';
        skillElement.dataset.skillId = skillId;
        
        if (isTraining) {
            skillElement.classList.add('active-training');
        }
        
        // Create header with name and level
        const header = document.createElement('div');
        header.className = 'skill-header';
        
        const nameElement = document.createElement('div');
        nameElement.className = 'skill-name';
        nameElement.textContent = name;
        
        const levelElement = document.createElement('div');
        levelElement.className = 'skill-level';
        levelElement.textContent = `Level ${level}`;
        
        header.appendChild(nameElement);
        header.appendChild(levelElement);
        skillElement.appendChild(header);
        
        // Add description
        const descElement = document.createElement('div');
        descElement.className = 'skill-description';
        descElement.textContent = description;
        skillElement.appendChild(descElement);
        
        // Create progress bar
        const progressBar = UIHelpers.createProgressBar(experience, expForNextLevel);
        progressBar.classList.add('skill-progress');
        skillElement.appendChild(progressBar);
        
        // Add training button
        const trainButton = document.createElement('button');
        trainButton.className = 'training-button';
        trainButton.textContent = isTraining ? 'Currently Training' : 'Train This Skill';
        trainButton.disabled = isTraining;
        
        // Add event listener to switch training skill
        trainButton.addEventListener('click', () => {
            GameEvents.publish('switchTrainingSkill', { 
                skillId, 
                skillType
            });
        });
        
        skillElement.appendChild(trainButton);
        
        return skillElement;
    },
    
    /**
     * Update skill progress bars and levels
     * @param {HTMLElement} container - Skills container element
     * @param {Object} skills - Skills data from game state
     */
    updateSkillsProgress(container, skills) {
        // Find all skill elements
        const skillElements = container.querySelectorAll('.skill-item');
        
        skillElements.forEach(element => {
            const skillId = element.dataset.skillId;
            const skill = skills[skillId];
            
            if (skill) {
                // Update level
                const levelElement = element.querySelector('.skill-level');
                if (levelElement) {
                    levelElement.textContent = `Level ${skill.level}`;
                }
                
                // Update progress bar
                const progressBar = element.querySelector('.progress-bar');
                if (progressBar) {
                    const expForNextLevel = UIHelpers.calculateExpForSkillLevel(skill.level);
                    const percent = Math.min(100, (skill.experience / expForNextLevel) * 100);
                    progressBar.style.width = `${percent}%`;
                }
                
                // Update progress text
                const progressValue = element.querySelector('.progress-value');
                if (progressValue) {
                    const expForNextLevel = UIHelpers.calculateExpForSkillLevel(skill.level);
                    progressValue.textContent = `${Math.floor(skill.experience)}/${Math.floor(expForNextLevel)} XP`;
                }
            }
        });
    }
};
