import { API_BASE_URL } from "@/constants/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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

function getRiskColor(risk: string) {
  if (risk === "Low Risk") return C.green;
  if (risk === "Moderate Risk") return C.orange;
  return C.red;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/history`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setHistory([...data].reverse());
      } else {
        setHistory([]);
      }
    } catch {
      setError("Unable to load prediction history. Please check backend connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={styles.loadingText}>Loading prediction history...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={C.accent}
          colors={[C.accent]}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <MaterialIcons name="history" size={34} color={C.accent} />
        </View>

        <Text style={styles.title}>Prediction History</Text>
        <Text style={styles.subtitle}>
          View previous AI water quality predictions
        </Text>
      </View>

      <View style={styles.topRow}>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <MaterialIcons name="refresh" size={18} color={C.accent} />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>

        <View style={styles.countBadge}>
          <MaterialIcons name="assessment" size={15} color={C.accent} />
          <Text style={styles.countText}>{history.length} records</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <MaterialIcons name="wifi-off" size={18} color={C.red} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {history.length === 0 && !error ? (
        <View style={styles.emptyCard}>
          <MaterialIcons name="inbox" size={54} color={C.muted} />
          <Text style={styles.emptyTitle}>No History Yet</Text>
          <Text style={styles.emptyText}>
            Run a prediction first to see your saved results here.
          </Text>
        </View>
      ) : null}

      {history.map((item, index) => {
        const riskColor = getRiskColor(item.risk_level);

        return (
          <View key={index} style={styles.historyCard}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.riskBadge,
                  { backgroundColor: riskColor + "22" },
                ]}
              >
                <MaterialIcons
                  name={
                    item.risk_level === "Low Risk"
                      ? "check-circle"
                      : item.risk_level === "Moderate Risk"
                      ? "warning"
                      : "error"
                  }
                  size={16}
                  color={riskColor}
                />

                <Text style={[styles.riskText, { color: riskColor }]}>
                  {item.risk_level}
                </Text>
              </View>

              <View style={styles.confidenceBadge}>
                <MaterialIcons name="speed" size={14} color={C.accent} />
                <Text style={styles.confidenceText}>
                  {item.confidence}%
                </Text>
              </View>
            </View>

            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(Number(item.confidence) || 0, 100)}%`,
                    backgroundColor: riskColor,
                  },
                ]}
              />
            </View>

            {item.estimated_water_color ? (
              <View style={styles.appearanceMini}>
                <MaterialIcons name="water-drop" size={15} color={C.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.appearanceMiniLabel}>
                    Estimated Water Appearance
                  </Text>
                  <Text style={styles.appearanceMiniText}>
                    {item.estimated_water_color}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.parameterGrid}>
              <Parameter label="pH" value={item.ph} />
              <Parameter label="Temp" value={`${item.temperature_c}°C`} />
              <Parameter label="NH₃" value={item.ammonia_mg_l} />
              <Parameter label="NO₂" value={item.nitrite_mg_l} />
              <Parameter label="NO₃" value={item.nitrate_mg_l} />
            </View>

            <View style={styles.timeRow}>
              <MaterialIcons name="access-time" size={14} color={C.muted} />
              <Text style={styles.timeText}>{item.timestamp}</Text>
            </View>
          </View>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Parameter({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.parameterBox}>
      <Text style={styles.parameterLabel}>{label}</Text>
      <Text style={styles.parameterValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 16,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: C.muted,
    marginTop: 14,
    fontSize: 15,
  },

  header: {
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 20,
  },

  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#0d3b52",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.accent,
    marginBottom: 14,
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

  topRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1.5,
    borderColor: C.accent,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  refreshText: {
    color: C.accent,
    fontWeight: "800",
  },

  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#0b2a3f",
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
  },

  countText: {
    color: C.accent,
    fontWeight: "800",
  },

  errorBox: {
    backgroundColor: "#3b1620",
    borderWidth: 1,
    borderColor: C.red,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 16,
  },

  errorText: {
    color: C.red,
    flex: 1,
    lineHeight: 19,
  },

  emptyCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    marginTop: 20,
  },

  emptyTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 16,
  },

  emptyText: {
    color: C.muted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  historyCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 18,
  },

  riskText: {
    fontWeight: "900",
    fontSize: 13,
  },

  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0b2a3f",
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },

  confidenceText: {
    color: C.accent,
    fontWeight: "900",
  },

  progressBg: {
    height: 5,
    backgroundColor: "#20364d",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 14,
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
  },

  appearanceMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0b2a3f",
    borderWidth: 1,
    borderColor: "#1b526b",
    padding: 13,
    borderRadius: 14,
    marginBottom: 14,
  },

  appearanceMiniLabel: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 3,
  },

  appearanceMiniText: {
    color: C.accent,
    fontSize: 14,
    fontWeight: "900",
  },

  parameterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },

  parameterBox: {
    backgroundColor: "#081c31",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    minWidth: 62,
    alignItems: "center",
  },

  parameterLabel: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "700",
  },

  parameterValue: {
    color: C.text,
    fontWeight: "900",
    marginTop: 3,
    fontSize: 13,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
  },

  timeText: {
    color: C.muted,
    fontSize: 12,
  },
});