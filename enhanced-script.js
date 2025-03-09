// enhanced-script.js
console.log("enhanced-script.js - File LOADED and EXECUTING - Top of File");
console.log("enhanced-script.js - Checking gameState at very top:", gameState);

// =========================================================================
// Utility Functions
// =========================================================================

function showNotification(title, message, type) {
    alert(`${title}: ${message}`); // Keep simple for now
}

function showErrorNotification(message) {
    alert(`Error: ${message}`);
}

function logEvent(message, category = 'game') {
    console.log(`logEvent() - ${category.toUpperCase()} - Message:`, message);
    const eventLogList = document.getElementById('event-log-list');
    if (!eventLogList) {
        console.error("Error: #event-log-list element NOT FOUND in logEvent()! Cannot log event:", message);
        return;
    }
    const newEventItem = document.createElement('li');
    newEventItem.textContent = message;
    newEventItem.classList.add(`event-log-item`, `event-category-${category}`);
    eventLogList.prepend(newEventItem);
    if (eventLogList.children.length > CONFIG.settings.maxEventLogEntries) {
        eventLogList.removeChild(eventLogList.lastElementChild);
    }
}

function endGame() {
    // clearInterval(gameState.tickIntervalId); // No longer used
    showNotification(CONFIG.uiText.endGameTitle, "You have reached the end of your life.", "info");

    const finalMapSkill = gameState.skills["Map Awareness"] || 0;
    let finalCareerTitle = "Google Maps User";

    for (let i = CONFIG.geoguesserCareerPath.length - 1; i >= 0; i--) {
        if (finalMapSkill >= CONFIG.geoguesserCareerPath[i].minSkill) {
            finalCareerTitle = CONFIG.geoguesserCareerPath[i].title;
            break;
        }
    }

    logEvent(`You ended your career as a ${finalCareerTitle} with ${finalMapSkill} map skill and ${Math.floor(gameState.gold)}€.`);
}

// =========================================================================
// UI Management Functions
// =========================================================================

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });
}

function setupGameControls() {
    console.log("setupGameControls() - START");
    const pauseButton = document.getElementById('pause-button');
    const speedButton = document.getElementById('speed-button');

    if (!pauseButton) {
        console.error("Pause button not found!");
        return;
    }
    if (!speedButton) {
        console.error("Speed button not found!");
        return;
    }

    pauseButton.addEventListener('click', function() {
        gameState.gamePaused = !gameState.gamePaused;
        pauseButton.textContent = gameState.gamePaused ? '▶ Resume' : '|| Pause';
        console.log(`Pause button toggled, gamePaused: ${gameState.gamePaused}`);
    });

    speedButton.addEventListener('click', function() {
        gameState.gameSpeed = (gameState.gameSpeed % 3) + 1; // Cycle through speeds 1, 2, 3
        speedButton.textContent = '▶ ' + gameState.gameSpeed + 'x Speed';
        console.log("Speed button clicked, gameSpeed:", gameState.gameSpeed);
    });

    console.log("setupGameControls() - END");
}

function setupShopUI() {
    const shopDiv = document.getElementById('shop');
    if (!shopDiv) {
        console.error("Error: #shop element NOT FOUND in setupShopUI()!");
        return;
    }

    shopDiv.innerHTML = ''; // Clear existing shop UI

    if (!CONFIG.shopItems || !Array.isArray(CONFIG.shopItems)) {
        console.error("Error: CONFIG.shopItems is not properly loaded or is not an array.");
        shopDiv.textContent = "Error loading shop items.";
        return;
    }

    CONFIG.shopItems.forEach(item => {
        if (!gameState.purchasedItems) {
            gameState.purchasedItems = {}; // Initialize if missing
        }

        const timesUsed = gameState.purchasedItems[item.id] || 0;
        const isDisabled = item.maxPurchases && timesUsed >= item.maxPurchases;
        const isMissingSkill = item.requiresSkill && (!gameState.skills[item.requiresSkill] || gameState.skills[item.requiresSkill] < (item.requiredSkillLevel || 1));

        const itemElement = document.createElement('div');
        itemElement.classList.add('shop-item');
        if (isDisabled || isMissingSkill) {
            itemElement.classList.add('disabled');
        }

        const iconClass = `fas ${item.icon || 'fa-gift'}`;

        const itemHTML = `
            <div class="shop-item-name"><i class="${iconClass}"></i> ${item.name}</div>
            <div class="shop-item-desc">${item.description}</div>
            <div class="shop-item-price">${item.price} gold</div>
            ${item.maxPurchases ? `<div class="shop-item-effect">Used: ${timesUsed}/${item.maxPurchases}</div>` : ''}
            ${isMissingSkill ? `<div class="shop-item-requires-skill">Requires: ${item.requiresSkill} Level ${item.requiredSkillLevel || 1}</div>` : ''}
        `;

        itemElement.innerHTML = itemHTML;

        itemElement.addEventListener('click', () => {
            if (isDisabled) {
                showNotification("Purchase Limit", "You've reached the maximum number of purchases for this item.", "warning");
                return;
            }
            if (isMissingSkill) {
                showNotification("Requirements Not Met", `You need ${item.requiresSkill} Level ${item.requiredSkillLevel || 1} to purchase this item.`, "warning");
                return;
            }
            purchaseItem(item);
            itemElement.classList.add('pulse');
            setTimeout(() => itemElement.classList.remove('pulse'), 600);
        });

        shopDiv.appendChild(itemElement);
    });
}

