// ============== Game State ==============
let gameState = {
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
    currentCareerTrack: CAREER_TRACK_OFFICE,
    currentJob: "office_tier1",
    jobLevel: 1,
    jobExperience: 0,
    
    // Training
    currentTrainingSkill: SKILL_FOCUS,
    
    // Lifestyle
    housingType: HOUSING_HOMELESS,
    transportType: TRANSPORT_FOOT,
    foodType: FOOD_HOMELESS,
    
    // Skills
    generalSkills: {},
    professionalSkills: {},
    
    // Eternal Echoes
    skillEchoes: {},
    jobEchoes: {},
    
    // Game state
    isPaused: false,
    gameSpeed: 1, // Seconds per day
    tickInterval: null,
    isGameOver: false
};

// Initialize all skills to level 1
function initializeSkills() {
    // General skills
    for (const skillId in generalSkills) {
        gameState.generalSkills[skillId] = {
            level: 1,
            experience: 0
        };
    }
    
    // Professional skills
    for (const skillId in professionalSkills) {
        gameState.professionalSkills[skillId] = {
            level: 1,
            experience: 0
        };
    }
}

// ============== Core Game Functions ==============

// Calculate allocatable hours per day
function calculateAllocatableHours() {
    // Apply lifestyle modifiers to fixed time costs
    const housingOption = housingOptions[gameState.housingType];
    const transportOption = transportOptions[gameState.transportType];
    const foodOption = foodOptions[gameState.foodType];
    
    const adjustedSleepHours = gameState.sleepHours * (1 - housingOption.sleepTimeReduction);
    const adjustedCommuteHours = gameState.commuteHours * (1 - transportOption.commuteTimeReduction);
    const adjustedMealHours = gameState.mealHours * (1 - foodOption.mealTimeReduction);
    
    const fixedTimeTotal = adjustedSleepHours + adjustedCommuteHours + adjustedMealHours;
    const allocatableHours = 24 - fixedTimeTotal;
    
    return {
        allocatableHours,
        adjustedSleepHours,
        adjustedCommuteHours,
        adjustedMealHours,
        fixedTimeTotal
    };
}

// Calculate daily income based on job
function calculateDailyIncome() {
    const trackInfo = careerTracks[gameState.currentCareerTrack];
    const jobTier = trackInfo.tiers.find(tier => tier.id === gameState.currentJob);
    
    if (!jobTier) return 0;
    
    const baseRate = jobTier.baseSalary;
    const levelMultiplier = 1 + (gameState.jobLevel / 100);
    const hourlyRate = baseRate * levelMultiplier;
    
    return hourlyRate * gameState.workHours;
}

// Calculate daily expenses based on lifestyle
function calculateDailyExpenses() {
    const housingCost = housingOptions[gameState.housingType].cost;
    const transportCost = transportOptions[gameState.transportType].cost;
    const foodCost = foodOptions[gameState.foodType].cost;
    
    return housingCost + transportCost + foodCost;
}

// Calculate job experience gain for a day
function calculateJobExperience() {
    const trackInfo = careerTracks[gameState.currentCareerTrack];
    const jobTier = trackInfo.tiers.find(tier => tier.id === gameState.currentJob);
    const jobTierIndex = trackInfo.tiers.findIndex(tier => tier.id === gameState.currentJob);
    
    // Base rate depends on tier
    const baseExpPerHour = 5 + (jobTierIndex * 2);
    
    // Apply echo multiplier if exists
    const eternalEchoMultiplier = gameState.jobEchoes[gameState.currentJob] || 1;
    
    return gameState.workHours * baseExpPerHour * eternalEchoMultiplier;
}

// Calculate skill experience gain for a day
function calculateSkillExperience(skillId) {
    const baseExpPerHour = 5;
    
    // Apply echo multiplier if exists
    const eternalEchoMultiplier = gameState.skillEchoes[skillId] || 1;
    
    return gameState.trainingHours * baseExpPerHour * eternalEchoMultiplier;
}

