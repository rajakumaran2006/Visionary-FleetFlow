import { createClient } from "@/utils/supabase/server";
import styles from "../dashboard.module.css";
import MaintenanceClient from "./MaintenanceClient";

export default async function MaintenancePage() {
  const supabase = await createClient();

  const [
    { count: totalLogs },
    { count: scheduledCount },
    { count: inProgressCount },
    { count: completedCount },
    { data: logs },
    { data: vehicles }
  ] = await Promise.all([
    supabase
      .from("maintenance_logs")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("maintenance_logs")
      .select("*", { count: "exact", head: true })
      .eq("status", "Scheduled"),

    supabase
      .from("maintenance_logs")
      .select("*", { count: "exact", head: true })
      .eq("status", "In Progress"),

    supabase
      .from("maintenance_logs")
      .select("*", { count: "exact", head: true })
      .eq("status", "Completed"),

    supabase
      .from("maintenance_logs")
      .select(`
        id,
        description,
        service_type,
        status,
        cost,
        scheduled_date,
        completed_date,
        vehicles (
          plate_number
        )
      `)
      .order("created_at", { ascending: false }),

    supabase
      .from("vehicles")
      .select("id, plate_number, type")
  ]);

  return (
    <div>
      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Total Logs</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{totalLogs || 0}</span>
            <span className={styles.kpiSubtext}>Records</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Scheduled</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{scheduledCount || 0}</span>
            <span className={styles.kpiSubtext}>Upcoming</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>In Progress</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{inProgressCount || 0}</span>
            <span className={styles.kpiSubtext}>Active</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Completed</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{completedCount || 0}</span>
            <span className={styles.kpiSubtext}>Done</span>
          </div>
        </div>
      </div>

      {/* @ts-expect-error Supabase join types */}
      <MaintenanceClient logs={logs || []} vehicles={vehicles || []} />
    </div>
  );
}