function purchaseItem(item) {
    if (gameState.gold < item.price) {
        showNotification("Insufficient Funds", "You don't have enough gold for this purchase.", "warning");
        return;
    }

    gameState.gold -= item.price;
    gameState.gameStats.itemsPurchased++;
    gameState.purchasedItems[item.id] = (gameState.purchasedItems[item.id] || 0) + 1;

    logEvent(`You purchased ${item.name}!`, 'shop');

    if (item.effect) {
        const [effectType, value] = item.effect.split(':');
        const effectValue = parseFloat(value);

        switch (effectType) {
            case 'maxAge':
                gameState.maxAge += effectValue;
                showNotification("Life Extended!", `Your maximum age is now ${gameState.maxAge}!`, "success");
                break;
            case 'goldMultiplier':
                gameState.multipliers.gold += effectValue;
                showNotification("Gold Multiplier Increased!", `Your gold earnings are now ${(gameState.multipliers.gold * 100).toFixed(0)}% of base earnings!`, "success");
                break;
            case 'skillMultiplier':
                gameState.multipliers.skill += effectValue;
                showNotification("Skill Multiplier Increased!", `Your skill gain is now ${(gameState.multipliers.skill * 100).toFixed(0)}% of base gain!`, "success");
                break;
            default:
                if (CONFIG.skillConfig[effectType]) {
                    gameState.skills[effectType] = (gameState.skills[effectType] || 0) + effectValue;
                    showNotification("Skill Increased!", `Your ${effectType} skill increased by ${effectValue}!`, "success");
                } else {
                    console.warn(`Unknown item effect type: ${effectType}`);
                }
                break;
        }
    }

    // updateDisplay(); // Now in game-loop.js
    setupShopUI();
}

function setupJobsUI() {
    console.log("setupJobsUI() - START");
    const jobsListDiv = document.getElementById('jobs-list');
    if (!jobsListDiv) {
        console.error('Jobs list div not found!');
        return;
    }
    jobsListDiv.innerHTML = '';

    const availableJobs = gameState.jobs.filter(job => {
        const jobTierData = job.tiers ? job.tiers.find(tier => tier.tier === gameState.currentJobTier) : null;
        return jobTierData ? gameState.skills["Map Awareness"].level >= jobTierData.minSkill : false;    
    });

    console.log("Available jobs:", availableJobs);

    if (availableJobs.length === 0) {
        jobsListDiv.innerHTML = '<p>No jobs available at your current skill level.</p>';
        return;
    }

    availableJobs.forEach((job, index) => {  // Use index in forEach
        const jobTierData = job.tiers.find(tier => tier.tier === gameState.currentJobTier);
        if (!jobTierData) {
            return;
        }

        const jobElement = document.createElement('div');
        jobElement.classList.add('job-item');
        jobElement.innerHTML = `
            <h3>${job.title}</h3>
            <p>Required Skill: ${jobTierData.minSkill}</p>
            <p>Income: ${jobTierData.incomePerYear} / year</p> <div class="job-description">${job.description}</div>
            <button class="apply-job-button" data-job-index="${index}">Apply</button> 
        `;
        jobsListDiv.appendChild(jobElement);
    });

    jobsListDiv.addEventListener('click', (event) => {
        if (event.target.classList.contains('apply-job-button')) {
            const jobIndex = parseInt(event.target.dataset.jobIndex, 10); // Parse to integer!
            if (!isNaN(jobIndex)) { // Check if parsing was successful
                applyForJob(jobIndex);  // Call applyForJob with the index
            } else {
                console.error("Invalid job index:", event.target.dataset.jobIndex);
            }
        }
    });
    console.log("setupJobsUI() - END");
}

