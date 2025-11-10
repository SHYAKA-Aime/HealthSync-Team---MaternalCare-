"""
Mothers API Routes - MaternalCare+ Application
RESTful endpoints for mother profile management
"""

from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
from datetime import datetime
from validators import MotherValidator
from models.mother import Mother
import os

# Create Blueprint
mothers_bp = Blueprint('mothers', __name__, url_prefix='/api/mothers')

# JWT Secret (should be in environment variables in production)
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')


# ============== Authentication Middleware ==============
def token_required(f):
    """
    Decorator to verify JWT token from request headers
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token format'
                }), 401
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Token is missing'
            }), 401
        
        try:
            # Decode token
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = {
                'user_id': data['user_id'],
                'email': data['email'],
                'role': data['role']
            }
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token has expired'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'message': 'Invalid token'
            }), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated


def role_required(allowed_roles):
    """
    Decorator to check if user has required role
    """
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user['role'] not in allowed_roles:
                return jsonify({
                    'success': False,
                    'message': 'Insufficient permissions'
                }), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator


# ============== Helper Function ==============
def get_db_connection():
    """
    Get database connection - Replace with your actual DB connection logic
    """
    import mysql.connector
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'maternalcare')
    )


# ============== Routes ==============

@mothers_bp.route('/register', methods=['POST'])
@token_required
def register_mother(current_user):
    """
    Register a new mother profile
    
    Request Body:
    {
        "first_name": "Jane",
        "last_name": "Doe",
        "date_of_birth": "1990-05-15",
        "phone_number": "+254712345678",
        "address": "123 Main St, Nairobi",
        "emergency_contact": "+254787654321",
        "blood_type": "O+",
        "current_pregnancy_status": "pregnant",
        "expected_delivery_date": "2025-08-20",
        "last_menstrual_period": "2024-11-15",
        "number_of_pregnancies": 2,
        "number_of_live_births": 1,
        "medical_conditions": "None",
        "allergies": "Penicillin",
        "clinic_id": 1
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        is_valid, errors = MotherValidator.validate_create(data)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': 'Validation failed',
                'errors': errors
            }), 400
        
        # Get DB connection
        db = get_db_connection()
        mother_model = Mother(db)
        
        # Create mother profile
        result = mother_model.create(current_user['user_id'], data)
        
        db.close()
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mothers_bp.route('/<int:mother_id>', methods=['GET'])
@token_required
def get_mother(current_user, mother_id):
    """
    Get mother profile by ID
    """
    try:
        db = get_db_connection()
        mother_model = Mother(db)
        
        mother = mother_model.get_by_id(mother_id)
        db.close()
        
        if mother:
            # Check if user has permission to view this profile
            if current_user['role'] == 'mother' and mother['user_id'] != current_user['user_id']:
                return jsonify({
                    'success': False,
                    'message': 'Access denied'
                }), 403
            
            return jsonify({
                'success': True,
                'mother': mother
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Mother not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mothers_bp.route('/profile', methods=['GET'])
@token_required
@role_required(['mother'])
def get_my_profile(current_user):
    """
    Get current user's mother profile
    """
    try:
        db = get_db_connection()
        mother_model = Mother(db)
        
        mother = mother_model.get_by_user_id(current_user['user_id'])
        db.close()
        
        if mother:
            return jsonify({
                'success': True,
                'mother': mother
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Profile not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mothers_bp.route('/<int:mother_id>', methods=['PUT'])
@token_required
def update_mother(current_user, mother_id):
    """
    Update mother profile
    
    Request Body: (all fields optional)
    {
        "phone_number": "+254712345678",
        "address": "New Address",
        "current_pregnancy_status": "postpartum",
        "medical_conditions": "Diabetes"
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        is_valid, errors = MotherValidator.validate_update(data)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': 'Validation failed',
                'errors': errors
            }), 400
        
        db = get_db_connection()
        mother_model = Mother(db)
        
        # Check permissions
        mother = mother_model.get_by_id(mother_id)
        if not mother:
            db.close()
            return jsonify({
                'success': False,
                'message': 'Mother not found'
            }), 404
        
        if current_user['role'] == 'mother' and mother['user_id'] != current_user['user_id']:
            db.close()
            return jsonify({
                'success': False,
                'message': 'Access denied'
            }), 403
        
        # Update profile
        result = mother_model.update(mother_id, data)
        db.close()
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mothers_bp.route('/<int:mother_id>', methods=['DELETE'])
@token_required
@role_required(['admin', 'health_worker'])
def delete_mother(current_user, mother_id):
    """
    Soft delete mother profile (admin/health worker only)
    """
    try:
        db = get_db_connection()
        mother_model = Mother(db)
        
        result = mother_model.delete(mother_id)
        db.close()
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mothers_bp.route('/', methods=['GET'])
@token_required
@role_required(['admin', 'health_worker'])
def get_all_mothers(current_user):
    """
    Get all mothers with filtering and pagination
    
    Query Parameters:
    - clinic_id: Filter by clinic (optional)
    - status: Filter by pregnancy status (optional)
    - page: Page number (default: 1)
    - per_page: Results per page (default: 20)
    """
    try:
        # Get query parameters
        clinic_id = request.args.get('clinic_id', type=int)
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        db = get_db_connection()
        mother_model = Mother(db)
        
        result = mother_model.get_all(
            clinic_id=clinic_id,
            status=status,
            page=page,
            per_page=per_page
        )
        
        db.close()
        
        return jsonify(result), 200
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mothers_bp.route('/<int:mother_id>/children', methods=['GET'])
@token_required
def get_mother_children(current_user, mother_id):
    """
    Get all children for a mother
    """
    try:
        db = get_db_connection()
        mother_model = Mother(db)
        
        # Check permissions
        mother = mother_model.get_by_id(mother_id)
        if not mother:
            db.close()
            return jsonify({
                'success': False,
                'message': 'Mother not found'
            }), 404
        
        if current_user['role'] == 'mother' and mother['user_id'] != current_user['user_id']:
            db.close()
            return jsonify({
                'success': False,
                'message': 'Access denied'
            }), 403
        
        children = mother_model.get_children(mother_id)
        db.close()
        
        return jsonify({
            'success': True,
            'children': children,
            'count': len(children)
        }), 200
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mothers_bp.route('/<int:mother_id>/visits', methods=['GET'])
@token_required
def get_mother_visits(current_user, mother_id):
    """
    Get recent visits for a mother
    
    Query Parameters:
    - limit: Maximum number of visits to return (default: 10)
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        
        db = get_db_connection()
        mother_model = Mother(db)
        
        # Check permissions
        mother = mother_model.get_by_id(mother_id)
        if not mother:
            db.close()
            return jsonify({
                'success': False,
                'message': 'Mother not found'
            }), 404
        
        if current_user['role'] == 'mother' and mother['user_id'] != current_user['user_id']:
            db.close()
            return jsonify({
                'success': False,
                'message': 'Access denied'
            }), 403
        
        visits = mother_model.get_visits(mother_id, limit)
        db.close()
        
        return jsonify({
            'success': True,
            'visits': visits,
            'count': len(visits)
        }), 200
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mothers_bp.route('/<int:mother_id>/summary', methods=['GET'])
@token_required
def get_pregnancy_summary(current_user, mother_id):
    """
    Get comprehensive pregnancy summary
    """
    try:
        db = get_db_connection()
        mother_model = Mother(db)
        
        # Check permissions
        mother = mother_model.get_by_id(mother_id)
        if not mother:
            db.close()
            return jsonify({
                'success': False,
                'message': 'Mother not found'
            }), 404
        
        if current_user['role'] == 'mother' and mother['user_id'] != current_user['user_id']:
            db.close()
            return jsonify({
                'success': False,
                'message': 'Access denied'
            }), 403
        
        summary = mother_model.get_pregnancy_summary(mother_id)
        db.close()
        
        if summary:
            return jsonify({
                'success': True,
                'summary': summary
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Unable to generate summary'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mothers_bp.route('/search', methods=['GET'])
@token_required
@role_required(['admin', 'health_worker'])
def search_mothers(current_user):
    """
    Search mothers by name, phone, or email
    
    Query Parameters:
    - q: Search query (required)
    - clinic_id: Filter by clinic (optional)
    """
    try:
        search_term = request.args.get('q', '').strip()
        clinic_id = request.args.get('clinic_id', type=int)
        
        if not search_term:
            return jsonify({
                'success': False,
                'message': 'Search query is required'
            }), 400
        
        db = get_db_connection()
        mother_model = Mother(db)
        
        mothers = mother_model.search(search_term, clinic_id)
        db.close()
        
        return jsonify({
            'success': True,
            'mothers': mothers,
            'count': len(mothers)
        }), 200
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============== Error Handlers ==============
@mothers_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Resource not found'
    }), 404


@mothers_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500