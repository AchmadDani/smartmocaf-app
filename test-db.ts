import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing database connection...');
  try {
    const userCount = await prisma.user.count();
    console.log('✅ Connection successful!');
    console.log(`Total users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('⚠️ Database is empty. You might need to run: npx prisma db seed');
    } else {
      const users = await prisma.user.findMany({
        select: { username: true, email: true, role: true }
      });
      console.log('User list:');
      console.table(users);
    }
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
