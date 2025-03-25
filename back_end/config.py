# back_end/config.py (updated)
import os
import logging
import secrets
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration."""
    DEBUG = False
    TESTING = False
    
    # Security settings
    SECRET_KEY = os.getenv('SECRET_KEY', secrets.token_hex(32))
    
    # CORS configuration
    CORS_ENABLED = os.getenv('CORS_ENABLED', 'true').lower() == 'true'
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001').split(',')
    CORS_SUPPORTS_CREDENTIALS = os.getenv('CORS_SUPPORTS_CREDENTIALS', 'true').lower() == 'true'
    CORS_ALLOW_HEADERS = os.getenv('CORS_ALLOW_HEADERS', 'Content-Type,Authorization,X-Requested-With').split(',')
    CORS_METHODS = os.getenv('CORS_METHODS', 'GET,POST,PUT,DELETE,OPTIONS').split(',')
    CORS_EXPOSE_HEADERS = os.getenv('CORS_EXPOSE_HEADERS', 'Content-Type,Authorization').split(',')
    CORS_MAX_AGE = int(os.getenv('CORS_MAX_AGE', 86400))  # 24 hours in seconds
    
    # Database settings
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DB = os.getenv('MYSQL_DB', 'spending_tracker')
    MYSQL_CHARSET = 'utf8mb4'
    MYSQL_CONNECTION_TIMEOUT = int(os.getenv('MYSQL_TIMEOUT', 5))
    MYSQL_POOL_SIZE = int(os.getenv('MYSQL_POOL_SIZE', 5))
    MYSQL_POOL_RECYCLE = int(os.getenv('MYSQL_POOL_RECYCLE', 3600))
    
    # Auth0 settings
    AUTH0_DOMAIN = os.getenv('AUTH0_DOMAIN', '')
    AUTH0_API_AUDIENCE = os.getenv('AUTH0_API_AUDIENCE', '')
    AUTH0_ALGORITHMS = os.getenv('AUTH0_ALGORITHMS', 'RS256').split(',')
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = os.getenv('LOG_FORMAT', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    LOG_FILE = os.getenv('LOG_FILE', 'app.log')
    LOG_MAX_BYTES = int(os.getenv('LOG_MAX_BYTES', 10 * 1024 * 1024))  # 10MB
    LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', 5))

    @classmethod
    def init_logging(cls):
        """Initialize logging configuration"""

        
    @classmethod
    def validate_config(cls):
        """Validate that required configuration values are set"""
        required_vars = {
            'MYSQL_HOST': cls.MYSQL_HOST,
            'MYSQL_USER': cls.MYSQL_USER,
            'MYSQL_PASSWORD': cls.MYSQL_PASSWORD,
            'MYSQL_DB': cls.MYSQL_DB,
            'AUTH0_DOMAIN': cls.AUTH0_DOMAIN,
            'AUTH0_API_AUDIENCE': cls.AUTH0_API_AUDIENCE,
        }
        
        missing = [key for key, value in required_vars.items() if not value]
        
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
        
        return True


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'
    
    # Development-specific CORS settings (if not defined in env)
    CORS_ENABLED = True
    
    def __init__(self):
        self.validate_config()
        Config.init_logging()


class ProductionConfig(Config):
    """Production configuration."""
    SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'true').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = os.getenv('SESSION_COOKIE_HTTPONLY', 'true').lower() == 'true'
    
    # Production-specific CORS settings validation
    CORS_ENABLED = True
    
    # Database pool
    MYSQL_POOL_SIZE = int(os.getenv('MYSQL_POOL_SIZE', 10))
    
    # Logging
    LOG_LEVEL = 'INFO'
    
    def __init__(self):
        self.validate_config()
        self._validate_security()
        Config.init_logging()
    
    def _validate_security(self):
        """Validate security-critical settings"""
        if self.DEBUG:
            raise ValueError("DEBUG must be False in production")
        
        if not self.SECRET_KEY or self.SECRET_KEY == 'your-secret-key-should-be-random-and-secure':
            raise ValueError("Production requires a strong SECRET_KEY")
        
        if not self.CORS_ORIGINS or self.CORS_ORIGINS == ['']:
            logging.warning("No CORS_ORIGINS specified. API may be inaccessible from frontend.")
        
        if self.CORS_ENABLED and '*' in self.CORS_ORIGINS:
            logging.warning("SECURITY RISK: CORS is configured to allow any origin (*). This is not recommended for production.")