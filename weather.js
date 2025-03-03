// weather.js

let currentSeason = 0; // 0=spring, 1=summer, 2=fall, 3=winter
let currentWeather = 'sunny';
let seasonDuration = CONFIG.settings.seasonDuration; // Ticks per season (e.g., 100)
let seasonTick = 0;



function setupWeatherSystem() {
    // Create weather indicator in UI (assuming elements with IDs exist in HTML)
    updateWeatherDisplay();
    console.log("Weather System UI Setup");
}

function updateWeather() {
    seasonTick++;

    // Change season if needed
    if (seasonTick >= seasonDuration) {
        seasonTick = 0;
        currentSeason = (currentSeason + 1) % 4;
        logEvent(`The season has changed to ${getSeasonName(currentSeason)}.`, 'weather');
    }

    // Chance to change weather (more likely at season boundaries - example logic)
    const changeChance = (seasonTick < seasonDuration * 0.2 || seasonTick > seasonDuration * 0.8) ? 0.2 : 0.05;
    if (Math.random() < changeChance) {
        changeWeather();
    }

    // Apply weather effects (initially placeholder - implement effects in next task)
    applyWeatherEffects();

    // Update display
    updateWeatherDisplay();
}

function changeWeather() {
    const oldWeather = currentWeather;

    // Get possible weather types for the current season
    const possibleWeather = CONFIG.seasonConfig[currentSeason].possibleWeather;

    // Choose a new weather type
    const newWeather = possibleWeather[Math.floor(Math.random() * possibleWeather.length)];
    currentWeather = newWeather;

    if (oldWeather !== newWeather) {
        logEvent(`The weather has changed to ${newWeather}.`, 'weather');
    }
}

function applyWeatherEffects() {
    // Placeholder for applying weather effects to gameplay (implement in next task)
    console.log(`Applying weather effects for ${currentWeather} in ${getSeasonName(currentSeason)} - Placeholder`);
    // Example: Modify resource gain multipliers based on currentWeather and CONFIG.weatherEffects
    // This function will be fleshed out in the next task
}

function updateWeatherDisplay() {
    const seasonElement = document.getElementById('current-season');
    const weatherElement = document.getElementById('current-weather');
    const weatherIconElement = document.getElementById('weather-icon');

    if (!seasonElement || !weatherElement || !weatherIconElement) {
        console.warn("Weather display elements not found in HTML");
        return;
    }

    // Update season and weather text
    seasonElement.textContent = getSeasonName(currentSeason);
    weatherElement.textContent = currentWeather;

    // Update weather icon (using placeholder icon classes for now)
    weatherIconElement.innerHTML = `<i class="${getWeatherIconClass(currentWeather)}"></i>`;
}

function getSeasonName(seasonIndex) {
    const seasons = CONFIG.seasonConfig.map(s => s.seasonName); // Get season names from config
    return seasons[seasonIndex] || 'Unknown Season';
}

function getWeatherIconClass(weather) {
    const icons = { // Example icon classes - you'll need to define these in your CSS or use a library
        'sunny': 'fas fa-sun',
        'cloudy': 'fas fa-cloud',
        'rainy': 'fas fa-cloud-rain',
        'stormy': 'fas fa-bolt',
        'snowy': 'fas fa-snowflake',
        'foggy': 'fas fa-smog',
        'windy': 'fas fa-wind'
    };
    return icons[weather] || 'fas fa-question'; // Default icon if weather type is unknown
}


// Placeholder logEvent function - ensure logEvent is defined elsewhere or import it
function logEvent(message, category) { console.log(`logEvent Placeholder: ${message} - Category: ${category}`); }
