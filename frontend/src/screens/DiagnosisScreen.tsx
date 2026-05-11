import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppCard } from '../components/AppCard';
import { Button } from '../components/Button';
import { SymptomCheckbox } from '../components/SymptomCheckbox';
import { SectionHeader } from '../components/SectionHeader';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { COLORS } from '../constants/theme';
import { SYMPTOMS } from '../constants/symptoms';
import { predictDisease, PredictionResponse } from '../services/api';
import { saveDiagnosisToHistory } from '../services/storage';
import { Upload, Camera, Activity } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type DiagnosisScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Diagnosis'>;

interface Props {
  navigation: DiagnosisScreenNavigationProp;
}

export const DiagnosisScreen: React.FC<Props> = ({ navigation }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) => 
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleDiagnose = async () => {
    if (!imageUri) {
      Alert.alert('Missing Image', 'Please select a fish image first.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await predictDisease(imageUri, selectedSymptoms);
      await saveDiagnosisToHistory(result, selectedSymptoms);
      navigation.navigate('Result', { result });
    } catch (error: any) {
      Alert.alert('Diagnosis Failed', error.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LoadingOverlay visible={isLoading} message="Analyzing image and symptoms..." />
      <ScrollView contentContainerStyle={styles.container}>
        
        <SectionHeader title="1. Select Image" />
        <AppCard>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <Button 
                title="Change Image" 
                variant="secondary" 
                onPress={pickImage} 
                icon={<Camera size={20} color={COLORS.primary} />}
              />
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.uploadIconContainer}>
                <Upload size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.uploadText}>No image selected</Text>
              <Button 
                title="Choose from Gallery" 
                onPress={pickImage} 
                icon={<Upload size={20} color="#000" />}
              />
            </View>
          )}
        </AppCard>

        <SectionHeader title="2. Select Symptoms" />
        <AppCard style={styles.symptomsCard}>
          <Text style={styles.symptomsSubtitle}>
            Check all the symptoms you observe in your fish:
          </Text>
          <View style={styles.symptomsContainer}>
            {SYMPTOMS.map((symptom) => (
              <SymptomCheckbox
                key={symptom.id}
                label={symptom.label}
                checked={selectedSymptoms.includes(symptom.id)}
                onToggle={() => toggleSymptom(symptom.id)}
              />
            ))}
          </View>
        </AppCard>

        <View style={styles.actionContainer}>
          <Button 
            title="Diagnose Now" 
            onPress={handleDiagnose} 
            disabled={!imageUri}
            icon={<Activity size={24} color={!imageUri ? COLORS.textSecondary : "#000"} />}
          />
          {!imageUri && (
            <Text style={styles.helperText}>Select an image to enable diagnosis</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadText: {
    color: COLORS.textSecondary,
    marginBottom: 20,
    fontSize: 16,
  },
  symptomsCard: {
    paddingTop: 15,
  },
  symptomsSubtitle: {
    color: COLORS.textSecondary,
    marginBottom: 15,
    fontSize: 14,
  },
  symptomsContainer: {
    marginTop: 5,
  },
  actionContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  helperText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    fontSize: 12,
  },
});
