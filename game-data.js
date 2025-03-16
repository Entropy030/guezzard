// ============== Constants ==============
// Create an enum-like structure for better type safety and autocompletion
const TYPES = {
    // Career Track Types
    CAREER_TRACK: {
        OFFICE: "careerTrack_officeCorporate",
        GEOGUESSR: "careerTrack_geoGuessr",
        AI: "careerTrack_aiEvolution",
        PHYSICS: "careerTrack_theoreticalPhysics",
        INFLUENCER: "careerTrack_digitalInfluencer",
        MAGIC: "careerTrack_fantasyMagic"
    },
    
    // General Skill Types
    SKILL: {
        FOCUS: "skill_focus",
        INTELLIGENCE: "skill_intelligence",
        COMMUNICATION: "skill_communication",
        CREATIVITY: "skill_creativity",
        DISCIPLINE: "skill_discipline",
        CHARISMA: "skill_charisma",
        PATIENCE: "skill_patience",
        ADAPTABILITY: "skill_adaptability",
        CONFIDENCE: "skill_confidence",
        OBSERVATION: "skill_observation",
        CRITICAL_THINKING: "skill_criticalThinking",
        EMPATHY: "skill_empathy",
        MEMORY: "skill_memory",
        PERSUASION: "skill_persuasion",
        ORGANIZATION: "skill_organization"
    },
    
    // Professional Skill Types
    PROF_SKILL: {
        BUSINESS: "professionalSkill_businessAcumen",
        SPATIAL: "professionalSkill_spatialAwareness",
        CODING: "professionalSkill_coding",
        DATA: "professionalSkill_dataAnalysis",
        MATH: "professionalSkill_mathematicalReasoning",
        MEDIA: "professionalSkill_mediaProduction",
        MARKETING: "professionalSkill_marketing",
        MYSTICAL: "professionalSkill_mysticalKnowledge",
        NETWORKING: "professionalSkill_networking",
        RESEARCH: "professionalSkill_research"
    },
    
    // Housing Types
    HOUSING: {
        HOMELESS: "housing_homeless",
        TENT: "housing_tent",
        TRAILER: "housing_trailerPark",
        FLAT: "housing_flat",
        TINY: "housing_tinyHouse",
        LUXURY: "housing_luxuryApartment",
        TOWNHOUSE: "housing_smallTownHouse",
        VILLA: "housing_cityVilla",
        CASTLE: "housing_castle"
    },
    
    // Transportation Types
    TRANSPORT: {
        FOOT: "transport_foot",
        BIKE: "transport_bike",
        PUBLIC: "transport_publicTransport",
        CAR: "transport_car",
        HYPERLOOP: "transport_hyperloop",
        HELICOPTER: "transport_helicopter",
        TELEPORT: "transport_teleportation"
    },
    
    // Food Types
    FOOD: {
        HOMELESS: "food_homelessShelter",
        STAMPS: "food_foodStamps",
        FAST: "food_fastFood",
        COOKED: "food_selfCooked",
        CHEF: "food_personalChef"
    }
};

// ============== Helper Functions ==============
/**
 * Creates a career tier with standard structure
 * @param {string} id - Unique identifier for the tier
 * @param {string} name - Display name
 * @param {string} quote - Flavor text
 * @param {number} baseSalary - Base salary for this tier
 * @param {Object} requirements - Skills and other requirements
 * @param {string} [previousJob] - Previous job requirement
 * @param {number} [previousJobLevel] - Required level in previous job
 * @returns {Object} Career tier object
 */
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

/**
 * Creates a lifestyle option (housing, transport, food)
 * @param {string} name - Display name
 * @param {Object} stats - Statistical effects
 * @param {number} cost - Cost of this option
 * @param {Object} requirements - Requirements to unlock
 * @returns {Object} Lifestyle option object
 */
function createLifestyleOption(name, stats, cost, requirements = {}) {
    return {
        name,
        ...stats,
        cost,
        requirements
    };
}

