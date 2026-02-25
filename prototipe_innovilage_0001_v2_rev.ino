// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    BROWNOUT SETTINGS                                  ║
// ╚═══════════════════════════════════════════════════════════════════════╝
// Uncomment untuk disable brownout detector:
// #define DISABLE_BROWNOUT

#include "esp_system.h"

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <RTClib.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <WiFiManager.h>
#include <Preferences.h>
#include <esp_task_wdt.h>
#include <ArduinoJson.h>
#include <algorithm>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include <WebServer.h>
#include <DNSServer.h>
#include <time.h>
#include <Adafruit_ADS1X15.h>

/**
 * GROWIFY TECH - INNOVILAGE 2025
 * Firmware ESP32-S3 Professional Mode - REVISED v2 (REVISION)
 * 
 * Revisi ini: LCD & RTC共用 I2C (40, 39), ADS1115 terpisah (17, 18)
 * 
 * Konfigurasi Pin (ESP32-S3 DevKitC-1):
 * 1. LCD 1602 I2C     -> SDA=40, SCL=39 (共用 RTC)
 * 2. DS3231 RTC I2C   -> SDA=40, SCL=39 (共用 LCD)
 * 3. ADS1115 I2C      -> SDA=17, SCL=18 (Pisahkan!)
 * 4. DS18B20 Suhu     -> GPIO 4 (+Resistor 4.7k)
 * 5. Relay 1-Ch        -> GPIO 1 (Active High)
 * 6. Sonar A02YYUW    -> RX=41, TX=42 (UART)
 * 7. Reset Button     -> GPIO 0
 */

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    CONSTANTS & CONFIGURATION                          ║
// ╚═══════════════════════════════════════════════════════════════════════╗
#define DEVICE_ID "0001"

const char* mqtt_server = "g0d76118.ala.asia-southeast1.emqxsl.com";
const int mqtt_port = 8883;
const char* mqtt_user = "smart_mocaf01";
const char* mqtt_pass = "smart_mocaf01";

const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;
const int daylightOffset_sec = 0;

const char* telegramToken = "8355490253:AAGyJ-fMBSL5P7IVeeoeq4zcfKhftt-80zg";
String telegramChatID = "5105119698";

const String api_host = "https://smartmocaf.com";
const int api_port = 80;

// ═══════════════════════════════════════════════════════════════════════
// I2C PINS - DUAL I2C BUS
// Wire0: LCD + RTC -> SDA=40, SCL=39
// Wire1: ADS1115   -> SDA=17, SCL=18
#define I2C_SDA 40
#define I2C_SCL 39
#define ADS1115_SDA 17
#define ADS1115_SCL 18

#define ONE_WIRE_BUS 4
#define RELAY_PIN 1
#define RX_SONAR 41
#define TX_SONAR 42
#define RESET_BTN 0

#define VREF 3.3
#define ADC_RES 4095.0

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    TIME TEMPLATE (ms)                                ║
// ╚═══════════════════════════════════════════════════════════════════════╗
const unsigned long ONE_SECOND  = 1000;
const unsigned long ONE_MINUTE  = 60000;
const unsigned long ONE_HOUR    = 3600000;

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    TIMING CONSTANTS (ms)                               ║
// ╚═══════════════════════════════════════════════════════════════════════╗
const unsigned long MIN_RELAY_TIME = 15 * ONE_SECOND;
const unsigned long DRAIN_HOLD_TIME = 2 * ONE_MINUTE;
const float DRAIN_LOW_THRESHOLD = 5.0;
const unsigned long STABILITY_DURATION = 10 * ONE_MINUTE;
const long MQTT_PUBLISH_INTERVAL = 3 * ONE_SECOND;
const long API_UPLOAD_INTERVAL = 15 * ONE_MINUTE;
const long MQTT_BUFFER_INTERVAL = 3 * ONE_SECOND;
const long PERIODIC_MESSAGE_INTERVAL = 1 * ONE_MINUTE;
const long WAIT_MESSAGE_INTERVAL = 2 * ONE_MINUTE;
const long DISPLAY_MAIN_INTERVAL = 20 * ONE_SECOND;
const long DISPLAY_INFO_INTERVAL = 3 * ONE_SECOND;

const unsigned long WIFI_BACKOFF_STEPS[] = { 
    30 * ONE_SECOND,
    1 * ONE_MINUTE,
    2 * ONE_MINUTE,
    5 * ONE_MINUTE,
    15 * ONE_MINUTE,
    30 * ONE_MINUTE,
    1 * ONE_HOUR,
    2 * ONE_HOUR,
    4 * ONE_HOUR
};
const int WIFI_BACKOFF_COUNT = 9;

const int PH_SAMPLE_COUNT = 50;
const float PH_TRIM_PERCENT = 0.2;
const unsigned long TEST_DRAIN_DURATION = 15 * ONE_SECOND;
const unsigned long FORCE_AP_HOLD_MS = 5 * ONE_SECOND;
const unsigned long SONAR_TIMEOUT_MS = 5 * ONE_SECOND;

// ADC - Single-Ended Mode (A0 vs GND)
const uint8_t ADC_PH_CHANNEL = 0;

const float PH_BUFFER_6_86 = 6.86;
const float PH_BUFFER_4 = 4.00;

float voltage_at_ph7 = 9248;
float voltage_at_ph4 = 10952;
bool calibrated_ph7 = false;
bool calibrated_ph4 = false;

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    OBJECTS                                            ║
// ╚═══════════════════════════════════════════════════════════════════════╗
LiquidCrystal_I2C lcd(0x27, 16, 2);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
RTC_DS3231 rtc;
WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);
Preferences preferences;
TwoWire I2C_ADS = TwoWire(1);
Adafruit_ADS1115 ads;

String mqtt_topic_sensors;
String mqtt_topic_control;
String mqtt_topic_mode;
String mqtt_topic_config;
String mqtt_topic_events;

enum FermentationState { IDLE, FERMENTATION, STABILIZING, DRAINING };
enum SystemMode { MODE_AUTO, MODE_MANUAL, MODE_TEST };

struct SensorData {
    float temp;
    float ph;
    float waterLevel;
    uint32_t timestamp;
    bool valid;
};

struct SystemStatus {
    FermentationState state;
    SystemMode mode;
    unsigned long stateStartTime;
    bool drainLowReached;
    unsigned long drainLowTime;
    bool isOnline;
    bool splashShown;
    unsigned long bootTime;
    unsigned long lastMqttPublish;
    unsigned long lastApiUpload;
    unsigned long lastPeriodicMessage;
    unsigned long lastWaitMessage;
    unsigned long lastWiFiReconnect;
    unsigned long lastMqttReconnect;
    unsigned long mqttReconnectInterval;
    unsigned long lastBuffer;
    unsigned long lastValidSonarTime;
    int wifiBackoffIndex;
    unsigned long wifiReconnectInterval;
    float smoothedPH;
    float currentPHVoltage;
    float distance;
    float waterLevel;
    uint8_t lastResetReason;
};

struct Config {
    float maxHeight;
    float targetPH;
    float ph_slope;
    float ph_offset;
    float ph_offset_4;
    float ph_offset_7;
    String api_host;
    int api_port;
    String telegramChatID;
};

struct Flags {
    bool isManualMode;
    bool isTestMode;
    bool isTestDraining;
    bool isReconnecting;
    bool resetBtnActive;
};

SystemStatus sysStatus;
Config config;
Flags flags;

String deviceName = "GRW_ID" + String(DEVICE_ID);
unsigned char sonarData[4];

#define MAX_BUFFER 100
SensorData offlineBuffer[MAX_BUFFER];
int bufferWriteIndex = 0;
int bufferReadIndex = 0;
int bufferCount = 0;

unsigned long resetBtnPressStart = 0;
unsigned long testRelayTimer = 0;
bool wdtActive = false;
bool adsOK = false;
bool rtcOK = false;
bool lcdOK = false;

#if defined(DEBUG_MODE)
bool debugEnabled = true;
#else
bool debugEnabled = false;
#endif

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    FUNCTION DECLARATIONS                              ║
// ╚═══════════════════════════════════════════════════════════════════════╗
void initWatchdog();
void initHardware();
void initDisplay();
void initSensors();
void initNetwork();
void initMQTT();

