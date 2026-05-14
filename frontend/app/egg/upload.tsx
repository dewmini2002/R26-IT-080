import { View, Text, TouchableOpacity, Image, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function UploadScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1E2D' }}>
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'space-between' }}>
        
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{
            color: 'white',
            fontSize: 28,
            fontWeight: '800',
            marginBottom: 8,
            textAlign: 'center'
          }}>
            Upload Image
          </Text>
          <Text style={{
            color: '#8899A6',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 40
          }}>
            Select a clear image of the discus eggs for AI analysis
          </Text>

          {/* IMAGE PREVIEW CARD */}
          <View style={{
            width: width - 48,
            height: width - 48,
            backgroundColor: '#132A3A',
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: image ? '#00C853' : '#1E2A38',
            borderStyle: image ? 'solid' : 'dashed',
            marginBottom: 32
          }}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="image-outline" size={64} color="#8899A6" />
                <Text style={{ color: '#8899A6', marginTop: 16, fontSize: 16, fontWeight: '500' }}>
                  No image selected
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* BOTTOM ACTION BUTTONS */}
        <View style={{ paddingBottom: 20 }}>
          <TouchableOpacity 
            onPress={pickImage} 
            style={[styles.btn, styles.secondaryBtn]}
            activeOpacity={0.8}
          >
            <Ionicons name="images" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              {image ? 'Choose Different Image' : 'Pick from Gallery'}
            </Text>
          </TouchableOpacity>

          {image && (
            <TouchableOpacity
              onPress={() => router.push(`/egg/conditions?imageUri=${encodeURIComponent(image)}`)}
              style={[styles.btn, styles.primaryBtn]}
              activeOpacity={0.8}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginRight: 8 }}>
                Continue
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  btn: {
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    width: '100%',
  },
  primaryBtn: {
    backgroundColor: '#00C853',
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryBtn: {
    backgroundColor: '#1E2A38',
    borderWidth: 1,
    borderColor: '#2A3F54',
  }
};
