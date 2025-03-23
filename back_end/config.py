# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-please-change')
    DEBUG = False
     
    # Database settings
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DB = os.getenv('MYSQL_DB', 'spending_tracker')
    MYSQL_CHARSET = 'utf8mb4'
    
    # Auth0 settings
    AUTH0_DOMAIN = os.getenv('AUTH0_DOMAIN', '')
    AUTH0_API_AUDIENCE = os.getenv('AUTH0_API_AUDIENCE', '')
    AUTH0_ALGORITHMS = ['RS256']

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    
class ProductionConfig(Config):
    """Production configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY')
    
    def __init__(self):
        required_vars = [
            'SECRET_KEY', 'MYSQL_HOST', 'MYSQL_USER', 
            'MYSQL_PASSWORD', 'MYSQL_DB',
            'AUTH0_DOMAIN', 'AUTH0_API_AUDIENCE'
        ]
        missing = [var for var in required_vars if not os.getenv(var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")