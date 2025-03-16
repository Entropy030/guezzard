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
            
            // Training
            currentTrainingSkill: TYPES.SKILL.FOCUS,
            
            // Lifestyle - default to free options
            housingType: "housing_homeless", // Free basic housing
            transportType: "transport_foot", // Walking (free)
            foodType: "food_homelessShelter", // Free basic food
            
            // Skills - will be initialized with initializeSkills()
            generalSkills: {},
            professionalSkills: {},
            
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
            autosaveEnabled: true
        };
    },
    
    // Initialize all skills to level 1
    initializeSkills(state) {
        try {
            // General skills
            for (const skillId in generalSkills) {
                state.generalSkills[skillId] = {
                    level: 1,
                    experience: 0
                };
            }
            
            // Professional skills
            for (const skillId in professionalSkills) {
                state.professionalSkills[skillId] = {
                    level: 1,
                    experience: 0
                };
            }
            
            return state;
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
    
    // Save game state to local storage
    saveGame(state) {
        try {
            const serializedState = JSON.stringify(state);
            localStorage.setItem('guezzardSaveGame', serializedState);
            return true;
        } catch (error) {
            console.error("Error saving game:", error);
            return false;
        }
    },
    
    // Load game state from local storage
    loadGame() {
        try {
            const serializedState = localStorage.getItem('guezzardSaveGame');
            if (serializedState === null) {
                // No saved game found
                return null;
            }
            
            const loadedState = JSON.parse(serializedState);
            
            // Validate loaded state has minimum required properties
            if (!loadedState.age || !loadedState.generalSkills || !loadedState.professionalSkills) {
                console.warn("Invalid save file detected");
                return null;
            }
            
            return loadedState;
        } catch (error) {
            console.error("Error loading game:", error);
            return null;
        }
    },
    
    // Reset game state while preserving Eternal Echoes
    resetWithEchoes(state) {
        // Save echoes and settings
        const savedSkillEchoes = {...state.skillEchoes};
        const savedJobEchoes = {...state.jobEchoes};
        const savedCompletedTracks = [...(state.completedCareerTracks || [])];
        const savedSettings = {
            autosaveEnabled: state.autosaveEnabled
        };
        
        // Create new state
        const newState = this.createNewState();
        
        // Restore Eternal Echoes and settings
        newState.skillEchoes = savedSkillEchoes;
        newState.jobEchoes = savedJobEchoes;
        newState.completedCareerTracks = savedCompletedTracks;
        newState.autosaveEnabled = savedSettings.autosaveEnabled;
        
        // Initialize skills
        return this.initializeSkills(newState);
    }
};

// Export the GameState module
export default GameState;