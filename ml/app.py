# server/app.py
from flask import Flask, request, jsonify
import joblib
import numpy as np

# Initialize Flask app
app = Flask(__name__)

# Load the trained model
model = joblib.load('carbon_footprint_model.pkl')

@app.route('/')
def home():
    return "EcoTrack - Carbon Footprint Prediction API"

@app.route('/predict', methods=['POST'])
def predict():
    # Get data from the request
    data = request.get_json()

    # Ensure data contains necessary keys
    if not all(k in data for k in ("Transportation", "Energy", "DietType")):
        return jsonify({"error": "Missing input data"}), 400

    # Prepare input data for prediction
    transportation = data['Transportation']
    energy = data['Energy']
    diet_type = data['DietType']

    # Predict using the loaded model
    prediction = model.predict(np.array([[transportation, energy, diet_type]]))

    # Return the prediction as JSON
    return jsonify({"predicted_total_emission": prediction[0]})

if __name__ == '__main__':
    app.run(debug=True)
