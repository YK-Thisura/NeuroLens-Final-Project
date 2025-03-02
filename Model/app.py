import os
import numpy as np
import tensorflow as tf
from flask import Flask, request, render_template
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Load the trained model
model = tf.keras.models.load_model("brain_tumor_model.h5")

# Define class labels
class_labels = ["Glioma", "Meningioma", "Notumor", "Pituitary"]

# Set the upload folder
UPLOAD_FOLDER = "static/uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Ensure the upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def predict_tumor(img_path):
    """Function to predict tumor type from MRI image"""
    img = image.load_img(img_path, target_size=(128, 128))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)
    predicted_class = class_labels[np.argmax(predictions)]
    confidence = np.max(predictions) * 100

    return predicted_class, confidence

@app.route("/", methods=["GET", "POST"])
def upload_file():
    if request.method == "POST":
        if "file" not in request.files:
            return render_template("index.html", message="No file uploaded")

        file = request.files["file"]
        if file.filename == "":
            return render_template("index.html", message="No selected file")

        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(file_path)

            # Predict tumor type
            tumor_type, confidence = predict_tumor(file_path)

            return render_template("index.html", 
                                   image_path=file_path, 
                                   prediction=tumor_type, 
                                   confidence=confidence)

    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
