// system-integration.js
console.log("system-integration.js - Module loading");

// Simplified system initialization
async function initializeGame() {
    try {
        // Leverage existing initialization from game-state.js
        window.initializeGameState();

        // Sequential system initialization
        await initializeSystems([
            'jobSystem',
            'uiSystem',
            'skillSystem',
            'prestigeSystem',
            'displaySystem'
        ]);

        // Start game loop
        window.startGameLoop();

        // Welcome message
        window.logEvent?.("Welcome to Guezzard! Start your career journey now.", 'system');
        window.updateAllDisplays?.();

    } catch (error) {
        console.error("Game initialization failed:", error);
    }
}

// Generic system initialization helper
async function initializeSystems(systems) {
    for (const system of systems) {
        try {
            const initFunction = window[`initialize${system.charAt(0).toUpperCase() + system.slice(1)}`];
            if (typeof initFunction === 'function') {
                await initFunction();
                console.log(`${system} initialized successfully`);
            }
        } catch (error) {
            console.error(`Failed to initialize ${system}:`, error);
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initializeGame);

export { initializeGame };