from flask import Blueprint, request, jsonify
from app.config import Config
from app.utils.auth import hash_password, verify_password, create_token
from app.utils.validators import validate_email, validate_required_fields

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    required_fields = ['full_name', 'email', 'password', 'role']
    is_valid, error_message = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'success': False, 'message': error_message}), 400
    
    # Validate email format
    if not validate_email(data['email']):
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400
    
    # Validate role
    if data['role'] not in ['mother', 'health_worker', 'admin']:
        return jsonify({'success': False, 'message': 'Invalid role'}), 400
    
    # Check password length
    if len(data['password']) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
    
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        # Check if email already exists
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({'success': False, 'message': 'Email already registered'}), 400
        
        # Hash password
        password_hash = hash_password(data['password'])
        
        # Insert user
        cursor.execute("""
            INSERT INTO users (full_name, email, phone, password_hash, role)
            VALUES (%s, %s, %s, %s, %s)
        """, (data['full_name'], data['email'], data.get('phone'), password_hash, data['role']))
        
        conn.commit()
        user_id = cursor.lastrowid
        
        # Create token
        token = create_token(user_id, data['role'])
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'user_id': user_id,
                'full_name': data['full_name'],
                'email': data['email'],
                'role': data['role']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password']
    is_valid, error_message = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'success': False, 'message': error_message}), 400
    
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        # Get user by email
        cursor.execute("""
            SELECT user_id, full_name, email, password_hash, role, phone
            FROM users WHERE email = %s
        """, (data['email'],))
        
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
        
        # Verify password
        if not verify_password(data['password'], user['password_hash']):
            return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
        
        # Create token
        token = create_token(user['user_id'], user['role'])
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'user': {
                'user_id': user['user_id'],
                'full_name': user['full_name'],
                'email': user['email'],
                'role': user['role'],
                'phone': user['phone']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
