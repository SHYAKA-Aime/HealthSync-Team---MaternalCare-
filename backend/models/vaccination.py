from datetime import datetime, timedelta
from app import db

class Vaccination(db.Model):
    __tablename__ = 'vaccinations'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    schedule = db.Column(db.String(100), nullable=True)

    # Relationships
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'), nullable=False)
    visit_id = db.Column(db.Integer, db.ForeignKey('visits.id'), nullable=True)

    def __repr__(self):
        return f"<Vaccination {self.type} on {self.date}>"

    def is_upcoming(self):
        """Return True if the vaccination date is within the next 7 days."""
        today = datetime.utcnow().date()
        return today <= self.date <= today + timedelta(days=7)

    def is_overdue(self):
        """Return True if the vaccination date is in the past."""
        return self.date < datetime.utcnow().date()
