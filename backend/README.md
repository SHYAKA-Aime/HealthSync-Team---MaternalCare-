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
