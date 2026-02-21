import { createClient } from "@/utils/supabase/server";
import styles from "../dashboard.module.css";
import VehiclesClient from "./VehiclesClient";

export default async function VehiclesPage() {
  const supabase = await createClient();

  const [
    { count: totalVehicles },
    { count: readyVehicles },
    { count: inShopVehicles },
    { count: outOfServiceVehicles },
    { data: vehicles }
  ] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true }),
      
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("status", "Ready"),
      
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("status", "In Shop"),

    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .in("status", ["Retired", "Out of Service"]),

    supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false })
  ]);

  const total = totalVehicles || 0;
  const ready = readyVehicles || 0;
  const inShop = inShopVehicles || 0;
  const oos = outOfServiceVehicles || 0;

  return (
    <div>
      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Total Fleet Size</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{total}</span>
            <span className={styles.kpiSubtext}>Vehicles</span>
          </div>
        </div>
        
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Ready for Dispatch</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{ready}</span>
            <span className={styles.kpiSubtext}>Available</span>
          </div>
        </div>
        
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>In Maintenance</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{inShop}</span>
            <span className={styles.kpiSubtext}>In Shop</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Out of Service</span>
          </div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{oos}</span>
            <span className={styles.kpiSubtext}>Retired</span>
          </div>
        </div>
      </div>

      <VehiclesClient initialVehicles={vehicles || []} />
    </div>
  );
}
