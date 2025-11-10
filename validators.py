"""
Validators Module - MaternalCare+ Application
Input validation for mothers and other models
"""

import re
from datetime import datetime, date


class MotherValidator:
    """
    Validation class for Mother model fields
    """
    
    # Valid blood types
    VALID_BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    
    # Valid pregnancy statuses
    VALID_STATUSES = ['pregnant', 'postpartum', 'not_pregnant']
    
    @staticmethod
    def validate_phone_number(phone):
        """
        Validate phone number format (Kenya format)
        Accepts: +254712345678 or 0712345678
        """
        if not phone:
            return False, "Phone number is required"
        
        # Remove spaces and dashes
        phone = phone.replace(' ', '').replace('-', '')
        
        # Check Kenya format
        kenya_pattern = r'^(\+254|0)[17]\d{8}$'
        
        if not re.match(kenya_pattern, phone):
            return False, "Invalid phone number format. Use +254712345678 or 0712345678"
        
        return True, None
    
    @staticmethod
    def validate_email(email):
        """
        Validate email format
        """
        if not email:
            return False, "Email is required"
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if not re.match(email_pattern, email):
            return False, "Invalid email format"
        
        return True, None
    
    @staticmethod
    def validate_date(date_string, field_name="Date"):
        """
        Validate date format (YYYY-MM-DD)
        """
        if not date_string:
            return True, None  # Optional fields
        
        try:
            parsed_date = datetime.strptime(date_string, '%Y-%m-%d').date()
            return True, None
        except ValueError:
            return False, f"{field_name} must be in YYYY-MM-DD format"
    
    @staticmethod
    def validate_date_of_birth(dob_string):
        """
        Validate date of birth (must be in past, reasonable age range)
        """
        is_valid, error = MotherValidator.validate_date(dob_string, "Date of birth")
        if not is_valid:
            return is_valid, error
        
        dob = datetime.strptime(dob_string, '%Y-%m-%d').date()
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        
        if dob > today:
            return False, "Date of birth cannot be in the future"
        
        if age < 13:
            return False, "Mother must be at least 13 years old"
        
        if age > 60:
            return False, "Please verify date of birth (age over 60)"
        
        return True, None
    
    @staticmethod
    def validate_blood_type(blood_type):
        """
        Validate blood type
        """
        if not blood_type:
            return False, "Blood type is required"
        
        if blood_type not in MotherValidator.VALID_BLOOD_TYPES:
            return False, f"Invalid blood type. Must be one of: {', '.join(MotherValidator.VALID_BLOOD_TYPES)}"
        
        return True, None
    
    @staticmethod
    def validate_pregnancy_status(status):
        """
        Validate pregnancy status
        """
        if not status:
            return True, None  # Optional, defaults to 'not_pregnant'
        
        if status not in MotherValidator.VALID_STATUSES:
            return False, f"Invalid status. Must be one of: {', '.join(MotherValidator.VALID_STATUSES)}"
        
        return True, None
    
    @staticmethod
    def validate_create(data):
        """
        Validate data for creating a new mother profile
        
        Args:
            data (dict): Mother profile data
        
        Returns:
            tuple: (is_valid, errors_dict)
        """
        errors = {}
        
        # Required fields
        required_fields = ['first_name', 'last_name', 'date_of_birth', 'phone_number', 'blood_type']
        
        for field in required_fields:
            if field not in data or not data[field]:
                errors[field] = f"{field.replace('_', ' ').title()} is required"
        
        # Validate first name
        if 'first_name' in data and data['first_name']:
            if len(data['first_name']) < 2:
                errors['first_name'] = "First name must be at least 2 characters"
            elif len(data['first_name']) > 50:
                errors['first_name'] = "First name must not exceed 50 characters"
            elif not re.match(r'^[a-zA-Z\s\'-]+$', data['first_name']):
                errors['first_name'] = "First name contains invalid characters"
        
        # Validate last name
        if 'last_name' in data and data['last_name']:
            if len(data['last_name']) < 2:
                errors['last_name'] = "Last name must be at least 2 characters"
            elif len(data['last_name']) > 50:
                errors['last_name'] = "Last name must not exceed 50 characters"
            elif not re.match(r'^[a-zA-Z\s\'-]+$', data['last_name']):
                errors['last_name'] = "Last name contains invalid characters"
        
        # Validate date of birth
        if 'date_of_birth' in data and data['date_of_birth']:
            is_valid, error = MotherValidator.validate_date_of_birth(data['date_of_birth'])
            if not is_valid:
                errors['date_of_birth'] = error
        
        # Validate phone number
        if 'phone_number' in data and data['phone_number']:
            is_valid, error = MotherValidator.validate_phone_number(data['phone_number'])
            if not is_valid:
                errors['phone_number'] = error
        
        # Validate emergency contact
        if 'emergency_contact' in data and data['emergency_contact']:
            is_valid, error = MotherValidator.validate_phone_number(data['emergency_contact'])
            if not is_valid:
                errors['emergency_contact'] = error
        
        # Validate blood type
        if 'blood_type' in data and data['blood_type']:
            is_valid, error = MotherValidator.validate_blood_type(data['blood_type'])
            if not is_valid:
                errors['blood_type'] = error
        
        # Validate pregnancy status
        if 'current_pregnancy_status' in data:
            is_valid, error = MotherValidator.validate_pregnancy_status(data['current_pregnancy_status'])
            if not is_valid:
                errors['current_pregnancy_status'] = error
        
        # Validate expected delivery date
        if 'expected_delivery_date' in data and data['expected_delivery_date']:
            is_valid, error = MotherValidator.validate_date(data['expected_delivery_date'], "Expected delivery date")
            if not is_valid:
                errors['expected_delivery_date'] = error
            else:
                # Check if it's in the future
                edd = datetime.strptime(data['expected_delivery_date'], '%Y-%m-%d').date()
                if edd < date.today():
                    errors['expected_delivery_date'] = "Expected delivery date must be in the future"
        
        # Validate last menstrual period
        if 'last_menstrual_period' in data and data['last_menstrual_period']:
            is_valid, error = MotherValidator.validate_date(data['last_menstrual_period'], "Last menstrual period")
            if not is_valid:
                errors['last_menstrual_period'] = error
            else:
                # Check if it's in the past
                lmp = datetime.strptime(data['last_menstrual_period'], '%Y-%m-%d').date()
                if lmp > date.today():
                    errors['last_menstrual_period'] = "Last menstrual period cannot be in the future"
                elif (date.today() - lmp).days > 300:
                    errors['last_menstrual_period'] = "Last menstrual period seems too far in the past"
        
        # Validate pregnancy counts
        if 'number_of_pregnancies' in data:
            if not isinstance(data['number_of_pregnancies'], int) or data['number_of_pregnancies'] < 0:
                errors['number_of_pregnancies'] = "Number of pregnancies must be a non-negative integer"
            elif data['number_of_pregnancies'] > 20:
                errors['number_of_pregnancies'] = "Please verify number of pregnancies"
        
        if 'number_of_live_births' in data:
            if not isinstance(data['number_of_live_births'], int) or data['number_of_live_births'] < 0:
                errors['number_of_live_births'] = "Number of live births must be a non-negative integer"
            elif data['number_of_live_births'] > 20:
                errors['number_of_live_births'] = "Please verify number of live births"
        
        # Logical validation: live births cannot exceed pregnancies
        if ('number_of_pregnancies' in data and 'number_of_live_births' in data):
            if data['number_of_live_births'] > data['number_of_pregnancies']:
                errors['number_of_live_births'] = "Number of live births cannot exceed number of pregnancies"
        
        # Validate address
        if 'address' in data and data['address']:
            if len(data['address']) > 200:
                errors['address'] = "Address must not exceed 200 characters"
        
        # Validate medical conditions and allergies (optional text fields)
        if 'medical_conditions' in data and data['medical_conditions']:
            if len(data['medical_conditions']) > 500:
                errors['medical_conditions'] = "Medical conditions description is too long (max 500 characters)"
        
        if 'allergies' in data and data['allergies']:
            if len(data['allergies']) > 300:
                errors['allergies'] = "Allergies description is too long (max 300 characters)"
        
        # Validate clinic_id
        if 'clinic_id' in data and data['clinic_id']:
            if not isinstance(data['clinic_id'], int) or data['clinic_id'] < 1:
                errors['clinic_id'] = "Invalid clinic ID"
        
        return len(errors) == 0, errors
    
    @staticmethod
    def validate_update(data):
        """
        Validate data for updating mother profile
        All fields are optional for updates
        
        Args:
            data (dict): Fields to update
        
        Returns:
            tuple: (is_valid, errors_dict)
        """
        errors = {}
        
        # Check if at least one field is provided
        if not data or len(data) == 0:
            errors['general'] = "At least one field must be provided for update"
            return False, errors
        
        # Validate only the fields that are present
        if 'first_name' in data and data['first_name']:
            if len(data['first_name']) < 2:
                errors['first_name'] = "First name must be at least 2 characters"
            elif len(data['first_name']) > 50:
                errors['first_name'] = "First name must not exceed 50 characters"
            elif not re.match(r'^[a-zA-Z\s\'-]+$', data['first_name']):
                errors['first_name'] = "First name contains invalid characters"
        
        if 'last_name' in data and data['last_name']:
            if len(data['last_name']) < 2:
                errors['last_name'] = "Last name must be at least 2 characters"
            elif len(data['last_name']) > 50:
                errors['last_name'] = "Last name must not exceed 50 characters"
            elif not re.match(r'^[a-zA-Z\s\'-]+$', data['last_name']):
                errors['last_name'] = "Last name contains invalid characters"
        
        if 'date_of_birth' in data and data['date_of_birth']:
            is_valid, error = MotherValidator.validate_date_of_birth(data['date_of_birth'])
            if not is_valid:
                errors['date_of_birth'] = error
        
        if 'phone_number' in data and data['phone_number']:
            is_valid, error = MotherValidator.validate_phone_number(data['phone_number'])
            if not is_valid:
                errors['phone_number'] = error
        
        if 'emergency_contact' in data and data['emergency_contact']:
            is_valid, error = MotherValidator.validate_phone_number(data['emergency_contact'])
            if not is_valid:
                errors['emergency_contact'] = error
        
        if 'blood_type' in data and data['blood_type']:
            is_valid, error = MotherValidator.validate_blood_type(data['blood_type'])
            if not is_valid:
                errors['blood_type'] = error
        
        if 'current_pregnancy_status' in data:
            is_valid, error = MotherValidator.validate_pregnancy_status(data['current_pregnancy_status'])
            if not is_valid:
                errors['current_pregnancy_status'] = error
        
        if 'expected_delivery_date' in data and data['expected_delivery_date']:
            is_valid, error = MotherValidator.validate_date(data['expected_delivery_date'], "Expected delivery date")
            if not is_valid:
                errors['expected_delivery_date'] = error
        
        if 'last_menstrual_period' in data and data['last_menstrual_period']:
            is_valid, error = MotherValidator.validate_date(data['last_menstrual_period'], "Last menstrual period")
            if not is_valid:
                errors['last_menstrual_period'] = error
        
        if 'number_of_pregnancies' in data:
            if not isinstance(data['number_of_pregnancies'], int) or data['number_of_pregnancies'] < 0:
                errors['number_of_pregnancies'] = "Number of pregnancies must be a non-negative integer"
        
        if 'number_of_live_births' in data:
            if not isinstance(data['number_of_live_births'], int) or data['number_of_live_births'] < 0:
                errors['number_of_live_births'] = "Number of live births must be a non-negative integer"
        
        if 'address' in data and data['address']:
            if len(data['address']) > 200:
                errors['address'] = "Address must not exceed 200 characters"
        
        if 'medical_conditions' in data and data['medical_conditions']:
            if len(data['medical_conditions']) > 500:
                errors['medical_conditions'] = "Medical conditions description is too long"
        
        if 'allergies' in data and data['allergies']:
            if len(data['allergies']) > 300:
                errors['allergies'] = "Allergies description is too long"
        
        return len(errors) == 0, errors


# Additional validator classes can be added here for other models
class ChildValidator:
    """
    Validation class for Child model (placeholder for future use)
    """
    pass


class VisitValidator:
    """
    Validation class for Visit model (placeholder for future use)
    """
    pass


class VaccinationValidator:
    """
    Validation class for Vaccination model (placeholder for future use)
    """
    pass