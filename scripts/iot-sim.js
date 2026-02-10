const mqtt = require("mqtt");
const moment = require("moment"); // Untuk format datetime ISO 8601

/**
 * SIMULASI IoT NODE - SMART MOCAF (Node.js)
 * Script ini mengirimkan data dummy ke MQTT sesuai format firmware ESP32.
 */

// ==================== CONFIGURATION ====================
const DEVICE_ID = "0001";
const MQTT_CONFIG = {
  host: "g0d76118.ala.asia-southeast1.emqxsl.com",
  port: 8883,
  protocol: "mqtts",
  username: "smart_mocaf01",
  password: "smart_mocaf01",
  clientId: `NODE-JS-MOCK-${DEVICE_ID}`,
};

// --- SIMULATION SETTINGS ---
const START_PH = 6.86; // pH awal
const TARGET_PH = 4.0; // pH tujuan
const TRANSITION_MINUTES = 5; // Durasi transisi (menit)
const PUBLISH_INTERVAL_MS = 3000; // Kirim data setiap 3 detik

// ==================== STATE MANAGEMENT ====================
let currentPH = START_PH;
let isManualMode = false;
let relayState = 0;
let waterLevel = 85.5;
let temperature = 27.2;
const startTime = Date.now();

// Topics
const TOPIC_SENSORS = `growify/${DEVICE_ID}/sensors`;
const TOPIC_CONTROL = `growify/${DEVICE_ID}/control`;
const TOPIC_MODE = `growify/${DEVICE_ID}/mode`;

// ==================== MQTT CONNECTION ====================
const client = mqtt.connect(MQTT_CONFIG);

client.on("connect", () => {
  console.log("✅ Connected to MQTT Broker");

  // Subscribe to commands
  client.subscribe([TOPIC_CONTROL, TOPIC_MODE], (err) => {
    if (!err) {
      console.log(
        `📡 Subscribed to topics: \n - ${TOPIC_CONTROL}\n - ${TOPIC_MODE}`,
      );
    }
  });
});

client.on("message", (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    console.log(`📩 Received Command [${topic}]:`, payload);

    // Handle Mode Changes
    if (topic === TOPIC_MODE) {
      if (payload.mode === "manual") {
        isManualMode = true;
        console.log("🔄 Switched to MANUAL mode");
      } else {
        isManualMode = false;
        relayState = 0; // Turn off relay in auto mode simulation
        console.log("🔄 Switched to AUTO mode");
      }
    }

    // Handle Relay Control (Only in Manual Mode)
    if (topic === TOPIC_CONTROL && isManualMode) {
      if (payload.relay === "on" || payload.relay === "1") {
        relayState = 1;
        console.log("🔌 Relay: ON (via MQTT)");
      } else {
        relayState = 0;
        console.log("🔌 Relay: OFF (via MQTT)");
      }
    }
  } catch (e) {
    console.error("❌ Failed to parse MQTT message:", message.toString());
  }
});

// ==================== SIMULATION LOGIC ====================

function updateSimulation() {
  // 1. Calculate Linear pH Transition
  const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);
  const progress = Math.min(elapsedMinutes / TRANSITION_MINUTES, 1);

  // Update pH: pH_awal + (selisih * progress)
  currentPH = START_PH + (TARGET_PH - START_PH) * progress;
  
  // Auto open relay when target is reached
  if (progress >= 1 && relayState === 0 && !isManualMode) {
      relayState = 1;
      console.log('🔔 TARGET REACHED: Automatically opening valve (Relay ON)');
  }

  // Add a very small random variation (jitter) to make it look real
  currentPH += (Math.random() - 0.5) * 0.02;

  // 2. Simulate Water Level (slightly fluctuates)
  waterLevel += (Math.random() - 0.5) * 0.5;
  if (waterLevel > 100) waterLevel = 99;
  if (waterLevel < 10) waterLevel = 15;

  // 3. Prepare Payload
  const payload = {
    device_id: DEVICE_ID,
    temp: parseFloat(temperature.toFixed(1)),
    ph: parseFloat(currentPH.toFixed(2)),
    water_level: parseFloat(waterLevel.toFixed(1)),
    relay: relayState,
    mode: isManualMode ? "manual" : "auto",
    datetime: moment().utcOffset(7).format("YYYY-MM-DDTHH:mm:ss+07:00"),
  };

    // 4. Publish to MQTT
    const payloadStr = JSON.stringify(payload);
    client.publish(TOPIC_SENSORS, payloadStr);
    
    console.log(`🚀 [${payload.datetime}] Published: pH:${payload.ph} | Level:${payload.water_level}% | Mode:${payload.mode} | Relay:${payload.relay}`);
}

// Start interval
setInterval(updateSimulation, PUBLISH_INTERVAL_MS);

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Simulation stopped.");
  client.end();
  process.exit();
});
