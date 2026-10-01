import { prisma } from '../src/config/db';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Seed Departments
  const departments = [
    {
      name: 'Road Maintenance Dept',
      code: 'ROADS',
      description: 'Responsible for asphalt repair, potholes, sidewalks, and road infrastructure.',
    },
    {
      name: 'Water Supply & Sewage Board',
      code: 'WATER',
      description: 'Handles water line ruptures, sewage leaks, drain blockages, and supply issues.',
    },
    {
      name: 'Solid Waste Management',
      code: 'GARBAGE',
      description: 'Manages trash collection, public bin maintenance, and commercial dumping.',
    },
    {
      name: 'Electrical Operations Cell',
      code: 'ELECTRICITY',
      description: 'Maintains streetlights, power transformers, and municipal electrical grids.',
    },
    {
      name: 'Traffic Engineering Cell',
      code: 'TRAFFIC',
      description: 'Oversees traffic signals, road signs, pedestrian crossings, and safety barriers.',
    },
    {
      name: 'Public Health & Sanitation',
      code: 'SANIS',
      description: 'Pest control, public restroom maintenance, and community sanitation.',
    },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {
        name: dept.name,
        description: dept.description,
      },
      create: dept,
    });
  }
  console.log('✅ Departments seeded successfully');

  // 2. Seed Admin User
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@problempulse.gov';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
    },
    create: {
      name: 'Municipal Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Admin user seeded: ${admin.email} (Role: ${admin.role})`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
