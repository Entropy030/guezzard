// skill-ui.js
// Enhanced UI for the skill system

console.log("skill-ui.js - Module loading");

// DOM references
let skillsPanel;
let skillsList;
let attributesSection;
let categoriesNav;
let skillDetailsPanel;
let currentCategory = null;

// Initialize the skill UI
export function setupSkillUI() {
    console.log("setupSkillUI() - Setting up skill UI");
    
    // Get references to DOM elements
    skillsPanel = document.getElementById('skills-panel');
    skillsList = document.getElementById('skills-list');
    
    if (!skillsPanel || !skillsList) {
        console.error("setupSkillUI() - Skills panel or list not found");
        return false;
    }
    
    // Create enhanced UI structure
    createEnhancedSkillUI();
    
    // Add event listener to the skills button in the main UI
    const skillButton = document.getElementById('skill-button');
    if (skillButton) {
        skillButton.addEventListener('click', () => {
            updateSkillDisplay();
            if (skillsPanel) {
                skillsPanel.style.display = 'block';
            }
        });
    }
    
    // Add event listener to close button
    const closeButton = skillsPanel.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            skillsPanel.style.display = 'none';
            
            // Clear skill details panel when closing
            if (skillDetailsPanel) {
                skillDetailsPanel.style.display = 'none';
            }
        });
    }
    
    console.log("setupSkillUI() - Skill UI setup complete");
    return true;
}

// Create enhanced skill UI structure
function createEnhancedSkillUI() {
    console.log("createEnhancedSkillUI() - Creating enhanced skill UI");
    
    // Clear existing content
    skillsPanel.innerHTML = '';
    
    // Create header
    const header = document.createElement('h3');
    header.textContent = 'Skills & Attributes';
    skillsPanel.appendChild(header);
    
    // Create attributes section
    attributesSection = document.createElement('div');
    attributesSection.className = 'attributes-section';
    skillsPanel.appendChild(attributesSection);
    
    // Create categories navigation
    categoriesNav = document.createElement('div');
    categoriesNav.className = 'skill-categories-nav';
    skillsPanel.appendChild(categoriesNav);
    
    // Create skills container
    const skillsContainer = document.createElement('div');
    skillsContainer.className = 'skills-container';
    skillsPanel.appendChild(skillsContainer);
    
    // Create skills list inside container
    skillsList = document.createElement('div');
    skillsList.id = 'skills-list';
    skillsList.className = 'skills-list';
    skillsContainer.appendChild(skillsList);
    
    // Create skill details panel
    skillDetailsPanel = document.createElement('div');
    skillDetailsPanel.className = 'skill-details-panel';
    skillDetailsPanel.style.display = 'none';
    skillsPanel.appendChild(skillDetailsPanel);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'Close';
    closeButton.setAttribute('data-panel', 'skills-panel');
    skillsPanel.appendChild(closeButton);
    
    // Add CSS styles for the enhanced UI
    addSkillUIStyles();
}