// Check if job level up
function checkJobLevelUp() {
    const expForNextLevel = 100 * Math.pow(1.1, gameState.jobLevel);
    
    if (gameState.jobExperience >= expForNextLevel) {
        gameState.jobExperience -= expForNextLevel;
        gameState.jobLevel++;
        
        showNotification("Level Up!", `Your ${getJobTitle()} job level is now ${gameState.jobLevel}.`);
        
        // Return true if level up occurred
        return true;
    }
    
    return false;
}

// Check if skill level up
function checkSkillLevelUp(skillType, skillId) {
    const skillData = skillType === 'general' ? 
                      gameState.generalSkills[skillId] : 
                      gameState.professionalSkills[skillId];
    
    if (!skillData) return false;
    
    const expForNextLevel = 100 * Math.pow(1.08, skillData.level);
    
    if (skillData.experience >= expForNextLevel) {
        skillData.experience -= expForNextLevel;
        skillData.level++;
        
        const skillName = skillType === 'general' ? 
                         generalSkills[skillId].name : 
                         professionalSkills[skillId].name;
        
        showNotification("Skill Improved!", `Your ${skillName} skill level is now ${skillData.level}.`);
        
        // Check if this level grants an Eternal Echo increase
        if (skillData.level % 10 === 0 && skillData.level <= 100) {
            updateEternalEchoMultiplier(skillType, skillId, skillData.level / 10);
        }
        
        // Return true if level up occurred
        return true;
    }
    
    return false;
}

// Update eternal echo multiplier
function updateEternalEchoMultiplier(skillType, skillId, multiplierLevel) {
    // 10% bonus per 10 levels, up to 100% (2x multiplier)
    const bonusPercent = Math.min(multiplierLevel * 10, 100);
    const multiplierValue = 1 + (bonusPercent / 100);
    
    if (skillType === 'general' || skillType === 'professional') {
        gameState.skillEchoes[skillId] = multiplierValue;
        
        const skillName = skillType === 'general' ? 
                         generalSkills[skillId].name : 
                         professionalSkills[skillId].name;
        
        showNotification("Eternal Echo Gained!", `Your ${skillName} skill now has a ${bonusPercent}% Eternal Echo bonus.`);
    } else if (skillType === 'job') {
        gameState.jobEchoes[skillId] = multiplierValue;
        showNotification("Eternal Echo Gained!", `Your ${getJobTitle()} job now has a ${bonusPercent}% Eternal Echo bonus.`);
    }
}

// Calculate mortality rate
function calculateMortalityRate() {
    const kValue = 0.1; // Base steepness factor
    const midpoint = 75; // Age at which mortality reaches 50%
    
    // Apply lifestyle modifiers
    const housingOption = housingOptions[gameState.housingType];
    const foodOption = foodOptions[gameState.foodType];
    
    const mortalityModifier = housingOption.mortalityReduction + foodOption.mortalityReduction;
    const adjustedK = kValue * (1 - mortalityModifier);
    
    // Calculate using sigmoid function
    const base = 1.0; // 100% max mortality
    const mortalityRate = base * (1 / (1 + Math.exp(-adjustedK * (gameState.age - midpoint))));
    
    return mortalityRate;
}

// Check if death occurs
function checkMortality() {
    const mortalityRate = calculateMortalityRate();
    const randomValue = Math.random();
    
    // Daily chance of death based on mortality rate
    if (randomValue < mortalityRate) {
        // Death occurred
        handleDeath();
        return true;
    }
    
    return false;
}

