// ui-integration.js - Connect existing game state to new UI
// Add this file to your project to help with the transition to the new UI

/**
 * Initialize the new UI system
 */
function initializeNewUI() {
  console.log("Initializing new UI system");
  
  // Set up tab navigation
  setupTabNavigation();
  
  // Set up game controls
  setupGameControls();
  
  // Set up time controls
  setupTimeControls();
  
  // Initial UI update
  updateAllDisplays();
  
  console.log("New UI system initialized");


/**
 * Update lifestyle stats
 */
function updateLifestyleStats() {
  const lifestyleBar = document.querySelector('.lifestyle-bar .progress-fill');
  const experienceValue = document.querySelector('.lifestyle-metric:nth-child(2)');
  const mortalityValue = document.querySelector('.lifestyle-metric:nth-child(3)');
  const yearsLeftValue = document.querySelector('.lifestyle-metric:nth-child(4)');
  
  // Example lifestyle metrics (replace with your actual game calculations)
  const experienceMultiplier = 0.78;
  const mortalityRate = 0.23;
  const avgYearsLeft = Math.max(0, CONFIG.settings.maxAge - gameState.age);
  
  if(lifestyleBar) {
    lifestyleBar.style.width = `${experienceMultiplier * 100}%`;
  }
  
  if(experienceValue) {
    experienceValue.textContent = `Experience × ${experienceMultiplier.toFixed(2)}`;
  }
  
  if(mortalityValue) {
    mortalityValue.textContent = `Mortality: ${mortalityRate.toFixed(2)}%`;
  }
  
  if(yearsLeftValue) {
    yearsLeftValue.textContent = `Avg. years left: ${avgYearsLeft}`;
  }
}

/**
 * Update jobs panel
 */
function updateJobsPanel() {
  const jobsPanel = document.getElementById('jobs-panel');
  if(!jobsPanel) return;
  
  // Clear existing content
  jobsPanel.innerHTML = '<h2 class="section-header">Available Careers</h2>';
  
  // Get available jobs
  let availableJobs = [];
  if(typeof window.getAvailableJobs === 'function') {
    availableJobs = window.getAvailableJobs();
  } else {
    // Example jobs data for testing
    availableJobs = [
      {
        title: "GeoGuessr Champion",
        level: gameState.activeJob && gameState.activeJob.title === "GeoGuessr Champion" ? 10 : 0,
        incomePerYear: 3000,
        requirements: "GeoGuessr Player 10/15"
      },
      {
        title: "Cartographer",
        level: gameState.activeJob && gameState.activeJob.title === "Cartographer" ? 5 : 0,
        incomePerYear: 4500,
        requirements: "Map Awareness 25/30"
      }
    ];
  }
  
  // Add jobs to the panel
  availableJobs.forEach(job => {
    const jobItem = document.createElement('div');
    jobItem.className = 'job-item';
    
    const hourlyRate = job.incomePerYear / (CONFIG.settings.ticksInOneGameYear * (1000 / CONFIG.settings.tickInterval));
    
    jobItem.innerHTML = `
      <div class="job-item-header">
        <span class="job-item-title">${job.title}</span>
        <span class="job-item-level">L. ${job.level}</span>
      </div>
      <div class="job-item-progress">
        <div class="progress-bar" style="flex-grow: 1; margin-right: 8px;">
          <div class="progress-fill" style="width: ${job.level > 0 ? '40%' : '0%'};"></div>
        </div>
        <span>${hourlyRate.toFixed(2)} $/h</span>
      </div>
      <div class="job-item-requirements">
        ${job.requirements ? 'Req: ' + job.requirements : ''}
      </div>
    `;
    
    // Add click handler for job application
    jobItem.addEventListener('click', () => {
      if(typeof window.applyForJob === 'function') {
        // Find job index in available jobs array
        const jobIndex = availableJobs.indexOf(job);
        if(jobIndex !== -1) {
          window.applyForJob(jobIndex);
          updateAllDisplays();
        }
      }
    });
    
    jobsPanel.appendChild(jobItem);
  });
  
  // Add career organizations section
  const organizationsSection = document.createElement('div');
  organizationsSection.className = 'job-category';
  organizationsSection.innerHTML = `
    <h2 class="section-header">Career Organizations</h2>
    
    <div class="job-organization">
      <div class="organization-header">
        <span>Mapping Association</span>
        <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div class="job-item-requirements">
        Req: Map Awareness 35/50
      </div>
    </div>
  `;
  
  jobsPanel.appendChild(organizationsSection);
}

/**
 * Update skills panel
 */
function updateSkillsPanel() {
  const skillsPanel = document.getElementById('skills-panel');
  if(!skillsPanel) return;
  
  // Clear existing content
  skillsPanel.innerHTML = `
    <div class="skills-header">
      <h2 class="section-header">Skills</h2>
      <div class="auto-learn-toggle">
        <span>Auto Learn</span>
        <div class="toggle-switch on">
          <div class="toggle-handle"></div>
        </div>
        <button class="config-button">CONFIG...</button>
      </div>
    </div>
  `;
  
  // Define skill categories (either from game state or example data)
  const skillCategories = [];
  
  // If we have skill categories in game state
  if(gameState.skillCategories) {
    // Group skills by category
    const skillsByCategory = {};
    
    // Initialize categories
    for(const categoryId in gameState.skillCategories) {
      skillsByCategory[categoryId] = [];
    }
    
    // Add skills to categories
    for(const skillId in gameState.skills) {
      const skill = gameState.skills[skillId];
      if(skill.categoryId && skillsByCategory[skill.categoryId]) {
        skillsByCategory[skill.categoryId].push(skill);
      }
    }
    
    // Create category objects
    for(const categoryId in skillsByCategory) {
      const category = gameState.skillCategories[categoryId];
      skillCategories.push({
        name: category.name,
        skills: skillsByCategory[categoryId]
      });
    }
  } else {
    // Example skill categories for testing
    skillCategories.push({
      name: "Self Development",
      skills: [
        { 
          name: "Map Awareness", 
          level: 33, 
          experience: "+32%", 
          effect: "Increases work experience",
          xp: 75, 
          xpForNextLevel: 100 
        },
        { 
          name: "Navigation", 
          level: 21, 
          experience: "+20%", 
          effect: "Increases work salary",
          xp: 45, 
          xpForNextLevel: 100 
        }
      ]
    });
    
    skillCategories.push({
      name: "Professional Skills",
      skills: [
        { 
          name: "Spatial Awareness", 
          level: 15, 
          experience: "+18%", 
          effect: "Enhances map reading abilities",
          xp: 30, 
          xpForNextLevel: 100 
        }
      ]
    });
  }
  
  // Add skill categories to the panel
  skillCategories.forEach(category => {
    const categoryElement = document.createElement('div');
    categoryElement.className = 'skill-category';
    
    // Create category header
    categoryElement.innerHTML = `
      <div class="category-header">
        <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        <span>${category.name}</span>
      </div>
    `;
    
    // Add skills to category
    category.skills.forEach(skill => {
      const skillElement = document.createElement('div');
      skillElement.className = 'skill-item';
      
      // Calculate percentage to next level
      const percentToNextLevel = skill.xpForNextLevel ? 
        (skill.xp / skill.xpForNextLevel) * 100 : 
        (skill.percentToNextLevel || 0);
      
      skillElement.innerHTML = `
        <div class="skill-header">
          <span>${skill.name}</span>
          <span class="skill-level">L. ${skill.level}</span>
        </div>
        <div class="skill-progress">
          <div class="progress-fill" style="width: ${percentToNextLevel}%;"></div>
        </div>
        <div class="skill-meta">
          <span class="skill-exp ${skill.experience.includes('+') ? 'positive' : 'negative'}">
            Exp ${skill.experience}
          </span>
          <span class="skill-effect">${skill.effect}</span>
        </div>
      `;
      
      // Add click handler for skill training
      skillElement.addEventListener('click', () => {
        if(typeof window.trainSkill === 'function') {
          window.trainSkill(skill.id || skill.name, 1);
          updateAllDisplays();
        }
      });
      
      categoryElement.appendChild(skillElement);
    });
    
    skillsPanel.appendChild(categoryElement);
  });
  
  // Set up auto-learn toggle
  const toggleSwitch = skillsPanel.querySelector('.toggle-switch');
  if(toggleSwitch) {
    toggleSwitch.addEventListener('click', function() {
      this.classList.toggle('on');
      // Update game state
      gameState.autoLearnEnabled = this.classList.contains('on');
    });
    
    // Set initial state
    if(gameState.autoLearnEnabled === false) {
      toggleSwitch.classList.remove('on');
    }
  }
  
  // Set up config button
  const configButton = skillsPanel.querySelector('.config-button');
  if(configButton) {
    configButton.addEventListener('click', () => {
      showAutoLearnConfig();
    });
  }
}

/**
 * Show auto-learn configuration modal
 */
function showAutoLearnConfig() {
  // Check if modal already exists
  let modal = document.getElementById('auto-learn-modal');
  
  // Create modal if it doesn't exist
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'auto-learn-modal';
    modal.className = 'modal-overlay';
    
    // Create modal content
    modal.innerHTML = `
      <div class="auto-learn-config">
        <div class="config-header">
          <h3 class="config-title">Auto Learn [6/20]</h3>
          <button class="close-button">&times;</button>
        </div>
        
        <div class="config-rows">
          <div class="config-row">
            <div class="skill-config">
              <span class="skill-name">Map Awareness</span>
              <div class="level-config">
                <button class="row-button">-</button>
                <span class="level-value">33</span>
                <button class="row-button">+</button>
              </div>
            </div>
            <div class="row-actions">
              <button class="row-button">↓</button>
              <button class="row-button">↑</button>
              <button class="row-button">🗑</button>
            </div>
          </div>
          
          <div class="config-row">
            <div class="skill-config">
              <span class="skill-name">Navigation</span>
              <div class="level-config">
                <button class="row-button">-</button>
                <span class="level-value">21</span>
                <button class="row-button">+</button>
              </div>
            </div>
            <div class="row-actions">
              <button class="row-button">↓</button>
              <button class="row-button">↑</button>
              <button class="row-button">🗑</button>
            </div>
          </div>
        </div>
        
        <button class="add-row-button">ADD ROW</button>
        
        <div class="config-actions">
          <button class="modal-button">CANCEL</button>
          <button class="modal-button primary">SAVE</button>
        </div>
      </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modal);
    
    // Set up close button
    const closeButton = modal.querySelector('.close-button');
    if(closeButton) {
      closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
    
    // Set up cancel button
    const cancelButton = modal.querySelector('.modal-button:not(.primary)');
    if(cancelButton) {
      cancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
    
    // Set up save button
    const saveButton = modal.querySelector('.modal-button.primary');
    if(saveButton) {
      saveButton.addEventListener('click', () => {
        // Save auto-learn configuration
        saveAutoLearnConfig();
        modal.style.display = 'none';
      });
    }
  }
  
  // Show modal
  modal.style.display = 'flex';
}

/**
 * Save auto-learn configuration
 */
function saveAutoLearnConfig() {
  // Example implementation - update with your game logic
  const configRows = document.querySelectorAll('#auto-learn-modal .config-row');
  
  if(!gameState.autoLearnConfig) {
    gameState.autoLearnConfig = [];
  }
  
  // Clear existing configuration
  gameState.autoLearnConfig = [];
  
  // Add each skill configuration
  configRows.forEach(row => {
    const skillName = row.querySelector('.skill-name').textContent;
    const targetLevel = parseInt(row.querySelector('.level-value').textContent);
    
    gameState.autoLearnConfig.push({
      skill: skillName,
      targetLevel: targetLevel
    });
  });
  
  console.log('Auto-learn configuration saved:', gameState.autoLearnConfig);
}

/**
 * Update lifestyle panel
 */
function updateLifestylePanel() {
  const lifestylePanel = document.getElementById('lifestyle-panel');
  if(!lifestylePanel) return;
  
  // Clear existing content
  lifestylePanel.innerHTML = '<h2 class="section-header">Lifestyle</h2>';
  
  // Define lifestyle categories
  const lifestyleCategories = [
    {
      name: "House",
      options: [
        { name: "Shared Room", cost: "$4/day", selected: false },
        { name: "Tiny Apartment", cost: "$12/day", selected: true },
        { name: "Apartment", cost: "$32/day", selected: false }
      ],
      requirement: "Req: $200k"
    },
    {
      name: "Transportation",
      options: [
        { name: "Walking", cost: "$0/day", selected: false },
        { name: "Bicycle", cost: "$6/day", selected: true },
        { name: "Public Transit", cost: "$16/day", selected: false }
      ],
      requirement: "Req: $200k"
    },
    {
      name: "Diet",
      options: [
        { name: "Basic Food", cost: "$3/day", selected: false },
        { name: "Grocery Store", cost: "$8/day", selected: true },
        { name: "Organic Market", cost: "$24/day", selected: false }
      ],
      requirement: "Req: $160k"
    }
  ];
  
  // Add lifestyle categories to the panel
  lifestyleCategories.forEach(category => {
    const categoryElement = document.createElement('div');
    categoryElement.className = 'lifestyle-category';
    
    // Create category header
    categoryElement.innerHTML = `
      <div class="lifestyle-category-header">
        <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        <span>${category.name}</span>
      </div>
    `;
    
    // Add options to category
    category.options.forEach(option => {
      const optionElement = document.createElement('div');
      optionElement.className = `lifestyle-option ${option.selected ? 'selected' : ''}`;
      
      optionElement.innerHTML = `
        <span>${option.name}</span>
        <div class="option-cost">
          <span>${option.cost}</span>
          <button class="info-button">i</button>
        </div>
      `;
      
      // Add click handler for option selection
      optionElement.addEventListener('click', () => {
        // Remove selected class from all options in this category
        categoryElement.querySelectorAll('.lifestyle-option').forEach(el => {
          el.classList.remove('selected');
        });
        
        // Add selected class to this option
        optionElement.classList.add('selected');
        
        // Update game state (example)
        if(!gameState.lifestyle) {
          gameState.lifestyle = {};
        }
        
        gameState.lifestyle[category.name.toLowerCase()] = option.name;
        
        // Update lifestyle stats
        updateLifestyleStats();
      });
      
      categoryElement.appendChild(optionElement);
    });
    
    // Add requirement
    if(category.requirement) {
      const requirementElement = document.createElement('div');
      requirementElement.className = 'lifestyle-requirement';
      requirementElement.textContent = category.requirement;
      categoryElement.appendChild(requirementElement);
    }
    
    lifestylePanel.appendChild(categoryElement);
  });
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log("Initializing modern UI integration");
  initializeNewUI();
});

/**
 * Set up tab navigation
 */
function setupTabNavigation() {
  // Get tab elements
  const lifestyleTab = document.getElementById('lifestyle-tab');
  const jobTab = document.getElementById('job-tab');
  const skillsTab = document.getElementById('skills-tab');
  
  // Get panel elements
  const lifestylePanel = document.getElementById('lifestyle-panel');
  const jobsPanel = document.getElementById('jobs-panel');
  const skillsPanel = document.getElementById('skills-panel');
  
  // Function to set active tab and show corresponding panel
  function setActiveTab(tab, panel) {
    // Remove active class from all tabs
    lifestyleTab.classList.remove('active');
    jobTab.classList.remove('active');
    skillsTab.classList.remove('active');
    
    // Hide all panels
    if(lifestylePanel) lifestylePanel.style.display = 'none';
    if(jobsPanel) jobsPanel.style.display = 'none';
    if(skillsPanel) skillsPanel.style.display = 'none';
    
    // Set active tab and show corresponding panel
    tab.classList.add('active');
    if(panel) panel.style.display = 'block';
  }
  
  // Add click event listeners to tabs
  if(lifestyleTab) {
    lifestyleTab.addEventListener('click', function() {
      setActiveTab(lifestyleTab, lifestylePanel);
    });
  }
  
  if(jobTab) {
    jobTab.addEventListener('click', function() {
      setActiveTab(jobTab, jobsPanel);
    });
  }
  
  if(skillsTab) {
    skillsTab.addEventListener('click', function() {
      setActiveTab(skillsTab, skillsPanel);
    });
  }
  
  // Default to job tab
  if(jobTab) {
    setActiveTab(jobTab, jobsPanel);
  }
}

/**
 * Set up game controls
 */
function setupGameControls() {
  // Pause button
  const pauseButton = document.getElementById('pause-button');
  if(pauseButton) {
    pauseButton.addEventListener('click', function() {
      togglePause();
      updatePauseButton();
    });
    
    // Initial state
    updatePauseButton();
  }
  
  // Speed button
  const speedButton = document.getElementById('speed-button');
  if(speedButton) {
    speedButton.addEventListener('click', function() {
      cycleGameSpeed();
      updateSpeedButton();
    });
    
    // Initial state
    updateSpeedButton();
  }
}

/**
 * Update pause button appearance based on game state
 */
function updatePauseButton() {
  const pauseButton = document.getElementById('pause-button');
  if(!pauseButton) return;
  
  const isPaused = gameState.gamePaused;
  
  if(isPaused) {
    pauseButton.classList.add('paused');
    pauseButton.innerHTML = `
      <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    `;
  } else {
    pauseButton.classList.remove('paused');
    pauseButton.innerHTML = `
      <svg class="pause-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
    `;
  }
}

/**
 * Update speed button appearance based on game state
 */
function updateSpeedButton() {
  const speedButton = document.getElementById('speed-button');
  if(!speedButton) return;
  
  speedButton.textContent = `${gameState.gameSpeed}x`;
}

/**
 * Set up time controls
 */
function setupTimeControls() {
  // Working time controls
  setupTimeControl('working');
  
  // Training time controls
  setupTimeControl('training');
}

/**
 * Set up time control for a specific activity
 * @param {string} activity - Activity name
 */
function setupTimeControl(activity) {
  const increaseButton = document.querySelector(`.${activity} .time-controls button:nth-child(3)`);
  const decreaseButton = document.querySelector(`.${activity} .time-controls button:nth-child(1)`);
  const timeDisplay = document.querySelector(`.${activity} .time-display`);
  
  if(increaseButton && decreaseButton && timeDisplay) {
    increaseButton.addEventListener('click', function() {
      // Increase time for activity (example function)
      increaseActivityTime(activity, 1);
      updateTimeAllocation();
    });
    
    decreaseButton.addEventListener('click', function() {
      // Decrease time for activity (example function)
      decreaseActivityTime(activity, 1);
      updateTimeAllocation();
    });
  }
}

/**
 * Example function to increase activity time
 * @param {string} activity - Activity name
 * @param {number} hours - Hours to increase
 */
function increaseActivityTime(activity, hours) {
  // This is an example - integrate with your game's time management system
  if(!gameState.timeAllocation) {
    gameState.timeAllocation = {
      working: 5,
      training: 3,
      sleeping: 8,
      traveling: 4,
      cleaning: 0.5,
      cooking: 0.5,
      freeTime: 3
    };
  }
  
  // Increase time spent on activity
  gameState.timeAllocation[activity] += hours;
  
  // Decrease free time
  gameState.timeAllocation.freeTime -= hours;
  
  // Ensure free time doesn't go below 0
  if(gameState.timeAllocation.freeTime < 0) {
    gameState.timeAllocation.freeTime = 0;
    gameState.timeAllocation[activity] -= hours; // Revert if not enough free time
  }
}

/**
 * Example function to decrease activity time
 * @param {string} activity - Activity name
 * @param {number} hours - Hours to decrease
 */
function decreaseActivityTime(activity, hours) {
  // This is an example - integrate with your game's time management system
  if(!gameState.timeAllocation) {
    gameState.timeAllocation = {
      working: 5,
      training: 3,
      sleeping: 8,
      traveling: 4,
      cleaning: 0.5,
      cooking: 0.5,
      freeTime: 3
    };
  }
  
  // Don't decrease below 0
  if(gameState.timeAllocation[activity] <= hours) {
    return;
  }
  
  // Decrease time spent on activity
  gameState.timeAllocation[activity] -= hours;
  
  // Increase free time
  gameState.timeAllocation.freeTime += hours;
}

/**
 * Update all displays
 */
function updateAllDisplays() {
  updateDateDisplay();
  updatePlayerStats();
  updateFinancialStats();
  updateTimeAllocation();
  updateLifestyleStats();
  updateJobsPanel();
  updateSkillsPanel();
  updateLifestylePanel();
}

/**
 * Update date and age display
 */
function updateDateDisplay() {
  const dateDisplay = document.querySelector('.date-display');
  const ageDisplay = document.querySelector('.age-display');
  
  if(dateDisplay) {
    // Format: DD/MM/YYYY
    const day = gameState.day || 1;
    const season = gameState.currentSeason || 'Spring';
    const year = gameState.year || 1;
    
    // Convert game date to calendar date (example)
    const seasonToMonth = {
      'Spring': 3, // March
      'Summer': 6, // June
      'Autumn': 9, // September
      'Winter': 12 // December
    };
    
    const month = seasonToMonth[season] || 1;
    const formattedDay = day.toString().padStart(2, '0');
    const formattedMonth = month.toString().padStart(2, '0');
    const displayYear = 2000 + year; // Example year calculation
    
    dateDisplay.textContent = `${formattedDay}/${formattedMonth}/${displayYear}`;
  }
  
  if(ageDisplay) {
    ageDisplay.textContent = `Age: ${gameState.age || 18}`;
  }
}

/**
 * Update player stats (job title and level)
 */
function updatePlayerStats() {
  const jobTitle = document.querySelector('.job-title');
  const jobProgressFill = document.querySelector('.job-level-bar .progress-fill');
  const jobLevel = document.querySelector('.level-indicator');
  
  if(jobTitle && jobProgressFill && jobLevel) {
    if(gameState.activeJob) {
      jobTitle.textContent = gameState.activeJob.title;
      
      // Get current job level
      const currentLevel = gameState.jobLevels && gameState.activeJob.id && 
        gameState.jobLevels[gameState.activeJob.id] ? 
        gameState.jobLevels[gameState.activeJob.id] : 1;
      
      jobLevel.textContent = `L. ${currentLevel}`;
      
      // Calculate job progress percentage
      let progressPercent = 0;
      if(typeof window.getJobProgressPercentage === 'function') {
        progressPercent = window.getJobProgressPercentage();
      } else {
        // Fallback calculation
        const progressNeeded = 100 * Math.pow(1.1, currentLevel - 1);
        progressPercent = Math.min(100, (gameState.jobProgress / progressNeeded) * 100);
      }
      
      jobProgressFill.style.width = `${progressPercent}%`;
    } else {
      jobTitle.textContent = 'Unemployed';
      jobLevel.textContent = '';
      jobProgressFill.style.width = '0%';
    }
  }
}

/**
 * Update financial stats
 */
function updateFinancialStats() {
  const bankValue = document.querySelector('.financial-stats .stat-row:nth-child(1) .stat-value');
  const incomeValue = document.querySelector('.financial-stats .stat-row:nth-child(2) .stat-value');
  const salaryValue = document.querySelector('.financial-stats .stat-row:nth-child(3) .stat-value');
  const expensesValue = document.querySelector('.financial-stats .stat-row:nth-child(4) .stat-value');
  
  if(bankValue) {
    bankValue.textContent = `$${formatNumber(gameState.gold || 0)}`;
  }
  
  if(incomeValue) {
    // Calculate income (example)
    const income = calculateIncome();
    incomeValue.textContent = income.toFixed(2);
    
    // Add positive class if income is positive
    if(income > 0) {
      incomeValue.classList.add('positive-value');
    } else {
      incomeValue.classList.remove('positive-value');
    }
  }
  
  if(salaryValue && gameState.activeJob) {
    // Calculate salary per hour
    const salaryPerHour = (gameState.activeJob.incomePerYear || 0) / (CONFIG.settings.ticksInOneGameYear * (1000 / CONFIG.settings.tickInterval));
    const workingHours = (gameState.timeAllocation && gameState.timeAllocation.working) || 5;
    
    salaryValue.textContent = (salaryPerHour * workingHours).toFixed(2);
  } else if(salaryValue) {
    salaryValue.textContent = '0.00';
  }
  
  if(expensesValue) {
    // Calculate expenses (example)
    const expenses = -15.37; // Placeholder
    expensesValue.textContent = expenses.toFixed(2);
    
    // Add negative class if expenses are negative
    if(expenses < 0) {
      expensesValue.classList.add('negative-value');
    } else {
      expensesValue.classList.remove('negative-value');
    }
  }
}

/**
 * Calculate income (example)
 * @returns {number} - Current income
 */
function calculateIncome() {
  if(!gameState.activeJob) {
    return 0;
  }
  
  // Calculate income from job
  const salaryPerHour = (gameState.activeJob.incomePerYear || 0) / (CONFIG.settings.ticksInOneGameYear * (1000 / CONFIG.settings.tickInterval));
  const workingHours = (gameState.timeAllocation && gameState.timeAllocation.working) || 5;
  
  // Apply job performance modifier
  const performanceModifier = gameState.jobPerformance ? 
    (gameState.jobPerformance.current / 100) : 1.0;
  
  // Apply bonus multipliers
  const goldMultiplier = gameState.multipliers && gameState.multipliers.gold ? 
    gameState.multipliers.gold : 1.0;
  
  return salaryPerHour * workingHours * performanceModifier * goldMultiplier;
}

/**
 * Update time allocation display
 */
function updateTimeAllocation() {
  const divisionValue = document.querySelector('.time-division .division-value');
  const workingTimeDisplay = document.querySelector('.activity-row:nth-child(2) .time-display');
  const workingProgressFill = document.querySelector('.activity-row:nth-child(2) .progress-fill');
  const trainingTimeDisplay = document.querySelector('.activity-row:nth-child(3) .time-display');
  const trainingProgressFill = document.querySelector('.activity-row:nth-child(3) .progress-fill');
  
  // Other activities
  const sleepingTime = document.querySelector('.other-activities .other-activity:nth-child(1) span:nth-child(2)');
  const travelingTime = document.querySelector('.other-activities .other-activity:nth-child(2) span:nth-child(2)');
  const cleaningTime = document.querySelector('.other-activities .other-activity:nth-child(3) span:nth-child(2)');
  const cookingTime = document.querySelector('.other-activities .other-activity:nth-child(4) span:nth-child(2)');
  
  // Free time
  const freeTimeValue = document.querySelector('.free-time .free-time-value');
  
  // Get time allocation from game state
  if(!gameState.timeAllocation) {
    gameState.timeAllocation = {
      working: 5,
      training: 3,
      sleeping: 8,
      traveling: 4,
      cleaning: 0.5,
      cooking: 0.5,
      freeTime: 3
    };
  }
  
  // Update displayed values
  if(divisionValue) {
    divisionValue.textContent = "1 hour"; // This could be dynamic if your game has different time divisions
  }
  
  if(workingTimeDisplay) {
    const hours = Math.floor(gameState.timeAllocation.working);
    const minutes = Math.round((gameState.timeAllocation.working - hours) * 60);
    workingTimeDisplay.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  if(workingProgressFill) {
    // Calculate what percentage of the day is spent working
    const percentWorking = (gameState.timeAllocation.working / 24) * 100;
    workingProgressFill.style.width = `${percentWorking}%`;
  }
  
  if(trainingTimeDisplay) {
    const hours = Math.floor(gameState.timeAllocation.training);
    const minutes = Math.round((gameState.timeAllocation.training - hours) * 60);
    trainingTimeDisplay.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  if(trainingProgressFill) {
    // Calculate what percentage of the day is spent training
    const percentTraining = (gameState.timeAllocation.training / 24) * 100;
    trainingProgressFill.style.width = `${percentTraining}%`;
  }
  
  // Update other activities
  if(sleepingTime) {
    const hours = Math.floor(gameState.timeAllocation.sleeping);
    const minutes = Math.round((gameState.timeAllocation.sleeping - hours) * 60);
    sleepingTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  if(travelingTime) {
    const hours = Math.floor(gameState.timeAllocation.traveling);
    const minutes = Math.round((gameState.timeAllocation.traveling - hours) * 60);
    travelingTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  if(cleaningTime) {
    const hours = Math.floor(gameState.timeAllocation.cleaning);
    const minutes = Math.round((gameState.timeAllocation.cleaning - hours) * 60);
    cleaningTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  if(cookingTime) {
    const hours = Math.floor(gameState.timeAllocation.cooking);
    const minutes = Math.round((gameState.timeAllocation.cooking - hours) * 60);
    cookingTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // Update free time
  if(freeTimeValue) {
    const hours = Math.floor(gameState.timeAllocation.freeTime);
    const minutes = Math.round((gameState.timeAllocation.freeTime - hours) * 60);
    freeTimeValue.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
}