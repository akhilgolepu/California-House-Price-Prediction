import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMapEvent } from 'react-leaflet';

const COLORS = {
  bg: "#FAFFCA",
  card: "#B9D4AA",
  accent: "#84AE92",
  button: "#5A827E",
};

const OCEAN_OPTIONS = [
  "<1H OCEAN",
  "INLAND",
  "ISLAND",
  "NEAR BAY",
  "NEAR OCEAN"
];

const FEATURE_RANGES = {
  longitude: { min: -124.35, max: -114.31 },
  latitude: { min: 32.54, max: 41.95 },
  housing_median_age: { min: 1, max: 52 },
  total_rooms: { min: 2, max: 39320 },
  total_bedrooms: { min: 1, max: 6445 },
  population: { min: 3, max: 35682 },
  households: { min: 1, max: 6082 },
  median_income: { min: 0.4999, max: 15.0001 },
};

const SAMPLE_DATA = [
  { longitude: -122.23, latitude: 37.88, housing_median_age: 41, total_rooms: 880, total_bedrooms: 129, population: 322, households: 126, median_income: 8.3252, ocean_proximity: "NEAR BAY" },
  { longitude: -122.22, latitude: 37.86, housing_median_age: 21, total_rooms: 7099, total_bedrooms: 1106, population: 2401, households: 1138, median_income: 8.3014, ocean_proximity: "NEAR BAY" },
  { longitude: -122.24, latitude: 37.85, housing_median_age: 52, total_rooms: 1467, total_bedrooms: 190, population: 496, households: 177, median_income: 7.2574, ocean_proximity: "NEAR BAY" },
  { longitude: -122.25, latitude: 37.85, housing_median_age: 52, total_rooms: 1274, total_bedrooms: 235, population: 558, households: 219, median_income: 5.6431, ocean_proximity: "NEAR BAY" },
  { longitude: -122.25, latitude: 37.85, housing_median_age: 52, total_rooms: 1627, total_bedrooms: 280, population: 565, households: 259, median_income: 3.8462, ocean_proximity: "NEAR BAY" },
];

// Configurable API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const locationIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/images/location.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Add LocationMarker component
function LocationMarker({ setForm }) {
  useMapEvent('click', (e) => {
    setForm((prev) => ({
      ...prev,
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
    }));
  });
  return null;
}

