// enhanced-script.js - VERY TOP OF FILE
console.log("enhanced-script.js - File LOADED and EXECUTING - Top of File");
console.log("enhanced-script.js - Checking gameState at very top:", gameState);

gameState.purchasedItems = {}; // <-- ADD THIS LINE - Forcefully initialize gameState.purchasedItems VERY EARLY

// -----------------------------------------------------------------------------
// 3. Utility Functions (Notifications, Logging)
// -----------------------------------------------------------------------------

function showNotification(title, message, type) {
    alert(`${title}: ${message}`); // Simple alert for demonstration
}

function showErrorNotification(message) {
    alert(`Error: ${message}`);
}

function logEvent(message) {
    console.log("logEvent() - START - Message:", message);
    const eventLogList = document.getElementById('event-log-list');
    if (!eventLogList) {
        console.error("Error: #event-log-list element NOT FOUND in logEvent()! Cannot log event:", message);
        return;
    }
    const newEventItem = document.createElement('li');
    newEventItem.textContent = message;
    eventLogList.prepend(newEventItem);
    if (eventLogList.children.length > 10) {
        eventLogList.removeChild(eventLogList.lastElementChild);
    }
    console.log("logEvent() - END - Message:", message);
}

function checkForCareerUpgrade() {
    const mapSkill = gameState.skills["Map Awareness"] || 0;
    let highestEligibleCareer = null;
    let highestEligibleCareerIndex = -1;

    for (let i = CONFIG.geoguesserCareerPath.length - 1; i >= 0; i--) {
        if (mapSkill >= CONFIG.geoguesserCareerPath[i].minSkill) {
            highestEligibleCareer = CONFIG.geoguesserCareerPath[i];
            highestEligibleCareerIndex = i;
        } else {
            break;
        }
    }

    if (!highestEligibleCareer) return;

    const currentCareerIndex = CONFIG.geoguesserCareerPath.findIndex(career => career.title === gameState.activeJob.name);

    if (highestEligibleCareerIndex > currentCareerIndex) {
        const newCareer = highestEligibleCareer;
        let newJob = gameState.jobs.find(job => job.name === newCareer.title);

        if (!newJob) {
            newJob = {
                id: newCareer.title.toLowerCase().replace(/\s+/g, '_'),
                name: newCareer.title,
                description: `${newCareer.title} earning ${newCareer.incomePerYear}€ per year.`,
                tiers: [{
                    name: "Standard",
                    incomePerYear: newCareer.incomePerYear,
                    skillReward: {
                        "Map Awareness": newCareer.skillGainPerYear
                    },
                    requiredSkill: {
                        "Map Awareness": newCareer.minSkill
                    }
                }]
            };
            gameState.jobs.push(newJob);
        }

        gameState.activeJob = newJob;
        gameState.currentJobTier = 0;
        logEvent(`You were promoted to ${newCareer.title}! New income: ${newCareer.incomePerYear}€ per year.`);
        setupJobsUI();
        updateDisplay();
    }
}

function triggerRandomNewsTickerEvent() {
    const newsTicker = [
        "Scientists discover that the Earth is actually round!",
        "Local man still can't find his way home despite GPS.",
        "New research suggests staring at maps improves brain function.",
        "Breaking: Continental drift occurs faster when nobody is looking.",
        "Survey shows 9 out of 10 Geoguesser players can locate their own country.",
        "Map enthusiast wins lottery, plans to buy his own island and rename it.",
        "GPS companies in crisis as more people just 'feel the direction'.",
        "Geoguesser champion accidentally navigates to parallel dimension."
    ];

    const randomNews = newsTicker[Math.floor(Math.random() * newsTicker.length)];
    logEvent(`NEWS: ${randomNews}`, 'news');
}

