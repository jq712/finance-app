# myapp/routes/transactions.py
from flask import Blueprint, request, jsonify
from back_end.database import get_db_cursor
from back_end.auth import requires_auth, get_user_id_from_auth0_id

bp = Blueprint('transactions', __name__, url_prefix='/api/transactions')

@bp.route('', methods=['POST'])
@requires_auth
def create_transaction():
    """Create a new transaction."""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No input data provided"}), 400
    
    required_fields = ['amount', 'date', 'description']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({
            "error": "Missing required fields",
            "missing": missing_fields
        }), 400
    
    user_id = get_user_id_from_auth0_id()
    if not user_id:
        return jsonify({"error": "User not registered"}), 403
    
    # Check if household_id is valid
    household_id = data.get('household_id')
    if household_id:
        with get_db_cursor() as cursor:
            cursor.execute(
                "SELECT 1 FROM household_members WHERE household_id = %s AND user_id = %s",
                (household_id, user_id)
            )
            if not cursor.fetchone():
                return jsonify({"error": "Not a member of the specified household"}), 403
    
    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(
                """
                INSERT INTO transactions 
                (user_id, amount, date, description, category, household_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    user_id,
                    data['amount'],
                    data['date'],
                    data['description'],
                    data.get('category'),
                    household_id
                )
            )
            
            transaction_id = cursor.lastrowid
            cursor.execute(
                """
                SELECT id, user_id, amount, date, description, category, 
                household_id, created_at
                FROM transactions WHERE id = %s
                """,
                (transaction_id,)
            )
            transaction = cursor.fetchone()
            
            return jsonify(transaction), 201
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('', methods=['GET'])
@requires_auth
def get_transactions():
    """Get user transactions with optional filtering."""
    user_id = get_user_id_from_auth0_id()
    if not user_id:
        return jsonify({"error": "User not registered"}), 403
    
    # Get query parameters
    household_id = request.args.get('household_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    category = request.args.get('category')
    
    # Build query with parameterized SQL
    query = """
        SELECT t.id, t.user_id, t.amount, t.date, t.description, 
               t.category, t.household_id, t.created_at,
               u.username as user_name
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE 
    """
    
    conditions = []
    params = []
    
    if household_id:
        # Verify membership
        with get_db_cursor() as cursor:
            cursor.execute(
                "SELECT 1 FROM household_members WHERE household_id = %s AND user_id = %s",
                (household_id, user_id)
            )
            if not cursor.fetchone():
                return jsonify({"error": "Not a member of the specified household"}), 403
        
        conditions.append("t.household_id = %s")
        params.append(household_id)
    else:
        conditions.append("t.user_id = %s")
        params.append(user_id)
    
    if start_date:
        conditions.append("t.date >= %s")
        params.append(start_date)
    
    if end_date:
        conditions.append("t.date <= %s")
        params.append(end_date)
    
    if category:
        conditions.append("t.category = %s")
        params.append(category)
    
    query += " AND ".join(conditions)
    query += " ORDER BY t.date DESC, t.created_at DESC"
    
    with get_db_cursor() as cursor:
        cursor.execute(query, params)
        transactions = cursor.fetchall()
        
        return jsonify(transactions), 200

@bp.route('/summary', methods=['GET'])
@requires_auth
def get_summary():
    """Get a summary of transactions by period."""
    user_id = get_user_id_from_auth0_id()
    if not user_id:
        return jsonify({"error": "User not registered"}), 403
    
    household_id = request.args.get('household_id')
    period = request.args.get('period', 'monthly')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    valid_periods = ['daily', 'weekly', 'monthly', 'yearly']
    if period not in valid_periods:
        return jsonify({"error": f"Invalid period. Use: {', '.join(valid_periods)}"}), 400
    
    # Build period format expression
    if period == 'daily':
        period_expr = "DATE(t.date)"
    elif period == 'weekly':
        period_expr = "YEARWEEK(t.date)"
    elif period == 'monthly':
        period_expr = "DATE_FORMAT(t.date, '%%Y-%%m')"
    else:  # yearly
        period_expr = "YEAR(t.date)"
    
    query = f"""
        SELECT {period_expr} as period,
        SUM(t.amount) as total_amount,
        COUNT(t.id) as transaction_count,
        MIN(t.amount) as min_amount,
        MAX(t.amount) as max_amount,
        AVG(t.amount) as avg_amount
        FROM transactions t
        WHERE 
    """
    
    conditions = []
    params = []
    
    if household_id:
        # Verify membership
        with get_db_cursor() as cursor:
            cursor.execute(
                "SELECT 1 FROM household_members WHERE household_id = %s AND user_id = %s",
                (household_id, user_id)
            )
            if not cursor.fetchone():
                return jsonify({"error": "Not a member of the specified household"}), 403
        
        conditions.append("t.household_id = %s")
        params.append(household_id)
    else:
        conditions.append("t.user_id = %s")
        params.append(user_id)
    
    if start_date:
        conditions.append("t.date >= %s")
        params.append(start_date)
    
    if end_date:
        conditions.append("t.date <= %s")
        params.append(end_date)
    
    query += " AND ".join(conditions)
    query += " GROUP BY period ORDER BY period ASC"
    
    with get_db_cursor() as cursor:
        cursor.execute(query, params)
        summary = cursor.fetchall()
        
        return jsonify({
            "period": period,
            "summary": summary
        }), 200

@bp.route('/categories', methods=['GET'])
@requires_auth
def get_categories():
    """Get all distinct categories used in transactions."""
    user_id = get_user_id_from_auth0_id()
    if not user_id:
        return jsonify({"error": "User not registered"}), 403
        
    household_id = request.args.get('household_id')
    
    query = """
        SELECT DISTINCT category 
        FROM transactions 
        WHERE category IS NOT NULL
        AND (
    """
    
    conditions = []
    params = []
    
    if household_id:
        # Verify membership
        with get_db_cursor() as cursor:
            cursor.execute(
                "SELECT 1 FROM household_members WHERE household_id = %s AND user_id = %s",
                (household_id, user_id)
            )
            if not cursor.fetchone():
                return jsonify({"error": "Not a member of the specified household"}), 403
        
        conditions.append("household_id = %s")
        params.append(household_id)
    else:
        conditions.append("user_id = %s")
        params.append(user_id)
    
    query += " OR ".join(conditions)
    query += ") ORDER BY category ASC"
    
    with get_db_cursor() as cursor:
        cursor.execute(query, params)
        categories = [row['category'] for row in cursor.fetchall()]
        
        # Include default categories if needed
        default_categories = [
            "Groceries", 
            "Dining", 
            "Entertainment", 
            "Transportation", 
            "Housing", 
            "Utilities", 
            "Healthcare", 
            "Shopping", 
            "Travel", 
            "Income"
        ]
        
        # Merge categories from DB with defaults, avoiding duplicates
        all_categories = list(set(categories + default_categories))
        all_categories.sort()
        
        return jsonify(all_categories), 200