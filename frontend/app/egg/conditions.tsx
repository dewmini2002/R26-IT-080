import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

export default function ConditionsScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams();

  const [hours, setHours] = useState('');
  const [temperature, setTemperature] = useState('');
  const [tds, setTds] = useState('');
  const [ph, setPh] = useState('');
  const [parentsPresent, setParentsPresent] = useState(true);

  const handleNext = () => {
    if (!hours || !temperature || !tds || !ph) {
      alert('Please fill all tank condition fields.');
      return;
    }

    router.push({
      pathname: '/egg/analyzing',
      params: {
        imageUri: imageUri as string,
        hours,
        temperature,
        tds,
        ph,
        parentsPresent: parentsPresent ? 'true' : 'false',
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0B1E2D' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 50,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            color: 'white',
            fontSize: 28,
            fontWeight: 'bold',
            marginBottom: 8,
          }}
        >
          Tank Conditions
        </Text>

        <Text
          style={{
            color: '#9BA8B5',
            fontSize: 15,
            marginBottom: 24,
          }}
        >
          Provide current tank parameters to improve AI accuracy.
        </Text>

        {/* HOURS */}
        <Text style={label}>Hours Since Spawn</Text>
        <View style={inputRow}>
          <TextInput
            value={hours}
            onChangeText={setHours}
            keyboardType="numeric"
            placeholder="e.g. 24"
            placeholderTextColor="#64748B"
            style={input}
          />
          <Text style={unit}>hrs</Text>
        </View>

        {/* TEMPERATURE */}
        <Text style={label}>Temperature</Text>
        <View style={inputRow}>
          <TextInput
            value={temperature}
            onChangeText={setTemperature}
            keyboardType="numeric"
            placeholder="e.g. 28"
            placeholderTextColor="#64748B"
            style={input}
          />
          <Text style={unit}>°C</Text>
        </View>

        {/* TDS */}
        <Text style={label}>TDS (Total Dissolved Solids)</Text>
        <View style={inputRow}>
          <TextInput
            value={tds}
            onChangeText={setTds}
            keyboardType="numeric"
            placeholder="e.g. 150"
            placeholderTextColor="#64748B"
            style={input}
          />
          <Text style={unit}>ppm</Text>
        </View>

        {/* PH */}
        <Text style={label}>pH Level</Text>
        <View style={inputRow}>
          <TextInput
            value={ph}
            onChangeText={setPh}
            keyboardType="numeric"
            placeholder="e.g. 6.5"
            placeholderTextColor="#64748B"
            style={input}
          />
        </View>

        {/* PARENTS PRESENT */}
        <Text style={label}>Parents Present</Text>

        <View
          style={{
            backgroundColor: '#132A3A',
            borderRadius: 14,
            padding: 14,
            marginBottom: 18,
          }}
        >
          <Text
            style={{
              color: '#9BA8B5',
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            Are parent fish currently guarding or staying near the eggs?
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => setParentsPresent(true)}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: parentsPresent ? '#00C853' : '#1E2A38',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setParentsPresent(false)}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: !parentsPresent ? '#FF5252' : '#1E2A38',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* START BUTTON */}
        <TouchableOpacity onPress={handleNext} style={button}>
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              fontWeight: 'bold',
            }}
          >
            Start Analysis →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const label = {
  color: '#C8D1DA',
  fontSize: 14,
  fontWeight: '600' as const,
  marginBottom: 8,
};

const inputRow = {
  backgroundColor: '#132A3A',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 4,
  marginBottom: 16,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
};

const input = {
  flex: 1,
  color: 'white',
  fontSize: 16,
  paddingVertical: 12,
};

const unit = {
  color: '#9BA8B5',
  fontSize: 14,
};

const button = {
  backgroundColor: '#00C853',
  padding: 16,
  borderRadius: 14,
  alignItems: 'center' as const,
  marginTop: 10,
};