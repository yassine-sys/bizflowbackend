require('dotenv').config();
const { pool } = require('./src/config/db');
const { randomUUID } = require('crypto');

async function seed() {
  try {
    console.log('🌱 Start seeding database...');

    // --- Tenants ---
    const tenants = [
      { name: 'Clinique El Amen', sector: 'medical', email: 'contact@elamen.tn', phone: '+21699887766', address: 'Rue de la liberté, Tunis', subscription_plan: 'pro' },
      { name: 'Garage Auto Plus', sector: 'automotive', email: 'garage@auto.tn', phone: '+21699887777', address: 'Avenue Habib Bourguiba, Tunis', subscription_plan: 'pro' },
      { name: 'Service Express', sector: 'service', email: 'contact@serviceexpress.tn', phone: '+21697778899', address: 'Rue de la Paix, Tunis', subscription_plan: 'free' }
    ];

    const tenantIds = [];
    for (const t of tenants) {
      const res = await pool.query(
        `INSERT INTO tenants (id, name, sector, email, phone, address, subscription_plan, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,now()) RETURNING id`,
        [randomUUID(), t.name, t.sector, t.email, t.phone, t.address, t.subscription_plan]
      );
      tenantIds.push(res.rows[0].id);
    }
    console.log('✅ Tenants seeded');

    // --- Accounts (Clients) ---
    const accounts = [
      { name: 'Client 1', email: 'client1@example.com', phone: '+21690000001' },
      { name: 'Client 2', email: 'client2@example.com', phone: '+21690000002' },
      { name: 'Client 3', email: 'client3@example.com', phone: '+21690000003' }
    ];

    const accountIds = [];
    for (const a of accounts) {
      const res = await pool.query(
        `INSERT INTO accounts (id, name, email, phone, created_at)
         VALUES ($1,$2,$3,$4,now()) RETURNING id`,
        [randomUUID(), a.name, a.email, a.phone]
      );
      accountIds.push(res.rows[0].id);
    }
    console.log('✅ Accounts seeded');

    // --- Services (1 à 2 par tenant) ---
    const servicesTemplate = [
      { name: 'Consultation', description: 'Consultation générale', price: 50 },
      { name: 'Révision', description: 'Révision complète du véhicule', price: 80 },
      { name: 'Nettoyage', description: 'Service de nettoyage express', price: 20 }
    ];

    const serviceIds = [];
    for (let i = 0; i < tenantIds.length; i++) {
      const tenantId = tenantIds[i];
      const servicesToAdd = i === 0 ? [servicesTemplate[0]] : i === 1 ? [servicesTemplate[1]] : [servicesTemplate[2]];

      for (const s of servicesToAdd) {
        const res = await pool.query(
          `INSERT INTO services (id, tenant_id, name, description, price, created_at)
           VALUES ($1,$2,$3,$4,$5,now()) RETURNING id`,
          [randomUUID(), tenantId, s.name, s.description, s.price]
        );
        serviceIds.push(res.rows[0].id);
      }
    }
    console.log('✅ Services seeded');

    // --- Appointments (1 à 2 par tenant) ---
    const appointments = [
      { tenantIndex: 0, serviceIndex: 0, accountIndex: 0 },
      { tenantIndex: 1, serviceIndex: 1, accountIndex: 1 },
      { tenantIndex: 2, serviceIndex: 2, accountIndex: 2 }
    ];

    for (const appt of appointments) {
      await pool.query(
        `INSERT INTO appointments (id, tenant_id, service_id, client_id, date, created_at)
         VALUES ($1,$2,$3,$4,$5,now())`,
        [
          randomUUID(),
          tenantIds[appt.tenantIndex],
          serviceIds[appt.serviceIndex],
          accountIds[appt.accountIndex],
          new Date()
        ]
      );
    }
    console.log('✅ Appointments seeded');

    console.log('🎉 Database seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database', err);
    process.exit(1);
  }
}

seed();
