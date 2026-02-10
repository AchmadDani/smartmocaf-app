import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('password', 10);

    // Create admin user
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            fullName: 'Administrator',
            username: 'admin',
            email: 'admin@smartmocaf.local',
            passwordHash,
            role: 'admin',
        },
    });

    // Create farmer user
    await prisma.user.upsert({
        where: { username: 'farmer' },
        update: {},
        create: {
            fullName: 'Farmer Default',
            username: 'farmer',
            email: 'farmer@smartmocaf.local',
            passwordHash,
            role: 'farmer',
        },
    });

    console.log('✅ Seed complete: admin/password & farmer/password');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
