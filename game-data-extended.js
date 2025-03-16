/**
 * Extended Game Data - Contains the additional career tracks
 * This file extends game-data.js with the remaining career tracks
 */

// Import base GameData
import GameData from './game-data.js';
import { TYPES } from './game-data.js';

// Add Theoretical Physics Track
GameData.careers[TYPES.CAREER_TRACK.PHYSICS] = {
    name: "Theoretical Physics Track",
    description: "An academic research career focusing on scientific skills",
    tiers: [
        createCareerTier(
            "physics_tier1",
            "Physics Student",
            "I'm not procrastinating, I'm just conserving energy.",
            22,
            {
                generalSkills: {
                    [TYPES.SKILL.INTELLIGENCE]: 10,
                    [TYPES.SKILL.FOCUS]: 8,
                    [TYPES.SKILL.CRITICAL_THINKING]: 5
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MATH]: 3
                }
            }
        ),
        createCareerTier(
            "physics_tier2",
            "Lab Assistant",
            "Have you tried turning it off and on again?",
            30,
            {
                generalSkills: {
                    [TYPES.SKILL.INTELLIGENCE]: 15,
                    [TYPES.SKILL.FOCUS]: 12,
                    [TYPES.SKILL.DISCIPLINE]: 10
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MATH]: 8,
                    [TYPES.PROF_SKILL.RESEARCH]: 5
                }
            },
            "physics_tier1",
            10
        ),
        createCareerTier(
            "physics_tier3",
            "Research Associate",
            "I'm measuring the speed of light... in paperwork.",
            45,
            {
                generalSkills: {
                    [TYPES.SKILL.INTELLIGENCE]: 20,
                    [TYPES.SKILL.CRITICAL_THINKING]: 15,
                    [TYPES.SKILL.PATIENCE]: 15
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MATH]: 15,
                    [TYPES.PROF_SKILL.RESEARCH]: 12,
                    [TYPES.PROF_SKILL.DATA]: 10
                }
            },
            "physics_tier2",
            15
        ),
        createCareerTier(
            "physics_tier4",
            "Assistant Professor",
            "I was told there would be funding.",
            60,
            {
                generalSkills: {
                    [TYPES.SKILL.INTELLIGENCE]: 22,
                    [TYPES.SKILL.COMMUNICATION]: 18,
                    [TYPES.SKILL.CRITICAL_THINKING]: 20
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MATH]: 18,
                    [TYPES.PROF_SKILL.RESEARCH]: 15,
                    [TYPES.PROF_SKILL.DATA]: 12
                }
            },
            "physics_tier3",
            20
        ),
        createCareerTier(
            "physics_tier5",
            "Theoretical Physicist",
            "According to my calculations, my salary should be higher.",
            80,
            {
                generalSkills: {
                    [TYPES.SKILL.INTELLIGENCE]: 25,
                    [TYPES.SKILL.CREATIVITY]: 20,
                    [TYPES.SKILL.CRITICAL_THINKING]: 22
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MATH]: 22,
                    [TYPES.PROF_SKILL.RESEARCH]: 20,
                    [TYPES.PROF_SKILL.DATA]: 15
                }
            },
            "physics_tier4",
            25
        ),
        createCareerTier(
            "physics_tier6",
            "Nobel Laureate",
            "Time is relative, especially grant deadlines.",
            120,
            {
                generalSkills: {
                    [TYPES.SKILL.INTELLIGENCE]: 30,
                    [TYPES.SKILL.CREATIVITY]: 25,
                    [TYPES.SKILL.CRITICAL_THINKING]: 28
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MATH]: 28,
                    [TYPES.PROF_SKILL.RESEARCH]: 25,
                    [TYPES.PROF_SKILL.DATA]: 20
                }
            },
            "physics_tier5",
            30
        )
    ]
};

// Add Digital Influencer Track
GameData.careers[TYPES.CAREER_TRACK.INFLUENCER] = {
    name: "Digital Influencer Track",
    description: "A social media career focusing on charisma and media skills",
    tiers: [
        createCareerTier(
            "influencer_tier1",
            "Social Media Commenter",
            "First comment! No one cares, but I feel special.",
            10,
            {
                generalSkills: {
                    [TYPES.SKILL.COMMUNICATION]: 5,
                    [TYPES.SKILL.CHARISMA]: 3
                },
                professionalSkills: {}
            }
        ),
        createCareerTier(
            "influencer_tier2",
            "Content Creator",
            "Spent 4 hours editing a 15-second video. Worth it for those 5 likes.",
            15,
            {
                generalSkills: {
                    [TYPES.SKILL.COMMUNICATION]: 10,
                    [TYPES.SKILL.CHARISMA]: 8,
                    [TYPES.SKILL.CREATIVITY]: 7
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MEDIA]: 5
                }
            },
            "influencer_tier1",
            10
        ),
        createCareerTier(
            "influencer_tier3",
            "Micro-Influencer",
            "Yes, I'll promote your protein powder for free. Exposure is currency, right?",
            25,
            {
                generalSkills: {
                    [TYPES.SKILL.COMMUNICATION]: 15,
                    [TYPES.SKILL.CHARISMA]: 15,
                    [TYPES.SKILL.PERSUASION]: 12
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MEDIA]: 12,
                    [TYPES.PROF_SKILL.MARKETING]: 8
                }
            },
            "influencer_tier2",
            15
        ),
        createCareerTier(
            "influencer_tier4",
            "Brand Ambassador",
            "I'm not selling out, I'm buying in.",
            40,
            {
                generalSkills: {
                    [TYPES.SKILL.COMMUNICATION]: 18,
                    [TYPES.SKILL.CHARISMA]: 20,
                    [TYPES.SKILL.PERSUASION]: 15
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MEDIA]: 15,
                    [TYPES.PROF_SKILL.MARKETING]: 12,
                    [TYPES.PROF_SKILL.NETWORKING]: 10
                }
            },
            "influencer_tier3",
            20
        ),
        createCareerTier(
            "influencer_tier5",
            "Social Media Celebrity",
            "My dog has its own agent now.",
            70,
            {
                generalSkills: {
                    [TYPES.SKILL.COMMUNICATION]: 22,
                    [TYPES.SKILL.CHARISMA]: 25,
                    [TYPES.SKILL.CREATIVITY]: 18
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MEDIA]: 20,
                    [TYPES.PROF_SKILL.MARKETING]: 18,
                    [TYPES.PROF_SKILL.NETWORKING]: 15
                }
            },
            "influencer_tier4",
            25
        ),
        createCareerTier(
            "influencer_tier6",
            "Global Influencer Mogul",
            "Just launched my 7th ghostwritten book. #Blessed #Authentic",
            100,
            {
                generalSkills: {
                    [TYPES.SKILL.COMMUNICATION]: 25,
                    [TYPES.SKILL.CHARISMA]: 30,
                    [TYPES.SKILL.PERSUASION]: 22
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MEDIA]: 25,
                    [TYPES.PROF_SKILL.MARKETING]: 22,
                    [TYPES.PROF_SKILL.NETWORKING]: 20
                }
            },
            "influencer_tier5",
            30
        )
    ]
};

