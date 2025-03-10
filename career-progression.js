// career-progression.js
// Enhanced career progression UI and mechanics

console.log("career-progression.js - Loading career progression enhancements");

// Add required CSS styles for the new UI components
function addCareerProgressionStyles() {
    // Check if styles are already added
    if (document.getElementById('career-progression-styles')) {
        return;
    }

// Create a job promotion system
function createPromotionSystem() {
    // Check for potential promotions
    function checkForPromotion() {
        if (!gameState.activeJob) return null;
        
        const currentJob = gameState.activeJob;
        const currentTier = gameState.currentJobTier;
        const jobId = currentJob.id;
        const jobLevel = gameState.jobLevels && gameState.jobLevels[jobId] || 1;
        
        // Find the job in the jobs array
        const job = gameState.jobs.find(j => j.id === jobId);
        if (!job) return null;
        
        // Check if there's a higher tier for this job
        const nextTier = currentTier + 1;
        const nextTierData = job.tiers.find(tier => tier.tier === nextTier);
        
        // If no higher tier exists for this job, return null
        if (!nextTierData) return null;
        
        // Check if player meets requirements for next tier
        const meetsRequirements = window.meetsJobRequirements ? 
            window.meetsJobRequirements(job, nextTier) : false;
        
        if (meetsRequirements) {
            return {
                currentJob: currentJob,
                currentTier: currentTier,
                nextTier: nextTier,
                nextTierData: nextTierData,
                jobInfo: job
            };
        }
        
        return null;
    }
    
    // Show promotion notification if eligible
    function showPromotionNotification() {
        const promotion = checkForPromotion();
        
        if (!promotion) return;
        
        // Find the job title for the next tier
        let nextTierTitle = promotion.currentJob.title;
        promotion.jobInfo.tiers.forEach(tier => {
            if (tier.tier === promotion.nextTier) {
                if (tier.title) {
                    nextTierTitle = tier.title;
                }
            }
        });
        
        // Get full next tier data from the tiers array
        const nextTierFull = promotion.jobInfo.tiers.find(tier => tier.tier === promotion.nextTier);
        
        // Create a notification
        if (typeof window.showNotification === 'function') {
            window.showNotification(
                "Promotion Available",
                `You're eligible for a promotion to ${nextTierTitle}!`,
                "success"
            );
        }
        
        // Show promotion modal
        showPromotionModal(promotion.currentJob, nextTierFull, promotion.jobInfo);
    }
    
    // Display a modal for promotion
    function showPromotionModal(currentJob, nextTier, jobInfo) {
        // Check if modal already exists
        let promotionModal = document.getElementById('promotion-modal');
        
        if (!promotionModal) {
            promotionModal = document.createElement('div');
            promotionModal.id = 'promotion-modal';
            promotionModal.className = 'modal-overlay';
            
            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content promotion-modal-content';
            
            promotionModal.appendChild(modalContent);
            document.body.appendChild(promotionModal);
            
            // Close modal when clicking outside
            promotionModal.addEventListener('click', (e) => {
                if (e.target === promotionModal) {
                    promotionModal.style.display = 'none';
                }
            });
        }
        
        // Get the modal content element
        const modalContent = promotionModal.querySelector('.modal-content');
        
        // Get the next tier title
        let nextTierTitle = currentJob.title;
        if (nextTier.title) {
            nextTierTitle = nextTier.title;
        }
        
        // Create income comparison
        const currentIncome = currentJob.incomePerYear;
        const newIncome = nextTier.incomePerYear;
        const incomeIncrease = newIncome - currentIncome;
        const incomePercent = ((newIncome / currentIncome) - 1) * 100;
        
        // Create skill gain comparison
        let skillGainComparison = '';
        
        if (nextTier.skillGainPerYear) {
            for (const [skill, gain] of Object.entries(nextTier.skillGainPerYear)) {
                const currentGain = currentJob.skillGainPerYear && currentJob.skillGainPerYear[skill] || 0;
                const gainIncrease = gain - currentGain;
                const gainPercent = currentGain ? ((gain / currentGain) - 1) * 100 : 100;
                
                skillGainComparison += `
                    <div class="stat-comparison">
                        <div class="stat-name">${skill}</div>
                        <div class="stat-values">
                            <div class="old-value">+${currentGain}/year</div>
                            <div class="arrow">→</div>
                            <div class="new-value">+${gain}/year</div>
                        </div>
                        <div class="stat-change ${gainIncrease > 0 ? 'positive' : (gainIncrease < 0 ? 'negative' : 'neutral')}">
                            ${gainIncrease > 0 ? '+' : ''}${gainIncrease} (${gainPercent.toFixed(0)}%)
                        </div>
                    </div>
                `;
            }
        }
        
        // Update modal content
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>Career Advancement Opportunity</h3>
                <button class="modal-close-button">&times;</button>
            </div>
            
            <div class="promotion-content">
                <div class="promotion-message">
                    <p>Congratulations! You've been offered a promotion from <strong>${currentJob.title}</strong> to <strong>${nextTierTitle}</strong>!</p>
                </div>
                
                <div class="promotion-details">
                    <div class="promotion-benefit-section">
                        <h4>Income Increase</h4>
                        <div class="stat-comparison income-comparison">
                            <div class="stat-values">
                                <div class="old-value">${currentIncome} gold/year</div>
                                <div class="arrow">→</div>
                                <div class="new-value">${newIncome} gold/year</div>
                            </div>
                            <div class="stat-change positive">
                                +${incomeIncrease} gold/year (${incomePercent.toFixed(0)}%)
                            </div>
                        </div>
                    </div>
                    
                    <div class="promotion-benefit-section">
                        <h4>Skill Gain Improvements</h4>
                        ${skillGainComparison || '<p>No skill gain changes with this promotion.</p>'}
                    </div>
                </div>
                
                <div class="promotion-actions">
                    <button class="accept-promotion-button">Accept Promotion</button>
                    <button class="decline-promotion-button">Decline</button>
                </div>
            </div>
        `;
        
        // Add event listener to close button
        const closeButton = modalContent.querySelector('.modal-close-button');
        closeButton.addEventListener('click', () => {
            promotionModal.style.display = 'none';
        });
        
        // Add event listener to accept button
        const acceptButton = modalContent.querySelector('.accept-promotion-button');
        acceptButton.addEventListener('click', () => {
            // Find job index
            let jobIndex = -1;
            gameState.jobs.forEach((j, index) => {
                if (j.id === jobInfo.id) {
                    jobIndex = index;
                }
            });
            
            if (jobIndex >= 0 && typeof window.applyForJob === 'function') {
                const success = window.applyForJob(jobIndex, nextTier.tier);
                
                if (success) {
                    promotionModal.style.display = 'none';
                    
                    // Show success notification
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(
                            "Promotion Accepted",
                            `You've been promoted to ${nextTierTitle}!`,
                            "success"
                        );
                    }
                    
                    // Update UI
                    if (typeof window.updateDisplay === 'function') {
                        window.updateDisplay();
                    }
                    
                    // Update career path UI if it's open
                    updateCareerPathUI();
                }
            }
        });
        
        // Add event listener to decline button
        const declineButton = modalContent.querySelector('.decline-promotion-button');
        declineButton.addEventListener('click', () => {
            promotionModal.style.display = 'none';
        });
        
        // Add CSS for promotion modal if not already added
        if (!document.getElementById('promotion-modal-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'promotion-modal-styles';
            
            styleElement.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                }
                
                .modal-content {
                    background-color: rgba(30, 30, 45, 0.95);
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 0 30px rgba(123, 104, 238, 0.5);
                    border: 1px solid rgba(123, 104, 238, 0.6);
                    animation: modalFadeIn 0.3s ease;
                }
                
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                
                .modal-header {
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(123, 104, 238, 0.3);
                }
                
                .modal-header h3 {
                    margin: 0;
                    color: #a496ff;
                    font-size: 1.3em;
                }
                
                .modal-close-button {
                    background: none;
                    border: none;
                    color: #a496ff;
                    font-size: 1.5em;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                }
                
                .promotion-content {
                    padding: 20px;
                }
                
                .promotion-message {
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 1.1em;
                    line-height: 1.5;
                }
                
                .promotion-details {
                    margin-bottom: 25px;
                }
                
                .promotion-benefit-section {
                    background-color: rgba(40, 40, 60, 0.6);
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 15px;
                }
                
                .promotion-benefit-section h4 {
                    color: #a496ff;
                    margin-top: 0;
                    margin-bottom: 15px;
                    border-bottom: 1px solid rgba(123, 104, 238, 0.3);
                    padding-bottom: 5px;
                    font-size: 1.1em;
                }
                
                .stat-comparison {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 10px;
                    padding: 8px;
                    border-radius: 5px;
                    background-color: rgba(30, 30, 45, 0.5);
                }
                
                .income-comparison {
                    align-items: center;
                    padding: 15px;
                }
                
                .stat-name {
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #ffffff;
                }
                
                .stat-values {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 5px;
                }
                
                .old-value {
                    color: #adb5bd;
                }
                
                .arrow {
                    color: #a496ff;
                }
                
                .new-value {
                    color: #ffffff;
                    font-weight: bold;
                }
                
                .stat-change {
                    font-size: 0.9em;
                    font-weight: bold;
                    text-align: center;
                }
                
                .stat-change.positive {
                    color: #28a745;
                }
                
                .stat-change.negative {
                    color: #dc3545;
                }
                
                .stat-change.neutral {
                    color: #adb5bd;
                }
                
                .promotion-actions {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                }
                
                .accept-promotion-button, .decline-promotion-button {
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                }
                
                .accept-promotion-button {
                    background: linear-gradient(135deg, #4776E6, #8E54E9);
                    color: white;
                }
                
                .accept-promotion-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
                }
                
                .decline-promotion-button {
                    background: linear-gradient(135deg, #6c757d, #495057);
                    color: white;
                }
                
                .decline-promotion-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
                }
            `;
            
            document.head.appendChild(styleElement);
        }
        
        // Show the promotion modal
        promotionModal.style.display = 'flex';
    }
    
    // Create a check for promotion that runs periodically
    function setupPromotionCheck() {
        // Check for promotion every minute
        const promotionInterval = setInterval(() => {
            if (!gameState.gamePaused && gameState.activeJob) {
                const promotion = checkForPromotion();
                if (promotion) {
                    showPromotionNotification();
                    // Only show once - clear interval after showing
                    clearInterval(promotionInterval);
                    
                    // Set a flag to prevent showing again for this job/tier
                    if (!gameState.shownPromotions) {
                        gameState.shownPromotions = {};
                    }
                    
                    const promotionKey = `${promotion.currentJob.id}-${promotion.nextTier}`;
                    gameState.shownPromotions[promotionKey] = true;
                }
            }
        }, 60000); // Check every minute
        
        // Check once at setup
        setTimeout(() => {
            if (!gameState.gamePaused && gameState.activeJob) {
                const promotion = checkForPromotion();
                if (promotion) {
                    // Check if we've already shown this promotion
                    if (gameState.shownPromotions) {
                        const promotionKey = `${promotion.currentJob.id}-${promotion.nextTier}`;
                        if (gameState.shownPromotions[promotionKey]) {
                            return;
                        }
                    }
                    
                    showPromotionNotification();
                }
            }
        }, 5000); // Check after 5 seconds of gameplay
    }
    
    return {
        checkForPromotion,
        showPromotionNotification,
        setupPromotionCheck
    };
}

// Job performance system
function createJobPerformanceSystem() {
    // Initialize job performance state if needed
    if (!gameState.jobPerformance) {
        gameState.jobPerformance = {
            current: 100, // Starts at 100%
            history: [], // Track performance over time
            factors: {
                skillMatch: 0,  // Bonus from having high relevant skills
                consistency: 0, // Bonus from maintaining a job
                energy: 0       // Bonus from high energy levels
            }
        };
    }
    
    // Update job performance
    function updateJobPerformance() {
        if (!gameState.activeJob) return;
        
        // Calculate performance factors
        const factors = calculatePerformanceFactors();
        
        // Store factors
        gameState.jobPerformance.factors = factors;
        
        // Calculate overall performance (base 100 + factors)
        let newPerformance = 100 + factors.skillMatch + factors.consistency + factors.energy;
        
        // Ensure it stays within reasonable bounds (50-150)
        newPerformance = Math.max(50, Math.min(150, newPerformance));
        
        // Update current performance (with smoothing)
        const currentPerformance = gameState.jobPerformance.current;
        gameState.jobPerformance.current = currentPerformance * 0.8 + newPerformance * 0.2;
        
        // Add to history (once per game day)
        if (gameState.ticksSinceDayStart === 0) {
            gameState.jobPerformance.history.push({
                day: gameState.day,
                performance: gameState.jobPerformance.current
            });
            
            // Keep history length reasonable
            if (gameState.jobPerformance.history.length > 30) {
                gameState.jobPerformance.history.shift();
            }
        }
    }
    
    // Calculate performance factors
    function calculatePerformanceFactors() {
        const factors = {
            skillMatch: 0,
            consistency: 0,
            energy: 0
        };
        
        // Skill match factor
        const jobSkills = gameState.activeJob.skillGainPerYear || {};
        let totalSkillLevel = 0;
        let skillCount = 0;
        
        for (const [skillName, _] of Object.entries(jobSkills)) {
            const skillLevel = typeof gameState.skills[skillName] === 'object' ?
                gameState.skills[skillName].level || 0 :
                gameState.skills[skillName] || 0;
            
            totalSkillLevel += skillLevel;
            skillCount++;
        }
        
        if (skillCount > 0) {
            const avgSkillLevel = totalSkillLevel / skillCount;
            // Each 5 levels of average skill adds 5% performance
            factors.skillMatch = Math.floor(avgSkillLevel / 5) * 5;
        }
        
        // Consistency factor - time in current job
        const jobId = gameState.activeJob.id;
        const jobTime = gameState.jobTime && gameState.jobTime[jobId] || 0;
        
        // Each 30 days at job adds 2% up to 10%
        factors.consistency = Math.min(10, Math.floor(jobTime / 30) * 2);
        
        // Energy factor
        const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
        // Below 30% energy reduces performance, above 70% improves it
        if (energyPercent < 30) {
            factors.energy = -10; // Penalty for low energy
        } else if (energyPercent > 70) {
            factors.energy = 5; // Bonus for high energy
        }
        
        return factors;
    }
    
    // Apply performance effects to income
    function applyPerformanceToIncome(baseIncome) {
        if (!gameState.jobPerformance) return baseIncome;
        
        // Performance affects income directly as a percentage
        const performanceMultiplier = gameState.jobPerformance.current / 100;
        return baseIncome * performanceMultiplier;
    }
    
    // Show performance in UI
    function setupPerformanceUI() {
        // Create job performance panel
        const jobPerformancePanel = document.createElement('div');
        jobPerformancePanel.id = 'job-performance-panel';
        jobPerformancePanel.className = 'hidden-panel';
        
        // Add content structure
        jobPerformancePanel.innerHTML = `
            <h3>Job Performance</h3>
            <div id="job-performance-content"></div>
            <button class="close-button" data-panel="job-performance-panel">Close</button>
        `;
        
        // Add to document
        document.body.appendChild(jobPerformancePanel);
        
        // Add styles for performance panel
        if (!document.getElementById('performance-panel-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'performance-panel-styles';
            
            styleElement.textContent = `
                .performance-meter-container {
                    width: 100%;
                    margin: 20px 0;
                }
                
                .performance-meter {
                    height: 25px;
                    background-color: rgba(30, 30, 45, 0.7);
                    border-radius: 15px;
                    overflow: hidden;
                    position: relative;
                    border: 1px solid rgba(123, 104, 238, 0.4);
                }
                
                .performance-fill {
                    height: 100%;
                    position: relative;
                    width: 50%;
                    transition: width 0.5s ease;
                }
                
                .performance-marker {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background-color: rgba(255, 255, 255, 0.7);
                }
                
                .performance-marker.zero-marker {
                    left: 50%;
                }
                
                .performance-value {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: white;
                    text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
                }
                
                .performance-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 5px;
                    font-size: 0.8em;
                    color: #adb5bd;
                }
                
                .performance-factors {
                    margin: 20px 0;
                    padding: 15px;
                    background-color: rgba(40, 40, 60, 0.6);
                    border-radius: 8px;
                }
                
                .performance-factors h4 {
                    margin-top: 0;
                    margin-bottom: 15px;
                    color: #a496ff;
                    border-bottom: 1px solid rgba(123, 104, 238, 0.3);
                    padding-bottom: 5px;
                }
                
                .factor-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding: 8px 10px;
                    background-color: rgba(30, 30, 45, 0.5);
                    border-radius: 5px;
                }
                
                .factor-name {
                    font-weight: bold;
                }
                
                .factor-value {
                    font-weight: bold;
                }
                
                .factor-value.positive {
                    color: #28a745;
                }
                
                .factor-value.negative {
                    color: #dc3545;
                }
                
                .factor-value.neutral {
                    color: #adb5bd;
                }
                
                .performance-history {
                    margin: 20px 0;
                    padding: 15px;
                    background-color: rgba(40, 40, 60, 0.6);
                    border-radius: 8px;
                }
                
                .performance-history h4 {
                    margin-top: 0;
                    margin-bottom: 15px;
                    color: #a496ff;
                    border-bottom: 1px solid rgba(123, 104, 238, 0.3);
                    padding-bottom: 5px;
                }
                
                .history-container {
                    width: 100%;
                    height: 200px;
                    background-color: rgba(30, 30, 45, 0.5);
                    border-radius: 5px;
                    padding: 10px;
                    position: relative;
                    overflow: hidden;
                }
                
                .history-line {
                    position: absolute;
                    left: 0;
                    width: 100%;
                    border-top: 1px dashed rgba(255, 255, 255, 0.2);
                }
                
                .history-line.line-100 {
                    top: 50%;
                }
                
                .history-line.line-50 {
                    top: 75%;
                }
                
                .history-line.line-150 {
                    top: 25%;
                }
                
                .history-label {
                    position: absolute;
                    left: 5px;
                    font-size: 0.7em;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .history-label.label-100 {
                    top: calc(50% - 10px);
                }
                
                .history-label.label-50 {
                    top: calc(75% - 10px);
                }
                
                .history-label.label-150 {
                    top: calc(25% - 10px);
                }
                
                .history-point {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: #a496ff;
                }
                
                .performance-income {
                    margin: 20px 0;
                    padding: 15px;
                    background-color: rgba(40, 40, 60, 0.6);
                    border-radius: 8px;
                    text-align: center;
                }
                
                .performance-income h4 {
                    margin-top: 0;
                    margin-bottom: 15px;
                    color: #a496ff;
                    border-bottom: 1px solid rgba(123, 104, 238, 0.3);
                    padding-bottom: 5px;
                }
                
                .income-comparison {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .base-income, .actual-income {
                    font-size: 1.1em;
                    font-weight: bold;
                }
                
                .base-income {
                    color: #adb5bd;
                }
                
                .income-arrow {
                    color: #a496ff;
                    font-size: 1.5em;
                }
                
                .actual-income {
                    color: #ffd700;
                }
                
                .performance-impact {
                    font-style: italic;
                    font-size: 0.9em;
                }
            `;
            
            document.head.appendChild(styleElement);
        }
        
        // Add button to access performance panel
        let performanceButton = document.getElementById('performance-button');
        
        if (!performanceButton) {
            performanceButton = document.createElement('button');
            performanceButton.id = 'performance-button';
            performanceButton.textContent = 'Performance';
            performanceButton.className = 'action-button';
            
            // Add to action buttons if possible
            const actionButtons = document.getElementById('action-buttons');
            if (actionButtons) {
                actionButtons.appendChild(performanceButton);
            }
            
            // Add event listener
            performanceButton.addEventListener('click', () => {
                updatePerformanceUI();
                const performancePanel = document.getElementById('job-performance-panel');
                if (performancePanel) {
                    performancePanel.style.display = 'block';
                }
            });
        }
        
        // Set up close button listener
        const closeButton = jobPerformancePanel.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                jobPerformancePanel.style.display = 'none';
            });
        }
    }
    
    // Update performance UI
    function updatePerformanceUI() {
        if (!gameState.activeJob || !gameState.jobPerformance) return;
        
        const contentArea = document.getElementById('job-performance-content');
        if (!contentArea) return;
        
        // Get performance data
        const performance = gameState.jobPerformance.current;
        const factors = gameState.jobPerformance.factors;
        const history = gameState.jobPerformance.history;
        
        // Get actual vs base income
        const baseIncome = gameState.activeJob.incomePerYear / CONFIG.settings.ticksInOneGameYear;
        const actualIncome = baseIncome * (performance / 100);
        
        // Color for performance meter
        let performanceColor;
        if (performance >= 120) {
            performanceColor = '#28a745'; // Excellent - green
        } else if (performance >= 100) {
            performanceColor = '#17a2b8'; // Good - blue
        } else if (performance >= 80) {
            performanceColor = '#ffc107'; // Average - yellow
        } else {
            performanceColor = '#dc3545'; // Poor - red
        }
        
        // Performance description
        let performanceDesc;
        if (performance >= 120) {
            performanceDesc = 'Excellent';
        } else if (performance >= 100) {
            performanceDesc = 'Good';
        } else if (performance >= 80) {
            performanceDesc = 'Average';
        } else {
            performanceDesc = 'Poor';
        }
        
        // Generate history points HTML
        let historyPointsHTML = '';
        if (history && history.length > 0) {
            const totalDays = history.length;
            const pointWidth = 100 / totalDays;
            
            history.forEach((point, index) => {
                // Map performance to position (50% = 100 performance)
                // Performance range 50-150 maps to 75%-25% position
                const yPosition = 100 - ((point.performance - 50) * (50/100));
                const xPosition = (index / (totalDays - 1)) * 100;
                
                historyPointsHTML += `
                    <div class="history-point" style="bottom: ${yPosition}%; left: ${xPosition}%;"></div>
                `;
            });
        }
        
        // Update content
        contentArea.innerHTML = `
            <div class="performance-overview">
                <h4>Overall Performance: ${performanceDesc}</h4>
                
                <div class="performance-meter-container">
                    <div class="performance-meter">
                        <div class="performance-fill" style="width: ${performance/2}%; background-color: ${performanceColor};"></div>
                        <div class="performance-marker zero-marker"></div>
                        <div class="performance-value">${performance.toFixed(1)}%</div>
                    </div>
                    <div class="performance-labels">
                        <span>50%</span>
                        <span>100%</span>
                        <span>150%</span>
                    </div>
                </div>
            </div>
            
            <div class="performance-factors">
                <h4>Performance Factors</h4>
                
                <div class="factor-item">
                    <div class="factor-name">Base Performance</div>
                    <div class="factor-value">100%</div>
                </div>
                
                <div class="factor-item">
                    <div class="factor-name">Skill Match</div>
                    <div class="factor-value ${factors.skillMatch > 0 ? 'positive' : (factors.skillMatch < 0 ? 'negative' : 'neutral')}">
                        ${factors.skillMatch > 0 ? '+' : ''}${factors.skillMatch.toFixed(1)}%
                    </div>
                </div>
                
                <div class="factor-item">
                    <div class="factor-name">Job Consistency</div>
                    <div class="factor-value ${factors.consistency > 0 ? 'positive' : (factors.consistency < 0 ? 'negative' : 'neutral')}">
                        ${factors.consistency > 0 ? '+' : ''}${factors.consistency.toFixed(1)}%
                    </div>
                </div>
                
                <div class="factor-item">
                    <div class="factor-name">Energy Level</div>
                    <div class="factor-value ${factors.energy > 0 ? 'positive' : (factors.energy < 0 ? 'negative' : 'neutral')}">
                        ${factors.energy > 0 ? '+' : ''}${factors.energy.toFixed(1)}%
                    </div>
                </div>
                
                <div class="factor-item">
                    <div class="factor-name">Total Impact</div>
                    <div class="factor-value ${(performance - 100) > 0 ? 'positive' : ((performance - 100) < 0 ? 'negative' : 'neutral')}">
                        ${(performance - 100) > 0 ? '+' : ''}${(performance - 100).toFixed(1)}%
                    </div>
                </div>
            </div>
            
            <div class="performance-income">
                <h4>Income Impact</h4>
                
                <div class="income-comparison">
                    <div class="base-income">${baseIncome.toFixed(2)} gold/tick</div>
                    <div class="income-arrow">→</div>
                    <div class="actual-income">${actualIncome.toFixed(2)} gold/tick</div>
                </div>
                
                <div class="performance-impact">
                    Your performance is ${performance >= 100 ? 'boosting' : 'reducing'} your income by 
                    ${Math.abs(performance - 100).toFixed(1)}%
                </div>
            </div>
            
            <div class="performance-history">
                <h4>Performance History</h4>
                
                <div class="history-container">
                    <div class="history-line line-50"></div>
                    <div class="history-line line-100"></div>
                    <div class="history-line line-150"></div>
                    
                    <div class="history-label label-50">50%</div>
                    <div class="history-label label-100">100%</div>
                    <div class="history-label label-150">150%</div>
                    
                    ${historyPointsHTML}
                </div>
            </div>
            
            <div class="performance-tips">
                <h4>Improvement Tips</h4>
                <ul>
                    ${factors.skillMatch < 10 ? '<li>Improve relevant skills to boost performance.</li>' : ''}
                    ${factors.consistency < 10 ? '<li>Stay in this job longer to build consistency.</li>' : ''}
                    ${factors.energy < 0 ? '<li>Keep your energy levels above 70% for better performance.</li>' : ''}
                </ul>
            </div>
        `;
    }
    
    return {
        updateJobPerformance,
        applyPerformanceToIncome,
        setupPerformanceUI,
        updatePerformanceUI
    };
}

// Initialize all career progression enhancements
function initializeCareerProgression() {
    console.log("Initializing career progression enhancements");
    
    // Add required styles
    addCareerProgressionStyles();
    
    // Set up career path visualization
    setupCareerPathUI();
    
    // Create promotion system
    const promotionSystem = createPromotionSystem();
    promotionSystem.setupPromotionCheck();
    
    // Create job performance system
    const performanceSystem = createJobPerformanceSystem();
    performanceSystem.setupPerformanceUI();
    
    // Patch processJobIncome function to apply performance effects
    if (typeof window.processJobIncome === 'function') {
        const originalProcessJobIncome = window.processJobIncome;
        
        window.processJobIncome = function(jobData, deltaTime) {
            // Apply performance modifier before calculating income
            if (typeof performanceSystem.applyPerformanceToIncome === 'function') {
                const baseIncome = jobData.incomePerYear;
                const modifiedIncome = performanceSystem.applyPerformanceToIncome(baseIncome);
                
                // Temporarily modify income for the calculation
                const originalIncome = jobData.incomePerYear;
                jobData.incomePerYear = modifiedIncome;
                
                // Call original function
                originalProcessJobIncome(jobData, deltaTime);
                
                // Restore original value
                jobData.incomePerYear = originalIncome;
            } else {
                // Fall back to original function if performance system not available
                originalProcessJobIncome(jobData, deltaTime);
            }
        };
    }
    
    // Add job performance update to game loop
    const originalGameLoop = window.gameLoop;
    if (typeof originalGameLoop === 'function') {
        window.gameLoop = function(timestamp) {
            // Call original game loop
            originalGameLoop(timestamp);
            
            // Update job performance
            if (typeof performanceSystem.updateJobPerformance === 'function' && 
                !gameState.gamePaused && gameState.activeJob) {
                performanceSystem.updateJobPerformance();
            }
        };
    }
    
    // Add button to access career path
    let careerPathButton = document.getElementById('career-path-button');
    
    if (!careerPathButton) {
        careerPathButton = document.createElement('button');
        careerPathButton.id = 'career-path-button';
        careerPathButton.textContent = 'Career Path';
        careerPathButton.className = 'action-button';
        
        // Add to action buttons if possible
        const actionButtons = document.getElementById('action-buttons');
        if (actionButtons) {
            actionButtons.appendChild(careerPathButton);
        }
        
        // Add event listener
        careerPathButton.addEventListener('click', () => {
            updateCareerPathUI();
            const careerPathPanel = document.getElementById('career-path-panel');
            if (careerPathPanel) {
                careerPathPanel.style.display = 'block';
            }
        });
    }
    
    console.log("Career progression enhancements initialized successfully");
}

// Export functions
export {
    initializeCareerProgression,
    setupCareerPathUI,
    updateCareerPathUI,
    showJobDetails,
    createPromotionSystem,
    createJobPerformanceSystem
};

// Make functions available globally
window.initializeCareerProgression = initializeCareerProgression;
window.setupCareerPathUI = setupCareerPathUI;
window.updateCareerPathUI = updateCareerPathUI;
window.showJobDetails = showJobDetails;
window.createPromotionSystem = createPromotionSystem;
window.createJobPerformanceSystem = createJobPerformanceSystem;

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Wait a short time to ensure other systems are loaded
    setTimeout(initializeCareerProgression, 1000);
});
    
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.id = 'career-progression-styles';
    
    // Add CSS rules
    styleElement.textContent = `
        /* Career Path Panel Styles */
        .career-tree {
            display: flex;
            flex-direction: column;
            gap: 30px;
            padding: 20px 0;
        }
        
        .career-tier {
            border: 1px solid rgba(123, 104, 238, 0.3);
            border-radius: 10px;
            padding: 15px;
            background-color: rgba(30, 30, 45, 0.8);
        }
        
        .tier-header {
            text-align: center;
            color: #a496ff;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 1.2em;
            border-bottom: 1px solid rgba(123, 104, 238, 0.3);
            padding-bottom: 8px;
        }
        
        .tier-jobs {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
        }
        
        .career-job-node {
            width: 150px;
            height: 100px;
            background-color: rgba(40, 40, 60, 0.9);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            position: relative;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .career-job-node:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
        }
        
        .career-job-node.current-job {
            border: 2px solid #a496ff;
            background-color: rgba(50, 50, 80, 0.9);
            box-shadow: 0 0 15px rgba(123, 104, 238, 0.4);
        }
        
        .career-job-node.available-job {
            border: 1px solid rgba(123, 104, 238, 0.6);
        }
        
        .career-job-node.locked-job {
            border: 1px solid rgba(123, 104, 238, 0.2);
            opacity: 0.7;
            background-color: rgba(30, 30, 40, 0.9);
        }
        
        .job-node-header {
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 10px;
            font-size: 1em;
        }
        
        .job-node-level {
            font-size: 0.8em;
            color: #a496ff;
        }
        
        /* Job Details Overlay */
        #job-details-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        }
        
        .job-details-content {
            background-color: rgba(30, 30, 45, 0.95);
            border-radius: 12px;
            padding: 25px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 0 30px rgba(123, 104, 238, 0.4);
            border: 1px solid rgba(123, 104, 238, 0.6);
        }
        
        .close-overlay-button {
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            color: #a496ff;
            font-size: 1.6em;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            z-index: 1;
        }
        
        .job-details-title {
            text-align: center;
            color: #ffffff;
            margin-top: 5px;
            margin-bottom: 15px;
            font-size: 1.4em;
            text-shadow: 0 0 10px rgba(123, 104, 238, 0.5);
        }
        
        .job-details-status {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .current-job-badge, .job-level-badge {
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .current-job-badge {
            background-color: rgba(123, 104, 238, 0.3);
            color: #a496ff;
            border: 1px solid #a496ff;
        }
        
        .job-level-badge {
            background-color: rgba(52, 191, 163, 0.3);
            color: #38ef7d;
            border: 1px solid #38ef7d;
        }
        
        .job-details-description {
            margin-bottom: 20px;
            padding: 15px;
            background-color: rgba(40, 40, 60, 0.6);
            border-radius: 8px;
            line-height: 1.5;
        }
        
        .job-details-stats, .job-details-requirements, .job-details-skills, .job-bonuses {
            margin-bottom: 20px;
            padding: 15px;
            background-color: rgba(40, 40, 60, 0.6);
            border-radius: 8px;
        }
        
        .job-details-stats {
            display: flex;
            justify-content: space-around;
        }
        
        .stat-label {
            color: #a496ff;
            font-weight: bold;
            margin-right: 5px;
        }
        
        .job-details-requirements h4, .job-details-skills h4, .job-bonuses h4 {
            color: #a496ff;
            margin-top: 0;
            margin-bottom: 10px;
            border-bottom: 1px solid rgba(123, 104, 238, 0.3);
            padding-bottom: 5px;
        }
        
        .requirement {
            margin: 8px 0;
            padding: 8px 10px;
            border-radius: 5px;
            font-size: 0.9em;
        }
        
        .bonus-unlocked, .bonus-locked {
            margin: 5px 0;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.9em;
        }
        
        .bonus-unlocked {
            background-color: rgba(40, 167, 69, 0.2);
            border-left: 3px solid #28a745;
        }
        
        .bonus-locked {
            background-color: rgba(108, 117, 125, 0.2);
            border-left: 3px solid #6c757d;
            color: #adb5bd;
        }
        
        .job-details-actions {
            display: flex;
            justify-content: center;
            margin-top: 20px;
        }
        
        .job-details-actions button {
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
            background: linear-gradient(135deg, #4776E6, #8E54E9);
            color: white;
            border: none;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }
        
        .job-details-actions button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
        }
        
        .job-details-actions button:disabled {
            background: linear-gradient(135deg, #495057, #6c757d);
            cursor: not-allowed;
            transform: none;
        }
        
        /* Enhanced Job Progress Display */
        .enhanced-progress-container {
            background-color: rgba(40, 40, 60, 0.7);
            border-radius: 10px;
            padding: 12px 15px;
            margin: 10px 0;
            border: 1px solid rgba(123, 104, 238, 0.4);
            width: 100%;
            max-width: 300px;
        }
        
        .enhanced-progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .job-title {
            font-weight: bold;
            color: #ffffff;
        }
        
        .job-level {
            background-color: rgba(123, 104, 238, 0.2);
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            color: #a496ff;
        }
        
        .enhanced-progress-status {
            text-align: center;
            color: #ff6b6b;
            font-style: italic;
            margin-bottom: 10px;
        }
        
        .enhanced-progress-bar-container {
            margin-bottom: 10px;
        }
        
        .enhanced-progress-bar {
            height: 15px;
            background-color: rgba(20, 20, 30, 0.6);
            border-radius: 10px;
            overflow: hidden;
            position: relative;
            box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
        }
        
        .enhanced-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4776E6, #8E54E9);
            box-shadow: 0 0 8px rgba(123, 104, 238, 0.4);
            transition: width 0.3s ease;
        }
        
        .enhanced-progress-text {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.7em;
            font-weight: bold;
            text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
        }
        
        .enhanced-progress-stats {
            display: flex;
            justify-content: space-between;
            font-size: 0.8em;
            margin-bottom: 10px;
        }
        
        .progress-stat {
            background-color: rgba(30, 30, 40, 0.6);
            padding: 5px 8px;
            border-radius: 5px;
        }
        
        .small-action-button {
            width: 100%;
            padding: 8px 0;
            border-radius: 20px;
            background: linear-gradient(135deg, #4776E6, #8E54E9);
            color: white;
            border: none;
            font-size: 0.8em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        }
        
        .small-action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }
    `;
    
    // Add style element to document head
    document.head.appendChild(styleElement);
    console.log("Career progression styles added to document");
}

// Career Path Visualization
function setupCareerPathUI() {
    console.log("Setting up career path visualization");
    
    // Create a career path panel if it doesn't exist
    let careerPathPanel = document.getElementById('career-path-panel');
    
    if (!careerPathPanel) {
        // Create panel
        careerPathPanel = document.createElement('div');
        careerPathPanel.id = 'career-path-panel';
        careerPathPanel.className = 'hidden-panel';
        
        // Add header
        const header = document.createElement('h3');
        header.textContent = 'Career Progression';
        careerPathPanel.appendChild(header);
        
        // Add content area
        const contentArea = document.createElement('div');
        contentArea.id = 'career-path-content';
        careerPathPanel.appendChild(contentArea);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.textContent = 'Close';
        closeButton.setAttribute('data-panel', 'career-path-panel');
        closeButton.addEventListener('click', () => {
            careerPathPanel.style.display = 'none';
        });
        careerPathPanel.appendChild(closeButton);
        
        // Add to document
        document.body.appendChild(careerPathPanel);
        
        // Add event listener to show button (create if needed)
        let careerPathButton = document.getElementById('career-path-button');
        
        if (!careerPathButton) {
            careerPathButton = document.createElement('button');
            careerPathButton.id = 'career-path-button';
            careerPathButton.textContent = 'Career Path';
            careerPathButton.className = 'action-button';
            
            const actionButtons = document.getElementById('action-buttons');
            if (actionButtons) {
                actionButtons.appendChild(careerPathButton);
            }
        }
        
        careerPathButton.addEventListener('click', () => {
            updateCareerPathUI();
            careerPathPanel.style.display = 'block';
        });
    }
}

// Update the career path visualization
function updateCareerPathUI() {
    console.log("Updating career path visualization");
    
    const contentArea = document.getElementById('career-path-content');
    if (!contentArea) return;
    
    // Clear existing content
    contentArea.innerHTML = '';
    
    // Create the career path visualization
    if (!gameState.jobs || !Array.isArray(gameState.jobs) || gameState.jobs.length === 0) {
        contentArea.innerHTML = '<p class="no-jobs">No jobs available to display.</p>';
        return;
    }
    
    // Create job tree visualization
    const careerTree = document.createElement('div');
    careerTree.className = 'career-tree';
    
    // Group jobs by tier
    const jobsByTier = {};
    
    gameState.jobs.forEach(job => {
        if (job.tiers && job.tiers.length > 0) {
            job.tiers.forEach(tier => {
                const tierNum = tier.tier;
                if (!jobsByTier[tierNum]) {
                    jobsByTier[tierNum] = [];
                }
                
                // Create a combined job object with tier data
                const combinedJob = { ...job, ...tier };
                jobsByTier[tierNum].push(combinedJob);
            });
        }
    });
    
    // Sort tiers
    const sortedTiers = Object.keys(jobsByTier).sort((a, b) => parseInt(a) - parseInt(b));
    
    // Create a tier container for each tier
    sortedTiers.forEach(tierNum => {
        const tierContainer = document.createElement('div');
        tierContainer.className = 'career-tier';
        tierContainer.innerHTML = `<h4 class="tier-header">Tier ${tierNum}</h4>`;
        
        // Add jobs in this tier
        const jobsContainer = document.createElement('div');
        jobsContainer.className = 'tier-jobs';
        
        jobsByTier[tierNum].forEach(job => {
            const jobNode = document.createElement('div');
            jobNode.className = 'career-job-node';
            
            // Highlight current job
            if (gameState.activeJob && gameState.activeJob.id === job.id && gameState.currentJobTier === job.tier) {
                jobNode.classList.add('current-job');
            }
            
            // Check if job is unlocked/available
            const isAvailable = window.meetsJobRequirements ? 
                window.meetsJobRequirements(job, job.tier) : false;
            
            if (isAvailable) {
                jobNode.classList.add('available-job');
            } else {
                jobNode.classList.add('locked-job');
            }
            
            // Get job level if player has worked this job
            const jobLevel = gameState.jobLevels && gameState.jobLevels[job.id] || 0;
            
            // Create job node content
            jobNode.innerHTML = `
                <div class="job-node-header">${job.title}</div>
                <div class="job-node-level">${jobLevel > 0 ? `Level ${jobLevel}` : 'Not Started'}</div>
            `;
            
            // Add prerequisite lines (visual connections between jobs)
            if (job.requiredJobId) {
                jobNode.dataset.prerequisite = job.requiredJobId;
                jobNode.dataset.prerequisiteLevel = job.requiredJobLevel || 1;
            }
            
            // Add click event to show job details
            jobNode.addEventListener('click', () => {
                showJobDetails(job);
            });
            
            jobsContainer.appendChild(jobNode);
        });
        
        tierContainer.appendChild(jobsContainer);
        careerTree.appendChild(tierContainer);
    });
    
    contentArea.appendChild(careerTree);
    
    // Add connecting lines between jobs (would require canvas or SVG for proper implementation)
    // This is a simplified version using CSS where possible
}

// Show detailed information about a job
function showJobDetails(job) {
    // Create or get the job details overlay
    let detailsOverlay = document.getElementById('job-details-overlay');
    
    if (!detailsOverlay) {
        detailsOverlay = document.createElement('div');
        detailsOverlay.id = 'job-details-overlay';
        
        // Create close button for overlay
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-overlay-button';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => {
            detailsOverlay.style.display = 'none';
        });
        
        detailsOverlay.appendChild(closeBtn);
        
        // Create content container
        const content = document.createElement('div');
        content.className = 'job-details-content';
        detailsOverlay.appendChild(content);
        
        document.body.appendChild(detailsOverlay);
        
        // Close overlay when clicking outside content
        detailsOverlay.addEventListener('click', (e) => {
            if (e.target === detailsOverlay) {
                detailsOverlay.style.display = 'none';
            }
        });
    }
    
    // Get job level and check if it's the current job
    const jobLevel = gameState.jobLevels && gameState.jobLevels[job.id] || 0;
    const isCurrentJob = gameState.activeJob && 
                         gameState.activeJob.id === job.id && 
                         gameState.currentJobTier === job.tier;
    
    // Get content container and update its content
    const content = detailsOverlay.querySelector('.job-details-content');
    if (!content) return;
    
    // Check if the player meets requirements for this job
    const meetsRequirements = window.meetsJobRequirements ? 
        window.meetsJobRequirements(job, job.tier) : false;
    
    // Get the skill requirements
    const requiredSkill = "Map Awareness";
    const requiredLevel = job.minSkill || 0;
    const currentSkillLevel = gameState.skills[requiredSkill] || 0;
    
    // Get previous job requirement if applicable
    let previousJobRequirement = '';
    if (job.requiredJobId && job.requiredJobLevel) {
        const requiredJobLevel = job.requiredJobLevel;
        const currentPrevJobLevel = gameState.jobLevels && gameState.jobLevels[job.requiredJobId] || 0;
        const meetsJobLevelReq = currentPrevJobLevel >= requiredJobLevel;
        
        // Find the job name for the required job
        let requiredJobName = job.requiredJobId;
        gameState.jobs.forEach(j => {
            if (j.id === job.requiredJobId) {
                requiredJobName = j.title;
            }
        });
        
        previousJobRequirement = `
            <div class="requirement ${meetsJobLevelReq ? 'met' : 'not-met'}">
                ${requiredJobName} Level: ${currentPrevJobLevel}/${requiredJobLevel}
            </div>
        `;
    }
    
    // Build the job bonuses display
    let bonusesHtml = '';
    if (job.levelBonuses && job.levelBonuses.length > 0) {
        bonusesHtml = `
            <div class="job-bonuses">
                <h4>Level Bonuses:</h4>
                <ul>
        `;
        
        job.levelBonuses.forEach(bonus => {
            const bonusDescription = bonus.bonusType === 'jobXpMultiplier' 
                ? `+${(bonus.bonusValue * 100).toFixed(0)}% Job XP` 
                : `+${(bonus.bonusValue * 100).toFixed(0)}% Gold`;
                
            const hasBonus = jobLevel >= bonus.level;
            
            bonusesHtml += `
                <li class="${hasBonus ? 'bonus-unlocked' : 'bonus-locked'}">
                    Level ${bonus.level}: ${bonusDescription}
                </li>
            `;
        });
        
        bonusesHtml += `
                </ul>
            </div>
        `;
    }
    
    // Update content
    content.innerHTML = `
        <h3 class="job-details-title">${job.title} ${job.tier > 0 ? `(Tier ${job.tier})` : ''}</h3>
        
        <div class="job-details-status">
            ${isCurrentJob ? '<span class="current-job-badge">Current Job</span>' : ''}
            ${jobLevel > 0 ? `<span class="job-level-badge">Level ${jobLevel}</span>` : ''}
        </div>
        
        <div class="job-details-description">
            ${job.description || 'No description available.'}
        </div>
        
        <div class="job-details-stats">
            <div class="job-details-income">
                <span class="stat-label">Income:</span>
                <span class="stat-value">${job.incomePerYear} gold/year</span>
            </div>
        </div>
        
        <div class="job-details-requirements">
            <h4>Requirements:</h4>
            <div class="requirement ${currentSkillLevel >= requiredLevel ? 'met' : 'not-met'}">
                ${requiredSkill}: ${currentSkillLevel}/${requiredLevel}
            </div>
            ${previousJobRequirement}
        </div>
        
        <div class="job-details-skills">
            <h4>Skill Gains:</h4>
            <ul>
                ${Object.entries(job.skillGainPerYear || {}).map(([skill, gain]) => 
                    `<li>${skill}: +${gain}/year</li>`
                ).join('')}
            </ul>
        </div>
        
        ${bonusesHtml}
        
        <div class="job-details-actions">
            ${!isCurrentJob && meetsRequirements ? 
                `<button id="apply-job-button" data-job-id="${job.id}" data-job-tier="${job.tier}">Apply for Job</button>` : 
                (isCurrentJob ? 
                    '<button id="quit-job-button">Quit Job</button>' : 
                    '<button disabled>Requirements Not Met</button>'
                )
            }
        </div>
    `;
    
    // Add event listeners to buttons
    const applyButton = content.querySelector('#apply-job-button');
    if (applyButton) {
        applyButton.addEventListener('click', () => {
            // Find job index
            const jobId = applyButton.getAttribute('data-job-id');
            const jobTier = parseInt(applyButton.getAttribute('data-job-tier'), 10);
            
            // Find job in jobs array
            let jobIndex = -1;
            gameState.jobs.forEach((j, index) => {
                if (j.id === jobId) {
                    jobIndex = index;
                }
            });
            
            if (jobIndex >= 0 && typeof window.applyForJob === 'function') {
                const success = window.applyForJob(jobIndex, jobTier);
                
                if (success) {
                    detailsOverlay.style.display = 'none';
                    
                    // Refresh the career path UI
                    updateCareerPathUI();
                    
                    // Update game display
                    if (typeof window.updateDisplay === 'function') {
                        window.updateDisplay();
                    }
                }
            }
        });
    }
    
    const quitButton = content.querySelector('#quit-job-button');
    if (quitButton) {
        quitButton.addEventListener('click', () => {
            if (typeof window.quitJob === 'function') {
                const success = window.quitJob();
                
                if (success) {
                    detailsOverlay.style.display = 'none';
                    
                    // Refresh the career path UI
                    updateCareerPathUI();
                    
                    // Update game display
                    if (typeof window.updateDisplay === 'function') {
                        window.updateDisplay();
                    }
                }
            }
        });
    }
    
    // Show the overlay
    detailsOverlay.style.display = 'flex';
}

// Enhanced job progress tracking
function setupEnhancedJobProgress() {
    // Create enhanced job progress section in the top bar
    const topBar = document.getElementById('top-bar');
    if (!topBar) return;
    
    // Check if enhanced job progress already exists
    let enhancedJobProgress = document.getElementById('enhanced-job-progress');
    
    if (!enhancedJobProgress) {
        enhancedJobProgress = document.createElement('div');
        enhancedJobProgress.id = 'enhanced-job-progress';
        enhancedJobProgress.className = 'enhanced-progress-container';
        
        // Add to top bar
        topBar.appendChild(enhancedJobProgress);
    }
    
    // Initial update
    updateEnhancedJobProgress();
}

// Update enhanced job progress display
function updateEnhancedJobProgress() {
    const container = document.getElementById('enhanced-job-progress');
    if (!container) return;
    
    if (!gameState.activeJob) {
        container.innerHTML = `
            <div class="enhanced-progress-header">Career Status</div>
            <div class="enhanced-progress-status">Unemployed</div>
            <button id="find-job-button" class="small-action-button">Find Job</button>
        `;
        
        // Add event listener to the find job button
        const findJobButton = container.querySelector('#find-job-button');
        if (findJobButton) {
            findJobButton.addEventListener('click', () => {
                const jobsPanel = document.getElementById('jobs-panel');
                if (jobsPanel) {
                    if (typeof window.setupJobsUI === 'function') {
                        window.setupJobsUI();
                    }
                    jobsPanel.style.display = 'block';
                }
            });
        }
        
        return;
    }
    
    // Get job level
    const jobId = gameState.activeJob.id;
    const jobLevel = gameState.jobLevels && gameState.jobLevels[jobId] || 1;
    
    // Get job progress
    const jobProgress = gameState.jobProgress || 0;
    const progressNeeded = 100 * Math.pow(1.1, jobLevel - 1); // Same formula from job-manager.js
    const progressPercent = Math.min(100, (jobProgress / progressNeeded) * 100);
    
    // Get next level bonus (if any)
    let nextBonus = "None";
    let nextBonusLevel = Infinity;
    
    if (gameState.activeJob.levelBonuses && Array.isArray(gameState.activeJob.levelBonuses)) {
        for (const bonus of gameState.activeJob.levelBonuses) {
            if (bonus.level > jobLevel && bonus.level < nextBonusLevel) {
                nextBonusLevel = bonus.level;
                nextBonus = bonus.bonusType === 'jobXpMultiplier' 
                    ? `+${(bonus.bonusValue * 100).toFixed(0)}% Job XP` 
                    : `+${(bonus.bonusValue * 100).toFixed(0)}% Gold`;
            }
        }
    }
    
    // Update container with job progress details
    container.innerHTML = `
        <div class="enhanced-progress-header">
            <span class="job-title">${gameState.activeJob.title}</span>
            <span class="job-level">Level ${jobLevel}</span>
        </div>
        
        <div class="enhanced-progress-bar-container">
            <div class="enhanced-progress-bar">
                <div class="enhanced-progress-fill" style="width: ${progressPercent}%"></div>
                <div class="enhanced-progress-text">${Math.floor(progressPercent)}%</div>
            </div>
        </div>
        
        <div class="enhanced-progress-stats">
            <div class="progress-stat">
                <span class="stat-label">Next Level:</span>
                <span class="stat-value">${jobLevel + 1}</span>
            </div>
            <div class="progress-stat">
                <span class="stat-label">Next Bonus:</span>
                <span class="stat-value">${nextBonusLevel === Infinity ? 'Max Level' : `Level ${nextBonusLevel}: ${nextBonus}`}</span>
            </div>
        </div>
        
        <button id="view-career-button" class="small-action-button">View Career Path</button>
    `;
    
    // Add event listener to the view career button
    const viewCareerButton = container.querySelector('#view-career-button');
    if (viewCareerButton) {
        viewCareerButton.addEventListener('click', () => {
            const careerPathPanel = document.getElementById('career-path-panel');
            if (careerPathPanel) {
                updateCareerPathUI();
                careerPathPanel.style.display = 'block';
            }
        });
    }
}