import { createClient } from "@/utils/supabase/server";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [
    { data: expenses },
    { data: trips },
    { data: vehicles },
    { data: maintenanceLogs },
  ] = await Promise.all([
    supabase.from("expenses").select("*"),
    supabase.from("trips").select("id, vehicle_id, distance_km, revenue, status, created_at").eq("status", "Completed"),
    supabase.from("vehicles").select("id, plate_number, type, status, acquisition_cost"),
    supabase.from("maintenance_logs").select("*").eq("status", "Completed")
  ]);

  return (
    <AnalyticsClient
      expenses={expenses || []}
      trips={trips || []}
      vehicles={vehicles || []}
      maintenanceLogs={maintenanceLogs || []}
    />
  );
}
