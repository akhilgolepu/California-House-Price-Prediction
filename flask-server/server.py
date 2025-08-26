import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import pickle
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from custom_transformers import CombinedAttributesAdder, DataFrameSelector

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST"], "allow_headers": ["Content-Type"]}})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    return response

@app.route("/")
def home():
    return "Flask server is running!"

@app.route("/members")
def members():
    return jsonify(["Alice", "Bob", "Charlie"])

# --- ML Prediction Endpoint ---
@app.route("/predict", methods=["POST"])
def predict():
    try:
        print("Received prediction request")
        # Load model and pipeline (ensure these files are in flask-server or use correct path)
        model_path = "E:\\23881A66E2\\Projects\\California_House_Price\\models\\model.pkl"
        pipeline_path = "E:\\23881A66E2\\Projects\\California_House_Price\\models\\pipeline.pkl"
        
        print(f"Loading model from {model_path}")
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        print("Model loaded successfully")
        
        print(f"Loading pipeline from {pipeline_path}")
        with open(pipeline_path, "rb") as f:
            pipeline = pickle.load(f)
        print("Pipeline loaded successfully")
        
        # Get input data
        input_data = request.get_json()
        print(f"Received input data: {input_data}")
        
        input_df = pd.DataFrame([input_data])
        print("Created input DataFrame")
        
        input_prepared = pipeline.transform(input_df)
        print("Data transformed through pipeline")
        
        prediction = model.predict(input_prepared)
        print(f"Prediction made: {prediction[0]}")
        
        return jsonify({"prediction": float(prediction[0])})
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)