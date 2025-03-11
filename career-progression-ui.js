// career-progression.js
// Enhanced career progression UI and visualization

console.log("career-progression.js - Loading");

// Career path visualization constant settings
const CAREER_PATH_SETTINGS = {
  colors: {
    background: "#2a2118",      // Chocolate brown background
    panelBackground: "#382c1e", // Slightly lighter brown for panels
    accent: "#e67e22",          // Warm orange accent
    secondaryAccent: "#d35400", // Darker orange for contrast
    text: "#f5f5f5",            // Light text color
    mutedText: "#bdc3c7",       // Muted text color
    success: "#27ae60",         // Success color (green)
    warning: "#f39c12",         // Warning color (orange)
    danger: "#c0392b",          // Danger color (red)
    inactive: "#7f8c8d",        // Inactive color (gray)
    jobNodeBg: "#3c2f20",       // Job node background
    jobNodeBorder: "#5e4534",   // Job node border
    jobNodeActive: "#8c6239",   // Active job node
    jobNodeHover: "#6d4c2a",    // Hover job node
    progressFill: "#e67e22"     // Progress bar fill
  },
  spacing: {
    tight: "8px",
    normal: "16px",
    loose: "24px"
  },
  animation: {
    timing: "0.3s ease"
  },
  borderRadius: {
    small: "4px",
    medium: "8px",
    large: "12px"
  }
};

// Initialize the career progression UI
function initializeCareerProgressionUI() {
  console.log("Initializing Career Progression UI");
  
  // Create career path visualization
  createCareerPathPanel();
  
  // Add job performance tracking
  initializeJobPerformanceTracking();
  
  // Add career progression button to the main UI
  addCareerButtonToUI();
}

// Create the main career path panel
function createCareerPathPanel() {
  // Check if panel already exists
  if (document.getElementById('career-path-panel')) {
    return;
  }
  
  // Create panel container
  const panel = document.createElement('div');
  panel.id = 'career-path-panel';
  panel.className = 'hidden-panel';
  panel.style.display = 'none';
  
  // Create panel header
  const header = document.createElement('h3');
  header.textContent = 'Career Progression';
  panel.appendChild(header);
  
  // Create content container
  const content = document.createElement('div');
  content.id = 'career-path-content';
  panel.appendChild(content);
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.className = 'close-button';
  closeButton.textContent = 'Close';
  closeButton.setAttribute('data-panel', 'career-path-panel');
  closeButton.addEventListener('click', () => {
    panel.style.display = 'none';
  });
  panel.appendChild(closeButton);
  
  // Add panel to document body
  document.body.appendChild(panel);
  
  // Add career path styles to document
  addCareerPathStyles();
}

