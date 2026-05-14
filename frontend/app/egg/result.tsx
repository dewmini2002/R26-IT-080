import { View, Text, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BarChart } from 'react-native-chart-kit';

export default function ResultScreen() {
  const { data } = useLocalSearchParams();

  let result: any = {};
  try {
    result = JSON.parse(data as string);
  } catch (e) {
    console.log("PARSE ERROR:", e);
  }

  console.log("FULL RESULT:", result);

  // =============================
  // INVALID IMAGE HANDLING
  // =============================
  if (result.invalid) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#0B1E2D',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
      }}>
        <View style={{
          backgroundColor: '#132A3A',
          padding: 24,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: '#FF5252',
          alignItems: 'center'
        }}>
          <Text style={{
            color: '#FF5252',
            fontSize: 28,
            fontWeight: 'bold',
            marginBottom: 12
          }}>
            Invalid Image
          </Text>

          <Text style={{
            color: '#ccc',
            fontSize: 16,
            textAlign: 'center',
            lineHeight: 22
          }}>
            {result.message || "Please upload a clear discus egg image."}
          </Text>
        </View>
      </View>
    );
  }

  // =============================
  // REAL BACKEND DATA EXTRACTION
  // =============================

  const probabilities = result?.probabilities || {};

  const initialAI =
    result?.ai_prediction?.toUpperCase() ||
    result?.predicted_class?.toUpperCase() ||
    "N/A";

  const finalDecision =
    result?.final_decision?.final_class?.toUpperCase() ||
    initialAI ||
    "N/A";

  const rawConfidence =
    result?.final_decision?.confidence ??
    result?.confidence ??
    0;

  const confidencePercent = Math.round(Number(rawConfidence) * 100);

  const severity =
    result?.final_decision?.severity || "N/A";

  const explanation =
    result?.final_decision?.explanation || "No explanation available.";

  const actions =
    result?.final_decision?.actions || [];

  const isShifted = initialAI !== finalDecision;

  const screenWidth = Dimensions.get("window").width;

  const labels = Object.keys(probabilities);
  const values = Object.values(probabilities).map((v: any) =>
    Math.round(Number(v) * 100)
  );

  // =============================
  // COLOR LOGIC
  // =============================

  const getClassColor = (value: string) => {
    if (value === "HEALTHY") return "#00C853";
    if (value === "FUNGAL") return "#FF5252";
    if (value === "UNHEALTHY") return "#FFA726";
    return "#AAAAAA";
  };

  const finalColor = getClassColor(finalDecision);
  const initialColor = getClassColor(initialAI);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: '#0B1E2D'
      }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 40
      }}
    >

      {/* TITLE */}
      <Text style={{
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20
      }}>
        Analysis Result
      </Text>

      {/* FINAL RESULT CARD */}
      <View style={{
        backgroundColor: '#132A3A',
        borderWidth: 2,
        borderColor: finalColor,
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
        marginBottom: 22
      }}>
        <Text style={{
          color: '#9BA8B5',
          fontSize: 15,
          letterSpacing: 1.5,
          fontWeight: 'bold'
        }}>
          FINAL CLASSIFICATION
        </Text>

        <Text style={{
          color: finalColor,
          fontSize: 42,
          fontWeight: 'bold',
          marginTop: 12
        }}>
          {finalDecision}
        </Text>

        <View style={{
          flexDirection: 'row',
          marginTop: 18,
          gap: 12
        }}>
          <View style={{
            backgroundColor: '#1E2A38',
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 20
          }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {confidencePercent}% Conf
            </Text>
          </View>

          <View style={{
            backgroundColor: '#1E2A38',
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 20
          }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Sev: {severity}
            </Text>
          </View>
        </View>
      </View>

      {/* PREDICTION SHIFT CARD */}
      <View style={{
        backgroundColor: '#132A3A',
        borderRadius: 16,
        padding: 20,
        marginBottom: 22
      }}>
        <Text style={{
          color: 'white',
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 18
        }}>
          Prediction Shift
        </Text>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#9BA8B5', marginBottom: 5 }}>
              Initial AI
            </Text>
            <Text style={{
              color: initialColor,
              fontSize: 20,
              fontWeight: 'bold'
            }}>
              {initialAI}
            </Text>
          </View>

          <Text style={{
            color: '#78909C',
            fontSize: 28,
            marginHorizontal: 18
          }}>
            →
          </Text>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ color: '#9BA8B5', marginBottom: 5 }}>
              Validated
            </Text>
            <Text style={{
              color: finalColor,
              fontSize: 20,
              fontWeight: 'bold'
            }}>
              {finalDecision}
            </Text>
          </View>
        </View>

        <View style={{
          backgroundColor: isShifted ? '#2B2636' : '#1A3328',
          borderRadius: 12,
          padding: 14,
          marginTop: 18
        }}>
          <Text style={{
            color: isShifted ? '#FF5252' : '#00C853',
            fontWeight: 'bold',
            fontSize: 15
          }}>
            {isShifted
              ? "⚠ Decision adjusted based on conditions and validation"
              : "✓ AI prediction confirmed by system conditions"}
          </Text>
        </View>
      </View>

      {/* PROBABILITY DISTRIBUTION */}
      {labels.length > 0 && (
        <View style={{
          backgroundColor: '#132A3A',
          borderRadius: 16,
          padding: 16,
          marginBottom: 22
        }}>
          <Text style={{
            color: 'white',
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 12
          }}>
            Probability Distribution
          </Text>

          <BarChart
            data={{
              labels,
              datasets: [{ data: values }]
            }}
            width={screenWidth - 72}
            height={230}
            yAxisSuffix="%"
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#132A3A',
              backgroundGradientFrom: '#132A3A',
              backgroundGradientTo: '#132A3A',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`,
              labelColor: () => '#C8D1DA',
              propsForBackgroundLines: {
                stroke: '#244252'
              },
              propsForLabels: {
                fontSize: 12
              }
            }}
            style={{
              borderRadius: 12
            }}
            fromZero
            showValuesOnTopOfBars
          />
        </View>
      )}

      {/* EXPLANATION CARD */}
      <View style={{
        backgroundColor: '#132A3A',
        borderRadius: 16,
        padding: 18,
        marginBottom: 22
      }}>
        <Text style={{
          color: 'white',
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 12
        }}>
          Explanation
        </Text>

        <Text style={{
          color: '#C8D1DA',
          fontSize: 16,
          lineHeight: 24
        }}>
          {explanation}
        </Text>
      </View>

      {/* ACTIONS CARD */}
      <View style={{
        backgroundColor: '#132A3A',
        borderRadius: 16,
        padding: 18,
        marginBottom: 22
      }}>
        <Text style={{
          color: 'white',
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 12
        }}>
          Recommended Actions
        </Text>

        {actions.length > 0 ? (
          actions.map((action: string, index: number) => (
            <Text
              key={index}
              style={{
                color: '#C8D1DA',
                fontSize: 16,
                lineHeight: 24,
                marginBottom: 8
              }}
            >
              • {action}
            </Text>
          ))
        ) : (
          <Text style={{ color: '#C8D1DA' }}>
            No actions available.
          </Text>
        )}
      </View>

    </ScrollView>
  );
}