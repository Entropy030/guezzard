// enhanced-script.js



// -----------------------------------------------------------------------------
// 3. Utility Functions (Notifications, Logging)
// -----------------------------------------------------------------------------

function showNotification(title, message, type) {
    alert(`${title}: ${message}`); // Simple alert for demonstration
}

function showErrorNotification(message) {
    alert(`Error: ${message}`);
}

function logEvent(message, type = 'info') {
    const event = {
        message,
        type,
        timestamp: `Age ${gameState.age}` // Accessing age via gameState
    };
    gameState.eventLog.push(event); // Accessing eventLog via gameState

    const eventLogElement = document.getElementById('eventLog');
    const eventElement = document.createElement('div');
    eventElement.classList.add('event-log-entry');

    if (type === 'promotion') {
        eventElement.classList.add('promotion-event');
    } else if (type === 'news') {
        eventElement.classList.add('news-event');
    }

    eventElement.textContent = `${event.timestamp}: ${event.message}`;
    eventLogElement.appendChild(eventElement);
    eventLogElement.scrollTop = eventLogElement.scrollHeight;
}

// -----------------------------------------------------------------------------
// 4. Game Mechanics Functions (Resource Management, Skill Progression, Job Management)
// -----------------------------------------------------------------------------

function addResources(job) {
    if (!job || !job.tiers || !job.tiers[gameState.currentJobTier]) {
        console.warn("Invalid job or tier:", job, gameState.currentJobTier);
        return 0;
    }

    const currentTier = job.tiers[gameState.currentJobTier];
    // Distribute total revenue for the job for every tick in 1 year
    const goldGainPerTick = (currentTier.incomePerYear / ticksInOneGameYear) * gameState.multipliers.gold;
    gameState.gold += goldGainPerTick; // Accessing gold via gameState
    return goldGainPerTick;
}

function increaseSkills(job) {
    if (!job || !job.tiers || !job.tiers[gameState.currentJobTier]) {
        console.warn("Invalid job or tier:", job, gameState.currentJobTier);
        return;
    }

    const currentTier = job.tiers[gameState.currentJobTier];
    if (currentTier.skillReward) {
        for (const skillName in currentTier.skillReward) {
            // Distribute total skill exp for the job for every tick in 1 year
            const skillGainPerTick = (currentTier.skillReward[skillName] / ticksInOneGameYear) * gameState.gameState.gameState.multipliers.skill
            gameState.skills[skillName] = (gameState.skills[skillName] || 0) + skillGainPerTick; // Accessing skills via gameState
            gameState.skills[skillName] = Math.min(gameState.skills[skillName], CONFIG.skillConfig[skillName]?.maxLevel || 100); // Accessing skills via gameState
        }
    }
}

function checkForCareerUpgrade() {
    const mapSkill = gameState.skills["Map Awareness"] || 0; // Accessing skills via gameState
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

    const currentCareerIndex = CONFIG.geoguesserCareerPath.findIndex(career => career.title === gameState.activeJob.name); // Accessing activeJob via gameState

    if (highestEligibleCareerIndex > currentCareerIndex) {
        const newCareer = highestEligibleCareer;
        let newJob = gameState.jobs.find(job => job.name === newCareer.title); // Accessing jobs via gameState

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
            gameState.jobs.push(newJob); // Accessing jobs via gameState
        }

        gameState.activeJob = newJob; // Accessing activeJob via gameState
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
    gameState.achievements.forEach(achievement => { // Accessing achievements via gameState
        if (gameState.unlockedAchievements.includes(achievement.id)) return; // Accessing unlockedAchievements via gameState

        let isUnlocked = false;

        switch (achievement.condition.type) {
            case 'gold':
                isUnlocked = gameState.gold >= achievement.condition.value; // Accessing gold via gameState
                break;
            case 'age':
                isUnlocked = gameState.age >= achievement.condition.value; // Accessing age via gameState
                break;
            case 'skill':
                isUnlocked = gameState.skills[achievement.condition.skill] >= achievement.condition.value; // Accessing skills via gameState
                break;
            case 'job':
                isUnlocked = gameState.activeJob && gameState.activeJob.name === achievement.condition.jobName; // Accessing activeJob via gameState
                break;
            case 'mapSkill':
                isUnlocked = gameState.skills["Map Awareness"] >= achievement.condition.value; // Accessing skills via gameState
                break;
        }

        if (isUnlocked) {
            gameState.unlockedAchievements.push(achievement.id); // Accessing unlockedAchievements via gameState
            logEvent(`Achievement unlocked: ${achievement.name}`);
            showNotification("Achievement Unlocked", achievement.name, "success");
        }
    });

    setupAchievementsUI();
}