// Add styles for career progression UI
function addCareerPathStyles() {
  // Check if styles are already added
  if (document.getElementById('career-progression-styles')) {
    return;
  }
  
  // Create style element
  const styleElement = document.createElement('style');
  styleElement.id = 'career-progression-styles';
  
  // Set CSS rules
  styleElement.textContent = `
    /* Career Path Panel Styles */
    #career-path-panel {
      max-width: 800px;
      width: 90%;
      background-color: ${CAREER_PATH_SETTINGS.colors.background};
      color: ${CAREER_PATH_SETTINGS.colors.text};
      border-radius: ${CAREER_PATH_SETTINGS.borderRadius.large};
      overflow: hidden;
    }
    
    #career-path-panel h3 {
      background-color: ${CAREER_PATH_SETTINGS.colors.panelBackground};
      color: ${CAREER_PATH_SETTINGS.colors.accent};
      margin: 0;
      padding: ${CAREER_PATH_SETTINGS.spacing.normal};
      text-align: center;
      border-bottom: 1px solid ${CAREER_PATH_SETTINGS.colors.jobNodeBorder};
    }
    
    #career-path-content {
      padding: ${CAREER_PATH_SETTINGS.spacing.normal};
      max-height: 60vh;
      overflow-y: auto;
    }
    
    /* Career Tree Visualization */
    .career-tree {
      display: flex;
      flex-direction: column;
      gap: 30px;
      padding: ${CAREER_PATH_SETTINGS.spacing.normal} 0;
    }
    
    .career-tier {
      border: 1px solid ${CAREER_PATH_SETTINGS.colors.jobNodeBorder};
      border-radius: ${CAREER_PATH_SETTINGS.borderRadius.medium};
      padding: ${CAREER_PATH_SETTINGS.spacing.normal};
      background-color: ${CAREER_PATH_SETTINGS.colors.panelBackground};
    }
    
    .tier-header {
      text-align: center;
      color: ${CAREER_PATH_SETTINGS.colors.accent};
      margin-top: 0;
      margin-bottom: ${CAREER_PATH_SETTINGS.spacing.normal};
      font-size: 1.2em;
      border-bottom: 1px solid ${CAREER_PATH_SETTINGS.colors.jobNodeBorder};
      padding-bottom: 8px;
    }
    
    .tier-jobs {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: ${CAREER_PATH_SETTINGS.spacing.normal};
    }
    
    .career-job-node {
      width: 150px;
      height: 100px;
      background-color: ${CAREER_PATH_SETTINGS.colors.jobNodeBg};
      border-radius: ${CAREER_PATH_SETTINGS.borderRadius.medium};
      padding: 12px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all ${CAREER_PATH_SETTINGS.animation.timing};
      text-align: center;
      position: relative;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      border: 1px solid ${CAREER_PATH_SETTINGS.colors.jobNodeBorder};
    }
    
    .career-job-node:hover {
      transform: translateY(-5px);
      background-color: ${CAREER_PATH_SETTINGS.colors.jobNodeHover};
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
    }
    
    .career-job-node.current-job {
      border: 2px solid ${CAREER_PATH_SETTINGS.colors.accent};
      background-color: ${CAREER_PATH_SETTINGS.colors.jobNodeActive};
      box-shadow: 0 0 15px rgba(230, 126, 34, 0.4);
    }
    
    .career-job-node.available-job {
      border: 1px solid ${CAREER_PATH_SETTINGS.colors.accent};
    }
    
    .career-job-node.locked-job {
      border: 1px solid ${CAREER_PATH_SETTINGS.colors.inactive};
      opacity: 0.7;
      background-color: ${CAREER_PATH_SETTINGS.colors.jobNodeBg};
    }
    
    .job-node-header {
      font-weight: bold;
      color: ${CAREER_PATH_SETTINGS.colors.text};
      margin-bottom: 10px;
      font-size: 1em;
    }
    
    .job-node-level {
      font-size: 0.8em;
      color: ${CAREER_PATH_SETTINGS.colors.accent};
    }
    
    /* Job Details Overlay */
    #job-details-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
    
    .job-details-content {
      background-color: ${CAREER_PATH_SETTINGS.colors.background};
      border-radius: ${CAREER_PATH_SETTINGS.borderRadius.large};
      padding: 25px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 0 30px rgba(230, 126, 34, 0.4);
      border: 1px solid ${CAREER_PATH_SETTINGS.colors.accent};
      color: ${CAREER_PATH_SETTINGS.colors.text};
    }
    
    .close-overlay-button {
      position: absolute;
      top: 10px;
      right: 15px;
      background: none;
      border: none;
      color: ${CAREER_PATH_SETTINGS.colors.accent};
      font-size: 1.6em;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      z-index: 1;
    }
    
    .job-details-title {
      text-align: center;
      color: ${CAREER_PATH_SETTINGS.colors.text};
      margin-top: 5px;
      margin-bottom: 15px;
      font-size: 1.4em;
      text-shadow: 0 0 10px rgba(230, 126, 34, 0.5);
    }
    
    .job-details-status {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .current-job-badge, .job-level-badge {
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 0.8em;
      font-weight: bold;
    }
    
    .current-job-badge {
      background-color: rgba(230, 126, 34, 0.3);
      color: ${CAREER_PATH_SETTINGS.colors.accent};
      border: 1px solid ${CAREER_PATH_SETTINGS.colors.accent};
    }
    
    .job-level-badge {
      background-color: rgba(39, 174, 96, 0.3);
      color: ${CAREER_PATH_SETTINGS.colors.success};
      border: 1px solid ${CAREER_PATH_SETTINGS.colors.success};
    }
    
    /* Job Performance Panel */
    #job-performance-panel {
      background-color: ${CAREER_PATH_SETTINGS.colors.background};
      border-radius: ${CAREER_PATH_SETTINGS.borderRadius.large};
      max-width: 500px;
      width: 90%;
    }
    
    .performance-meter-container {
      width: 100%;
      margin: 20px 0;
    }
    
    .performance-meter {
      height: 25px;
      background-color: ${CAREER_PATH_SETTINGS.colors.jobNodeBg};
      border-radius: 15px;
      overflow: hidden;
      position: relative;
      border: 1px solid ${CAREER_PATH_SETTINGS.colors.jobNodeBorder};
    }
    
    .performance-fill {
      height: 100%;
      position: relative;
      width: 50%;
      transition: width 0.5s ease;
      background: linear-gradient(90deg, ${CAREER_PATH_SETTINGS.colors.secondaryAccent}, ${CAREER_PATH_SETTINGS.colors.accent});
    }
    
    .performance-marker {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: rgba(255, 255, 255, 0.7);
    }
    
    .performance-marker.zero-marker {
      left: 50%;
    }
    
    .performance-value {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
    }
    
    /* Enhanced Job Progress Display */
    .enhanced-progress-container {
      background-color: ${CAREER_PATH_SETTINGS.colors.panelBackground};
      border-radius: ${CAREER_PATH_SETTINGS.borderRadius.medium};
      padding: 12px 15px;
      margin: 10px 0;
      border: 1px solid ${CAREER_PATH_SETTINGS.colors.jobNodeBorder};
      width: 100%;
      max-width: 300px;
    }
    
    .enhanced-progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .job-title {
      font-weight: bold;
      color: ${CAREER_PATH_SETTINGS.colors.text};
    }
    
    .job-level {
      background-color: rgba(230, 126, 34, 0.2);
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      color: ${CAREER_PATH_SETTINGS.colors.accent};
    }
    
    .enhanced-progress-bar {
      height: 15px;
      background-color: ${CAREER_PATH_SETTINGS.colors.jobNodeBg};
      border-radius: 10px;
      overflow: hidden;
      position: relative;
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
    }
    
    .enhanced-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, ${CAREER_PATH_SETTINGS.colors.secondaryAccent}, ${CAREER_PATH_SETTINGS.colors.accent});
      transition: width 0.3s ease;
    }
    
    .enhanced-progress-text {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.7em;
      font-weight: bold;
      text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
    }
    
    /* Performance status styles */
    .performance-excellent {
      color: ${CAREER_PATH_SETTINGS.colors.success};
      font-weight: bold;
    }
    .performance-good {
      color: ${CAREER_PATH_SETTINGS.colors.accent};
      font-weight: bold;
    }
    .performance-average {
      color: ${CAREER_PATH_SETTINGS.colors.warning};
    }
    .performance-poor {
      color: ${CAREER_PATH_SETTINGS.colors.danger};
    }
    .small-action-button {
      background-color: ${CAREER_PATH_SETTINGS.colors.accent};
      color: white;
      border: none;
      border-radius: ${CAREER_PATH_SETTINGS.borderRadius.medium};
      padding: 5px 10px;
      margin-top: 8px;
      cursor: pointer;
      transition: all ${CAREER_PATH_SETTINGS.animation.timing};
    }
    .small-action-button:hover {
      background-color: ${CAREER_PATH_SETTINGS.colors.secondaryAccent};
    }
    .progress-stat {
      font-size: 0.8em;
      display: flex;
      justify-content: space-between;
    }
    .stat-label {
      color: ${CAREER_PATH_SETTINGS.colors.mutedText};
    }
    .stat-value {
      color: ${CAREER_PATH_SETTINGS.colors.accent};
      font-weight: bold;
    }
    
    /* Requirement styles */
    .requirement {
      padding: 8px 10px;
      margin-bottom: 5px;
      border-radius: 5px;
    }
    .requirement.met {
      background-color: rgba(39, 174, 96, 0.2);
      border-left: 3px solid ${CAREER_PATH_SETTINGS.colors.success};
    }
    .requirement.not-met {
      background-color: rgba(192, 57, 43, 0.2);
      border-left: 3px solid ${CAREER_PATH_SETTINGS.colors.danger};
    }
    
    /* Job bonus styles */
    .bonus-unlocked, .bonus-locked {
      padding: 5px 10px;
      margin-bottom: 5px;
      border-radius: 5px;
    }
    .bonus-unlocked {
      background-color: rgba(39, 174, 96, 0.2);
      border-left: 3px solid ${CAREER_PATH_SETTINGS.colors.success};
    }
    .bonus-locked {
      background-color: rgba(127, 140, 141, 0.2);
      border-left: 3px solid ${CAREER_PATH_SETTINGS.colors.inactive};
      color: ${CAREER_PATH_SETTINGS.colors.mutedText};
    }
    
    /* Job details actions */
    .job-details-actions {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
    .job-details-actions button {
      padding: 10px 20px;
      border-radius: 20px;
      border: none;
      background-color: ${CAREER_PATH_SETTINGS.colors.accent};
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: all ${CAREER_PATH_SETTINGS.animation.timing};
    }
    .job-details-actions button:hover {
      background-color: ${CAREER_PATH_SETTINGS.colors.secondaryAccent};
      transform: translateY(-2px);
    }
    .job-details-actions button:disabled {
      background-color: ${CAREER_PATH_SETTINGS.colors.inactive};
      cursor: not-allowed;
      transform: none;
    }
  `;
  
  // Add styles to document head
  document.head.appendChild(styleElement);
}