function checkAchievements() {
    gameState.achievements.forEach(achievement => {
        if (!gameState.unlockedAchievements) {
            console.warn("gameState.unlockedAchievements is undefined in checkAchievements() - Potential scope issue");
            return;
        }
        if (gameState.unlockedAchievements.includes(achievement.id)) return;

        let isUnlocked = false;

        switch (achievement.condition.type) {
            case 'gold':
                isUnlocked = gameState.gold >= achievement.condition.value;
                break;
            case 'age':
                isUnlocked = gameState.age >= achievement.condition.value;
                break;
            case 'skill':
                isUnlocked = gameState.skills[achievement.condition.skill] >= achievement.condition.value;
                break;
            case 'job':
                isUnlocked = gameState.activeJob && gameState.activeJob.name === achievement.condition.jobName;
                break;
            case 'mapSkill':
                isUnlocked = gameState.skills["Map Awareness"] >= achievement.condition.value;
                break;
        }

        if (isUnlocked) {
            gameState.unlockedAchievements.push(achievement.id);
            logEvent(`Achievement unlocked: ${achievement.name}`);
            showNotification("Achievement Unlocked", achievement.name, "success");
        }
    });

    setupAchievementsUI();
}

function endGame() {
    clearInterval(gameState.tickIntervalId);
    showNotification("Game Over", "You have reached the end of your life.", "info");

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

// -----------------------------------------------------------------------------
// 5. UI Management Functions (Tab Navigation, Game Controls, Skill Display, Shop, Jobs, Achievements, Event Log)
// -----------------------------------------------------------------------------

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
        console.error("Error: #pause-button element NOT FOUND in setupGameControls()!");
        return;
    }
    if (!speedButton) {
        console.error("Error: #speed-button element NOT FOUND in setupGameControls()!");
        return;
    }

    pauseButton.addEventListener('click', function() {
        gameState.gamePaused = !gameState.gamePaused;
        if (gameState.gamePaused) {
            pauseButton.textContent = '▶ Resume';
        } else {
            pauseButton.textContent = '|| Pause';
        }
        console.log("Pause button toggled, gamePaused:", gameState.gamePaused);
    });

    speedButton.addEventListener('click', function() {
        gameState.gameSpeed = (gameState.gameSpeed % 3) + 1;
        speedButton.textContent = '▶ ' + gameState.gameSpeed + 'x Speed';
        console.log("Speed button clicked, gameSpeed:", gameState.gameSpeed);
    });

    console.log("setupGameControls() - END");
}

function toggleGamePause() {
    gameState.isPaused = !gameState.isPaused;
    const pauseButton = document.getElementById('pauseButton');

    if (gameState.isPaused) {
        clearInterval(gameState.tickIntervalId);
        pauseButton.innerHTML = `<i class="fas fa-play"></i> ${CONFIG.uiText.resumeButton}`;
    } else {
        gameState.tickIntervalId = setInterval(tick, CONFIG.settings.tickInterval / speedMultiplier);
        pauseButton.innerHTML = `<i class="fas fa-pause"></i> ${CONFIG.uiText.pauseButton}`;
    }
}

function cycleGameSpeed() {
    const currentIndex = CONFIG.settings.speedMultipliers.indexOf(speedMultiplier);
    const nextIndex = (currentIndex + 1) % CONFIG.settings.speedMultipliers.length;
    speedMultiplier = CONFIG.settings.speedMultipliers[nextIndex];

    if (!gameState.isPaused) {
        clearInterval(gameState.tickIntervalId);
        gameState.tickIntervalId = setInterval(tick, CONFIG.settings.tickInterval / speedMultiplier);
    }

    const speedButton = document.getElementById('speedButton');
    speedButton.innerHTML = `<i class="fas fa-forward"></i> ${speedMultiplier}x Speed`;
}