function endGame() {
    clearInterval(gameState.tickIntervalId); // Accessing tickIntervalId via gameState
    showNotification("Game Over", "You have reached the end of your life.", "info");

    const finalMapSkill = gameState.skills["Map Awareness"] || 0; // Accessing skills via gameState
    let finalCareerTitle = "Google Maps User";

    for (let i = CONFIG.geoguesserCareerPath.length - 1; i >= 0; i--) {
        if (finalMapSkill >= CONFIG.geoguesserCareerPath[i].minSkill) {
            finalCareerTitle = CONFIG.geoguesserCareerPath[i].title;
            break;
        }
    }

    logEvent(`You ended your career as a ${finalCareerTitle} with ${finalMapSkill} map skill and ${Math.floor(gameState.gold)}€.`); // Accessing gold via gameState
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
    const pauseButton = document.getElementById('pauseButton');
    const speedButton = document.getElementById('speedButton');

    pauseButton.addEventListener('click', toggleGamePause);
    speedButton.addEventListener('click', cycleGameSpeed);
}

function toggleGamePause() {
    gameState.isPaused = !gameState.isPaused; // Accessing isPaused via gameState
    const pauseButton = document.getElementById('pauseButton');

    if (gameState.isPaused) { // Accessing isPaused via gameState
        clearInterval(gameState.tickIntervalId); // Accessing tickIntervalId via gameState
        pauseButton.innerHTML = `<i class="fas fa-play"></i> ${CONFIG.uiText.resumeButton}`;
    } else {
        gameState.tickIntervalId = setInterval(tick, tickInterval / speedMultiplier); // Accessing tickIntervalId via gameState
        pauseButton.innerHTML = `<i class="fas fa-pause"></i> ${CONFIG.uiText.pauseButton}`;
    }
}

function cycleGameSpeed() {
    const currentIndex = CONFIG.settings.speedMultipliers.indexOf(speedMultiplier);
    const nextIndex = (currentIndex + 1) % CONFIG.settings.speedMultipliers.length;
    speedMultiplier = CONFIG.settings.speedMultipliers[nextIndex];

    if (!gameState.isPaused) { // Accessing isPaused via gameState
        clearInterval(gameState.tickIntervalId); // Accessing tickIntervalId via gameState
        gameState.tickIntervalId = setInterval(tick, tickInterval / speedMultiplier); // Accessing tickIntervalId via gameState
    }

    const speedButton = document.getElementById('speedButton');
    speedButton.innerHTML = `<i class="fas fa-forward"></i> ${speedMultiplier}x Speed`;
}

function updateSkillDisplay() {
    const skillsDiv = document.getElementById("skills");
    skillsDiv.innerHTML = '';

    const mapSkill = gameState.skills["Map Awareness"] || 0; // Accessing skills via gameState
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

    const skillElement = document.createElement('div');
    skillElement.classList.add('skill');
    skillElement.classList.add('map-skill');

    const skillHTML = `
        <div class="skill-name"><i class="fas fa-map-marked-alt"></i> Map Awareness</div>
        <div class="skill-level">
            <div class="skill-progress" style="width: ${progressPercentage}%"></div>
        </div>
        <div class="skill-value">Level ${mapSkill}</div>
        <div class="skill-progress-text">${progressText}</div>
    `;

    skillElement.innerHTML = skillHTML;
    skillsDiv.appendChild(skillElement);

    for (const skillName in gameState.skills) { // Accessing skills via gameState
        if (skillName === 'Map Awareness') continue;

        const skillLevel = gameState.skills[skillName]; // Accessing skills via gameState
        const skillConfig = CONFIG.skillConfig[skillName] || {
            description: "Your proficiency in this skill.",
            maxLevel: 100,
            icon: "fa-star"
        };

        const otherSkillElement = document.createElement('div');
        otherSkillElement.classList.add('skill');

        const iconClass = `fas ${skillConfig.icon || 'fa-star'}`;
        const progressWidth = Math.min(skillLevel, 100);

        const otherSkillHTML = `
            <div class="skill-name"><i class="${iconClass}"></i> ${skillName}</div>
            <div class="skill-level">
                <div class="skill-progress" style="width: ${progressWidth}%"></div>
            </div>
            <div class="skill-value">Level ${skillLevel}</div>
        `;

        otherSkillElement.innerHTML = otherSkillHTML;
        skillsDiv.appendChild(otherSkillElement);
    }
}