// Add career button to UI
function addCareerButtonToUI() {
  // Check if button already exists
  if (document.getElementById('career-button')) {
    return;
  }
  
  // Create button
  const careerButton = document.createElement('button');
  careerButton.id = 'career-button';
  careerButton.className = 'action-button';
  careerButton.textContent = 'Career Path';
  
  // Get action buttons container
  const actionButtons = document.getElementById('action-buttons');
  if (!actionButtons) {
    console.error("Action buttons container not found");
    return;
  }
  
  // Add button to container
  actionButtons.appendChild(careerButton);
  
  // Add click event
  careerButton.addEventListener('click', () => {
    // Update career path visualization
    updateCareerPathVisualization();
    
    // Show panel
    const panel = document.getElementById('career-path-panel');
    if (panel) {
      panel.style.display = 'block';
    }
  });
}

// Update career path visualization
function updateCareerPathVisualization() {
  console.log("Updating career path visualization");
  
  // Get career path content container
  const contentArea = document.getElementById('career-path-content');
  if (!contentArea) {
    console.error("Career path content container not found");
    return;
  }
  
  // Clear existing content
  contentArea.innerHTML = '';
  
  // Get job data
  const jobs = window.gameState?.jobs || [];
  
  if (!jobs || jobs.length === 0) {
    contentArea.innerHTML = '<p>No career paths available yet.</p>';
    return;
  }
  
  // Create career tree
  const careerTree = document.createElement('div');
  careerTree.className = 'career-tree';
  
  // Group jobs by tier
  const jobsByTier = {};
  
  jobs.forEach(job => {
    if (!job.tiers || job.tiers.length === 0) {
      // For jobs without tiers, add them to tier 0
      if (!jobsByTier[0]) {
        jobsByTier[0] = [];
      }
      jobsByTier[0].push({ ...job, tier: 0 });
    } else {
      // For jobs with tiers, add each tier
      job.tiers.forEach(tier => {
        const tierNum = tier.tier;
        if (!jobsByTier[tierNum]) {
          jobsByTier[tierNum] = [];
        }
        
        // Create combined job object with tier data
        jobsByTier[tierNum].push({ ...job, ...tier, originalJobId: job.id });
      });
    }
  });
  
  // Sort tiers by number
  const sortedTiers = Object.keys(jobsByTier).sort((a, b) => parseInt(a) - parseInt(b));
  
  // Create tier containers
  sortedTiers.forEach(tierNum => {
    const tierContainer = document.createElement('div');
    tierContainer.className = 'career-tier';
    
    // Add tier header
    const tierHeader = document.createElement('h4');
    tierHeader.className = 'tier-header';
    tierHeader.textContent = `Tier ${tierNum} Careers`;
    tierContainer.appendChild(tierHeader);
    
    // Create jobs container
    const jobsContainer = document.createElement('div');
    jobsContainer.className = 'tier-jobs';
    
    // Add job nodes
    jobsByTier[tierNum].forEach(job => {
      const jobNode = createJobNode(job, tierNum);
      jobsContainer.appendChild(jobNode);
    });
    
    tierContainer.appendChild(jobsContainer);
    careerTree.appendChild(tierContainer);
  });
  
  contentArea.appendChild(careerTree);
}

