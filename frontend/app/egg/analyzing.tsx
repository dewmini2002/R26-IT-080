import { View, Text, ActivityIndicator, SafeAreaView } from 'react-native';
import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { analyzeEgg } from '../../services/api';

export default function AnalyzingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    sendData();
  }, []);

  const sendData = async () => {
    try {
      const imageUri = decodeURIComponent(params.imageUri as string);

      const context = {
        hours_since_spawn: Number(params.hours),
        temperature: Number(params.temperature),
        tds: Number(params.tds),
        ph: Number(params.ph),
        parents_present: params.parentsPresent === "true",
      };

      const result = await analyzeEgg(imageUri, context);

      console.log("API RESULT:", result);

      // -----------------------------
      // INVALID IMAGE HANDLING
      // -----------------------------
      if (result.error === "INVALID_IMAGE") {
        router.replace({
          pathname: '/egg/result',
          params: {
            data: JSON.stringify({
              invalid: true,
              message: result.message,
              confidence: result.confidence,
              confidence_level: result.confidence_level
            })
          }
        });
        return;
      }

      // -----------------------------
      // OTHER BACKEND ERROR HANDLING
      // -----------------------------
      if (result.error) {
        router.replace({
          pathname: '/egg/result',
          params: {
            data: JSON.stringify({
              invalid: true,
              message: result.message || "Analysis failed. Please try again."
            })
          }
        });
        return;
      }

      // -----------------------------
      // NORMAL FLOW
      // -----------------------------
      if (result.requires_validation === true) {
        router.replace({
          pathname: '/egg/validation',
          params: {
            data: JSON.stringify(result)
          }
        });
      } else {
        router.replace({
          pathname: '/egg/result',
          params: {
            data: JSON.stringify(result)
          }
        });
      }

    } catch (error) {
      console.log("ERROR:", error);

      router.replace({
        pathname: '/egg/result',
        params: {
          data: JSON.stringify({
            invalid: true,
            message: "Network or server error. Please check backend connection."
          })
        }
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1E2D' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00C853" />
        <Text style={{ color: 'white', marginTop: 10 }}>
          Analyzing with AI...
        </Text>
      </View>
    </SafeAreaView>
  );
}