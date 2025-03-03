  // save-system.js
  function saveGameData() {
    try {
        // Add timestamp to save data (optional for basic save)
        // gameState.lastSaved = new Date().toISOString();

        // Convert game state to string
        const saveData = JSON.stringify(gameState);

        // Save to localStorage
        localStorage.setItem('incrementalGameSave', saveData);

        // Log successful save (optional)
        console.log("Game saved successfully!");

        return true;
    } catch (error) {
        console.error("Error saving game:", error);
        console.log("Failed to save game!"); // Placeholder notification for now
        return false;
    }
}

function loadGameData() {
    try {
        // Get save data from localStorage
        const saveData = localStorage.getItem('incrementalGameSave');

        // If no save data exists, return null
        if (!saveData) {
            return null;
        }

        // Parse saved data
        const parsedData = JSON.parse(saveData);

        // Basic validation (optional for basic load, can add more later)
        // if (!isValidSaveData(parsedData)) {
        //     throw new Error("Invalid save data format");
        // }

        // Log successful load (optional)
        console.log("Game loaded successfully!");

        // Return parsed data
        return parsedData;
    } catch (error) {
        console.error("Error loading game:", error);
        console.log("Failed to load save data!"); // Placeholder notification for now
        return null;
    }
}

// Placeholder isValidSaveData function (add proper validation later)
// function isValidSaveData(data) { return true; }