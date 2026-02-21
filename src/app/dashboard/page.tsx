import { createClient } from "@/utils/supabase/server";
import styles from "./dashboard.module.css";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: activeFleetCount },
    { count: maintenanceAlertCount },
    { count: pendingCargoCount },
    { count: totalVehicleCount },
    { count: busyVehicleCount },
    { count: idleVehicleCount },
    { data: activeTrips },
    { data: availableVehicles },
    { data: allVehicles },
    { data: drivers }
  ] = await Promise.all([
    // Active Fleet: vehicles currently "On Trip" (via trips with status "On Trip")
    supabase
      .from("trips")
      .select("*", { count: "exact", head: true })
      .eq("status", "On Trip"),

    // Maintenance Alerts: vehicles "In Shop"
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("status", "In Shop"),

    // Pending Cargo: trips waiting for assignment
    supabase
      .from("trips")
      .select("*", { count: "exact", head: true })
      .eq("status", "Pending"),

    // Total vehicles (for utilization)
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true }),

    // Busy/assigned vehicles
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .in("status", ["Busy", "On Trip"]),

    // Idle vehicles
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("status", "Ready"),

    // Recent trips with vehicle info
    supabase
      .from("trips")
      .select(`
        id,
        driver_name,
        status,
        created_at,
        vehicles (
          plate_number,
          type
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20),

    // Available vehicles for trip assignment
    supabase
      .from("vehicles")
      .select("id, plate_number, type, status, model, capacity, odometer")
      .eq("status", "Ready"),

    // All vehicles for fleet overview table
    supabase
      .from("vehicles")
      .select("id, plate_number, type, status, model, capacity, odometer")
      .order("created_at", { ascending: false }),

    // Available drivers
    supabase
      .from("drivers")
      .select("id, name, license_expiry, duty_status")
      .order("name", { ascending: true })
  ]);

  const active = activeFleetCount || 0;
  const total = totalVehicleCount || 0;
  const busy = busyVehicleCount || 0;
  const idle = idleVehicleCount || 0;

  // Utilization Rate: % of fleet assigned (Busy) vs idle (Ready)
  const utilizationRate = total > 0
    ? Math.round(((busy + active) / total) * 100)
    : 0;

  return (
    <div>
      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Active Fleet</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{active}</span>
            <span className={styles.kpiSubtext}>On Trip</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Maintenance Alerts</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{maintenanceAlertCount || 0}</span>
            <span className={styles.kpiSubtext}>In Shop</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Utilization Rate</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{utilizationRate}%</span>
            <span className={styles.kpiSubtext}>{busy + active} of {total} Assigned</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Pending Cargo</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{pendingCargoCount || 0}</span>
            <span className={styles.kpiSubtext}>Waiting</span>
          </div>
        </div>
      </div>

      <DashboardClient
        // @ts-expect-error Supabase FK join returns object at runtime but types as array
        activeTrips={activeTrips || []}
        availableVehicles={availableVehicles || []}
        allVehicles={allVehicles || []}
        drivers={drivers || []}
      />
    </div>
  );
}