export default function App() {
  const [form, setForm] = useState({
    longitude: "",
    latitude: "",
    housing_median_age: "",
    total_rooms: "",
    total_bedrooms: "",
    population: "",
    households: "",
    median_income: "",
    ocean_proximity: OCEAN_OPTIONS[0],
  });
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef();

  const integerFields = [
    "housing_median_age",
    "total_rooms",
    "total_bedrooms",
    "population",
    "households"
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;
    if (FEATURE_RANGES[name]) {
      const min = FEATURE_RANGES[name].min;
      const max = FEATURE_RANGES[name].max;
      let num = integerFields.includes(name) ? parseInt(value) : parseFloat(value);
      if (isNaN(num)) num = '';
      else num = Math.max(min, Math.min(max, num));
      newValue = num;
    }
    setForm({ ...form, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPrediction(null);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          longitude: parseFloat(form.longitude),
          latitude: parseFloat(form.latitude),
          housing_median_age: parseFloat(form.housing_median_age),
          total_rooms: parseFloat(form.total_rooms),
          total_bedrooms: parseFloat(form.total_bedrooms),
          population: parseFloat(form.population),
          households: parseFloat(form.households),
          median_income: parseFloat(form.median_income),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setPrediction(data.prediction);
      } else {
        setError(data.error || "Prediction failed");
      }
    } catch (err) {
      setError("Could not connect to API");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.bg }}>
      {/* Left: Inputs */}
      <div style={{ flex: 1, maxWidth: 500, margin: '2rem', background: COLORS.card, borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <h1 style={{ color: COLORS.button, textAlign: 'center', padding: '1rem' }}>
          California House Price Predictor
        </h1>
        <p style={{ color: COLORS.accent, textAlign: 'center', maxWidth: 700, margin: '0 auto 2rem auto', fontSize: '1.1rem', fontWeight: 500 }}>
          This project uses machine learning to predict housing prices in California based on key features such as median income, housing age, population, and proximity to the ocean. The dataset is preprocessed using feature engineering, missing value imputation, and encoding techniques. A Random Forest Regressor is trained and deployed via a Flask API, allowing users to input house details and instantly receive predicted prices. The entire pipeline — from data preparation to model deployment — showcases the practical application of machine learning in real estate analytics.
        </p>
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {[ // numeric fields
            { name: "longitude", label: "Longitude" },
            { name: "latitude", label: "Latitude" },
            { name: "housing_median_age", label: "Housing Median Age" },
            { name: "total_rooms", label: "Total Rooms" },
            { name: "total_bedrooms", label: "Total Bedrooms" },
            { name: "population", label: "Population" },
            { name: "households", label: "Households" },
            { name: "median_income", label: "Median Income" },
          ].map((field) => (
            <div key={field.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ color: COLORS.accent, fontWeight: 600, minWidth: 140 }}>
                {field.label}
              </label>
              <input
                type="range"
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                required
                min={FEATURE_RANGES[field.name].min}
                max={FEATURE_RANGES[field.name].max}
                step={integerFields.includes(field.name) ? 1 : "any"}
                style={{ flex: 1 }}
              />
              <input
                type="number"
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                min={FEATURE_RANGES[field.name].min}
                max={FEATURE_RANGES[field.name].max}
                step={integerFields.includes(field.name) ? 1 : "any"}
                style={{ width: 90, marginLeft: 8, borderRadius: 8, border: `1px solid ${COLORS.accent}`, padding: '0.3rem 0.5rem' }}
              />
            </div>
          ))}
          <label style={{ color: COLORS.accent, fontWeight: 600 }}>
            Ocean Proximity
          </label>
          <select
            name="ocean_proximity"
            value={form.ocean_proximity}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 8,
              border: `1px solid ${COLORS.accent}`,
              marginTop: 4,
            }}
          >
            {OCEAN_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              background: COLORS.button,
              color: "#fff",
              padding: "0.75rem",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "1rem",
              marginTop: "1rem",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Predict Price
          </button>
          {prediction && (
            <div
              style={{
                background: COLORS.accent,
                color: "#fff",
                padding: "1rem",
                borderRadius: 8,
                marginTop: "1rem",
                textAlign: "center",
                fontWeight: 700,
                fontSize: "1.2rem",
              }}
            >
              Predicted Price: ${prediction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          )}
          {error && (
            <div
              style={{
                background: "#ffcccc",
                color: "#a00",
                padding: "1rem",
                borderRadius: 8,
                marginTop: "1rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
        </form>
        {/* Address display */}
        <div style={{ marginTop: 24, color: COLORS.button, fontWeight: 600, textAlign: 'center' }}>
          <span>Address (Lat, Lon): </span>
          <span>{form.latitude}, {form.longitude}</span>
        </div>
      </div>
      {/* Right: Map */}
      <div style={{ flex: 2, margin: '2rem', borderRadius: 16, overflow: 'hidden', background: COLORS.card, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <MapContainer
          center={[
            form.latitude ? parseFloat(form.latitude) : 36.7783,
            form.longitude ? parseFloat(form.longitude) : -119.4179
          ]}
          zoom={6}
          style={{ height: '70vh', width: '100%', marginBottom: '2rem' }}
          maxBounds={[[32.5, -124.5], [42.0, -114.0]]}
          minZoom={6}
          maxZoom={12}
          scrollWheelZoom={true}
          dragging={true}
          whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Add LocationMarker for map click */}
          <LocationMarker setForm={setForm} />
          <Marker
            position={[
              form.latitude ? parseFloat(form.latitude) : 36.7783,
              form.longitude ? parseFloat(form.longitude) : -119.4179
            ]}
            icon={locationIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                setForm((prev) => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                }));
              },
            }}
          >
            <Popup>
              Selected Location<br />
              Lat: {form.latitude}, Lon: {form.longitude}
            </Popup>
          </Marker>
        </MapContainer>
        {/* Sample Data Extender */}
        <details style={{ width: '90%', margin: "0 auto 2rem auto", background: COLORS.card, borderRadius: 16, boxShadow: "0 4px 16px rgba(90,130,126,0.1)", padding: "1rem" }}>
          <summary style={{ fontWeight: 700, color: COLORS.button, fontSize: "1.1rem", cursor: "pointer" }}>Show Sample Dataset</summary>
          <div style={{ overflowX: "auto", marginTop: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {Object.keys(SAMPLE_DATA[0]).map((col) => (
                    <th key={col} style={{ border: `1px solid ${COLORS.accent}`, padding: 8, background: COLORS.bg }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_DATA.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} style={{ border: `1px solid ${COLORS.accent}`, padding: 8 }}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}