// Create job node
function createJobNode(job, tierNum) {
  // Create node
  const jobNode = document.createElement('div');
  jobNode.className = 'career-job-node';
  jobNode.setAttribute('data-job-id', job.id);
  jobNode.setAttribute('data-tier', tierNum);
  
  // Check if it's current job
  const isCurrentJob = window.gameState?.activeJob?.id === job.id && 
                      window.gameState?.currentJobTier === parseInt(tierNum);
  
  if (isCurrentJob) {
    jobNode.classList.add('current-job');
  }
  
  // Check if job is available
  const isAvailable = typeof window.meetsJobRequirements === 'function' ? 
    window.meetsJobRequirements(job, parseInt(tierNum)) : true;
  
  if (isAvailable) {
    jobNode.classList.add('available-job');
  } else {
    jobNode.classList.add('locked-job');
  }
  
  // Get job level
  const jobLevel = window.gameState?.jobLevels?.[job.id] || 0;
  
  // Create job node content
  jobNode.innerHTML = `
    <div class="job-node-header">${job.title}</div>
    <div class="job-node-level">${jobLevel > 0 ? `Level ${jobLevel}` : 'Not Started'}</div>
  `;
  
  // Add click handler
  jobNode.addEventListener('click', () => {
    showJobDetails(job, tierNum);
  });
  
  return jobNode;
}

