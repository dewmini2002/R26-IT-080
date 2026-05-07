from pydantic import BaseModel

class SpawnContext(BaseModel):
    hours_since_spawn: int
    temperature: float
    tds: float
    ph: float
    parents_present: bool = True