// ============== Game Data ==============
// General skills definitions
const generalSkills = {
    [TYPES.SKILL.FOCUS]: {
        name: "Focus",
        description: "The superpower of pretending the rest of the world doesn't exist for 10 minutes… until you remember you're hungry."
    },
    [TYPES.SKILL.INTELLIGENCE]: {
        name: "Intelligence",
        description: "The ability to solve problems you didn't create... which is a miracle considering you're constantly creating new ones."
    },
    [TYPES.SKILL.COMMUNICATION]: {
        name: "Communication",
        description: "Mastering the art of saying 'I'm fine' when your soul is crumbling."
    },
    [TYPES.SKILL.CREATIVITY]: {
        name: "Creativity",
        description: "Pretending new ways to procrastinate that look like actual work."
    },
    [TYPES.SKILL.DISCIPLINE]: {
        name: "Discipline",
        description: "The painful skill of doing things you hate because someone, somewhere, told you it's 'good for you.'"
    },
    [TYPES.SKILL.CHARISMA]: {
        name: "Charisma",
        description: "Making people believe your Google Slides presentation isn't a complete waste of time."
    },
    [TYPES.SKILL.PATIENCE]: {
        name: "Patience",
        description: "Sitting through mind-numbing conversations, or waiting for your browser to load while silently contemplating your entire existence."
    },
    [TYPES.SKILL.ADAPTABILITY]: {
        name: "Adaptability",
        description: "Switching from crying in the bathroom to smiling in meetings in under 5 minutes."
    },
    [TYPES.SKILL.CONFIDENCE]: {
        name: "Confidence",
        description: "Walking into a room like you own it, even though you're secretly googling how to look 'professional.'"
    },
    [TYPES.SKILL.OBSERVATION]: {
        name: "Observation",
        description: "Noticing everything that's wrong with the world, but too tired to do anything about it."
    },
    [TYPES.SKILL.CRITICAL_THINKING]: {
        name: "Critical Thinking",
        description: "Figuring out that the 'innovative' project is just a rehash of last year's failed idea."
    },
    [TYPES.SKILL.EMPATHY]: {
        name: "Empathy",
        description: "Understanding people's feelings, even when you're trying to avoid talking to them."
    },
    [TYPES.SKILL.MEMORY]: {
        name: "Memory",
        description: "Remembering all the embarrassing things you've done, but forgetting what you had for lunch yesterday."
    },
    [TYPES.SKILL.PERSUASION]: {
        name: "Persuasion",
        description: "Convincing someone that your completely unqualified opinion is actually a life-changing revelation."
    },
    [TYPES.SKILL.ORGANIZATION]: {
        name: "Organization",
        description: "Filing important documents in the 'I'll deal with it later' folder and never looking at them again."
    }
};

// Professional skills definitions
const professionalSkills = {
    [TYPES.PROF_SKILL.BUSINESS]: {
        name: "Business Acumen",
        description: "Knowing how to make a profit off other people's misery.",
        primaryCareerTracks: [TYPES.CAREER_TRACK.OFFICE]
    },
    [TYPES.PROF_SKILL.SPATIAL]: {
        name: "Spatial Awareness",
        description: "Not walking into glass doors at the office (again).",
        primaryCareerTracks: [TYPES.CAREER_TRACK.GEOGUESSR]
    },
    [TYPES.PROF_SKILL.CODING]: {
        name: "Coding",
        description: "Writing code that's so bad, it becomes sentient and starts fixing itself.",
        primaryCareerTracks: [TYPES.CAREER_TRACK.AI]
    },
    [TYPES.PROF_SKILL.DATA]: {
        name: "Data Analysis",
        description: "Making graphs that prove your point, even if the data doesn't.",
        primaryCareerTracks: [TYPES.CAREER_TRACK.AI, TYPES.CAREER_TRACK.PHYSICS]
    },
    [TYPES.PROF_SKILL.MATH]: {
        name: "Mathematical Reasoning",
        description: "Solving problems that make you question the meaning of life.",
        primaryCareerTracks: [TYPES.CAREER_TRACK.PHYSICS]
    },
    [TYPES.PROF_SKILL.MEDIA]: {
        name: "Media Production",
        description: "Making cringe-worthy videos of yourself dancing in your room, all in the name of 'branding' and 'engagement.'",
        primaryCareerTracks: [TYPES.CAREER_TRACK.INFLUENCER]
    },
    [TYPES.PROF_SKILL.MARKETING]: {
        name: "Marketing",
        description: "Mastering the art of convincing people they need your product...",
        primaryCareerTracks: [TYPES.CAREER_TRACK.INFLUENCER, TYPES.CAREER_TRACK.OFFICE]
    },
    [TYPES.PROF_SKILL.MYSTICAL]: {
        name: "Mystical Knowledge",
        description: "Understanding of occult concepts and magical systems.",
        primaryCareerTracks: [TYPES.CAREER_TRACK.MAGIC]
    },
    [TYPES.PROF_SKILL.NETWORKING]: {
        name: "Networking",
        description: "Making friends at work by complimenting their new shoes, then hoping they'll help you get that promotion you don't deserve.",
        primaryCareerTracks: [TYPES.CAREER_TRACK.OFFICE, TYPES.CAREER_TRACK.INFLUENCER]
    },
    [TYPES.PROF_SKILL.RESEARCH]: {
        name: "Research",
        description: "Spending hours on Reddit and calling it 'market analysis.'",
        primaryCareerTracks: [TYPES.CAREER_TRACK.PHYSICS, TYPES.CAREER_TRACK.AI, TYPES.CAREER_TRACK.MAGIC]
    }
};

