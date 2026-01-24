/* IoT Simulator for SmartMocaf (Supabase)
 * - Acks queued commands (queued -> sent -> acked)
 * - Generates telemetry for a device (temp + pH) with speedup
 * - Optional: auto-drain when pH reaches target
 */

require("dotenv").config({ path: ".env.iot.sim" });
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEVICE_ID_ENV = process.env.DEVICE_ID || "";
const SPEEDUP = Number(process.env.SPEEDUP || "1"); // >1 = faster
const AUTO_DRAIN_ON_TARGET = String(process.env.AUTO_DRAIN_ON_TARGET || "false") === "true";
const AUTO_STOP_ON_TARGET = String(process.env.AUTO_STOP_ON_TARGET || "false") === "true";

// Base intervals (realistic)
const TEMP_INTERVAL_SEC = 60;      // temp every 1 min
const PH_INTERVAL_SEC = 10800;     // pH every 3 hours
const PH_NEAR_TARGET_SEC = 300;    // pH every 5 min near target
const NEAR_TARGET_DELTA = 0.2;

// Operational loops
const COMMAND_POLL_MS = 3000;      // check commands every 3 sec
const DEVICE_REFRESH_MS = 15000;   // refresh settings/run every 15 sec

if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.iot-sim");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function nowIso() {
    return new Date().toISOString();
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

// Simulator in-memory state
const sim = {
    deviceId: null,
    targetPh: 4.5,
    valveOpen: false,         // mapped to device_settings.auto_drain_enabled (per your current meaning)
    runningRunId: null,
    runStatus: "idle",
    ph: 6.8,
    temp: 32.0,
    lastTempSentAt: 0,
    lastPhSentAt: 0,
};

async function pickDeviceId() {
    if (DEVICE_ID_ENV) return DEVICE_ID_ENV;

    const { data, error } = await supabase
        .from("devices")
        .select("id, name, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No active devices found. Create a device first.");

    console.log(`[sim] Using latest device: ${data[0].name} (${data[0].id})`);
    return data[0].id;
}

async function refreshDeviceContext() {
    // settings
    const { data: settings, error: sErr } = await supabase
        .from("device_settings")
        .select("target_ph, auto_drain_enabled, updated_at")
        .eq("device_id", sim.deviceId)
        .maybeSingle();

    if (sErr) throw sErr;
    if (settings) {
        sim.targetPh = Number(settings.target_ph ?? sim.targetPh);
        // NOTE: in your current app meaning: auto_drain_enabled == valve open/close
        sim.valveOpen = Boolean(settings.auto_drain_enabled);
    }

    // latest running run
    const { data: runs, error: rErr } = await supabase
        .from("fermentation_runs")
        .select("id, status, target_ph, started_at, created_at")
        .eq("device_id", sim.deviceId)
        .order("created_at", { ascending: false })
        .limit(1);

    if (rErr) throw rErr;
    const latest = runs && runs[0];
    if (latest) {
        sim.runStatus = latest.status;
        sim.runningRunId = latest.status === "running" ? latest.id : null;
        // if run has its own target snapshot, prefer it while running
        if (latest.status === "running" && latest.target_ph != null) {
            sim.targetPh = Number(latest.target_ph);
        }
    } else {
        sim.runStatus = "idle";
        sim.runningRunId = null;
    }
}

async function ackQueuedCommands() {
    const { data: cmds, error } = await supabase
        .from("device_commands")
        .select("id, command, payload, status, run_id, created_at")
        .eq("device_id", sim.deviceId)
        .eq("status", "queued")
        .order("created_at", { ascending: true })
        .limit(20);

    if (error) throw error;
    if (!cmds || cmds.length === 0) return;

    for (const cmd of cmds) {
        console.log(`[cmd] picked #${cmd.id} ${cmd.command} run_id=${cmd.run_id || "-"} payload=${JSON.stringify(cmd.payload)}`);

        // mark sent
        await supabase.from("device_commands").update({ status: "sent" }).eq("id", cmd.id);
        await sleep(250);

        // apply side-effects in simulator (optional but useful for UI consistency)
        if (cmd.command === "DRAIN_OPEN") {
            sim.valveOpen = true;
            // keep your current meaning: write to device_settings.auto_drain_enabled
            await supabase.from("device_settings").update({ auto_drain_enabled: true }).eq("device_id", sim.deviceId);
        }
        if (cmd.command === "DRAIN_CLOSE") {
            sim.valveOpen = false;
            await supabase.from("device_settings").update({ auto_drain_enabled: false }).eq("device_id", sim.deviceId);
        }

        // acked
        await supabase.from("device_commands").update({ status: "acked" }).eq("id", cmd.id);
        console.log(`[cmd] acked #${cmd.id}`);
    }
}

