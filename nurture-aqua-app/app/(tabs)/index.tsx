import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { C } from "@/constants/theme";
import { API_BASE_URL } from "@/constants/api";

const { width } = Dimensions.get("window");

// ── Ideal discus parameters ──────────────────────────────────────
const IDEAL_PARAMS = [
  { label: "pH", range: "6.0 – 7.5", icon: "opacity" as const, color: C.accent, unit: "" },
  { label: "Temperature", range: "28 – 30", icon: "thermostat" as const, color: C.orange, unit: "°C" },
  { label: "Ammonia", range: "0 – 0.05", icon: "water-drop" as const, color: C.yellow, unit: "mg/L" },
  { label: "Nitrite", range: "0 – 0.05", icon: "water-drop" as const, color: C.purple, unit: "mg/L" },
  { label: "Nitrate", range: "< 20", icon: "water-drop" as const, color: C.green, unit: "mg/L" },
];

// ── Dashboard action cards ───────────────────────────────────────
const ACTIONS = [
  {
    title: "Predict Water Risk",
    desc: "Analyze your water parameters with AI",
    icon: "analytics" as const,
    route: "/(tabs)/predict" as const,
    gradient: ["rgba(34,211,238,0.15)", "rgba(34,211,238,0.05)"],
    iconColor: C.accent,
  },
  {
    title: "View History",
    desc: "Browse past prediction records",
    icon: "history" as const,
    route: "/(tabs)/history" as const,
    gradient: ["rgba(167,139,250,0.15)", "rgba(167,139,250,0.05)"],
    iconColor: C.purple,
  },
  {
    title: "Water Care Tips",
    desc: "Expert guidance for discus care",
    icon: "lightbulb" as const,
    route: "/(tabs)/tips" as const,
    gradient: ["rgba(251,191,36,0.15)", "rgba(251,191,36,0.05)"],
    iconColor: C.yellow,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(ACTIONS.map(() => new Animated.Value(0))).current;
  const paramAnims = useRef(IDEAL_PARAMS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Check backend
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/health`, { method: "GET" });
        setBackendOnline(r.ok);
      } catch {
        setBackendOnline(false);
      }
    })();

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    // Stagger action cards
    const cardSequence = cardAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 200 + i * 100,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, cardSequence).start();

    // Stagger param cards
    const paramSequence = paramAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 350,
        delay: 500 + i * 80,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, paramSequence).start();
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Header ─────────────────────────────────────── */}
        <Animated.View
          style={[
            s.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={s.logoContainer}>
            <View style={s.logoCircle}>
              <Text style={s.logoEmoji}>🐠</Text>
            </View>
            <View style={s.logoGlow} />
          </View>
          <Text style={s.headerTitle}>NurtureAqua</Text>
          <Text style={s.headerSub}>
            AI-Based Discus Water Quality{"\n"}Risk Prediction
          </Text>
          <View style={s.headerLine} />
        </Animated.View>

        {/* ── Backend Status Card ─────────────────────────────── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View
            style={[
              s.statusCard,
              backendOnline === false && s.statusOffline,
              backendOnline === true && s.statusOnline,
            ]}
          >
            <View
              style={[
                s.statusDot,
                {
                  backgroundColor: backendOnline
                    ? C.green
                    : backendOnline === false
                    ? C.red
                    : C.textMuted,
                },
              ]}
            />
            <MaterialIcons
              name={
                backendOnline
                  ? "cloud-done"
                  : backendOnline === false
                  ? "cloud-off"
                  : "cloud-queue"
              }
              size={20}
              color={
                backendOnline
                  ? C.green
                  : backendOnline === false
                  ? C.red
                  : C.textMuted
              }
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  s.statusTitle,
                  backendOnline === false && { color: C.red },
                  backendOnline === true && { color: C.green },
                ]}
              >
                {backendOnline
                  ? "ML Backend Connected"
                  : backendOnline === false
                  ? "Backend Unreachable"
                  : "Checking backend…"}
              </Text>
              <Text style={s.statusSub}>
                {backendOnline
                  ? "AI prediction service is online"
                  : backendOnline === false
                  ? "Please check your network connection"
                  : "Verifying connection…"}
              </Text>
            </View>
            {backendOnline === null && (
              <ActivityIndicator size="small" color={C.textMuted} />
            )}
          </View>
        </Animated.View>

        {/* ── Quick Action Cards ──────────────────────────────── */}
        <View style={s.sectionHeader}>
          <MaterialIcons name="dashboard" size={18} color={C.accent} />
          <Text style={s.sectionTitle}>Quick Actions</Text>
        </View>

        {ACTIONS.map((action, i) => (
          <Animated.View
            key={i}
            style={{
              opacity: cardAnims[i],
              transform: [
                {
                  translateY: cardAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              style={s.actionCard}
              activeOpacity={0.7}
              onPress={() => router.push(action.route)}
            >
              <View
                style={[
                  s.actionIconBox,
                  { backgroundColor: action.gradient[0] },
                ]}
              >
                <MaterialIcons
                  name={action.icon}
                  size={24}
                  color={action.iconColor}
                />
              </View>
              <View style={s.actionContent}>
                <Text style={s.actionTitle}>{action.title}</Text>
                <Text style={s.actionDesc}>{action.desc}</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={C.textMuted}
              />
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* ── Ideal Discus Parameters ────────────────────────── */}
        <View style={[s.sectionHeader, { marginTop: 28 }]}>
          <MaterialIcons name="science" size={18} color={C.accent} />
          <Text style={s.sectionTitle}>Ideal Discus Parameters</Text>
        </View>

        <View style={s.paramGrid}>
          {IDEAL_PARAMS.map((param, i) => (
            <Animated.View
              key={i}
              style={[
                s.paramCard,
                {
                  opacity: paramAnims[i],
                  transform: [
                    {
                      scale: paramAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View
                style={[
                  s.paramIconBox,
                  { backgroundColor: `${param.color}18` },
                ]}
              >
                <MaterialIcons
                  name={param.icon}
                  size={20}
                  color={param.color}
                />
              </View>
              <Text style={s.paramLabel}>{param.label}</Text>
              <Text style={[s.paramRange, { color: param.color }]}>
                {param.range}
              </Text>
              {param.unit ? (
                <Text style={s.paramUnit}>{param.unit}</Text>
              ) : null}
            </Animated.View>
          ))}
        </View>

        {/* ── App Info Footer ────────────────────────────────── */}
        <View style={s.footer}>
          <View style={s.footerLine} />
          <Text style={s.footerText}>
            NurtureAqua v1.0 • AI-Powered Water Analysis
          </Text>
          <Text style={s.footerSubText}>
            Built for Discus Fish Enthusiasts
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  content: { paddingBottom: 20 },

  // ── Header ──
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34,211,238,0.1)",
    borderWidth: 2,
    borderColor: "rgba(34,211,238,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  logoGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(34,211,238,0.06)",
    zIndex: 1,
  },
  logoEmoji: { fontSize: 40 },
  headerTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: C.white,
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 14,
    color: C.textSecondary,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  headerLine: {
    width: 50,
    height: 3,
    backgroundColor: C.accent,
    borderRadius: 2,
    marginTop: 16,
  },

  // ── Status Card ──
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statusOnline: {
    backgroundColor: "rgba(52,211,153,0.06)",
    borderColor: "rgba(52,211,153,0.15)",
  },
  statusOffline: {
    backgroundColor: "rgba(248,113,113,0.06)",
    borderColor: "rgba(248,113,113,0.15)",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textSecondary,
  },
  statusSub: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },

  // ── Section Header ──
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.textPrimary,
    letterSpacing: 0.3,
  },

  // ── Action Cards ──
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 14,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  actionContent: { flex: 1 },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textPrimary,
  },
  actionDesc: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 3,
  },

  // ── Parameter Grid ──
  paramGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 12,
    gap: 8,
  },
  paramCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    width: (width - 48) / 2,
    flexGrow: 1,
    marginHorizontal: 4,
  },
  paramIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  paramLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  paramRange: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  paramUnit: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },

  // ── Footer ──
  footer: {
    alignItems: "center",
    marginTop: 32,
    paddingHorizontal: 24,
  },
  footerLine: {
    width: 40,
    height: 2,
    backgroundColor: C.cardBorder,
    borderRadius: 1,
    marginBottom: 14,
  },
  footerText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "600",
  },
  footerSubText: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 4,
    opacity: 0.6,
  },
});