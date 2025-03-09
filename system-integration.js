// system-integration.js
// Connects all game systems together and initializes them in the correct order

console.log("system-integration.js - Module loading");

// System initialization status tracking
const systemStatus = {
    gameState: false,
    jobSystem: false,
    uiSystem: false,
    eventSystem: false,
    displaySystem: false,
    prestigeSystem: false,
    gameLoop: false
};

// Initialize game on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded - Starting game initialization");
    initializeGame();
});

// Main initialization function
async function initializeGame() {
    console.log("initializeGame() - Starting game systems initialization");
    
    try {
        // 1. Initialize game state first
        await initGameState();
        
        // 2. Initialize UI system
        initUISystem();
        
        // 3. Load game data
        await loadGameData();
        
        // 4. Initialize job system
        initJobSystem();
        
        // 5. Initialize prestige system
        initPrestigeSystem();
        
        // 6. Initialize display system
        initDisplaySystem();
        
        // 7. Start game loop
        startGameLoop();
        
        // 8. Log initialization complete
        const allSystemsReady = Object.values(systemStatus).every(status => status === true);
        
        if (allSystemsReady) {
            console.log("All game systems initialized successfully!");
            
            // Log a welcome message in the event log
            if (typeof window.logEvent === 'function') {
                window.logEvent("Welcome to Guezzard! Start your career journey now.", 'system');
            }
            
            // Update all displays
            if (typeof window.updateAllDisplays === 'function') {
                window.updateAllDisplays();
            }
        } else {
            console.warn("Some game systems failed to initialize:", systemStatus);
        }
    } catch (error) {
        console.error("Error initializing game:", error);
    }
}

// Initialize game state
async function initGameState() {
    console.log("initGameState() - Initializing game state");
    
    try {
        // Check if game state is already initialized
        if (typeof window.gameState !== 'undefined') {
            console.log("initGameState() - Game state already exists");
        } else {
            // Create default game state if not exists
            console.log("initGameState() - Creating new game state");
            
            if (typeof window.getDefaultGameState === 'function') {
                window.gameState = window.getDefaultGameState();
            } else {
                // Fallback if getDefaultGameState is not available
                window.gameState = {
                    settings: {
                        tickRate: 1000,
                        autoSaveInterval: 30
                    },
                    lastTickTime: 0,
                    ticksSinceDayStart: 0,
                    gameSpeed: 1,
                    prestigeLevel: 0,
                    prestigePoints: 0,
                    gold: 0,
                    age: 18,
                    day: 1,
                    lifeQuality: 50,
                    energy: 100,
                    maxEnergy: 100,
                    energyRechargeRate: 0.1,
                    skills: {
                        "Map Awareness": 1
                    },
                    skillProgress: {},
                    achievements: [],
                    statistics: {
                        totalGoldEarned: 0,
                        prestigeCount: 0
                    },
                    gameActive: true,
                    gamePaused: false,
                    currentSeason: "Spring",
                    year: 1
                };
            }
        }
        
        // Try to load saved game
        if (typeof window.loadGameState === 'function') {
            const savedState = window.loadGameState();
            
            if (savedState) {
                Object.assign(window.gameState, savedState);
                console.log("initGameState() - Loaded saved game state");
            }
        }
        
        // Mark as initialized
        systemStatus.gameState = true;
        
        console.log("initGameState() - Game state initialized successfully");
        return true;
    } catch (error) {
        console.error("Error initializing game state:", error);
        return false;
    }
}

// Initialize UI system
function initUISystem() {
    console.log("initUISystem() - Initializing UI system");
    
    try {
        // Setup event log
        if (typeof window.setupEventLog === 'function') {
            window.setupEventLog();
        }
        
        // Setup game controls
        if (typeof window.setupGameControls === 'function') {
            window.setupGameControls();
        }
        
        // Setup panel close buttons
        const closeButtons = document.querySelectorAll('.close-button');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const panelId = button.getAttribute('data-panel');
                if (panelId) {
                    const panel = document.getElementById(panelId);
                    if (panel) {
                        panel.style.display = 'none';
                    }
                }
            });
        });
        
        // Setup action buttons
        setupActionButtons();
        
        // Mark as initialized
        systemStatus.uiSystem = true;
        
        console.log("initUISystem() - UI system initialized successfully");
        return true;
    } catch (error) {
        console.error("Error initializing UI system:", error);
        return false;
    }
}

