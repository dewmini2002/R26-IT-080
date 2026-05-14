import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { finalizeDecision } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function ValidationScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();

  const result = JSON.parse(data as string);
  const questions = result.questions || [];

  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const handleAnswer = (index: number, value: string) => {
    setAnswers({ ...answers, [index]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await finalizeDecision({
        probabilities: result.probabilities,
        answers: answers,
        context: result.context
      });

      router.replace({
        pathname: '/egg/result',
        params: {
          data: JSON.stringify({
            ...result,
            final_decision: response.final_decision
          })
        }
      });

    } catch (e) {
      console.log("FINAL ERROR:", e);
    }
  };

  const isAllAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1E2D' }}>
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>

        <View style={{ marginBottom: 32, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="shield-checkmark" size={20} color="#00C853" style={{ marginRight: 8 }} />
            <Text style={{ color: '#00C853', fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
              Step 2: Improve Accuracy
            </Text>
          </View>
          <Text style={{ color: 'white', fontSize: 28, fontWeight: '800', marginBottom: 8 }}>
            Expert Validation
          </Text>
          <Text style={{ color: '#8899A6', fontSize: 16, lineHeight: 24 }}>
            Please answer these questions to help the AI finalize its decision.
          </Text>
        </View>

        {questions.map((q: string, index: number) => (
          <View key={index} style={{
            backgroundColor: '#132A3A',
            padding: 20,
            borderRadius: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#1E2A38',
          }}>
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
              lineHeight: 24,
              marginBottom: 16
            }}>
              {index + 1}. {q}
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => handleAnswer(index, 'yes')}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: answers[index] === 'yes' ? 'rgba(0, 200, 83, 0.15)' : '#1E2A38',
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: answers[index] === 'yes' ? '#00C853' : 'transparent',
                }}
              >
                {answers[index] === 'yes' && <Ionicons name="checkmark-circle" size={18} color="#00C853" style={{ marginRight: 6 }} />}
                <Text style={{ 
                  color: answers[index] === 'yes' ? '#00C853' : 'white', 
                  fontWeight: '700',
                  fontSize: 16
                }}>
                  Yes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleAnswer(index, 'no')}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: answers[index] === 'no' ? 'rgba(255, 82, 82, 0.15)' : '#1E2A38',
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: answers[index] === 'no' ? '#FF5252' : 'transparent',
                }}
              >
                {answers[index] === 'no' && <Ionicons name="close-circle" size={18} color="#FF5252" style={{ marginRight: 6 }} />}
                <Text style={{ 
                  color: answers[index] === 'no' ? '#FF5252' : 'white', 
                  fontWeight: '700',
                  fontSize: 16
                }}>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ flex: 1, justifyContent: 'flex-end', marginTop: 24, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isAllAnswered}
            activeOpacity={0.8}
            style={{
              backgroundColor: isAllAnswered ? '#00C853' : '#1E2A38',
              padding: 18,
              borderRadius: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              shadowColor: isAllAnswered ? '#00C853' : 'transparent',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isAllAnswered ? 0.3 : 0,
              shadowRadius: 8,
              elevation: isAllAnswered ? 6 : 0,
            }}
          >
            <Text style={{
              color: isAllAnswered ? 'white' : '#8899A6',
              fontWeight: '700',
              fontSize: 16,
              marginRight: 8
            }}>
              Submit Answers
            </Text>
            <Ionicons name="checkmark-done" size={20} color={isAllAnswered ? "white" : "#8899A6"} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
