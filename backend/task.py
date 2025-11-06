from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone
from typing import Optional


NOW = datetime.now(timezone.utc)

class TaskIn(BaseModel):
    """Schema for validating incoming task data (only title required)."""
    title: str = Field(min_length=3)
    due_date: Optional[datetime] = None

    @field_validator('due_date', mode='before')
    @classmethod
    def validate_future_due_date(cls, value):
        """Ensures the due date is in the future, if provided."""

        # If the value is None (optional field not provided), just return it.
        if value is None:
            return value

        if isinstance(value, str):
            value = datetime.fromisoformat(value)

        # Normalize to a timezone-aware object for a safe comparison
        if value.tzinfo is None:
            aware_value = value.replace(tzinfo=timezone.utc)
        else:
            aware_value = value.astimezone(timezone.utc)

        if aware_value <= datetime.now(timezone.utc):
            raise ValueError('Due date must be in the future.')

        return value


class Task(TaskIn):
    """Schema for the complete task object."""
    id: int
    completed: bool = False
    created_at: datetime = Field(default_factory=datetime.now)