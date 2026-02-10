const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDevice() {
    console.log('--- DEVICE CHECK: 0001 ---');
    try {
        const device = await prisma.device.findUnique({
            where: { deviceCode: '0001' },
            include: {
                telemetry: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                user: true
            }
        });

        if (!device) {
            console.log('Device 0001 NOT FOUND in database.');
            const allDevices = await prisma.device.findMany({ select: { deviceCode: true, name: true } });
            console.log('All registered devices:', allDevices);
            return;
        }

        console.log('Device found:', {
            id: device.id,
            name: device.name,
            deviceCode: device.deviceCode,
            userId: device.userId,
            owner: device.user?.fullName || 'UNASSIGNED',
            isOnline: device.isOnline,
            lastSeen: device.lastSeen
        });

        console.log('Recent Telemetry (last 5):');
        device.telemetry.forEach((t, i) => {
            console.log(`[${i+1}] ${t.createdAt.toISOString()} - pH: ${t.ph}, Temp: ${t.tempC}, Level: ${t.waterLevel}`);
        });

        const mqttStatus = await prisma.mqttStatus.findFirst({
            orderBy: { lastUpdated: 'desc' }
        });
        console.log('Last MQTT Status:', mqttStatus);

    } catch (err) {
        console.error('Error checking database:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkDevice();
