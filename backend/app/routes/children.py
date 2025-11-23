from flask import Blueprint, request, jsonify
from app.config import Config
from app.utils.auth import token_required
from app.utils.validators import validate_required_fields, validate_date

bp = Blueprint('children', __name__)

@bp.route('', methods=['GET'])
@token_required
def get_children():
    """Get all children"""
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM children")
        children = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': children
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/<int:child_id>', methods=['GET'])
@token_required
def get_child(child_id):
    """Get single child by ID"""
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM children WHERE child_id = %s", (child_id,))
        child = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not child:
            return jsonify({'success': False, 'message': 'Child not found'}), 404
        
        return jsonify({
            'success': True,
            'data': child
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/mother/<int:mother_id>', methods=['GET'])
@token_required
def get_mother_children(mother_id):
    """Get all children for a specific mother"""
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM children WHERE mother_id = %s", (mother_id,))
        children = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': children
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('', methods=['POST'])
@token_required
def create_child():
    """Create child profile"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['mother_id', 'full_name', 'dob', 'gender']
    is_valid, error_message = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'success': False, 'message': error_message}), 400
    
    # Validate date
    if not validate_date(data['dob']):
        return jsonify({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Validate gender
    if data['gender'] not in ['male', 'female']:
        return jsonify({'success': False, 'message': 'Gender must be male or female'}), 400
    
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO children (mother_id, full_name, dob, gender, birth_weight, birth_height)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data['mother_id'],
            data['full_name'],
            data['dob'],
            data['gender'],
            data.get('birth_weight'),
            data.get('birth_height')
        ))
        
        conn.commit()
        child_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Child profile created successfully',
            'child_id': child_id
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/<int:child_id>', methods=['PUT'])
@token_required
def update_child(child_id):
    """Update child profile"""
    data = request.get_json()
    
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        # Build update query
        update_fields = []
        values = []
        
        allowed_fields = ['full_name', 'dob', 'gender', 'birth_weight', 'birth_height']
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])
        
        if not update_fields:
            return jsonify({'success': False, 'message': 'No fields to update'}), 400
        
        values.append(child_id)
        query = f"UPDATE children SET {', '.join(update_fields)} WHERE child_id = %s"
        
        cursor.execute(query, values)
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({'success': False, 'message': 'Child not found'}), 404
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Child profile updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