// Career track definitions
const careerTracks = {
    [TYPES.CAREER_TRACK.OFFICE]: {
        name: "The Office Corporate Track",
        description: "A traditional office career focusing on business skills",
        tiers: [
            createCareerTier(
                "office_tier1",
                "Temp",
                "Ryans come and go. New ones come, old ones go.",
                15,
                {
                    generalSkills: {
                        [TYPES.SKILL.COMMUNICATION]: 5,
                        [TYPES.SKILL.ORGANIZATION]: 3
                    },
                    professionalSkills: {}
                }
            ),
            createCareerTier(
                "office_tier2",
                "Receptionist",
                "Dunder Mifflin, this is Pam.",
                18,
                {
                    generalSkills: {
                        [TYPES.SKILL.COMMUNICATION]: 10,
                        [TYPES.SKILL.ORGANIZATION]: 8,
                        [TYPES.SKILL.PATIENCE]: 5
                    },
                    professionalSkills: {}
                },
                "office_tier1",
                10
            ),
            createCareerTier(
                "office_tier3",
                "Sales Representative",
                "I'm not superstitious, but I am a little stitious.",
                22,
                {
                    generalSkills: {
                        [TYPES.SKILL.COMMUNICATION]: 15,
                        [TYPES.SKILL.PERSUASION]: 12,
                        [TYPES.SKILL.CHARISMA]: 10
                    },
                    professionalSkills: {
                        [TYPES.PROF_SKILL.BUSINESS]: 5,
                        [TYPES.PROF_SKILL.NETWORKING]: 3
                    }
                },
                "office_tier2",
                15
            ),
            createCareerTier(
                "office_tier4",
                "Assistant to the Regional Manager",
                "Bears. Beets. Battlestar Galactica.",
                30,
                {
                    generalSkills: {
                        [TYPES.SKILL.ORGANIZATION]: 18,
                        [TYPES.SKILL.DISCIPLINE]: 15,
                        [TYPES.SKILL.ADAPTABILITY]: 12
                    },
                    professionalSkills: {
                        [TYPES.PROF_SKILL.BUSINESS]: 10,
                        [TYPES.PROF_SKILL.NETWORKING]: 8
                    }
                },
                "office_tier3",
                20
            ),
            createCareerTier(
                "office_tier5",
                "Regional Manager",
                "Would I rather be feared or loved? Easy. Both.",
                45,
                {
                    generalSkills: {
                        [TYPES.SKILL.CONFIDENCE]: 20,
                        [TYPES.SKILL.COMMUNICATION]: 18
                    },
                    professionalSkills: {
                        [TYPES.PROF_SKILL.BUSINESS]: 15,
                        [TYPES.PROF_SKILL.NETWORKING]: 12,
                        [TYPES.PROF_SKILL.MARKETING]: 10
                    }
                },
                "office_tier4",
                25
            ),
            createCareerTier(
                "office_tier6",
                "Corporate Executive",
                "Sometimes I start a sentence and I don't even know where it's going.",
                75,
                {
                    generalSkills: {
                        [TYPES.SKILL.CRITICAL_THINKING]: 25,
                        [TYPES.SKILL.INTELLIGENCE]: 22,
                        [TYPES.SKILL.CHARISMA]: 20
                    },
                    professionalSkills: {
                        [TYPES.PROF_SKILL.BUSINESS]: 20,
                        [TYPES.PROF_SKILL.NETWORKING]: 18,
                        [TYPES.PROF_SKILL.MARKETING]: 15
                    }
                },
                "office_tier5",
                30)
            ]
        },
        [TYPES.CAREER_TRACK.GEOGUESSR]: {
            name: "GeoGuessr Track",
            description: "A digital exploration career focusing on observation skills",
            tiers: [
                createCareerTier(
                    "geo_tier1",
                    "Google Maps Tourist",
                    "Wait, which hemisphere am I in again?",
                    12,
                    {
                        generalSkills: {
                            [TYPES.SKILL.OBSERVATION]: 5,
                            [TYPES.SKILL.FOCUS]: 3
                        },
                        professionalSkills: {}
                    }
                ),
                createCareerTier(
                    "geo_tier2",
                    "Armchair Traveler",
                    "That's definitely Eastern Europe... or maybe Australia.",
                    16,
                    {
                        generalSkills: {
                            [TYPES.SKILL.OBSERVATION]: 12,
                            [TYPES.SKILL.MEMORY]: 8,
                            [TYPES.SKILL.FOCUS]: 7
                        },
                        professionalSkills: {
                            [TYPES.PROF_SKILL.SPATIAL]: 5
                        }
                    },
                    "geo_tier1",
                    10
                ),
                createCareerTier(
                    "geo_tier3",
                    "Digital Nomad",
                    "I recognize that KFC sign from three continents away.",
                    25,
                    {
                        generalSkills: {
                            [TYPES.SKILL.OBSERVATION]: 18,
                            [TYPES.SKILL.MEMORY]: 15,
                            [TYPES.SKILL.ADAPTABILITY]: 12
                        },
                        professionalSkills: {
                            [TYPES.PROF_SKILL.SPATIAL]: 10,
                            [TYPES.PROF_SKILL.RESEARCH]: 5
                        }
                    },
                    "geo_tier2",
                    15
                ),
                createCareerTier(
                    "geo_tier4",
                    "World Explorer",
                    "That's a Norwegian telephone pole if I've ever seen one.",
                    35,
                    {
                        generalSkills: {
                            [TYPES.SKILL.OBSERVATION]: 22,
                            [TYPES.SKILL.MEMORY]: 18,
                            [TYPES.SKILL.INTELLIGENCE]: 15
                        },
                        professionalSkills: {
                            [TYPES.PROF_SKILL.SPATIAL]: 15,
                            [TYPES.PROF_SKILL.RESEARCH]: 10
                        }
                    },
                    "geo_tier3",
                    20
                ),
                createCareerTier(
                    "geo_tier5",
                    "Geography Streamer",
                    "Don't forget to like and subscribe if you enjoy watching me stare at dirt roads.",
                    50,
                    {
                        generalSkills: {
                            [TYPES.SKILL.OBSERVATION]: 25,
                            [TYPES.SKILL.COMMUNICATION]: 20,
                            [TYPES.SKILL.CHARISMA]: 18
                        },
                        professionalSkills: {
                            [TYPES.PROF_SKILL.SPATIAL]: 20,
                            [TYPES.PROF_SKILL.MEDIA]: 15
                        }
                    },
                    "geo_tier4",
                    25
                ),
                createCareerTier(
                    "geo_tier6",
                    "Guezzard",
                    "I can tell you're in rural Thailand by the unique curvature of that puddle.",
                    70,
                    {
                        generalSkills: {
                            [TYPES.SKILL.OBSERVATION]: 30,
                            [TYPES.SKILL.INTELLIGENCE]: 22,
                            [TYPES.SKILL.MEMORY]: 20
                        },
                        professionalSkills: {
                            [TYPES.PROF_SKILL.SPATIAL]: 25,
                            [TYPES.PROF_SKILL.RESEARCH]: 18,
                            [TYPES.PROF_SKILL.MEDIA]: 10
                        }
                    },
                    "geo_tier5",
                    30
                )
            ]
        },
        [TYPES.CAREER_TRACK.AI]: {
            name: "AI Evolution Track",
            description: "A technology career focusing on intelligence and technical skills",
            tiers: [
                createCareerTier(
                    "ai_tier1",
                    "Code Monkey",
                    "I write the goddamn code!",
                    20,
                    {
                        generalSkills: {
                            [TYPES.SKILL.INTELLIGENCE]: 8,
                            [TYPES.SKILL.FOCUS]: 6,
                            [TYPES.SKILL.DISCIPLINE]: 5
                        },
                        professionalSkills: {
                            [TYPES.PROF_SKILL.CODING]: 3
                        }
                    }
                ),
                createCareerTier(
                    "ai_tier2",
                    "Machine Learning Engineer",
                    "It's not a bug, it's a feature.",
                    30,
                    {
                        generalSkills: {
                            [TYPES.SKILL.INTELLIGENCE]: 15,
                            [TYPES.SKILL.FOCUS]: 12,
                            [TYPES.SKILL.CRITICAL_THINKING]: 10
                        },
                        professionalSkills: {
                            [TYPES.PROF_SKILL.CODING]: 10,
                            [TYPES.PROF_SKILL.DATA]: 8
                        }
                    },
                    "ai_tier1",
                    10
                ),
                createCareerTier(
                    "ai_tier3",
                    "Neural Network Designer",
                    "My algorithm is basically just a fancy if-statement.",
                    45,
                    {
                        generalSkills: {
                            [TYPES.SKILL.INTELLIGENCE]: 20,
                            [TYPES.SKILL.CREATIVITY]: 15,
                            [TYPES.SKILL.CRITICAL_THINKING]: 15
                        },
                        professionalSkills: {
                            [TYPES.PROF_SKILL.CODING]: 15,
                            [TYPES.PROF_SKILL.DATA]: 12,
                            [TYPES.PROF_SKILL.RESEARCH]: 8
                        }
                    },
                    "ai_tier2",
                    15
                ),
                createCareerTier(
                    "ai_tier4",
                    "AI Ethics Officer",
                    "Don't worry, I've added an emergency off switch... somewhere.",
                    55,
                    {
                        generalSkills: {
                            [TYPES.SKILL.CRITICAL_THINKING]: 22,
                            [TYPES.SKILL.EMPATHY]: 18,
                            [TYPES.SKILL.COMMUNICATION]: 15
                        },
                        professionalSkills: {
                            [TYPES.PROF_SKILL.CODING]: 15,
                            [TYPES.PROF_SKILL.DATA]: 15,
                            [TYPES.PROF_SKILL.RESEARCH]: 12
                        }
                    },
                    "ai_tier3",
                    20
                ),
                createCareerTier(
                    "ai_tier5",
                    "Synthetic Intelligence Architect",
                    "It became self-aware at 2:14 a.m. Eastern time, August 29th.",
                    75,
                    {
                        generalSkills: {
                            [TYPES.SKILL.INTELLIGENCE]: 25,
                            [TYPES.SKILL.CREATIVITY]: 20,
                            [TYPES.SKILL.FOCUS]: 18
                        },
                        professionalSkills: {
                            [TYPES.PROF_SKILL.CODING]: 20,
                            [TYPES.PROF_SKILL.DATA]: 18,
                            [TYPES.PROF_SKILL.RESEARCH]: 15
                        }
                    },
                    "ai_tier4",
                    25
                ),
                createCareerTier(
                    "ai_tier6",
                    "AGI Creator",
                    "I promise this won't lead to a paperclip maximizer scenario.",
                    100,
                    {
                        generalSkills: {
                            [TYPES.SKILL.INTELLIGENCE]: 30,
                            [TYPES.SKILL.CREATIVITY]: 25,
                            [TYPES.SKILL.CRITICAL_THINKING]: 22
                        },
                        professionalSkills: {
                            [TYPES.PROF_SKILL.CODING]: 25,
                            [TYPES.PROF_SKILL.DATA]: 22,
                            [TYPES.PROF_SKILL.RESEARCH]: 20
                        }
                    },
                    "ai_tier5",
                    30
                )
            ]
        }
        // Additional career tracks can be added here using the same pattern
    };
    
    // Housing options with helper function for cleaner code
    const housingOptions = {
        [TYPES.HOUSING.HOMELESS]: createLifestyleOption(
            "Homeless", 
            { sleepTimeReduction: 0, mortalityReduction: 0 }, 
            0
        ),
        [TYPES.HOUSING.TENT]: createLifestyleOption(
            "Tent", 
            { sleepTimeReduction: 0.1, mortalityReduction: 0.05 }, 
            5
        ),
        [TYPES.HOUSING.TRAILER]: createLifestyleOption(
            "Trailer Park", 
            { sleepTimeReduction: 0.15, mortalityReduction: 0.1 }, 
            15, 
            { kudos: 500 }
        ),
        [TYPES.HOUSING.FLAT]: createLifestyleOption(
            "Flat", 
            { sleepTimeReduction: 0.2, mortalityReduction: 0.15 }, 
            25, 
            { kudos: 2000 }
        ),
        [TYPES.HOUSING.TINY]: createLifestyleOption(
            "Tiny House", 
            { sleepTimeReduction: 0.25, mortalityReduction: 0.15 }, 
            35, 
            { kudos: 5000 }
        ),
        [TYPES.HOUSING.LUXURY]: createLifestyleOption(
            "Luxury Apartment", 
            { sleepTimeReduction: 0.3, mortalityReduction: 0.2 }, 
            50, 
            { kudos: 10000 }
        ),
        [TYPES.HOUSING.TOWNHOUSE]: createLifestyleOption(
            "Small Town House", 
            { sleepTimeReduction: 0.35, mortalityReduction: 0.25 }, 
            80, 
            { kudos: 25000 }
        ),
        [TYPES.HOUSING.VILLA]: createLifestyleOption(
            "City Villa", 
            { sleepTimeReduction: 0.4, mortalityReduction: 0.35 }, 
            120, 
            { kudos: 50000 }
        ),
        [TYPES.HOUSING.CASTLE]: createLifestyleOption(
            "Castle", 
            { sleepTimeReduction: 0.5, mortalityReduction: 0.45 }, 
            200, 
            { kudos: 100000 }
        )
    };
    
    // Transportation options with helper function
    const transportOptions = {
        [TYPES.TRANSPORT.FOOT]: createLifestyleOption(
            "On Foot", 
            { commuteTimeReduction: 0 }, 
            0
        ),
        [TYPES.TRANSPORT.BIKE]: createLifestyleOption(
            "Bicycle", 
            { commuteTimeReduction: 0.2 }, 
            10, 
            { kudos: 300 }
        ),
        [TYPES.TRANSPORT.PUBLIC]: createLifestyleOption(
            "Public Transport", 
            { commuteTimeReduction: 0.4 }, 
            20, 
            { kudos: 1500 }
        ),
        [TYPES.TRANSPORT.CAR]: createLifestyleOption(
            "Car", 
            { commuteTimeReduction: 0.6 }, 
            40, 
            { kudos: 8000 }
        ),
        [TYPES.TRANSPORT.HYPERLOOP]: createLifestyleOption(
            "Hyperloop", 
            { commuteTimeReduction: 0.8 }, 
            80, 
            { kudos: 30000 }
        ),
        [TYPES.TRANSPORT.HELICOPTER]: createLifestyleOption(
            "Helicopter", 
            { commuteTimeReduction: 0.9 }, 
            150, 
            { housing: TYPES.HOUSING.CASTLE, kudos: 80000 }
        ),
        [TYPES.TRANSPORT.TELEPORT]: createLifestyleOption(
            "Teleportation", 
            { commuteTimeReduction: 1.0 }, 
            300, 
            { carrierTrackComplete: [TYPES.CAREER_TRACK.PHYSICS, TYPES.CAREER_TRACK.AI], kudos: 200000 }
        )
    };
    
    // Food options with helper function
    const foodOptions = {
        [TYPES.FOOD.HOMELESS]: createLifestyleOption(
            "Homeless Shelter", 
            { mealTimeReduction: 0, mortalityReduction: 0 }, 
            0
        ),
        [TYPES.FOOD.STAMPS]: createLifestyleOption(
            "Food Stamps", 
            { mealTimeReduction: 0.25, mortalityReduction: -0.05 }, 
            5
        ),
        [TYPES.FOOD.FAST]: createLifestyleOption(
            "Fast Food", 
            { mealTimeReduction: 0.88, mortalityReduction: -0.1 }, 
            15, 
            { kudos: 1000 }
        ),
        [TYPES.FOOD.COOKED]: createLifestyleOption(
            "Self Cooked", 
            { mealTimeReduction: 0.5, mortalityReduction: 0.15 }, 
            25, 
            { 
                housing: [
                    TYPES.HOUSING.FLAT, 
                    TYPES.HOUSING.TINY, 
                    TYPES.HOUSING.LUXURY, 
                    TYPES.HOUSING.TOWNHOUSE, 
                    TYPES.HOUSING.VILLA, 
                    TYPES.HOUSING.CASTLE
                ], 
                kudos: 5000 
            }
        ),
        [TYPES.FOOD.CHEF]: createLifestyleOption(
            "Personal Chef", 
            { mealTimeReduction: 0.75, mortalityReduction: 0.25 }, 
            60, 
            { 
                housing: [
                    TYPES.HOUSING.LUXURY, 
                    TYPES.HOUSING.TOWNHOUSE, 
                    TYPES.HOUSING.VILLA, 
                    TYPES.HOUSING.CASTLE
                ], 
                kudos: 20000 
            }
        )
    };
    
    // Export all data models
    const GameData = {
        types: TYPES,
        skills: {
            general: generalSkills,
            professional: professionalSkills
        },
        careers: careerTracks,
        lifestyle: {
            housing: housingOptions,
            transport: transportOptions,
            food: foodOptions
        },
        
        // Helper functions that might be useful in the game logic
        getCareerTrack(trackId) {
            return this.careers[trackId];
        },
        
        getCareerTier(trackId, tierId) {
            const track = this.getCareerTrack(trackId);
            return track ? track.tiers.find(tier => tier.id === tierId) : null;
        },
        
        getSkill(skillId) {
            return this.skills.general[skillId] || this.skills.professional[skillId];
        },
        
        getHousingOption(housingId) {
            return this.lifestyle.housing[housingId];
        },
        
        getTransportOption(transportId) {
            return this.lifestyle.transport[transportId];
        },
        
        getFoodOption(foodId) {
            return this.lifestyle.food[foodId];
        },
        
        // Check if requirements are met
        meetsRequirements(requirements, playerState) {
            if (!requirements || Object.keys(requirements).length === 0) {
                return true;
            }
            
            // Check kudos requirement
            if (requirements.kudos && playerState.kudos < requirements.kudos) {
                return false;
            }
            
            // Check housing requirement
            if (requirements.housing) {
                const requiredHousing = Array.isArray(requirements.housing) 
                    ? requirements.housing 
                    : [requirements.housing];
                
                if (!requiredHousing.includes(playerState.housing)) {
                    return false;
                }
            }
            
            // Check career track completion
            if (requirements.carrierTrackComplete) {
                const requiredTracks = Array.isArray(requirements.carrierTrackComplete)
                    ? requirements.carrierTrackComplete
                    : [requirements.carrierTrackComplete];
                
                for (const trackId of requiredTracks) {
                    if (!playerState.completedCareerTracks.includes(trackId)) {
                        return false;
                    }
                }
            }
            
            // Check previous job requirement
            if (requirements.previousJob && playerState.currentJob !== requirements.previousJob) {
                return false;
            }
            
            // Check previous job level requirement
            if (requirements.previousJobLevel && playerState.jobLevel < requirements.previousJobLevel) {
                return false;
            }
            
            // Check general skills requirements
            if (requirements.generalSkills) {
                for (const [skillId, requiredLevel] of Object.entries(requirements.generalSkills)) {
                    if (!playerState.skills[skillId] || playerState.skills[skillId] < requiredLevel) {
                        return false;
                    }
                }
            }
            
            // Check professional skills requirements
            if (requirements.professionalSkills) {
                for (const [skillId, requiredLevel] of Object.entries(requirements.professionalSkills)) {
                    if (!playerState.skills[skillId] || playerState.skills[skillId] < requiredLevel) {
                        return false;
                    }
                }
            }
            
            return true;
        }
    };
    
    // Example usage:
    // const playerState = {
    //     kudos: 5000,
    //     housing: TYPES.HOUSING.FLAT,
    //     skills: {
    //         [TYPES.SKILL.FOCUS]: 10,
    //         [TYPES.SKILL.INTELLIGENCE]: 12,
    //         [TYPES.PROF_SKILL.CODING]: 8
    //     },
    //     currentJob: "ai_tier1",
    //     jobLevel: 12,
    //     completedCareerTracks: []
    // };
    // 
    // // Check if player can upgrade housing
    // const canUpgradeToTiny = GameData.meetsRequirements(
    //     GameData.getHousingOption(TYPES.HOUSING.TINY).requirements,
    //     playerState
    // );
    //
    // // Get next career tier requirements
    // const nextTier = GameData.getCareerTier(TYPES.CAREER_TRACK.AI, "ai_tier2");
    // const canAdvanceCareer = GameData.meetsRequirements(nextTier.requirements, playerState);
    

    // At the bottom of game-data.js, add:
export { TYPES };
export default GameData;