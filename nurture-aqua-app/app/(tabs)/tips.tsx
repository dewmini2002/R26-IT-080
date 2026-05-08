import { useRef, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, StatusBar, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { C } from "@/constants/theme";

const TIPS = [
  {
    icon: "thermostat" as const, color: C.orange, title: "Maintain Temperature",
    desc: "Keep water temperature between 28–30°C. Discus are tropical fish and thrive in warm, stable conditions.",
    tag: "Critical",
  },
  {
    icon: "water-drop" as const, color: C.red, title: "Keep Ammonia Near Zero",
    desc: "Ammonia is highly toxic to discus fish. Ensure biological filtration is adequate and test regularly.",
    tag: "Danger Zone",
  },
  {
    icon: "water-drop" as const, color: C.purple, title: "Monitor Nitrite Levels",
    desc: "Nitrite should stay at or near 0 mg/L. Even small amounts can stress fish and weaken immunity.",
    tag: "Important",
  },
  {
    icon: "speed" as const, color: C.accent, title: "Avoid Sudden pH Changes",
    desc: "Discus prefer slightly acidic water (pH 6.0–7.5). Make gradual adjustments to avoid shock.",
    tag: "Stability",
  },
  {
    icon: "no-meals" as const, color: C.yellow, title: "Reduce Overfeeding",
    desc: "Excess food decomposes and raises ammonia levels. Feed small portions 2–3 times daily.",
    tag: "Prevention",
  },
  {
    icon: "autorenew" as const, color: C.green, title: "Regular Water Changes",
    desc: "Change 25–30% of water weekly to dilute nitrates and maintain optimal water chemistry.",
    tag: "Essential",
  },
  {
    icon: "trending-up" as const, color: "#34d399", title: "Monitor Nitrate Buildup",
    desc: "Keep nitrate below 20 mg/L. High nitrate causes stress and makes fish susceptible to disease.",
    tag: "Monitoring",
  },
  {
    icon: "air" as const, color: "#60a5fa", title: "Ensure Good Aeration",
    desc: "Adequate oxygen levels support healthy fish metabolism and beneficial bacteria in the filter.",
    tag: "Health",
  },
];

export default function TipsScreen() {
  const anims = useRef(TIPS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const seq = anims.map((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 400, delay: i * 80, useNativeDriver: true })
    );
    Animated.stagger(80, seq).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.hIcon}><MaterialIcons name="lightbulb" size={28} color={C.yellow} /></View>
          <Text style={s.hTitle}>Water Care Tips</Text>
          <Text style={s.hSub}>Expert guidance for discus fish health</Text>
          <View style={s.hLine} />
        </View>

        <View style={s.introBanner}>
          <Text style={s.introEmoji}>🐠</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.introTitle}>Discus Care Essentials</Text>
            <Text style={s.introText}>Follow these tips to maintain ideal water conditions for your discus aquarium.</Text>
          </View>
        </View>

        {TIPS.map((tip, i) => (
          <Animated.View key={i} style={{
            opacity: anims[i],
            transform: [{ translateY: anims[i].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }}>
            <View style={s.tipCard}>
              <View style={s.tipTop}>
                <View style={[s.tipIconBox, { backgroundColor: `${tip.color}18` }]}>
                  <MaterialIcons name={tip.icon} size={22} color={tip.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.tipTitle}>{tip.title}</Text>
                  <View style={[s.tipTag, { backgroundColor: `${tip.color}15` }]}>
                    <Text style={[s.tipTagText, { color: tip.color }]}>{tip.tag}</Text>
                  </View>
                </View>
              </View>
              <Text style={s.tipDesc}>{tip.desc}</Text>
            </View>
          </Animated.View>
        ))}

        <View style={s.footer}>
          <View style={s.footerLine} />
          <Text style={s.footerText}>💧 Healthy water = Happy fish</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { alignItems: "center", paddingTop: 56, paddingBottom: 20, paddingHorizontal: 24 },
  hIcon: { width: 56, height: 56, borderRadius: 20, backgroundColor: "rgba(251,191,36,0.1)", borderWidth: 1, borderColor: "rgba(251,191,36,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 14 },
  hTitle: { fontSize: 26, fontWeight: "800", color: "#fff", letterSpacing: 0.3 },
  hSub: { fontSize: 13, color: C.textSecondary, marginTop: 6, textAlign: "center" },
  hLine: { width: 40, height: 3, backgroundColor: C.yellow, borderRadius: 2, marginTop: 14 },
  introBanner: { flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: 16, marginBottom: 20, padding: 18, backgroundColor: "rgba(34,211,238,0.06)", borderRadius: 18, borderWidth: 1, borderColor: "rgba(34,211,238,0.12)" },
  introEmoji: { fontSize: 36 },
  introTitle: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
  introText: { fontSize: 12, color: C.textSecondary, marginTop: 4, lineHeight: 18 },
  tipCard: { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 18, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: C.cardBorder },
  tipTop: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
  tipIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  tipTitle: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
  tipTag: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  tipTagText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  tipDesc: { fontSize: 13, color: C.textSecondary, lineHeight: 21, paddingLeft: 2 },
  footer: { alignItems: "center", marginTop: 24 },
  footerLine: { width: 40, height: 2, backgroundColor: C.cardBorder, borderRadius: 1, marginBottom: 14 },
  footerText: { fontSize: 14, color: C.textMuted, fontWeight: "600" },
});
