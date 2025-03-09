function getJobData(jobIndex, currentJobTier) {
    if (!gameState.jobs || jobIndex < 0 || jobIndex >= gameState.jobs.length) {
      console.error("Invalid job index:", jobIndex);
      return null; // Or a default job object
    }
  
    const jobData = gameState.jobs[jobIndex];
  
    if (jobData && jobData.tiers) {
        const jobTierData = jobData.tiers.find(tier => tier.tier === currentJobTier);
        if (jobTierData) {
            // Create a copy to avoid modifying original data
            const jobDataWithTier = { ...jobData, ...jobTierData};
            // No need to check for "tier" and copy it here, as the tier property will get copied here.
            return jobDataWithTier;
        } else {
            console.warn(`No tier data found for job ${jobData.id} at tier ${currentJobTier}. Returning base job data.`);
            return jobData; // Return base data if tier not found (could be an issue)
        }
    } else {
        console.warn(`No tier data found for job index ${jobIndex}.`); //Consider adding default tier here as well
        return jobData;
    }
  }