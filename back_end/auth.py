# myapp/auth.py
import json
from functools import wraps
from urllib.request import urlopen
from flask import request, current_app, g, jsonify
import jwt  # Using PyJWT for Auth0 token validation
import base64
import struct

def get_token_auth_header():
    """Obtains the access token from the Authorization Header."""
    auth = request.headers.get("Authorization", None)
    if not auth:
        print("Authorization header is missing")
        return jsonify({"error": "Authorization header is missing"}), 401
    
    parts = auth.split()
    
    if parts[0].lower() != "bearer":
        print("Authorization header must start with Bearer")
        return jsonify({"error": "Authorization header must start with Bearer"}), 401
    elif len(parts) == 1:
        print("Token not found")
        return jsonify({"error": "Token not found"}), 401
    elif len(parts) > 2:
        print("Authorization header must be Bearer token")
        return jsonify({"error": "Authorization header must be Bearer token"}), 401
    
    token = parts[1]
    return token

def requires_auth(f):
    """Decorator to validate JWT tokens from Auth0"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()
        if isinstance(token, tuple):  # Error response
            return token
        
        try:
            # Print token for debugging
            print("Token received:", token[:20] + "..." if len(token) > 20 else token)
            
            # Get Auth0 domain and audience from app config
            domain = current_app.config["AUTH0_DOMAIN"]
            audience = current_app.config["AUTH0_API_AUDIENCE"]
            algorithms = current_app.config["AUTH0_ALGORITHMS"]
            
            print(f"Validating token with domain: {domain}, audience: {audience}")
            
            # Get the JWKS from Auth0
            jwks_url = f'https://{domain}/.well-known/jwks.json'
            print(f"Fetching JWKS from: {jwks_url}")
            jwks_client = urlopen(jwks_url)
            jwks = json.loads(jwks_client.read())
            
            # Parse the JWT
            unverified_header = jwt.get_unverified_header(token)
            print(f"JWT header: {unverified_header}")
            
            # Find the right key from JWKS
            rsa_key = None
            for key in jwks["keys"]:
                if key["kid"] == unverified_header["kid"]:
                    print(f"Found matching key: {key['kid']}")
                    
                    # Convert JWK to PEM format
                    modulus = base64.urlsafe_b64decode(key['n'] + '==')
                    exponent = base64.urlsafe_b64decode(key['e'] + '==')
                    
                    modulus_int = int.from_bytes(modulus, byteorder='big')
                    exponent_int = int.from_bytes(exponent, byteorder='big')
                    
                    # Create PEM formatted public key
                    from cryptography.hazmat.backends import default_backend
                    from cryptography.hazmat.primitives.asymmetric import rsa
                    from cryptography.hazmat.primitives import serialization
                    
                    public_numbers = rsa.RSAPublicNumbers(exponent_int, modulus_int)
                    public_key = public_numbers.public_key(default_backend())
                    pem = public_key.public_bytes(
                        encoding=serialization.Encoding.PEM,
                        format=serialization.PublicFormat.SubjectPublicKeyInfo
                    )
                    
                    rsa_key = pem
                    break
            
            if rsa_key:
                try:
                    # Verify the token
                    print("Attempting to decode JWT")
                    payload = jwt.decode(
                        token,
                        rsa_key,
                        algorithms=algorithms,
                        audience=audience,
                        issuer=f'https://{domain}/',
                        options={
                            'verify_signature': True,
                            'verify_aud': True,
                            'verify_iat': True,
                            'verify_exp': True,
                            'verify_nbf': True,
                            'verify_iss': True,
                            'verify_sub': True,
                            'verify_jti': True,
                            'verify_at_hash': False,
                            'leeway': 0,
                        }
                    )
                    
                    print(f"JWT verified successfully. User: {payload['sub']}")
                    
                    # Store user info in flask.g
                    g.user_id = payload["sub"]
                    g.token_payload = payload
                    
                    return f(*args, **kwargs)
                    
                except jwt.ExpiredSignatureError:
                    print("JWT validation failed: Token expired")
                    return jsonify({"error": "Token expired"}), 401
                except jwt.InvalidAudienceError:
                    print(f"JWT validation failed: Invalid audience. Expected: {audience}")
                    return jsonify({"error": "Invalid audience"}), 401
                except jwt.InvalidIssuerError:
                    print(f"JWT validation failed: Invalid issuer. Expected: https://{domain}/")
                    return jsonify({"error": "Invalid issuer"}), 401
                except Exception as e:
                    print(f"JWT validation failed: {str(e)}")
                    return jsonify({"error": str(e)}), 401
            
            print("JWT validation failed: No matching key found in JWKS")
            return jsonify({"error": "Unable to find appropriate key"}), 401
            
        except Exception as e:
            print(f"JWT validation general error: {str(e)}")
            return jsonify({"error": str(e)}), 401
            
    return decorated

def get_user_id_from_auth0_id():
    """Get the internal user ID from Auth0 ID."""
    from back_end.database import get_db_cursor
    
    auth0_id = g.user_id
    
    with get_db_cursor() as cursor:
        cursor.execute(
            "SELECT id FROM users WHERE auth0_id = %s",
            (auth0_id,)
        )
        result = cursor.fetchone()
        
        if result:
            return result['id']
        
        return None