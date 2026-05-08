import { API_BASE_URL } from "@/constants/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const C = {
  bg: "#071527",
  card: "#0f243a",
  border: "#1d3b5a",
  accent: "#22d3ee",
  text: "#ffffff",
  muted: "#8aa4bd",
  red: "#ff5b6e",
  green: "#22c55e",
  orange: "#f59e0b",
  purple: "#a78bfa",
};

export default function PredictScreen() {
  const router = useRouter();

  const [ph, setPh] = useState("");
  const [temp, setTemp] = useState("");
  const [ammonia, setAmmonia] = useState("");
  const [nitrite, setNitrite] = useState("");
  const [nitrate, setNitrate] = useState("");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const riskColor =
    result?.risk_level === "Low Risk"
      ? C.green
      : result?.risk_level === "Moderate Risk"
      ? C.orange
      : C.red;

  const validateInputs = () => {
    if (!ph || !temp || !ammonia || !nitrite || !nitrate) {
      setError("Please fill all water parameter fields.");
      return false;
    }

    const pH = Number(ph);
    const t = Number(temp);
    const a = Number(ammonia);
    const ni = Number(nitrite);
    const na = Number(nitrate);

    if ([pH, t, a, ni, na].some((v) => isNaN(v))) {
      setError("Please enter valid numeric values only.");
      return false;
    }

    if (pH < 0 || pH > 14) {
      setError("pH must be between 0 and 14.");
      return false;
    }

    if (t < 15 || t > 40) {
      setError("Temperature must be between 15°C and 40°C.");
      return false;
    }

    if (a < 0 || ni < 0 || na < 0) {
      setError("Chemical values cannot be negative.");
      return false;
    }

    setError("");
    return true;
  };

  const predictRisk = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ph: Number(ph),
          temperature_c: Number(temp),
          ammonia_mg_l: Number(ammonia),
          nitrite_mg_l: Number(nitrite),
          nitrate_mg_l: Number(nitrate),
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch {
      setError("Unable to connect to AI backend. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPh("");
    setTemp("");
    setAmmonia("");
    setNitrite("");
    setNitrate("");
    setResult(null);
    setError("");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logo}>🐠</Text>
        </View>
        <Text style={styles.title}>Predict Water Risk</Text>
        <Text style={styles.subtitle}>
          Enter water test values for AI-based risk prediction
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Water Parameters</Text>

        <InputBox
          label="pH Level"
          value={ph}
          setValue={setPh}
          placeholder="e.g. 6.8"
          helper="Recommended: 6.0 – 7.5"
        />

        <InputBox
          label="Temperature °C"
          value={temp}
          setValue={setTemp}
          placeholder="e.g. 29"
          helper="Recommended: 28 – 30°C"
        />

        <InputBox
          label="Ammonia mg/L"
          value={ammonia}
          setValue={setAmmonia}
          placeholder="e.g. 0.02"
          helper="Recommended: 0 – 0.05"
        />

        <InputBox
          label="Nitrite mg/L"
          value={nitrite}
          setValue={setNitrite}
          placeholder="e.g. 0.01"
          helper="Recommended: 0 – 0.05"
        />

        <InputBox
          label="Nitrate mg/L"
          value={nitrate}
          setValue={setNitrate}
          placeholder="e.g. 15"
          helper="Recommended: below 20"
        />

        {error ? (
          <View style={styles.errorBox}>
            <MaterialIcons name="error-outline" size={18} color={C.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.predictButton}
          onPress={predictRisk}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={C.bg} />
          ) : (
            <MaterialIcons name="analytics" size={22} color={C.bg} />
          )}
          <Text style={styles.predictText}>
            {loading ? "Analyzing..." : "Predict Risk"}
          </Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultCard}>
          <View style={[styles.riskBox, { backgroundColor: riskColor + "22" }]}>
            <View style={[styles.riskIcon, { backgroundColor: riskColor }]}>
              <MaterialIcons
                name={
                  result.risk_level === "Low Risk"
                    ? "check"
                    : result.risk_level === "Moderate Risk"
                    ? "warning"
                    : "priority-high"
                }
                size={28}
                color="#fff"
              />
            </View>

            <View>
              <Text style={styles.riskLabel}>RISK LEVEL</Text>
              <Text style={[styles.riskValue, { color: riskColor }]}>
                {result.risk_level}
              </Text>
            </View>
          </View>

          <View style={styles.confidenceBlock}>
            <View style={styles.rowBetween}>
              <Text style={styles.smallTitle}>AI Confidence</Text>
              <Text style={styles.confidence}>{result.confidence}%</Text>
            </View>

            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(result.confidence, 100)}%`,
                    backgroundColor: riskColor,
                  },
                ]}
              />
            </View>
          </View>

          {result.estimated_water_color && (
            <View style={styles.appearanceBlock}>
              <View style={styles.appearanceHeader}>
                <MaterialIcons name="water-drop" size={20} color={C.accent} />
                <Text style={styles.appearanceTitle}>
                  Estimated Water Appearance
                </Text>
              </View>

              <View style={styles.appearanceCard}>
                <Text style={styles.appearanceColor}>
                  {result.estimated_water_color}
                </Text>
                <Text style={styles.appearanceReason}>
                  {result.color_reason}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.recommendBlock}>
            <View style={styles.appearanceHeader}>
              <MaterialIcons name="lightbulb" size={20} color="#facc15" />
              <Text style={styles.appearanceTitle}>Recommendations</Text>
            </View>

            {result.recommendations?.map((rec: string, index: number) => (
              <View key={index} style={styles.recCard}>
                <MaterialIcons
                  name="check-circle-outline"
                  size={16}
                  color={C.accent}
                />
                <Text style={styles.recText}>{rec}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.outlineBtn} onPress={resetForm}>
              <MaterialIcons name="refresh" size={18} color={C.accent} />
              <Text style={styles.outlineText}>Analyze Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineBtnPurple}
              onPress={() => router.push("/(tabs)/history")}
            >
              <MaterialIcons name="history" size={18} color={C.purple} />
              <Text style={styles.outlineTextPurple}>View History</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InputBox({
  label,
  value,
  setValue,
  placeholder,
  helper,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  placeholder: string;
  helper: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputBox}>
        <MaterialIcons name="water-drop" size={18} color={C.accent} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          keyboardType="numeric"
        />
      </View>
      <Text style={styles.helper}>{helper}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 20,
  },
  logoCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#0d3b52",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.accent,
    marginBottom: 14,
  },
  logo: {
    fontSize: 36,
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: C.muted,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#081c31",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: C.text,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  helper: {
    color: C.muted,
    fontSize: 11,
    marginTop: 5,
  },
  errorBox: {
    backgroundColor: "#3b1620",
    borderColor: C.red,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 8,
    marginVertical: 10,
  },
  errorText: {
    color: C.red,
    flex: 1,
  },
  predictButton: {
    backgroundColor: C.accent,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  predictText: {
    color: C.bg,
    fontSize: 17,
    fontWeight: "900",
  },
  resultCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 20,
  },
  riskBox: {
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  riskIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  riskLabel: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  riskValue: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4,
  },
  confidenceBlock: {
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 18,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  smallTitle: {
    color: C.muted,
    fontWeight: "700",
  },
  confidence: {
    color: C.accent,
    fontSize: 20,
    fontWeight: "900",
  },
  progressBg: {
    height: 7,
    backgroundColor: "#20364d",
    borderRadius: 10,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
  appearanceBlock: {
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 18,
  },
  appearanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  appearanceTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "800",
  },
  appearanceCard: {
    backgroundColor: "#0b2a3f",
    borderWidth: 1,
    borderColor: "#1b526b",
    borderRadius: 14,
    padding: 15,
  },
  appearanceColor: {
    color: C.accent,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },
  appearanceReason: {
    color: C.muted,
    lineHeight: 19,
    fontSize: 13,
  },
  recommendBlock: {
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 18,
  },
  recCard: {
    flexDirection: "row",
    gap: 9,
    backgroundColor: "#0b2a3f",
    borderLeftWidth: 3,
    borderLeftColor: C.accent,
    padding: 13,
    borderRadius: 12,
    marginBottom: 8,
  },
  recText: {
    color: C.muted,
    flex: 1,
    lineHeight: 19,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  outlineBtn: {
    flex: 1,
    borderColor: C.accent,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  outlineText: {
    color: C.accent,
    fontWeight: "800",
  },
  outlineBtnPurple: {
    flex: 1,
    borderColor: C.purple,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  outlineTextPurple: {
    color: C.purple,
    fontWeight: "800",
  },
});