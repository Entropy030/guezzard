// enhanced-script.js

// -----------------------------------------------------------------------------
// 1. Constants and Configuration
// -----------------------------------------------------------------------------


// Load Config Settings
const tickInterval = CONFIG.settings.tickInterval;
const ticksInOneGameDay = CONFIG.settings.ticksInOneGameDay;
const ticksInOneGameYear = CONFIG.settings.ticksInOneGameYear;
const achievementCheckInterval = CONFIG.settings.achievementCheckInterval;

// -----------------------------------------------------------------------------
// 2. Game State Variables
// -----------------------------------------------------------------------------

let gold;
let age;
let maxAge;
let lifeQuality;
let activeJob;
let skills;
let speedMultiplier;
let isPaused;
let tickIntervalId;
let jobs;
let achievements;
let unlockedAchievements;
let purchasedItems;
let eventLog;
let isEventLogCollapsed;
let gameStats;
let currentTick;

let currentJobTier = 0; // The index of the tier the player is currently in.

// Multipliers (affected by shop items)
const multipliers = {
    gold: 1,
    skill: 1
};

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
        timestamp: `Age ${age}`
    };
    eventLog.push(event);

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
    if (!job || !job.tiers || !job.tiers[currentJobTier]) {
        console.warn("Invalid job or tier:", job, currentJobTier);
        return 0;
    }

    const currentTier = job.tiers[currentJobTier];
    // Distribute total revenue for the job for every tick in 1 year
    const goldGainPerTick = (currentTier.incomePerYear / ticksInOneGameYear) * multipliers.gold;
    gold += goldGainPerTick;
    return goldGainPerTick;
}

function increaseSkills(job) {
    if (!job || !job.tiers || !job.tiers[currentJobTier]) {
        console.warn("Invalid job or tier:", job, currentJobTier);
        return;
    }

    const currentTier = job.tiers[currentJobTier];
    if (currentTier.skillReward) {
        for (const skillName in currentTier.skillReward) {
            // Distribute total skill exp for the job for every tick in 1 year
            const skillGainPerTick = (currentTier.skillReward[skillName] / ticksInOneGameYear) * multipliers.skill
            skills[skillName] = (skills[skillName] || 0) + skillGainPerTick;
            skills[skillName] = Math.min(skills[skillName], CONFIG.skillConfig[skillName]?.maxLevel || 100);
        }
    }
}

function checkForCareerUpgrade() {
    const mapSkill = skills["Map Awareness"] || 0;
    let highestEligibleCareer = null;
    let highestEligibleCareerIndex = -1;

    for (let i = geoguesserCareerPath.length - 1; i >= 0; i--) {
        if (mapSkill >= geoguesserCareerPath[i].minSkill) {
            highestEligibleCareer = geoguesserCareerPath[i];
            highestEligibleCareerIndex = i;
        } else {
            break;
        }
    }

    if (!highestEligibleCareer) return;

    const currentCareerIndex = geoguesserCareerPath.findIndex(career => career.title === activeJob.name);

    if (highestEligibleCareerIndex > currentCareerIndex) {
        const newCareer = highestEligibleCareer;
        let newJob = jobs.find(job => job.name === newCareer.title);

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
            jobs.push(newJob);
        }

        activeJob = newJob;
        currentJobTier = 0;
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
    achievements.forEach(achievement => {
        if (unlockedAchievements.includes(achievement.id)) return;

        let isUnlocked = false;

        switch (achievement.condition.type) {
            case 'gold':
                isUnlocked = gold >= achievement.condition.value;
                break;
            case 'age':
                isUnlocked = age >= achievement.condition.value;
                break;
            case 'skill':
                isUnlocked = skills[achievement.condition.skill] >= achievement.condition.value;
                break;
            case 'job':
                isUnlocked = activeJob && activeJob.name === achievement.condition.jobName;
                break;
            case 'mapSkill':
                isUnlocked = skills["Map Awareness"] >= achievement.condition.value;
                break;
        }

        if (isUnlocked) {
            unlockedAchievements.push(achievement.id);
            logEvent(`Achievement unlocked: ${achievement.name}`);
            showNotification("Achievement Unlocked", achievement.name, "success");
        }
    });

    setupAchievementsUI();
}