// Add Fantasy Magic Career Track
GameData.careers[TYPES.CAREER_TRACK.MAGIC] = {
    name: "Fantasy Magic Career Track",
    description: "A whimsical magical career focusing on mystical skills",
    tiers: [
        createCareerTier(
            "magic_tier1",
            "Street Magician",
            "Is this your card? No? Well, awkward...",
            15,
            {
                generalSkills: {
                    [TYPES.SKILL.CONFIDENCE]: 5,
                    [TYPES.SKILL.CREATIVITY]: 3,
                    [TYPES.SKILL.CHARISMA]: 3
                },
                professionalSkills: {}
            }
        ),
        createCareerTier(
            "magic_tier2",
            "Magical Apprentice",
            "I put on my robe and wizard hat.",
            22,
            {
                generalSkills: {
                    [TYPES.SKILL.FOCUS]: 10,
                    [TYPES.SKILL.DISCIPLINE]: 8,
                    [TYPES.SKILL.MEMORY]: 7
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MYSTICAL]: 5
                }
            },
            "magic_tier1",
            10
        ),
        createCareerTier(
            "magic_tier3",
            "Spellcaster",
            "It's not a bug, it's a feature of the arcane.",
            35,
            {
                generalSkills: {
                    [TYPES.SKILL.FOCUS]: 15,
                    [TYPES.SKILL.INTELLIGENCE]: 12,
                    [TYPES.SKILL.MEMORY]: 12
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MYSTICAL]: 12,
                    [TYPES.PROF_SKILL.RESEARCH]: 8
                }
            },
            "magic_tier2",
            15
        ),
        createCareerTier(
            "magic_tier4",
            "Arcane Scholar",
            "I've been translating this ancient text for months. Turns out it's just a grocery list.",
            50,
            {
                generalSkills: {
                    [TYPES.SKILL.INTELLIGENCE]: 18,
                    [TYPES.SKILL.FOCUS]: 15,
                    [TYPES.SKILL.PATIENCE]: 15
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MYSTICAL]: 18,
                    [TYPES.PROF_SKILL.RESEARCH]: 15
                }
            },
            "magic_tier3",
            20
        ),
        createCareerTier(
            "magic_tier5",
            "Master Enchanter",
            "Sure, I can make your sword glow. That'll be 500 gold. Shipping not included.",
            75,
            {
                generalSkills: {
                    [TYPES.SKILL.CREATIVITY]: 22,
                    [TYPES.SKILL.INTELLIGENCE]: 20,
                    [TYPES.SKILL.FOCUS]: 18
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MYSTICAL]: 22,
                    [TYPES.PROF_SKILL.RESEARCH]: 18,
                    [TYPES.PROF_SKILL.MARKETING]: 10
                }
            },
            "magic_tier4",
            25
        ),
        createCareerTier(
            "magic_tier6",
            "Archmage",
            "With unlimited power comes unlimited emails asking for free magical favors.",
            110,
            {
                generalSkills: {
                    [TYPES.SKILL.INTELLIGENCE]: 25,
                    [TYPES.SKILL.CREATIVITY]: 22,
                    [TYPES.SKILL.FOCUS]: 22
                },
                professionalSkills: {
                    [TYPES.PROF_SKILL.MYSTICAL]: 28,
                    [TYPES.PROF_SKILL.RESEARCH]: 22,
                    [TYPES.PROF_SKILL.NETWORKING]: 15
                }
            },
            "magic_tier5",
            30
        )
    ]
};

// Helper function for career tier creation (copied from game-data.js for consistency)
function createCareerTier(id, name, quote, baseSalary, requirements, previousJob = null, previousJobLevel = 0) {
    const tier = {
        id,
        name,
        quote,
        baseSalary,
        requirements: {
            generalSkills: requirements.generalSkills || {},
            professionalSkills: requirements.professionalSkills || {}
        }
    };
    
    if (previousJob) {
        tier.requirements.previousJob = previousJob;
        tier.requirements.previousJobLevel = previousJobLevel;
    }
    
    return tier;
}

// Export the extended GameData
export default GameData;
