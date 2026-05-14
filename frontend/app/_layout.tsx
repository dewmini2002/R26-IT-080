import { Stack } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';

function HeaderRight() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push('/')}>
      <Text style={{ color: '#00C853', marginRight: 15 }}>Home</Text>
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0B1E2D' },
        headerTintColor: '#fff',
        headerRight: () => <HeaderRight />,
      }}
    />
  );
}