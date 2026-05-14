import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0B1E2D' }}
      contentContainerStyle={{
        padding: 24,
        paddingBottom: 80,
      }}
    >
      {/* HERO */}
      <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 50 }}>
        <Text style={{ fontSize: 40, marginBottom: 20 }}>🐟</Text>

        <Text
          style={{
            color: 'white',
            fontSize: 32,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Discus AI System
        </Text>

        <Text
          style={{
            color: '#9BA8B5',
            fontSize: 18,
            textAlign: 'center',
            lineHeight: 26,
          }}
        >
          Smart breeding assistant for healthy aquariums
        </Text>
      </View>

      {/* CORE FEATURES */}
      <Text
        style={{
          color: 'white',
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 16,
        }}
      >
        Core Features
      </Text>

      {/* ACTIVE FEATURE */}
      <TouchableOpacity
        onPress={() => router.push('/egg/upload')}
        style={{
          backgroundColor: '#132A3A',
          borderColor: '#00C853',
          borderWidth: 1,
          borderRadius: 18,
          padding: 20,
          marginBottom: 32,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 16,
            backgroundColor: '#0F3D35',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 18,
          }}
        >
          <Text style={{ fontSize: 28 }}>🥚</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: '#00C853',
              fontSize: 22,
              fontWeight: 'bold',
              marginBottom: 6,
            }}
          >
            Egg Classifier
          </Text>

          <Text style={{ color: '#9BA8B5', fontSize: 16, lineHeight: 23 }}>
            Analyze egg health using advanced AI models
          </Text>
        </View>

        <Text style={{ color: '#9BA8B5', fontSize: 34 }}>›</Text>
      </TouchableOpacity>

      {/* COMING SOON */}
      <Text
        style={{
          color: 'white',
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 16,
        }}
      >
        Coming Soon
      </Text>

      {/* EARLY BREEDING READINESS */}
      <View
        style={{
          backgroundColor: '#132A3A',
          opacity: 0.55,
          borderRadius: 18,
          padding: 20,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 16,
            backgroundColor: '#1E2A38',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 18,
          }}
        >
          <Text style={{ fontSize: 28 }}>💧</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: '#D5DDE5',
              fontSize: 21,
              fontWeight: 'bold',
              marginBottom: 6,
            }}
          >
            Early Breeding Readiness
          </Text>

          <Text style={{ color: '#9BA8B5', fontSize: 15 }}>
            Predict pair readiness before spawning
          </Text>
        </View>

        <Text style={{ color: '#9BA8B5', fontWeight: 'bold' }}>WIP</Text>
      </View>

      {/* FRY STAGE HELPER */}
      <View
        style={{
          backgroundColor: '#132A3A',
          opacity: 0.55,
          borderRadius: 18,
          padding: 20,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 16,
            backgroundColor: '#1E2A38',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 18,
          }}
        >
          <Text style={{ fontSize: 28 }}>🐠</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: '#D5DDE5',
              fontSize: 21,
              fontWeight: 'bold',
              marginBottom: 6,
            }}
          >
            Fry Stage Helper
          </Text>

          <Text style={{ color: '#9BA8B5', fontSize: 15 }}>
            Support fry care, feeding, and survival tracking
          </Text>
        </View>

        <Text style={{ color: '#9BA8B5', fontWeight: 'bold' }}>WIP</Text>
      </View>
    </ScrollView>
  );
}