// Show job details
function showJobDetails(job, tierLevel) {
  console.log(`Showing details for job: ${job.id}, tier: ${tierLevel}`);
  
  // Create or get overlay
  let overlay = document.getElementById('job-details-overlay');
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'job-details-overlay';
    
    document.body.appendChild(overlay);
    
    // Add click event to close when clicking outside
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });
  }
  
  // Get job information
  const jobId = job.id;
  const jobTitle = job.title;
  const jobDescription = job.description || 'No description available.';
  const jobIncome = job.incomePerYear || 0;
  const jobTier = parseInt(tierLevel);
  
  // Get current job level
  const jobLevel = window.gameState?.jobLevels?.[jobId] || 0;
  
  // Check if it's current job
  const isCurrentJob = window.gameState?.activeJob?.id === jobId && 
                      window.gameState?.currentJobTier === jobTier;
  
  // Check if job is available
  const isAvailable = typeof window.meetsJobRequirements === 'function' ? 
    window.meetsJobRequirements(job, jobTier) : true;
  
  // Get skill requirements
  let skillRequirementsHtml = '';
  
  if (job.requiredSkills) {
    Object.entries(job.requiredSkills).forEach(([skillId, level]) => {
      const currentLevel = getSkillLevel(skillId);
      const isMet = currentLevel >= level;
      
      skillRequirementsHtml += `
        <div class="requirement ${isMet ? 'met' : 'not-met'}">
          ${skillId}: ${currentLevel}/${level}
        </div>
      `;
    });
  } else if (job.minSkill !== undefined) {
    const skillId = 'map_awareness';
    const currentLevel = getSkillLevel(skillId);
    const isMet = currentLevel >= job.minSkill;
    
    skillRequirementsHtml += `
      <div class="requirement ${isMet ? 'met' : 'not-met'}">
        Map Awareness: ${currentLevel}/${job.minSkill}
      </div>
    `;
  }
  
  // Get previous job requirement
  let previousJobRequirementHtml = '';
  
  if (job.requiredJobId && job.requiredJobLevel) {
    const requiredJobLevel = job.requiredJobLevel;
    const currentPrevJobLevel = window.gameState?.jobLevels?.[job.requiredJobId] || 0;
    const isMet = currentPrevJobLevel >= requiredJobLevel;
    
    // Find job name
    const requiredJob = findJobById(job.requiredJobId);
    const requiredJobName = requiredJob ? requiredJob.title : job.requiredJobId;
    
    previousJobRequirementHtml = `
      <div class="requirement ${isMet ? 'met' : 'not-met'}">
        ${requiredJobName} Level: ${currentPrevJobLevel}/${requiredJobLevel}
      </div>
    `;
  }
  
  // Get skill gains
  let skillGainsHtml = '';
  
  if (job.skillGainPerYear) {
    Object.entries(job.skillGainPerYear).forEach(([skillId, gain]) => {
      skillGainsHtml += `<li>${skillId}: +${gain}/year</li>`;
    });
  }
  
  // Get job bonuses
  let bonusesHtml = '';
  
  if (job.levelBonuses && job.levelBonuses.length > 0) {
    bonusesHtml = `
      <div class="job-bonuses">
        <h4>Level Bonuses:</h4>
        <ul>
    `;
    
    job.levelBonuses.forEach(bonus => {
      const bonusDescription = bonus.bonusType === 'jobXpMultiplier' 
        ? `+${(bonus.bonusValue * 100).toFixed(0)}% Job XP` 
        : `+${(bonus.bonusValue * 100).toFixed(0)}% Gold`;
          
      const hasBonus = jobLevel >= bonus.level;
      
      bonusesHtml += `
        <li class="${hasBonus ? 'bonus-unlocked' : 'bonus-locked'}">
          Level ${bonus.level}: ${bonusDescription}
        </li>
      `;
    });
    
    bonusesHtml += `
        </ul>
      </div>
    `;
  }
  
  // Create content
  const content = `
    <div class="job-details-content">
      <button class="close-overlay-button">&times;</button>
      
      <h3 class="job-details-title">${jobTitle} ${jobTier > 0 ? `(Tier ${jobTier})` : ''}</h3>
      
      <div class="job-details-status">
        ${isCurrentJob ? '<span class="current-job-badge">Current Job</span>' : ''}
        ${jobLevel > 0 ? `<span class="job-level-badge">Level ${jobLevel}</span>` : ''}
      </div>
      
      <div class="job-details-description">
        ${jobDescription}
      </div>
      
      <div class="job-details-stats">
        <div class="job-details-income">
          <span class="stat-label">Income:</span>
          <span class="stat-value">${jobIncome} gold/year</span>
        </div>
      </div>
      
      <div class="job-details-requirements">
        <h4>Requirements:</h4>
        ${skillRequirementsHtml}
        ${previousJobRequirementHtml}
      </div>
      
      <div class="job-details-skills">
        <h4>Skill Gains:</h4>
        <ul>
          ${skillGainsHtml}
        </ul>
      </div>
      
      ${bonusesHtml}
      
      <div class="job-details-actions">
        ${!isCurrentJob && isAvailable ? 
          `<button id="apply-job-button" data-job-id="${jobId}" data-job-tier="${jobTier}">Apply for Job</button>` : 
          (isCurrentJob ? 
            '<button id="quit-job-button">Quit Job</button>' : 
            '<button disabled>Requirements Not Met</button>'
          )
        }
      </div>
    </div>
  `;
  
  // Set content and show overlay
  overlay.innerHTML = content;
  overlay.style.display = 'flex';
  
  // Add event listeners
  const closeButton = overlay.querySelector('.close-overlay-button');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      overlay.style.display = 'none';
    });
  }
  
  const applyButton = overlay.querySelector('#apply-job-button');
  if (applyButton) {
    applyButton.addEventListener('click', () => {
      // Find job index
      const jobId = applyButton.getAttribute('data-job-id');
      const jobTier = parseInt(applyButton.getAttribute('data-job-tier'), 10);
      
      // Find job in jobs array
      let jobIndex = -1;
      window.gameState.jobs.forEach((j, index) => {
        if (j.id === jobId) {
          jobIndex = index;
        }
      });
      
      if (jobIndex >= 0 && typeof window.applyForJob === 'function') {
        const success = window.applyForJob(jobIndex, jobTier);
        
        if (success) {
          overlay.style.display = 'none';
          
          // Refresh the career path visualization
          updateCareerPathVisualization();
          
          // Update game display
          if (typeof window.updateDisplay === 'function') {
            window.updateDisplay();
          }
        }
      }
    });
  }
  
  const quitButton = overlay.querySelector('#quit-job-button');
  if (quitButton) {
    quitButton.addEventListener('click', () => {
      if (typeof window.quitJob === 'function') {
        const success = window.quitJob();
        
        if (success) {
          overlay.style.display = 'none';
          
          // Refresh the career path visualization
          updateCareerPathVisualization();
          
          // Update game display
          if (typeof window.updateDisplay === 'function') {
            window.updateDisplay();
          }
        }
      }
    });
  }
}

