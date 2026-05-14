import { Stack } from 'expo-router';

export default function EggLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="upload" />
      <Stack.Screen name="conditions" />
      <Stack.Screen name="analyzing" />
      <Stack.Screen name="validation" />
      <Stack.Screen name="result" />
    </Stack>
  );
}