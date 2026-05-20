import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.crewShiftStaff.deleteMany();
  await prisma.crewShift.deleteMany();
  await prisma.projectLine.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.staff.deleteMany();

  await prisma.companySettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      companyName: 'Radius AV Verhuur',
      address: 'Industrieweg 12\n6211 AA Maastricht',
      email: 'info@radiusav.nl',
      phone: '043-1234567',
      kvkNumber: '12345678',
      vatNumber: 'NL123456789B01',
      iban: 'NL00BANK0123456789',
      quoteValidityDays: 30,
      defaultVatRate: 21,
      paymentTerms: '14 dagen na factuurdatum',
    },
    update: {},
  });

  const client = await prisma.client.create({
    data: {
      name: 'Demo Events BV',
      email: 'info@demoevents.nl',
      phone: '06-12345678',
      address: 'Voorbeeldstraat 1, Maastricht',
      vatNumber: 'NL987654321B01',
    },
  });

  const tech1 = await prisma.staff.create({ data: { name: 'Jan Jansen', role: 'Technicus' } });
  const tech2 = await prisma.staff.create({ data: { name: 'Piet Pietersen', role: 'Technicus' } });
  const tech3 = await prisma.staff.create({ data: { name: 'Kees de Vries', role: 'Rigger' } });

  const pa = await prisma.equipment.create({
    data: { name: 'PA-systeem compact', category: 'Geluid', dailyRate: 150, stockQty: 3 },
  });
  const licht = await prisma.equipment.create({
    data: { name: 'LED PAR set (4x)', category: 'Licht', dailyRate: 80, stockQty: 5 },
  });
  const truss = await prisma.equipment.create({
    data: { name: 'Truss 3m', category: 'Rigging', dailyRate: 25, stockQty: 20 },
  });

  const loadIn = new Date('2026-06-10');
  const show = new Date('2026-06-12');
  const loadOut = new Date('2026-06-13');

  const project = await prisma.project.create({
    data: {
      title: 'Zomerfestival podium A',
      status: 'OFFERTE',
      quoteNumber: 'OFF-2026-001',
      clientId: client.id,
      location: 'Stadspark Maastricht',
      loadIn,
      showDate: show,
      loadOut,
      loadInTime: '08:00',
      showTime: '14:00',
      loadOutTime: '22:00',
      siteContact: 'Jan de Planner — 06-98765432',
      parkingNotes: 'Levering via backstage-ingang',
      notes: 'Stroom 32A beschikbaar bij podium',
      hourlyRate: 45,
      transportKm: 85,
      transportRatePerKm: 0.65,
    },
  });

  const setupShift = await prisma.crewShift.create({
    data: {
      projectId: project.id,
      phase: 'OPBOUW',
      role: 'Technici',
      headcount: 3,
      date: loadIn,
      startTime: '08:00',
      endTime: '14:00',
    },
  });
  const teardownShift = await prisma.crewShift.create({
    data: {
      projectId: project.id,
      phase: 'AFBOUW',
      role: 'Technici',
      headcount: 2,
      date: loadOut,
      startTime: '10:00',
      endTime: '16:00',
    },
  });

  await prisma.crewShiftStaff.createMany({
    data: [
      { shiftId: setupShift.id, staffId: tech1.id },
      { shiftId: setupShift.id, staffId: tech2.id },
      { shiftId: setupShift.id, staffId: tech3.id },
      { shiftId: teardownShift.id, staffId: tech1.id },
      { shiftId: teardownShift.id, staffId: tech2.id },
    ],
  });

  await prisma.projectLine.createMany({
    data: [
      {
        projectId: project.id,
        equipmentId: pa.id,
        quantity: 1,
        rentalStart: loadIn,
        rentalEnd: loadOut,
      },
      {
        projectId: project.id,
        equipmentId: licht.id,
        quantity: 2,
        rentalStart: show,
        rentalEnd: show,
      },
      {
        projectId: project.id,
        equipmentId: truss.id,
        quantity: 8,
        rentalStart: loadIn,
        rentalEnd: loadOut,
      },
    ],
  });

  console.log('Seed OK:', { client: client.name, project: project.title });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
