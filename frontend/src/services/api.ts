import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE_URL = 'http://192.168.8.121:8000';

export interface PredictionResponse {
  status: string;
  prediction: string;
  is_healthy: boolean;
  confidence: number;
  symptom_validation?: {
    predicted_class: string;
    expected_symptoms_display: string[];
    user_symptoms_display: string[];
    matched_symptoms_display: string[];
    unmatched_symptoms_display: string[];
    match_percentage: number;
  };
  detections: Array<{
    class_name: string;
    display_name: string;
    confidence: number;
    bbox: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
  }>;
}

export const predictDisease = async (
  imageUri: string,
  symptoms: string[]
): Promise<PredictionResponse> => {
  try {
    const formData = new FormData();
    
    // Convert symptoms array to comma-separated string
    const symptomsString = symptoms.join(',');
    formData.append('symptoms', symptomsString);

    // Append image
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('file', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      name: filename,
      type,
    } as any);

    const response = await axios.post<PredictionResponse>(`${API_BASE_URL}/predict`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to connect to the prediction server. Please check your network and try again.');
  }
};
