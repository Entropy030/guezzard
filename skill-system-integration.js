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
        // Fetch and process skills.json
        const skillsResponse = await fetch('skills.json');
        const skillsData = skillsResponse.ok ? await skillsResponse.json() : [];
        
        // Fetch and process jobs.json
        const jobsResponse = await fetch('jobs.json');
        const jobsData = jobsResponse.ok ? await jobsResponse.json() : [];
        
        // Update gameState with loaded data
        if (skillsData.length > 0) {
            window.gameState.skills = processSkillsData(skillsData);
        }
        
        if (jobsData.length > 0) {
            window.gameState.jobs = jobsData;
        }
        
        console.log("replaceDataFiles() - Data files processed successfully");
    } catch (error) {
        console.error("Error loading data files:", error);
    }
}

// Process skills data
function processSkillsData(skillsData) {
    const processedSkills = {};
    
    skillsData.forEach(category => {
        if (category.items) {
            category.items.forEach(skill => {
                processedSkills[skill.id] = {
                    name: skill.name,
                    description: skill.description,
                    level: skill.baseValue || 0,
                    xp: 0,
                    categoryId: category.id
                };
            });
        }
    });
    
    // Ensure Map Awareness exists
    if (!processedSkills['map_awareness']) {
        processedSkills['map_awareness'] = {
            name: "Map Awareness",
            description: "Ability to read and understand maps",
            level: 1,
            xp: 0,
            categoryId: 'analytical'
        };
    }
    
    return processedSkills;
}

// Skill system initialization
function initializeSkillSystem() {
    console.log("initializeSkillSystem() - Setting up skill system");
    
    // Call skill system initialization if available
    if (typeof window.initializeSkillSystem === 'function') {
        window.initializeSkillSystem();
    }
}

// Enhanced job system initialization
function initializeEnhancedJobSystem() {
    console.log("initializeEnhancedJobSystem() - Setting up job system");
    
    // Call job system initialization if available
    if (typeof window.initializeEnhancedJobSystem === 'function') {
        window.initializeEnhancedJobSystem();
    }
}

// Setup skill UI
function setupSkillUI() {
    console.log("setupSkillUI() - Setting up skill interface");
    
    // Call skill UI setup if available
    if (typeof window.setupSkillUI === 'function') {
        window.setupSkillUI();
    }
}

// Export functions for module usage
export {
    initializeEnhancedSystems,
    replaceDataFiles,
    processSkillsData
};

// Make functions available globally
window.initializeEnhancedSystems = initializeEnhancedSystems;