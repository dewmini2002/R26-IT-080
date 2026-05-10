import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';

interface ImagePickerBoxProps {
  label: string;
  imageUri: string | null;
  onPress: () => void;
}

export const ImagePickerBox: React.FC<ImagePickerBoxProps> = ({ label, imageUri, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.box} onPress={onPress} activeOpacity={0.7}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Plus color="#00E5FF" size={32} />
            <Text style={styles.placeholderText}>Tap to add</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  label: {
    color: '#E0E0E0',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#162032',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3B5C',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#00E5FF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
