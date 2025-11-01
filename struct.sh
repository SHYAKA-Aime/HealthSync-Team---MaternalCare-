#!/bin/bash

# Backend Configuration Files Setup
# Run this after running the main setup script

echo "⚙️  Setting up Backend Configuration Files..."
echo "============================================"

cd backend || exit

# ==========================================
# requirements.txt
# ==========================================

cat > requirements.txt << 'EOF'
Flask==3.0.0
flask-cors==4.0.0
PyMySQL==1.1.0
cryptography==41.0.0
PyJWT==2.8.0
python-dotenv==1.0.0
bcrypt==4.1.0
EOF

# ==========================================
# .env.example
# ==========================================

cat > .env.example << 'EOF'
# Flask Configuration
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-this-in-production

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=mcht_db

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-change-this
JWT_EXPIRATION_HOURS=24

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
EOF

# ==========================================
# .env
# ==========================================

cat > .env << 'EOF'
# Flask Configuration
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=dev-secret-key-12345

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mcht_db

# JWT Configuration
JWT_SECRET_KEY=dev-jwt-secret-12345
JWT_EXPIRATION_HOURS=24

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
EOF

# ==========================================
# run.py
# ==========================================

cat > run.py << 'EOF'
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
EOF

# ==========================================
# app/__init__.py
# ==========================================

cat > app/__init__.py << 'EOF'
from flask import Flask
from flask_cors import CORS
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS
    CORS(app, origins=app.config['CORS_ORIGINS'].split(','))
    
    # Register blueprints
    from app.routes import auth, mothers, children, visits, vaccinations
    
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(mothers.bp, url_prefix='/api/mothers')
    app.register_blueprint(children.bp, url_prefix='/api/children')
    app.register_blueprint(visits.bp, url_prefix='/api/visits')
    app.register_blueprint(vaccinations.bp, url_prefix='/api/vaccinations')
    
    # Health check endpoint
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'MaternalCare+ API is running'}
    
    return app
EOF

# ==========================================
# app/config.py
# ==========================================

cat > app/config.py << 'EOF'
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    
    # MySQL Database Configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'mcht_db')
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret')
    JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', 24))
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000')
    
    @staticmethod
    def get_db_connection():
        """Create and return database connection"""
        import pymysql
        return pymysql.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )
EOF

# ==========================================
# database/schema.sql
# ==========================================

cat > database/schema.sql << 'EOF'
-- MaternalCare+ Database Schema
-- MySQL Database

CREATE DATABASE IF NOT EXISTS mcht_db;
USE mcht_db;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS vaccinations;
DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS children;
DROP TABLE IF EXISTS mothers;
DROP TABLE IF EXISTS health_workers;
DROP TABLE IF EXISTS clinics;
DROP TABLE IF EXISTS users;

-- Users Table (Core authentication)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('mother', 'health_worker', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clinics Table
CREATE TABLE clinics (
    clinic_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Health Workers Table
CREATE TABLE health_workers (
    hw_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    clinic_id INT,
    position VARCHAR(100),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id) ON DELETE SET NULL
);

-- Mothers Table
CREATE TABLE mothers (
    mother_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    age INT,
    blood_group VARCHAR(10),
    pregnancy_stage VARCHAR(50),
    expected_delivery DATE,
    location VARCHAR(255),
    medical_conditions TEXT,
    emergency_contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Children Table
CREATE TABLE children (
    child_id INT PRIMARY KEY AUTO_INCREMENT,
    mother_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    birth_weight DECIMAL(5,2),
    birth_height DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mother_id) REFERENCES mothers(mother_id) ON DELETE CASCADE
);

-- Visits Table
CREATE TABLE visits (
    visit_id INT PRIMARY KEY AUTO_INCREMENT,
    mother_id INT NOT NULL,
    hw_id INT,
    visit_date DATE NOT NULL,
    visit_type ENUM('antenatal', 'postnatal', 'general') NOT NULL,
    weight DECIMAL(5,2),
    blood_pressure VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mother_id) REFERENCES mothers(mother_id) ON DELETE CASCADE,
    FOREIGN KEY (hw_id) REFERENCES health_workers(hw_id) ON DELETE SET NULL
);