function updateSkillDisplay() {
    console.log("updateSkillDisplay() - START");
    const skillsListElement = document.getElementById('skills-list');
    if (!skillsListElement) {
        console.error("Error: #skills-list element NOT FOUND in updateSkillDisplay()!");
        return;
    }
    skillsListElement.innerHTML = '';

    const skillsDiv = document.getElementById("skills-panel");
    if (!skillsDiv) {
        console.error("Error: #skills-panel element NOT FOUND in updateSkillDisplay()!");
        return;
    }
    skillsDiv.innerHTML = '';

    const mapSkill = gameState.skills["Map Awareness"] || 0;
    let currentCareer = CONFIG.geoguesserCareerPath[0];
    let nextCareer = CONFIG.geoguesserCareerPath[1];

    for (let i = CONFIG.geoguesserCareerPath.length - 1; i >= 0; i--) {
        if (mapSkill >= CONFIG.geoguesserCareerPath[i].minSkill) {
            currentCareer = CONFIG.geoguesserCareerPath[i];
            nextCareer = CONFIG.geoguesserCareerPath[i + 1];
            break;
        }
    }

    let progressPercentage = 100;
    let progressText = "Max level reached";

    if (nextCareer) {
        const skillRange = nextCareer.minSkill - currentCareer.minSkill;
        const currentProgress = mapSkill - currentCareer.minSkill;
        progressPercentage = Math.min(100, (currentProgress / skillRange) * 100);
        progressText = `${mapSkill}/${nextCareer.minSkill} to ${nextCareer.title}`;
    }

    const mapSkillLi = document.createElement('li');
        mapSkillLi.classList.add('skill');
        mapSkillLi.classList.add('map-skill');

        const mapSkillHTML = `
            <div class="skill-name"><i class="fas fa-map-marked-alt"></i> Map Awareness</div>
            <div class="skill-level">
                <div class="skill-progress" style="width: ${progressPercentage}%"></div>
            </div>
            <div class="skill-value">Level ${mapSkill}</div>
            <div class="skill-progress-text">${progressText}</div>
        `;

        mapSkillLi.innerHTML = mapSkillHTML;
        skillsListElement.appendChild(mapSkillLi);

    for (const skillName in gameState.skills) {
        if (skillName === 'Map Awareness') continue;

        const skillLevel = gameState.skills[skillName];
        const skillConfig = CONFIG.skillConfig[skillName] || {
            description: "Your proficiency in this skill.",
            maxLevel: 100,
            icon: "fa-star"
        };

        const otherSkillLi = document.createElement('li');
        otherSkillLi.classList.add('skill');

        const iconClass = `fas ${skillConfig.icon || 'fa-star'}`;
        const progressWidth = Math.min(skillLevel, 100);

        const otherSkillHTML = `
            <div class="skill-name"><i class="${iconClass}"></i> ${skillName}</div>
            <div class="skill-level">
                <div class="skill-progress" style="width: ${progressWidth}%"></div>
            </div>
            <div class="skill-value">Level ${skillLevel}</div>
        `;

        otherSkillLi.innerHTML = otherSkillHTML;
        skillsListElement.appendChild(otherSkillLi);
    }

    console.log("updateSkillDisplay() - END");
}

function setupShopUI() {
    const shopDiv = document.getElementById('shop');
    if (!shopDiv) return;

    shopDiv.innerHTML = '';

    CONFIG.shopItems.forEach(item => {
        if (!gameState.purchasedItems) {
            console.warn("gameState.purchasedItems is undefined in setupShopUI() - Potential timing issue");
            return;
        }

        const timesUsed = gameState.purchasedItems[item.id] || 0;
        const isDisabled = item.maxPurchases && timesUsed >= item.maxPurchases;

        let isMissingSkill = false;
        if (item.requiresSkill && !gameState.skills[item.requiresSkill]) {
            isMissingSkill = true;
        }

        const itemElement = document.createElement('div');
        itemElement.classList.add('shop-item');
        if (isDisabled) {
            itemElement.classList.add('disabled');
        }

        const iconClass = `fas ${item.icon || 'fa-gift'}`;

        const itemHTML = `
            <div class="shop-item-name"><i class="${iconClass}"></i> ${item.name}</div>
            <div class="shop-item-desc">${item.description}</div>
            <div class="shop-item-price">${item.price} gold</div>
            ${item.maxPurchases ? `<div class="shop-item-effect">Used: ${timesUsed}/${item.maxPurchases}</div>` : ''}
        `;

        itemElement.innerHTML = itemHTML;

        itemElement.addEventListener('click', () => {
            if (isDisabled) {
                showNotification("Purchase Limit", "You've reached the maximum number of purchases for this item.", "warning");
                return;
            }

            if (isMissingSkill) {
                showNotification("Requirements Not Met", `You need the ${item.requiresSkill} skill to purchase this item.`, "warning");
                return;
            }

            if (gameState.gold >= item.price) {
                purchaseItem(item);
                itemElement.classList.add('pulse');
                setTimeout(() => itemElement.classList.remove('pulse'), 600);

                if (item.maxPurchases && gameState.purchasedItems[item.id] >= item.maxPurchases) {
                    setupShopUI();
                } else {
                    const effectElement = itemElement.querySelector('.shop-item-effect');
                    if (effectElement && item.maxPurchases) {
                        effectElement.textContent = `Used: ${gameState.purchasedItems[item.id]}/${item.maxPurchases}`;
                    }
                }
            } else {
                showNotification("Insufficient Funds", "You don't have enough gold for this purchase.", "warning");
            }
        });

        shopDiv.appendChild(itemElement);
    });
}

