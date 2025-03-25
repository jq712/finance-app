from flask import Flask
from flask_cors import CORS

from . import database

def create_app(config_object=None):
    app = Flask(__name__)
    
    # Load default config
    app.config.from_object('back_end.config.Config')

    # Override config from object if passed in
    if config_object:
        app.config.from_object(config_object)

    # Configure CORS based on environment settings
    if app.config.get('CORS_ENABLED', False):
        cors_resources = {
            r"/api/*": {
                "origins": app.config.get('CORS_ORIGINS', []),
                "supports_credentials": app.config.get('CORS_SUPPORTS_CREDENTIALS', True),
                "allow_headers": app.config.get('CORS_ALLOW_HEADERS', ["Content-Type", "Authorization", "X-Requested-With"]),
                "methods": app.config.get('CORS_METHODS', ["GET", "POST", "PUT", "DELETE", "OPTIONS"]),
                "expose_headers": app.config.get('CORS_EXPOSE_HEADERS', ["Content-Type", "Authorization"]),
                "max_age": app.config.get('CORS_MAX_AGE', 86400)
            }
        }
        CORS(app, resources=cors_resources)

    # Initialize database 
    database.init_app(app)
    
    # Register blueprints
    from .routes import auth, households, transactions
    app.register_blueprint(auth.bp)
    app.register_blueprint(households.bp)
    app.register_blueprint(transactions.bp)
    
    return app