# myapp/routes/households.py
import random
import string
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, g
from back_end.database import get_db_cursor
from back_end.auth import requires_auth, get_user_id_from_auth0_id

bp = Blueprint('households', __name__, url_prefix='/api/households')

def generate_invite_code(length=8):
    """Generate a random invite code."""
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

@bp.route('', methods=['GET'])
@requires_auth
def get_households():
    """Get all households the user is a member of."""
    user_id = get_user_id_from_auth0_id()
    if not user_id:
        return jsonify({"error": "User not registered"}), 403
    
    try:
        with get_db_cursor() as cursor:
            cursor.execute(
                """
                SELECT h.id, h.name, h.creator_id, h.created_at,
                       u.username as creator_name
                FROM households h
                JOIN users u ON h.creator_id = u.id
                JOIN household_members hm ON h.id = hm.household_id
                WHERE hm.user_id = %s
                ORDER BY h.created_at DESC
                """,
                (user_id,)
            )
            households = cursor.fetchall()
            
            return jsonify(households), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('', methods=['POST'])
@requires_auth
def create_household():
    """Create a new household."""
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({"error": "Missing required field: name"}), 400
    
    user_id = get_user_id_from_auth0_id()
    if not user_id:
        return jsonify({"error": "User not registered"}), 403
    
    try:
        with get_db_cursor(commit=True) as cursor:
            # Create household
            cursor.execute(
                "INSERT INTO households (name, creator_id) VALUES (%s, %s)",
                (data['name'], user_id)
            )
            household_id = cursor.lastrowid
            
            # Add creator as a member
            cursor.execute(
                "INSERT INTO household_members (household_id, user_id) VALUES (%s, %s)",
                (household_id, user_id)
            )
            
            # Get the created household
            cursor.execute(
                """
                SELECT h.id, h.name, h.creator_id, h.created_at,
                       u.username as creator_name
                FROM households h
                JOIN users u ON h.creator_id = u.id
                WHERE h.id = %s
                """,
                (household_id,)
            )
            household = cursor.fetchone()
            
            return jsonify(household), 201
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:household_id>/invites', methods=['POST'])
@requires_auth
def create_invite(household_id):
    """Generate an invite code for a household."""
    data = request.get_json() or {}
    expires_in_days = data.get('expires_in_days', 7)
    
    user_id = get_user_id_from_auth0_id()
    if not user_id:
        return jsonify({"error": "User not registered"}), 403
    
    with get_db_cursor() as cursor:
        # Check if user is the household creator
        cursor.execute(
            "SELECT creator_id FROM households WHERE id = %s",
            (household_id,)
        )
        household = cursor.fetchone()
        
        if not household:
            return jsonify({"error": "Household not found"}), 404
        
        if household['creator_id'] != user_id:
            return jsonify({"error": "Only the household creator can generate invites"}), 403
    
    invite_code = generate_invite_code()
    expires_at = datetime.now() + timedelta(days=expires_in_days)
    
    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(
                "INSERT INTO invites (household_id, invite_code, expires_at) VALUES (%s, %s, %s)",
                (household_id, invite_code, expires_at)
            )
            
            invite_id = cursor.lastrowid
            cursor.execute(
                "SELECT id, household_id, invite_code, is_active, created_at, expires_at FROM invites WHERE id = %s",
                (invite_id,)
            )
            invite = cursor.fetchone()
            
            return jsonify(invite), 201
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/join/<invite_code>', methods=['POST'])
@requires_auth
def join_household(invite_code):
    """Join a household using an invite code."""
    user_id = get_user_id_from_auth0_id()
    if not user_id:
        return jsonify({"error": "User not registered"}), 403
    
    with get_db_cursor() as cursor:
        # Check if invite code is valid
        cursor.execute(
            "SELECT id, household_id, is_active, expires_at FROM invites WHERE invite_code = %s",
            (invite_code,)
        )
        invite = cursor.fetchone()
        
        if not invite:
            return jsonify({"error": "Invalid invite code"}), 404
        
        if not invite['is_active']:
            return jsonify({"error": "Invite code is no longer active"}), 400
        
        if invite['expires_at'] and invite['expires_at'] < datetime.now():
            return jsonify({"error": "Invite code has expired"}), 400
        
        # Check if user is already a member
        cursor.execute(
            "SELECT 1 FROM household_members WHERE household_id = %s AND user_id = %s",
            (invite['household_id'], user_id)
        )
        if cursor.fetchone():
            return jsonify({"error": "You are already a member of this household"}), 409
    
    try:
        with get_db_cursor(commit=True) as cursor:
            # Add user to household
            cursor.execute(
                "INSERT INTO household_members (household_id, user_id) VALUES (%s, %s)",
                (invite['household_id'], user_id)
            )
            
            # Get household details
            cursor.execute(
                """
                SELECT h.id, h.name, h.creator_id, h.created_at, u.username as creator_name
                FROM households h
                JOIN users u ON h.creator_id = u.id
                WHERE h.id = %s
                """,
                (invite['household_id'],)
            )
            household = cursor.fetchone()
            
            return jsonify({
                "message": f"Successfully joined household '{household['name']}'",
                "household": household
            }), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500