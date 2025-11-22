from flask import Blueprint, request, jsonify
from app.config import Config
from app.utils.auth import token_required
from app.utils.validators import validate_required_fields, validate_date

bp = Blueprint('mothers', __name__)

@bp.route('', methods=['GET'])
@token_required
def get_mothers():
    """Get all mothers"""
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT m.*, u.full_name, u.email, u.phone
            FROM mothers m
            JOIN users u ON m.user_id = u.user_id
        """)
        
        mothers = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': mothers
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/<int:mother_id>', methods=['GET'])
@token_required
def get_mother(mother_id):
    """Get single mother by ID"""
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT m.*, u.full_name, u.email, u.phone
            FROM mothers m
            JOIN users u ON m.user_id = u.user_id
            WHERE m.mother_id = %s
        """, (mother_id,))
        
        mother = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not mother:
            return jsonify({'success': False, 'message': 'Mother not found'}), 404
        
        return jsonify({
            'success': True,
            'data': mother
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('', methods=['POST'])
@token_required
def create_mother():
    """Create mother profile"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['user_id', 'pregnancy_stage', 'expected_delivery']
    is_valid, error_message = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'success': False, 'message': error_message}), 400
    
    # Validate date
    if not validate_date(data['expected_delivery']):
        return jsonify({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO mothers (user_id, age, blood_group, pregnancy_stage, 
                               expected_delivery, location, medical_conditions, emergency_contact)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['user_id'],
            data.get('age'),
            data.get('blood_group'),
            data['pregnancy_stage'],
            data['expected_delivery'],
            data.get('location'),
            data.get('medical_conditions'),
            data.get('emergency_contact')
        ))
        
        conn.commit()
        mother_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Mother profile created successfully',
            'mother_id': mother_id
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/<int:mother_id>', methods=['PUT'])
@token_required
def update_mother(mother_id):
    """Update mother profile"""
    data = request.get_json()
    
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        # Build update query dynamically
        update_fields = []
        values = []
        
        allowed_fields = ['age', 'blood_group', 'pregnancy_stage', 'expected_delivery', 
                         'location', 'medical_conditions', 'emergency_contact']
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])
        
        if not update_fields:
            return jsonify({'success': False, 'message': 'No fields to update'}), 400
        
        values.append(mother_id)
        query = f"UPDATE mothers SET {', '.join(update_fields)} WHERE mother_id = %s"
        
        cursor.execute(query, values)
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({'success': False, 'message': 'Mother not found'}), 404
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Mother profile updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