// Add CSS styles for the skill UI
function addSkillUIStyles() {
    // Check if styles are already added
    if (document.getElementById('skill-ui-styles')) {
        return;
    }
    
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.id = 'skill-ui-styles';
    
    // Add CSS rules
    styleElement.textContent = `
        /* Enhanced Skills Panel Styles */
        #skills-panel {
            max-width: 800px;
            width: 90%;
            height: 80vh;
            display: flex;
            flex-direction: column;
            padding: 0;
            overflow: hidden;
        }
        
        #skills-panel h3 {
            padding: 15px;
            margin: 0;
            text-align: center;
            background-color: rgba(123, 104, 238, 0.1);
            border-bottom: 1px solid rgba(123, 104, 238, 0.2);
        }
        
        .attributes-section {
            padding: 15px;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            gap: 10px;
            background-color: rgba(40, 40, 60, 0.5);
            border-bottom: 1px solid rgba(123, 104, 238, 0.2);
        }
        
        .attribute-item {
            background-color: rgba(50, 50, 70, 0.8);
            border-radius: 8px;
            padding: 10px;
            min-width: 120px;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .attribute-item:hover {
            background-color: rgba(70, 70, 90, 0.8);
            transform: translateY(-2px);
        }
        
        .attribute-icon {
            font-size: 1.5em;
            margin-bottom: 5px;
            color: #a496ff;
        }
        
        .attribute-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .attribute-value {
            background-color: rgba(123, 104, 238, 0.2);
            border-radius: 15px;
            padding: 2px 8px;
            font-weight: bold;
        }
        
        .skill-categories-nav {
            display: flex;
            overflow-x: auto;
            padding: 10px;
            background-color: rgba(30, 30, 45, 0.8);
            border-bottom: 1px solid rgba(123, 104, 238, 0.2);
        }
        
        .category-tab {
            padding: 8px 15px;
            background-color: rgba(50, 50, 70, 0.5);
            border-radius: 20px;
            margin-right: 10px;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s ease;
        }
        
        .category-tab:hover {
            background-color: rgba(70, 70, 90, 0.8);
        }
        
        .category-tab.active {
            background-color: rgba(123, 104, 238, 0.6);
            color: white;
        }
        
        .skills-container {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
        }
        
        .skills-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .skill-item {
            background-color: rgba(40, 40, 60, 0.7);
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid rgba(123, 104, 238, 0.2);
        }
        
        .skill-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            border-color: rgba(123, 104, 238, 0.5);
        }
        
        .skill-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .skill-name {
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .skill-level {
            background-color: rgba(123, 104, 238, 0.2);
            border-radius: 15px;
            padding: 2px 8px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .skill-progress-bar {
            height: 8px;
            background-color: rgba(30, 30, 45, 0.5);
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .skill-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4776E6, #8E54E9);
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        
        .skill-stats {
            display: flex;
            justify-content: space-between;
            font-size: 0.8em;
            color: #aaa;
        }
        
        .skill-details-panel {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 500px;
            background-color: rgba(30, 30, 45, 0.95);
            border-radius: 12px;
            padding: 20px;
            z-index: 10;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(123, 104, 238, 0.4);
        }
        
        .skill-details-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(123, 104, 238, 0.2);
        }
        
        .skill-details-name {
            font-size: 1.4em;
            font-weight: bold;
        }
        
        .skill-details-level {
            background-color: rgba(123, 104, 238, 0.3);
            border-radius: 20px;
            padding: 5px 12px;
            font-weight: bold;
        }
        
        .skill-details-description {
            margin-bottom: 15px;
            line-height: 1.5;
        }
        
        .skill-details-progress {
            margin-bottom: 20px;
        }
        
        .skill-details-progress-bar {
            height: 12px;
            background-color: rgba(30, 30, 45, 0.5);
            border-radius: 6px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .skill-details-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4776E6, #8E54E9);
            border-radius: 6px;
        }
        
        .skill-details-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .skill-stat-item {
            background-color: rgba(40, 40, 60, 0.7);
            border-radius: 8px;
            padding: 10px;
        }
        
        .skill-stat-label {
            font-size: 0.8em;
            color: #aaa;
            margin-bottom: 5px;
        }
        
        .skill-stat-value {
            font-weight: bold;
        }
        
        .skill-details-synergies {
            margin-bottom: 20px;
        }
        
        .skill-details-synergies h4 {
            margin-bottom: 10px;
            color: #a496ff;
        }
        
        .synergy-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .synergy-item {
            background-color: rgba(40, 40, 60, 0.7);
            border-radius: 15px;
            padding: 5px 10px;
            font-size: 0.9em;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .synergy-item:hover {
            background-color: rgba(123, 104, 238, 0.3);
        }
        
        .skill-details-actions {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-top: 20px;
        }
        
        .skill-details-actions button {
            flex: 1;
            padding: 10px;
            border-radius: 20px;
            border: none;
            background: linear-gradient(135deg, #4776E6, #8E54E9);
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .skill-details-actions button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }
        
        .skill-details-actions button:disabled {
            background: linear-gradient(135deg, #666, #999);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .close-details-button {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            color: #a496ff;
            font-size: 1.5em;
            cursor: pointer;
        }
        
        .training-options {
            background-color: rgba(40, 40, 60, 0.7);
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
        }
        
        .training-options h4 {
            margin-top: 0;
            margin-bottom: 10px;
            color: #a496ff;
        }
        
        .training-slider {
            width: 100%;
            margin: 10px 0;
        }
        
        .training-time {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .focus-options {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .focus-option {
            flex: 1;
            padding: 8px;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            background-color: rgba(30, 30, 45, 0.5);
            transition: all 0.2s ease;
        }
        
        .focus-option.selected {
            background-color: rgba(123, 104, 238, 0.3);
            border: 1px solid rgba(123, 104, 238, 0.6);
        }
        
        .focus-option:hover {
            background-color: rgba(50, 50, 70, 0.8);
        }
        
        .training-result {
            background-color: rgba(30, 30, 45, 0.5);
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 10px;
            font-size: 0.9em;
        }
        
        .energy-cost {
            color: #ff6b6b;
            font-weight: bold;
        }
        
        .xp-gain {
            color: #4dd0e1;
            font-weight: bold;
        }
    `;
    
    // Add style element to document head
    document.head.appendChild(styleElement);
    console.log("addSkillUIStyles() - Skill UI styles added");
}

