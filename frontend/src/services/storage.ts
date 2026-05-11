import AsyncStorage from '@react-native-async-storage/async-storage';
import { PredictionResponse } from './api';

const HISTORY_KEY = '@nurtureaqua_history';

export interface HistoryItem {
  id: string;
  date: string;
  prediction: string;
  confidence: number;
  symptoms: string[];
  isHealthy: boolean;
}

export const saveDiagnosisToHistory = async (
  result: PredictionResponse,
  symptoms: string[]
): Promise<void> => {
  try {
    const history = await getHistory();
    
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      prediction: result.prediction,
      confidence: result.confidence,
      symptoms,
      isHealthy: result.is_healthy,
    };
    
    const newHistory = [newItem, ...history];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    if (historyJson !== null) {
      return JSON.parse(historyJson);
    }
    return [];
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
};

export const clearHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
};