void showSplashScreen();
void checkSensors();
void readAllSensors(float &temp, float &ph, float &dist);
float readPHVoltage();
float calculatePH(float voltage);
float getPHVoltageFiltered();

void calibratePH686();
void calibratePH4();
void calculateSlopeOffset();
void saveCalibration();
void loadCalibration();
void resetCalibration();

void readSonar();
void handleStateMachine(float temp, float ph, float waterLevel);
void updateLCD(float temp, float ph, float waterLevel);

void reconnectWiFi();
void reconnectMQTT();
void syncRTCWithNTP();

void publishSensorData(float temp, float ph, float waterLevel, uint32_t timestamp);
void saveLastData(float temp, float ph, float waterLevel, float voltage);
void loadAndSendLastData();
void clearLastData();
void publishEvent(String eventName, String details);
void bufferSensorData(float temp, float ph, float waterLevel, uint32_t timestamp);
void sendBufferedData();

void mqttCallback(char* topic, byte* payload, unsigned int length);
void handleMQTTCommands(String topic, JsonDocument &doc);
void uploadTelemetryToAPI(float temp, float ph, float waterLevel);
void sendTelegramMessage(String message);

String getFormattedTime();
String getUptimeString();
String getStatusString();

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    INITIALIZATION                                    ║
// ╚═══════════════════════════════════════════════════════════════════════╗
void initWatchdog() {
    static bool wdtInitialized = false;
    if (wdtInitialized) return;
    
    const esp_task_wdt_config_t wdt_config = {
        .timeout_ms = 30000,
        .idle_core_mask = 0,
        .trigger_panic = true
    };
    esp_err_t err = esp_task_wdt_init(&wdt_config);
    if (err == ESP_OK) {
        err = esp_task_wdt_add(xTaskGetCurrentTaskHandle());
        if (err == ESP_OK) {
            wdtInitialized = true;
            wdtActive = true;
            if (debugEnabled) Serial.println("[WDT] Initialized (30s)");
        } else {
            Serial.print("[WDT] Add failed: "); Serial.println(esp_err_to_name(err));
        }
    } else {
        Serial.print("[WDT] Init failed: "); Serial.println(esp_err_to_name(err));
    }
}

inline void safeWdtReset() {
    if (wdtActive) esp_task_wdt_reset();
}

void initHardware() {
    Serial.begin(115200);
    delay(500);
    
    sysStatus.bootTime = millis();
    deviceName = "GRW_ID" + String(DEVICE_ID);
    
    Serial.print(F("\n╔═══════════════════════════════════════╗\n"));
    Serial.print(F("║       GROWIFY TECH - INNOVILAGE       ║\n"));
    Serial.print(F("║         v2.0 REV (Shared I2C)        ║\n"));
    Serial.print(F("╚═══════════════════════════════════════╝\n"));
    Serial.print(F("Device ID: ")); Serial.println(DEVICE_ID);
    Serial.print(F("Device Name: ")); Serial.println(deviceName);
    
    Serial1.setRxBufferSize(512);
    Serial1.begin(9600, SERIAL_8N1, RX_SONAR, TX_SONAR);
    
    neopixelWrite(48, 0, 0, 0);
    
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, LOW);
    pinMode(RESET_BTN, INPUT_PULLUP);
    
    #ifdef DISABLE_BROWNOUT
        WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
        Serial.println(F("[BOD] Brownout Detector DISABLED!"));
    #else
        SET_PERI_REG_MASK(RTC_CNTL_BROWN_OUT_REG, RTC_CNTL_BROWN_OUT_ENA);
        Serial.println(F("[BOD] Brownout Detector ENABLED"));
    #endif
    
    esp_reset_reason_t reason = esp_reset_reason();
    Serial.print(F("[BOOT] Reset reason: "));
    switch (reason) {
        case ESP_RST_POWERON:  Serial.println(F("Power On")); break;
        case ESP_RST_SW:       Serial.println(F("Software Reset")); break;
        case ESP_RST_PANIC:    Serial.println(F("Crash/Panic!")); break;
        case ESP_RST_TASK_WDT: Serial.println(F("Watchdog Timeout!")); break;
        case ESP_RST_BROWNOUT: Serial.println(F("⚡ BROWNOUT!")); break;
        default:               Serial.println(F("Other")); break;
    }
    sysStatus.lastResetReason = (uint8_t)reason;
}

void initDisplay() {
    Wire.begin(I2C_SDA, I2C_SCL);
    lcd.init();
    lcd.backlight();
    lcdOK = true;
    Serial.println(F("[LCD] OK (Shared I2C)"));
}

void initSensors() {
    ads.setGain(GAIN_ONE);
    I2C_ADS.begin(ADS1115_SDA, ADS1115_SCL);
    if (ads.begin(0x48, &I2C_ADS)) {
        Serial.println(F("[ADC] ADS1115 OK (Shared I2C)"));
        adsOK = true;
    } else {
        Serial.println(F("[ADC] ADS1115 FAILED!"));
        adsOK = false;
    }
    
    loadCalibration();
    
    sensors.begin();
    
    if (rtc.begin(&Wire)) {
        rtcOK = true;
        Serial.println(F("[RTC] DS3231 OK (Shared I2C)"));
        if (rtc.lostPower()) {
            Serial.println(F("[RTC] Lost power, setting time..."));
            rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
        }
    } else {
        rtcOK = false;
        Serial.println(F("[RTC] FAILED"));
    }
}

void initNetwork() {
    WiFi.mode(WIFI_STA);
    WiFi.setSleep(false);
    WiFi.setAutoReconnect(true);
    WiFi.persistent(false);
    
    WiFiManager wm;
    wm.setConfigPortalTimeout(60);
    wm.setConnectTimeout(10);
    
    wm.setAPCallback([](WiFiManager *myWiFiManager) {
        if (lcdOK) {
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("WiFi Failed!");
            lcd.setCursor(0, 1);
            lcd.print("AP:");
            lcd.print(deviceName.substring(0, 12));
        }
        Serial.println(F("\n>>> AP Mode Active (60s) <<<"));
    });
    
    if (wm.autoConnect(deviceName.c_str())) {
        sysStatus.isOnline = true;
        if (lcdOK) {
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("WiFi OK!");
            lcd.setCursor(0, 1);
            lcd.print(WiFi.localIP());
        }
        Serial.print(F("    IP: ")); Serial.println(WiFi.localIP());
        delay(1000);
    } else {
        sysStatus.isOnline = false;
        if (lcdOK) {
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("Offline Mode");
            lcd.setCursor(0, 1);
            lcd.print("Sensors Active...");
        }
        Serial.println(F("Timeout - Offline Mode"));
    }
    delay(1500);
}

