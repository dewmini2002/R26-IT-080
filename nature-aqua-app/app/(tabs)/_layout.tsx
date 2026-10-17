import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { HapticTab } from "@/components/haptic-tab";

const C = {
  bg: "#0a1628",
  accent: "#22d3ee",
  muted: "#4b6478",
  border: "#1a3050",
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopWidth: 1,
          borderTopColor: C.border,
          elevation: 0,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.4,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={
                focused
                  ? {
                      backgroundColor: "rgba(34,211,238,0.12)",
                      borderRadius: 12,
                      padding: 6,
                    }
                  : { padding: 6 }
              }
            >
              <MaterialIcons name="home" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="predict"
        options={{
          title: "Predict",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={
                focused
                  ? {
                      backgroundColor: "rgba(34,211,238,0.12)",
                      borderRadius: 12,
                      padding: 6,
                    }
                  : { padding: 6 }
              }
            >
              <MaterialIcons name="analytics" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={
                focused
                  ? {
                      backgroundColor: "rgba(34,211,238,0.12)",
                      borderRadius: 12,
                      padding: 6,
                    }
                  : { padding: 6 }
              }
            >
              <MaterialIcons name="history" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={
                focused
                  ? {
                      backgroundColor: "rgba(34,211,238,0.12)",
                      borderRadius: 12,
                      padding: 6,
                    }
                  : { padding: 6 }
              }
            >
              <MaterialIcons name="bar-chart" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: "Tips",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={
                focused
                  ? {
                      backgroundColor: "rgba(34,211,238,0.12)",
                      borderRadius: 12,
                      padding: 6,
                    }
                  : { padding: 6 }
              }
            >
              <MaterialIcons name="lightbulb" size={24} color={color} />
            </View>
          ),
        }}
      />
      {/* Hide the old explore screen from tabs */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