// Update skill display
export function updateSkillDisplay() {
    console.log("updateSkillDisplay() - Updating skill display");
    
    // Check if UI elements exist
    if (!skillsPanel || !attributesSection || !categoriesNav || !skillsList) {
        console.error("updateSkillDisplay() - UI elements not found");
        setupSkillUI();
        return;
    }
    
    // Update attributes section
    updateAttributesSection();
    
    // Update categories navigation
    updateCategoriesNav();
    
    // Update skills list based on current category
    updateSkillsList();
    
    console.log("updateSkillDisplay() - Skill display updated");
}

// Update attributes section
function updateAttributesSection() {
    console.log("updateAttributesSection() - Updating attributes");
    
    // Clear existing content
    attributesSection.innerHTML = '';
    
    // Get all attributes
    const attributes = typeof window.getAllAttributes === 'function' ? 
        window.getAllAttributes() : [];
    
    if (!attributes || attributes.length === 0) {
        attributesSection.innerHTML = '<div class="no-attributes">No attributes found.</div>';
        return;
    }
    
    // Create attribute items
    attributes.forEach(attribute => {
        const attributeItem = document.createElement('div');
        attributeItem.className = 'attribute-item';
        attributeItem.setAttribute('data-attribute', attribute.id);
        
        // Create attribute content
        attributeItem.innerHTML = `
            <div class="attribute-icon">
                <i class="fas fa-${attribute.icon || 'star'}"></i>
            </div>
            <div class="attribute-name">${attribute.name}</div>
            <div class="attribute-value">${attribute.value}</div>
        `;
        
        // Add tooltip with description
        attributeItem.title = attribute.description;
        
        // Add click event to show attribute details
        attributeItem.addEventListener('click', () => {
            showAttributeDetails(attribute.id);
        });
        
        attributesSection.appendChild(attributeItem);
    });
}

