from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from models.child import ChildCreate, ChildUpdate, Child, MedicalRecord
from models.user import User
from auth import get_current_active_user

router = APIRouter(prefix="/children", tags=["children"])


@router.post("/", response_model=Child, status_code=status.HTTP_201_CREATED)
async def create_child(
    child: ChildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new child record linked to a mother
    """
    # Verify mother exists (you might want to add this check)
    # mother = db.query(Mother).filter(Mother.id == child.mother_id).first()
    # if not mother:
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail="Mother not found"
    #     )
    
    # Check if user has permission to access this mother's data
    # This would depend on your authorization logic
    
    db_child = ChildInDB(
        **child.dict(),
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    
    return db_child


@router.get("/", response_model=List[Child])
async def get_children(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    mother_id: Optional[int] = Query(None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all children, optionally filtered by mother_id
    """
    query = db.query(ChildInDB)
    
    if mother_id:
        query = query.filter(ChildInDB.mother_id == mother_id)
    
    children = query.offset(skip).limit(limit).all()
    return children


@router.get("/{child_id}", response_model=Child)
async def get_child(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific child by ID
    """
    child = db.query(ChildInDB).filter(ChildInDB.id == child_id).first()
    
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )
    
    # Add authorization check here based on your business logic
    # Example: verify current user has access to this child's data
    
    return child


@router.put("/{child_id}", response_model=Child)
async def update_child(
    child_id: int,
    child_update: ChildUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a child's information
    """
    db_child = db.query(ChildInDB).filter(ChildInDB.id == child_id).first()
    
    if not db_child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )
    
    # Authorization check
    # Verify current user has permission to update this child
    
    update_data = child_update.dict(exclude_unset=True)
    update_data['updated_at'] = datetime.now()
    
    for field, value in update_data.items():
        setattr(db_child, field, value)
    
    db.commit()
    db.refresh(db_child)
    
    return db_child


@router.delete("/{child_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_child(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a child record
    """
    db_child = db.query(ChildInDB).filter(ChildInDB.id == child_id).first()
    
    if not db_child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )
    
    # Authorization check
    # Verify current user has permission to delete this child
    
    db.delete(db_child)
    db.commit()
    
    return None


@router.post("/{child_id}/medical-records", response_model=MedicalRecord)
async def add_medical_record(
    child_id: int,
    medical_record: MedicalRecord,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Add a medical record for a child
    """
    child = db.query(ChildInDB).filter(ChildInDB.id == child_id).first()
    
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )
    
    # Authorization check
    
    db_medical_record = MedicalRecord(
        **medical_record.dict(),
        child_id=child_id,
        record_date=datetime.now()
    )
    
    db.add(db_medical_record)
    db.commit()
    db.refresh(db_medical_record)
    
    return db_medical_record


@router.get("/{child_id}/medical-records", response_model=List[MedicalRecord])
async def get_medical_records(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all medical records for a child
    """
    child = db.query(ChildInDB).filter(ChildInDB.id == child_id).first()
    
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )
    
    # Authorization check
    
    return child.medical_records


@router.get("/mother/{mother_id}", response_model=List[Child])
async def get_children_by_mother(
    mother_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all children for a specific mother
    """
    # Verify mother exists and user has access
    # mother = db.query(Mother).filter(Mother.id == mother_id).first()
    # if not mother:
    #     raise HTTPException(status_code=404, detail="Mother not found")
    
    children = db.query(ChildInDB).filter(ChildInDB.mother_id == mother_id).all()
    return children