function endGame() {
    clearInterval(tickIntervalId);
    showNotification("Game Over", "You have reached the end of your life.", "info");

    const finalMapSkill = skills["Map Awareness"] || 0;
    let finalCareerTitle = "Google Maps User";

    for (let i = geoguesserCareerPath.length - 1; i >= 0; i--) {
        if (finalMapSkill >= geoguesserCareerPath[i].minSkill) {
            finalCareerTitle = geoguesserCareerPath[i].title;
            break;
        }
    }

    logEvent(`You ended your career as a ${finalCareerTitle} with ${finalMapSkill} map skill and ${Math.floor(gold)}€.`);
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
    isPaused = !isPaused;
    const pauseButton = document.getElementById('pauseButton');

    if (isPaused) {
        clearInterval(tickIntervalId);
        pauseButton.innerHTML = `<i class="fas fa-play"></i> ${CONFIG.uiText.resumeButton}`;
    } else {
        tickIntervalId = setInterval(tick, tickInterval / speedMultiplier);
        pauseButton.innerHTML = `<i class="fas fa-pause"></i> ${CONFIG.uiText.pauseButton}`;
    }
}

function cycleGameSpeed() {
    const currentIndex = CONFIG.settings.speedMultipliers.indexOf(speedMultiplier);
    const nextIndex = (currentIndex + 1) % CONFIG.settings.speedMultipliers.length;
    speedMultiplier = CONFIG.settings.speedMultipliers[nextIndex];

    if (!isPaused) {
        clearInterval(tickIntervalId);
        tickIntervalId = setInterval(tick, tickInterval / speedMultiplier);
    }

    const speedButton = document.getElementById('speedButton');
    speedButton.innerHTML = `<i class="fas fa-forward"></i> ${speedMultiplier}x Speed`;
}