// Update categories navigation
function updateCategoriesNav() {
    console.log("updateCategoriesNav() - Updating categories");
    
    // Clear existing content
    categoriesNav.innerHTML = '';
    
    // Get all categories
    const categories = typeof window.getAllCategories === 'function' ? 
        window.getAllCategories() : [];
    
    if (!categories || categories.length === 0) {
        categoriesNav.innerHTML = '<div class="no-categories">No skill categories found.</div>';
        return;
    }
    
    // Create "All" category tab
    const allCategoryTab = document.createElement('div');
    allCategoryTab.className = 'category-tab';
    allCategoryTab.textContent = 'All Skills';
    allCategoryTab.setAttribute('data-category', 'all');
    
    // Set active class if no category is selected or "all" is selected
    if (!currentCategory || currentCategory === 'all') {
        allCategoryTab.classList.add('active');
        currentCategory = 'all';
    }
    
    // Add click event
    allCategoryTab.addEventListener('click', () => {
        setActiveCategory('all');
    });
    
    categoriesNav.appendChild(allCategoryTab);
    
    // Create category tabs
    categories.forEach(category => {
        // Skip attributes category
        if (category.id === 'attributes') {
            return;
        }
        
        const categoryTab = document.createElement('div');
        categoryTab.className = 'category-tab';
        categoryTab.textContent = category.name;
        categoryTab.setAttribute('data-category', category.id);
        
        // Set active class if this category is selected
        if (currentCategory === category.id) {
            categoryTab.classList.add('active');
        }
        
        // Add click event
        categoryTab.addEventListener('click', () => {
            setActiveCategory(category.id);
        });
        
        categoriesNav.appendChild(categoryTab);
    });
}