function setupShopUI() {
    const shopDiv = document.getElementById('shop');
    if (!shopDiv) return;

    shopDiv.innerHTML = '';

    CONFIG.shopItems.forEach(item => {
        const timesUsed = gameState.purchasedItems[item.id] || 0; // Accessing purchasedItems via gameState
        const isDisabled = item.maxPurchases && timesUsed >= item.maxPurchases;

        let isMissingSkill = false;
        if (item.requiresSkill && !gameState.skills[item.requiresSkill]) { // Accessing skills via gameState
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

            if (gameState.gold >= item.price) { // Accessing gold via gameState
                purchaseItem(item);
                itemElement.classList.add('pulse');
                setTimeout(() => itemElement.classList.remove('pulse'), 600);

                if (item.maxPurchases && gameState.purchasedItems[item.id] >= item.maxPurchases) { // Accessing purchasedItems via gameState
                    setupShopUI();
                } else {
                    const effectElement = itemElement.querySelector('.shop-item-effect');
                    if (effectElement && item.maxPurchases) {
                        effectElement.textContent = `Used: ${gameState.purchasedItems[item.id]}/${item.maxPurchases}`; // Accessing purchasedItems via gameState
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
    const jobsDiv = document.getElementById('jobs');
    jobsDiv.innerHTML = '';

    let geoguesserJobs = gameState.jobs.filter(job => // Accessing jobs via gameState
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
                        "Map Awareness": career.skillGainPerYear // Corrected name
                    },
                    requiredSkill: {
                        "Map Awareness": career.minSkill // Corrected name
                    }
                }]
            };
            gameState.jobs.push(newJob); // Accessing jobs via gameState
            geoguesserJobs.push(newJob);
        });
    }

    geoguesserJobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.classList.add('job');

        if (gameState.activeJob && gameState.activeJob.id === job.id) { // Accessing activeJob via gameState
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
}

function hasRequiredSkillForJob(job) {
    if (job.tiers && job.tiers[0].requiredSkill) {
        for (const skillName in job.tiers[0].requiredSkill) {
            if (!gameState.skills[skillName] || gameState.skills[skillName] < job.tiers[0].requiredSkill[skillName]) { // Accessing skills via gameState
                return false;
            }
        }
    }
    return true;
}

function setupAchievementsUI() {
    const achievementsDiv = document.getElementById('achievements');
    achievementsDiv.innerHTML = '';

    gameState.achievements.forEach(achievement => { // Accessing achievements via gameState
        const achievementElement = document.createElement('div');
        achievementElement.classList.add('achievement');

        if (gameState.unlockedAchievements.includes(achievement.id)) { // Accessing unlockedAchievements via gameState
            achievementElement.classList.add('unlocked');
        }

        const achievementHTML = `
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
        `;

        achievementElement.innerHTML = achievementHTML;
        achievementsDiv.appendChild(achievementElement);
    });
}

function setupEventLog() {
    const toggleEventLogButton = document.getElementById('toggleEventLog');
    const eventLogElement = document.getElementById('eventLog');

    toggleEventLogButton.addEventListener('click', () => {
        gameState.isEventLogCollapsed = !gameState.isEventLogCollapsed; // Accessing isEventLogCollapsed via gameState

        if (gameState.isEventLogCollapsed) { // Accessing isEventLogCollapsed via gameState
            eventLogElement.classList.add('collapsed');
            toggleEventLogButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
        } else {
            eventLogElement.classList.remove('collapsed');
            toggleEventLogButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
        }
    });
}

// -----------------------------------------------------------------------------
// 6. Game Loop and Initialization
// -----------------------------------------------------------------------------

function updateDisplay() {
    document.getElementById('gold').textContent = Math.floor(gameState.gold); // Accessing gold via gameState
    document.getElementById('age').textContent = gameState.age; // Accessing age via gameState
    document.getElementById('lifeQuality').textContent = gameState.lifeQuality; // Accessing lifeQuality via gameState

    const activeJobContainer = document.getElementById('activeJobContainer');
    const activeJobElement = document.getElementById('activeJob');

    if (gameState.activeJob) { // Accessing activeJob via gameState
        const currentCareerIndex = CONFIG.geoguesserCareerPath.findIndex(career => career.title === gameState.activeJob.name); // Accessing activeJob via gameState
        const currentCareer = CONFIG.geoguesserCareerPath[currentCareerIndex];

        if (currentCareer) {
            activeJobElement.textContent = currentCareer.title;
            activeJobContainer.style.display = 'block';
        } else {
            activeJobElement.textContent = gameState.activeJob.name; // Accessing activeJob via gameState
            activeJobContainer.style.display = 'block';
        }
    } else {
        activeJobElement.textContent = "None";
        activeJobContainer.style.display = 'block';
    }

    updateSkillDisplay();
}

function purchaseItem(item) {
    gameState.gold -= item.price; // Accessing gold via gameState
    gameState.gameStats.itemsPurchased++; // Accessing gameStats via gameState
    gameState.purchasedItems[item.id] = (gameState.purchasedItems[item.id] || 0) + 1; // Accessing purchasedItems via gameState

    logEvent(`You purchased ${item.name}!`);

    if (item.effect) {
        const [effectType, value] = item.effect.split(':');
        const effectValue = parseFloat(value);

        switch (effectType) {
            case 'maxAge':
                gameState.maxAge += effectValue; // Accessing maxAge via gameState
                showNotification("Life Extended!", `Your maximum age is now ${gameState.maxAge}!`, "success"); // Accessing maxAge via gameState
                break;
            case 'goldMultiplier':
                gameState.multipliers.gold += effectValue;
                showNotification("Gold Multiplier Increased!", `Your gold earnings are now ${(gameState.multipliers.gold * 100).toFixed(0)}% of base earnings!`, "success");
                break;
            case 'skillMultiplier':
                gameState.gameState.gameState.multipliers.skill += effectValue;
                showNotification("Skill Multiplier Increased!", `Your skill gain is now ${(gameState.gameState.gameState.multipliers.skill * 100).toFixed(0)}% of base gain!`, "success");
                break;
            default:
                if (CONFIG.skillConfig[effectType]) {
                    gameState.skills[effectType] = (gameState.skills[effectType] || 0) + effectValue; // Accessing skills via gameState
                    showNotification("Skill Increased!", `Your ${effectType} skill increased by ${effectValue}!`, "success");
                }
                break;
        }
    }

    updateDisplay();
}

function tick() {
    if (gameState.isPaused) return; // Accessing isPaused via gameState

    currentTick++;

    // Check if a game day has passed (5 ticks)
    if (currentTick % CONFIG.settings.ticksInOneGameDay === 0) {  // <-- CORRECTED LINE

        //Run every 1 game day
    }

    if (currentTick >= ticksInOneGameYear) {

        //Run every 1 game year
        gameState.age++; // Accessing age via gameState
        currentTick = 0;
        gameState.lifeQuality = Math.max(0, gameState.lifeQuality - CONFIG.balancing.baseLifeQualityDecay); // Accessing lifeQuality via gameState

        if (gameState.age > gameState.maxAge) { // Accessing age and maxAge via gameState
            endGame();
            return;
        }

        if (Math.random() < CONFIG.settings.eventChance) {
            triggerRandomNewsTickerEvent();
        }

        if (gameState.age % achievementCheckInterval === 0) { // Accessing age via gameState
            checkAchievements();
        }
    }

    if (gameState.activeJob) { // Accessing activeJob via gameState
        const goldGained = addResources(gameState.activeJob); // Accessing activeJob via gameState
        gameState.gameStats.totalGoldEarned += goldGained; // Accessing gameStats via gameState
        increaseSkills(gameState.activeJob); // Accessing activeJob via gameState
        checkForCareerUpgrade();
        gameState.lifeQuality = Math.min(100, gameState.lifeQuality + CONFIG.balancing.workingLifeQualityIncrease); // Accessing lifeQuality via gameState
    } else {
        gameState.lifeQuality = Math.max(0, gameState.lifeQuality - CONFIG.balancing.unemployedLifeQualityDecay); // Accessing lifeQuality via gameState
    }

    updateDisplay();
}

async function loadGameDataFromServer() {
    try {
        // --- MODIFIED URLS - DIRECT ROOT-RELATIVE PATHS ---
        const [loadedSkills, loadedJobs, loadedAchievements] = await Promise.all([
            fetch("skills.json").then(response => response.json()), // DIRECT PATH - skills.json in root
            fetch("jobs.json").then(response => response.json()),   // DIRECT PATH - jobs.json in root
            fetch("achievements.json").then(response => response.json()) // DIRECT PATH - achievements.json in root
        ]);
        // --- END MODIFIED URLS ---

        console.log("Skills data:", loadedSkills);
        console.log("Jobs data:", loadedJobs);
        console.log("Achievements data:", loadedAchievements);

        // Initialize skills from loaded data
        gameState.skills = {};
        loadedSkills.forEach(skill => {
            gameState.skills[skill.name] = skill.level || 0;
        });
        if (!gameState.skills.hasOwnProperty("Map Awareness")) {
            gameState.skills["Map Awareness"] = 0;
        }

        gameState.jobs = loadedJobs;
        gameState.achievements = loadedAchievements;

        CONFIG.shopItems.forEach(item => {
            gameState.purchasedItems[item.id] = 0;
        });

        setInitialJob();
        setupTabNavigation();
        setupJobsUI();
        updateSkillDisplay();
        setupShopUI();
        setupAchievementsUI();
        setupGameControls();
        setupEventLog();
        updateDisplay();
        logEvent("Started career as a Google Maps User.");
        gameState.tickIntervalId = setInterval(tick, CONFIG.settings.tickInterval / speedMultiplier); // Accessing tickIntervalId via gameState  <-- CORRECTED LINE
    } catch (error) {
        console.error("Error loading game data:", error);
        showErrorNotification("Failed to load game data:", error);
    }
}

function setInitialJob() {
    const googleMapsJob = gameState.jobs.find(job => job.name === "Google Maps User"); // Accessing jobs via gameState
    if (googleMapsJob) {
        gameState.activeJob = googleMapsJob; // Accessing activeJob via gameState
        gameState.currentJobTier = 0;
    } else {
        const newJob = {
            id: "google_maps_user",
            name: "Google Maps User",
            description: "Navigate the digital world by helping improve maps data.",
            tiers: [
                {
                    name: "Beginner",
                    incomePerYear: 2,
                    skillReward: {
                        "Map Awareness": 0.5
                    }
                }
            ]
        };
        gameState.jobs.push(newJob); // Accessing jobs via gameState
        gameState.activeJob = newJob; // Accessing activeJob via gameState
        gameState.currentJobTier = 0;
    }
}

function initializeGame() {
    gameState.gold = CONFIG.settings.startingGold; // Accessing gold via gameState
    gameState.age = 18; // Accessing age via gameState
    gameState.maxAge = CONFIG.settings.maxAge; // Accessing maxAge via gameState
    gameState.lifeQuality = 50; // Accessing lifeQuality via gameState
    gameState.activeJob = null; // Accessing activeJob via gameState
    // gameState.skills = { "Map Awareness": 0 }; // Corrected name - THIS IS NOW HANDLED DYNAMICALLY
    speedMultiplier = 1;
    gameState.isPaused = false; // Accessing isPaused via gameState
    gameState.tickIntervalId = null; // Accessing tickIntervalId via gameState
    gameState.jobs = []; // Accessing jobs via gameState
    gameState.achievements = []; // Accessing achievements via gameState
    gameState.unlockedAchievements = []; // Accessing unlockedAchievements via gameState
    gameState.purchasedItems = {}; // Accessing purchasedItems via gameState
    gameState.eventLog = []; // Accessing eventLog via gameState
    gameState.isEventLogCollapsed = false; // Accessing isEventLogCollapsed via gameState
    gameState.gameStats = { // Accessing gameStats via gameState
        totalGoldEarned: 0,
        jobChanges: 0,
        eventsExperienced: 0,
        itemsPurchased: 0
    };
    currentTick = 0;
}

// -----------------------------------------------------------------------------
// 7. Start the Game
// -----------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    loadGameDataFromServer();  // Call this first
    initializeGame();          // Call this after
});