function setupJobsUI() {
    console.log("setupJobsUI() - START");
    const jobsListElement = document.getElementById('jobs-list');
    if (!jobsListElement) {
        console.error("Error: #jobs-list element NOT FOUND in setupJobsUI()!");
        return;
    }
    jobsListElement.innerHTML = '';

    const jobsDiv = document.getElementById('jobs-panel');
    if (!jobsDiv) {
        console.error("Error: #jobs-panel element NOT FOUND in setupJobsUI()!");
        return;
    }
    jobsDiv.innerHTML = '';

    let geoguesserJobs = gameState.jobs.filter(job =>
        ["Google Maps User", "Geoguesser Noob", "Geoguesser Enthusiast", "Geoguesser Champion"].includes(job.name)
    );

    if (geoguesserJobs.length === 0) {
        CONFIG.geoguesserCareerPath.forEach(career => {
            const newJob = {
                id: career.title.toLowerCase().replace(/\s+/g, '_'),
                name: career.title,
                description: `${career.title} earning ${career.incomePerYear}€ per year with ${career.skillGainPerYear} Map Awareness skill gain per year.`,
                tiers: [{
                    name: "Standard",
                    incomePerYear: career.incomePerYear,
                    skillReward: {
                        "Map Awareness": career.skillGainPerYear
                    },
                    requiredSkill: {
                        "Map Awareness": career.minSkill
                    }
                }]
            };
            gameState.jobs.push(newJob);
            geoguesserJobs.push(newJob);
        });
    }

    geoguesserJobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.classList.add('job');

        if (gameState.activeJob && gameState.activeJob.id === job.id) {
            jobElement.classList.add('active');
        }

        const careerInfo = CONFIG.geoguesserCareerPath.find(path => path.title === job.name) || {};

        const jobHTML = `
            <div class="job-name">${job.name}</div>
            <div class="job-desc">${job.description || `${careerInfo.incomePerYear}€ per year, +${careerInfo.skillGainPerYear} Map Awareness skill per year`}</div>
            <div class="job-requirements">Required Map Awareness skill: ${careerInfo.minSkill || 0}</div>
        `;

        jobElement.innerHTML = jobHTML;
        jobElement.classList.add(hasRequiredSkillForJob(job) ? 'available' : 'locked');
        jobsDiv.appendChild(jobElement);
    });
    console.log("setupJobsUI() - END");
}

function hasRequiredSkillForJob(job) {
    if (job.tiers && job.tiers[0].requiredSkill) {
        for (const skillName in job.tiers[0].requiredSkill) {
            if (!gameState.skills[skillName] || gameState.skills[skillName] < job.tiers[0].requiredSkill[skillName]) {
                return false;
            }
        }
    }
    return true;
}