// Initialize job performance tracking
function initializeJobPerformanceTracking() {
  // Check if performance tracking is already initialized
  if (window.gameState.jobPerformance) {
    return;
  }
  
  // Initialize job performance
  window.gameState.jobPerformance = {
    current: 100,
    factors: {
      skillMatch: 0,
      consistency: 0,
      energy: 0,
      attributeBonus: 0
    },
    history: []
  };
  
  // Set up job time tracking
  if (!window.gameState.jobTime) {
    window.gameState.jobTime = {};
  }
  
  // If player has an active job, track start time
  if (window.gameState.activeJob) {
    window.gameState.jobTime[window.gameState.activeJob.id] = {
      startTime: Date.now(),
      totalTime: window.gameState.jobTime[window.gameState.activeJob.id]?.totalTime || 0
    };
  }
  
  // Add performance update to game loop if possible
  if (typeof window.gameLoop === 'function') {
    const originalGameLoop = window.gameLoop;
    window.gameLoop = function(timestamp) {
      // Call original game loop
      originalGameLoop(timestamp);
      
      // Update job performance periodically
      if (!window.gameState.gamePaused && window.gameState.activeJob) {
        // Use day change as trigger for performance update
        if (window.gameState.ticksSinceDayStart === 0) {
          updateJobPerformance();
        }
      }
    };
  }
}

// Update job performance
function updateJobPerformance() {
  // Skip if no active job
  if (!window.gameState.activeJob) {
    return;
  }
  
  // Calculate performance factors
  const factors = calculatePerformanceFactors();
  
  // Store factors
  window.gameState.jobPerformance.factors = factors;
  
  // Calculate overall performance (base 100 + factors)
  let newPerformance = 100 + 
    factors.skillMatch + 
    factors.consistency + 
    factors.energy + 
    factors.attributeBonus;
  
  // Ensure it stays within reasonable bounds (50-150)
  newPerformance = Math.max(50, Math.min(150, newPerformance));
  
  // Update current performance (with smoothing for gradual changes)
  const currentPerformance = window.gameState.jobPerformance.current;
  window.gameState.jobPerformance.current = currentPerformance * 0.8 + newPerformance * 0.2;
  
  // Add to history (once per game day)
  window.gameState.jobPerformance.history.push({
    day: window.gameState.day,
    performance: window.gameState.jobPerformance.current
  });
  
  // Keep history length reasonable
  if (window.gameState.jobPerformance.history.length > 30) {
    window.gameState.jobPerformance.history.shift();
  }
  
  // Update display if available
  updateJobPerformanceDisplay();
}

