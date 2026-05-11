import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { DiagnosisScreen } from './src/screens/DiagnosisScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { COLORS } from './src/constants/theme';
import { PredictionResponse } from './src/services/api';

export type RootStackParamList = {
  Home: undefined;
  Diagnosis: undefined;
  Result: { result: PredictionResponse };
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.card,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: COLORS.background,
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Diagnosis" 
            component={DiagnosisScreen} 
            options={{ title: 'Diagnose Fish' }} 
          />
          <Stack.Screen 
            name="Result" 
            component={ResultScreen} 
            options={{ title: 'Diagnosis Result' }} 
          />
          <Stack.Screen 
            name="History" 
            component={HistoryScreen} 
            options={{ title: 'Diagnosis History' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
