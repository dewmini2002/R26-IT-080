import { Platform } from "react-native";

const DEFAULT_HOST = "10.178.250.92"; // Replace with your local machine's IP address
const DEFAULT_PORT = "8000";

const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL = envBaseUrl?.trim()
  ? envBaseUrl.trim()
  : `http://${DEFAULT_HOST}:${DEFAULT_PORT}`;

export const getLatestTemperature = async () => {
  const response = await fetch(
    `${API_BASE_URL}/sensor/temperature/latest`
  );

  return await response.json();
};

export const getLatestPH = async () => {
  const response = await fetch(
    `${API_BASE_URL}/sensor/ph/latest`
  );

  return await response.json();
};

console.log("API URL =", API_BASE_URL);