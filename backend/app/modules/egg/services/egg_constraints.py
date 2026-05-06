def apply_biological_constraints(probabilities: dict, context):
    hours = context.hours_since_spawn

    adjusted = probabilities.copy()

    # ❗ fungus cannot appear too early
    if hours < 6:
        adjusted["fungal"] = 0

    # normalize again
    total = sum(adjusted.values())
    if total > 0:
        adjusted = {k: v / total for k, v in adjusted.items()}

    return adjusted