from flask import Blueprint, request, jsonify
from app.config import Config
from app.utils.auth import token_required
from app.utils.validators import validate_required_fields, validate_date

bp = Blueprint('vaccinations', __name__)

@bp.route('', methods=['GET'])
@token_required
def get_vaccinations():
    """Get all vaccinations"""
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT v.*, c.full_name as child_name
            FROM vaccinations v
            JOIN children c ON v.child_id = c.child_id
            ORDER BY v.date_given DESC
        """)
        
        vaccinations = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': vaccinations
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/<int:vaccine_id>', methods=['GET'])
@token_required
def get_vaccination(vaccine_id):
    """Get single vaccination"""
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM vaccinations WHERE vaccine_id = %s", (vaccine_id,))
        vaccination = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not vaccination:
            return jsonify({'success': False, 'message': 'Vaccination not found'}), 404
        
        return jsonify({
            'success': True,
            'data': vaccination
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/child/<int:child_id>', methods=['GET'])
@token_required
def get_child_vaccinations(child_id):
    """Get all vaccinations for a specific child"""
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM vaccinations 
            WHERE child_id = %s 
            ORDER BY date_given DESC
        """, (child_id,))
        
        vaccinations = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': vaccinations
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('', methods=['POST'])
@token_required
def create_vaccination():
    """Record vaccination and automatically create next appointment visit"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['child_id', 'vaccine_name', 'date_given']
    is_valid, error_message = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'success': False, 'message': error_message}), 400
    
    # Validate dates
    if not validate_date(data['date_given']):
        return jsonify({'success': False, 'message': 'Invalid date_given format. Use YYYY-MM-DD'}), 400
    
    if 'next_due_date' in data and data['next_due_date']:
        if not validate_date(data['next_due_date']):
            return jsonify({'success': False, 'message': 'Invalid next_due_date format. Use YYYY-MM-DD'}), 400
    
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        # First, get the mother_id for this child
        cursor.execute("""
            SELECT mother_id FROM children WHERE child_id = %s
        """, (data['child_id'],))
        
        child_result = cursor.fetchone()
        
        if not child_result:
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Child not found'}), 404
        
        mother_id = child_result['mother_id']
        
        # Insert vaccination record
        cursor.execute("""
            INSERT INTO vaccinations (child_id, hw_id, vaccine_name, date_given, 
                                    next_due_date, administered_by, batch_number, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['child_id'],
            data.get('hw_id'),
            data['vaccine_name'],
            data['date_given'],
            data.get('next_due_date'),
            data.get('administered_by'),
            data.get('batch_number'),
            data.get('notes')
        ))
        
        vaccine_id = cursor.lastrowid
        
        # If next_due_date is provided, automatically create a visit appointment
        visit_id = None
        if data.get('next_due_date'):
            # Get child's name for the visit notes
            cursor.execute("""
                SELECT full_name FROM children WHERE child_id = %s
            """, (data['child_id'],))
            child_info = cursor.fetchone()
            child_name = child_info['full_name'] if child_info else "Child"
            
            # Create automatic visit appointment for next vaccination
            visit_notes = f"Next vaccination appointment for {child_name}: {data['vaccine_name']}"
            if data.get('notes'):
                visit_notes += f" | Vaccine notes: {data['notes']}"
            
            cursor.execute("""
                INSERT INTO visits (mother_id, hw_id, visit_date, visit_type, notes)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                mother_id,
                data.get('hw_id'),
                data['next_due_date'],
                'Postnatal',  # Using 'general' for vaccination follow-ups
                visit_notes
            ))
            
            visit_id = cursor.lastrowid
        
        conn.commit()
        cursor.close()
        conn.close()
        
        response_data = {
            'success': True,
            'message': 'Vaccination recorded successfully',
            'vaccine_id': vaccine_id
        }
        
        # Include visit_id in response if appointment was created
        if visit_id:
            response_data['visit_id'] = visit_id
            response_data['message'] += ' and next appointment scheduled'
        
        return jsonify(response_data), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500