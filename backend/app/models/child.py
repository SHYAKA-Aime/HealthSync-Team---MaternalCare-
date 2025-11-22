from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from enum import Enum


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"


class BirthType(str, Enum):
    NORMAL = "normal"
    CESAREAN = "cesarean"
    ASSISTED = "assisted"


class ChildBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100, description="Child's first name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Child's last name")
    gender: Gender
    date_of_birth: datetime
    birth_weight: float = Field(..., gt=0, description="Birth weight in kg")
    birth_height: float = Field(..., gt=0, description="Birth height in cm")
    birth_type: BirthType
    apgar_score: int = Field(..., ge=0, le=10, description="APGAR score (0-10)")
    blood_type: Optional[str] = Field(None, regex='^(A|B|AB|O)[+-]$', description="Blood type (e.g., A+, O-)")
    
    @validator('date_of_birth')
    def date_of_birth_cannot_be_future(cls, v):
        if v > datetime.now():
            raise ValueError('Date of birth cannot be in the future')
        return v


class ChildCreate(ChildBase):
    mother_id: int = Field(..., gt=0, description="ID of the mother")


class ChildUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    birth_weight: Optional[float] = Field(None, gt=0)
    birth_height: Optional[float] = Field(None, gt=0)
    blood_type: Optional[str] = Field(None, regex='^(A|B|AB|O)[+-]$')


class MedicalRecord(BaseModel):
    id: int
    child_id: int
    record_date: datetime
    height: Optional[float] = None
    weight: Optional[float] = None
    temperature: Optional[float] = None
    heart_rate: Optional[int] = None
    blood_pressure: Optional[str] = None
    vaccinations: List[str] = []
    medications: List[str] = []
    allergies: List[str] = []
    conditions: List[str] = []
    notes: Optional[str] = None
    doctor_notes: Optional[str] = None
    
    class Config:
        from_attributes = True


class Child(ChildBase):
    id: int
    mother_id: int
    medical_records: List[MedicalRecord] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ChildInDB(Child):
    pass