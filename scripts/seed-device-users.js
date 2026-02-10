const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDeviceUsers() {
    console.log('--- Migrating existing userId to DeviceUser junction table ---');
    
    const devices = await prisma.device.findMany({
        where: { userId: { not: null } }
    });

    console.log(`Found ${devices.length} devices with existing userId`);

    for (const device of devices) {
        const existing = await prisma.deviceUser.findUnique({
            where: { deviceId_userId: { deviceId: device.id, userId: device.userId } }
        });

        if (!existing) {
            await prisma.deviceUser.create({
                data: {
                    deviceId: device.id,
                    userId: device.userId,
                    role: 'owner'
                }
            });
            console.log(`✅ ${device.name} (${device.deviceCode}) → owner: ${device.userId}`);
        } else {
            console.log(`⏭️ ${device.name} already has DeviceUser entry`);
        }
    }

    console.log('Done!');
    await prisma.$disconnect();
}

seedDeviceUsers().catch(console.error);
