const fs = require('fs');
const path = require('path');

const runName = 'Singkong Garuda Merah';
const amount = 20.0;

// Start: 12 Feb 2026, 17:14 WIB
// End:   14 Feb 2026, 18:15 WIB
// WIB = UTC+7, jadi kita simpan waktu as UTC (WIB - 7)

let utcOffset = 7;
let year = 2026;
let month = 2;
let day = 12;
let hour = 17 - utcOffset; // 10
let minute = 14;

let phStart = 6.20;
let phEnd = 4.38;

function pad(n) {
    return n < 10 ? '0' + n : n;
}

function getFormattedDate(y, m, d, h, min) {
    return `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(min)}:00.000`;
}

// 14 Feb 18:15 WIB -> 11:15 UTC
let endStored = '2026-02-14 11:15:00.000';
let startStored = getFormattedDate(year, month, day, hour, minute);

// Hitung durasi
// Start: 12 Feb 10:14 UTC
// End:   14 Feb 11:15 UTC
// Beda hari = 2 hari = 48 jam
// Beda jam = 11 - 10 = 1 jam
// Beda menit = 15 - 14 = 1 menit
// Total = 49 jam 1 menit = ~98 steps (tiap 30 menit)
let totalSteps = 98;

let sql = `-- SQL Script untuk menambahkan data riwayat Fermentasi "${runName}"
-- UPDATE '@device_id' dengan ID Device yang benar (bisa dilihat di tabel devices)
SET @device_id = 'MASUKKAN_ID_DEVICE_DISINI';
SET @run_id = UUID();

-- 1. Insert ke tabel fermentation_runs
-- Waktu disimpan dalam UTC (WIB - 7 jam)
-- started_at: 12 Feb 17:14 WIB = 12 Feb 10:14 UTC
-- ended_at:   14 Feb 18:15 WIB = 14 Feb 11:15 UTC
INSERT INTO fermentation_runs (id, device_id, name, cassava_amount, status, mode, started_at, ended_at, created_at)
VALUES (
  @run_id, 
  @device_id, 
  '${runName}', 
  ${amount}, 
  'done', 
  'auto', 
  '${startStored}', 
  '${endStored}', 
  '${startStored}'
);

-- 2. Insert ke tabel telemetry (tiap 30 menit, waktu UTC)
INSERT INTO telemetry (device_id, run_id, ph, temp_c, water_level, created_at) VALUES
`;

let telemetryValues = [];
let step = 0;

while (step <= totalSteps) {
    let progress = step / totalSteps;
    
    // pH turun dari phStart ke phEnd
    let ph = phStart - ((phStart - phEnd) * progress);
    
    // Suhu naik turun di kisaran 28 - 32
    let temp = 28 + (4 * Math.sin(step / 10)) + (2 * progress);
    
    // Water level turun sedikit dari 50 ke 45
    let waterLevel = Math.round(50 - (5 * progress));

    telemetryValues.push(`  (@device_id, @run_id, ${ph.toFixed(2)}, ${temp.toFixed(1)}, ${waterLevel}, '${getFormattedDate(year, month, day, hour, minute)}')`);

    // Add 30 minutes
    minute += 30;
    if (minute >= 60) {
        minute -= 60;
        hour += 1;
        if (hour >= 24) {
            hour -= 24;
            day += 1;
        }
    }
    step++;
}

sql += telemetryValues.join(',\n') + ';\n';

const outputPath = path.join(__dirname, 'insert_garuda_merah.sql');
fs.writeFileSync(outputPath, sql);
console.log('INSERT SQL generated at: ' + outputPath);
console.log('Total telemetry records: ' + telemetryValues.length);
console.log('Start (stored UTC): ' + startStored + ' -> tampil WIB: 12 Feb 17:14');
console.log('End (stored UTC): ' + endStored + ' -> tampil WIB: 14 Feb 18:14/15');