function applyForJob(jobIndex) {
    console.log("applyForJob() - START - jobIndex:", jobIndex);

    const newJobData = getJobData(jobIndex, gameState.currentJobTier);

    if (!newJobData) {
        console.error("applyForJob() - Failed to get job data for index:", jobIndex);
        return; // Exit if job data is not found
    }

    if (gameState.skills["Map Awareness"].level >= newJobData.minSkill) {
        gameState.activeJob = { ...newJobData }; // Use spread for copying
        logEvent(`Got a new job: ${gameState.activeJob.title}!`, 'job');
        console.log("applyForJob() - Applied for job successfully:", gameState.activeJob);
    } else {
        logEvent(`You don't meet the requirements for ${newJobData.title}.`, 'job');
        console.log("applyForJob() - Skill requirement not met.");
    }

    console.log("applyForJob() - END");
}

function updateSkillDisplay() {
    console.log("updateSkillDisplay() - START");
    const skillsListDiv = document.getElementById('skills-list');

    if (!skillsListDiv) {
        console.error("Error: #skills-list element NOT FOUND in updateSkillDisplay()!");
        return;
    }

    skillsListDiv.innerHTML = '';

    for (const skillName in gameState.skills) {
        if (gameState.skills.hasOwnProperty(skillName)) {
            const skill = gameState.skills[skillName];
            const skillLevel = skill.level || 0; // Handle missing level
            const skillElement = document.createElement('div');
            skillElement.classList.add('skill-item');
            skillElement.innerHTML = `
                <i class="${skill.icon}"></i>
                <span>${skillName}: ${skillLevel.toFixed(2)}</span>
                <div class="skill-bar">
                    <div class="skill-bar-fill" style="width:${skillLevel}%"></div>
                </div>
            `;
            skillsListDiv.appendChild(skillElement);
        }
    }
    console.log("updateSkillDisplay() - END");
}

function setupAchievementsUI() {
    console.log("setupAchievementsUI() - START");
    const achievementsListDiv = document.getElementById('achievements-list');

    if (!achievementsListDiv) {
        console.error("Error: #achievements-list element not found!");
        return;
    }

    achievementsListDiv.innerHTML = '';
    gameState.achievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.classList.add('achievement-item');
        const isUnlocked = gameState.unlockedAchievements.includes(achievement.id);

        achievementElement.innerHTML = `
            <h3>${achievement.name}</h3>
            <p>${achievement.description}</p>
            <p>Status: ${isUnlocked ? 'Unlocked' : 'Locked'}</p>
        `;

        if (isUnlocked) {
            achievementElement.classList.add('unlocked');
        }
        achievementsListDiv.appendChild(achievementElement);
    });
    console.log("setupAchievementsUI() - END");
}

function setupEventLog() {
    console.log("setupEventLog() - START");
    const eventLogDiv = document.getElementById('event-log');
    if (!eventLogDiv) {
        console.error('Event log div not found!');
        return;
    }
    console.log("setupEventLog() - END");
}

// =========================================================================
// Data Loading and Initialization
// =========================================================================

function setInitialJob() {
    console.log("setInitialJob() - START - Setting initial job");
    const initialJobIndex = 0; // Google Maps User is at index 0
    gameState.activeJob = getJobData(initialJobIndex, gameState.currentJobTier); // Use getJobData()

    if (!gameState.activeJob) { // Check if getJobData returned a valid job
        console.error("setInitialJob() - Failed to get initial job data!");
        // Handle the error, maybe set a default job
        gameState.activeJob = { title: "Unemployed", incomePerYear: 0 };
    }


    logEvent(`Started career as a ${gameState.activeJob.title}.`, 'game'); // Use .title
    console.log("setInitialJob() - gameState.activeJob SET:", gameState.activeJob);
    console.log("setInitialJob() - END");
}

async function loadGameDataFromServer() {
    console.log("enhanced-script.js - Just BEFORE calling loadGameDataFromServer()");
    try {
        const [loadedSkills, loadedJobs, loadedAchievements] = await Promise.all([
            fetch("skills.json").then(response => response.json()),
            fetch("jobs.json").then(response => response.json()),
            fetch("achievements.json").then(response => response.json())
        ]);

        console.log("Skills data loaded:", loadedSkills);
        console.log("Jobs data loaded:", loadedJobs);
        console.log("Achievements data loaded:", loadedAchievements);

        // Initialize skills
        gameState.skills = {};
        loadedSkills.forEach(skill => {
            gameState.skills[skill.name] = {
                level: skill.level || 0, // Default to 0 if level is not provided
                description: skill.description,
                icon: skill.icon
             };
        });
        if (!gameState.skills.hasOwnProperty("Map Awareness")) {
            gameState.skills["Map Awareness"] = { level: 0 }; // Ensure Map Awareness exists
        }

        gameState.jobs = loadedJobs;
        gameState.achievements = loadedAchievements;

        console.log("loadGameDataFromServer() - Game data loaded and processed successfully.");

    } catch (error) {
        console.error("Error loading game data:", error);
        showErrorNotification("Failed to load game data. Please check console for details.");
    }
}