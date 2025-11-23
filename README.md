# MaternalCare+

A comprehensive maternal and child health tracking system designed for healthcare facilities in Rwanda and Kenya. MaternalCare+ digitizes patient records, automates vaccination schedules, and enables systematic follow-up care to reduce preventable maternal and infant deaths.

## Live Demo

- **Frontend:** [https://maternalcare-sooty.vercel.app/](https://maternalcare-sooty.vercel.app/)
- **Backend API:** [https://maternalcare.onrender.com](https://maternalcare.onrender.com)
- **Demo Video:** [View Demo](https://youtu.be/your-demo-video-link)

## Features

### For Healthcare Workers

- Comprehensive patient management system
- Child registration and tracking
- Vaccination recording following Kenya Ministry of Health schedule
- Visit recording with vital signs (weight, blood pressure)
- Appointment scheduling and management
- Patient search functionality
- Profile editing and medical history management

### For Mothers

- Personal health dashboard
- Children's profiles and vaccination schedules
- Appointment history and upcoming visits
- Pregnancy-specific tips based on trimester
- Access to complete medical records
- Emergency contact information

## Technology Stack

### Frontend

- React 18.2.0
- TypeScript 5.2.2
- Tailwind CSS 3.3.6
- React Router DOM 6.20.0
- Axios 1.6.0
- Vite 5.0.8

### Backend

- Python 3.9+
- Flask 3.0.0
- Flask-CORS 4.0.0
- PyJWT 2.8.0
- bcrypt 4.1.0
- PyMySQL 1.1.0

### Database

- MySQL 8.0 (hosted on Aiven)

## Project Structure

```
maternalcare-plus/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── utils/
│   │   └── __init__.py
│   ├── database/
│   │   └── schema.sql
│   ├── requirements.txt
│   ├── run.py
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── package.json
│   └── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- Git

### Backend Setup

1. Clone the repository:

```bash
git clone https://github.com/SHYAKA-Aime/HealthSync-Team---MaternalCare-.git
cd maternalcare-plus/backend
```

2. Create and activate virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mcht_db
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
```

5. Set up the database:

```bash
mysql -u root -p < database/schema.sql
```

6. Run the backend server:

```bash
python run.py
```

Backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## API Documentation

### Authentication

**Register User**

```
POST /api/auth/register
Body: { full_name, email, phone, password, role }
```

**Login**

```
POST /api/auth/login
Body: { email, password }
```

### Mothers

**Get All Mothers**

```
GET /api/mothers
Headers: Authorization: Bearer {token}
```

**Create Mother Profile**

```
POST /api/mothers
Body: { user_id, age, blood_group, pregnancy_stage, expected_delivery, location, medical_conditions, emergency_contact }
```

### Children

**Get Children by Mother**

```
GET /api/children/mother/:mother_id
Headers: Authorization: Bearer {token}
```

**Register Child**

```
POST /api/children
Body: { mother_id, full_name, dob, gender, birth_weight, birth_height }
```

### Visits

**Get Visits by Mother**

```
GET /api/visits/mother/:mother_id
Headers: Authorization: Bearer {token}
```

**Record Visit**

```
POST /api/visits
Body: { mother_id, visit_date, visit_type, weight, blood_pressure, notes }
```

### Vaccinations

**Get Vaccinations by Child**

```
GET /api/vaccinations/child/:child_id
Headers: Authorization: Bearer {token}
```

**Record Vaccination**

```
POST /api/vaccinations
Body: { child_id, vaccine_name, date_given, next_due_date, administered_by, batch_number, notes }
```

## Database Schema

The system uses 7 normalized tables:

- **users** - Authentication and base user information
- **clinics** - Healthcare facility information
- **health_workers** - Healthcare provider profiles
- **mothers** - Maternal health profiles
- **children** - Child records
- **visits** - Healthcare appointment records
- **vaccinations** - Immunization records

See `database/schema.sql` for complete schema definition.

## Deployment

### Production Configuration

**Frontend (Vercel)**

- Automatic deployments from main branch
- Environment variable: `VITE_API_URL=https://maternalcare.onrender.com/api`

**Backend (Render)**

- Deployed from main branch
- Environment variables configured in Render dashboard
- CORS configured for Vercel domain

**Database (Aiven)**

- MySQL 8.0 with SSL/TLS encryption
- Automated daily backups
- High availability configuration

## Testing

**Backend Tests**

```bash
cd backend
pytest
```

**Frontend Tests**

```bash
cd frontend
npm run test
```

## Team

- **Jotham Rutijana Jabo** - Team Lead / Full Stack Developer
- **Ndunge Mutheu Mbithi** - Backend Developer
- **Rwema Christian Gashumba** - Database Engineer / Backend Developer
- **Golbert Gautier Kamanzi** - Backend Developer
- **Nazira Umucyo** - Frontend Lead Developer
- **Aime SHYAKA** - Full Stack Developer
