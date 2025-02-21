#import Necessary Libraries

import base64
from flask import Flask, request, jsonify,send_file
import os
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import mysql.connector
from flask_cors import CORS  
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

bcrypt = Bcrypt(app)
app.config['JWT_SECRET_KEY'] = 'your_secret_key'  # Change this to a strong secret key
jwt = JWTManager(app)

# Configure upload folder
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {"pdf"}

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# MySQL Database Configuration
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="neuro_db"
)
cursor = db.cursor()


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                       (username, email, hashed_password))
        db.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"error": "Username or Email already exists"}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    cursor.execute("SELECT id, username, password FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if user and bcrypt.check_password_hash(user[2], password):
        access_token = create_access_token(identity={'id': user[0], 'username': user[1], 'email': email})
        return jsonify({"message": "Login successful", "access_token": access_token,"username": user[1]}), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

@app.route('/save_doctor', methods=['POST'])
def save_doctor():
    try:
        data = request.form
        image_file = request.files.get('mriScan')  # Handle file upload

        print(data)

        # Convert image to binary (BLOB)
        image_blob = None
        if image_file:
            image_blob = image_file.read()  # Read image as binary

        # Convert tumorType checkboxes to a comma-separated string
        specializations = ", ".join(request.form.getlist('tumorType'))

        # SQL Insert Query
        sql = """
        INSERT INTO doctors (first_name, last_name, image, gender, age, specialization, email, phone, country, qualification, description)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data.get('firstName'),
            data.get('lastName'),
            image_blob,  # Store as BLOB
            data.get('gender'),
            int(data.get('age')),
            specializations,
            data.get('email'),
            data.get('phone'),
            data.get('country'),
            data.get('phd'),
            data.get('history')
        )

        cursor.execute(sql, values)
        db.commit()

        return jsonify({'message': 'Doctor profile saved successfully!'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def add_padding(base64_string):
    # Add necessary padding to the base64 string if missing
    padding = len(base64_string) % 4
    if padding:
        base64_string += '=' * (4 - padding)
    return base64_string
