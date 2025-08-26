import pickle

print("Testing model loading...")

try:
    print("Attempting to load model...")
    with open("E:\\23881A66E2\\Projects\\California_House_Price\\models\\model.pkl", "rb") as f:
        model = pickle.load(f)
    print("Model loaded successfully!")

    print("\nAttempting to load pipeline...")
    with open("E:\\23881A66E2\\Projects\\California_House_Price\\models\\pipeline.pkl", "rb") as f:
        pipeline = pickle.load(f)
    print("Pipeline loaded successfully!")

except Exception as e:
    print(f"Error occurred: {str(e)}")