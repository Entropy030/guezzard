// ui-integration.js - Connect existing game state to new UI
// Updated to support the new lifestyle system

// Make sure gameState exists
window.gameState = window.gameState || {};

/**
 * Calculate income (example)
 * @returns {number} - Current income
 */
function calculateIncome() {
  if(!window.gameState.activeJob) {
    return 0;
  }
  
  // Calculate income from job
  const salaryPerHour = (window.gameState.activeJob.incomePerYear || 0) / (window.CONFIG.settings.ticksInOneGameYear * (1000 / window.CONFIG.settings.tickInterval));
  const workingHours = (window.gameState.timeAllocation && window.gameState.timeAllocation.working) || 5;
  
  // Apply job performance modifier
  const performanceModifier = window.gameState.jobPerformance ? 
    (window.gameState.jobPerformance.current / 100) : 1.0;
  
  // Apply bonus multipliers
  const goldMultiplier = window.gameState.multipliers && window.gameState.multipliers.gold ? 
    window.gameState.multipliers.gold : 1.0;
  
  return salaryPerHour * workingHours * performanceModifier * goldMultiplier;
}

/**
 * Calculate job hourly rate
 * @param {object} job - Job object
 * @returns {number} - Hourly rate
 */
function calculateJobHourlyRate(job) {
  if (!job || !job.incomePerYear) {
    return 0;
  }
  
  let hourlyRate = 0;
  if (window.CONFIG && window.CONFIG.settings && window.CONFIG.settings.ticksInOneGameYear) {
    hourlyRate = job.incomePerYear / (window.CONFIG.settings.ticksInOneGameYear * (1000 / window.CONFIG.settings.tickInterval));
  } else {
    hourlyRate = job.incomePerYear / 600; // Fallback to default 600 ticks per year
  }
  
  return hourlyRate;
}

/**
 * Initialize the new UI system
 */
function initializeNewUI() {
  console.log("Initializing new UI system");
  
  // Wait a short time to ensure gameState is fully loaded
  setTimeout(() => {
    // Set up tab navigation
    setupTabNavigation();
    
    // Set up game controls
    setupGameControls();
    
    // Set up time controls
    setupTimeControls();
    
    // Initial UI update
    updateAllDisplays();
    
    console.log("New UI system initialized");
  }, 100);
}

/**
 * Update lifestyle stats
 */
function updateLifestyleStats() {
  const lifestyleBar = document.querySelector('.lifestyle-bar .progress-fill');
  const experienceValue = document.querySelector('.lifestyle-metric:nth-child(2)');
  const mortalityValue = document.querySelector('.lifestyle-metric:nth-child(3)');
  const yearsLeftValue = document.querySelector('.lifestyle-metric:nth-child(4)');
  
  // Get lifestyle effects
  let lifestyleModifier = 1.0;
  if (typeof window.getLifestyleMortalityModifier === 'function') {
    lifestyleModifier = window.getLifestyleMortalityModifier();
  } else if (typeof window.getLifestyleKFactorModifier === 'function') {
    lifestyleModifier = window.getLifestyleKFactorModifier();
  }

  // Experience multiplier (inverse of mortality modifier - better lifestyle = higher multiplier)
  const experienceMultiplier = 1 + (1 - lifestyleModifier);
  
  // Get current mortality rate and years left
  const mortalityRate = window.gameState.mortalityRate || 0.001;
  const avgYearsLeft = window.gameState.avgYearsLeft || (
    window.CONFIG && window.CONFIG.settings && window.CONFIG.settings.maxAge ? 
    Math.max(0, window.CONFIG.settings.maxAge - (window.gameState.age || 18)) : 
    47
  );
  
  if(lifestyleBar) {
    lifestyleBar.style.width = `${Math.min(100, experienceMultiplier * 50)}%`;
  }
  
  if(experienceValue) {
    experienceValue.textContent = `Experience × ${experienceMultiplier.toFixed(2)}`;
  }
  
  if(mortalityValue) {
    mortalityValue.textContent = `Mortality: ${(mortalityRate * 100).toFixed(2)}%`;
  }
  
  if(yearsLeftValue) {
    yearsLeftValue.textContent = `Avg. years left: ${avgYearsLeft}`;
  }
}

/**
 * Update lifestyle panel
 */
function updateLifestylePanel() {
  const lifestylePanel = document.getElementById('lifestyle-panel');
  if(!lifestylePanel) return;
  
  // Clear existing content
  lifestylePanel.innerHTML = '<h2 class="section-header">Lifestyle</h2>';
  
  // Get lifestyle options if the function exists
  let housingOptions = [];
  let transportationOptions = [];
  let dietOptions = [];
  
  if (typeof window.getAvailableLifestyleOptions === 'function') {
    housingOptions = window.getAvailableLifestyleOptions('housing');
    transportationOptions = window.getAvailableLifestyleOptions('transportation');
    dietOptions = window.getAvailableLifestyleOptions('diet');
  } else {
    // Fallback to predefined options
    const currentHousing = window.gameState.lifestyle && window.gameState.lifestyle.housing;
    housingOptions = [
      { id: "homeless", name: "Homeless", cost: 0, available: true, current: currentHousing === "Homeless" },
      { id: "shared_room", name: "Shared Room", cost: 4, available: true, current: currentHousing === "Shared Room" },
      { id: "tiny_apartment", name: "Tiny Apartment", cost: 12, available: window.gameState.gold >= 200, current: currentHousing === "Tiny Apartment" },
      { id: "apartment", name: "Apartment", cost: 32, available: window.gameState.gold >= 1000, current: currentHousing === "Apartment" }
    ];
    
    const currentTransportation = window.gameState.lifestyle && window.gameState.lifestyle.transportation;
    transportationOptions = [
      { id: "walking", name: "Walking", cost: 0, available: true, current: currentTransportation === "Walking" },
      { id: "bicycle", name: "Bicycle", cost: 6, available: window.gameState.gold >= 100, current: currentTransportation === "Bicycle" }
    ];
    
    const currentDiet = window.gameState.lifestyle && window.gameState.lifestyle.diet;
    dietOptions = [
      { id: "basic_food", name: "Basic Food", cost: 3, available: true, current: currentDiet === "Basic Food" },
      { id: "grocery_store", name: "Grocery Store", cost: 8, available: window.gameState.gold >= 300, current: currentDiet === "Grocery Store" },
      { id: "organic_market", name: "Organic Market", cost: 24, available: window.gameState.gold >= 2000, current: currentDiet === "Organic Market" }
    ];
  }
  
  // Add housing category
  createLifestyleCategory(lifestylePanel, 'Housing', housingOptions);
  
  // Add transportation category
  createLifestyleCategory(lifestylePanel, 'Transportation', transportationOptions);
  
  // Add diet category
  createLifestyleCategory(lifestylePanel, 'Diet', dietOptions);

  // Add daily cost display
  const dailyCost = window.gameState.lifestyleEffects && window.gameState.lifestyleEffects.costPerDay;
  if (dailyCost !== undefined) {
    const costDisplay = document.createElement('div');
    costDisplay.className = 'daily-cost-display';
    costDisplay.innerHTML = `<div class="cost-label">Daily lifestyle cost:</div><div class="cost-value">${dailyCost.toFixed(2)}/day</div>`;
    lifestylePanel.appendChild(costDisplay);
  }
}

