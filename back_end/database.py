# myapp/database.py
import pymysql.cursors
from pymysql.constants import CLIENT
from flask import current_app, g
import threading
from contextlib import contextmanager

# Thread-local storage for connection pooling
_local = threading.local()

def get_db_config():
    """Get database configuration from current Flask app."""
    config = current_app.config
    return {
        'host': config['MYSQL_HOST'],
        'port': config['MYSQL_PORT'],
        'user': config['MYSQL_USER'],
        'password': config['MYSQL_PASSWORD'],
        'db': config['MYSQL_DB'],
        'charset': config['MYSQL_CHARSET'],
        'cursorclass': pymysql.cursors.DictCursor,
        'autocommit': False,
        'client_flag': CLIENT.MULTI_STATEMENTS,
    }

def get_connection():
    """Get a database connection for the current request."""
    # Check if we already have a connection for this request
    if 'db' not in g:
        # Create a new connection
        g.db = pymysql.connect(**get_db_config())
    
    return g.db

def close_connection(e=None):
    """Close the database connection at the end of the request."""
    db = g.pop('db', None)
    
    if db is not None:
        db.close()

@contextmanager
def get_db_cursor(commit=False):
    """Context manager for database cursors.
    
    Usage:
        with get_db_cursor() as cursor:
            cursor.execute('SELECT * FROM users')
            results = cursor.fetchall()
    
    Args:
        commit (bool): Whether to commit the transaction after the block
    """
    connection = get_connection()
    cursor = connection.cursor()
    
    try:
        yield cursor
        if commit:
            connection.commit()
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()

def init_app(app):
    """Initialize the database extension with the Flask app."""
    # Register close_connection to be called when the app context ends
    app.teardown_appcontext(close_connection)
    
    # Register CLI commands if any
    register_cli_commands(app)

def register_cli_commands(app):
    """Register database-related CLI commands with the Flask app."""
    import click
    
    @app.cli.command('init-db')
    @click.option('--force', is_flag=True, help='Force recreate all tables')
    def init_db_command(force):
        """Initialize the database schema."""
        if force:
            click.echo('Dropping all tables...')
            drop_all_tables()
        
        click.echo('Creating database schema...')
        create_schema()
        click.echo('Initialized the database.')
    
    @app.cli.command('seed-db')
    def seed_db_command():
        """Seed the database with initial data."""
        click.echo('Seeding database with initial data...')
        seed_database()
        click.echo('Database seeded successfully.')

def execute_script(script_path, commit=True):
    """Execute an SQL script file."""
    with open(script_path, 'r') as f:
        sql_script = f.read()
    
    with get_db_cursor(commit=commit) as cursor:
        cursor.execute(sql_script)

def create_schema():
    """Create database schema from SQL files."""
    import os
    from flask import current_app
    
    # Path to schema files
    schema_dir = os.path.join(current_app.root_path, 'schema')
    
    # Execute each schema file in order
    for filename in sorted(os.listdir(schema_dir)):
        if filename.endswith('.sql'):
            script_path = os.path.join(schema_dir, filename)
            execute_script(script_path)

def drop_all_tables():
    """Drop all tables in the database."""
    with get_db_cursor(commit=True) as cursor:
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        if tables:
            # Disable foreign key checks temporarily
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
            
            for table in tables:
                table_name = list(table.values())[0]
                cursor.execute(f"DROP TABLE IF EXISTS `{table_name}`")
            
            # Re-enable foreign key checks
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

def seed_database():
    """Seed the database with initial data."""
    import os
    from flask import current_app
    
    # Path to seed files
    seed_dir = os.path.join(current_app.root_path, 'schema', 'seeds')
    
    # Execute each seed file
    if os.path.exists(seed_dir):
        for filename in sorted(os.listdir(seed_dir)):
            if filename.endswith('.sql'):
                script_path = os.path.join(seed_dir, filename)
                execute_script(script_path)