// Set active category
function setActiveCategory(categoryId) {
    console.log(`setActiveCategory() - Setting active category to ${categoryId}`);
    
    // Update current category
    currentCategory = categoryId;
    
    // Update active class in category tabs
    const categoryTabs = categoriesNav.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        if (tab.getAttribute('data-category') === categoryId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update skills list
    updateSkillsList();
}

// Update skills list
function updateSkillsList() {
    console.log("updateSkillsList() - Updating skills list");
    
    // Clear existing content
    skillsList.innerHTML = '';
    
    // Get skills based on current category
    let skills = [];
    
    if (currentCategory === 'all') {
        // Get all skills
        for (const skillId in gameState.skills) {
            if (typeof window.getSkillInfo === 'function') {
                const skillInfo = window.getSkillInfo(skillId);
                if (skillInfo) {
                    skills.push(skillInfo);
                }
            } else {
                // Fallback if getSkillInfo is not available
                skills.push(gameState.skills[skillId]);
            }
        }
    } else {
        // Get skills for specific category
        if (typeof window.getSkillsByCategory === 'function') {
            skills = window.getSkillsByCategory(currentCategory);
        } else {
            // Fallback if getSkillsByCategory is not available
            skills = Object.values(gameState.skills).filter(
                skill => skill.categoryId === currentCategory
            );
        }
    }
    
    // Display message if no skills
    if (!skills || skills.length === 0) {
        skillsList.innerHTML = '<div class="no-skills">No skills found in this category.</div>';
        return;
    }
    
    // Create skill items
    skills.forEach(skill => {
        // Skip skills with level 0 that are not yet unlocked
        if (skill.level === 0 && skill.baseValue === 0) {
            return;
        }
        
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.setAttribute('data-skill', skill.id);
        
        // Calculate percentage to next level
        let percentToNextLevel = 0;
        if (typeof skill.percentToNextLevel !== 'undefined') {
            percentToNextLevel = skill.percentToNextLevel;
        } else if (typeof window.calculateXPForLevel === 'function') {
            const xpNeeded = window.calculateXPForLevel(skill.level);
            percentToNextLevel = (skill.xp / xpNeeded) * 100;
        }
        
        // Create skill content
        skillItem.innerHTML = `
            <div class="skill-header">
                <div class="skill-name">${skill.name}</div>
                <div class="skill-level">Lvl ${skill.level}</div>
            </div>
            <div class="skill-progress-bar">
                <div class="skill-progress-fill" style="width: ${percentToNextLevel}%"></div>
            </div>
            <div class="skill-stats">
                <div class="skill-category">${getCategoryName(skill.categoryId)}</div>
                <div class="skill-xp">${Math.floor(skill.xp)} / ${typeof window.calculateXPForLevel === 'function' ? window.calculateXPForLevel(skill.level) : '?'} XP</div>
            </div>
        `;
        
        // Add click event to show skill details
        skillItem.addEventListener('click', () => {
            showSkillDetails(skill.id);
        });
        
        skillsList.appendChild(skillItem);
    });
}

// Get category name from id
function getCategoryName(categoryId) {
    if (gameState.skillCategories && gameState.skillCategories[categoryId]) {
        return gameState.skillCategories[categoryId].name;
    }
    return categoryId || 'Unknown';
}

// Show skill details
function showSkillDetails(skillId) {
    console.log(`showSkillDetails() - Showing details for skill ${skillId}`);
    
    // Get skill info
    const skillInfo = typeof window.getSkillInfo === 'function' ? 
        window.getSkillInfo(skillId) : gameState.skills[skillId];
    
    if (!skillInfo) {
        console.error(`showSkillDetails() - Skill ${skillId} not found`);
        return;
    }
    
    // Show details panel
    skillDetailsPanel.style.display = 'block';
    
    // Create skill details content
    skillDetailsPanel.innerHTML = `
        <button class="close-details-button">&times;</button>
        <div class="skill-details-header">
            <div class="skill-details-name">${skillInfo.name}</div>
            <div class="skill-details-level">Level ${skillInfo.level}</div>
        </div>
        <div class="skill-details-description">${skillInfo.description}</div>
        <div class="skill-details-progress">
            <div class="skill-progress-text">Progress to Level ${skillInfo.level + 1}</div>
            <div class="skill-details-progress-bar">
                <div class="skill-details-progress-fill" style="width: ${skillInfo.percentToNextLevel}%"></div>
            </div>
            <div class="skill-xp-text">${Math.floor(skillInfo.xp)} / ${skillInfo.xpForNextLevel} XP</div>
        </div>
        <div class="skill-details-stats">
            <div class="skill-stat-item">
                <div class="skill-stat-label">Category</div>
                <div class="skill-stat-value">${getCategoryName(skillInfo.categoryId)}</div>
            </div>
            <div class="skill-stat-item">
                <div class="skill-stat-label">Base Growth Rate</div>
                <div class="skill-stat-value">${(skillInfo.growthRate * 100).toFixed(1)}%</div>
            </div>
            <div class="skill-stat-item">
                <div class="skill-stat-label">Effective Growth</div>
                <div class="skill-stat-value">${(skillInfo.effectiveGrowthRate * 100).toFixed(1)}%</div>
            </div>
            <div class="skill-stat-item">
                <div class="skill-stat-label">Synergy Bonus</div>
                <div class="skill-stat-value">+${(skillInfo.synergyBonus * 100).toFixed(1)}%</div>
            </div>
        </div>
    `;
    
    // Add synergies section if there are synergies
    if (skillInfo.synergies && skillInfo.synergies.length > 0) {
        const synergiesSection = document.createElement('div');
        synergiesSection.className = 'skill-details-synergies';
        synergiesSection.innerHTML = '<h4>Skill Synergies</h4>';
        
        const synergyList = document.createElement('div');
        synergyList.className = 'synergy-list';
        
        skillInfo.synergies.forEach(synergyId => {
            const synergySkill = gameState.skills[synergyId];
            if (synergySkill) {
                const synergyItem = document.createElement('div');
                synergyItem.className = 'synergy-item';
                synergyItem.textContent = synergySkill.name;
                synergyItem.setAttribute('data-skill', synergyId);
                
                // Add click event to show synergy skill details
                synergyItem.addEventListener('click', () => {
                    showSkillDetails(synergyId);
                });
                
                synergyList.appendChild(synergyItem);
            }
        });
        
        synergiesSection.appendChild(synergyList);
        skillDetailsPanel.appendChild(synergiesSection);
    }
    
    // Add training options
    const trainingOptions = document.createElement('div');
    trainingOptions.className = 'training-options';
    trainingOptions.innerHTML = `
        <h4>Training Options</h4>
        <div class="training-time">
            <span>Training Duration</span>
            <span class="hours-value">1 hour</span>
        </div>
        <input type="range" min="1" max="8" value="1" class="training-slider" id="hours-slider">
        
        <div class="focus-label">Focus Level</div>
        <div class="focus-options">
            <div class="focus-option selected" data-focus="0">Casual</div>
            <div class="focus-option" data-focus="1">Focused</div>
            <div class="focus-option" data-focus="2">Intense</div>
        </div>
        
        <div class="training-result">
            <div>Energy Cost: <span class="energy-cost">5</span></div>
            <div>Estimated XP Gain: <span class="xp-gain">10</span></div>
        </div>
    `;
    
    // Add training button
    const trainButton = document.createElement('button');
    trainButton.className = 'train-button';
    trainButton.textContent = 'Train Skill';
    trainButton.setAttribute('data-skill', skillId);
    
    const energyCostSpan = trainingOptions.querySelector('.energy-cost');
    const xpGainSpan = trainingOptions.querySelector('.xp-gain');
    
    // Energy check
    if (gameState.energy < 5) {
        trainButton.disabled = true;
        trainButton.textContent = 'Not Enough Energy';
    }
    
    // Add event listeners for training options
    const hoursSlider = trainingOptions.querySelector('#hours-slider');
    const hoursValue = trainingOptions.querySelector('.hours-value');
    const focusOptions = trainingOptions.querySelectorAll('.focus-option');
    
    let hours = 1;
    let focusLevel = 0;
    
    // Update training calculations
    function updateTrainingCalc() {
        // Calculate energy cost and XP gain
        const energyCost = 5 * hours * (focusLevel + 1);
        
        // Base XP gain
        let xpGain = 10 * hours;
        
        // Apply focus modifier
        const focusModifier = 0.5 + (focusLevel * 0.5); // 0.5 to 1.5
        xpGain *= focusModifier;
        
        // Apply attribute bonus if available
        if (typeof window.getAttributeValue === 'function') {
            const focusAttr = window.getAttributeValue('focus');
            const focusBonus = 1 + ((focusAttr - 5) / 15);
            xpGain *= focusBonus;
        }
        
        // Apply effective growth rate if available
        if (typeof window.calculateEffectiveGrowthRate === 'function') {
            const effectiveRate = window.calculateEffectiveGrowthRate(skillId);
            xpGain *= effectiveRate;
        } else if (skillInfo.effectiveGrowthRate) {
            xpGain *= skillInfo.effectiveGrowthRate;
        }
        
        // Update display
        energyCostSpan.textContent = energyCost;
        xpGainSpan.textContent = Math.floor(xpGain);
        
        // Check if player has enough energy
        if (gameState.energy < energyCost) {
            trainButton.disabled = true;
            trainButton.textContent = 'Not Enough Energy';
        } else {
            trainButton.disabled = false;
            trainButton.textContent = 'Train Skill';
        }
    }
    
    // Hours slider event
    hoursSlider.addEventListener('input', () => {
        hours = parseInt(hoursSlider.value);
        hoursValue.textContent = `${hours} hour${hours > 1 ? 's' : ''}`;
        updateTrainingCalc();
    });
    
    // Focus options event
    focusOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            focusOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            option.classList.add('selected');
            
            // Update focus level
            focusLevel = parseInt(option.getAttribute('data-focus'));
            
            updateTrainingCalc();
        });
    });
    
    // Initial calculation
    updateTrainingCalc();
    
    // Add training button event
    trainButton.addEventListener('click', () => {
        if (typeof window.trainSkill === 'function') {
            const success = window.trainSkill(skillId, hours, focusLevel);
            
            if (success) {
                // Play training sound
                if (typeof window.playSound === 'function') {
                    window.playSound('skill-training');
                }
                
                // Close details panel
                skillDetailsPanel.style.display = 'none';
                
                // Update skill display
                updateSkillDisplay();
            }
        } else {
            console.error("trainSkill function not available");
        }
    });
    
    // Add training actions
    const trainingActions = document.createElement('div');
    trainingActions.className = 'skill-details-actions';
    trainingActions.appendChild(trainButton);
    
    // Add cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        skillDetailsPanel.style.display = 'none';
    });
    
    trainingActions.appendChild(cancelButton);
    
    // Add training options and actions to details panel
    trainingOptions.appendChild(trainingActions);
    skillDetailsPanel.appendChild(trainingOptions);
    
    // Add close button event
    const closeButton = skillDetailsPanel.querySelector('.close-details-button');
    closeButton.addEventListener('click', () => {
        skillDetailsPanel.style.display = 'none';
    });
}

