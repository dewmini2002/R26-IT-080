SCENARIOS = {

    # 🟢 HEALTHY
    "healthy": {
        "questions": [
            {
                "key": "hours",
                "question": "How many hours ago did spawning occur?",
                "options": ["<12", "12-24", "24-48", "48-72", ">72"]
            },
            {
                "key": "fanning",
                "question": "Are both parents actively fanning the eggs?",
                "options": ["both", "one", "none"]
            },
            {
                "key": "temperature",
                "question": "What is the current water temperature?",
                "options": ["<26", "26-28", "28-30", "30-31", ">31"]
            },
            {
                "key": "disturbance",
                "question": "Have there been disturbances near the tank?",
                "options": ["none", "once", "few", "many"]
            },
            {
                "key": "temp_stability",
                "question": "Has the temperature been stable?",
                "options": ["stable", "minor", "unstable"]
            },
            {
                "key": "lighting",
                "question": "What is the lighting condition?",
                "options": ["dark", "normal", "bright"]
            },
            {
                "key": "white_percentage",
                "question": "Are white eggs visible?",
                "options": ["none", "<20", "20-50", ">50"]
            }
        ]
    },

    # 🔴 UNHEALTHY
    "unhealthy": {
        "questions": [
            {
                "key": "hours",
                "question": "How many hours ago did spawning occur?",
                "options": ["<12", "12-24", "24-48", "48-72", ">72"]
            },
            {
                "key": "white_percentage",
                "question": "What percentage of eggs are white/opaque?",
                "options": ["<20", "20-50", "50-80", ">80"]
            },
            {
                "key": "parents",
                "question": "Are parents attending the eggs?",
                "options": ["both", "one", "none"]
            },
            {
                "key": "first_spawn",
                "question": "Is this the first spawn?",
                "options": ["yes", "no"]
            },
            {
                "key": "disturbance",
                "question": "Were there disturbances?",
                "options": ["none", "once", "multiple"]
            },
            {
                "key": "temp_stability",
                "question": "Has temperature been stable?",
                "options": ["stable", "minor", "unstable"]
            },
            {
                "key": "temperature",
                "question": "What is current temperature?",
                "options": ["<26", "26-28", "28-30", ">30"]
            },
            {
                "key": "distribution",
                "question": "How are white eggs distributed?",
                "options": ["localized", "scattered", "center_spread"]
            }
        ]
    },

    # 🟡 MIXED
    "mixed": {
        "questions": [
            {
                "key": "hours",
                "question": "How many hours ago did spawning occur?",
                "options": ["<12", "12-24", "24-48", "48-72"]
            },
            {
                "key": "trend",
                "question": "Are white eggs increasing?",
                "options": ["increasing", "same", "decreasing"]
            },
            {
                "key": "white_percentage",
                "question": "What percentage is white now?",
                "options": ["<20", "20-40", "40-60", ">60"]
            },
            {
                "key": "removal",
                "question": "Are parents removing white eggs?",
                "options": ["yes", "sometimes", "no"]
            },
            {
                "key": "fanning",
                "question": "Are parents fanning eggs?",
                "options": ["both", "one", "none"]
            },
            {
                "key": "fuzzy",
                "question": "Any fuzzy growth visible?",
                "options": ["no", "yes"]
            },
            {
                "key": "temperature",
                "question": "What is current temperature?",
                "options": ["<28", "28-30", ">30"]
            },
            {
                "key": "disturbance",
                "question": "Were there disturbances?",
                "options": ["none", "yes"]
            }
        ]
    },

    # 🟠 FUNGAL
    "fungal": {
        "questions": [
            {
                "key": "hours",
                "question": "How many hours ago did spawning occur?",
                "options": ["<24", "24-48", "48-72", ">72"]
            },
            {
                "key": "spread",
                "question": "What percentage is affected by fungus?",
                "options": ["<10", "10-30", "30-60", ">60"]
            },
            {
                "key": "parents",
                "question": "Are parents attending eggs?",
                "options": ["both", "one", "none"]
            },
            {
                "key": "healthy_remaining",
                "question": "Are healthy eggs still visible?",
                "options": ["many", "few", "none"]
            },
            {
                "key": "treatment",
                "question": "Has antifungal treatment been applied?",
                "options": ["no", "yes", "not_working"]
            },
            {
                "key": "temperature",
                "question": "What is current temperature?",
                "options": ["<26", "26-28", "28-30", ">30"]
            },
            {
                "key": "aeration",
                "question": "Water flow/aeration condition?",
                "options": ["good", "moderate", "low"]
            },
            {
                "key": "disturbance",
                "question": "Any disturbance or water change?",
                "options": ["none", "disturbance", "water_change"]
            },
            {
                "key": "fuzzy",
                "question": "Is fungal fuzz clearly visible?",
                "options": ["yes", "no"]
            }
        ]
    }
}