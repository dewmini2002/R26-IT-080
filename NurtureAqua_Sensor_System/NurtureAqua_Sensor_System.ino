#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_ADS1X15.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// =====================================================
// NURTUREAQUA - ESP32 TEMPERATURE + pH
// =====================================================

// ===============================
// WIFI
// ===============================

const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Backend PC IP
const char* BACKEND_URL = "http://10.178.250.92:8000";

// ===============================
// TEMPERATURE SENSOR - DS18B20
// ===============================

#define TEMP_PIN 4

OneWire oneWire(TEMP_PIN);
DallasTemperature tempSensor(&oneWire);

// ===============================
// pH SENSOR - ADS1115
// ===============================

Adafruit_ADS1115 ads;

#define PH_CHANNEL 0

// ===============================
// pH CALIBRATION
// ===============================

const float VOLTAGE_PH_4 = 1.0503;
const float VOLTAGE_PH_7 = 1.3806;

const float PH_SLOPE =
  (7.0 - 4.0) /
  (VOLTAGE_PH_7 - VOLTAGE_PH_4);

const float PH_INTERCEPT =
  7.0 - (PH_SLOPE * VOLTAGE_PH_7);

// ===============================
// SETTINGS
// ===============================

const int SAMPLE_COUNT = 10;

bool adsDetected = false;
bool tempDetected = false;


// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("==========================================");
  Serial.println("       NURTUREAQUA SENSOR SYSTEM");
  Serial.println("       ESP32 + Temperature + pH");
  Serial.println("==========================================");

  // ===============================
  // TEMPERATURE
  // ===============================

  tempSensor.begin();

  int tempCount = tempSensor.getDeviceCount();

  if (tempCount > 0) {

    tempDetected = true;

    Serial.print("DS18B20 detected. Count: ");
    Serial.println(tempCount);

  } else {

    Serial.println("DS18B20 NOT detected.");
  }

  // ===============================
  // ADS1115
  // ===============================

  Wire.begin(21, 22);

  adsDetected = ads.begin(0x48);

  if (adsDetected) {

    ads.setGain(GAIN_TWOTHIRDS);

    Serial.println("ADS1115 detected at 0x48.");

  } else {

    Serial.println("ADS1115 NOT detected.");
  }

  // ===============================
  // WIFI
  // ===============================

  Serial.println();
  Serial.println("Connecting to WiFi...");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;

  while (
    WiFi.status() != WL_CONNECTED &&
    attempts < 30
  ) {

    delay(500);

    Serial.print(".");

    attempts++;
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {

    Serial.println("WiFi connected!");

    Serial.print("ESP32 IP: ");
    Serial.println(WiFi.localIP());

  } else {

    Serial.println("WiFi connection FAILED.");
  }

  Serial.println("==========================================");
}


// =====================================================
// LOOP
// =====================================================

void loop() {

  Serial.println();
  Serial.println("Reading sensors...");
  Serial.println("------------------------------------------");

  // ===============================
  // READ TEMPERATURE
  // ===============================

  float temperatureC = readTemperature();

  // ===============================
  // READ pH
  // ===============================

  float phValue = readPH();

  // ===============================
  // DISPLAY
  // ===============================

  Serial.println();
  Serial.println("============= SENSOR DATA ===============");

  if (temperatureC == -999.0) {

    Serial.println("Temperature: ERROR");

  } else {

    Serial.print("Temperature: ");
    Serial.print(temperatureC, 2);
    Serial.println(" C");
  }

  if (phValue == -999.0) {

    Serial.println("pH: ERROR");

  } else {

    Serial.print("pH: ");
    Serial.println(phValue, 2);
  }

  Serial.println("==========================================");

  // ===============================
  // SEND TO BACKEND
  // ===============================

  if (
    temperatureC != -999.0 &&
    phValue != -999.0
  ) {

    sendSensorData(
      temperatureC,
      phValue
    );

  } else {

    Serial.println(
      "Sensor data not sent because one or more readings are invalid."
    );
  }

  delay(5000);
}


// =====================================================
// READ TEMPERATURE
// =====================================================

float readTemperature() {

  if (!tempDetected) {
    return -999.0;
  }

  tempSensor.requestTemperatures();

  float temperatureC =
    tempSensor.getTempCByIndex(0);

  if (
    temperatureC ==
    DEVICE_DISCONNECTED_C
  ) {

    Serial.println(
      "Temperature sensor disconnected."
    );

    return -999.0;
  }

  if (
    temperatureC < -10 ||
    temperatureC > 60
  ) {

    Serial.println(
      "Invalid temperature."
    );

    return -999.0;
  }

  return temperatureC;
}


// =====================================================
// READ pH
// =====================================================

float readPH() {

  if (!adsDetected) {
    return -999.0;
  }

  long adcTotal = 0;

  float voltageTotal = 0.0;

  for (
    int i = 0;
    i < SAMPLE_COUNT;
    i++
  ) {

    int16_t adcValue =
      ads.readADC_SingleEnded(
        PH_CHANNEL
      );

    float voltage =
      adcValue *
      0.1875 /
      1000.0;

    adcTotal += adcValue;

    voltageTotal += voltage;

    delay(100);
  }

  float averageADC =
    adcTotal /
    (float)SAMPLE_COUNT;

  float averageVoltage =
    voltageTotal /
    SAMPLE_COUNT;

  Serial.print("pH ADC: ");
  Serial.println(averageADC, 2);

  Serial.print("pH Voltage: ");
  Serial.print(averageVoltage, 4);
  Serial.println(" V");

  if (
    averageVoltage < 0.05 ||
    averageVoltage > 5.5
  ) {

    Serial.println(
      "Invalid pH signal."
    );

    return -999.0;
  }

  float phValue =
    (PH_SLOPE * averageVoltage)
    + PH_INTERCEPT;

  if (
    phValue < 0 ||
    phValue > 14
  ) {

    Serial.println(
      "pH outside valid range."
    );

    return -999.0;
  }

  return phValue;
}


// =====================================================
// SEND SENSOR DATA TO FASTAPI
// =====================================================

void sendSensorData(
  float temperatureC,
  float phValue
) {

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println(
      "WiFi not connected. Data not sent."
    );

    return;
  }

  HTTPClient http;

  // ===============================
  // SEND TEMPERATURE
  // ===============================

  String temperatureURL =
    String(BACKEND_URL) +
    "/sensor/temperature";

  http.begin(temperatureURL);

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  String temperatureJSON =
    "{\"temperature_c\":" +
    String(temperatureC, 2) +
    "}";

  Serial.println();
  Serial.println("Sending temperature...");

  int temperatureResponse =
    http.POST(temperatureJSON);

  Serial.print(
    "Temperature HTTP status: "
  );

  Serial.println(
    temperatureResponse
  );

  if (
    temperatureResponse > 0
  ) {

    Serial.println(
      http.getString()
    );
  }

  http.end();


  // ===============================
  // SEND pH
  // ===============================

  String phURL =
    String(BACKEND_URL) +
    "/sensor/ph";

  http.begin(phURL);

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  String phJSON =
    "{\"ph\":" +
    String(phValue, 2) +
    "}";

  Serial.println();
  Serial.println("Sending pH...");

  int phResponse =
    http.POST(phJSON);

  Serial.print(
    "pH HTTP status: "
  );

  Serial.println(
    phResponse
  );

  if (
    phResponse > 0
  ) {

    Serial.println(
      http.getString()
    );
  }

  http.end();
}