// Handle player death
function handleDeath() {
    // Stop the game
    pauseGame();
    gameState.isGameOver = true;
    
    // Record highest levels for Eternal Echoes before reset
    for (const skillId in gameState.generalSkills) {
        const prevEcho = gameState.skillEchoes[skillId] || 1;
        const newEcho = 1 + (Math.floor(gameState.generalSkills[skillId].level / 10) * 0.1);
        
        if (newEcho > prevEcho) {
            gameState.skillEchoes[skillId] = newEcho;
        }
    }
    
    for (const skillId in gameState.professionalSkills) {
        const prevEcho = gameState.skillEchoes[skillId] || 1;
        const newEcho = 1 + (Math.floor(gameState.professionalSkills[skillId].level / 10) * 0.1);
        
        if (newEcho > prevEcho) {
            gameState.skillEchoes[skillId] = newEcho;
        }
    }
    
    // Add job echo
    const prevJobEcho = gameState.jobEchoes[gameState.currentJob] || 1;
    const newJobEcho = 1 + (Math.floor(gameState.jobLevel / 10) * 0.1);
    
    if (newJobEcho > prevJobEcho) {
        gameState.jobEchoes[gameState.currentJob] = newJobEcho;
    }
    
    // Find highest skill level
    let highestSkillLevel = 0;
    for (const skillId in gameState.generalSkills) {
        if (gameState.generalSkills[skillId].level > highestSkillLevel) {
            highestSkillLevel = gameState.generalSkills[skillId].level;
        }
    }
    for (const skillId in gameState.professionalSkills) {
        if (gameState.professionalSkills[skillId].level > highestSkillLevel) {
            highestSkillLevel = gameState.professionalSkills[skillId].level;
        }
    }
    
    // Show death screen
    document.getElementById('death-age').textContent = gameState.age;
    document.getElementById('death-job-level').textContent = gameState.jobLevel;
    document.getElementById('death-skill-level').textContent = highestSkillLevel;
    document.getElementById('death-screen').style.display = 'flex';
}

// Reincarnate player
function reincarnate() {
    // Save echoes
    const savedSkillEchoes = {...gameState.skillEchoes};
    const savedJobEchoes = {...gameState.jobEchoes};
    
    // Reset game state
    gameState = {
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
        sleepHours: 10,
        commuteHours: 4,
        mealHours: 4,
        
        // Career
        currentCareerTrack: CAREER_TRACK_OFFICE,
        currentJob: "office_tier1",
        jobLevel: 1,
        jobExperience: 0,
        
        // Training
        currentTrainingSkill: SKILL_FOCUS,
        
        // Lifestyle
        housingType: HOUSING_HOMELESS,
        transportType: TRANSPORT_FOOT,
        foodType: FOOD_HOMELESS,
        
        // Skills - will be initialized again
        generalSkills: {},
        professionalSkills: {},
        
        // Restore Eternal Echoes
        skillEchoes: savedSkillEchoes,
        jobEchoes: savedJobEchoes,
        
        // Game state
        isPaused: false,
        gameSpeed: 1,
        tickInterval: null,
        isGameOver: false
    };
    
    // Re-initialize skills
    initializeSkills();
    
    // Hide death screen
    document.getElementById('death-screen').style.display = 'none';
    
    // Restart the game
    resumeGame();
    
    // Update UI
    updateUI();
    
    showNotification("Reincarnated!", "You've been reincarnated with your Eternal Echo bonuses.");
}

