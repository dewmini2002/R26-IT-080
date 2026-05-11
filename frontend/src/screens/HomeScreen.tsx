import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { AppCard } from '../components/AppCard';
import { COLORS } from '../constants/theme';
import { Microscope, History, Activity } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>NurtureAqua</Text>
          <Text style={styles.subtitle}>AI-Based Discus Disease Detection</Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Diagnosis')}>
          <AppCard style={styles.mainCard} glow={true}>
            <View style={styles.iconContainer}>
              <Activity size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Diagnose Fish Disease</Text>
            <Text style={styles.cardDescription}>
              Upload an image and select symptoms to get an AI-powered health assessment.
            </Text>
          </AppCard>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity style={styles.flex1} activeOpacity={0.8} onPress={() => navigation.navigate('Diagnosis')}>
            <AppCard>
              <Microscope size={32} color={COLORS.primary} style={styles.smallIcon} />
              <Text style={styles.smallCardTitle}>Start Diagnosis</Text>
            </AppCard>
          </TouchableOpacity>

          <TouchableOpacity style={styles.flex1} activeOpacity={0.8} onPress={() => navigation.navigate('History')}>
            <AppCard>
              <History size={32} color={COLORS.primary} style={styles.smallIcon} />
              <Text style={styles.smallCardTitle}>View History</Text>
            </AppCard>
          </TouchableOpacity>
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
    flexGrow: 1,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: COLORS.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  mainCard: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(22, 34, 65, 0.8)',
    borderColor: COLORS.primary,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 15,
  },
  flex1: {
    flex: 1,
  },
  smallIcon: {
    marginBottom: 15,
  },
  smallCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
