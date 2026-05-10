import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePickerBox } from '../components/ImagePickerBox';
import { ResultCard } from '../components/ResultCard';
import { FishDetailCard } from '../components/FishDetailCard';
import { Stack } from 'expo-router';

const API_BASE_URL = "http://10.55.96.16:8000";

export default function TankOptimizationScreen() {
  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickImage = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }
  };

  const handleAnalyze = async () => {
    if (images.some(img => img === null)) {
      Alert.alert('Error', 'Please select exactly 3 images before analyzing.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();

      images.forEach((uri, index) => {
        if (uri) {
          const filename = uri.split('/').pop() || `image${index + 1}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image`;

          formData.append(`image${index + 1}`, {
            uri,
            name: filename,
            type,
          } as any);
        }
      });

      const response = await fetch(`${API_BASE_URL}/analyze-multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok. Backend might be unreachable.');
      }

      const data = await response.json();

      // Additional checks based on user rules
      if (data.final_fish_count === undefined) {
        throw new Error('Analysis failed. Sticker might not have been detected.');
      }

      setResult(data);
    } catch (error: any) {
      Alert.alert('Analysis Error', error.message || 'Failed to connect to the backend server. Please verify the base URL and network connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{
        title: 'Tank Optimization',
        headerStyle: { backgroundColor: '#0A1128' },
        headerTintColor: '#FFFFFF',
      }} />

      <View style={styles.header}>
        <Text style={styles.title}>Tank Optimization Engine</Text>
        <Text style={styles.subtitle}>AI-powered fish count, size and volume estimation</Text>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Place the 5cm blue sticker clearly on the aquarium glass before capturing images.
        </Text>
      </View>

      <View style={styles.imagePickerRow}>
        <ImagePickerBox label="Image 1" imageUri={images[0]} onPress={() => pickImage(0)} />
        <ImagePickerBox label="Image 2" imageUri={images[1]} onPress={() => pickImage(1)} />
        <ImagePickerBox label="Image 3" imageUri={images[2]} onPress={() => pickImage(2)} />
      </View>

      <TouchableOpacity
        style={[styles.analyzeButton, isLoading && styles.analyzeButtonDisabled]}
        onPress={handleAnalyze}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.analyzeButtonText}>Analyze Tank</Text>
        )}
      </TouchableOpacity>

      {result && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Analysis Results</Text>

          <ResultCard title="Final Fish Count" value={result.final_fish_count} highlight />
          <ResultCard title="Final Estimated Length" value={`${result.final_estimated_length_cm?.toFixed(2)} cm`} />
          <ResultCard title="Final Total Fish Volume" value={`${result.final_total_volume_cm3?.toFixed(2)} cm³`} />
          <ResultCard title="Best Image Used" value={result.best_image} />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Selection Method</Text>
            <Text style={styles.cardText}>{result.selection_method}</Text>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Selected Images</Text>
          <View style={styles.imagePreviewRow}>
            {images.map((uri, idx) => uri ? (
              <Image key={idx} source={{ uri }} style={styles.smallPreview} />
            ) : null)}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Fish Details</Text>
          {result.best_image_result?.fish_details?.map((fish: any, index: number) => (
            <FishDetailCard
              key={index}
              id={fish.id || (index + 1)}
              length={fish.length_cm}
              height={fish.height_cm}
              thickness={fish.thickness_cm}
              volume={fish.volume_cm3}
            />
          ))}
          {(!result.best_image_result?.fish_details || result.best_image_result.fish_details.length === 0) && (
            <Text style={styles.noFishText}>No fish details available.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1128',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00E5FF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0AABF',
    lineHeight: 22,
  },
  instructionContainer: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00E5FF',
    marginBottom: 24,
  },
  instructionText: {
    color: '#E0E0E0',
    fontSize: 14,
    fontWeight: '500',
  },
  imagePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  analyzeButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#2A3B5C',
    shadowOpacity: 0,
    elevation: 0,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#162032',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3B5C',
  },
  cardTitle: {
    color: '#A0AABF',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  imagePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  smallPreview: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3B5C',
  },
  noFishText: {
    color: '#A0AABF',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
  },
});
