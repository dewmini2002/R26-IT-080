from pydantic import BaseModel
from typing import Optional


class ReadinessRequest(BaseModel):
    # Stage 1: Scenario identification
    fish_count: str
    gender_status: Optional[str] = None
    pair_behavior: Optional[str] = None
    previous_spawning: Optional[str] = None

    # Stage 2: Breeding behaviour
    cleaning_surface: Optional[str] = None
    territorial_behavior: Optional[str] = None
    aggression_level: Optional[str] = None
    breeding_tubes_visible: Optional[str] = None

    # Stage 3: Health and environment
    appetite: Optional[str] = None
    disease_signs: Optional[str] = None
    activity_level: Optional[str] = None
    tank_disturbance: Optional[str] = None

    # Stage 4: Tank setup
    separate_breeding_tank: Optional[str] = None
    breeding_surface_available: Optional[str] = None

    # Stage 5: Water parameters
    temperature: Optional[float] = None
    ph: Optional[float] = None
    tds: Optional[float] = None
    recent_water_change: Optional[str] = None