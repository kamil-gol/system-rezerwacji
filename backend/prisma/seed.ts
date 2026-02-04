import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, subDays, addMonths } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Clean existing data
  await prisma.emailLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.reservationHistory.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✅ Cleaned existing data');
  
  // Create Users
  const hashedPassword1 = await bcrypt.hash('Admin123!@#$', 10);
  const hashedPassword2 = await bcrypt.hash('Manager123!@#', 10);
  const hashedPassword3 = await bcrypt.hash('Employee123!@', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@goscinecrodzinny.pl',
      password: hashedPassword1,
      firstName: 'Jan',
      lastName: 'Kowalski',
      role: 'ADMIN',
      isActive: true
    }
  });
  
  const manager = await prisma.user.create({
    data: {
      email: 'manager@goscinecrodzinny.pl',
      password: hashedPassword2,
      firstName: 'Anna',
      lastName: 'Nowak',
      role: 'MANAGER',
      isActive: true
    }
  });
  
  const employee = await prisma.user.create({
    data: {
      email: 'pracownik@goscinecrodzinny.pl',
      password: hashedPassword3,
      firstName: 'Piotr',
      lastName: 'Wiśniewski',
      role: 'EMPLOYEE',
      isActive: true
    }
  });
  
  console.log('✅ Created users (admin, manager, employee)');
  
  // Create Rooms
  const salaBankietowa = await prisma.room.create({
    data: {
      name: 'Sala Bankietowa',
      description: 'Przestronna sala idealna na duże wydarzeniaNajnowocześniejszy sprzęt audio-video, klimatyzacja.',
      maxCapacity: 80,
      pricePerPerson: 120.00,
      totalPrice: 8000.00,
      isActive: true
    }
  });
  
  const salaKrysztalowa = await prisma.room.create({
    data: {
      name: 'Sala Kryształowa',
      description: 'Elegancka sala z krystałowymi żyrandolami. Klimat luksusowego przyjęcia.',
      maxCapacity: 40,
      pricePerPerson: 150.00,
      totalPrice: 5000.00,
      isActive: true
    }
  });
  
  const salaRodzinna = await prisma.room.create({
    data: {
      name: 'Sala Rodzinna',
      description: 'Kameralna sala na mniejsze, rodzinne święta. Przytulna atmosfera.',
      maxCapacity: 25,
      pricePerPerson: 100.00,
      totalPrice: 2000.00,
      isActive: true
    }
  });
  
  const salaVIP = await prisma.room.create({
    data: {
      name: 'Sala VIP',
      description: 'Ekskluzywna sala dla wymagających klientów. Najwyższy standard obsługi.',
      maxCapacity: 15,
      pricePerPerson: 200.00,
      totalPrice: 2500.00,
      isActive: true
    }
  });
  
  console.log('✅ Created 4 rooms');
  
  // Create Customers
  const customers = [];
  const customerData = [
    { firstName: 'Maria', lastName: 'Zielińska', phone: '+48501234567', email: 'maria.zielinska@example.com', city: 'Świętochłowice' },
    { firstName: 'Tomasz', lastName: 'Lewandowski', phone: '+48502345678', email: 'tomasz.lewandowski@example.com', city: 'Chorzów' },
    { firstName: 'Katarzyna', lastName: 'Wójcik', phone: '+48503456789', email: 'katarzyna.wojcik@example.com', city: 'Katowice' },
    { firstName: 'Marek', lastName: 'Kamiński', phone: '+48504567890', email: 'marek.kaminski@example.com', city: 'Bytom' },
    { firstName: 'Agnieszka', lastName: 'Kozłowska', phone: '+48505678901', email: 'agnieszka.kozlowska@example.com', city: 'Gliwice' },
    { firstName: 'Paweł', lastName: 'Jankowski', phone: '+48506789012', email: 'pawel.jankowski@example.com', city: 'Zabrze', company: 'Jankowski Sp. z o.o.', nip: '1234567890' },
    { firstName: 'Magdalena', lastName: 'Mazur', phone: '+48507890123', email: 'magdalena.mazur@example.com', city: 'Ruda Śląska' },
    { firstName: 'Krzysztof', lastName: 'Krawczyk', phone: '+48508901234', email: 'krzysztof.krawczyk@example.com', city: 'Świętochłowice' },
    { firstName: 'Joanna', lastName: 'Piotrowska', phone: '+48509012345', email: 'joanna.piotrowska@example.com', city: 'Sosnowiec' },
    { firstName: 'Andrzej', lastName: 'Grabowski', phone: '+48510123456', email: 'andrzej.grabowski@example.com', city: 'Częstochowa', company: 'Grabowski Events', nip: '9876543210' },
    { firstName: 'Ewa', lastName: 'Nowicka', phone: '+48511234567', email: null, city: 'Dąbrowa Górnicza' },
    { firstName: 'Rafał', lastName: 'Wróblewski', phone: '+48512345678', email: 'rafal.wroblewski@example.com', city: 'Tychy' },
    { firstName: 'Beata', lastName: 'Kucharska', phone: '+48513456789', email: 'beata.kucharska@example.com', city: 'Mysl owice' },
    { firstName: 'Dariusz', lastName: 'Walczak', phone: '+48514567890', email: null, city: 'Jaworzno' },
    { firstName: 'Monika', lastName: 'Sokołowska', phone: '+48515678901', email: 'monika.sokolowska@example.com', city: 'Świętochłowice' }
  ];
  
  for (const data of customerData) {
    const customer = await prisma.customer.create({
      data: {
        ...data,
        postalCode: '41-600',
        createdBy: admin.id
      }
    });
    customers.push(customer);
  }
  
  console.log('✅ Created 15 customers');
  
  // Create Reservations
  const now = new Date();
  const reservationData = [
    // Przyszłe rezerwacje
    {
      customer: customers[0],
      room: salaBankietowa,
      eventType: 'WEDDING',
      eventDate: addDays(now, 30),
      startTime: '16:00',
      durationHours: 10,
      numberOfGuests: 75,
      pricingType: 'PER_PERSON',
      pricePerPerson: 120.00,
      status: 'CONFIRMED',
      depositRequired: true,
      depositAmount: 2000.00,
      depositDueDate: addDays(now, 29)
    },
    {
      customer: customers[1],
      room: salaKrysztalowa,
      eventType: 'BIRTHDAY',
      eventDate: addDays(now, 15),
      startTime: '18:00',
      durationHours: 6,
      numberOfGuests: 35,
      pricingType: 'TOTAL',
      totalPrice: 5000.00,
      status: 'CONFIRMED',
      depositRequired: true,
      depositAmount: 1000.00,
      depositDueDate: addDays(now, 14)
    },
    {
      customer: customers[2],
      room: salaRodzinna,
      eventType: 'COMMUNION',
      eventDate: addDays(now, 7),
      startTime: '14:00',
      durationHours: 5,
      numberOfGuests: 20,
      pricingType: 'PER_PERSON',
      pricePerPerson: 100.00,
      status: 'PENDING',
      depositRequired: false
    },
    {
      customer: customers[5],
      room: salaBankietowa,
      eventType: 'BUSINESS_MEETING',
      eventDate: addDays(now, 3),
      startTime: '10:00',
      durationHours: 8,
      numberOfGuests: 50,
      pricingType: 'TOTAL',
      totalPrice: 6000.00,
      status: 'CONFIRMED',
      depositRequired: true,
      depositAmount: 1500.00,
      depositDueDate: addDays(now, 2)
    },
    {
      customer: customers[3],
      room: salaVIP,
      eventType: 'ANNIVERSARY',
      eventDate: addDays(now, 45),
      startTime: '19:00',
      durationHours: 6,
      numberOfGuests: 12,
      pricingType: 'TOTAL',
      totalPrice: 2500.00,
      status: 'PENDING',
      depositRequired: false
    },
    // Przeszłe rezerwacje (zakończone)
    {
      customer: customers[4],
      room: salaKrysztalowa,
      eventType: 'WEDDING',
      eventDate: subDays(now, 10),
      startTime: '17:00',
      durationHours: 9,
      numberOfGuests: 38,
      pricingType: 'PER_PERSON',
      pricePerPerson: 150.00,
      status: 'COMPLETED',
      depositRequired: true,
      depositAmount: 1500.00,
      depositDueDate: subDays(now, 11)
    },
    {
      customer: customers[6],
      room: salaRodzinna,
      eventType: 'BAPTISM',
      eventDate: subDays(now, 25),
      startTime: '13:00',
      durationHours: 6,
      numberOfGuests: 22,
      pricingType: 'TOTAL',
      totalPrice: 2000.00,
      status: 'COMPLETED',
      depositRequired: false
    },
    {
      customer: customers[7],
      room: salaBankietowa,
      eventType: 'PARTY',
      eventDate: subDays(now, 5),
      startTime: '20:00',
      durationHours: 7,
      numberOfGuests: 60,
      pricingType: 'PER_PERSON',
      pricePerPerson: 120.00,
      status: 'COMPLETED',
      depositRequired: true,
      depositAmount: 2000.00,
      depositDueDate: subDays(now, 6)
    },
    // Anulowana rezerwacja
    {
      customer: customers[8],
      room: salaVIP,
      eventType: 'BUSINESS_MEETING',
      eventDate: addDays(now, 20),
      startTime: '09:00',
      durationHours: 4,
      numberOfGuests: 10,
      pricingType: 'TOTAL',
      totalPrice: 1500.00,
      status: 'CANCELLED',
      depositRequired: false,
      cancellationReason: 'Zmiana terminów przez klienta'
    }
  ];
  
  for (let i = 0; i < reservationData.length; i++) {
    const data = reservationData[i];
    const reservationNumber = `RES-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(1000 + i).padStart(4, '0')}`;
    
    const finalAmount = data.pricingType === 'PER_PERSON'
      ? data.numberOfGuests * (data.pricePerPerson || 0)
      : data.totalPrice || 0;
    
    const autoGeneratedNotes = data.durationHours > 6
      ? `Dodatkowo płatnych godzin: ${data.durationHours - 6} (powyżej standardowych 6h)`
      : null;
    
    const reservation = await prisma.reservation.create({
      data: {
        reservationNumber,
        customerId: data.customer.id,
        roomId: data.room.id,
        eventType: data.eventType as any,
        eventDate: data.eventDate,
        startTime: data.startTime,
        durationHours: data.durationHours,
        numberOfGuests: data.numberOfGuests,
        pricingType: data.pricingType as any,
        pricePerPerson: data.pricePerPerson || null,
        totalPrice: data.totalPrice || null,
        finalAmount,
        depositRequired: data.depositRequired,
        depositAmount: data.depositAmount || null,
        depositDueDate: data.depositDueDate || null,
        depositStatus: data.depositRequired ? 'PAID' : 'NOT_REQUIRED',
        status: data.status as any,
        autoGeneratedNotes,
        cancellationReason: data.cancellationReason || null,
        createdBy: employee.id,
        notes: 'Rezerwacja utworzona automatycznie podczas seedowania bazy danych.'
      }
    });
    
    // Create history entry
    await prisma.reservationHistory.create({
      data: {
        reservationId: reservation.id,
        changeType: 'CREATED',
        changedBy: employee.id,
        newValue: reservation as any
      }
    });
  }
  
  console.log('✅ Created 9 reservations (3 pending, 3 confirmed, 2 completed, 1 cancelled)');
  
  // Create some system logs
  await prisma.systemLog.createMany({
    data: [
      { level: 'info', message: 'System uruchomiony', context: { timestamp: new Date() } },
      { level: 'info', message: 'Baza danych zainicjalizowana', context: {} },
      { level: 'info', message: 'Seed data wygenerowane', context: { users: 3, rooms: 4, customers: 15, reservations: 9 } }
    ]
  });
  
  console.log('✅ Created system logs');
  
  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n👥 Test Users:');
  console.log('   Admin: admin@goscinecrodzinny.pl / Admin123!@#$');
  console.log('   Manager: manager@goscniecrodzinny.pl / Manager123!@#');
  console.log('   Employee: pracownik@goscniecrodzinny.pl / Employee123!@');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