// Show attribute details
function showAttributeDetails(attributeId) {
    console.log(`showAttributeDetails() - Showing details for attribute ${attributeId}`);
    
    // Get attribute info
    const attribute = gameState.attributes[attributeId];
    
    if (!attribute) {
        console.error(`showAttributeDetails() - Attribute ${attributeId} not found`);
        return;
    }
    
    // Show details panel
    skillDetailsPanel.style.display = 'block';
    
    // Create attribute details content
    skillDetailsPanel.innerHTML = `
        <button class="close-details-button">&times;</button>
        <div class="skill-details-header">
            <div class="skill-details-name">${attribute.name}</div>
            <div class="skill-details-level">${attribute.value}</div>
        </div>
        <div class="skill-details-description">${attribute.description}</div>
        
        <div class="skill-details-stats">
            <div class="skill-stat-item">
                <div class="skill-stat-label">Current Value</div>
                <div class="skill-stat-value">${attribute.value}</div>
            </div>
            <div class="skill-stat-item">
                <div class="skill-stat-label">Maximum Value</div>
                <div class="skill-stat-value">20</div>
            </div>
        </div>
        
        <div class="attribute-effects">
            <h4>Effects</h4>
            <ul>
                ${getAttributeEffectsHTML(attributeId)}
            </ul>
        </div>
    `;
    
    // Add affected skills section
    const affectedSkills = getSkillsAffectedByAttribute(attributeId);
    
    if (affectedSkills.length > 0) {
        const affectedSection = document.createElement('div');
        affectedSection.className = 'affected-skills';
        affectedSection.innerHTML = `<h4>Affected Skills</h4>`;
        
        const skillsList = document.createElement('div');
        skillsList.className = 'synergy-list';
        
        affectedSkills.forEach(skillId => {
            const skill = gameState.skills[skillId];
            
            if (skill) {
                const skillItem = document.createElement('div');
                skillItem.className = 'synergy-item';
                skillItem.textContent = skill.name;
                skillItem.setAttribute('data-skill', skillId);
                
                // Add click event to show skill details
                skillItem.addEventListener('click', () => {
                    showSkillDetails(skillId);
                });
                
                skillsList.appendChild(skillItem);
            }
        });
        
        affectedSection.appendChild(skillsList);
        skillDetailsPanel.appendChild(affectedSection);
    }
    
    // Add improvement button only if attribute is below max
    if (attribute.value < 20) {
        const actionDiv = document.createElement('div');
        actionDiv.className = 'skill-details-actions';
        
        // Add improve button
        const improveButton = document.createElement('button');
        improveButton.className = 'improve-attribute-button';
        improveButton.textContent = 'Improve Attribute';
        improveButton.setAttribute('data-attribute', attributeId);
        
        // Add click event
        improveButton.addEventListener('click', () => {
            if (typeof window.increaseAttribute === 'function') {
                const success = window.increaseAttribute(attributeId);
                
                if (success) {
                    // Play sound
                    if (typeof window.playSound === 'function') {
                        window.playSound('attribute-increase');
                    }
                    
                    // Close details panel
                    skillDetailsPanel.style.display = 'none';
                    
                    // Update skill display
                    updateSkillDisplay();
                }
            } else {
                console.error("increaseAttribute function not available");
            }
        });
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel-button';
        cancelButton.textContent = 'Close';
        cancelButton.addEventListener('click', () => {
            skillDetailsPanel.style.display = 'none';
        });
        
        actionDiv.appendChild(improveButton);
        actionDiv.appendChild(cancelButton);
        
        skillDetailsPanel.appendChild(actionDiv);
    } else {
        // Just add close button for max attribute
        const actionDiv = document.createElement('div');
        actionDiv.className = 'skill-details-actions';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'cancel-button';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            skillDetailsPanel.style.display = 'none';
        });
        
        actionDiv.appendChild(closeButton);
        skillDetailsPanel.appendChild(actionDiv);
    }
    
    // Add close button event
    const closeButton = skillDetailsPanel.querySelector('.close-details-button');
    closeButton.addEventListener('click', () => {
        skillDetailsPanel.style.display = 'none';
    });
}

