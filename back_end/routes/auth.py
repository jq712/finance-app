# myapp/routes/auth.py
from flask import Blueprint, request, jsonify, g
from back_end.database import get_db_cursor
from back_end.auth import requires_auth

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
@requires_auth
def register():
    """Register a new user after Auth0 signup."""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No input data provided"}), 400
    
    required_fields = ['username', 'email']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({
            "error": "Missing required fields",
            "missing": missing_fields
        }), 400
    
    auth0_id = g.user_id
    
    # Check if user already exists
    with get_db_cursor() as cursor:
        cursor.execute(
            "SELECT id FROM users WHERE auth0_id = %s",
            (auth0_id,)
        )
        if cursor.fetchone():
            return jsonify({"error": "User already registered"}), 409
    
    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(
                "INSERT INTO users (username, email, auth0_id) VALUES (%s, %s, %s)",
                (data['username'], data['email'], auth0_id)
            )
            
            user_id = cursor.lastrowid
            cursor.execute(
                "SELECT id, username, email, created_at FROM users WHERE id = %s",
                (user_id,)
            )
            user = cursor.fetchone()
            
            return jsonify(user), 201
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/me', methods=['GET'])
@requires_auth
def me():
    """Get current user profile."""
    auth0_id = g.user_id
    
    with get_db_cursor() as cursor:
        cursor.execute(
            "SELECT id, username, email, created_at FROM users WHERE auth0_id = %s",
            (auth0_id,)
        )
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify(user), 200