function updateSkillDisplay() {
    const skillsDiv = document.getElementById("skills");
    skillsDiv.innerHTML = '';

    const mapSkill = skills["Map Awareness"] || 0;
    let currentCareer = geoguesserCareerPath[0];
    let nextCareer = geoguesserCareerPath[1];

    for (let i = geoguesserCareerPath.length - 1; i >= 0; i--) {
        if (mapSkill >= geoguesserCareerPath[i].minSkill) {
            currentCareer = geoguesserCareerPath[i];
            nextCareer = geoguesserCareerPath[i + 1];
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

    for (const skillName in skills) {
        if (skillName === 'Map Awareness') continue;

        const skillLevel = skills[skillName];
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
        const timesUsed = purchasedItems[item.id] || 0;
        const isDisabled = item.maxPurchases && timesUsed >= item.maxPurchases;

        let isMissingSkill = false;
        if (item.requiresSkill && !skills[item.requiresSkill]) {
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

            if (gold >= item.price) {
                purchaseItem(item);
                itemElement.classList.add('pulse');
                setTimeout(() => itemElement.classList.remove('pulse'), 600);

                if (item.maxPurchases && purchasedItems[item.id] >= item.maxPurchases) {
                    setupShopUI();
                } else {
                    const effectElement = itemElement.querySelector('.shop-item-effect');
                    if (effectElement && item.maxPurchases) {
                        effectElement.textContent = `Used: ${purchasedItems[item.id]}/${item.maxPurchases}`;
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

    let geoguesserJobs = jobs.filter(job =>
        ["Google Maps User", "Geoguesser Noob", "Geoguesser Enthusiast", "Geoguesser Champion"].includes(job.name)
    );

    if (geoguesserJobs.length === 0) {
        geoguesserCareerPath.forEach(career => {
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
            jobs.push(newJob);
            geoguesserJobs.push(newJob);
        });
    }

    geoguesserJobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.classList.add('job');

        if (activeJob && activeJob.id === job.id) {
            jobElement.classList.add('active');
        }

        const careerInfo = geoguesserCareerPath.find(path => path.title === job.name) || {};

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
            if (!skills[skillName] || skills[skillName] < job.tiers[0].requiredSkill[skillName]) {
                return false;
            }
        }
    }
    return true;
}

function setupAchievementsUI() {
    const achievementsDiv = document.getElementById('achievements');
    achievementsDiv.innerHTML = '';

    achievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.classList.add('achievement');

        if (unlockedAchievements.includes(achievement.id)) {
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
        isEventLogCollapsed = !isEventLogCollapsed;

        if (isEventLogCollapsed) {
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
    document.getElementById('gold').textContent = Math.floor(gold);
    document.getElementById('age').textContent = age;
    document.getElementById('lifeQuality').textContent = lifeQuality;

    const activeJobContainer = document.getElementById('activeJobContainer');
    const activeJobElement = document.getElementById('activeJob');

    if (activeJob) {
        const currentCareerIndex = geoguesserCareerPath.findIndex(career => career.title === activeJob.name);
        const currentCareer = geoguesserCareerPath[currentCareerIndex];

        if (currentCareer) {
            activeJobElement.textContent = currentCareer.title;
            activeJobContainer.style.display = 'block';
        } else {
            activeJobElement.textContent = activeJob.name;
            activeJobContainer.style.display = 'block';
        }
    } else {
        activeJobElement.textContent = "None";
        activeJobContainer.style.display = 'block';
    }

    updateSkillDisplay();
}

function purchaseItem(item) {
    gold -= item.price;
    gameStats.itemsPurchased++;
    purchasedItems[item.id] = (purchasedItems[item.id] || 0) + 1;

    logEvent(`You purchased ${item.name}!`);

    if (item.effect) {
        const [effectType, value] = item.effect.split(':');
        const effectValue = parseFloat(value);

        switch (effectType) {
            case 'maxAge':
                maxAge += effectValue;
                showNotification("Life Extended!", `Your maximum age is now ${maxAge}!`, "success");
                break;
            case 'goldMultiplier':
                multipliers.gold += effectValue;
                showNotification("Gold Multiplier Increased!", `Your gold earnings are now ${(multipliers.gold * 100).toFixed(0)}% of base earnings!`, "success");
                break;
            case 'skillMultiplier':
                multipliers.skill += effectValue;
                showNotification("Skill Multiplier Increased!", `Your skill gain is now ${(multipliers.skill * 100).toFixed(0)}% of base gain!`, "success");
                break;
            default:
                if (CONFIG.skillConfig[effectType]) {
                    skills[effectType] = (skills[effectType] || 0) + effectValue;
                    showNotification("Skill Increased!", `Your ${effectType} skill increased by ${effectValue}!`, "success");
                }
                break;
        }
    }

    updateDisplay();
}

function tick() {
    if (isPaused) return;

    currentTick++;

    // Check if a game day has passed (5 ticks)
    if (currentTick % ticksInOneGameDay === 0) {

        //Run every 1 game day
    }

    if (currentTick >= ticksInOneGameYear) {

        //Run every 1 game year
        age++;
        currentTick = 0;
        lifeQuality = Math.max(0, lifeQuality - CONFIG.balancing.baseLifeQualityDecay); // Use balancing number

        if (age > maxAge) {
            endGame();
            return;
        }

        if (Math.random() < CONFIG.settings.eventChance) {
            triggerRandomNewsTickerEvent();
        }

        if (age % achievementCheckInterval === 0) {
            checkAchievements();
        }
    }

    if (activeJob) {
        const goldGained = addResources(activeJob);
        gameStats.totalGoldEarned += goldGained;
        increaseSkills(activeJob);
        checkForCareerUpgrade();
        lifeQuality = Math.min(100, lifeQuality + CONFIG.balancing.workingLifeQualityIncrease); // Use balancing number
    } else {
        lifeQuality = Math.max(0, lifeQuality - CONFIG.balancing.unemployedLifeQualityDecay); // Use balancing number
    }

    updateDisplay();
}

async function loadGameData() {
    try {
        const baseUrl = CONFIG.baseUrl;
        const [loadedSkills, loadedJobs, loadedAchievements] = await Promise.all([
            fetch(baseUrl + "skills.json").then(response => response.json()),
            fetch(baseUrl + "jobs.json").then(response => response.json()),
            fetch(baseUrl + "achievements.json").then(response => response.json())
        ]);

        console.log("Skills data:", loadedSkills);
        console.log("Jobs data:", loadedJobs);
        console.log("Achievements data:", loadedAchievements);

        // Initialize skills from loaded data
        skills = {};
        loadedSkills.forEach(skill => {
            skills[skill.name] = skill.level || 0;
        });
        if (!skills.hasOwnProperty("Map Awareness")) {
            skills["Map Awareness"] = 0;
        }

        jobs = loadedJobs;
        achievements = loadedAchievements;

        CONFIG.shopItems.forEach(item => {
            purchasedItems[item.id] = 0;
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
        tickIntervalId = setInterval(tick, tickInterval / speedMultiplier);

    } catch (error) {
        console.error("Error loading game data:", error);
        showErrorNotification("Failed to load game data:", error);
    }
}

function setInitialJob() {
    const googleMapsJob = jobs.find(job => job.name === "Google Maps User");
    if (googleMapsJob) {
        activeJob = googleMapsJob;
        currentJobTier = 0;
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
        jobs.push(newJob);
        activeJob = newJob;
        currentJobTier = 0;
    }
}

function initializeGame() {
    gold = CONFIG.settings.startingGold;
    age = 18;
    maxAge = CONFIG.settings.maxAge;
    lifeQuality = 50;
    activeJob = null;
    // skills = { "Map Awareness": 0 }; // Corrected name - THIS IS NOW HANDLED DYNAMICALLY
    speedMultiplier = 1;
    isPaused = false;
    tickIntervalId = null;
    jobs = [];
    achievements = [];
    unlockedAchievements = [];
    purchasedItems = {};
    eventLog = [];
    isEventLogCollapsed = false;
    gameStats = {
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
    initializeGame();
    loadGameData();
});