// Get HTML for attribute effects
function getAttributeEffectsHTML(attributeId) {
    let effects = '';
    
    switch (attributeId) {
        case 'intelligence':
            effects = `
                <li>Increases learning speed of analytical and technical skills</li>
                <li>Improves problem-solving and critical thinking</li>
                <li>Enhances data analysis and pattern recognition abilities</li>
            `;
            break;
        case 'creativity':
            effects = `
                <li>Enhances ability to generate novel ideas and solutions</li>
                <li>Improves artistic and design skills</li>
                <li>Increases innovative thinking and adaptability</li>
            `;
            break;
        case 'focus':
            effects = `
                <li>Improves concentration during skill training (+50% XP at max)</li>
                <li>Enhances attention to detail in analytical skills</li>
                <li>Reduces mental fatigue during intensive activities</li>
            `;
            break;
        case 'adaptability':
            effects = `
                <li>Increases skill synergy effectiveness</li>
                <li>Improves ability to transfer knowledge between skills</li>
                <li>Enhances learning in unfamiliar situations</li>
            `;
            break;
        case 'discipline':
            effects = `
                <li>Reduces skill decay rate by up to 50% at max level</li>
                <li>Improves consistency in skill training</li>
                <li>Enhances ability to maintain multiple skills simultaneously</li>
            `;
            break;
        default:
            effects = '<li>No specific effects documented</li>';
    }
    
    return effects;
}

// Get skills affected by an attribute
function getSkillsAffectedByAttribute(attributeId) {
    const affectedSkills = [];
    
    // Get all categories that use this attribute as primary or secondary
    const relevantCategories = [];
    
    for (const categoryId in gameState.skillCategories) {
        const category = gameState.skillCategories[categoryId];
        
        if (category.primaryAttribute === attributeId || category.secondaryAttribute === attributeId) {
            relevantCategories.push(categoryId);
        }
    }
    
    // Find all skills in those categories
    for (const skillId in gameState.skills) {
        const skill = gameState.skills[skillId];
        
        if (relevantCategories.includes(skill.categoryId)) {
            affectedSkills.push(skillId);
        }
    }
    
    return affectedSkills;
}

// Export functions
export {
    updateSkillDisplay,
    showSkillDetails,
    showAttributeDetails
};

// Make functions available globally
window.setupSkillUI = setupSkillUI;
window.updateSkillDisplay = updateSkillDisplay;
window.showSkillDetails = showSkillDetails;
window.showAttributeDetails = showAttributeDetails;

console.log("skill-ui.js - Module loaded successfully");