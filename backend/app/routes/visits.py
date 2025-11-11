from flask import Blueprint, request, jsonify
from models.visit import Visit, db
from utils.validators import validate_date

# Create a blueprint for visits
visits_bp = Blueprint('visits_bp', __name__)

# ---------------------------
# CREATE a new visit
# ---------------------------
@visits_bp.route('/visits', methods=['POST'])
def create_visit():
    data = request.get_json()

    date = data.get('date')
    purpose = data.get('purpose')
    mother_id = data.get('mother_id')
    child_id = data.get('child_id')

    # Validate required fields
    if not purpose:
        return jsonify({'error': 'Purpose is required'}), 400

    # Optional date validation (if a date is provided)
    if date and not validate_date(date):
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    visit = Visit(
        date=date,
        purpose=purpose,
        mother_id=mother_id,
        child_id=child_id
    )

    db.session.add(visit)
    db.session.commit()

    return jsonify({
        'message': 'Visit created successfully',
        'visit': visit.to_dict()
    }), 201


# ---------------------------
# READ all visits
# ---------------------------
@visits_bp.route('/visits', methods=['GET'])
def get_all_visits():
    visits = Visit.query.all()
    return jsonify([v.to_dict() for v in visits]), 200


# ---------------------------
# READ one visit by ID
# ---------------------------
@visits_bp.route('/visits/<int:visit_id>', methods=['GET'])
def get_visit(visit_id):
    visit = Visit.query.get_or_404(visit_id)
    return jsonify(visit.to_dict()), 200


# ---------------------------
# UPDATE a visit
# ---------------------------
@visits_bp.route('/visits/<int:visit_id>', methods=['PUT'])
def update_visit(visit_id):
    visit = Visit.query.get_or_404(visit_id)
    data = request.get_json()

    # Update fields if provided
    visit.purpose = data.get('purpose', visit.purpose)
    visit.date = data.get('date', visit.date)
    visit.mother_id = data.get('mother_id', visit.mother_id)
    visit.child_id = data.get('child_id', visit.child_id)

    db.session.commit()

    return jsonify({
        'message': 'Visit updated successfully',
        'visit': visit.to_dict()
    }), 200


# ---------------------------
# DELETE a visit
# ---------------------------
@visits_bp.route('/visits/<int:visit_id>', methods=['DELETE'])
def delete_visit(visit_id):
    visit = Visit.query.get_or_404(visit_id)
    db.session.delete(visit)
    db.session.commit()
    return jsonify({'message': 'Visit deleted successfully'}), 200
