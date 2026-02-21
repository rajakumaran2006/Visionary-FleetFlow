import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Usually need service_role key to bypass RLS for seeding, but we will try with anon first or handle RLS.

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding databases...");

  // 1. Vehicles
  const vehicles = [
    { plate_number: 'VAN-05', type: 'Van', status: 'Ready', model: '2022 Ford Transit', capacity: '500 kg', odometer: 12500 },
    { plate_number: 'TRK-01', type: 'Truck', status: 'On Trip', model: '2023 Volvo FH', capacity: '20000 kg', odometer: 85000 },
    { plate_number: 'TRK-02', type: 'Truck', status: 'In Shop', model: '2021 Scania R500', capacity: '18000 kg', odometer: 150000 },
    { plate_number: 'MIN-01', type: 'Mini', status: 'Ready', model: '2023 Suzuki Carry', capacity: '800 kg', odometer: 5000 },
    { plate_number: 'BIK-01', type: 'Bike', status: 'Ready', model: '2024 Honda Cargo', capacity: '50 kg', odometer: 1200 }
  ];

  for (const v of vehicles) {
    const { error } = await supabase.from('vehicles').insert([v]);
    if (error && error.code !== '23505') { // Ignore unique violation
      console.error('Error inserting vehicle:', error.message);
    }
  }

  // 2. Drivers
  const today = new Date();
  const nextYear = new Date(); nextYear.setFullYear(today.getFullYear() + 1);
  const nextMonth = new Date(); nextMonth.setMonth(today.getMonth() + 1);
  const lastMonth = new Date(); lastMonth.setMonth(today.getMonth() - 1);
  const nextTwoYears = new Date(); nextTwoYears.setFullYear(today.getFullYear() + 2);

  const drivers = [
    { name: 'Alex', license_number: 'DL-ALEX-001', license_expiry: nextYear.toISOString().split('T')[0], duty_status: 'On Duty', safety_score: 98, completion_rate: 100, complaints: 0 },
    { name: 'Sarah Connor', license_number: 'DL-SARAH-002', license_expiry: nextMonth.toISOString().split('T')[0], duty_status: 'On Duty', safety_score: 100, completion_rate: 100, complaints: 0 },
    { name: 'John Doe', license_number: 'DL-JOHN-003', license_expiry: lastMonth.toISOString().split('T')[0], duty_status: 'Off Duty', safety_score: 85, completion_rate: 90, complaints: 2 },
    { name: 'Mike Ross', license_number: 'DL-MIKE-004', license_expiry: nextTwoYears.toISOString().split('T')[0], duty_status: 'Suspended', safety_score: 60, completion_rate: 80, complaints: 5 },
  ];

  let driverIds = [];
  let vehicleIds = [];

  for (const d of drivers) {
    const { error } = await supabase.from('drivers').insert([d]);
    if (error && error.code !== '23505') {
      console.error('Error inserting driver:', error.message);
    }
  }

  // Fetch inserted IDs to create relational data
  const { data: vData } = await supabase.from('vehicles').select('id, plate_number');
  const { data: dData } = await supabase.from('drivers').select('id, name');

  if (vData && dData) {
    const van = vData.find(v => v.plate_number === 'VAN-05');
    const trk1 = vData.find(v => v.plate_number === 'TRK-01');
    const trk2 = vData.find(v => v.plate_number === 'TRK-02');
    
    const alex = dData.find(d => d.name === 'Alex');
    const sarah = dData.find(d => d.name === 'Sarah Connor');

    // 3. Trips
    if (van && trk1 && alex && sarah) {
      const trips = [
        { driver_name: alex.name, driver_id: alex.id, vehicle_id: van.id, status: 'Pending', origin: 'Warehouse A', destination: 'Store 1', cargo_weight: 450, estimated_fuel_cost: 50 },
        { driver_name: sarah.name, driver_id: sarah.id, vehicle_id: trk1.id, status: 'On Trip', origin: 'Port City', destination: 'Distribution Center', cargo_weight: 15000, estimated_fuel_cost: 1500 },
        { driver_name: alex.name, driver_id: alex.id, vehicle_id: van.id, status: 'Completed', origin: 'Warehouse A', destination: 'Store 2', cargo_weight: 400, estimated_fuel_cost: 45 }
      ];

      for (const t of trips) {
        const { error } = await supabase.from('trips').insert([t]);
        if (error) console.error('Error inserting trip:', error.message);
      }

      // 4. Maintenance Logs
      if (trk2) {
         const logs = [
           { vehicle_id: trk2.id, description: 'Engine Overhaul required after 150k km', service_type: 'Major Repair', status: 'Scheduled', cost: 5000, scheduled_date: nextMonth.toISOString().split('T')[0] },
           { vehicle_id: van.id, description: 'Routine Oil Change', service_type: 'Preventative Maintenance', status: 'Completed', cost: 150, scheduled_date: lastMonth.toISOString().split('T')[0], completed_date: lastMonth.toISOString().split('T')[0] }
         ];
         for (const l of logs) {
            await supabase.from('maintenance_logs').insert([l]);
         }
      }

      // Fetch completed trips for expenses
      const { data: tData } = await supabase.from('trips').select('id, status').eq('status', 'Completed');
      if (tData && tData.length > 0) {
        // 5. Expenses
        const expenses = [
          { trip_id: tData[0].id, vehicle_id: van.id, driver_name: alex.name, fuel_liters: 30, fuel_cost: 45, misc_expense: 10, date: today.toISOString().split('T')[0] }
        ];
        for (const e of expenses) {
          await supabase.from('expenses').insert([e]);
        }
      }
    }
  }

  console.log("Seeding complete!");
}

seed();