function setupAchievementsUI() {
    console.log("setupAchievementsUI() - START");
    const achievementsListElement = document.getElementById('achievements-list');
    if (!achievementsListElement) {
        console.error("Error: #achievements-list element NOT FOUND in setupAchievementsUI()!");
        return;
    }
    achievementsListElement.innerHTML = '';

    gameState.achievements.forEach(achievement => {
        const listItem = document.createElement('li'); // **DECLARE listItem HERE - BEFORE if statement**
        listItem.classList.add('achievement-item');

        if (gameState.unlockedAchievements.includes(achievement.id)) return; // Now listItem is ALWAYS declared

        let description = achievement.description;
        if (achievement.type === 'jobTier') {
            const job = gameState.jobs.find(j => j.id === achievement.jobId);
            if (job) {
                const tier = job.tiers.find(t => t.tier === achievement.tier);
                if (tier) {
                    description = achievement.description.replace("{}", tier.name);
                }
            }
        }

        listItem.innerHTML = `
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${description}</div>
        `;
        achievementsListElement.appendChild(listItem);
    });

    console.log("setupAchievementsUI() - END");
}

function setupEventLog() {
    console.log("setupEventLog() - START");
    const eventLogElement = document.getElementById('event-log');
    if (!eventLogElement) {
        console.error("Error: #event-log element NOT FOUND in setupEventLog()!");
        return;
    }

    const eventLogList = document.getElementById('event-log-list');
    if (!eventLogList) {
        console.error("Error: #event-log-list element NOT FOUND in setupEventLog()!");
        return;
    }

    eventLogElement.addEventListener('click', function() {
        console.log("Event log clicked!");
    });

    console.log("setupEventLog() - END");
}

// -----------------------------------------------------------------------------
// 6. Game Loop and Initialization
// -----------------------------------------------------------------------------

function updateDisplay() {
    console.log("updateDisplay() - START");
    const goldDisplay = document.getElementById('gold-display');
    const ageDisplay = document.getElementById('age-display');
    const lifeQualityDisplay = document.getElementById('life-quality-display');
    const currentJobNameDisplay = document.getElementById('current-job-name');

    if (!goldDisplay) {
        console.error("Error: #gold-display element NOT FOUND in updateDisplay()!");
        return;
    }
    if (!ageDisplay) {
        console.error("Error: #age-display element NOT FOUND in updateDisplay()!");
        return;
    }
    if (!lifeQualityDisplay) {
        console.error("Error: #life-quality-display element NOT FOUND in updateDisplay()!");
        return;
    }
    if (!currentJobNameDisplay) {
        console.error("Error: #current-job-name element NOT FOUND in updateDisplay()!");
        return;
    }

    goldDisplay.textContent = Math.floor(gameState.gold);
    ageDisplay.textContent = Math.floor(gameState.age);
    lifeQualityDisplay.textContent = gameState.lifeQuality;

    if (gameState.activeJob) {
        currentJobNameDisplay.textContent = gameState.activeJob.name;
    } else {
        currentJobNameDisplay.textContent = "Unemployed";
    }

    updateJobProgressBar();
    updateSkillProgressBar();

    console.log("updateDisplay() - END");
}

function purchaseItem(item) {
    gameState.gold -= item.price;
    gameState.gameStats.itemsPurchased++;
    gameState.purchasedItems[item.id] = (gameState.purchasedItems[item.id] || 0) + 1;

    logEvent(`You purchased ${item.name}!`);

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
                }
                break;
        }
    }

    updateDisplay();
}

let currentTick = 0;