void initMQTT() {
    mqtt_topic_sensors = "growify/" + String(DEVICE_ID) + "/sensors";
    mqtt_topic_control = "growify/" + String(DEVICE_ID) + "/control";
    mqtt_topic_mode = "growify/" + String(DEVICE_ID) + "/mode";
    mqtt_topic_config = "growify/" + String(DEVICE_ID) + "/config";
    mqtt_topic_events = "growify/" + String(DEVICE_ID) + "/events";
    
    preferences.begin("growify", false);
    config.maxHeight = preferences.getFloat("maxHeight", 200.0);
    config.targetPH = preferences.getFloat("targetPH", 4.8);
    config.ph_slope = preferences.getFloat("ph_slope", -0.001678);
    config.ph_offset = preferences.getFloat("ph_offset", 22.38);
    config.ph_offset_4 = preferences.getFloat("ph_offset_4", 0.0);
    config.ph_offset_7 = preferences.getFloat("ph_offset_7", 0.0);
    config.api_host = preferences.getString("api_host", "smartmocaf.com");
    config.api_port = preferences.getInt("api_port", 80);
    config.telegramChatID = preferences.getString("telegramChatID", "-5105119698");
    preferences.end();
    
    Serial.print(F("Loaded Max Height: ")); Serial.print(config.maxHeight); Serial.println(F(" cm"));
    Serial.print(F("Loaded Target pH : ")); Serial.println(config.targetPH);
    
    if (!sysStatus.isOnline) return;
    
    espClient.setInsecure();
    mqttClient.setServer(mqtt_server, mqtt_port);
    mqttClient.setCallback(mqttCallback);
    mqttClient.setBufferSize(512);
    
    String clientId = "ESP32-" + String(DEVICE_ID);
    if (mqttClient.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
        Serial.println(F("[MQTT] OK"));
        mqttClient.subscribe(mqtt_topic_control.c_str());
        mqttClient.subscribe(mqtt_topic_mode.c_str());
        mqttClient.subscribe(mqtt_topic_config.c_str());
        
        if (lcdOK) {
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("MQTT OK!");
            delay(1500);
        }
        
        float t, p, d;
        readAllSensors(t, p, d);
        sysStatus.waterLevel = ((config.maxHeight - d) / config.maxHeight) * 100.0;
        
        String startMsg = "Sistem siap.\nIP: " + WiFi.localIP().toString() + 
                          "\npH: " + String(p, 2) + 
                          "\nTemp: " + String(t, 1) + "C";
        publishEvent("DEVICE_STARTUP", startMsg);
    } else {
        Serial.print(F("[MQTT] FAILED (")); Serial.print(mqttClient.state()); Serial.println(F(")"));
    }
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    HELPER FUNCTIONS                                   ║
// ╚═══════════════════════════════════════════════════════════════════════╗
String getFormattedTime() {
    if (rtcOK) {
        DateTime now = rtc.now();
        char buf[26];
        sprintf(buf, "%04d-%02d-%02dT%02d:%02d:%02d+07:00",
            now.year(), now.month(), now.day(),
            now.hour(), now.minute(), now.second());
        return String(buf);
    } else {
        unsigned long s = millis() / 1000;
        char buf[26];
        sprintf(buf, "uptime_%lus", s);
        return String(buf);
    }
}

String getUptimeString() {
    unsigned long totalSeconds = (millis() - sysStatus.bootTime) / 1000;
    int hours = totalSeconds / 3600;
    int minutes = (totalSeconds % 3600) / 60;
    int seconds = totalSeconds % 60;
    
    String uptime = "";
    if (hours > 0) uptime += String(hours) + "h ";
    if (minutes > 0 || hours > 0) uptime += String(minutes) + "m ";
    uptime += String(seconds) + "s";
    return uptime;
}

String getStatusString() {
    if (flags.isTestMode) return "TEST";
    if (flags.isManualMode) return "MANUAL";
    if (sysStatus.state == FERMENTATION) return "FERMENT";
    if (sysStatus.state == STABILIZING) return "STABLE";
    if (sysStatus.state == DRAINING) return "DRAIN";
    return "IDLE";
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    pH SENSOR FUNCTIONS (RAW ADC)                    ║
// ╚═══════════════════════════════════════════════════════════════════════╗
float getPHVoltageFiltered() {
    static int16_t readings[PH_SAMPLE_COUNT];
    int samples = PH_SAMPLE_COUNT;
    
    for (int i = 0; i < samples; i++) {
        readings[i] = ads.readADC_SingleEnded(ADC_PH_CHANNEL);
        delay(5);
        safeWdtReset();
    }
    
    std::sort(readings, readings + samples);
    
    int trimCount = (int)(samples * PH_TRIM_PERCENT);
    long sum = 0;
    for (int i = trimCount; i < samples - trimCount; i++) {
        sum += readings[i];
    }
    
    float avgRaw = (float)sum / (samples - 2 * trimCount);
    return avgRaw;
}

float calculatePH(float rawADC) {
    float phVal = (config.ph_slope * rawADC) + config.ph_offset;
    
    if (phVal < 0) phVal = 0;
    if (phVal > 14) phVal = 14;
    
    float correction = config.ph_offset_4 + (phVal - 4.0) * (config.ph_offset_7 - config.ph_offset_4) / 2.86;
    phVal += correction;
    
    if (phVal < 0) phVal = 0;
    if (phVal > 14) phVal = 14;
    
    sysStatus.smoothedPH = (0.20 * phVal) + (0.80 * sysStatus.smoothedPH);
    return sysStatus.smoothedPH;
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    CALIBRATION FUNCTIONS                            ║
// ╚═══════════════════════════════════════════════════════════════════════╗
void calibratePH686() {
    Serial.println(F("\n🔬 CALIBRATION pH 6.86 - 60 SECONDS..."));
    Serial.println(F("Don't move sensor!"));
    
    if (lcdOK) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Cal pH 6.86...");
    }
    
    int totalSecs = 60;
    int samplesPerSec = 10;
    int totalSamples = totalSecs * samplesPerSec;
    long long adcSum = 0;
    
    Serial.print(F("Progress: "));
    for (int s = 1; s <= totalSecs; s++) {
        for (int i = 0; i < samplesPerSec; i++) {
            adcSum += ads.readADC_SingleEnded(ADC_PH_CHANNEL);
            delay(100);
            safeWdtReset();
        }
        Serial.print(F("."));
        if (s % 10 == 0) {
            Serial.print(F("[")); Serial.print(s); Serial.print(F("s/60s] "));
            if (lcdOK) {
                lcd.setCursor(0, 1);
                lcd.print(s); lcd.print(F("s / 60s   "));
            }
        }
    }
    
    float avgRaw = (float)adcSum / totalSamples;
    voltage_at_ph7 = avgRaw;
    calibrated_ph7 = true;
    
    Serial.println(F(" Done!"));
    Serial.print(F("✓ ADC at pH 6.86 = ")); Serial.println((int)avgRaw);
    
    if (lcdOK) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(F("pH6.86 ADC: "));
        lcd.print((int)avgRaw);
        lcd.setCursor(0, 1);
        lcd.print(F("OK!"));
    }
    
    if (calibrated_ph4) {
        calculateSlopeOffset();
    } else {
        Serial.println(F("\n⚠ Continue calibration pH 4.0 (type 'cal4')"));
    }
}

void calibratePH4() {
    Serial.println(F("\n🔬 CALIBRATION pH 4.0 - 60 SECONDS..."));
    Serial.println(F("Don't move sensor!"));
    
    if (lcdOK) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Cal pH 4.0...");
    }
    
    int totalSecs = 60;
    int samplesPerSec = 10;
    int totalSamples = totalSecs * samplesPerSec;
    long long adcSum = 0;
    
    Serial.print(F("Progress: "));
    for (int s = 1; s <= totalSecs; s++) {
        for (int i = 0; i < samplesPerSec; i++) {
            adcSum += ads.readADC_SingleEnded(ADC_PH_CHANNEL);
            delay(100);
            safeWdtReset();
        }
        Serial.print(F("."));
        if (s % 10 == 0) {
            Serial.print(F("[")); Serial.print(s); Serial.print(F("s/60s] "));
            if (lcdOK) {
                lcd.setCursor(0, 1);
                lcd.print(s); lcd.print(F("s / 60s   "));
            }
        }
    }
    
    float avgRaw = (float)adcSum / totalSamples;
    voltage_at_ph4 = avgRaw;
    calibrated_ph4 = true;
    
    Serial.println(F(" Done!"));
    Serial.print(F("✓ ADC at pH 4.0 = ")); Serial.println((int)avgRaw);
    
    if (lcdOK) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(F("pH4.0 ADC: "));
        lcd.print((int)voltage_at_ph4);
        lcd.setCursor(0, 1);
        lcd.print(F("OK!"));
    }
    
    if (calibrated_ph7) {
        calculateSlopeOffset();
    } else {
        Serial.println(F("\n⚠ Continue calibration pH 6.86 (type 'cal686')"));
    }
}

void calculateSlopeOffset() {
    float deltaADC = voltage_at_ph7 - voltage_at_ph4;
    
    if (abs(deltaADC) < 10) {
        Serial.println(F("\n✗ ERROR: ADC too similar!"));
        return;
    }
    
    config.ph_slope = (PH_BUFFER_6_86 - PH_BUFFER_4) / deltaADC;
    config.ph_offset = PH_BUFFER_6_86 - (config.ph_slope * voltage_at_ph7);
    
    Serial.println(F("\n╔══════════════════════════════════════╗"));
    Serial.println(F("║   ✓ TWO-POINT CALIBRATION DONE!    ║"));
    Serial.println(F("╚══════════════════════════════════════╝"));
    Serial.print(F("  Slope  = ")); Serial.println(config.ph_slope, 8);
    Serial.print(F("  Offset = ")); Serial.println(config.ph_offset, 4);
    Serial.print(F("  ADC@7  = ")); Serial.println((int)voltage_at_ph7);
    Serial.print(F("  ADC@4  = ")); Serial.println((int)voltage_at_ph4);
    Serial.println(F("→ Type 'save' to save permanently."));
}

