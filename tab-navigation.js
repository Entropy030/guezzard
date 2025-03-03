   // tab-navigation.js
   function initializeTabSystem() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Hide all tab contents except the first one
    for (let i = 1; i < tabContents.length; i++) {
        tabContents[i].style.display = 'none';
    }

    // Mark first tab as active
    if (tabButtons.length > 0) {
        tabButtons[0].classList.add('active-tab');
    }

    // Add click event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');

            // Hide all tab contents
            tabContents.forEach(content => {
                content.style.display = 'none';
            });

            // Remove active class from all buttons
            tabButtons.forEach(button => {
                button.classList.remove('active-tab');
            });

            // Show the selected tab content
            document.getElementById(tabId).style.display = 'block';

            // Add active class to clicked button
            this.classList.add('active-tab');

            // Play tab switch sound (placeholder for now)
            playSound('button-click');
        });
    });
}

function switchToTab(tabId) {
    // Find tab button with matching data-tab attribute
    const tabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);

    // Trigger click on that button
    if (tabButton) {
        tabButton.click();
    }
}

function switchToNextTab() {
    const activeTab = document.querySelector('.tab-button.active-tab');
    const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
    const currentIndex = tabButtons.indexOf(activeTab);

    // Get next tab or wrap around to first
    const nextIndex = (currentIndex + 1) % tabButtons.length;
    tabButtons[nextIndex].click();
}

function switchToPreviousTab() {
    const activeTab = document.querySelector('.tab-button.active-tab');
    const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
    const currentIndex = tabButtons.indexOf(activeTab);

    // Get previous tab or wrap to last
    const prevIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
    tabButtons[prevIndex].click();
}

// Placeholder playSound function (define in audio.js later)
function playSound(soundName) { console.log(`playSound Placeholder - Sound: ${soundName}`); }
