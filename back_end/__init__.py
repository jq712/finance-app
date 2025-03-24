# myapp/__init__.py
from flask import Flask
from . import database
from flask_cors import CORS

def create_app(config_object=None):
    app = Flask(__name__)
    
    # Load default config
    app.config.from_object('back_end.config.Config')

    # Override config from object if passed in
    if config_object:
        app.config.from_object(config_object)

    # Configure CORS
    CORS(app, resources={r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "supports_credentials": True, 
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "expose_headers": ["Content-Type", "Authorization"],
        "max_age": 86400  # Cache preflight requests for 24 hours
    }})

    # Initialize database 
    database.init_app(app)
    
    # Register blueprints
    from .routes import auth, households, transactions
    app.register_blueprint(auth.bp)
    app.register_blueprint(households.bp)
    app.register_blueprint(transactions.bp)
    
    return app