void saveCalibration() {
    preferences.begin("growify", false);
    preferences.putFloat("ph_slope", config.ph_slope);
    preferences.putFloat("ph_offset", config.ph_offset);
    preferences.putFloat("ph_offset_4", config.ph_offset_4);
    preferences.putFloat("ph_offset_7", config.ph_offset_7);
    preferences.putInt("adc_ph7", (int)voltage_at_ph7);
    preferences.putInt("adc_ph4", (int)voltage_at_ph4);
    preferences.end();
    
    Serial.println(F("\n✅ SAVED TO FLASH (NVS)"));
    Serial.print(F("  Slope  = ")); Serial.println(config.ph_slope, 8);
    Serial.print(F("  Offset = ")); Serial.println(config.ph_offset, 4);
    Serial.print(F("  ADC@7  = ")); Serial.println((int)voltage_at_ph7);
    Serial.print(F("  ADC@4  = ")); Serial.println((int)voltage_at_ph4);
    
    if (lcdOK) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("SAVED to Flash!");
        lcd.setCursor(0, 1);
        lcd.print("S:"); lcd.print(config.ph_slope, 4);
        delay(2000);
    }
}

void loadCalibration() {
    preferences.begin("growify", false);
    config.ph_slope = preferences.getFloat("ph_slope", -0.001678);
    config.ph_offset = preferences.getFloat("ph_offset", 22.38);
    config.ph_offset_4 = preferences.getFloat("ph_offset_4", 0.0);
    config.ph_offset_7 = preferences.getFloat("ph_offset_7", 0.0);
    voltage_at_ph7 = preferences.getInt("adc_ph7", 9248);
    voltage_at_ph4 = preferences.getInt("adc_ph4", 10952);
    preferences.end();
    
    Serial.println(F("✓ Calibration loaded."));
    Serial.print(F("  Slope: ")); Serial.println(config.ph_slope, 8);
    Serial.print(F("  Offset: ")); Serial.println(config.ph_offset, 4);
    Serial.print(F("  ADC@7: ")); Serial.println((int)voltage_at_ph7);
    Serial.print(F("  ADC@4: ")); Serial.println((int)voltage_at_ph4);
}

