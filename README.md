# California-House-Price-Prediction
A full-stack Machine Learning web application that predicts California house prices based on key features like median income, population, and location.

## Screenshots
<img width="2560" height="1440" alt="Screenshot (7)" src="https://github.com/user-attachments/assets/fdb1091d-1b66-4767-a382-6ab4ce4e5c95" />

## Features

The machine learning model was trained using Scikit-Learn on the California housing dataset, allowing it to accurately predict house prices based on key features. The backend is built with Flask, which is responsible for handling model inference and managing API endpoints that connect the prediction logic with the frontend. The frontend is developed using React.js to provide an interactive user interface where users can input housing attributes and instantly view the predicted prices. To better understand the dataset, exploratory data analysis (EDA) was performed, revealing important trends and patterns that guided model development. The entire application is deployment-ready and can be hosted on platforms such as Render, Heroku, or Vercel for easy access and scalability.

## Tech Stack

Frontend: React.js
Backend: Flask (Python)

Machine Learning: Pandas, NumPy, Scikit-Learn, Matplotlib, Seaborn

## Workflow

Perform EDA and preprocess the California housing dataset.

Train and evaluate regression models.

Save the trained model using pickle.

Integrate Flask backend for predictions.

Build React frontend for user interaction.

Deploy the complete application.

## Usage

Users can enter housing features such as median income, population, and location into the web application through a simple form. Once the details are provided, they can click on the Predict button, which sends the input data to the backend for processing. The trained machine learning model then analyzes the inputs and returns the estimated house price, which is instantly displayed on the frontend for the user.