// Setup action buttons
function setupActionButtons() {
    console.log("setupActionButtons() - Setting up action buttons");
    
    // Job button
    const jobButton = document.getElementById('job-button');
    if (jobButton) {
        jobButton.addEventListener('click', () => {
            const jobsPanel = document.getElementById('jobs-panel');
            if (jobsPanel) {
                if (typeof window.setupJobsUI === 'function') {
                    window.setupJobsUI();
                }
                jobsPanel.style.display = 'block';
            }
        });
    }
    
    // Skill button
    const skillButton = document.getElementById('skill-button');
    if (skillButton) {
        skillButton.addEventListener('click', () => {
            const skillsPanel = document.getElementById('skills-panel');
            if (skillsPanel) {
                if (typeof window.updateSkillDisplay === 'function') {
                    window.updateSkillDisplay();
                }
                skillsPanel.style.display = 'block';
            }
        });
    }
    
    // Shop button
    const shopButton = document.getElementById('shop-button');
    if (shopButton) {
        shopButton.addEventListener('click', () => {
            const shopPanel = document.getElementById('shop-panel');
            if (shopPanel) {
                // Will implement shop display later
                shopPanel.style.display = 'block';
            }
        });
    }
    
    // Achievements button
    const achievementsButton = document.getElementById('achievements-button');
    if (achievementsButton) {
        achievementsButton.addEventListener('click', () => {
            const achievementsPanel = document.getElementById('achievements-panel');
            if (achievementsPanel) {
                if (typeof window.setupAchievementsUI === 'function') {
                    window.setupAchievementsUI();
                }
                achievementsPanel.style.display = 'block';
            }
        });
    }
    
    // Prestige button
    const prestigeButton = document.getElementById('prestige-button');
    if (prestigeButton) {
        prestigeButton.addEventListener('click', () => {
            const prestigePanel = document.getElementById('prestige-panel');
            if (prestigePanel) {
                if (typeof window.setupPrestigeUI === 'function') {
                    window.setupPrestigeUI();
                }
                prestigePanel.style.display = 'block';
            }
        });
    }
}

// Load game data
async function loadGameData() {
    console.log("loadGameData() - Loading game data from files");
    
    try {
        // Use existing data loading function if available
        if (typeof window.loadGameDataFromServer === 'function') {
            await window.loadGameDataFromServer();
            console.log("loadGameData() - Game data loaded successfully");
            return true;
        }
        
        // Fallback: load data directly
        const [skills, jobs, achievements] = await Promise.all([
            fetch('skills.json').then(response => response.json()).catch(() => []),
            fetch('jobs.json').then(response => response.json()).catch(() => []),
            fetch('achievements.json').then(response => response.json()).catch(() => [])
        ]);
        
        // Process loaded data
        
        // Initialize skills
        if (Array.isArray(skills) && skills.length > 0) {
            if (!gameState.skills) {
                gameState.skills = {};
            }
            
            skills.forEach(skill => {
                if (skill && skill.name) {
                    // Only add if not already present
                    if (!gameState.skills[skill.name]) {
                        gameState.skills[skill.name] = {
                            level: 1,
                            description: skill.description || '',
                            icon: skill.icon || ''
                        };
                    }
                }
            });
        }
        
        // Initialize jobs
        if (Array.isArray(jobs) && jobs.length > 0) {
            gameState.jobs = jobs;
        }
        
        // Initialize achievements
        if (Array.isArray(achievements) && achievements.length > 0) {
            gameState.achievements = achievements;
        }
        
        console.log("loadGameData() - Game data loaded successfully");
        return true;
    } catch (error) {
        console.error("Error loading game data:", error);
        return false;
    }
}

