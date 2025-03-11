// skill-system-integration.js
// Integrates the enhanced skill system with the existing game

console.log("skill-system-integration.js - Module loading");

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing skill system integration");
    
    // Initialize the enhanced skill system after a short delay
    // to ensure other systems are loaded
    setTimeout(initializeEnhancedSystems, 500);
});

// Main initialization function
async function initializeEnhancedSystems() {
    console.log("initializeEnhancedSystems() - Starting initialization");
    
    try {
        // 1. Replace the original skills.json and jobs.json with enhanced versions
        await replaceDataFiles();
        
        // 2. Initialize the enhanced skill system
        initializeSkillSystem();
        
        // 3. Initialize the enhanced job system
        initializeEnhancedJobSystem();
        
        // 4. Set up the skill UI
        setupSkillUI();
        
        // 5. Update displays
        updateAllDisplays();
        
        console.log("initializeEnhancedSystems() - Initialization complete");
    } catch (error) {
        console.error("Error initializing enhanced systems:", error);
    }
}

// Replace the original data files with enhanced versions
async function replaceDataFiles() {
    console.log("replaceDataFiles() - Replacing original data files");
    
    try {
        // Replace skills.json
        const skillsResponse = await fetch('skills.json');
        if (skillsResponse.ok) {
            const skillsData = await skillsResponse.json();
            
            // Use the enhanced data to override the original
            window.skillsData = skillsData;
            
            console.log("replaceDataFiles() - skills.json loaded");
        } else {
            console.warn("skills.json not found, will use default skills.json");
        }
        
        // Replace jobs.json
        const jobsResponse = await fetch('jobs.json');
        if (jobsResponse.ok) {
            const jobsData = await jobsResponse.json();
            
            // Use the enhanced data to override the original
            window.jobsData = jobsData;
            
            console.log("replaceDataFiles() - jobs.json loaded");
        } else {
            console.warn("jobs.json not found, will use default jobs.json");
        }
        
        return true;
    } catch (error) {
        console.error("Error loading data files:", error);
        return false;
    }
}

// Initialize the enhanced skill system
function initializeSkillSystem() {
    console.log("initializeSkillSystem() - Initializing enhanced skill system");
    
    // Check if the function is available
    if (typeof window.initializeSkillSystem === 'function') {
        window.initializeSkillSystem();
    } else {
        console.error("initializeSkillSystem function not available");
        
        // Try to load the skill-system.js module
        loadModule('skill-system.js')
            .then(() => {
                if (typeof window.initializeSkillSystem === 'function') {
                    window.initializeSkillSystem();
                }
            })
            .catch(error => {
                console.error("Error loading skill-system.js module:", error);
            });
    }
}

// Initialize the enhanced job system
function initializeEnhancedJobSystem() {
    console.log("initializeEnhancedJobSystem() - Initializing enhanced job system");
    
    // Check if the function is available
    if (typeof window.initializeEnhancedJobSystem === 'function') {
        window.initializeEnhancedJobSystem();
    } else {
        console.error("initializeEnhancedJobSystem function not available");
        
        // Try to load the enhanced-job-manager.js module
        loadModule('enhanced-job-manager.js')
            .then(() => {
                if (typeof window.initializeEnhancedJobSystem === 'function') {
                    window.initializeEnhancedJobSystem();
                }
            })
            .catch(error => {
                console.error("Error loading enhanced-job-manager.js module:", error);
            });
    }
}

// Set up the enhanced skill UI
function setupSkillUI() {
    console.log("setupSkillUI() - Setting up enhanced skill UI");
    
    // Check if the function is available
    if (typeof window.setupSkillUI === 'function') {
        window.setupSkillUI();
    } else {
        console.error("setupSkillUI function not available");
        
        // Try to load the skill-ui.js module
        loadModule('skill-ui.js')
            .then(() => {
                if (typeof window.setupSkillUI === 'function') {
                    window.setupSkillUI();
                }
            })
            .catch(error => {
                console.error("Error loading skill-ui.js module:", error);
            });
    }
}

// Update all displays
function updateAllDisplays() {
    console.log("updateAllDisplays() - Updating all displays");
    
    // Update skill display
    if (typeof window.updateSkillDisplay === 'function') {
        window.updateSkillDisplay();
    }
    
    // Update job display
    if (typeof window.updateJobDisplay === 'function') {
        window.updateJobDisplay();
    }
    
    // Update overall display
    if (typeof window.updateDisplay === 'function') {
        window.updateDisplay();
    }
}

// Helper function to dynamically load a module
function loadModule(modulePath) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = modulePath;
        
        script.onload = () => {
            console.log(`Module ${modulePath} loaded successfully`);
            resolve();
        };
        
        script.onerror = () => {
            reject(new Error(`Failed to load module: ${modulePath}`));
        };
        
        document.head.appendChild(script);
    });
}

