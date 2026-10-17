import { DarkTheme, ThemeProvider } from "expo-router";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

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
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: "#0a1628",
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="water-image"
          options={{
            title: "Water Image Analysis",
          }}
        />

        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
          }}
        />
      </Stack>

      <StatusBar style="light" />
    </ThemeProvider>
  );
}