// Initialize job system
function initJobSystem() {
    console.log("initJobSystem() - Initializing job system");
    
    try {
        // Setup initial job if needed
        if (!gameState.activeJob && gameState.jobs && gameState.jobs.length > 0) {
            // Find entry-level job that player meets requirements for
            const availableJobs = typeof window.getAvailableJobs === 'function' ? 
                window.getAvailableJobs() : [];
            
            if (availableJobs.length > 0) {
                const firstJob = availableJobs[0];
                const jobIndex = gameState.jobs.findIndex(job => job.id === firstJob.id);
                
                if (jobIndex >= 0 && typeof window.applyForJob === 'function') {
                    window.applyForJob(jobIndex, firstJob.tier || 0);
                    console.log(`initJobSystem() - Applied for initial job: ${firstJob.title}`);
                }
            }
        }
        
        // Setup job UI
        if (typeof window.setupJobsUI === 'function') {
            window.setupJobsUI();
        }
        
        // Mark as initialized
        systemStatus.jobSystem = true;
        
        console.log("initJobSystem() - Job system initialized successfully");
        return true;
    } catch (error) {
        console.error("Error initializing job system:", error);
        return false;
    }
}

// Initialize prestige system
function initPrestigeSystem() {
    console.log("initPrestigeSystem() - Initializing prestige system");
    
    try {
        // Initialize prestige system if function exists
        if (typeof window.initPrestigeSystem === 'function') {
            window.initPrestigeSystem();
        }
        
        // Apply prestige bonuses if player has prestiged
        if (gameState.prestigeLevel > 0 && typeof window.applyPrestigeBonuses === 'function') {
            window.applyPrestigeBonuses();
        }
        
        // Mark as initialized
        systemStatus.prestigeSystem = true;
        
        console.log("initPrestigeSystem() - Prestige system initialized successfully");
        return true;
    } catch (error) {
        console.error("Error initializing prestige system:", error);
        return false;
    }
}

// Initialize display system
function initDisplaySystem() {
    console.log("initDisplaySystem() - Initializing display system");
    
    try {
        // Update all displays if function exists
        if (typeof window.updateAllDisplays === 'function') {
            window.updateAllDisplays();
        }
        
        // Mark as initialized
        systemStatus.displaySystem = true;
        
        console.log("initDisplaySystem() - Display system initialized successfully");
        return true;
    } catch (error) {
        console.error("Error initializing display system:", error);
        return false;
    }
}

// Start game loop
function startGameLoop() {
    console.log("startGameLoop() - Starting game loop");
    
    try {
        // Start game loop if function exists
        if (typeof window.startGameLoop === 'function') {
            window.startGameLoop();
            
            // Mark as initialized
            systemStatus.gameLoop = true;
            
            console.log("startGameLoop() - Game loop started successfully");
            return true;
        } else {
            console.error("startGameLoop function not found!");
            return false;
        }
    } catch (error) {
        console.error("Error starting game loop:", error);
        return false;
    }
}

// Debug function to check system status
function checkSystemStatus() {
    console.log("System Status:", systemStatus);
    
    const allReady = Object.values(systemStatus).every(status => status === true);
    console.log(`All systems ready: ${allReady}`);
    
    return systemStatus;
}

// Debug function to manually initialize missing systems
function initMissingSystems() {
    console.log("Initializing missing systems...");
    
    if (!systemStatus.gameState) initGameState();
    if (!systemStatus.uiSystem) initUISystem();
    if (!systemStatus.jobSystem) initJobSystem();
    if (!systemStatus.prestigeSystem) initPrestigeSystem();
    if (!systemStatus.displaySystem) initDisplaySystem();
    if (!systemStatus.gameLoop) startGameLoop();
    
    return checkSystemStatus();
}

// Make functions available globally
window.initializeGame = initializeGame;
window.checkSystemStatus = checkSystemStatus;
window.initMissingSystems = initMissingSystems;

console.log("system-integration.js - Module loaded successfully");