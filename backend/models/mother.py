"""
Mother Model - MaternalCare+ Application
Handles mother profile data, medical information, and relationships
"""

from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
from mysql.connector import Error


class Mother:
    """
    Mother class represents pregnant women or new mothers in the system.
    Manages profile information, medical records, and relationships with children and visits.
    """
    
    def __init__(self, db_connection):
        """
        Initialize Mother model with database connection
        
        Args:
            db_connection: MySQL database connection object
        """
        self.db = db_connection
    
    def create(self, user_id, profile_data):
        """
        Create a new mother profile
        
        Args:
            user_id (int): Associated user account ID
            profile_data (dict): Mother's profile information including:
                - first_name (str): Mother's first name
                - last_name (str): Mother's last name
                - date_of_birth (date): Mother's birth date
                - phone_number (str): Contact number
                - address (str): Residential address
                - emergency_contact (str): Emergency contact number
                - blood_type (str): Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
                - current_pregnancy_status (str): ENUM('pregnant', 'postpartum', 'not_pregnant')
                - expected_delivery_date (date, optional): EDD if pregnant
                - last_menstrual_period (date, optional): LMP date
                - number_of_pregnancies (int): Gravida count
                - number_of_live_births (int): Parity count
                - medical_conditions (str, optional): Pre-existing conditions
                - allergies (str, optional): Known allergies
                - clinic_id (int, optional): Registered clinic ID
        
        Returns:
            dict: Created mother record with ID or error message
        """
        try:
            cursor = self.db.cursor(dictionary=True)
            
            query = """
            INSERT INTO mothers (
                user_id, first_name, last_name, date_of_birth, phone_number,
                address, emergency_contact, blood_type, current_pregnancy_status,
                expected_delivery_date, last_menstrual_period, number_of_pregnancies,
                number_of_live_births, medical_conditions, allergies, clinic_id,
                created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
            )
            """
            
            values = (
                user_id,
                profile_data.get('first_name'),
                profile_data.get('last_name'),
                profile_data.get('date_of_birth'),
                profile_data.get('phone_number'),
                profile_data.get('address'),
                profile_data.get('emergency_contact'),
                profile_data.get('blood_type'),
                profile_data.get('current_pregnancy_status', 'not_pregnant'),
                profile_data.get('expected_delivery_date'),
                profile_data.get('last_menstrual_period'),
                profile_data.get('number_of_pregnancies', 0),
                profile_data.get('number_of_live_births', 0),
                profile_data.get('medical_conditions'),
                profile_data.get('allergies'),
                profile_data.get('clinic_id')
            )
            
            cursor.execute(query, values)
            self.db.commit()
            
            mother_id = cursor.lastrowid
            cursor.close()
            
            return {
                'success': True,
                'message': 'Mother profile created successfully',
                'mother_id': mother_id
            }
            
        except Error as e:
            self.db.rollback()
            return {
                'success': False,
                'message': f'Database error: {str(e)}'
            }
    
    def get_by_id(self, mother_id):
        """
        Retrieve mother profile by ID
        
        Args:
            mother_id (int): Mother's unique identifier
        
        Returns:
            dict: Mother profile data or None
        """
        try:
            cursor = self.db.cursor(dictionary=True)
            
            query = """
            SELECT m.*, u.email, u.role, c.clinic_name, c.location as clinic_location
            FROM mothers m
            LEFT JOIN users u ON m.user_id = u.user_id
            LEFT JOIN clinics c ON m.clinic_id = c.clinic_id
            WHERE m.mother_id = %s AND m.is_active = TRUE
            """
            
            cursor.execute(query, (mother_id,))
            mother = cursor.fetchone()
            cursor.close()
            
            return mother
            
        except Error as e:
            return None
    
    def get_by_user_id(self, user_id):
        """
        Retrieve mother profile by user account ID
        
        Args:
            user_id (int): User account identifier
        
        Returns:
            dict: Mother profile data or None
        """
        try:
            cursor = self.db.cursor(dictionary=True)
            
            query = """
            SELECT m.*, u.email, c.clinic_name
            FROM mothers m
            LEFT JOIN users u ON m.user_id = u.user_id
            LEFT JOIN clinics c ON m.clinic_id = c.clinic_id
            WHERE m.user_id = %s AND m.is_active = TRUE
            """
            
            cursor.execute(query, (user_id,))
            mother = cursor.fetchone()
            cursor.close()
            
            return mother
            
        except Error as e:
            return None
    
    def update(self, mother_id, update_data):
        """
        Update mother profile information
        
        Args:
            mother_id (int): Mother's unique identifier
            update_data (dict): Fields to update
        
        Returns:
            dict: Success status and message
        """
        try:
            # Build dynamic update query based on provided fields
            allowed_fields = [
                'first_name', 'last_name', 'date_of_birth', 'phone_number',
                'address', 'emergency_contact', 'blood_type', 'current_pregnancy_status',
                'expected_delivery_date', 'last_menstrual_period', 'number_of_pregnancies',
                'number_of_live_births', 'medical_conditions', 'allergies', 'clinic_id'
            ]
            
            update_fields = []
            values = []
            
            for field in allowed_fields:
                if field in update_data:
                    update_fields.append(f"{field} = %s")
                    values.append(update_data[field])
            
            if not update_fields:
                return {
                    'success': False,
                    'message': 'No valid fields to update'
                }
            
            # Add updated_at timestamp
            update_fields.append("updated_at = NOW()")
            values.append(mother_id)
            
            cursor = self.db.cursor()
            query = f"UPDATE mothers SET {', '.join(update_fields)} WHERE mother_id = %s"
            
            cursor.execute(query, values)
            self.db.commit()
            
            affected_rows = cursor.rowcount
            cursor.close()
            
            if affected_rows > 0:
                return {
                    'success': True,
                    'message': 'Mother profile updated successfully'
                }
            else:
                return {
                    'success': False,
                    'message': 'Mother not found or no changes made'
                }
            
        except Error as e:
            self.db.rollback()
            return {
                'success': False,
                'message': f'Database error: {str(e)}'
            }
    
    def delete(self, mother_id):
        """
        Soft delete mother profile (sets is_active to FALSE)
        
        Args:
            mother_id (int): Mother's unique identifier
        
        Returns:
            dict: Success status and message
        """
        try:
            cursor = self.db.cursor()
            
            query = "UPDATE mothers SET is_active = FALSE, updated_at = NOW() WHERE mother_id = %s"
            cursor.execute(query, (mother_id,))
            self.db.commit()
            
            affected_rows = cursor.rowcount
            cursor.close()
            
            if affected_rows > 0:
                return {
                    'success': True,
                    'message': 'Mother profile deactivated successfully'
                }
            else:
                return {
                    'success': False,
                    'message': 'Mother not found'
                }
            
        except Error as e:
            self.db.rollback()
            return {
                'success': False,
                'message': f'Database error: {str(e)}'
            }
    
    def get_all(self, clinic_id=None, status=None, page=1, per_page=20):
        """
        Retrieve all mothers with optional filtering and pagination
        
        Args:
            clinic_id (int, optional): Filter by clinic
            status (str, optional): Filter by pregnancy status
            page (int): Page number for pagination
            per_page (int): Results per page
        
        Returns:
            dict: List of mothers and pagination info
        """
        try:
            cursor = self.db.cursor(dictionary=True)
            
            # Base query
            query = """
            SELECT m.*, u.email, c.clinic_name
            FROM mothers m
            LEFT JOIN users u ON m.user_id = u.user_id
            LEFT JOIN clinics c ON m.clinic_id = c.clinic_id
            WHERE m.is_active = TRUE
            """
            
            conditions = []
            values = []
            
            # Add filters
            if clinic_id:
                conditions.append("m.clinic_id = %s")
                values.append(clinic_id)
            
            if status:
                conditions.append("m.current_pregnancy_status = %s")
                values.append(status)
            
            if conditions:
                query += " AND " + " AND ".join(conditions)
            
            # Add pagination
            offset = (page - 1) * per_page
            query += " ORDER BY m.created_at DESC LIMIT %s OFFSET %s"
            values.extend([per_page, offset])
            
            cursor.execute(query, values)
            mothers = cursor.fetchall()
            
            # Get total count
            count_query = "SELECT COUNT(*) as total FROM mothers WHERE is_active = TRUE"
            if conditions:
                count_query += " AND " + " AND ".join(conditions[:-2] if len(values) > 2 else conditions)
            
            cursor.execute(count_query, values[:-2] if len(values) > 2 else values)
            total = cursor.fetchone()['total']
            
            cursor.close()
            
            return {
                'success': True,
                'mothers': mothers,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': total,
                    'pages': (total + per_page - 1) // per_page
                }
            }
            
        except Error as e:
            return {
                'success': False,
                'message': f'Database error: {str(e)}',
                'mothers': [],
                'pagination': {}
            }
    
    def get_children(self, mother_id):
        """
        Get all children associated with a mother
        
        Args:
            mother_id (int): Mother's unique identifier
        
        Returns:
            list: Children records
        """
        try:
            cursor = self.db.cursor(dictionary=True)
            
            query = """
            SELECT * FROM children
            WHERE mother_id = %s
            ORDER BY date_of_birth DESC
            """
            
            cursor.execute(query, (mother_id,))
            children = cursor.fetchall()
            cursor.close()
            
            return children
            
        except Error as e:
            return []
    
    def get_visits(self, mother_id, limit=10):
        """
        Get recent visits for a mother
        
        Args:
            mother_id (int): Mother's unique identifier
            limit (int): Maximum number of visits to return
        
        Returns:
            list: Visit records
        """
        try:
            cursor = self.db.cursor(dictionary=True)
            
            query = """
            SELECT v.*, hw.first_name as worker_first_name, 
                   hw.last_name as worker_last_name, c.clinic_name
            FROM visits v
            LEFT JOIN health_workers hw ON v.health_worker_id = hw.health_worker_id
            LEFT JOIN clinics c ON v.clinic_id = c.clinic_id
            WHERE v.mother_id = %s
            ORDER BY v.visit_date DESC
            LIMIT %s
            """
            
            cursor.execute(query, (mother_id, limit))
            visits = cursor.fetchall()
            cursor.close()
            
            return visits
            
        except Error as e:
            return []
    
    def get_pregnancy_summary(self, mother_id):
        """
        Get comprehensive pregnancy summary for a mother
        
        Args:
            mother_id (int): Mother's unique identifier
        
        Returns:
            dict: Pregnancy summary with stats and important dates
        """
        try:
            mother = self.get_by_id(mother_id)
            
            if not mother:
                return None
            
            # Calculate pregnancy week if pregnant
            pregnancy_week = None
            if mother['current_pregnancy_status'] == 'pregnant' and mother['last_menstrual_period']:
                lmp = mother['last_menstrual_period']
                today = datetime.now().date()
                days_pregnant = (today - lmp).days
                pregnancy_week = days_pregnant // 7
            
            # Get visit count
            cursor = self.db.cursor(dictionary=True)
            cursor.execute("SELECT COUNT(*) as visit_count FROM visits WHERE mother_id = %s", (mother_id,))
            visit_count = cursor.fetchone()['visit_count']
            
            # Get children count
            cursor.execute("SELECT COUNT(*) as child_count FROM children WHERE mother_id = %s", (mother_id,))
            child_count = cursor.fetchone()['child_count']
            
            cursor.close()
            
            return {
                'mother_id': mother_id,
                'full_name': f"{mother['first_name']} {mother['last_name']}",
                'pregnancy_status': mother['current_pregnancy_status'],
                'pregnancy_week': pregnancy_week,
                'expected_delivery_date': mother['expected_delivery_date'],
                'number_of_pregnancies': mother['number_of_pregnancies'],
                'number_of_live_births': mother['number_of_live_births'],
                'total_visits': visit_count,
                'children_count': child_count,
                'clinic': mother.get('clinic_name'),
                'blood_type': mother['blood_type'],
                'medical_conditions': mother['medical_conditions'],
                'allergies': mother['allergies']
            }
            
        except Error as e:
            return None
    
    def search(self, search_term, clinic_id=None):
        """
        Search mothers by name, phone, or email
        
        Args:
            search_term (str): Search query
            clinic_id (int, optional): Filter by clinic
        
        Returns:
            list: Matching mother records
        """
        try:
            cursor = self.db.cursor(dictionary=True)
            
            query = """
            SELECT m.*, u.email, c.clinic_name
            FROM mothers m
            LEFT JOIN users u ON m.user_id = u.user_id
            LEFT JOIN clinics c ON m.clinic_id = c.clinic_id
            WHERE m.is_active = TRUE
            AND (
                m.first_name LIKE %s OR
                m.last_name LIKE %s OR
                m.phone_number LIKE %s OR
                u.email LIKE %s
            )
            """
            
            search_pattern = f"%{search_term}%"
            values = [search_pattern] * 4
            
            if clinic_id:
                query += " AND m.clinic_id = %s"
                values.append(clinic_id)
            
            query += " ORDER BY m.first_name, m.last_name LIMIT 50"
            
            cursor.execute(query, values)
            mothers = cursor.fetchall()
            cursor.close()
            
            return mothers
            
        except Error as e:
            return []