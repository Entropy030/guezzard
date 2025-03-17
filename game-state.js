// Import TYPES from game-data.js
import { TYPES } from './game-data.js';
// Import GameData to access skills
import GameData from './game-data.js';

// Create a custom event system for game state changes
export const GameEvents = {
    subscribers: {},
    
    subscribe(eventName, callback) {
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }
        this.subscribers[eventName].push(callback);
        
        // Return an unsubscribe function
        return () => {
            this.subscribers[eventName] = this.subscribers[eventName]
                .filter(cb => cb !== callback);
        };
    },
    
    publish(eventName, data) {
        if (!this.subscribers[eventName]) return;
        this.subscribers[eventName].forEach(callback => callback(data));
    }
};

// ============== Game State ==============
/**
 * Main game state object that holds all player data and game settings
 */
const GameState = {
    // Initialize a new game state with default values
    createNewState() {
        return {
            // Basic info
            age: 20,
            day: 1,
            month: 1,
            year: 2025,
            
            // Resources
            kudos: 1000,
            totalKudosEarned: 0,
            
            // Time allocation
            workHours: 4,
            trainingHours: 2,
            sleepHours: 10,  // Base value
            commuteHours: 4, // Base value
            mealHours: 4,    // Base value
            
            // Career
            currentCareerTrack: TYPES.CAREER_TRACK.OFFICE,
            currentJob: "office_tier1",
            jobLevel: 1,
            jobExperience: 0,
            maxJobLevelReached: 1,
            
            // Training
            currentTrainingSkill: TYPES.SKILL.FOCUS,
            
            // Lifestyle - default to free options
            housingType: TYPES.HOUSING.HOMELESS,
            transportType: TYPES.TRANSPORT.FOOT,
            foodType: TYPES.FOOD.HOMELESS,
            
            // Skills - will be initialized with initializeSkills()
            generalSkills: {},
            professionalSkills: {},
            maxSkillLevelReached: 1,
            
            // Eternal Echoes
            skillEchoes: {},
            jobEchoes: {},
            
            // Completed career tracks for unlocking special content
            completedCareerTracks: [],
            
            // Game state
            isPaused: false,
            gameSpeed: 1, // Seconds per day
            tickInterval: null,
            isGameOver: false,
            
            // Settings
            autosaveEnabled: true,
            
            // Statistics for lifecycle
            lifetimeStats: {
                totalDays: 0,
                kudosEarned: 0,
                skillLevelsGained: 0,
                jobLevelsGained: 0
            }
        };
    },
    
    /**
     * Initialize all skills to level 1
     * @param {Object} state - The game state to initialize skills for
     * @returns {Object} - The updated game state
     */
    initializeSkills(state) {
        try {
            // Make a copy of the state to avoid direct mutation
            const newState = { ...state };
            newState.generalSkills = {};
            newState.professionalSkills = {};
            
            // General skills - use GameData.skills.general
            for (const skillId in GameData.skills.general) {
                newState.generalSkills[skillId] = {
                    level: 1,
                    experience: 0
                };
            }
            
            // Professional skills - use GameData.skills.professional
            for (const skillId in GameData.skills.professional) {
                newState.professionalSkills[skillId] = {
                    level: 1,
                    experience: 0
                };
            }
            
            return newState;
        } catch (error) {
            console.error("Error initializing skills:", error);
            // Provide a fallback empty skill set to prevent crashes
            return {
                ...state,
                generalSkills: {},
                professionalSkills: {}
            };
        }
    },
    
    /**
     * Save game state to local storage
     * @param {Object} state - The game state to save
     * @returns {boolean} - Whether the save was successful
     */
    saveGame(state) {
        try {
            // Don't save the interval ID as it's not serializable
            const stateToSave = { ...state };
            delete stateToSave.tickInterval;
            
            const serializedState = JSON.stringify(stateToSave);
            localStorage.setItem('guezzardSaveGame', serializedState);
            
            // Publish save event
            GameEvents.publish('gameSaved', { success: true });
            
            return true;
        } catch (error) {
            console.error("Error saving game:", error);
            GameEvents.publish('gameSaved', { success: false, error });
            return false;
        }
    },
    
    /**
     * Load game state from local storage
     * @returns {Object|null} - The loaded game state or null if no save found
     */
    loadGame() {
        try {
            const serializedState = localStorage.getItem('guezzardSaveGame');
            if (serializedState === null) {
                // No saved game found
                return null;
            }
            
            const loadedState = JSON.parse(serializedState);
            
            // Validate loaded state has minimum required properties
            if (!this.validateSaveGame(loadedState)) {
                console.warn("Invalid save file detected");
                return null;
            }
            
            // Initialize missing fields with defaults if needed
            const completeState = this.ensureCompleteState(loadedState);
            
            // Publish load event
            GameEvents.publish('gameLoaded', { success: true });
            
            return completeState;
        } catch (error) {
            console.error("Error loading game:", error);
            GameEvents.publish('gameLoaded', { success: false, error });
            return null;
        }
    },
    
    /**
     * Validate that a save game has required properties
     * @param {Object} state - The state to validate
     * @returns {boolean} - Whether the state is valid
     */
    validateSaveGame(state) {
        const requiredProperties = [
            'age', 'day', 'month', 'year', 'kudos',
            'workHours', 'trainingHours',
            'currentCareerTrack', 'currentJob', 'jobLevel',
            'generalSkills', 'professionalSkills'
        ];
        
        return requiredProperties.every(prop => state.hasOwnProperty(prop));
    },
    
    /**
     * Ensure a loaded state has all fields from the default state
     * @param {Object} loadedState - The loaded state
     * @returns {Object} - A complete state with any missing fields added
     */
    ensureCompleteState(loadedState) {
        const defaultState = this.createNewState();
        const completeState = { ...defaultState, ...loadedState };
        
        // Ensure all nested objects exist
        if (!completeState.lifetimeStats) {
            completeState.lifetimeStats = defaultState.lifetimeStats;
        }
        
        return completeState;
    },
    
    /**
     * Reset game state while preserving Eternal Echoes
     * @param {Object} state - The current game state
     * @returns {Object} - A new game state with preserved echoes
     */
    resetWithEchoes(state) {
        // Save echoes and settings
        const savedSkillEchoes = {...state.skillEchoes};
        const savedJobEchoes = {...state.jobEchoes};
        const savedCompletedTracks = [...(state.completedCareerTracks || [])];
        const savedSettings = {
            autosaveEnabled: state.autosaveEnabled,
            gameSpeed: state.gameSpeed
        };
        
        // Track the highest levels reached for statistics
        const maxSkillLevelReached = state.maxSkillLevelReached || 1;
        const maxJobLevelReached = state.maxJobLevelReached || 1;
        
        // Create new state
        const newState = this.createNewState();
        
        // Restore Eternal Echoes and settings
        newState.skillEchoes = savedSkillEchoes;
        newState.jobEchoes = savedJobEchoes;
        newState.completedCareerTracks = savedCompletedTracks;
        newState.autosaveEnabled = savedSettings.autosaveEnabled;
        newState.gameSpeed = savedSettings.gameSpeed;
        
        // Preserve statistics for display
        newState.maxSkillLevelReached = maxSkillLevelReached;
        newState.maxJobLevelReached = maxJobLevelReached;
        
        // Initialize skills
        const stateWithSkills = this.initializeSkills(newState);
        
        // Publish reincarnation event
        GameEvents.publish('playerReincarnated', { 
            previousMaxSkillLevel: maxSkillLevelReached,
            previousMaxJobLevel: maxJobLevelReached
        });
        
        return stateWithSkills;
    },
    
    /**
     * Get all skills (general and professional) as a flat array
     * @param {Object} state - The game state
     * @returns {Array} - Array of skill objects with id and type
     */
    getAllSkills(state) {
        const allSkills = [];
        
        // Add general skills
        for (const skillId in state.generalSkills) {
            allSkills.push({
                id: skillId,
                type: 'general',
                ...state.generalSkills[skillId]
            });
        }
        
        // Add professional skills
        for (const skillId in state.professionalSkills) {
            allSkills.push({
                id: skillId,
                type: 'professional',
                ...state.professionalSkills[skillId]
            });
        }
        
        return allSkills;
    },
    
    /**
     * Find the skill with the highest level
     * @param {Object} state - The game state
     * @returns {Object} - The highest level skill
     */
    getHighestSkill(state) {
        const allSkills = this.getAllSkills(state);
        
        return allSkills.reduce((highest, current) => {
            return current.level > highest.level ? current : highest;
        }, { level: 0 });
    },
    
    /**
     * Update a skill's level and experience
     * @param {Object} state - The game state
     * @param {string} skillId - The skill ID
     * @param {string} skillType - 'general' or 'professional'
     * @param {Object} updates - Object with level and/or experience updates
     * @returns {Object} - Updated game state
     */
    updateSkill(state, skillId, skillType, updates) {
        // Create a new state to avoid direct mutation
        const newState = { ...state };
        
        // Get the skills collection based on type
        const skillsCollection = skillType === 'general'
            ? { ...newState.generalSkills }
            : { ...newState.professionalSkills };
        
        // Create or update the skill
        skillsCollection[skillId] = {
            ...skillsCollection[skillId],
            ...updates
        };
        
        // Update the state
        if (skillType === 'general') {
            newState.generalSkills = skillsCollection;
        } else {
            newState.professionalSkills = skillsCollection;
        }
        
        // Track highest skill level reached
        if (updates.level && updates.level > (newState.maxSkillLevelReached || 0)) {
            newState.maxSkillLevelReached = updates.level;
        }
        
        return newState;
    }
};

// Export the GameState module
export default GameState;
