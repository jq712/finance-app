# config.py
import os
import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration."""
    DEBUG = False
    TESTING = False
    
    # Security settings
    CORS_ENABLED = True
    
    # Database settings
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DB = os.getenv('MYSQL_DB', 'spending_tracker')
    MYSQL_CHARSET = 'utf8mb4'
    MYSQL_CONNECTION_TIMEOUT = int(os.getenv('MYSQL_CONNECTION_TIMEOUT', 5))
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
        # Clear existing handlers to avoid duplicates
        root_logger = logging.getLogger()
        root_logger.handlers = []
        root_logger.setLevel(getattr(logging, cls.LOG_LEVEL))
        
        # Set up file logging
        if not os.path.exists('logs'):
            os.makedirs('logs')
            
        file_handler = RotatingFileHandler(
            f'logs/{cls.LOG_FILE}',
            maxBytes=cls.LOG_MAX_BYTES,
            backupCount=cls.LOG_BACKUP_COUNT
        )
        file_handler.setFormatter(logging.Formatter(cls.LOG_FORMAT))
        root_logger.addHandler(file_handler)
        
        # Add console handler in development mode
        if cls.DEBUG:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(logging.Formatter(cls.LOG_FORMAT))
            root_logger.addHandler(console_handler)
            logging.info("Console logging enabled for development")

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'  # More verbose logging for development
    
    def __init__(self):
        self._validate_config()
        Config.init_logging()  # Initialize logging for development
    
    def _validate_config(self):
        required_vars = [
            'MYSQL_HOST', 'MYSQL_USER', 
            'MYSQL_PASSWORD', 'MYSQL_DB',
            'AUTH0_DOMAIN', 'AUTH0_API_AUDIENCE'
        ]
        missing = [var for var in required_vars if not os.getenv(var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

class ProductionConfig(Config):
    """Production configuration."""
    CORS_ENABLED = True
    LOG_LEVEL = 'INFO'  # Less verbose for production
    
    def __init__(self):
        self._validate_config()
        self._validate_security()
        Config.init_logging()
    
    def _validate_config(self):
        required_vars = [
            'MYSQL_HOST', 'MYSQL_USER', 
            'MYSQL_PASSWORD', 'MYSQL_DB',
            'AUTH0_DOMAIN', 'AUTH0_API_AUDIENCE'
        ]
        missing = [var for var in required_vars if not os.getenv(var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    def _validate_security(self):
        """Validate security-critical settings"""
        if self.DEBUG:
            raise ValueError("DEBUG must be False in production")

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True
    MYSQL_DB = 'spending_tracker_test'
    
    def __init__(self):
        self._validate_config()
    
    def _validate_config(self):
        required_vars = [
            'MYSQL_HOST', 'MYSQL_USER', 
            'MYSQL_PASSWORD'
        ]
        missing = [var for var in required_vars if not os.getenv(var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")