function tick() {
    console.log("tick() - START - Game Tick Started"); // <--- START LOG - TICK FUNCTION

    if (gameState.isPaused) {
        console.log("tick() - Game is PAUSED - Exiting tick early");
        return;
    }

    currentTick++;

    // ... (game day/year logic - No Changes Needed) ...
    console.log("tick() - Before if (gameState.activeJob) - gameState.activeJob:", gameState.activeJob); // <-- DEBUG LOG - CHECK gameState.activeJob VALUE BEFORE IF

    if (gameState.activeJob) {
        console.log("tick() - activeJob is TRUE - Inside IF block!"); // <-- CONFIRM IF BLOCK IS REACHED - ADDED THIS LOG

        console.log("tick() - Player HAS activeJob:", gameState.activeJob.name); // Log job name (for clarity)
        console.log("tick() - gameState.activeJob Object:", gameState.activeJob); // <-- INSPECT activeJob OBJECT (DEBUG LOG)

        const goldGained = addResources(gameState.activeJob); // <-- CORRECT CALL - addResources() with argument
        gameState.gameStats.totalGoldEarned += goldGained;
        increaseSkills(gameState.activeJob); // <-- CORRECT CALL - increaseSkills() with argument
        checkForCareerUpgrade();
        gameState.lifeQuality = Math.min(100, gameState.lifeQuality + CONFIG.balancing.workingLifeQualityIncrease);
    } else {
        console.log("tick() - Player has NO activeJob");
        gameState.lifeQuality = Math.max(0, gameState.lifeQuality - CONFIG.balancing.unemployedLifeQualityDecay);
    }

    updateDisplay();
    console.log("tick() - END - Game Tick Ended"); // <--- END LOG - TICK FUNCTION
}

function setInitialJob() {
    console.log("setInitialJob() - START");
    const googleMapsJob = CONFIG.geoguesserCareerPath.find(career => {
        console.log("setInitialJob() - find() - Comparing career.title:", career.title, "with target:", "Google Maps User"); // <-- ADD THIS LOG
        return career.title === "Google Maps User";
    });
    console.log("setInitialJob() - After find - googleMapsJob:", googleMapsJob); // LOG googleMapsJob

    if (googleMapsJob) {
        console.log("setInitialJob() - googleMapsJob FOUND"); // LOG FOUND PATH
        gameState.activeJob = googleMapsJob;
        gameState.currentJobTier = 0;
        console.log("setInitialJob() - gameState.activeJob SET to existing job:", gameState.activeJob); // LOG gameState.activeJob
    } else {
        console.log("setInitialJob() - googleMapsJob NOT FOUND - Creating new job"); // LOG NOT FOUND PATH
        const newJob = {
            // ... (newJob definition) ...
        };
        gameState.jobs.push(newJob);
        gameState.activeJob = newJob;
        gameState.currentJobTier = 0;
        console.log("setInitialJob() - gameState.activeJob SET to NEW job:", gameState.activeJob); // LOG gameState.activeJob
    }
    console.log("setInitialJob() - END"); // LOG END
}

function tick() {  // <---------------------- ADD THIS TICK() FUNCTION HERE
    console.log("tick() function called!"); // Debug log to confirm tick is running
}                  // <---------------------- END OF TICK() FUNCTION

async function loadGameDataFromServer() {
    try {
        const [loadedSkills, loadedJobs, loadedAchievements] = await Promise.all([
            fetch("skills.json").then(response => response.json()),
            fetch("jobs.json").then(response => response.json()),
            fetch("achievements.json").then(response => response.json())
        ]);

        console.log("Skills data:", loadedSkills);
        console.log("Jobs data:", loadedJobs);
        console.log("Achievements data:", loadedAchievements);

        gameState.skills = {};
        loadedSkills.forEach(skill => {
            gameState.skills[skill.name] = skill.level || 0;
        });
        if (!gameState.skills.hasOwnProperty("Map Awareness")) {
            gameState.skills["Map Awareness"] = 0;
        }

        gameState.jobs = loadedJobs;
        gameState.achievements = loadedAchievements;

        console.log("loadGameDataFromServer() - Before shopItems loop - gameState:", gameState);
        console.log("loadGameDataFromServer() - Before shopItems loop - gameState.purchasedItems:", gameState.purchasedItems);

        CONFIG.shopItems.forEach(item => {
            gameState.purchasedItems[item.id] = 0;
        });

        console.log("loadGameDataFromServer() - enhanced-script.js - END of TRY");

    } catch (error) {
        console.error("Error loading game data:", error);
        showErrorNotification("Failed to load game data:", error);
    }

    console.log("loadGameDataFromServer() - enhanced-script.js - FUNCTION BODY END");
}

