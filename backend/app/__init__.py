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
