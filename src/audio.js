  // audio.js
  const audioSystem = {
    sounds: {},
    music: null,
    initialized: false
};

function initializeAudio() {
    // Skip if already initialized
    if (audioSystem.initialized) return;

    // Load sound effects (using placeholder paths for now)
    const soundEffects = {
        'action': 'audio/placeholder.mp3',
        'levelUp': 'audio/placeholder.mp3',
        'prestige': 'audio/placeholder.mp3',
        'notification-info': 'audio/placeholder.mp3',
        'notification-success': 'audio/placeholder.mp3',
        'notification-error': 'audio/placeholder.mp3',
        'button-click': 'audio/placeholder.mp3'
    };

    // Create audio objects for each sound
    for (const [name, path] of Object.entries(soundEffects)) {
        audioSystem.sounds[name] = new Audio(path);
        // Preload sounds
        audioSystem.sounds[name].load();
    }

    // Set up background music (placeholder path for now)
    audioSystem.music = new Audio('audio/background-music-placeholder.mp3');
    audioSystem.music.loop = true;

    // Set volumes based on game settings
    updateAudioVolumes();

    audioSystem.initialized = true;
    console.log("Audio System Initialized");
}

function playSound(soundName) {
    // Check if sounds are enabled in settings
    if (!gameState.settings.soundEnabled) return;

    // Check if sound exists
    if (!audioSystem.sounds[soundName]) {
        console.warn(`Sound "${soundName}" not found`);
        return;
    }

    // Clone the audio to allow overlapping sounds
    const sound = audioSystem.sounds[soundName].cloneNode();
    sound.volume = gameState.settings.volume;
    sound.play();
}

function toggleMusic() {
    if (!audioSystem.music) return;

    if (gameState.settings.musicEnabled) {
        audioSystem.music.play();
    } else {
        audioSystem.music.pause();
    }
}

function updateAudioVolumes() {
    // Update all sound volumes
    for (const sound of Object.values(audioSystem.sounds)) {
        sound.volume = gameState.settings.volume;
    }

    // Update music volume (slightly lower than effects)
    if (audioSystem.music) {
        audioSystem.music.volume = gameState.settings.volume * 0.7;
    }
}