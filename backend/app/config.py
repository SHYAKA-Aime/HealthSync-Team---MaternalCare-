import os
from dotenv import load_dotenv
import pymysql

# Load environment variables from .env
load_dotenv()

class Config:
    """Full Flask App Configuration"""

    # Flask Config
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')

    # MySQL Config
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'mcht_db')

    # JWT Config
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret')
    JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', 24))

    # CORS Config
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000')

    @staticmethod
    def get_db_connection():
        """
        Returns a PyMySQL connection.
        - Localhost: no SSL
        - Remote (Aiven): SSL enabled using system CA
        """
        ssl_config = None
        if Config.DB_HOST not in ("localhost", "127.0.0.1"):
            # Enable SSL for remote hosts
            ssl_config = {"ssl": {}}

        return pymysql.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            cursorclass=pymysql.cursors.DictCursor,
            ssl=ssl_config
        )
