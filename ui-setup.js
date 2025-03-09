// Updates to ui-setup.js for job selection functionality

export function setupJobsUI() {
    console.log("Setting up jobs UI...");
    
    // Get or create jobs panel and list
    const jobsPanel = document.getElementById('jobs-panel') || document.createElement('div');
    if (!jobsPanel.id) {
        jobsPanel.id = 'jobs-panel';
        jobsPanel.classList.add('hidden-panel');
        document.getElementById('game-container').appendChild(jobsPanel);
    }
    
    let jobsList = document.getElementById('jobs-list');
    if (!jobsList) {
        console.log("Creating #jobs-list because it doesn't exist");
        jobsList = document.createElement('ul');
        jobsList.id = 'jobs-list';
        jobsPanel.appendChild(jobsList);
    }
    
    // Clear existing jobs
    jobsList.innerHTML = '';
    
    // Get available jobs based on player skills and requirements
    const availableJobs = window.getAvailableJobs ? window.getAvailableJobs() : [];
    
    // Check if jobs data is available
    if (!availableJobs || availableJobs.length === 0) {
        console.warn("No jobs available to display");
        jobsList.innerHTML = '<li class="no-jobs">No jobs available yet. Check back later!</li>';
        return;
    }
    
    // Add jobs to the list
    availableJobs.forEach((job, index) => {
        const jobItem = document.createElement('li');
        jobItem.classList.add('job-item');
        
        // Get requirements info
        const requiredSkill = "Map Awareness";
        const requiredLevel = job.minSkill || 0;
        const currentSkillLevel = gameState.skills[requiredSkill] || 0;
        
        // Get job level info for this job
        const jobLevel = gameState.jobLevels && gameState.jobLevels[job.id] ? gameState.jobLevels[job.id] : 0;
        
        // Get previous job requirement if applicable
        let previousJobRequirement = '';
        if (job.requiredJobId && job.requiredJobLevel) {
            const requiredJobData = window.getJobById ? window.getJobById(job.requiredJobId) : null;
            if (requiredJobData) {
                previousJobRequirement = `
                    <li class="${(gameState.jobLevels && gameState.jobLevels[job.requiredJobId] >= job.requiredJobLevel) ? 'requirement-met' : 'requirement-not-met'}">
                        ${requiredJobData.title} Level: ${gameState.jobLevels && gameState.jobLevels[job.requiredJobId] || 0}/${job.requiredJobLevel}
                    </li>
                `;
            }
        }
        
        jobItem.innerHTML = `
            <h3>${job.title} ${job.tier > 0 ? `(Tier ${job.tier})` : ''}</h3>
            <p>Income: ${job.incomePerYear || 0} gold per year</p>
            <p>Current Level: ${jobLevel}</p>
            <div class="job-requirements">
                <h4>Requirements:</h4>
                <ul>
                    <li class="${currentSkillLevel >= requiredLevel ? 'requirement-met' : 'requirement-not-met'}">
                        ${requiredSkill}: ${currentSkillLevel}/${requiredLevel}
                    </li>
                    ${previousJobRequirement}
                </ul>
            </div>
            <button class="apply-button" data-job-index="${index}" data-job-tier="${job.tier}">Apply</button>
        `;
        
        jobsList.appendChild(jobItem);
    });
    
    // Add event listeners to apply buttons
    const applyButtons = jobsList.querySelectorAll('.apply-button');
    applyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const jobIndex = parseInt(e.target.getAttribute('data-job-index'), 10);
            const jobTier = parseInt(e.target.getAttribute('data-job-tier'), 10);
            
            // Call the applyForJob function with the selected job
            if (typeof window.applyForJob === 'function') {
                const success = window.applyForJob(jobIndex, jobTier);
                if (success) {
                    closeJobsPanel();
                    updateDisplay();
                }
            } else {
                console.error("applyForJob function not available globally");
            }
        });
    });
    
    console.log(`setupJobsUI() - Added ${availableJobs.length} jobs to the UI`);
}

// Add this to your ui-setup.js file to handle job button clicks

function setupActionButtons() {
    console.log("Setting up action buttons...");
    
    // Job button handling
    const jobButton = document.getElementById('job-button');
    if (jobButton) {
        jobButton.addEventListener('click', () => {
            console.log("Jobs button clicked");
            
            // Get the jobs panel
            const jobsPanel = document.getElementById('jobs-panel');
            if (!jobsPanel) {
                console.error("Jobs panel not found in the DOM");
                return;
            }
            
            // Update job listings before showing the panel
            if (typeof window.setupJobsUI === 'function') {
                window.setupJobsUI();
            }
            
            // Show the panel
            jobsPanel.style.display = 'block';
            
            console.log("Jobs panel opened");
        });
    } else {
        console.warn("Job button not found in the DOM");
    }
    
    // Same for other action buttons
    // ...
}

// Update setupGameControls to call setupActionButtons
export function setupGameControls() {
    console.log("Setting up game controls...");
    
    // Existing code for pause and speed buttons
    // ...
    
    // Set up action buttons
    setupActionButtons();
}

// Also add this to your event handling function for panel close buttons
function setupPanelCloseButtons() {
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const panelId = button.getAttribute('data-panel');
            if (panelId) {
                const panel = document.getElementById(panelId);
                if (panel) {
                    panel.style.display = 'none';
                    console.log(`${panelId} closed`);
                }
            }
        });
    });
}

// Make functions available globally
window.setupJobsUI = setupJobsUI;