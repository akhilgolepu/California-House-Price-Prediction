import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
from sklearn.model_selection import StratifiedShuffleSplit, train_test_split
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.ensemble import RandomForestRegressor
from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from custom_transformers import CombinedAttributesAdder, DataFrameSelector

MODEL_DIR = r"E:\23881A66E2\Projects\California_House_Price\models"
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
PIPELINE_PATH = os.path.join(MODEL_DIR, "pipeline.pkl")

def split_train_test(data, test_ratio):
    np.random.seed(42) 
    shuffled_indices = np.random.permutation(len(data))
    test_set_size = int(len(data) * test_ratio)
    test_indices = shuffled_indices[:test_set_size]
    train_indices = shuffled_indices[test_set_size:]
    return data.iloc[train_indices], data.iloc[test_indices]


data = pd.read_csv("E:\\23881A66E2\\Projects\\California_House_Price\\housing.csv")

data.info()
data["ocean_proximity"].value_counts()
data.describe()

from sklearn.model_selection import train_test_split


train_set, test_set = split_train_test(data, 0.2)
print(len(train_set), "train +", len(test_set), "test")

data["income_cat"] = np.ceil(data["median_income"] / 1.5)
data["income_cat"] = data["income_cat"].where(data["income_cat"] < 5, 5.0)

from sklearn.model_selection import StratifiedShuffleSplit

split = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
for train_index, test_index in split.split(data, data["income_cat"]):
    strat_train_set = data.loc[train_index]
    strat_test_set = data.loc[test_index]


for set in (strat_train_set, strat_test_set):
    set.drop(["income_cat"], axis=1, inplace=True)

def train_and_save():
    os.makedirs(MODEL_DIR, exist_ok=True)
    data = pd.read_csv("housing.csv")
    data["income_cat"] = np.ceil(data["median_income"] / 1.5)
    data["income_cat"] = data["income_cat"].where(data["income_cat"] < 5, 5.0)
    split = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    for train_index, test_index in split.split(data, data["income_cat"]):
        strat_train_set = data.loc[train_index]
        strat_test_set = data.loc[test_index]
    for set_ in (strat_train_set, strat_test_set):
        set_.drop(["income_cat"], axis=1, inplace=True)
    train = strat_train_set.copy()
    train_labels = train["median_house_value"].copy()
    train = train.drop("median_house_value", axis=1)
    # Numeric and categorical attributes
    num_attribs = list(train.drop("ocean_proximity", axis=1))
    cat_attribs = ["ocean_proximity"]
    # Pipelines
    num_pipeline = Pipeline([
        ('selector', DataFrameSelector(num_attribs)),
        ('imputer', SimpleImputer(strategy="median")),
        ('attribs_adder', CombinedAttributesAdder()),
        ('std_scaler', StandardScaler()),
    ])
    cat_pipeline = Pipeline([
        ('selector', DataFrameSelector(cat_attribs)),
        ('onehot', OneHotEncoder()),
    ])
    full_pipeline = FeatureUnion(transformer_list=[
        ("num_pipeline", num_pipeline),
        ("cat_pipeline", cat_pipeline),
    ])
    train_prepared = full_pipeline.fit_transform(train)
    # Model
    model = RandomForestRegressor()
    model.fit(train_prepared, train_labels)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(PIPELINE_PATH, "wb") as f:
        pickle.dump(full_pipeline, f)
        
    accuracy = model.score(train_prepared, train_labels)
    print(f"Training accuracy (R^2): {accuracy:.4f}")

def predict_house_value(input_dict):
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(PIPELINE_PATH, "rb") as f:
        pipeline = pickle.load(f)
    input_df = pd.DataFrame([input_dict])
    input_prepared = pipeline.transform(input_df)
    prediction = model.predict(input_prepared)
    return prediction[0]

app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=["POST"])
def predict():
    input_data = request.get_json()
    try:
        pred = predict_house_value(input_data)
        return jsonify({"prediction": float(pred)})
    except Exception:
        return jsonify({"error": "Prediction failed."}), 400

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--train', action='store_true', help='Train and save the model')
    parser.add_argument('--serve', action='store_true', help='Run the Flask API server')
    args = parser.parse_args()
    if args.train:
        train_and_save()
    if args.serve:
        app.run(debug=True)