// Calculate performance factors
function calculatePerformanceFactors() {
  const factors = {
    skillMatch: 0,
    consistency: 0,
    energy: 0,
    attributeBonus: 0
  };
  
  if (!window.gameState.activeJob) {
    return factors;
  }
  
  // Skill match factor - how well player's skills match the job
  const jobSkills = getRelevantSkillsForJob(window.gameState.activeJob);
  let totalSkillLevel = 0;
  let skillCount = 0;
  
  for (const skillId in jobSkills) {
    const skillLevel = getSkillLevel(skillId);
    totalSkillLevel += skillLevel;
    skillCount++;
  }
  
  if (skillCount > 0) {
    const avgSkillLevel = totalSkillLevel / skillCount;
    // Each 5 levels of average skill adds 5% performance
    factors.skillMatch = Math.floor(avgSkillLevel / 5) * 5;
  }
  
  // Consistency factor - time in current job
  const jobId = window.gameState.activeJob.id;
  const jobTime = window.gameState.jobTime && window.gameState.jobTime[jobId] || 0;
  
  // Each 30 days at job adds 2% up to 10%
  factors.consistency = Math.min(10, Math.floor(jobTime / 30) * 2);
  
  // Energy factor
  const energyPercent = (window.gameState.energy / window.gameState.maxEnergy) * 100;
  // Below 30% energy reduces performance, above 70% improves it
  if (energyPercent < 30) {
    factors.energy = -10; // Penalty for low energy
  } else if (energyPercent > 70) {
    factors.energy = 5; // Bonus for high energy
  }
  
  // Add attribute bonus if we have attributes in the game
  if (window.gameState.attributes) {
    // Default to intelligence for job performance
    const intelligenceValue = window.gameState.attributes.intelligence || 5;
    factors.attributeBonus = Math.min(10, Math.max(-10, (intelligenceValue - 5) * 1.5));
  }
  
  return factors;
}

// Get current level of a skill
function getSkillLevel(skillId) {
  // Handle different skill storage formats
  if (window.gameState.skills) {
    const skill = window.gameState.skills[skillId];
    
    if (typeof skill === 'object' && skill !== null) {
      return skill.level || 0;
    } else if (typeof skill === 'number') {
      return skill;
    }
  }
  
  return 0;
}

// Get relevant skills for a job
function getRelevantSkillsForJob(job) {
  const relevantSkills = {};
  
  // Use skills that gain experience as relevant skills
  if (job.skillGainPerYear) {
    for (const skillId in job.skillGainPerYear) {
      relevantSkills[skillId] = true;
    }
  } else {
    // Default to map awareness
    relevantSkills["map_awareness"] = true;
  }
  
  return relevantSkills;
}

// Find a job by ID
function findJobById(jobId) {
  if (!window.gameState.jobs) {
    return null;
  }
  
  for (const job of window.gameState.jobs) {
    if (job.id === jobId) {
      return job;
    }
  }
  
  return null;
}

