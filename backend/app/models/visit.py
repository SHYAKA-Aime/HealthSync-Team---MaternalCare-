# app/models/visit.py

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Visit(db.Model):
    __tablename__ = 'visits'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    purpose = db.Column(db.String(200), nullable=False)
    mother_id = db.Column(db.Integer, db.ForeignKey('mothers.id'), nullable=True)
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'), nullable=True)

    # Relationships
    mother = db.relationship('Mother', backref='visits', lazy=True)
    child = db.relationship('Child', backref='visits', lazy=True)

    def __repr__(self):
        return f"<Visit {self.id} - {self.purpose}>"

    def to_dict(self):
        """Return dictionary representation for easy JSON conversion"""
        return {
            'id': self.id,
            'date': self.date.strftime("%Y-%m-%d %H:%M:%S"),
            'purpose': self.purpose,
            'mother_id': self.mother_id,
            'child_id': self.child_id
        }