/**
 * Create a lifestyle category UI element
 * @param {HTMLElement} parentElement - Parent element to append to
 * @param {string} categoryName - Name of the category
 * @param {Array} options - Array of options for this category
 */
function createLifestyleCategory(parentElement, categoryName, options) {
  const categoryElement = document.createElement('div');
  categoryElement.className = 'lifestyle-category';
  
  // Create category header
  categoryElement.innerHTML = `
    <div class="lifestyle-category-header">
      <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
      <span>${categoryName}</span>
    </div>
  `;
  
  // Add options to category
  options.forEach(option => {
    const optionElement = document.createElement('div');
    optionElement.className = `lifestyle-option ${option.current ? 'selected' : ''} ${!option.available ? 'unavailable' : ''}`;
    
    optionElement.innerHTML = `
      <span>${option.name}</span>
      <div class="option-cost">
        <span>${option.cost.toFixed(2)}/day</span>
        <button class="info-button">i</button>
      </div>
    `;
    
    // Add tooltip with description
    if (option.description) {
      optionElement.title = option.description;
    }
    
    // Add click handler for option selection
    if (option.available) {
      optionElement.addEventListener('click', () => {
        const category = categoryName.toLowerCase();
        
        if (typeof window.selectLifestyleOption === 'function') {
          window.selectLifestyleOption(category, option.id);
        } else {
          // Fallback for simple lifestyle selection
          if (!window.gameState.lifestyle) {
            window.gameState.lifestyle = {};
          }
          window.gameState.lifestyle[category] = option.name;
          
          // Update UI
          updateLifestylePanel();
          updateLifestyleStats();
        }
      });
    }
    
    categoryElement.appendChild(optionElement);
  });
  
  // Add requirement if any option is unavailable
  const hasUnavailableOptions = options.some(option => !option.available);
  if (hasUnavailableOptions) {
    const requirementElement = document.createElement('div');
    requirementElement.className = 'lifestyle-requirement';
    requirementElement.textContent = "Some options require more gold or career achievements";
    categoryElement.appendChild(requirementElement);
  }
  
  parentElement.appendChild(categoryElement);
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
  
  const isPaused = window.gameState.gamePaused;
  
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
  
  speedButton.textContent = `${window.gameState.gameSpeed || 1}x`;
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
      // Increase time for activity
      increaseActivityTime(activity, 1);
      updateTimeAllocation();
    });
    
    decreaseButton.addEventListener('click', function() {
      // Decrease time for activity
      decreaseActivityTime(activity, 1);
      updateTimeAllocation();
    });
  }
}

/**
 * Increase activity time
 * @param {string} activity - Activity name
 * @param {number} hours - Hours to increase
 */
function increaseActivityTime(activity, hours) {
  // Initialize time allocation if it doesn't exist
  if(!window.gameState.timeAllocation) {
    window.gameState.timeAllocation = {
      working: 5,
      training: 3,
      sleeping: 8,
      traveling: 4,
      cooking: 0.5,
      cleaning: 0.5,
      freeTime: 3
    };
  }
  
  // Increase time spent on activity
  window.gameState.timeAllocation[activity] += hours;
  
  // Decrease free time
  window.gameState.timeAllocation.freeTime -= hours;
  
  // Ensure free time doesn't go below 0
  if(window.gameState.timeAllocation.freeTime < 0) {
    window.gameState.timeAllocation.freeTime = 0;
    window.gameState.timeAllocation[activity] -= hours; // Revert if not enough free time
  }
}

/**
 * Decrease activity time
 * @param {string} activity - Activity name
 * @param {number} hours - Hours to decrease
 */