// Add on-skill-level-up event handler
window.onSkillLevelUp = function(skillId, newLevel) {
    console.log(`onSkillLevelUp() - Skill ${skillId} leveled up to ${newLevel}`);
    
    // Play sound effect
    if (typeof window.playSound === 'function') {
        window.playSound('skill-level-up');
    }
    
    // Show notification
    if (typeof window.showNotification === 'function') {
        const skillName = gameState.skills[skillId].name || skillId;
        window.showNotification("Skill Increased", `Your ${skillName} skill is now level ${newLevel}!`, "success");
    }
    
    // Handle skill milestone effects
    handleSkillMilestone(skillId, newLevel);
    
    // Update displays
    updateAllDisplays();
};

// Handle skill milestone effects
function handleSkillMilestone(skillId, level) {
    // Every 10 levels of a skill is a major milestone
    if (level % 10 === 0) {
        // Log special event
        if (typeof window.logEvent === 'function') {
            const skillName = gameState.skills[skillId].name || skillId;
            window.logEvent(`You've reached a milestone in ${skillName}! Level ${level} unlocks new possibilities.`, 'skill');
        }
        
        // Add attribute point at significant milestones
        if (level >= 50 && level % 20 === 0) {
            // Get related attribute
            const relatedAttribute = getRelatedAttributeForSkill(skillId);
            
            if (relatedAttribute && typeof window.increaseAttribute === 'function') {
                window.increaseAttribute(relatedAttribute);
                
                // Log attribute increase
                if (typeof window.logEvent === 'function') {
                    const attrName = gameState.attributes[relatedAttribute].name || relatedAttribute;
                    window.logEvent(`Your mastery of ${skillName} has increased your ${attrName}!`, 'attribute');
                }
            }
        }
        
        // Unlock achievements tied to skill levels
        checkSkillAchievements(skillId, level);
    }
}

// Get the related attribute for a skill
function getRelatedAttributeForSkill(skillId) {
    // First try to get it from the skill category
    const skill = gameState.skills[skillId];
    
    if (skill && skill.categoryId && gameState.skillCategories[skill.categoryId]) {
        return gameState.skillCategories[skill.categoryId].primaryAttribute;
    }
    
    // Fallback mappings
    const skillToAttributeMap = {
        "map_awareness": "intelligence",
        "navigation": "adaptability",
        "communication": "creativity",
        "technical_drawing": "focus",
        "data_analysis": "intelligence",
        "programming": "intelligence",
        "problem_solving": "intelligence",
        "decision_making": "discipline",
        "strategic_thinking": "intelligence",
        "systems_thinking": "intelligence",
        "organization": "discipline",
        "time_management": "discipline",
        "leadership": "adaptability",
        "empathy": "creativity",
        "negotiation": "adaptability",
        "critical_thinking": "intelligence",
        "pattern_recognition": "intelligence",
        "creative_writing": "creativity",
        "visual_design": "creativity",
        "innovation": "creativity"
    };
    
    return skillToAttributeMap[skillId] || "intelligence";
}

// Check for skill-related achievements
function checkSkillAchievements(skillId, level) {
    // Example milestone achievements
    if (level >= 50) {
        unlockAchievement("skill_master", `Reached Level 50 in ${skillId}`);
    }
    
    if (level >= 100) {
        unlockAchievement("skill_grandmaster", `Reached Maximum Level in ${skillId}`);
    }
    
    // Specific skill achievements
    switch(skillId) {
        case "map_awareness":
            if (level >= 25) unlockAchievement("map_adept", "The world becomes clearer");
            if (level >= 75) unlockAchievement("map_master", "You can navigate anywhere");
            break;
        case "programming":
            if (level >= 30) unlockAchievement("coder", "You've become proficient in coding");
            if (level >= 80) unlockAchievement("software_architect", "Design complex software systems");
            break;
        case "leadership":
            if (level >= 40) unlockAchievement("team_leader", "People naturally follow your guidance");
            if (level >= 90) unlockAchievement("visionary_leader", "Inspire others to greatness");
            break;
        // Add more specific achievements as needed
    }
}

// Unlock an achievement
function unlockAchievement(id, description) {
    // Check if achievements array exists
    if (!gameState.unlockedAchievements) {
        gameState.unlockedAchievements = [];
    }
    
    // Check if already unlocked
    if (gameState.unlockedAchievements.includes(id)) {
        return;
    }
    
    // Add to unlocked achievements
    gameState.unlockedAchievements.push(id);
    
    // Log achievement
    if (typeof window.logEvent === 'function') {
        window.logEvent(`Achievement Unlocked: ${description}`, 'achievement');
    }
    
    // Show notification
    if (typeof window.showNotification === 'function') {
        window.showNotification("Achievement Unlocked", description, "success");
    }
    
    // Play achievement sound
    if (typeof window.playSound === 'function') {
        window.playSound('achievement');
    }
}

// Export functions for module usage
export {
    initializeEnhancedSystems,
    updateAllDisplays,
    handleSkillMilestone
};

// Make functions available globally
window.initializeEnhancedSystems = initializeEnhancedSystems;
window.updateAllDisplays = updateAllDisplays;
window.handleSkillMilestone = handleSkillMilestone;

console.log("skill-system-integration.js - Module loaded successfully");