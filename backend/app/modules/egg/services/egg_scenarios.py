SCENARIOS = {
    "healthy": {
        "label": "Healthy Eggs",
        "questions": [
            {
                "id": "hours_since_spawn",
                "text": "How many hours ago did spawning occur?",
                "options": ["<12", "12-24", "24-48", "48-72", ">72"]
            },
            {
                "id": "fanning",
                "text": "Are both parents actively fanning the eggs?",
                "options": ["both", "one", "none"]
            },
            {
                "id": "temperature",
                "text": "What is the current water temperature?",
                "options": ["<26", "26-28", "28-30", "30-31", ">31"]
            },
            {
                "id": "disturbance",
                "text": "Have there been disturbances near the tank?",
                "options": ["none", "once", "2-3", "many"]
            },
            {
                "id": "temp_stability",
                "text": "Has the temperature been stable?",
                "options": ["stable", "minor", "major"]
            },
            {
                "id": "lighting",
                "text": "What is the lighting condition?",
                "options": ["dim", "normal", "bright"]
            },
            {
                "id": "white_eggs",
                "text": "Are there white eggs visible?",
                "options": ["none", "1-5", "some"]
            }
        ]
    },

    "unhealthy": {
        "label": "Unhealthy Eggs",
        "questions": [
            {
                "id": "hours_since_spawn",
                "text": "How many hours ago did spawning occur?",
                "options": ["<12", "12-24", "24-48", "48-72", ">72"]
            },
            {
                "id": "white_percentage",
                "text": "What percentage of eggs are white?",
                "options": ["<20", "20-50", "50-80", ">80"]
            },
            {
                "id": "parents",
                "text": "Are parents attending the eggs?",
                "options": ["both", "one", "none"]
            },
            {
                "id": "first_spawn",
                "text": "Is this first spawn?",
                "options": ["yes", "successful_before", "failed_before"]
            },
            {
                "id": "disturbance",
                "text": "Any disturbances?",
                "options": ["none", "once", "multiple"]
            },
            {
                "id": "temp_stability",
                "text": "Temperature stability?",
                "options": ["stable", "minor", "major"]
            },
            {
                "id": "temperature",
                "text": "Current temperature?",
                "options": ["<26", "26-28", "28-30", ">30"]
            },
            {
                "id": "pattern",
                "text": "Where are white eggs located?",
                "options": ["corner", "scattered", "center_spread"]
            }
        ]
    },

    "mixed": {
        "label": "Mixed Clutch",
        "questions": [
            {
                "id": "hours",
                "text": "How many hours since spawning?",
                "options": ["<12", "12-24", "24-48", "48-72"]
            },
            {
                "id": "trend",
                "text": "Are white eggs increasing?",
                "options": ["first_time", "same", "increasing", "decreasing"]
            },
            {
                "id": "percentage",
                "text": "White egg percentage?",
                "options": ["<20", "20-40", "40-60", ">60"]
            },
            {
                "id": "removal",
                "text": "Are parents removing bad eggs?",
                "options": ["active", "sometimes", "none"]
            },
            {
                "id": "fanning",
                "text": "Are parents fanning?",
                "options": ["both", "one", "none"]
            },
            {
                "id": "fungus",
                "text": "Any fuzzy growth?",
                "options": ["no", "yes"]
            },
            {
                "id": "temperature",
                "text": "Temperature?",
                "options": ["<28", "28-30", ">30"]
            },
            {
                "id": "disturbance",
                "text": "Disturbances?",
                "options": ["none", "yes"]
            }
        ]
    },

    "fungal": {
        "label": "Fungal Infection",
        "questions": [
            {
                "id": "hours",
                "text": "When did fungal appear?",
                "options": ["<24", "24-48", "48-72", ">72"]
            },
            {
                "id": "spread",
                "text": "How much affected?",
                "options": ["<10", "10-30", "30-60", ">60"]
            },
            {
                "id": "parents",
                "text": "Are parents present?",
                "options": ["both", "one", "none"]
            },
            {
                "id": "healthy_left",
                "text": "Healthy eggs remaining?",
                "options": ["many", "few", "none"]
            },
            {
                "id": "treatment",
                "text": "Any antifungal treatment?",
                "options": ["no", "yes", "not_working"]
            },
            {
                "id": "temperature",
                "text": "Temperature?",
                "options": ["<26", "26-28", "28-30", ">30"]
            },
            {
                "id": "water_flow",
                "text": "Water movement?",
                "options": ["good", "aeration_only", "poor"]
            },
            {
                "id": "cause",
                "text": "Recent disturbance/water change?",
                "options": ["none", "disturbance", "water_change"]
            }
        ]
    }
}