# Central question bank (keys must match decision engine)

QUESTION_BANK = {
    "fanning": {
        "question": "Are the parents actively fanning the eggs?",
        "options": ["both", "one", "none"]
    },
    "fuzzy": {
        "question": "Do you see any fuzzy/cotton-like growth on eggs?",
        "options": ["no", "yes"]
    },
    "white_percentage": {
        "question": "What percentage of eggs are white/opaque?",
        "options": ["<20", "20-50", "50-80", ">80"]
    },
    "trend": {
        "question": "Compared to earlier, are white eggs increasing?",
        "options": ["increasing", "same", "decreasing"]
    },
    "removal": {
        "question": "Are parents removing dead (white) eggs?",
        "options": ["yes", "sometimes", "no"]
    },
    "lighting": {
        "question": "What is the lighting condition?",
        "options": ["dark", "normal", "bright"]
    },
    "temp_stability": {
        "question": "Has the temperature been stable?",
        "options": ["stable", "minor", "unstable"]
    },
    "spread": {
        "question": "How much of the clutch shows fungal spread?",
        "options": ["<10", "10-30", "30-60", ">60"]
    },
    "aeration": {
        "question": "What is the water flow/aeration level?",
        "options": ["good", "moderate", "low"]
    },
    "parents": {
        "question": "Are the parents present near the eggs?",
        "options": ["both", "one", "none"]
    }
}