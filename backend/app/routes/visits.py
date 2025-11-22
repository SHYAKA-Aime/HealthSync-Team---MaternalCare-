from flask import Blueprint, request, jsonify
from app.config import Config
from app.utils.auth import token_required
from app.utils.validators import validate_required_fields, validate_date

bp = Blueprint('visits', __name__)

@bp.route('', methods=['GET'])
@token_required
def get_visits():
    """Get all visits with optional status filter"""
    try:
        status_filter = request.args.get('status')
        
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT v.*, m.user_id, u.full_name as mother_name
            FROM visits v
            JOIN mothers m ON v.mother_id = m.mother_id
            JOIN users u ON m.user_id = u.user_id
        """
        
        params = []
        if status_filter and status_filter in ['scheduled', 'completed', 'cancelled']:
            query += " WHERE v.status = %s"
            params.append(status_filter)
        
        query += " ORDER BY v.visit_date DESC"
        
        cursor.execute(query, tuple(params) if params else None)
        
        visits = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': visits
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/<int:visit_id>', methods=['GET'])
@token_required
def get_visit(visit_id):
    """Get single visit"""
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM visits WHERE visit_id = %s", (visit_id,))
        visit = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not visit:
            return jsonify({'success': False, 'message': 'Visit not found'}), 404
        
        return jsonify({
            'success': True,
            'data': visit
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/mother/<int:mother_id>', methods=['GET'])
@token_required
def get_mother_visits(mother_id):
    """Get all visits for a specific mother"""
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM visits 
            WHERE mother_id = %s 
            ORDER BY visit_date DESC
        """, (mother_id,))
        
        visits = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': visits
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('', methods=['POST'])
@token_required
def create_visit():
    """Create visit record"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['mother_id', 'visit_date', 'visit_type']
    is_valid, error_message = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'success': False, 'message': error_message}), 400
    
    # Validate date
    if not validate_date(data['visit_date']):
        return jsonify({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Validate visit type
    if data['visit_type'] not in ['antenatal', 'postnatal', 'general']:
        return jsonify({'success': False, 'message': 'Invalid visit type'}), 400
    
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO visits (mother_id, hw_id, visit_date, visit_type, status, weight, blood_pressure, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['mother_id'],
            data.get('hw_id'),
            data['visit_date'],
            data['visit_type'],
            data.get('status', 'scheduled'),  # Default to 'scheduled'
            data.get('weight'),
            data.get('blood_pressure'),
            data.get('notes')
        ))
        
        conn.commit()
        visit_id = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Visit recorded successfully',
            'visit_id': visit_id
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/<int:visit_id>/status', methods=['PATCH'])
@token_required
def update_visit_status(visit_id):
    """Update visit status"""
    data = request.get_json()
    
    # Validate required fields
    if 'status' not in data:
        return jsonify({'success': False, 'message': 'Status is required'}), 400
    
    # Validate status value
    if data['status'] not in ['scheduled', 'completed', 'cancelled']:
        return jsonify({'success': False, 'message': 'Invalid status value'}), 400
    
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        # Check if visit exists
        cursor.execute("SELECT visit_id FROM visits WHERE visit_id = %s", (visit_id,))
        visit = cursor.fetchone()
        
        if not visit:
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Visit not found'}), 404
        
        # Update status
        cursor.execute("""
            UPDATE visits 
            SET status = %s 
            WHERE visit_id = %s
        """, (data['status'], visit_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Visit status updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500