function decreaseActivityTime(activity, hours) {
  // Initialize time allocation if it doesn't exist
  if(!window.gameState.timeAllocation) {
    window.gameState.timeAllocation = {
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
  if(window.gameState.timeAllocation[activity] <= hours) {
    return;
  }
  
  // Decrease time spent on activity
  window.gameState.timeAllocation[activity] -= hours;
  
  // Increase free time
  window.gameState.timeAllocation.freeTime += hours;
}

/**
 * Update all displays
 */
function updateAllDisplays() {
  try {
    updateDateDisplay();
    updatePlayerStats();
    updateFinancialStats();
    updateTimeAllocation();
    updateLifestyleStats();
    updateEnergyDisplay();
    updateJobsPanel();
    updateSkillsPanel();
    updateLifestylePanel();
  } catch (error) {
    console.error("Error updating displays:", error);
  }
}

/**
 * Update date and age display
 */
function updateDateDisplay() {
  const dateDisplay = document.querySelector('.date-display');
  const ageDisplay = document.querySelector('.age-display');
  
  if(dateDisplay) {
    // Use season-display format: "Day X, Season, Year Y"
    const day = window.gameState.day || 1;
    const season = window.gameState.currentSeason || 'Spring';
    const year = window.gameState.year || 1;
    
    dateDisplay.textContent = `Day ${day}, ${season}, Year ${year}`;
  }
  
  if(ageDisplay) {
    ageDisplay.textContent = `Age: ${window.gameState.age || 18}`;
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
    if(window.gameState.activeJob) {
      jobTitle.textContent = window.gameState.activeJob.title;
      
      // Get current job level
      const currentLevel = window.gameState.jobLevels && window.gameState.activeJob.id && 
        window.gameState.jobLevels[window.gameState.activeJob.id] ? 
        window.gameState.jobLevels[window.gameState.activeJob.id] : 1;
      
      jobLevel.textContent = `L. ${currentLevel}`;
      
      // Calculate job progress percentage
      let progressPercent = 0;
      if(typeof window.getJobProgressPercentage === 'function') {
        progressPercent = window.getJobProgressPercentage();
      } else {
        // Fallback calculation
        const progressNeeded = 100 * Math.pow(1.1, currentLevel - 1);
        progressPercent = Math.min(100, (window.gameState.jobProgress / progressNeeded) * 100);
      }
      
      jobProgressFill.style.width = `${progressPercent}%`;
    } else {
      jobTitle.textContent = 'Unemployed';
      jobLevel.textContent = '';
      jobProgressFill.style.width = '0%';
    }
  }
}

// Patches for ui-integration.js to change gold to kudos in display

/**
 * Update financial stats with Kudos instead of Gold
 */
function updateFinancialStats() {
  const bankValue = document.querySelector('.financial-stats .stat-row:nth-child(1) .stat-value');
  const incomeValue = document.querySelector('.financial-stats .stat-row:nth-child(2) .stat-value');
  const salaryValue = document.querySelector('.financial-stats .stat-row:nth-child(3) .stat-value');
  const expensesValue = document.querySelector('.financial-stats .stat-row:nth-child(4) .stat-value');
  
  // Update bank label to Kudos
  const bankLabel = document.querySelector('.financial-stats .stat-row:nth-child(1) .stat-label');
  if (bankLabel) {
    bankLabel.textContent = "Kudos:";
  }
  
  if(bankValue) {
    bankValue.textContent = `${formatNumber(Math.floor(window.gameState.gold || 0))}`;
  }
  
  if(incomeValue) {
    // Calculate income
    const income = calculateIncome();
    incomeValue.textContent = income.toFixed(2);
    
    // Add positive class if income is positive
    if(income > 0) {
      incomeValue.classList.add('positive-value');
    } else {
      incomeValue.classList.remove('positive-value');
    }
  }
  
  if(salaryValue && window.gameState.activeJob) {
    // Calculate salary per hour
    const salaryPerHour = calculateJobHourlyRate(window.gameState.activeJob);
    const workingHours = (window.gameState.timeAllocation && window.gameState.timeAllocation.working) || 5;
    
    salaryValue.textContent = (salaryPerHour * workingHours).toFixed(2);
  } else if(salaryValue) {
    salaryValue.textContent = '0.00';
  }
  
  if(expensesValue) {
    // Calculate lifestyle expenses from lifestyleEffects
    let expenses = 0;
    if (window.gameState.lifestyleEffects && window.gameState.lifestyleEffects.costPerDay) {
      expenses = -window.gameState.lifestyleEffects.costPerDay;
    } else {
      // Fallback to a default value
      expenses = -7; // Default shared room + basic food
    }
    
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
 * Update jobs panel with Kudos instead of $ symbol
 */
function updateJobsPanel() {
  const jobsPanel = document.getElementById('jobs-panel');
  if(!jobsPanel) return;
  
  // Don't clear everything, just the job listings
  const jobsHeader = jobsPanel.querySelector('.section-header');
  const eventLog = jobsPanel.querySelector('.event-log');
  
  // Create a temporary container
  const tempContainer = document.createElement('div');
  
  // Add the header
  if (jobsHeader) {
    tempContainer.appendChild(jobsHeader.cloneNode(true));
  } else {
    const newHeader = document.createElement('h2');
    newHeader.className = 'section-header';
    newHeader.textContent = 'Available Careers';
    tempContainer.appendChild(newHeader);
  }
  
  // Get available jobs from organizations structure
  let availableJobs = [];
  
  // Process organizations and jobs
  if (gameState.organizations && Array.isArray(gameState.organizations)) {
    gameState.organizations.forEach(org => {
      // Create organization section
      const orgSection = document.createElement('div');
      orgSection.className = 'job-category';
      orgSection.innerHTML = `
        <h2 class="section-header">${org.name}</h2>
        <p>${org.description || ''}</p>
      `;
      
      // Process jobs in this organization
      const jobsInOrg = [];
      (org.jobs || []).forEach(job => {
        // Process each tier of the job
        (job.tiers || []).forEach(tier => {
          // Check if the player meets requirements for this job tier
          const isAvailable = typeof window.meetsJobRequirements === 'function' ? 
            window.meetsJobRequirements(job, tier.tier) : true;
          
          // Current job level
          const jobLevel = gameState.jobLevels && gameState.jobLevels[job.id] ? 
            gameState.jobLevels[job.id] : 0;
          
          // Calculate hourly rate
          let hourlyRate = tier.incomePerHour || 0;
          if (!hourlyRate && tier.incomePerYear) {
            // Default to 2000 working hours per year if CONFIG not available
            const workingHoursPerYear = (window.CONFIG && window.CONFIG.settings && 
                window.CONFIG.settings.ticksInOneGameYear) ? 
                window.CONFIG.settings.ticksInOneGameYear / 5 : 2000;
            
            hourlyRate = tier.incomePerYear / workingHoursPerYear;
          }
          
          // Add job item
          const jobItem = document.createElement('div');
          jobItem.className = `job-item ${isAvailable ? '' : 'unavailable'}`;
          jobItem.setAttribute('data-job-id', job.id);
          jobItem.setAttribute('data-tier', tier.tier);
          
          jobItem.innerHTML = `
            <div class="job-item-header">
              <span class="job-item-title">${job.title} (Tier ${tier.tier})</span>
              <span class="job-item-level">L. ${jobLevel}</span>
            </div>
            <div class="job-item-progress">
              <div class="progress-bar" style="flex-grow: 1; margin-right: 8px;">
                <div class="progress-fill" style="width: ${(gameState.activeJob && gameState.activeJob.id === job.id) ? 
                  (typeof window.getJobProgressPercentage === 'function' ? window.getJobProgressPercentage() : '40') : '0'}%;"></div>
              </div>
              <span>${hourlyRate.toFixed(2)} kudos/h</span>
            </div>
            <div class="job-item-requirements">
              ${formatRequirements(job, tier)}
            </div>
            ${tier.popCultureRef ? `<div class="job-item-quote">"${tier.popCultureRef}"</div>` : ''}
          `;
          
          // Add click handler to apply for job
          if (isAvailable) {
            jobItem.addEventListener('click', () => {
              if (typeof window.selectJob === 'function') {
                window.selectJob(job.id, tier.tier);
              } else if (typeof window.applyForJob === 'function') {
                window.applyForJob({...job, ...tier, id: job.id}, tier.tier);
              }
              updateAllDisplays();
            });
          }
          
          jobsInOrg.push(jobItem);
        });
      });
      
      // Add jobs to the organization section
      if (jobsInOrg.length > 0) {
        const jobsContainer = document.createElement('div');
        jobsContainer.className = 'jobs-container';
        jobsInOrg.forEach(jobItem => jobsContainer.appendChild(jobItem));
        orgSection.appendChild(jobsContainer);
        tempContainer.appendChild(orgSection);
      }
    });
  } else {
    // Fallback to old job display if organizations not available
    const availableJobs = gameState.jobs || [];
    
    availableJobs.forEach(job => {
      const jobItem = document.createElement('div');
      jobItem.className = 'job-item';
      
      let hourlyRate = 0;
      if (window.CONFIG && window.CONFIG.settings && window.CONFIG.settings.ticksInOneGameYear) {
        hourlyRate = job.incomePerYear / (window.CONFIG.settings.ticksInOneGameYear * (1000 / window.CONFIG.settings.tickInterval));
      } else {
        hourlyRate = job.incomePerYear / 600; // Fallback to default 600 ticks per year
      }
      
      jobItem.innerHTML = `
        <div class="job-item-header">
          <span class="job-item-title">${job.title}</span>
          <span class="job-item-level">L. ${gameState.jobLevels && gameState.jobLevels[job.id] ? gameState.jobLevels[job.id] : 0}</span>
        </div>
        <div class="job-item-progress">
          <div class="progress-bar" style="flex-grow: 1; margin-right: 8px;">
            <div class="progress-fill" style="width: ${job.id === gameState.activeJob?.id ? '40%' : '0%'};"></div>
          </div>
          <span>${hourlyRate.toFixed(2)} kudos/h</span>
        </div>
        <div class="job-item-requirements">
          ${job.requirements ? 'Req: ' + job.requirements : ''}
        </div>
      `;
      
      // Add click handler for job application
      jobItem.addEventListener('click', () => {
        if (typeof window.applyForJob === 'function') {
          // Find job index in available jobs array
          const jobIndex = availableJobs.indexOf(job);
          if (jobIndex !== -1) {
            window.applyForJob(jobIndex);
            updateAllDisplays();
          }
        }
      });
      
      tempContainer.appendChild(jobItem);
    });
  }
  
  // Add the event log back
  if (eventLog) {
    tempContainer.appendChild(eventLog.cloneNode(true));
  } else {
    // Create an event log if it doesn't exist
    const newEventLog = document.createElement('div');
    newEventLog.className = 'event-log';
    newEventLog.innerHTML = `
      <div class="event-log-header">Recent Events</div>
      <ul id="event-list" class="event-list">
        <li class="event-item">Welcome to Guezzard! Start your career journey now.</li>
      </ul>
    `;
    tempContainer.appendChild(newEventLog);
  }
  
  // Replace the content of the jobs panel
  jobsPanel.innerHTML = tempContainer.innerHTML;
}

/**
 * Update lifestyle panel with Kudos instead of $ in cost display
 */
function createLifestyleCategory(parentElement, categoryName, options) {
  const categoryElement = document.createElement('div');
  categoryElement.className = 'lifestyle-category';
  
  // Create category header
  categoryElement.innerHTML = `
    <div class="lifestyle-category-header">
      <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
      <span>${categoryName}</span>
    </div>
  `;
  
  // Add options to category
  options.forEach(option => {
    const optionElement = document.createElement('div');
    optionElement.className = `lifestyle-option ${option.current ? 'selected' : ''} ${!option.available ? 'unavailable' : ''}`;
    
    optionElement.innerHTML = `
      <span>${option.name}</span>
      <div class="option-cost">
        <span>${option.cost.toFixed(2)} kudos/day</span>
        <button class="info-button">i</button>
      </div>
    `;
    
    // Add tooltip with description
    if (option.description) {
      optionElement.title = option.description;
    }
    
    // Add click handler for option selection
    if (option.available) {
      optionElement.addEventListener('click', () => {
        const category = categoryName.toLowerCase();
        
        if (typeof window.selectLifestyleOption === 'function') {
          window.selectLifestyleOption(category, option.id);
        } else {
          // Fallback for simple lifestyle selection
          if (!window.gameState.lifestyle) {
            window.gameState.lifestyle = {};
          }
          window.gameState.lifestyle[category] = option.name;
          
          // Update UI
          updateLifestylePanel();
          updateLifestyleStats();
        }
      });
    }
    
    categoryElement.appendChild(optionElement);
  });
  
  // Add requirement if any option is unavailable
  const hasUnavailableOptions = options.some(option => !option.available);
  if (hasUnavailableOptions) {
    const requirementElement = document.createElement('div');
    requirementElement.className = 'lifestyle-requirement';
    requirementElement.textContent = "Some options require more kudos or career achievements";
    categoryElement.appendChild(requirementElement);
  }
  
  parentElement.appendChild(categoryElement);
}

/**
 * Update daily cost display in lifestyle panel
 */
function updateLifestylePanel() {
  const lifestylePanel = document.getElementById('lifestyle-panel');
  if(!lifestylePanel) return;
  
  // Implementation remains the same, just adding at the end:
  
  // Add daily cost display
  const dailyCost = window.gameState.lifestyleEffects && window.gameState.lifestyleEffects.costPerDay;
  if (dailyCost !== undefined) {
    const costDisplay = document.createElement('div');
    costDisplay.className = 'daily-cost-display';
    costDisplay.innerHTML = `<div class="cost-label">Daily lifestyle cost:</div><div class="cost-value">${dailyCost.toFixed(2)} kudos/day</div>`;
    lifestylePanel.appendChild(costDisplay);
  }
}

// Additional CSS for kudos symbols
document.addEventListener('DOMContentLoaded', function() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Kudos Currency Styling */
    .financial-stats .stat-label:first-child::after {
      content: " 💰";
    }
    
    .cost-value::after {
      content: " 💰";
    }
    
    /* Update daily cost styling */
    .daily-cost-display {
      margin-top: 20px;
      padding: 10px;
      background-color: var(--bg-panel);
      border-radius: var(--radius-md);
      display: flex;
      justify-content: space-between;
    }
    
    .cost-label {
      color: var(--text-secondary);
    }
    
    .cost-value {
      font-weight: bold;
      color: var(--danger);
    }
  `;
  document.head.appendChild(styleElement);
});

/**
 * Update time allocation display
 */
function updateTimeAllocation() {
  const divisionValue = document.querySelector('.time-division .division-value');
  const workingTimeDisplay = document.querySelector('.working .time-display');
  const workingProgressFill = document.querySelector('.working .progress-fill');
  const trainingTimeDisplay = document.querySelector('.training .time-display');
  const trainingProgressFill = document.querySelector('.training .progress-fill');
  
  // Other activities
  const sleepingTime = document.querySelector('.other-activities .other-activity:nth-child(1) span:nth-child(2)');
  const travelingTime = document.querySelector('.other-activities .other-activity:nth-child(2) span:nth-child(2)');
  const cleaningTime = document.querySelector('.other-activities .other-activity:nth-child(3) span:nth-child(2)');
  const cookingTime = document.querySelector('.other-activities .other-activity:nth-child(4) span:nth-child(2)');
  
  // Free time
  const freeTimeValue = document.querySelector('.free-time .free-time-value');
  
  // Get time allocation from game state
  if(!window.gameState.timeAllocation) {
    window.gameState.timeAllocation = {
      working: 5,
      training: 3,
      sleeping: 8,
      traveling: 2,
      cleaning: 0.5,
      cooking: 3,
      freeTime: 2.5
    };
  }
  
  // Update displayed values
  if(divisionValue) {
    divisionValue.textContent = "1 hour"; // This could be dynamic if your game has different time divisions
  }
  
  if(workingTimeDisplay) {
    const hours = Math.floor(window.gameState.timeAllocation.working);
    const minutes = Math.round((window.gameState.timeAllocation.working - hours) * 60);
    workingTimeDisplay.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  if(workingProgressFill) {
    // Calculate what percentage of the day is spent working
    const percentWorking = (window.gameState.timeAllocation.working / 24) * 100;
    workingProgressFill.style.width = `${percentWorking}%`;
  }
  
  if(trainingTimeDisplay) {
    const hours = Math.floor(window.gameState.timeAllocation.training);
    const minutes = Math.round((window.gameState.timeAllocation.training - hours) * 60);
    trainingTimeDisplay.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  if(trainingProgressFill) {
    // Calculate what percentage of the day is spent training
    const percentTraining = (window.gameState.timeAllocation.training / 24) * 100;
    trainingProgressFill.style.width = `${percentTraining}%`;
  }
  
  // Update other activities
  if(sleepingTime) {
    // Get sleep hours from lifestyle effects if available
    const sleepHours = window.gameState.lifestyleEffects && 
                       window.gameState.lifestyleEffects.timeAllocation ? 
                       window.gameState.lifestyleEffects.timeAllocation.sleep : 
                       window.gameState.timeAllocation.sleeping;
    
    const hours = Math.floor(sleepHours);
    const minutes = Math.round((sleepHours - hours) * 60);
    sleepingTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  if(travelingTime) {
    // Get commute hours from lifestyle effects if available
    const commuteHours = window.gameState.lifestyleEffects && 
                         window.gameState.lifestyleEffects.timeAllocation ? 
                         window.gameState.lifestyleEffects.timeAllocation.commute : 
                         window.gameState.timeAllocation.traveling;
    
    const hours = Math.floor(commuteHours);
    const minutes = Math.round((commuteHours - hours) * 60);
    travelingTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  if(cleaningTime) {
    const hours = Math.floor(window.gameState.timeAllocation.cleaning);
    const minutes = Math.round((window.gameState.timeAllocation.cleaning - hours) * 60);
    cleaningTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  if(cookingTime) {
    // Get meal hours from lifestyle effects if available
    const mealHours = window.gameState.lifestyleEffects && 
                      window.gameState.lifestyleEffects.timeAllocation ? 
                      window.gameState.lifestyleEffects.timeAllocation.meals : 
                      window.gameState.timeAllocation.cooking;
    
    const hours = Math.floor(mealHours);
    const minutes = Math.round((mealHours - hours) * 60);
    cookingTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // Update free time - calculate based on all time allocations
  if(freeTimeValue) {
    // Calculate total allocated time
    const totalAllocated = (
      window.gameState.timeAllocation.working +
      window.gameState.timeAllocation.training +
      (window.gameState.lifestyleEffects && window.gameState.lifestyleEffects.timeAllocation ? 
        window.gameState.lifestyleEffects.timeAllocation.sleep : window.gameState.timeAllocation.sleeping) +
      (window.gameState.lifestyleEffects && window.gameState.lifestyleEffects.timeAllocation ? 
        window.gameState.lifestyleEffects.timeAllocation.commute : window.gameState.timeAllocation.traveling) +
      (window.gameState.lifestyleEffects && window.gameState.lifestyleEffects.timeAllocation ? 
        window.gameState.lifestyleEffects.timeAllocation.meals : window.gameState.timeAllocation.cooking) +
      window.gameState.timeAllocation.cleaning
    );
    
    // Free time is 24 hours minus allocated time
    const freeTime = Math.max(0, 24 - totalAllocated);
    window.gameState.timeAllocation.freeTime = freeTime;
    
    const hours = Math.floor(freeTime);
    const minutes = Math.round((freeTime - hours) * 60);
    freeTimeValue.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
}

/**
 * Toggle game pause state
 */
function togglePause() {
  // This should integrate with your game's pause system
  if(typeof window.gameState !== 'undefined') {
    window.gameState.gamePaused = !window.gameState.gamePaused;
    console.log(`Game ${window.gameState.gamePaused ? 'paused' : 'resumed'}`);
  }
}

/**
 * Cycle game speed through available multipliers
 */
function cycleGameSpeed() {
  // This should integrate with your game's speed system
  if(typeof window.gameState !== 'undefined' && window.CONFIG && window.CONFIG.settings && window.CONFIG.settings.speedMultipliers) {
    const speedMultipliers = window.CONFIG.settings.speedMultipliers;
    const currentIndex = speedMultipliers.indexOf(window.gameState.gameSpeed);
    
    // Move to next speed or cycle back to beginning
    const nextIndex = (currentIndex + 1) % speedMultipliers.length;
    window.gameState.gameSpeed = speedMultipliers[nextIndex];
    
    console.log(`Game speed set to ${window.gameState.gameSpeed}x`);
  }
}

/**
 * Update energy display
 */
function updateEnergyDisplay() {
  const energyDisplay = document.getElementById('energy-display');
  const energyBarFill = document.getElementById('energy-bar-fill');
  
  if(energyDisplay && typeof window.gameState !== 'undefined') {
    energyDisplay.textContent = `${Math.floor(window.gameState.energy)}/${window.gameState.maxEnergy}`;
  }
  
  if(energyBarFill && typeof window.gameState !== 'undefined') {
    const energyPercentage = (window.gameState.energy / window.gameState.maxEnergy) * 100;
    energyBarFill.style.width = `${energyPercentage}%`;
  }
}

/**
 * Update jobs panel
 */
function updateJobsPanel() {
  const jobsPanel = document.getElementById('jobs-panel');
  if(!jobsPanel) return;
  
  // Don't clear everything, just the job listings
  const jobsHeader = jobsPanel.querySelector('.section-header');
  const eventLog = jobsPanel.querySelector('.event-log');
  
  // Create a temporary container
  const tempContainer = document.createElement('div');
  
  // Add the header
  if (jobsHeader) {
    tempContainer.appendChild(jobsHeader.cloneNode(true));
  } else {
    const newHeader = document.createElement('h2');
    newHeader.className = 'section-header';
    newHeader.textContent = 'Available Careers';
    tempContainer.appendChild(newHeader);
  }
  
  // Get available jobs from organizations structure
  let availableJobs = [];
  
  // Process organizations and jobs
  if (gameState.organizations && Array.isArray(gameState.organizations)) {
    gameState.organizations.forEach(org => {
      // Create organization section
      const orgSection = document.createElement('div');
      orgSection.className = 'job-category';
      orgSection.innerHTML = `
        <h2 class="section-header">${org.name}</h2>
        <p>${org.description || ''}</p>
      `;
      
      // Process jobs in this organization
      const jobsInOrg = [];
      (org.jobs || []).forEach(job => {
        // Process each tier of the job
        (job.tiers || []).forEach(tier => {
          // Check if the player meets requirements for this job tier
          const isAvailable = typeof window.meetsJobRequirements === 'function' ? 
            window.meetsJobRequirements(job, tier.tier) : true;
          
          // Current job level
          const jobLevel = gameState.jobLevels && gameState.jobLevels[job.id] ? 
            gameState.jobLevels[job.id] : 0;
          
          // Calculate hourly rate
          let hourlyRate = tier.incomePerHour || 0;
          if (!hourlyRate && tier.incomePerYear) {
            // Default to 2000 working hours per year if CONFIG not available
            const workingHoursPerYear = (window.CONFIG && window.CONFIG.settings && 
                window.CONFIG.settings.ticksInOneGameYear) ? 
                window.CONFIG.settings.ticksInOneGameYear / 5 : 2000;
            
            hourlyRate = tier.incomePerYear / workingHoursPerYear;
          }
          
          // Add job item
          const jobItem = document.createElement('div');
          jobItem.className = `job-item ${isAvailable ? '' : 'unavailable'}`;
          jobItem.setAttribute('data-job-id', job.id);
          jobItem.setAttribute('data-tier', tier.tier);
          
          jobItem.innerHTML = `
            <div class="job-item-header">
              <span class="job-item-title">${job.title} (Tier ${tier.tier})</span>
              <span class="job-item-level">L. ${jobLevel}</span>
            </div>
            <div class="job-item-progress">
              <div class="progress-bar" style="flex-grow: 1; margin-right: 8px;">
                <div class="progress-fill" style="width: ${(gameState.activeJob && gameState.activeJob.id === job.id) ? 
                  (typeof window.getJobProgressPercentage === 'function' ? window.getJobProgressPercentage() : '40') : '0'}%;"></div>
              </div>
              <span>${hourlyRate.toFixed(2)} $/h</span>
            </div>
            <div class="job-item-requirements">
              ${formatRequirements(job, tier)}
            </div>
            ${tier.popCultureRef ? `<div class="job-item-quote">"${tier.popCultureRef}"</div>` : ''}
          `;
          
          // Add click handler to apply for job
          if (isAvailable) {
            jobItem.addEventListener('click', () => {
              if (typeof window.selectJob === 'function') {
                window.selectJob(job.id, tier.tier);
              } else if (typeof window.applyForJob === 'function') {
                window.applyForJob({...job, ...tier, id: job.id}, tier.tier);
              }
              updateAllDisplays();
            });
          }
          
          jobsInOrg.push(jobItem);
        });
      });
      
      // Add jobs to the organization section
      if (jobsInOrg.length > 0) {
        const jobsContainer = document.createElement('div');
        jobsContainer.className = 'jobs-container';
        jobsInOrg.forEach(jobItem => jobsContainer.appendChild(jobItem));
        orgSection.appendChild(jobsContainer);
        tempContainer.appendChild(orgSection);
      }
    });
  } else {
    // Fallback to old job display if organizations not available
    const availableJobs = gameState.jobs || [];
    
    availableJobs.forEach(job => {
      const jobItem = document.createElement('div');
      jobItem.className = 'job-item';
      
      let hourlyRate = 0;
      if (window.CONFIG && window.CONFIG.settings && window.CONFIG.settings.ticksInOneGameYear) {
        hourlyRate = job.incomePerYear / (window.CONFIG.settings.ticksInOneGameYear * (1000 / window.CONFIG.settings.tickInterval));
      } else {
        hourlyRate = job.incomePerYear / 600; // Fallback to default 600 ticks per year
      }
      
      jobItem.innerHTML = `
        <div class="job-item-header">
          <span class="job-item-title">${job.title}</span>
          <span class="job-item-level">L. ${gameState.jobLevels && gameState.jobLevels[job.id] ? gameState.jobLevels[job.id] : 0}</span>
        </div>
        <div class="job-item-progress">
          <div class="progress-bar" style="flex-grow: 1; margin-right: 8px;">
            <div class="progress-fill" style="width: ${job.id === gameState.activeJob?.id ? '40%' : '0%'};"></div>
          </div>
          <span>${hourlyRate.toFixed(2)} $/h</span>
        </div>
        <div class="job-item-requirements">
          ${job.requirements ? 'Req: ' + job.requirements : ''}
        </div>
      `;
      
      // Add click handler for job application
      jobItem.addEventListener('click', () => {
        if (typeof window.applyForJob === 'function') {
          // Find job index in available jobs array
          const jobIndex = availableJobs.indexOf(job);
          if (jobIndex !== -1) {
            window.applyForJob(jobIndex);
            updateAllDisplays();
          }
        }
      });
      
      tempContainer.appendChild(jobItem);
    });
  }
  
  // Add the event log back
  if (eventLog) {
    tempContainer.appendChild(eventLog.cloneNode(true));
  } else {
    // Create an event log if it doesn't exist
    const newEventLog = document.createElement('div');
    newEventLog.className = 'event-log';
    newEventLog.innerHTML = `
      <div class="event-log-header">Recent Events</div>
      <ul id="event-list" class="event-list">
        <li class="event-item">Welcome to Guezzard! Start your career journey now.</li>
      </ul>
    `;
    tempContainer.appendChild(newEventLog);
  }
  
  // Replace the content of the jobs panel
  jobsPanel.innerHTML = tempContainer.innerHTML;
  
  // Helper function to format job requirements
  function formatRequirements(job, tier) {
    if (tier.tier === 1 && !tier.minSkill && !tier.requiredSkills && !tier.requiredJobId) {
      return "Starting Job - No Requirements";
    }
    
    let requirements = [];
    
    // Check minSkill (default to map_awareness)
    if (tier.minSkill) {
      const skillLevel = getSkillLevel('map_awareness');
      requirements.push(`Map Awareness ${skillLevel}/${tier.minSkill}`);
    }
    
    // Check specific skill requirements
    if (tier.requiredSkills) {
      for (const [skillId, level] of Object.entries(tier.requiredSkills)) {
        const playerLevel = getSkillLevel(skillId);
        const skillName = skillId.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        requirements.push(`${skillName} ${playerLevel}/${level}`);
      }
    }
    
    // Check previous job requirement
    if (tier.requiredJobId && tier.requiredJobLevel) {
      const jobLevel = gameState.jobLevels && gameState.jobLevels[tier.requiredJobId] || 0;
      const jobName = getJobTitle(tier.requiredJobId);
      
      requirements.push(`${jobName} L.${jobLevel}/${tier.requiredJobLevel}`);
    }
    
    return requirements.length > 0 ? `Req: ${requirements.join(', ')}` : "";
  }
  
  // Helper function to get skill level
  function getSkillLevel(skillId) {
    if (!gameState.skills || !gameState.skills[skillId]) {
      return 0;
    }
    
    const skill = gameState.skills[skillId];
    return typeof skill === 'object' ? skill.level || 0 : skill || 0;
  }
  
  // Helper function to get job title from ID
  function getJobTitle(jobId) {
    // Check all organizations for this job
    if (gameState.organizations) {
      for (const org of gameState.organizations) {
        for (const job of org.jobs || []) {
          if (job.id === jobId) {
            return job.title;
          }
        }
      }
    }
    
    // Fallback to formatting job ID
    return jobId.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
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
        <div class="toggle-switch">
          <div class="toggle-handle"></div>
        </div>
        <button class="config-button">CONFIG...</button>
      </div>
    </div>
  `;
  
  // Group skills by category
  const skillsByCategory = {};
  
  // Process skills from game state
  if (gameState.skills) {
    for (const skillId in gameState.skills) {
      const skill = gameState.skills[skillId];
      if (!skill) continue;
      
      // Get skill data
      const skillLevel = typeof skill === 'object' ? skill.level || 0 : skill || 0;
      if (skillLevel === 0) continue; // Skip skills with level 0
      
      // Get category
      let categoryId = 'general';
      if (typeof skill === 'object' && skill.categoryId) {
        categoryId = skill.categoryId;
      } else if (skillId.includes('map') || skillId.includes('data')) {
        categoryId = 'analytical';
      } else if (skillId.includes('program') || skillId.includes('coding')) {
        categoryId = 'technical';
      } else if (skillId.includes('communication') || skillId.includes('charisma')) {
        categoryId = 'social';
      }
      
      // Initialize category if needed
      if (!skillsByCategory[categoryId]) {
        skillsByCategory[categoryId] = [];
      }
      
      // Format skill name and description
      const skillName = typeof skill === 'object' ? 
        (skill.name || formatSkillName(skillId)) : formatSkillName(skillId);
      
      const skillDescription = typeof skill === 'object' ? 
        (skill.description || `Ability related to ${skillName}`) : 
        `Ability related to ${skillName}`;
      
      // Add skill to category
      skillsByCategory[categoryId].push({
        id: skillId,
        name: skillName,
        level: skillLevel,
        description: skillDescription,
        xp: typeof skill === 'object' ? skill.xp || 0 : 0
      });
    }
  }
  
  // Create skill categories
  for (const categoryId in skillsByCategory) {
    const categorySkills = skillsByCategory[categoryId];
    if (categorySkills.length === 0) continue;
    
    // Create category element
    const categoryElement = document.createElement('div');
    categoryElement.className = 'skill-category';
    
    categoryElement.innerHTML = `
      <div class="category-header">
        <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        <span>${formatCategoryName(categoryId)}</span>
      </div>
    `;
    
    // Add skills to category
    categorySkills.forEach(skill => {
      const skillElement = document.createElement('div');
      skillElement.className = 'skill-item';
      skillElement.setAttribute('data-skill', skill.id);
      
      // Calculate progress percentage
      let progressPercent = 0;
      if (gameState.skillProgress && gameState.skillProgress[skill.id] !== undefined) {
        const progress = gameState.skillProgress[skill.id];
        const progressNeeded = 10 + (skill.level * 5); // Simple progression formula
        progressPercent = Math.min(100, (progress / progressNeeded) * 100);
      } else if (skill.xp !== undefined) {
        // Use XP-based formula if available
        const baseXP = 100;
        const scalingFactor = 1.1;
        const xpNeeded = Math.floor(baseXP * Math.pow(scalingFactor, skill.level - 1));
        progressPercent = Math.min(100, (skill.xp / xpNeeded) * 100);
      }
      
      skillElement.innerHTML = `
        <div class="skill-header">
          <span>${skill.name}</span>
          <span class="skill-level">L. ${skill.level}</span>
        </div>
        <div class="skill-progress">
          <div class="progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <div class="skill-meta">
          <span class="skill-exp positive">Exp +0%</span>
          <span class="skill-effect">${skill.description}</span>
        </div>
      `;
      
      // Add click handler for skill training
      skillElement.addEventListener('click', () => {
        if (typeof window.trainSkill === 'function') {
          window.trainSkill(skill.id, 1);
          updateAllDisplays();
        }
      });
      
      categoryElement.appendChild(skillElement);
    });
    
    skillsPanel.appendChild(categoryElement);
  }
  
  // Add skill progress panel
  const skillProgressPanel = document.createElement('div');
  skillProgressPanel.className = 'skill-progress-panel';
  skillProgressPanel.innerHTML = `
    <div class="progress-text name" id="skill-progress-text">No Skill Training</div>
    <div class="progress-bar">
      <div id="skill-progress-fill" class="progress-fill" style="width: 0%;"></div>
    </div>
  `;
  skillsPanel.appendChild(skillProgressPanel);
  
  // Set up auto-learn toggle
  const toggleSwitch = skillsPanel.querySelector('.toggle-switch');
  if (toggleSwitch) {
    toggleSwitch.addEventListener('click', function() {
      this.classList.toggle('on');
      // Update game state
      gameState.autoLearnEnabled = this.classList.contains('on');
    });
    
    // Set initial state
    if (gameState.autoLearnEnabled) {
      toggleSwitch.classList.add('on');
    }
  }
  
  // Set up config button
  const configButton = skillsPanel.querySelector('.config-button');
  if (configButton) {
    configButton.addEventListener('click', () => {
      showAutoLearnConfig();
    });
  }
  
  // Helper function to format skill name
  function formatSkillName(skillId) {
    return skillId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Helper function to format category name
  function formatCategoryName(categoryId) {
    const name = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
    return name.endsWith('s') ? name : name + ' Skills';
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
          <h3 class="config-title">Auto Learn Configuration</h3>
          <button class="close-button">&times;</button>
        </div>
        
        <div class="config-rows">
          <div class="config-row">
            <div class="skill-config">
              <span class="skill-name">Map Awareness</span>
              <div class="level-config">
                <button class="row-button">-</button>
                <span class="level-value">20</span>
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
                <span class="level-value">15</span>
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
        
        <button class="add-row-button">ADD SKILL</button>
        
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
  
  if(!window.gameState.autoLearnConfig) {
    window.gameState.autoLearnConfig = [];
  }
  
  // Clear existing configuration
  window.gameState.autoLearnConfig = [];
  
  // Add each skill configuration
  configRows.forEach(row => {
    const skillName = row.querySelector('.skill-name').textContent;
    const targetLevel = parseInt(row.querySelector('.level-value').textContent);
    
    window.gameState.autoLearnConfig.push({
      skill: skillName,
      targetLevel: targetLevel
    });
  });
  
  console.log('Auto-learn configuration saved:', window.gameState.autoLearnConfig);
}

/**
 * Add event to event log
 * @param {string} text - Event text to add
 * @param {string} type - Event type (optional)
 */
function logEvent(text, type = 'info') {
  const eventList = document.getElementById('event-list');
  if(!eventList) return;
  
  // Create new event item
  const eventItem = document.createElement('li');
  eventItem.className = `event-item ${type}`;
  eventItem.textContent = text;
  
  // Add to event list
  eventList.prepend(eventItem);
  
  // Limit number of shown events
  const maxEvents = window.CONFIG && window.CONFIG.settings && window.CONFIG.settings.maxEventLogEntries 
    ? window.CONFIG.settings.maxEventLogEntries 
    : 5;
    
  while(eventList.children.length > maxEvents) {
    eventList.removeChild(eventList.lastChild);
  }
}

/**
 * Show a notification to the user
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, success, error, warning)
 */
function showNotification(title, message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  // Set content and type
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-title">${title}</div>
    <div class="notification-body">${message}</div>
  `;
  
  // Show notification
  notification.style.display = 'block';
  
  // Clear any existing timeout
  if (window.notificationTimeout) {
    clearTimeout(window.notificationTimeout);
  }
  
  // Hide after a delay
  window.notificationTimeout = setTimeout(() => {
    notification.style.display = 'none';
  }, 5000); // 5 seconds
}

// Make functions available to window object
window.updateAllDisplays = updateAllDisplays;
window.updateDateDisplay = updateDateDisplay;
window.updatePlayerStats = updatePlayerStats;
window.updateFinancialStats = updateFinancialStats;
window.updateTimeAllocation = updateTimeAllocation;
window.updateLifestyleStats = updateLifestyleStats;
window.updateJobsPanel = updateJobsPanel;
window.updateSkillsPanel = updateSkillsPanel;
window.updateLifestylePanel = updateLifestylePanel;
window.logEvent = logEvent;
window.updateEnergyDisplay = updateEnergyDisplay;
window.showNotification = showNotification;
window.togglePause = togglePause;
window.cycleGameSpeed = cycleGameSpeed;
window.increaseActivityTime = increaseActivityTime;
window.decreaseActivityTime = decreaseActivityTime;
window.saveAutoLearnConfig = saveAutoLearnConfig;
window.showAutoLearnConfig = showAutoLearnConfig;

// Additional CSS for lifestyle panel
document.addEventListener('DOMContentLoaded', function() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Lifestyle Panel Enhancements */
    .lifestyle-option {
      position: relative;
      transition: all 0.2s ease;
    }
    
    .lifestyle-option.unavailable {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .lifestyle-option:not(.unavailable):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .lifestyle-option.selected::after {
      content: '✓';
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--accent-primary);
      font-weight: bold;
    }
    
    .daily-cost-display {
      margin-top: 20px;
      padding: 10px;
      background-color: var(--bg-panel);
      border-radius: var(--radius-md);
      display: flex;
      justify-content: space-between;
    }
    
    .cost-label {
      color: var(--text-secondary);
    }
    
    .cost-value {
      font-weight: bold;
      color: var(--danger);
    }
    
    .job-item-quote {
      font-style: italic;
      color: var(--text-secondary);
      margin-top: 5px;
      font-size: 0.9em;
    }
  `;
  document.head.appendChild(styleElement);
});

console.log("ui-integration.js - Updated UI integration module loaded successfully");