// -----------------------------------------------------------------------------
// 7. Start the Game
// -----------------------------------------------------------------------------

console.log("enhanced-script.js - Just BEFORE calling loadGameDataFromServer()");
loadGameDataFromServer();

document.addEventListener("DOMContentLoaded", async () => {
    await loadGameDataFromServer();
    initializeGame();

    // --- Progress Bar Element References ---
const jobProgressBarFill = document.getElementById('job-progress-fill');
const jobProgressBarText = document.getElementById('job-progress-text');
const skillProgressBarFill = document.getElementById('skill-progress-fill');
const skillProgressBarText = document.getElementById('skill-progress-text');

console.log("Progress bar elements retrieved:", jobProgressBarFill, jobProgressBarText, skillProgressBarFill, skillProgressBarText);
});

function updateJobProgressBar() {
    console.log("updateJobProgressBar() - Placeholder function called");
}

function updateSkillProgressBar() {
    console.log("updateSkillProgressBar() - Placeholder function called");
}

function addResources(job) { // <-- ADD LOG AT START OF FUNCTION
    //console.log("addResources() - START - Job:", job ? job.name : 'No Job'); // <-- ADD THIS LOG - addResources START

    if (!job || !job.tiers || job.tiers.length === 0) {
        console.error("addResources() - Invalid job data:", job);
        return 0; // Return 0 gold if job data is invalid
    }

    const currentTier = job.tiers[gameState.currentJobTier] || job.tiers[0]; // Get current job tier

    const incomePerTick = currentTier.incomePerYear / CONFIG.settings.ticksInOneGameYear; // Calculate income per tick

    if (isNaN(incomePerTick)) {
        console.error("addResources() - Invalid incomePerTick calculation - incomePerYear:", currentTier.incomePerYear, "ticksInOneGameYear:", CONFIG.settings.ticksInOneGameYear);
        return 0; // Return 0 gold if income calculation is invalid
    }


    gameState.gold += incomePerTick; // Add income to gold - FINALLY!

    // --- Progress Bar Update Logic (Placeholder - To be implemented later) ---
    updateJobProgressBar(); // Call placeholder function - we'll implement real logic soon

    // console.log("addResources() - END - Gold:", gameState.gold); // <-- ADD THIS LOG - addResources END
    return incomePerTick; // Return the gold gained in this tick
}

function increaseSkills(job) { // <-- ADD LOG AT START OF FUNCTION
    // console.log("increaseSkills() - START - Job:", job ? job.name : 'No Job'); // <-- ADD THIS LOG - increaseSkills START

    if (!job || !job.tiers || job.tiers.length === 0) {
        console.error("increaseSkills() - Invalid job data:", job);
        return; // Exit if job data is invalid
    }

    const currentTier = job.tiers[gameState.currentJobTier] || job.tiers[0]; // Get current job tier

    if (!currentTier.skillReward) {
        console.warn("increaseSkills() - No skillReward defined for tier:", currentTier);
        return; // Exit if no skillReward defined for this tier
    }

    for (const skillName in currentTier.skillReward) {
        const skillGain = currentTier.skillReward[skillName];
        if (isNaN(skillGain)) {
            console.error("increaseSkills() - Invalid skillGain value for skill:", skillName, "skillGain value:", skillGain);
            continue; // Skip to the next skill if skillGain is invalid
        }

        gameState.skills[skillName] = (gameState.skills[skillName] || 0) + skillGain; // Increase skill
        gameState.skillProgress[skillName] = (gameState.skillProgress[skillName] || 0) + skillGain; // Increase skill progress - if you use skillProgress

        // console.log(`increaseSkills() - Skill ${skillName} increased by ${skillGain}. New level: ${gameState.skills[skillName]}`); // Log skill increase - MODIFIED LOG
        // --- Skill Progress Bar Update Logic (Placeholder - To be implemented later) ---
        updateSkillProgressBar(); // Call placeholder function - we'll implement real logic soon
    }
    // console.log("increaseSkills() - END - Skills:", gameState.skills); // <-- ADD THIS LOG - increaseSkills END
}