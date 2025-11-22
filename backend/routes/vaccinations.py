from flask import Blueprint, jsonify, request
from app import db
from models.vaccination import Vaccination
from models.child import Child
from models.visit import Visit
from datetime import datetime

vaccinations_bp = Blueprint('vaccinations', __name__)

# ✅ CREATE Vaccination
@vaccinations_bp.route('/vaccinations', methods=['POST'])
def create_vaccination():
    data = request.get_json()
    try:
        new_vaccination = Vaccination(
            type=data['type'],
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            schedule=data.get('schedule'),
            child_id=data['child_id'],
            visit_id=data.get('visit_id')
        )
        db.session.add(new_vaccination)
        db.session.commit()
        return jsonify({"message": "Vaccination created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ✅ READ - Get all vaccinations
@vaccinations_bp.route('/vaccinations', methods=['GET'])
def get_all_vaccinations():
    vaccinations = Vaccination.query.all()
    result = []
    for v in vaccinations:
        result.append({
            "id": v.id,
            "type": v.type,
            "date": v.date.strftime('%Y-%m-%d'),
            "schedule": v.schedule,
            "child_id": v.child_id,
            "visit_id": v.visit_id
        })
    return jsonify(result), 200


# ✅ READ - Single vaccination
@vaccinations_bp.route('/vaccinations/<int:id>', methods=['GET'])
def get_vaccination(id):
    v = Vaccination.query.get_or_404(id)
    return jsonify({
        "id": v.id,
        "type": v.type,
        "date": v.date.strftime('%Y-%m-%d'),
        "schedule": v.schedule,
        "child_id": v.child_id,
        "visit_id": v.visit_id
    }), 200


# ✅ UPDATE Vaccination
@vaccinations_bp.route('/vaccinations/<int:id>', methods=['PUT'])
def update_vaccination(id):
    v = Vaccination.query.get_or_404(id)
    data = request.get_json()
    try:
        v.type = data.get('type', v.type)
        v.date = datetime.strptime(data.get('date', v.date.strftime('%Y-%m-%d')), '%Y-%m-%d').date()
        v.schedule = data.get('schedule', v.schedule)
        v.child_id = data.get('child_id', v.child_id)
        v.visit_id = data.get('visit_id', v.visit_id)
        db.session.commit()
        return jsonify({"message": "Vaccination updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ✅ DELETE Vaccination
@vaccinations_bp.route('/vaccinations/<int:id>', methods=['DELETE'])
def delete_vaccination(id):
    v = Vaccination.query.get_or_404(id)
    db.session.delete(v)
    db.session.commit()
    return jsonify({"message": "Vaccination deleted successfully"}), 200


# ✅ UPCOMING & OVERDUE alerts
@vaccinations_bp.route('/vaccinations/alerts', methods=['GET'])
def vaccination_alerts():
    all_vaccinations = Vaccination.query.all()
    upcoming = []
    overdue = []

    for v in all_vaccinations:
        if v.is_upcoming():
            upcoming.append({"type": v.type, "date": v.date.strftime('%Y-%m-%d')})
        elif v.is_overdue():
            overdue.append({"type": v.type, "date": v.date.strftime('%Y-%m-%d')})

    return jsonify({
        "upcoming_vaccinations": upcoming,
        "overdue_vaccinations": overdue
    }), 200
