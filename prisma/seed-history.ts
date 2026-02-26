import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed dummy fermentation history data for all devices.
 * Run with: cmd /c "node --import tsx prisma/seed-history.ts"
 */
async function main() {
    // Find all devices
    const devices = await prisma.device.findMany({ select: { id: true, name: true } });
    
    if (devices.length === 0) {
        console.log('⚠️  No devices found. Create a device first, then run this script.');
        return;
    }

    // Delete existing dummy runs first
    console.log('🗑️  Clearing old fermentation runs...');
    for (const device of devices) {
        await prisma.telemetry.deleteMany({ where: { deviceId: device.id, runId: { not: null } } });
        await prisma.fermentationRun.deleteMany({ where: { deviceId: device.id } });
    }

    console.log(`🔧 Seeding fermentation history for ${devices.length} device(s)...\n`);

    for (const device of devices) {
        console.log(`📦 Device: ${device.name} (${device.id})`);
        
        const batches = [
            {
                name: 'Batch Mocaf Premium #1',
                // Feb 12, 2026 17:00 WIB → Feb 14, 2026 16:00 WIB (47 hours)
                startDate: new Date('2026-02-12T10:00:00.000Z'), // 17:00 WIB = 10:00 UTC
                endDate: new Date('2026-02-14T09:00:00.000Z'),   // 16:00 WIB = 09:00 UTC
                cassavaKg: 50,
                startPh: 6.80,
                endPh: 4.20,
            },
            {
                name: 'Batch Mocaf Organik #2',
                startDate: new Date('2026-02-08T07:00:00.000Z'), // Feb 8, 14:00 WIB
                endDate: new Date('2026-02-10T05:00:00.000Z'),   // Feb 10, 12:00 WIB
                cassavaKg: 75,
                startPh: 6.90,
                endPh: 4.10,
            },
            {
                name: 'Batch Mocaf Ekspor #3',
                startDate: new Date('2026-02-04T03:00:00.000Z'), // Feb 4, 10:00 WIB
                endDate: new Date('2026-02-06T08:00:00.000Z'),   // Feb 6, 15:00 WIB
                cassavaKg: 100,
                startPh: 7.00,
                endPh: 3.95,
            },
            {
                name: 'Batch Mocaf Lokal #4',
                startDate: new Date('2026-01-28T06:00:00.000Z'), // Jan 28, 13:00 WIB
                endDate: new Date('2026-01-30T10:00:00.000Z'),   // Jan 30, 17:00 WIB
                cassavaKg: 30,
                startPh: 6.60,
                endPh: 4.35,
            },
            {
                name: 'Batch Singkong Varietas A',
                startDate: new Date('2026-01-20T01:00:00.000Z'), // Jan 20, 08:00 WIB
                endDate: new Date('2026-01-22T07:00:00.000Z'),   // Jan 22, 14:00 WIB
                cassavaKg: 65,
                startPh: 6.75,
                endPh: 4.05,
            },
        ];

        for (const batch of batches) {
            const durationHours = Math.round((batch.endDate.getTime() - batch.startDate.getTime()) / (1000 * 60 * 60));

            const run = await prisma.fermentationRun.create({
                data: {
                    deviceId: device.id,
                    name: batch.name,
                    cassavaAmount: batch.cassavaKg,
                    status: 'done',
                    mode: 'auto',
                    startedAt: batch.startDate,
                    endedAt: batch.endDate,
                },
            });

            // Create telemetry data points every 2 hours
            const telemetryPoints: any[] = [];
            const totalPoints = Math.floor(durationHours / 2);
            const phDrop = (batch.startPh - batch.endPh) / totalPoints;

            for (let j = 0; j <= totalPoints; j++) {
                const pointTime = new Date(batch.startDate.getTime() + j * 2 * 60 * 60 * 1000);
                const ph = Math.max(batch.endPh, batch.startPh - phDrop * j + (Math.random() * 0.08 - 0.04));
                const temp = 27.5 + Math.random() * 3.5; // 27.5-31°C
                const waterLevel = Math.max(15, 90 - Math.floor(j * 2.5) + Math.floor(Math.random() * 3));

                telemetryPoints.push({
                    deviceId: device.id,
                    runId: run.id,
                    ph: parseFloat(ph.toFixed(2)),
                    tempC: parseFloat(temp.toFixed(1)),
                    waterLevel: Math.min(100, waterLevel),
                    createdAt: pointTime,
                });
            }

            await prisma.telemetry.createMany({ data: telemetryPoints });

            console.log(`   ✅ ${batch.name} — ${batch.cassavaKg}kg, ${durationHours}h, ${telemetryPoints.length} data points`);
        }
    }

    console.log('\n🎉 Dummy fermentation history seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
