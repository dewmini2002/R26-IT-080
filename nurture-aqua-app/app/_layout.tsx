import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

// Force dark theme for the aquarium-inspired UI
const NurtureAquaTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0a1628",
    card: "#101e32",
    primary: "#22d3ee",
    text: "#e8edf2",
    border: "#1a3050",
  },
};

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <ThemeProvider value={NurtureAquaTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