async function insertTelemetry(ph, temp) {
    const row = {
        device_id: sim.deviceId,
        run_id: sim.runningRunId, // null if not running
        ph: ph,
        temp_c: temp,
        created_at: nowIso(),
    };

    const { error } = await supabase.from("telemetry").insert(row);
    if (error) throw error;
}

function effectiveIntervalSec(baseSec) {
    // SPEEDUP: bigger = faster -> interval shorter
    return Math.max(1, Math.floor(baseSec / Math.max(1, SPEEDUP)));
}

async function telemetryLoopTick() {
    const t = Date.now();

    // temp every 60 sec (speedup)
    const tempIntervalMs = effectiveIntervalSec(TEMP_INTERVAL_SEC) * 1000;
    if (t - sim.lastTempSentAt >= tempIntervalMs) {
        sim.temp = clamp(sim.temp + rand(-0.3, 0.3), 25, 45);
        await insertTelemetry(Number(sim.ph.toFixed(2)), Number(sim.temp.toFixed(2)));
        sim.lastTempSentAt = t;
        console.log(`[tele] temp tick -> ph=${sim.ph.toFixed(2)} temp=${sim.temp.toFixed(2)} run=${sim.runningRunId ? "running" : "idle"}`);
    }

    // pH only meaningful while running (optional: you can still send when idle)
    if (sim.runningRunId) {
        const nearTarget = sim.ph <= sim.targetPh + NEAR_TARGET_DELTA;
        const phIntervalMs = effectiveIntervalSec(nearTarget ? PH_NEAR_TARGET_SEC : PH_INTERVAL_SEC) * 1000;

        if (t - sim.lastPhSentAt >= phIntervalMs) {
            // decrease pH gradually
            const drop = nearTarget ? rand(0.01, 0.05) : rand(0.05, 0.15);
            sim.ph = clamp(sim.ph - drop, 3.5, 7.5);

            await insertTelemetry(Number(sim.ph.toFixed(2)), Number(sim.temp.toFixed(2)));
            sim.lastPhSentAt = t;
            console.log(`[tele] ph tick -> ph=${sim.ph.toFixed(2)} (target=${sim.targetPh}) interval=${nearTarget ? "near(5m)" : "normal(3h)"} speedup=${SPEEDUP}x`);

            // auto drain when target reached (optional)
            if (AUTO_DRAIN_ON_TARGET && sim.ph <= sim.targetPh) {
                console.log(`[auto] ph reached target. auto drain open.`);
                await supabase.from("device_commands").insert({
                    device_id: sim.deviceId,
                    run_id: sim.runningRunId,
                    command: "DRAIN_OPEN",
                    payload: { source: "auto", reason: "ph_reached_target" },
                    status: "queued",
                    created_at: nowIso(),
                });

                // Optionally auto stop run
                if (AUTO_STOP_ON_TARGET) {
                    console.log(`[auto] auto stop run.`);
                    await supabase
                        .from("fermentation_runs")
                        .update({ status: "done", ended_at: nowIso() })
                        .eq("id", sim.runningRunId);

                    sim.runningRunId = null;
                    sim.runStatus = "done";
                }
            }
        }
    }
}

async function main() {
    sim.deviceId = await pickDeviceId();
    await refreshDeviceContext();

    console.log(`[sim] started with deviceId=${sim.deviceId}`);
    console.log(`[sim] SPEEDUP=${SPEEDUP}x (temp every ~${effectiveIntervalSec(60)}s, ph every ~${effectiveIntervalSec(10800)}s normal)`);
    console.log(`[sim] AUTO_DRAIN_ON_TARGET=${AUTO_DRAIN_ON_TARGET} AUTO_STOP_ON_TARGET=${AUTO_STOP_ON_TARGET}`);

    // periodic refresh of settings/run context
    setInterval(() => {
        refreshDeviceContext().catch((e) => console.error("[refresh]", e.message || e));
    }, DEVICE_REFRESH_MS);

    // command ack loop
    setInterval(() => {
        ackQueuedCommands().catch((e) => console.error("[cmd]", e.message || e));
    }, COMMAND_POLL_MS);

    // telemetry tick loop (fast tick, internal rate control)
    setInterval(() => {
        telemetryLoopTick().catch((e) => console.error("[tele]", e.message || e));
    }, 1000);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