// Start/pause game
function togglePause() {
    if (gameState.isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
    
    updateUI();
}

function pauseGame() {
    if (gameState.tickInterval) {
        clearInterval(gameState.tickInterval);
        gameState.tickInterval = null;
    }
    
    gameState.isPaused = true;
    document.getElementById('toggle-pause').textContent = 'Resume';
}

function resumeGame() {
    if (!gameState.tickInterval) {
        gameState.tickInterval = setInterval(progressDay, gameState.gameSpeed * 1000);
    }
    
    gameState.isPaused = false;
    document.getElementById('toggle-pause').textContent = 'Pause';
}

// Progress one day
function progressDay() {
    if (gameState.isPaused || gameState.isGameOver) return;
    
    // Calculate allocatable time
    const timeInfo = calculateAllocatableHours();
    
    // Check if time allocation is valid
    const totalAllocatedHours = gameState.workHours + gameState.trainingHours;
    if (totalAllocatedHours > timeInfo.allocatableHours) {
        // Automatically adjust work hours to fit
        gameState.workHours = Math.max(0, timeInfo.allocatableHours - gameState.trainingHours);
        
        if (gameState.workHours + gameState.trainingHours > timeInfo.allocatableHours) {
            gameState.trainingHours = Math.max(0, timeInfo.allocatableHours - gameState.workHours);
        }
        
        updateUI();
    }
    
    // Calculate income
    const dailyIncome = calculateDailyIncome();
    
    // Calculate expenses
    const dailyExpenses = calculateDailyExpenses();
    
    // Update kudos
    gameState.kudos += (dailyIncome - dailyExpenses);
    
    // Grant job experience
    if (gameState.workHours > 0) {
        gameState.jobExperience += calculateJobExperience();
        // Check for job level up
        checkJobLevelUp();
    }
    
    // Grant skill experience for the currently trained skill
    if (gameState.trainingHours > 0) {
        if (gameState.currentTrainingSkill in gameState.generalSkills) {
            gameState.generalSkills[gameState.currentTrainingSkill].experience += 
                calculateSkillExperience(gameState.currentTrainingSkill);
            
            // Check for skill level up
            checkSkillLevelUp('general', gameState.currentTrainingSkill);
        } else if (gameState.currentTrainingSkill in gameState.professionalSkills) {
            gameState.professionalSkills[gameState.currentTrainingSkill].experience += 
                calculateSkillExperience(gameState.currentTrainingSkill);
            
            // Check for skill level up
            checkSkillLevelUp('professional', gameState.currentTrainingSkill);
        }
    }
    
    // Increment day
    gameState.day++;
    
    // Check for month/year changes
    if (gameState.day > 30) {
        gameState.day = 1;
        gameState.month++;
        
        if (gameState.month > 12) {
            gameState.month = 1;
            gameState.year++;
            
            // Age increases each year
            gameState.age++;
            
            // Check mortality on birthdays
            if (checkMortality()) {
                return; // Game over, stop progression
            }
        }
    }
    
    // Update UI
    updateUI();
}

// ============== UI Functions ==============

// Update the entire UI
function updateUI() {
    updateStatusPanel();
    updateTimeAllocation();
    updateCareerPanel();
    updateSkillsPanel();
    updateLifestylePanel();
}

// Update status panel
function updateStatusPanel() {
    // Update date and age
    document.getElementById('date-display').textContent = `Day ${gameState.day}, Year ${gameState.year - 2024}`;
    document.getElementById('age-display').textContent = gameState.age;
    
    // Update kudos
    document.getElementById('kudos-display').textContent = Math.floor(gameState.kudos);
    
    // Update job info
    document.getElementById('job-display').textContent = getJobTitle();
    document.getElementById('job-level-display').textContent = gameState.jobLevel;
    
    // Update job progress bar
    const expForNextLevel = 100 * Math.pow(1.1, gameState.jobLevel);
    const progressPercent = (gameState.jobExperience / expForNextLevel) * 100;
    document.getElementById('job-progress').style.width = `${progressPercent}%`;
    
    // Update income and expenses
    document.getElementById('income-display').textContent = `${calculateDailyIncome().toFixed(1)} kudos/day`;
    document.getElementById('expenses-display').textContent = `${calculateDailyExpenses().toFixed(1)} kudos/day`;
    
    // Update mortality rate
    const mortalityPercent = calculateMortalityRate() * 100;
    document.getElementById('mortality-display').textContent = `${mortalityPercent.toFixed(2)}%`;
}

// Update time allocation panel
function updateTimeAllocation() {
    const timeInfo = calculateAllocatableHours();
    
    // Update fixed time displays
    document.getElementById('fixed-time-display').textContent = `${timeInfo.fixedTimeTotal.toFixed(1)} hours/day`;
    document.getElementById('sleep-time-display').textContent = `${timeInfo.adjustedSleepHours.toFixed(1)} hours`;
    document.getElementById('commute-time-display').textContent = `${timeInfo.adjustedCommuteHours.toFixed(1)} hours`;
    document.getElementById('meal-time-display').textContent = `${timeInfo.adjustedMealHours.toFixed(1)} hours`;
    
    // Update allocatable time
    document.getElementById('allocatable-time-display').textContent = `${timeInfo.allocatableHours.toFixed(1)} hours/day`;
    
    // Update work time display
    document.getElementById('work-time-display').textContent = `${gameState.workHours.toFixed(1)} hours`;
    
    // Update training time display
    document.getElementById('training-time-display').textContent = `${gameState.trainingHours.toFixed(1)} hours`;
    
    // Update slider positions
    updateTimeSliders(timeInfo.allocatableHours);
}

// Update slider positions based on current hours
function updateTimeSliders(allocatableHours) {
    // Set work slider
    const workSlider = document.getElementById('work-slider');
    const workHandle = document.getElementById('work-handle');
    const workPercentage = (gameState.workHours / allocatableHours) * 100;
    workHandle.style.left = `${workPercentage}%`;
    
    // Set training slider
    const trainingSlider = document.getElementById('training-slider');
    const trainingHandle = document.getElementById('training-handle');
    const trainingPercentage = (gameState.trainingHours / allocatableHours) * 100;
    trainingHandle.style.left = `${trainingPercentage}%`;
}

// Update career panel
function updateCareerPanel() {
    const careerContainer = document.getElementById('career-tracks-container');
    careerContainer.innerHTML = '';
    
    // Add career tracks
    for (const trackId in careerTracks) {
        const track = careerTracks[trackId];
        
        // Create career track element
        const trackElement = document.createElement('div');
        trackElement.className = 'career-track';
        
        // Create track header
        const trackHeader = document.createElement('div');
        trackHeader.className = 'career-track-header';
        
        const trackTitle = document.createElement('div');
        trackTitle.className = 'career-track-title';
        trackTitle.textContent = track.name;
        
        const trackDescription = document.createElement('div');
        trackDescription.className = 'career-track-description';
        trackDescription.textContent = track.description;
        
        trackHeader.appendChild(trackTitle);
        trackElement.appendChild(trackHeader);
        trackElement.appendChild(trackDescription);
        
        // Add job tiers - but only show the current one and the next one
        const currentTrackIndex = track.tiers.findIndex(tier => tier.id === gameState.currentJob);
        
        for (let i = 0; i < track.tiers.length; i++) {
            const tier = track.tiers[i];
            
            // Only show the current and next tier (if on this track)
            if (trackId === gameState.currentCareerTrack && 
                (i === currentTrackIndex || i === currentTrackIndex + 1)) {
                
                const tierElement = document.createElement('div');
                tierElement.className = 'job-tier';
                
                if (tier.id === gameState.currentJob) {
                    tierElement.classList.add('current-job');
                }
                
                // Only allow next tier if requirements are met
                const canApply = checkJobRequirements(tier);
                if (!canApply && tier.id !== gameState.currentJob) {
                    tierElement.classList.add('locked-job');
                }
                
                const jobDetails = document.createElement('div');
                jobDetails.className = 'job-details';
                
                const jobTitle = document.createElement('div');
                jobTitle.className = 'job-title';
                jobTitle.textContent = tier.name;
                
                const jobQuote = document.createElement('div');
                jobQuote.className = 'job-quote';
                jobQuote.textContent = tier.quote;
                
                const jobSalary = document.createElement('div');
                jobSalary.className = 'job-salary';
                jobSalary.textContent = `${tier.baseSalary} kudos/hr`;
                
                jobDetails.appendChild(jobTitle);
                jobDetails.appendChild(jobQuote);
                
                const applyButton = document.createElement('button');
                
                if (tier.id === gameState.currentJob) {
                    applyButton.textContent = 'Current Job';
                    applyButton.disabled = true;
                } else {
                    applyButton.textContent = canApply ? 'Apply' : 'Requirements Not Met';
                    applyButton.disabled = !canApply;
                    
                    if (canApply) {
                        applyButton.addEventListener('click', () => applyForJob(tier.id));
                    } else {
                        // Show requirements when hovering over locked job
                        tierElement.setAttribute('title', getJobRequirementsText(tier));
                    }
                }
                
                tierElement.appendChild(jobDetails);
                tierElement.appendChild(jobSalary);
                tierElement.appendChild(applyButton);
                
                trackElement.appendChild(tierElement);
            }
        }
        
        careerContainer.appendChild(trackElement);
    }
}

// Get requirements text for a job
function getJobRequirementsText(jobTier) {
    let text = "Requirements:\n";
    
    // General skills requirements
    for (const skillId in jobTier.requirements.generalSkills) {
        const requiredLevel = jobTier.requirements.generalSkills[skillId];
        const skillName = generalSkills[skillId].name;
        const currentLevel = gameState.generalSkills[skillId]?.level || 0;
        text += `- ${skillName}: ${currentLevel}/${requiredLevel}\n`;
    }
    
    // Professional skills requirements
    for (const skillId in jobTier.requirements.professionalSkills) {
        const requiredLevel = jobTier.requirements.professionalSkills[skillId];
        const skillName = professionalSkills[skillId].name;
        const currentLevel = gameState.professionalSkills[skillId]?.level || 0;
        text += `- ${skillName}: ${currentLevel}/${requiredLevel}\n`;
    }
    
    // Previous job level requirements
    if (jobTier.requirements.previousJob) {
        const prevJob = jobTier.requirements.previousJob;
        const prevJobLevel = jobTier.requirements.previousJobLevel;
        const trackInfo = Object.values(careerTracks).find(track => 
            track.tiers.some(tier => tier.id === prevJob)
        );
        
        if (trackInfo) {
            const prevJobInfo = trackInfo.tiers.find(tier => tier.id === prevJob);
            if (prevJobInfo) {
                const currentLevel = gameState.currentJob === prevJob ? gameState.jobLevel : 0;
                text += `- ${prevJobInfo.name} Level: ${currentLevel}/${prevJobLevel}\n`;
            }
        }
    }
    
    return text;
}

// Check if player meets job requirements
function checkJobRequirements(jobTier) {
    // Check general skills
    for (const skillId in jobTier.requirements.generalSkills) {
        const requiredLevel = jobTier.requirements.generalSkills[skillId];
        const currentLevel = gameState.generalSkills[skillId]?.level || 0;
        
        if (currentLevel < requiredLevel) {
            return false;
        }
    }
    
    // Check professional skills
    for (const skillId in jobTier.requirements.professionalSkills) {
        const requiredLevel = jobTier.requirements.professionalSkills[skillId];
        const currentLevel = gameState.professionalSkills[skillId]?.level || 0;
        
        if (currentLevel < requiredLevel) {
            return false;
        }
    }
    
    // Check previous job requirements
    if (jobTier.requirements.previousJob && jobTier.requirements.previousJobLevel) {
        if (gameState.currentJob !== jobTier.requirements.previousJob) {
            return false;
        }
        
        if (gameState.jobLevel < jobTier.requirements.previousJobLevel) {
            return false;
        }
    }
    
    return true;
}

// Apply for a new job
function applyForJob(jobId) {
    // Find which career track this job belongs to
    let careerTrackId = null;
    let jobTier = null;
    
    for (const trackId in careerTracks) {
        const track = careerTracks[trackId];
        const foundTier = track.tiers.find(tier => tier.id === jobId);
        
        if (foundTier) {
            careerTrackId = trackId;
            jobTier = foundTier;
            break;
        }
    }
    
    if (!careerTrackId || !jobTier) return;
    
    // Check requirements
    if (!checkJobRequirements(jobTier)) {
        showNotification("Cannot Apply", "You don't meet the requirements for this job.");
        return;
    }
    
    // Apply for the job
    gameState.currentCareerTrack = careerTrackId;
    gameState.currentJob = jobId;
    gameState.jobLevel = 1;
    gameState.jobExperience = 0;
    
    showNotification("New Job!", `You are now a ${jobTier.name}.`);
    
    // Update UI
    updateUI();
}

// Get the title of the current job
function getJobTitle() {
    const trackInfo = careerTracks[gameState.currentCareerTrack];
    if (!trackInfo) return "Unemployed";
    
    const jobTier = trackInfo.tiers.find(tier => tier.id === gameState.currentJob);
    if (!jobTier) return "Unemployed";
    
    return jobTier.name;
}

// Update skills panel
function updateSkillsPanel() {
    // Update general skills
    const generalSkillsContainer = document.getElementById('general-skills-container');
    generalSkillsContainer.innerHTML = '';
    
    for (const skillId in generalSkills) {
        const skill = generalSkills[skillId];
        const skillLevel = gameState.generalSkills[skillId].level;
        const skillExperience = gameState.generalSkills[skillId].experience;
        
        const expForNextLevel = 100 * Math.pow(1.08, skillLevel);
        const progressPercent = (skillExperience / expForNextLevel) * 100;
        
        const skillElement = document.createElement('div');
        skillElement.className = 'skill-item';
        
        const skillHeader = document.createElement('div');
        skillHeader.className = 'skill-header';
        
        const skillName = document.createElement('div');
        skillName.className = 'skill-name';
        skillName.textContent = skill.name;
        
        const skillLevelDisplay = document.createElement('div');
        skillLevelDisplay.className = 'skill-level';
        skillLevelDisplay.textContent = `Level ${skillLevel}`;
        
        skillHeader.appendChild(skillName);
        skillHeader.appendChild(skillLevelDisplay);
        
        const skillDescription = document.createElement('div');
        skillDescription.className = 'skill-description';
        skillDescription.textContent = skill.description;
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container skill-progress';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = `${progressPercent}%`;
        
        progressContainer.appendChild(progressBar);
        
        const trainingButton = document.createElement('button');
        trainingButton.className = 'training-button';
        
        if (gameState.currentTrainingSkill === skillId) {
            trainingButton.textContent = 'Currently Training';
            trainingButton.classList.add('active-training');
            trainingButton.disabled = true;
        } else {
            trainingButton.textContent = 'Train Skill';
            trainingButton.addEventListener('click', () => {
                gameState.currentTrainingSkill = skillId;
                updateUI();
            });
        }
        
        skillElement.appendChild(skillHeader);
        skillElement.appendChild(skillDescription);
        skillElement.appendChild(progressContainer);
        skillElement.appendChild(trainingButton);
        
        generalSkillsContainer.appendChild(skillElement);
    }
    
    // Update professional skills
    const professionalSkillsContainer = document.getElementById('professional-skills-container');
    professionalSkillsContainer.innerHTML = '';
    
    for (const skillId in professionalSkills) {
        const skill = professionalSkills[skillId];
        const skillLevel = gameState.professionalSkills[skillId].level;
        const skillExperience = gameState.professionalSkills[skillId].experience;
        
        const expForNextLevel = 100 * Math.pow(1.08, skillLevel);
        const progressPercent = (skillExperience / expForNextLevel) * 100;
        
        const skillElement = document.createElement('div');
        skillElement.className = 'skill-item';
        
        const skillHeader = document.createElement('div');
        skillHeader.className = 'skill-header';
        
        const skillName = document.createElement('div');
        skillName.className = 'skill-name';
        skillName.textContent = skill.name;
        
        const skillLevelDisplay = document.createElement('div');
        skillLevelDisplay.className = 'skill-level';
        skillLevelDisplay.textContent = `Level ${skillLevel}`;
        
        skillHeader.appendChild(skillName);
        skillHeader.appendChild(skillLevelDisplay);
        
        const skillDescription = document.createElement('div');
        skillDescription.className = 'skill-description';
        skillDescription.textContent = skill.description;
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container skill-progress';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = `${progressPercent}%`;
        
        progressContainer.appendChild(progressBar);
        
        const trainingButton = document.createElement('button');
        trainingButton.className = 'training-button';
        
        if (gameState.currentTrainingSkill === skillId) {
            trainingButton.textContent = 'Currently Training';
            trainingButton.classList.add('active-training');
            trainingButton.disabled = true;
        } else {
            trainingButton.textContent = 'Train Skill';
            trainingButton.addEventListener('click', () => {
                gameState.currentTrainingSkill = skillId;
                updateUI();
            });
        }
        
        skillElement.appendChild(skillHeader);
        skillElement.appendChild(skillDescription);
        skillElement.appendChild(progressContainer);
        skillElement.appendChild(trainingButton);
        
        professionalSkillsContainer.appendChild(skillElement);
    }
}