// Update job performance display
function updateJobPerformanceDisplay() {
  // Create or update the enhanced job progress display
  const topBar = document.getElementById('top-bar');
  if (!topBar) return;
  
  // Check if enhanced job progress already exists
  let enhancedJobProgress = document.getElementById('enhanced-job-progress');
  
  if (!enhancedJobProgress) {
    enhancedJobProgress = document.createElement('div');
    enhancedJobProgress.id = 'enhanced-job-progress';
    enhancedJobProgress.className = 'enhanced-progress-container';
    
    // Add to top bar
    topBar.appendChild(enhancedJobProgress);
  }
  
  // Update the content based on job status
  if (!window.gameState.activeJob) {
    enhancedJobProgress.innerHTML = `
      <div class="enhanced-progress-header">Career Status</div>
      <div class="enhanced-progress-status">Unemployed</div>
      <button id="find-job-button" class="small-action-button">Find Job</button>
    `;
    
    // Add event listener to the find job button
    const findJobButton = enhancedJobProgress.querySelector('#find-job-button');
    if (findJobButton) {
      findJobButton.addEventListener('click', () => {
        const jobsPanel = document.getElementById('jobs-panel');
        if (jobsPanel) {
          if (typeof window.setupJobsUI === 'function') {
            window.setupJobsUI();
          }
          jobsPanel.style.display = 'block';
        }
      });
    }
    
    return;
  }
  
  // Get job info
  const job = window.gameState.activeJob;
  const jobId = job.id;
  const jobTitle = job.title;
  const jobLevel = window.gameState.jobLevels && window.gameState.jobLevels[jobId] || 1;
  
  // Get job progress
  const jobProgress = window.gameState.jobProgress || 0;
  const progressNeeded = typeof window.calculateXPForJobLevel === 'function' ? 
    window.calculateXPForJobLevel(jobLevel) : 100 * Math.pow(1.1, jobLevel - 1);
  const progressPercent = Math.min(100, (jobProgress / progressNeeded) * 100);
  
  // Get performance data
  const performance = window.gameState.jobPerformance?.current || 100;
  let performanceClass = 'neutral';
  
  if (performance >= 120) {
    performanceClass = 'excellent';
  } else if (performance >= 100) {
    performanceClass = 'good';
  } else if (performance >= 80) {
    performanceClass = 'average';
  } else {
    performanceClass = 'poor';
  }
  
  // Get next bonus level
  let nextBonus = "None";
  let nextBonusLevel = Infinity;
  
  if (job.levelBonuses && Array.isArray(job.levelBonuses)) {
    for (const bonus of job.levelBonuses) {
      if (bonus.level > jobLevel && bonus.level < nextBonusLevel) {
        nextBonusLevel = bonus.level;
        nextBonus = bonus.bonusType === 'jobXpMultiplier' 
          ? `+${(bonus.bonusValue * 100).toFixed(0)}% Job XP` 
          : `+${(bonus.bonusValue * 100).toFixed(0)}% Gold`;
      }
    }
  }
  
  // Update UI
  enhancedJobProgress.innerHTML = `
    <div class="enhanced-progress-header">
      <span class="job-title">${jobTitle}</span>
      <span class="job-level">Level ${jobLevel}</span>
    </div>
    
    <div class="enhanced-progress-status performance-${performanceClass}">
      Performance: ${performance.toFixed(1)}%
    </div>
    
    <div class="enhanced-progress-bar-container">
      <div class="enhanced-progress-bar">
        <div class="enhanced-progress-fill" style="width: ${progressPercent}%"></div>
        <div class="enhanced-progress-text">${Math.floor(progressPercent)}%</div>
      </div>
    </div>
    
    <div class="enhanced-progress-stats">
      <div class="progress-stat">
        <span class="stat-label">Next Level:</span>
        <span class="stat-value">${jobLevel + 1}</span>
      </div>
      <div class="progress-stat">
        <span class="stat-label">Next Bonus:</span>
        <span class="stat-value">${nextBonusLevel === Infinity ? 'Max Level' : `Level ${nextBonusLevel}: ${nextBonus}`}</span>
      </div>
    </div>
    
    <button id="view-career-button" class="small-action-button">View Career Path</button>
  `;
  
  // Add event listener to the view career button
  const viewCareerButton = enhancedJobProgress.querySelector('#view-career-button');
  if (viewCareerButton) {
    viewCareerButton.addEventListener('click', () => {
      const careerPathPanel = document.getElementById('career-path-panel');
      if (careerPathPanel) {
        updateCareerPathVisualization();
        careerPathPanel.style.display = 'block';
      }
    });
  }
}

// Main initialization function
function initializeCareerSystem() {
  console.log("Initializing enhanced career system");
  
  // Create UI components
  createCareerPathPanel();
  
  // Initialize performance tracking
  initializeJobPerformanceTracking();
  
  // Add career buttons to UI
  addCareerButtonToUI();
  
  // Update initial displays
  updateCareerPathVisualization();
  updateJobPerformanceDisplay();
  
  console.log("Career system initialized successfully");
}

// Make these functions available globally
window.initializeCareerSystem = initializeCareerSystem;
window.updateCareerPathVisualization = updateCareerPathVisualization;
window.showJobDetails = showJobDetails;
window.updateJobPerformance = updateJobPerformance;
window.updateJobPerformanceDisplay = updateJobPerformanceDisplay;
window.getSkillLevel = getSkillLevel;
window.getRelevantSkillsForJob = getRelevantSkillsForJob;
window.findJobById = findJobById;
window.calculatePerformanceFactors = calculatePerformanceFactors;
window.initializeJobPerformanceTracking = initializeJobPerformanceTracking;
window.initializeCareerProgressionUI = initializeCareerProgressionUI;

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, initializing career system");
  // Wait a bit to ensure all other systems are loaded
  setTimeout(initializeCareerSystem, 1000);
});