const fs = require('fs');
const path = require('path');

const runName = 'Singkong Racun';

// Offset +7: simpan WIB - 7 biar app tampilin +7 jadi bener
// Start: 14 Feb 17:13 WIB → stored 10:13
// End:   17 Feb 12:13 WIB → stored 05:13
// Durasi: 67 jam (3x24 - 5)

let utcOffset = 7;
let year = 2026;
let month = 2;
let day = 14;
let hour = 17 - utcOffset; // 10:13 stored
let minute = 13;

let phStart = 6.20;
let phEnd = 4.38;

function pad(n) {
    return n < 10 ? '0' + n : n;
}

function getFormattedDate(y, m, d, h, min) {
    return `${y}-${pad(m)}-${pad(d)} ${pad(h)}:${pad(min)}:00.000`;
}

let startStored = getFormattedDate(year, month, day, hour, minute);
// End: 17 Feb 12:13 WIB - 7 = 17 Feb 05:13 stored
let endStored = '2026-02-17 05:13:00.000';

let totalSteps = 134; // 67 jam = 134 steps @ 30 min

let sql = `-- UPDATE Query untuk Fermentasi "${runName}"
-- Offset: +7 (stored = WIB - 7)
-- Tampil: 14 Feb 17:13 WIB → 17 Feb 12:13 WIB (67 jam)
SET @run_id = (SELECT id FROM fermentation_runs WHERE name = '${runName}' ORDER BY created_at DESC LIMIT 1);

-- 1. Update fermentation_runs
UPDATE fermentation_runs
SET 
  started_at = '${startStored}',
  ended_at = '${endStored}',
  created_at = '${startStored}'
WHERE id = @run_id;

-- 2. Hapus telemetry lama
DELETE FROM telemetry WHERE run_id = @run_id;

-- 3. Insert telemetry baru (tiap 30 menit, stored = WIB - 7)
INSERT INTO telemetry (device_id, run_id, ph, temp_c, water_level, created_at) VALUES
`;

let telemetryValues = [];
let step = 0;

while (step <= totalSteps) {
    let progress = step / totalSteps;
    let ph = phStart - ((phStart - phEnd) * progress);
    let temp = 28 + (4 * Math.sin(step / 10)) + (2 * progress);
    let waterLevel = Math.round(50 - (5 * progress));

    telemetryValues.push(`  ((SELECT device_id FROM fermentation_runs WHERE id = @run_id), @run_id, ${ph.toFixed(2)}, ${temp.toFixed(1)}, ${waterLevel}, '${getFormattedDate(year, month, day, hour, minute)}')`);

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

const outputPath = path.join(__dirname, 'update_fermentation.sql');
fs.writeFileSync(outputPath, sql);
console.log('Done! Start stored: ' + startStored + ' → WIB 17:13');
console.log('End stored: ' + endStored + ' → WIB 12:13');
console.log('Records: ' + telemetryValues.length);