void resetCalibration() {
    preferences.begin("growify", false);
    preferences.clear();
    preferences.end();
    
    config.ph_slope = -0.001678;
    config.ph_offset = 22.38;
    config.ph_offset_4 = 0.0;
    config.ph_offset_7 = 0.0;
    calibrated_ph7 = false;
    calibrated_ph4 = false;
    voltage_at_ph7 = 9248;
    voltage_at_ph4 = 10952;
    
    Serial.println(F("\n✓ Calibration reset to default."));
    if (lcdOK) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("RESET Complete!");
        delay(2000);
    }
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    SONAR FUNCTIONS                                    ║
// ╚═══════════════════════════════════════════════════════════════════════╝
void readSonar() {
    while (Serial1.available() > 0) {
        if (Serial1.peek() == 0xFF) {
            if (Serial1.available() >= 4) {
                sonarData[0] = Serial1.read();
                sonarData[1] = Serial1.read();
                sonarData[2] = Serial1.read();
                sonarData[3] = Serial1.read();
                
                int sum = (sonarData[0] + sonarData[1] + sonarData[2]) & 0xFF;
                if (sum == sonarData[3]) {
                    float newDist = (sonarData[1] << 8) + sonarData[2];
                    newDist = newDist / 10.0;
                    
                    if (newDist > 0.5 && newDist < 500.0) {
                        sysStatus.distance = newDist;
                        sysStatus.lastValidSonarTime = millis();
                    }
                }
            } else {
                break;
            }
        } else {
            Serial1.read();
        }
    }
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    SENSOR READING                                    ║
// ╚═══════════════════════════════════════════════════════════════════════╗
void readAllSensors(float &temp, float &ph, float &dist) {
    sensors.requestTemperatures();
    temp = sensors.getTempCByIndex(0);
    
    if (adsOK) {
        float rawADC = getPHVoltageFiltered();
        sysStatus.currentPHVoltage = ads.computeVolts(rawADC);
        ph = calculatePH(rawADC);
    } else {
        ph = -1.0;
        sysStatus.currentPHVoltage = 0.0;
    }
    
    readSonar();
    dist = sysStatus.distance;
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    STATE MACHINE                                      ║
// ╚═══════════════════════════════════════════════════════════════════════╗
void handleStateMachine(float temp, float ph, float waterLevel) {
    unsigned long now = millis();
    
    if (flags.isTestMode) {
        if (!flags.isTestDraining && ph <= config.targetPH) {
            Serial.println(F(">> TEST: pH match! Draining 15s..."));
            digitalWrite(RELAY_PIN, HIGH);
            flags.isTestDraining = true;
            testRelayTimer = now;
            publishEvent("TEST_DRAIN", "Test Mode: pH drain triggered\npH: " + String(ph, 2));
        }
        
        if (flags.isTestDraining) {
            if (now - testRelayTimer >= TEST_DRAIN_DURATION) {
                digitalWrite(RELAY_PIN, LOW);
                flags.isTestDraining = false;
                publishEvent("TEST_DRAIN_END", "Test Mode: Drain complete.");
            }
        }
        return;
    }
    
    if (flags.isManualMode) return;
    
    switch (sysStatus.state) {
        case IDLE:
            break;
            
        case FERMENTATION:
            if (ph <= config.targetPH) {
                sysStatus.state = STABILIZING;
                sysStatus.stateStartTime = now;
                publishEvent("STABILIZING_START", "pH target reached. Starting 10-min stability check.");
            }
            break;
            
        case STABILIZING:
            if (ph > config.targetPH + 0.2) {
                sysStatus.state = FERMENTATION;
                publishEvent("STABILITY_RESET", "pH rose above target. Timer reset.");
            } else if (now - sysStatus.stateStartTime >= STABILITY_DURATION) {
                sysStatus.state = DRAINING;
                digitalWrite(RELAY_PIN, HIGH);
                sysStatus.stateStartTime = now;
                publishEvent("AUTO_DRAIN_START", "pH stable for 10 mins. Draining started.");
            }
            
            if (now - sysStatus.lastWaitMessage >= WAIT_MESSAGE_INTERVAL) {
                sysStatus.lastWaitMessage = now;
                int secsLeft = (STABILITY_DURATION - (now - sysStatus.stateStartTime)) / 1000;
                publishEvent("STABILITY_WAIT", "Waiting...\nTime: " + String(secsLeft / 60) + "m " + String(secsLeft % 60) + "s\npH: " + String(ph, 2));
            }
            break;
            
        case DRAINING:
            if (waterLevel >= 0 && waterLevel < DRAIN_LOW_THRESHOLD) {
                if (!sysStatus.drainLowReached) {
                    sysStatus.drainLowReached = true;
                    sysStatus.drainLowTime = now;
                    publishEvent("DRAIN_LOW", "Water < 5%. Holding 2 min...");
                } else if (now - sysStatus.drainLowTime >= DRAIN_HOLD_TIME) {
                    digitalWrite(RELAY_PIN, LOW);
                    sysStatus.state = IDLE;
                    sysStatus.drainLowReached = false;
                    publishEvent("AUTO_DRAIN_COMPLETE", "Drain complete. Water: " + String(waterLevel, 1) + "%");
                }
            } else {
                if (sysStatus.drainLowReached) {
                    sysStatus.drainLowReached = false;
                }
            }
            
            if (now - sysStatus.lastWaitMessage >= WAIT_MESSAGE_INTERVAL) {
                sysStatus.lastWaitMessage = now;
                String status = "Draining...\nWater: " + String(waterLevel, 1) + "%\npH: " + String(ph, 2);
                publishEvent("DRAIN_PROGRESS", status);
            }
            break;
    }
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    DISPLAY FUNCTIONS                                  ║
// ╚═══════════════════════════════════════════════════════════════════════╗
void showSplashScreen() {
    if (!lcdOK) return;
    lcd.clear();
    lcd.setCursor(1, 0);
    lcd.print("Growify Tech");
    lcd.setCursor(0, 1);
    lcd.print("INNOVILAGE v2.0");
    delay(2000);
    sysStatus.splashShown = true;
}

void updateLCD(float temp, float ph, float waterLevel) {
    if (!lcdOK) return;
    
    static bool heartbeat = false;
    static int lcdScreen = 0;
    static unsigned long lcdTimer = 0;
    
    unsigned long now = millis();
    
    if (lcdScreen == 0) {
        if (now - lcdTimer >= DISPLAY_MAIN_INTERVAL) {
            lcdScreen = 1;
            lcdTimer = now;
        }
    } else {
        if (now - lcdTimer >= DISPLAY_INFO_INTERVAL) {
            lcdScreen++;
            if (lcdScreen > 3) lcdScreen = 0;
            lcdTimer = now;
        }
    }
    
    lcd.clear();
    
    switch (lcdScreen) {
        case 0: {
            lcd.setCursor(0, 0);
            if (flags.isTestMode) {
                lcd.print("MODE: TEST");
                if (flags.isTestDraining) lcd.print(" (ON)");
            } else if (flags.isManualMode) {
                lcd.print("MODE: MANUAL");
            } else {
                if (sysStatus.state == IDLE) lcd.print("STATUS: IDLE");
                else if (sysStatus.state == FERMENTATION) lcd.print("FERMENTING...");
                else if (sysStatus.state == STABILIZING) {
                    lcd.print("STABIL: ");
                    int minLeft = (STABILITY_DURATION - (now - sysStatus.stateStartTime)) / 60000;
                    if (minLeft < 0) minLeft = 0;
                    lcd.print(minLeft); lcd.print("m");
                } else if (sysStatus.state == DRAINING) lcd.print("DRAINING!");
            }
            
            lcd.setCursor(0, 1);
            lcd.print("pH:"); lcd.print(ph, 2);
            lcd.setCursor(9, 1);
            lcd.print("S:"); lcd.print(temp, 1); lcd.print((char)223); lcd.print("C");
            
            lcd.setCursor(15, 0);
            lcd.print(heartbeat ? "." : " ");
            heartbeat = !heartbeat;
            break;
        }
        
        case 1: {
            DateTime rtcNow = rtcOK ? rtc.now() : DateTime((uint32_t)0);
            lcd.setCursor(0, 0);
            char dateBuf[17];
            sprintf(dateBuf, "%02d/%02d/%04d", rtcNow.day(), rtcNow.month(), rtcNow.year());
            lcd.print(dateBuf);
            
            lcd.setCursor(0, 1);
            char timeBuf[17];
            sprintf(timeBuf, "%02d:%02d:%02d", rtcNow.hour(), rtcNow.minute(), rtcNow.second());
            lcd.print(timeBuf);
            lcd.print(" WIB");
            break;
        }
        
        case 2: {
            lcd.setCursor(0, 0);
            lcd.print("WiFi:"); lcd.print(WiFi.status() == WL_CONNECTED ? "OK" : "X");
            lcd.setCursor(9, 0);
            lcd.print("MQTT:"); lcd.print(mqttClient.connected() ? "OK" : "X");
            
            lcd.setCursor(0, 1);
            if (WiFi.status() == WL_CONNECTED) {
                lcd.print(WiFi.localIP().toString().substring(0, 16));
            } else {
                lcd.print("No Connection");
            }
            break;
        }
        
        case 3: {
            lcd.setCursor(0, 0);
            lcd.print("Target: ");
            lcd.print(config.targetPH, 2);
            lcd.print(" pH");
            
            lcd.setCursor(0, 1);
            lcd.print("Air: ");
            if (waterLevel >= 0) {
                lcd.print(waterLevel, 0);
                lcd.print("%");
            } else {
                lcd.print("ERR");
            }
            lcd.setCursor(10, 1);
            lcd.print("R:");
            lcd.print(digitalRead(RELAY_PIN) ? "ON" : "OF");
            break;
        }
    }
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    NETWORK FUNCTIONS                                  ║
// ╚═══════════════════════════════════════════════════════════════════════╗
void syncRTCWithNTP() {
    if (!sysStatus.isOnline) return;
    
    if (lcdOK) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Sync Time...");
    }
    
    Serial.println(F("[NTP] Syncing..."));
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    
    struct tm timeinfo;
    int retry = 0;
    while (!getLocalTime(&timeinfo) && retry < 20) {
        delay(500);
        Serial.print(".");
        retry++;
    }
    
    if (retry >= 20) {
        Serial.println(F(" FAILED"));
        if (lcdOK) {
            lcd.setCursor(0, 1);
            lcd.print("Sync Failed!");
            delay(1500);
        }
        return;
    }
    
    if (rtcOK) {
        rtc.adjust(DateTime(
            timeinfo.tm_year + 1900,
            timeinfo.tm_mon + 1,
            timeinfo.tm_mday,
            timeinfo.tm_hour,
            timeinfo.tm_min,
            timeinfo.tm_sec
        ));
    }
    
    Serial.println(F(" OK"));
    if (lcdOK) {
        lcd.setCursor(0, 1);
        char timeStr[17];
        sprintf(timeStr, "%02d:%02d OK!", timeinfo.tm_hour, timeinfo.tm_min);
        lcd.print(timeStr);
        delay(1500);
    }
}

void reconnectWiFi() {
    if (WiFi.status() == WL_CONNECTED) {
        sysStatus.isOnline = true;
        sysStatus.wifiBackoffIndex = 0;
        sysStatus.wifiReconnectInterval = WIFI_BACKOFF_STEPS[0];
        return;
    }
    
    Serial.println(F("[WiFi] Reconnecting..."));
    WiFi.reconnect();
    
    int timeout = 10;
    while (WiFi.status() != WL_CONNECTED && timeout > 0) {
        delay(500);
        Serial.print(".");
        timeout--;
        safeWdtReset();
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        sysStatus.isOnline = true;
        sysStatus.wifiBackoffIndex = 0;
        sysStatus.wifiReconnectInterval = WIFI_BACKOFF_STEPS[0];
        Serial.println(F(" OK"));
        
        delay(2000);
        
        if (lcdOK) {
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("WiFi Reconnected!");
            lcd.setCursor(0, 1);
            lcd.print(WiFi.localIP());
            delay(2000);
        }
        
        flags.isReconnecting = true;
        syncRTCWithNTP();
        
        if (!mqttClient.connected()) {
            reconnectMQTT();
        }
        
        if (bufferCount > 0) {
            sendBufferedData();
        }
    } else {
        sysStatus.isOnline = false;
        if (sysStatus.wifiBackoffIndex < WIFI_BACKOFF_COUNT - 1) {
            sysStatus.wifiBackoffIndex++;
        }
        sysStatus.wifiReconnectInterval = WIFI_BACKOFF_STEPS[sysStatus.wifiBackoffIndex];
        Serial.print(F(" Failed. Next: "));
        Serial.print(sysStatus.wifiReconnectInterval / 1000);
        Serial.println(F("s"));
    }
}

void reconnectMQTT() {
    if (!sysStatus.isOnline || mqttClient.connected()) return;
    
    unsigned long now = millis();
    if (now - sysStatus.lastMqttReconnect < sysStatus.mqttReconnectInterval) return;
    
    sysStatus.lastMqttReconnect = now;
    
    Serial.print(F("[MQTT] Reconnecting..."));
    String clientId = "ESP32-" + String(DEVICE_ID) + "-" + String(millis());
    safeWdtReset();
    
    if (mqttClient.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
        Serial.println(F(" OK"));
        sysStatus.mqttReconnectInterval = 10 * ONE_SECOND;
        mqttClient.subscribe(mqtt_topic_control.c_str());
        mqttClient.subscribe(mqtt_topic_mode.c_str());
        mqttClient.subscribe(mqtt_topic_config.c_str());
        
        loadAndSendLastData();
        
        float t, p, d;
        readAllSensors(t, p, d);
        sysStatus.waterLevel = ((config.maxHeight - d) / config.maxHeight) * 100.0;
        
        String msg = "MQTT reconnected.\npH: " + String(p, 2) + "\nTemp: " + String(t, 1) + "C";
        publishEvent("DEVICE_RECONNECTED", msg);
    } else {
        Serial.print(F(" Failed: ")); Serial.println(mqttClient.state());
        if (sysStatus.mqttReconnectInterval < 5 * ONE_MINUTE) {
            sysStatus.mqttReconnectInterval *= 2;
        }
    }
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    MQTT FUNCTIONS                                     ║
// ╚═══════════════════════════════════════════════════════════════════════╗
void mqttCallback(char* topic, byte* payload, unsigned int length) {
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, payload, length);
    
    if (error) {
        Serial.print(F("MQTT JSON Error: ")); Serial.println(error.c_str());
        return;
    }
    
    Serial.print(F("MQTT [")); Serial.print(topic); Serial.print(F("]: "));
    serializeJson(doc, Serial);
    Serial.println();
    
    handleMQTTCommands(String(topic), doc);
}

void handleMQTTCommands(String topic, JsonDocument &doc) {
    if (topic == mqtt_topic_config) {
        if (doc.containsKey("max_height")) {
            config.maxHeight = doc["max_height"].as<float>();
            preferences.begin("growify", false);
            preferences.putFloat("maxHeight", config.maxHeight);
            preferences.end();
            publishEvent("CONFIG_UPDATE", "Max Height: " + String(config.maxHeight) + " cm");
        }
        if (doc.containsKey("target_ph")) {
            config.targetPH = doc["target_ph"].as<float>();
            preferences.begin("growify", false);
            preferences.putFloat("targetPH", config.targetPH);
            preferences.end();
            publishEvent("CONFIG_UPDATE", "Target pH: " + String(config.targetPH));
        }
        if (doc.containsKey("ph_slope")) {
            config.ph_slope = doc["ph_slope"].as<float>();
            preferences.begin("growify", false);
            preferences.putFloat("ph_slope", config.ph_slope);
            preferences.end();
        }
        if (doc.containsKey("ph_offset")) {
            config.ph_offset = doc["ph_offset"].as<float>();
            preferences.begin("growify", false);
            preferences.putFloat("ph_offset", config.ph_offset);
            preferences.end();
        }
        if (doc.containsKey("telegram_chat_id")) {
            config.telegramChatID = doc["telegram_chat_id"].as<String>();
            preferences.begin("growify", false);
            preferences.putString("telegramChatID", config.telegramChatID);
            preferences.end();
            sendTelegramMessage("Bot connected!");
        }
        if (doc.containsKey("action")) {
            String action = doc["action"].as<String>();
            if (action == "test_api") {
                float t, p, d;
                readAllSensors(t, p, d);
                float wl = ((config.maxHeight - d) / config.maxHeight) * 100.0;
                if (wl < 0) wl = 0;
                uploadTelemetryToAPI(t, p, wl);
            }
        }
        
        if (lcdOK) {
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("Config Updated!");
            delay(500);
        }
    }
    
    if (topic == mqtt_topic_mode) {
        if (doc.containsKey("action")) {
            String action = doc["action"].as<String>();
            if (action == "start") {
                sysStatus.state = FERMENTATION;
                flags.isManualMode = false;
                flags.isTestMode = false;
                publishEvent("FERMENTATION_START", "Fermentation started.");
            } else if (action == "stop") {
                sysStatus.state = IDLE;
                digitalWrite(RELAY_PIN, LOW);
                publishEvent("FERMENTATION_STOP", "Fermentation stopped.");
            }
        }
        if (doc.containsKey("mode")) {
            String modeCmd = doc["mode"].as<String>();
            if (modeCmd == "manual" || modeCmd == "MANUAL") {
                flags.isManualMode = true;
                flags.isTestMode = false;
                publishEvent("MODE_CHANGE", "Mode: MANUAL");
            } else if (modeCmd == "auto" || modeCmd == "AUTO") {
                flags.isManualMode = false;
                flags.isTestMode = false;
                if (sysStatus.state == IDLE) digitalWrite(RELAY_PIN, LOW);
                publishEvent("MODE_CHANGE", "Mode: AUTO");
            } else if (modeCmd == "test" || modeCmd == "TEST") {
                flags.isManualMode = false;
                flags.isTestMode = true;
                flags.isTestDraining = false;
                publishEvent("MODE_CHANGE", "Mode: TEST");
            }
        }
    }
    
    if (topic == mqtt_topic_control) {
        if (doc.containsKey("relay")) {
            String relayCmd = doc["relay"].as<String>();
            
            if (relayCmd == "3") {
                sysStatus.state = FERMENTATION;
                flags.isManualMode = false;
                flags.isTestMode = false;
                publishEvent("FERMENTATION_START", "Started.");
                return;
            } else if (relayCmd == "4") {
                sysStatus.state = IDLE;
                digitalWrite(RELAY_PIN, LOW);
                publishEvent("FERMENTATION_STOP", "Stopped.");
                return;
            }
            
            if (flags.isManualMode) {
                if (relayCmd == "on" || relayCmd == "ON" || relayCmd == "1") {
                    digitalWrite(RELAY_PIN, HIGH);
                    publishEvent("RELAY_CONTROL", "Relay ON (Manual)");
                } else if (relayCmd == "off" || relayCmd == "OFF" || relayCmd == "0") {
                    if (sysStatus.state == DRAINING && (millis() - sysStatus.stateStartTime < MIN_RELAY_TIME)) {
                        publishEvent("RELAY_CONTROL_IGNORED", "Min 15s protection active");
                    } else {
                        digitalWrite(RELAY_PIN, LOW);
                        publishEvent("RELAY_CONTROL", "Relay OFF (Manual)");
                    }
                }
            } else {
                publishEvent("RELAY_CONTROL_IGNORED", "Ignored in AUTO mode");
            }
        }
    }
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    DATA PUBLISHING                                    ║
// ╚═══════════════════════════════════════════════════════════════════════╗
void publishSensorData(float temp, float ph, float waterLevel, uint32_t timestamp) {
    StaticJsonDocument<512> doc;
    
    DateTime now = rtcOK ? rtc.now() : DateTime((uint32_t)0);
    char datetime[26];
    sprintf(datetime, "%04d-%02d-%02dT%02d:%02d:%02d+07:00",
        now.year(), now.month(), now.day(),
        now.hour(), now.minute(), now.second());
    
    doc["device_id"] = DEVICE_ID;
    doc["temp"] = round(temp * 10) / 10.0;
    doc["ph"] = round(ph * 100) / 100.0;
    doc["water_level"] = round(waterLevel * 10) / 10.0;
    doc["relay"] = digitalRead(RELAY_PIN);
    doc["mode"] = flags.isTestMode ? "test" : (flags.isManualMode ? "manual" : "auto");
    doc["status"] = getStatusString();
    doc["uptime_s"] = (millis() - sysStatus.bootTime) / 1000;
    
    if (sysStatus.state == STABILIZING) {
        doc["stable_time_s"] = (millis() - sysStatus.stateStartTime) / 1000;
    }
    
    doc["datetime"] = datetime;
    doc["temp_device"] = round(temperatureRead() * 10) / 10.0;
    doc["distance_cm"] = round(sysStatus.distance * 10) / 10.0;
    doc["voltage"] = round(sysStatus.currentPHVoltage * 10000) / 10000.0;
    
    char payload[512];
    serializeJson(doc, payload);
    
    if (mqttClient.publish(mqtt_topic_sensors.c_str(), payload)) {
        if (debugEnabled) Serial.print(F("MQTT Sent: ")); Serial.println(payload);
        saveLastData(temp, ph, waterLevel, sysStatus.currentPHVoltage);
    } else {
        Serial.println(F("MQTT Send FAILED"));
    }
}

void publishEvent(String eventName, String details) {
    if (mqttClient.connected()) {
        StaticJsonDocument<256> doc;
        doc["event"] = eventName;
        doc["details"] = details;
        doc["datetime"] = getFormattedTime();
        char buffer[256];
        serializeJson(doc, buffer);
        mqttClient.publish(mqtt_topic_events.c_str(), buffer);
    }
    
    String title = "";
    if (eventName == "AUTO_DRAIN_START") title = "KERAN DIBUKA (Auto)";
    else if (eventName == "AUTO_DRAIN_COMPLETE") title = "KERAN DITUTUP";
    else if (eventName == "STABILITY_RESET") title = "STABILITAS RESET";
    else if (eventName == "MODE_CHANGE") title = "MODE BERUBAH";
    else if (eventName == "RELAY_CONTROL") title = "KONTROL MANUAL";
    else if (eventName == "CONFIG_UPDATE") title = "KONFIGURASI UPDATE";
    else if (eventName == "FERMENTATION_START") title = "MULAI FERMENTASI";
    else if (eventName == "STABILIZING_START") title = "TAHAP STABILISASI";
    else if (eventName == "FERMENTATION_STOP") title = "FERMENTASI SELESAI";
    else if (eventName == "TELE_STATUS") title = "LAPORAN STATUS";
    else if (eventName == "DEVICE_STARTUP") title = "ALAT ONLINE";
    else if (eventName == "DEVICE_RECONNECTED") title = "KONEKSI PULIH";
    
    if (title != "" && sysStatus.isOnline) {
        String msg = "<b>" + title + "</b>\n";
        msg += "Device: " + String(DEVICE_ID) + "\n";
        msg += details + "\n\n";
        msg += "pH: " + String(sysStatus.smoothedPH, 2) + " (" + String(sysStatus.currentPHVoltage, 4) + "V)\n";
        msg += "Uptime: " + getUptimeString();
        safeWdtReset();
        sendTelegramMessage(msg);
        safeWdtReset();
    }
}

void saveLastData(float temp, float ph, float waterLevel, float voltage) {
    preferences.begin("lastdata", false);
    preferences.putFloat("temp", temp);
    preferences.putFloat("ph", ph);
    preferences.putFloat("waterLevel", waterLevel);
    preferences.putFloat("voltage", voltage);
    preferences.putULong("timestamp", rtc.now().unixtime());
    preferences.end();
}

void loadAndSendLastData() {
    preferences.begin("lastdata", true);
    float temp = preferences.getFloat("temp", 0.0);
    float ph = preferences.getFloat("ph", 0.0);
    float waterLevel = preferences.getFloat("waterLevel", 0.0);
    float voltage = preferences.getFloat("voltage", 0.0);
    uint32_t timestamp = preferences.getULong("timestamp", 0);
    preferences.end();
    
    if (temp > 0 || ph > 0) {
        if (mqttClient.connected()) {
            StaticJsonDocument<512> doc;
            DateTime t(timestamp);
            char datetime[26];
            if (timestamp > 0) {
                sprintf(datetime, "%04d-%02d-%02dT%02d:%02d:%02d+07:00",
                    t.year(), t.month(), t.day(), t.hour(), t.minute(), t.second());
            } else {
                strcpy(datetime, "unknown");
            }
            
            doc["device_id"] = DEVICE_ID;
            doc["temp"] = round(temp * 10) / 10.0;
            doc["ph"] = round(ph * 100) / 100.0;
            doc["water_level"] = round(waterLevel * 10) / 10.0;
            doc["voltage"] = round(voltage * 10000) / 10000.0;
            doc["relay"] = digitalRead(RELAY_PIN);
            doc["mode"] = flags.isTestMode ? "test" : (flags.isManualMode ? "manual" : "auto");
            doc["status"] = getStatusString();
            doc["uptime_s"] = (millis() - sysStatus.bootTime) / 1000;
            doc["datetime"] = datetime;
            doc["distance_cm"] = round(sysStatus.distance * 10) / 10.0;
            doc["is_reconnect"] = true;
            
            char payload[512];
            serializeJson(doc, payload);
            mqttClient.publish(mqtt_topic_sensors.c_str(), payload);
            Serial.println(F("[MQTT] Last data published"));
        }
        
        String msg = "Data terakhir sebelum reconnect:\n";
        if (timestamp > 0) {
            DateTime t(timestamp);
            char timeBuf[20];
            sprintf(timeBuf, "%02d/%02d/%04d %02d:%02d",
                t.day(), t.month(), t.year(), t.hour(), t.minute());
            msg += "Waktu: " + String(timeBuf) + "\n";
        }
        msg += "pH: " + String(ph, 2) + " (" + String(voltage, 4) + "V)\n";
        msg += "Temp: " + String(temp, 1) + "C\n";
        msg += "Water: " + String(waterLevel, 1) + "%";
        sendTelegramMessage(msg);
    }
}

void bufferSensorData(float temp, float ph, float waterLevel, uint32_t timestamp) {
    offlineBuffer[bufferWriteIndex].temp = temp;
    offlineBuffer[bufferWriteIndex].ph = ph;
    offlineBuffer[bufferWriteIndex].waterLevel = waterLevel;
    offlineBuffer[bufferWriteIndex].timestamp = timestamp;
    offlineBuffer[bufferWriteIndex].valid = true;
    
    bufferWriteIndex = (bufferWriteIndex + 1) % MAX_BUFFER;
    if (bufferCount < MAX_BUFFER) {
        bufferCount++;
    } else {
        bufferReadIndex = (bufferReadIndex + 1) % MAX_BUFFER;
    }
    
    if (debugEnabled) Serial.print(F("Buffer: ")); Serial.print(bufferCount); Serial.println(F(" items"));
}

void sendBufferedData() {
    if (bufferCount == 0 || !mqttClient.connected()) return;
    
    Serial.print(F("Sending ")); Serial.print(bufferCount); Serial.println(F(" buffer data..."));
    
    int sent = 0;
    while (bufferCount > 0 && sent < 10) {
        if (offlineBuffer[bufferReadIndex].valid) {
            publishSensorData(
                offlineBuffer[bufferReadIndex].temp,
                offlineBuffer[bufferReadIndex].ph,
                offlineBuffer[bufferReadIndex].waterLevel,
                offlineBuffer[bufferReadIndex].timestamp
            );
            offlineBuffer[bufferReadIndex].valid = false;
            sent++;
        }
        bufferReadIndex = (bufferReadIndex + 1) % MAX_BUFFER;
        bufferCount--;
        delay(50);
    }
    
    Serial.print(F("Sent: ")); Serial.print(sent); Serial.print(F(", Remaining: ")); Serial.println(bufferCount);
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    API & TELEGRAM                                     ║
// ╚═══════════════════════════════════════════════════════════════════════╗
void uploadTelemetryToAPI(float temp, float ph, float waterLevel) {
    if (!sysStatus.isOnline) {
        publishEvent("API_TEST_FAIL", "Device offline");
        return;
    }
    
    WiFiClient client;
    String host = config.api_host;
    int port = config.api_port;
    
    Serial.print(F("API Upload to: ")); Serial.print(host); Serial.print(":"); Serial.println(port);
    
    if (client.connect(host.c_str(), port)) {
        StaticJsonDocument<256> doc;
        doc["device_id"] = DEVICE_ID;
        doc["temp"] = round(temp * 10) / 10.0;
        doc["ph"] = round(ph * 100) / 100.0;
        doc["water_level"] = round(waterLevel * 10) / 10.0;
        
        String payload;
        serializeJson(doc, payload);
        
        client.println("POST /api/mqtt-webhook HTTP/1.1");
        client.println("Host: " + host);
        client.println("Content-Type: application/json");
        client.print("Content-Length: ");
        client.println(payload.length());
        client.println();
        client.println(payload);
        
        unsigned long start = millis();
        String response = "";
        while (client.connected() && millis() - start < 3000) {
            if (client.available()) response += (char)client.read();
            safeWdtReset();
        }
        client.stop();
        
        if (response.indexOf("200") > 0 || response.indexOf("201") > 0) {
            Serial.println(F("API OK"));
            publishEvent("API_TEST_OK", "Data sent to " + host);
        } else {
            Serial.print(F("API Response: ")); Serial.println(response.substring(0, 80));
            publishEvent("API_TEST_FAIL", response.substring(0, 80));
        }
    } else {
        Serial.println(F("API Connect FAILED"));
        publishEvent("API_TEST_FAIL", "Failed to connect to " + host);
    }
}

void sendTelegramMessage(String message) {
    if (config.telegramChatID == "" || !sysStatus.isOnline) return;
    
    WiFiClientSecure teleClient;
    teleClient.setInsecure();
    
    if (teleClient.connect("api.telegram.org", 443)) {
        String url = "/bot" + String(telegramToken) + "/sendMessage";
        String payload = "{\"chat_id\":\"" + config.telegramChatID + "\",\"text\":\"" + message + "\",\"parse_mode\":\"HTML\"}";
        
        teleClient.println("POST " + url + " HTTP/1.1");
        teleClient.println("Host: api.telegram.org");
        teleClient.println("Content-Type: application/json");
        teleClient.print("Content-Length: ");
        teleClient.println(payload.length());
        teleClient.println();
        teleClient.println(payload);
        
        unsigned long start = millis();
        while (teleClient.connected() && millis() - start < 2000) {
            if (teleClient.available()) teleClient.read();
            safeWdtReset();
        }
        teleClient.stop();
    }
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                    SETUP & LOOP                                       ║
// ╚═══════════════════════════════════════════════════════════════════════╗
void setup() {
    delay(500);
    
    initHardware();
    initDisplay();
    initSensors();
    
    showSplashScreen();
    initNetwork();
    
    if (sysStatus.isOnline) {
        syncRTCWithNTP();
    }
    
    initMQTT();
    
    if (sysStatus.isOnline && mqttClient.connected()) {
        sendBufferedData();
    }
    
    sysStatus.state = IDLE;
    sysStatus.stateStartTime = millis();
    sysStatus.wifiBackoffIndex = 0;
    sysStatus.wifiReconnectInterval = WIFI_BACKOFF_STEPS[0];
    sysStatus.lastMqttPublish = millis();
    sysStatus.lastApiUpload = millis();
    sysStatus.lastPeriodicMessage = millis();
    sysStatus.lastWaitMessage = millis();
    sysStatus.lastWiFiReconnect = millis();
    sysStatus.lastMqttReconnect = 0;
    sysStatus.mqttReconnectInterval = 10 * ONE_SECOND;
    sysStatus.lastBuffer = millis();
    sysStatus.lastValidSonarTime = 0;
    sysStatus.smoothedPH = 7.0;
    sysStatus.distance = 0;
    sysStatus.waterLevel = 0;
    sysStatus.drainLowReached = false;
    
    if (lcdOK) lcd.clear();
    Serial.println(F("\n=== System Ready ===\n"));
    
    initWatchdog();
}

void loop() {
    unsigned long now = millis();
    
    while (Serial.available() > 0) {
        static String inputString = "";
        char c = Serial.read();
        if (c == '\n' || c == '\r') {
            if (inputString.length() > 0) {
                inputString.trim();
                inputString.toLowerCase();
                
                if (inputString == "cal7" || inputString == "cal686") {
                    calibratePH686();
                } else if (inputString == "cal4") {
                    calibratePH4();
                } else if (inputString == "save") {
                    saveCalibration();
                } else if (inputString == "reset") {
                    resetCalibration();
                } else if (inputString == "info") {
                    Serial.println(F("\n--- Calibration Info ---"));
                    Serial.print(F("  Slope  : ")); Serial.println(config.ph_slope, 4);
                    Serial.print(F("  Offset : ")); Serial.println(config.ph_offset, 4);
                    Serial.println(F("------------------------\n"));
                } else if (inputString == "help") {
                    Serial.println(F("Commands: cal686, cal4, save, reset, info, help"));
                } else {
                    Serial.println(F("Unknown command. Type 'help'."));
                }
                inputString = "";
            }
        } else {
            inputString += c;
        }
    }
    
    float temp, ph, dist;
    readAllSensors(temp, ph, dist);
    
    unsigned long currentMillis = millis();
    float waterLevel = 0.0;
    
    if (dist <= 0 || (currentMillis - sysStatus.lastValidSonarTime > SONAR_TIMEOUT_MS)) {
        waterLevel = -2.0;
    } else if (dist >= config.maxHeight) {
        waterLevel = 0.0;
    } else {
        waterLevel = ((config.maxHeight - dist) / config.maxHeight) * 100.0;
        if (waterLevel >= 97.0) waterLevel = 100.0;
    }
    
    sysStatus.waterLevel = waterLevel;
    
    DateTime rtcNow = rtc.now();
    uint32_t timestamp = rtcNow.unixtime();
    sysStatus.isOnline = (WiFi.status() == WL_CONNECTED);
    
    handleStateMachine(temp, ph, waterLevel);
    updateLCD(temp, ph, waterLevel);
    
    if (sysStatus.isOnline) {
        if (!mqttClient.connected()) {
            reconnectMQTT();
        }
        mqttClient.loop();
        
        if (now - sysStatus.lastMqttPublish >= MQTT_PUBLISH_INTERVAL) {
            sysStatus.lastMqttPublish = now;
            publishSensorData(temp, ph, waterLevel, timestamp);
        }
        
        if (now - sysStatus.lastPeriodicMessage >= PERIODIC_MESSAGE_INTERVAL) {
            sysStatus.lastPeriodicMessage = now;
            String status = "Still running.\nStatus: " + getStatusString() +
                           "\npH: " + String(ph, 2) + " (" + String(sysStatus.currentPHVoltage, 4) + "V)" +
                           "\nTemp: " + String(temp, 1) + "C" +
                           "\nWater: " + String(waterLevel, 1) + "%";
            publishEvent("TELE_STATUS", status);
        }
        
        if (sysStatus.state != IDLE && (now - sysStatus.lastApiUpload >= API_UPLOAD_INTERVAL)) {
            sysStatus.lastApiUpload = now;
            uploadTelemetryToAPI(temp, ph, waterLevel);
        }
    } else {
        if (now - sysStatus.lastBuffer >= MQTT_BUFFER_INTERVAL) {
            sysStatus.lastBuffer = now;
            bufferSensorData(temp, ph, waterLevel, timestamp);
        }
        
        if (now - sysStatus.lastWiFiReconnect >= sysStatus.wifiReconnectInterval) {
            sysStatus.lastWiFiReconnect = now;
            reconnectWiFi();
        }
    }
    
    Serial.print(F("T:")); Serial.print(temp);
    Serial.print(F(" pH:")); Serial.print(ph, 2);
    Serial.print(F(" W:")); Serial.print(waterLevel); Serial.print(F("%"));
    Serial.print(F(" M:")); Serial.print(flags.isManualMode ? "MAN" : "AUTO");
    Serial.print(F(" ")); Serial.println(sysStatus.isOnline ? "Online" : "Offline");
    
    if (digitalRead(RESET_BTN) == LOW) {
        if (!flags.resetBtnActive) {
            flags.resetBtnActive = true;
            resetBtnPressStart = now;
        } else if (now - resetBtnPressStart >= FORCE_AP_HOLD_MS) {
            Serial.println(F("\n[!] FORCE AP MODE"));
            if (lcdOK) {
                lcd.clear();
                lcd.setCursor(0, 0);
                lcd.print("FORCE AP MODE");
                lcd.setCursor(0, 1);
                lcd.print("192.168.4.1");
            }
            
            esp_task_wdt_delete(xTaskGetCurrentTaskHandle());
            
            WiFi.disconnect(true);
            delay(500);
            
            WiFiManager wm;
            wm.setConfigPortalTimeout(120);
            wm.setConnectTimeout(10);
            
            if (wm.startConfigPortal(deviceName.c_str())) {
                sysStatus.isOnline = true;
                sysStatus.wifiBackoffIndex = 0;
                sysStatus.wifiReconnectInterval = WIFI_BACKOFF_STEPS[0];
                Serial.println(F("WiFi saved!"));
                syncRTCWithNTP();
                if (!mqttClient.connected()) reconnectMQTT();
            }
            
            esp_task_wdt_add(xTaskGetCurrentTaskHandle());
            flags.resetBtnActive = false;
        }
    } else {
        flags.resetBtnActive = false;
    }
    
    safeWdtReset();
    delay(500);
}
