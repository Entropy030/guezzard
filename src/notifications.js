  // notifications.js
  function displayNotification(message, type = 'info', duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add to notification container
    const container = document.getElementById('notification-container');
    container.appendChild(notification);

    // Add entry animation (you'll need to define CSS animations)
    notification.classList.add('notification-enter');

    // Set up removal after duration
    setTimeout(() => {
        // Add exit animation (you'll need to define CSS animations)
        notification.classList.add('notification-exit');

        // Remove from DOM after animation completes
        notification.addEventListener('animationend', () => {
            notification.remove();
        });
    }, duration);

    // If enabled, also play sound (placeholder for now)
    if (gameState.settings.soundEnabled) {
        playSound(`notification-${type}`);
    }

    return notification;
}

function logEvent(message, category = 'general') {
    // Create event log entry
    const eventEntry = {
        timestamp: new Date().toISOString(),
        message: message,
        category: category,
        day: gameState.day
    };

    // Add to event log array (ensure gameState.eventLog is initialized elsewhere if needed)
    if (!gameState.eventLog) {
        gameState.eventLog = [];
    }
    gameState.eventLog.unshift(eventEntry);

    // Keep log at reasonable size (last 100 events)
    if (gameState.eventLog.length > 100) {
        gameState.eventLog.pop();
    }

    // Update event log display if visible (placeholder for now)
    updateEventLogDisplay();
}

function updateEventLogDisplay() {
    console.log("updateEventLogDisplay Placeholder - Updating Event Log Display...");
}

// Placeholder playSound function (define in audio.js later)
function playSound(soundName) { console.log(`playSound Placeholder - Sound: ${soundName}`); }

