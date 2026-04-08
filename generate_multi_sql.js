const fs = require('fs');
const path = require('path');

/**
 * CONFIGURATION: List fermenters here
 * WIB Time (UTC+7 handled automatically)
 */
const fermenters = [
    {
        runName: 'Singkong Racun A',
        amount: 25.0,
        startWIB: '2026-02-15 17:15',
        endWIB: '2026-02-18 08:45',
        phStart: 6.20,
        phEnd: 4.38
    },
    {
        runName: 'Singkong Garuda Merah',
        amount: 20.0,
        startWIB: '2026-02-12 17:14',
        endWIB: '2026-02-14 18:15',
        phStart: 6.30,
        phEnd: 4.45
    },
    {
        runName: 'Singkong Putih X',
        amount: 30.0,
        startWIB: '2026-02-16 10:00',
        endWIB: '2026-02-19 14:00',
        phStart: 6.50,
        phEnd: 4.20
    },
    {
        runName: 'Singkong Mentega B',
        amount: 22.5,
        startWIB: '2026-02-14 09:30',
        endWIB: '2026-02-16 20:30',
        phStart: 6.10,
        phEnd: 4.50
    }
];

const UTC_OFFSET = 7;

function pad(n) { return n < 10 ? '0' + n : n; }

function getUTCStr(wibStr) {
    const d = new Date(wibStr.replace(' ', 'T') + ':00+07:00');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00.000`;
}

let fullSql = `-- SQL Script Multi-Fermenter Generation
-- Digenerate otomatis untuk 4 Fermenter sekaligus

`;

fermenters.forEach((f, index) => {
    const i = index + 1;
    const startUTC = getUTCStr(f.startWIB);
    const endUTC = getUTCStr(f.endWIB);
    
    fullSql += `-- ==========================================
-- FERMENTER #${i}: ${f.runName}
-- ==========================================
-- Ganti 'DEVICE_ID_${i}' dengan ID Device lo yang sebenarnya
SET @device_id_${i} = 'MASUKKAN_ID_DEVICE_${i}_DISINI';
SET @run_id_${i} = UUID();

INSERT INTO fermentation_runs (id, device_id, name, cassava_amount, status, mode, started_at, ended_at, created_at)
VALUES (
  @run_id_${i}, 
  @device_id_${i}, 
  '${f.runName}', 
  ${f.amount}, 
  'done', 
  'auto', 
  '${startUTC}', 
  '${endUTC}', 
  '${startUTC}'
);

INSERT INTO telemetry (device_id, run_id, ph, temp_c, water_level, created_at) VALUES
`;

    const startDate = new Date(f.startWIB.replace(' ', 'T') + ':00+07:00');
    const endDate = new Date(f.endWIB.replace(' ', 'T') + ':00+07:00');
    const intervalMs = 30 * 60 * 1000;
    
    let current = new Date(startDate);
    let telemetryValues = [];
    let totalSteps = Math.floor((endDate - startDate) / intervalMs);
    let step = 0;

    while (current <= endDate) {
        const progress = totalSteps > 0 ? step / totalSteps : 1;
        const ph = f.phStart - ((f.phStart - f.phEnd) * progress);
        const temp = 28 + (4 * Math.sin(step / 10)) + (2 * progress);
        const waterLevel = Math.round(50 - (5 * progress));
        const currentUTC = getUTCStr(current.toISOString().slice(0, 16).replace('T', ' '));

        telemetryValues.push(`  (@device_id_${i}, @run_id_${i}, ${ph.toFixed(2)}, ${temp.toFixed(1)}, ${waterLevel}, '${currentUTC}')`);

        current = new Date(current.getTime() + intervalMs);
        step++;
    }

    fullSql += telemetryValues.join(',\n') + ';\n\n';
});

const outputPath = path.join(__dirname, 'insert_multi_fermentation.sql');
fs.writeFileSync(outputPath, fullSql);
console.log('SUCCESS! SQL generated at: ' + outputPath);
console.log('Generated data for ' + fermenters.length + ' fermenters.');
