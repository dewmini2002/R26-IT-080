import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Droplets } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NurtureAqua</Text>
      </View>

      <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push('/tank-optimization')}
        activeOpacity={0.8}
      >
        <View style={styles.cardIconContainer}>
          <Droplets color="#00E5FF" size={32} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Tank Optimization</Text>
          <Text style={styles.cardSubtitle}>AI-powered fish count, size and volume estimation</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1128',
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00E5FF',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#162032',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3B5C',
    elevation: 8,
  },
  cardIconContainer: {
    backgroundColor: '#0A1128',
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: '#A0AABF',
    fontSize: 14,
    lineHeight: 20,
  },
});