-- Vaccinations Table
CREATE TABLE vaccinations (
    vaccine_id INT PRIMARY KEY AUTO_INCREMENT,
    child_id INT NOT NULL,
    hw_id INT,
    vaccine_name VARCHAR(100) NOT NULL,
    date_given DATE NOT NULL,
    next_due_date DATE,
    administered_by VARCHAR(255),
    batch_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(child_id) ON DELETE CASCADE,
    FOREIGN KEY (hw_id) REFERENCES health_workers(hw_id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_mother_user ON mothers(user_id);
CREATE INDEX idx_hw_user ON health_workers(user_id);
CREATE INDEX idx_hw_clinic ON health_workers(clinic_id);
CREATE INDEX idx_child_mother ON children(mother_id);
CREATE INDEX idx_visit_mother ON visits(mother_id);
CREATE INDEX idx_visit_date ON visits(visit_date);
CREATE INDEX idx_vaccination_child ON vaccinations(child_id);
CREATE INDEX idx_vaccination_date ON vaccinations(date_given);

-- Insert sample data for testing

-- Sample clinic
INSERT INTO clinics (name, location, contact) VALUES
('Kigali Health Center', 'Kigali, Gasabo District', '+250788123456');

-- Sample users
INSERT INTO users (full_name, email, phone, password_hash, role) VALUES
('Jane Doe', 'jane@example.com', '+250788111111', '$2b$12$sample_hash_will_be_replaced', 'mother'),
('Dr. John Smith', 'doctor@example.com', '+250788222222', '$2b$12$sample_hash_will_be_replaced', 'health_worker'),
('Admin User', 'admin@example.com', '+250788333333', '$2b$12$sample_hash_will_be_replaced', 'admin');

-- Sample health worker
INSERT INTO health_workers (user_id, clinic_id, position, department) VALUES
(2, 1, 'Nurse', 'Maternal Health');

-- Sample mother
INSERT INTO mothers (user_id, age, blood_group, pregnancy_stage, expected_delivery, location, emergency_contact) VALUES
(1, 28, 'O+', 'Second Trimester', '2025-06-15', 'Kigali, Gasabo', '+250788444444');

-- Sample child
INSERT INTO children (mother_id, full_name, dob, gender, birth_weight, birth_height) VALUES
(1, 'Baby Doe', '2024-01-15', 'female', 3.2, 48.5);

-- Sample visit
INSERT INTO visits (mother_id, hw_id, visit_date, visit_type, weight, blood_pressure, notes) VALUES
(1, 1, '2025-01-15', 'antenatal', 65.5, '120/80', 'Regular checkup - all vital signs normal');

-- Sample vaccination
INSERT INTO vaccinations (child_id, hw_id, vaccine_name, date_given, next_due_date, administered_by, batch_number) VALUES
(1, 1, 'BCG', '2024-01-16', NULL, 'Dr. John Smith', 'BCG2024-001');

-- Verification queries
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_mothers FROM mothers;
SELECT COUNT(*) as total_children FROM children;
EOF

# ==========================================
# README.md
# ==========================================

cat > README.md << 'EOF'
# MaternalCare+ Backend

Flask + Python + MySQL

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv

# On Mac/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 4. Setup Database

**Option A: Using MySQL Command Line**
```bash
mysql -u root -p < database/schema.sql
```

**Option B: Using MySQL Workbench**
- Open `database/schema.sql`
- Execute the script

**Option C: Manual Setup**
```bash
mysql -u root -p
CREATE DATABASE mcht_db;
USE mcht_db;
SOURCE database/schema.sql;
```

### 5. Run the Server

```bash
python run.py
```

Server will run on **http://localhost:5000**

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Mothers
- `GET /api/mothers` - Get all mothers
- `GET /api/mothers/:id` - Get single mother
- `POST /api/mothers` - Create mother profile
- `PUT /api/mothers/:id` - Update mother profile
- `DELETE /api/mothers/:id` - Delete mother profile

### Children
- `GET /api/children` - Get all children
- `GET /api/mothers/:id/children` - Get mother's children
- `GET /api/children/:id` - Get single child
- `POST /api/children` - Create child profile
- `PUT /api/children/:id` - Update child profile
- `DELETE /api/children/:id` - Delete child profile

### Visits
- `GET /api/visits` - Get all visits
- `GET /api/mothers/:id/visits` - Get mother's visits
- `GET /api/visits/:id` - Get single visit
- `POST /api/visits` - Create visit record
- `PUT /api/visits/:id` - Update visit
- `DELETE /api/visits/:id` - Delete visit

### Vaccinations
- `GET /api/vaccinations` - Get all vaccinations
- `GET /api/children/:id/vaccinations` - Get child's vaccinations
- `GET /api/vaccinations/:id` - Get single vaccination
- `POST /api/vaccinations` - Create vaccination record
- `PUT /api/vaccinations/:id` - Update vaccination
- `DELETE /api/vaccinations/:id` - Delete vaccination

### Health Check
- `GET /api/health` - Check if API is running

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "mother"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Mothers (with JWT token)
```bash
curl -X GET http://localhost:5000/api/mothers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── config.py            # Configuration
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   └── utils/               # Helper functions
├── database/
│   └── schema.sql           # Database schema
├── tests/                   # Test files
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
└── run.py                   # Application entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Environment (development/production) | development |
| `SECRET_KEY` | Flask secret key | - |
| `DB_HOST` | MySQL host | localhost |
| `DB_PORT` | MySQL port | 3306 |
| `DB_USER` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | mcht_db |
| `JWT_SECRET_KEY` | JWT signing key | - |
| `JWT_EXPIRATION_HOURS` | Token expiration time | 24 |

## Troubleshooting

### Database Connection Error
```
pymysql.err.OperationalError: (2003, "Can't connect to MySQL server")
```
**Solution:** Make sure MySQL is running and credentials in `.env` are correct.

### Import Error
```
ModuleNotFoundError: No module named 'flask'
```
**Solution:** Make sure virtual environment is activated and dependencies are installed.

### Port Already in Use
```
OSError: [Errno 48] Address already in use
```
**Solution:** Change port in `run.py` or kill process using port 5000.

## Development Tips

- Use virtual environment to isolate dependencies
- Never commit `.env` file (contains sensitive data)
- Test endpoints with Postman or cURL
- Check MySQL logs if database queries fail
- Use `FLASK_ENV=development` for debug mode

Happy coding! 🚀
EOF

echo ""
echo "✅ Backend configuration files created successfully!"
echo ""
echo "📋 Files created:"
echo "   ✓ requirements.txt"
echo "   ✓ .env.example & .env"
echo "   ✓ run.py"
echo "   ✓ app/__init__.py"
echo "   ✓ app/config.py"
echo "   ✓ database/schema.sql"
echo "   ✓ README.md"
echo ""
echo "🚀 Next steps:"
echo "   1. python -m venv venv"
echo "   2. source venv/bin/activate  (Mac/Linux) or venv\\Scripts\\activate (Windows)"
echo "   3. pip install -r requirements.txt"
echo "   4. mysql -u root -p < database/schema.sql"
echo "   5. python run.py"
echo ""