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


@app.route('/get_all_doctors_gig', methods=['GET'])
def get_all_doctors():
    try:
        cursor.execute("SELECT * FROM doctors")
        doctors = cursor.fetchall()

        doctor_list = []
        for doctor in doctors:
            image_data = doctor[3]  # Assuming the image is stored in the 3rd column
            
            # Ensure the image data is in bytes
            if isinstance(image_data, str):
                # If the image data is base64 encoded already, decode it
                image_data = add_padding(image_data)  # Add padding if necessary
                image_data = base64.b64decode(image_data)  # Decode from base64 to bytes
            elif isinstance(image_data, bytes):
                # If it's already in bytes, no need to decode
                pass
            else:
                image_data = None  # Handle cases where there is no image

            if image_data:
                # Convert image data to base64 (assuming it's in bytes now)
                image_base64 = base64.b64encode(image_data).decode('utf-8')
            else:
                image_base64 = None  # In case there is no image data

            doctor_data = {
                'id': doctor[0],
                'email': doctor[7],
                'status': doctor[13],
                'first_name': doctor[1],
                'last_name': doctor[2],
                'image': image_base64,  # Base64 encoded image
                'specialization': doctor[6],
                'description': doctor[11],
                'country': doctor[9],
            }
            doctor_list.append(doctor_data)

        return jsonify({'doctors': doctor_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/get_approved_doctors_gig', methods=['GET'])
def get_approved_doctors():
    try:
        cursor.execute("SELECT * FROM doctors WHERE status = 'approved'")
        doctors = cursor.fetchall()

        doctor_list = []
        for doctor in doctors:
            image_data = doctor[3]  # Assuming the image is stored in the 3rd column
            
            # Ensure the image data is in bytes
            if isinstance(image_data, str):
                # If the image data is base64 encoded already, decode it
                image_data = add_padding(image_data)  # Add padding if necessary
                image_data = base64.b64decode(image_data)  # Decode from base64 to bytes
            elif isinstance(image_data, bytes):
                # If it's already in bytes, no need to decode
                pass
            else:
                image_data = None  # Handle cases where there is no image

            if image_data:
                # Convert image data to base64 (assuming it's in bytes now)
                image_base64 = base64.b64encode(image_data).decode('utf-8')
            else:
                image_base64 = None  # In case there is no image data

            doctor_data = {
                'id': doctor[0],
                'email': doctor[7],
                'first_name': doctor[1],
                'last_name': doctor[2],
                'image': image_base64,  # Base64 encoded image
                'specialization': doctor[6],
                'description': doctor[11],
                'country': doctor[9],
            }
            doctor_list.append(doctor_data)

        return jsonify({'doctors': doctor_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/get_doctor/<int:doctor_id>', methods=['GET'])
def get_doctor_by_id(doctor_id):
    try:
        cursor.execute("SELECT * FROM doctors WHERE id = %s AND status = 'approved'", (doctor_id,))
        doctor = cursor.fetchone()

        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404

        image_data = doctor[3]  # Assuming the image is in the 3rd column

        # Ensure the image data is in bytes
        if isinstance(image_data, str):
            image_data = add_padding(image_data)  # Add padding if necessary
            image_data = base64.b64decode(image_data)  # Decode from base64 to bytes
        elif isinstance(image_data, bytes):
            pass
        else:
            image_data = None  # Handle cases where there is no image

        image_base64 = base64.b64encode(image_data).decode('utf-8') if image_data else None

        doctor_data = {
            'id': doctor[0],
            'email': doctor[7],
            'age': doctor[5],
            'gender': doctor[8],
            'contact': doctor[4],
            'qualification': doctor[10],
            'first_name': doctor[1],
            'last_name': doctor[2],
            'image': image_base64,  # Base64 encoded image
            'specialization': doctor[6],
            'description': doctor[11],
            'country': doctor[9],
        }

        return jsonify(doctor_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/update_doctor_status', methods=['POST'])
def update_doctor_status():
    try:
        # Get data from the POST request
        data = request.get_json()
        doctor_id = data.get('id')
        action = data.get('action')  # Action can be 'approve' or 'reject'

        # Validate input
        if doctor_id is None or action not in ['approve', 'reject']:
            return jsonify({'error': 'Invalid data provided'}), 400

        # Update the status of the doctor in the database
        status = 'approved' if action == 'approve' else 'rejected'
        
        # Execute the update query
        cursor.execute("UPDATE doctors SET status = %s WHERE id = %s", (status, doctor_id))
        db.commit()

        return jsonify({'message': f'Doctor profile {status} successfully.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/users/doctors', methods=['GET'])
def get_doctor_users():
    try:

        cursor.execute("SELECT id, username, email FROM users WHERE email LIKE 'dr.%' ORDER BY id ASC")
        users = cursor.fetchall()

        doctor_list = []
        for user in users:
            doctor_data = {
                'id': user[0],
                'username': user[1],
                'email': user[2],
            }
            doctor_list.append(doctor_data)

        return jsonify({'doctors': doctor_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/users/doctors/<int:user_id>', methods=['PUT'])
def update_doctor_user(user_id):
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')

        print(data)

        # Ensure the new email still starts with 'dr.'
        if email and not email.lower().startswith("dr."):
            return jsonify({'error': "Email must start with 'dr.'"}), 400

        cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user or not user[0].lower().startswith("dr."):
            return jsonify({'error': "Doctor user not found"}), 404

        cursor.execute("UPDATE users SET username = %s, email = %s WHERE id = %s", (username, email, user_id))
        db.commit()

        return jsonify({'message': 'Doctor user updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/users/doctors/<int:user_id>', methods=['DELETE'])
def delete_doctor_user(user_id):
    try:
        cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user or not user[0].lower().startswith("dr."):
            return jsonify({'error': "Doctor user not found"}), 404

        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        db.commit()

        return jsonify({'message': 'Doctor user deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/users', methods=['GET'])
def get_all_users():
    try:
        cursor.execute("SELECT id, username, email FROM users WHERE email NOT LIKE 'dr.%' ORDER BY id ASC")
        users = cursor.fetchall()

        user_list = []
        for user in users:
            user_data = {
                'id': user[0],
                'username': user[1],
                'email': user[2],
            }
            user_list.append(user_data)

        return jsonify({'users': user_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')

        cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': "User not found"}), 404

        cursor.execute("UPDATE users SET username = %s, email = %s WHERE id = %s", (username, email, user_id))
        db.commit()

        return jsonify({'message': 'User updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': "User not found"}), 404

        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        db.commit()

        return jsonify({'message': 'User deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Function to check allowed file types
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# API Endpoint to Upload Prescription
@app.route("/upload_prescription", methods=["POST"])
def upload_prescription():
    if "prescription" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["prescription"]
    doctor_id = request.form.get("doctor_id")  # Assuming doctor_id is sent in form data

    if not doctor_id:
        return jsonify({"error": "Doctor ID is required"}), 400

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        # Save file path in MySQL database
        try:
        
            query = "INSERT INTO prescriptions (doctor_id, file_path) VALUES (%s, %s)"
            cursor.execute(query, (doctor_id, file_path))
            db.commit()

            return jsonify({"message": "File uploaded successfully", "file_path": file_path}), 200

        except mysql.connector.Error as err:
            return jsonify({"error": f"Database error: {err}"}), 500

    return jsonify({"error": "Invalid file type. Only PDFs are allowed."}), 400

@app.route('/get_prescriptions', methods=['GET'])
def get_prescriptions():

    # cursor = db.cursor(dictionary=True)  # Enables dict format
    cursor.execute("SELECT * FROM prescriptions")
    prescriptions = cursor.fetchall()

    prescriptions_list = []
    for pres in prescriptions:

        prescriptions_data = {
                    'doctor_id': pres[1],
                    'file_path':  os.path.basename(pres[2]),
                    'uploaded_at': pres[3],
        }
        prescriptions_list.append(prescriptions_data)

    return jsonify({'prescriptions': prescriptions_list}), 200
