from pydantic import BaseModel


class SpawnContext(BaseModel):
    hours_since_spawn: float
    temperature: float
    tds: float
    parents_present: bool