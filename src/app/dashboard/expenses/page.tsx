import { createClient } from "@/utils/supabase/server";
import ExpenseClient from "./ExpenseClient";

export default async function ExpensesPage() {
  const supabase = await createClient();

  const [
    { data: expenses },
    { data: completedTrips },
    { data: maintenanceLogs },
  ] = await Promise.all([
    // All expenses
    supabase
      .from("expenses")
      .select("*")
      .order("created_at", { ascending: false }),

    // Completed trips for the expense form dropdown
    supabase
      .from("trips")
      .select(`
        id,
        driver_name,
        distance_km,
        status,
        vehicles (
          id,
          plate_number,
          type
        )
      `)
      .eq("status", "Completed")
      .order("created_at", { ascending: false }),

    // Maintenance logs for Total Operational Cost calculation
    supabase
      .from("maintenance_logs")
      .select("vehicle_id, cost")
      .eq("status", "Completed")
  ]);

  return (
    <ExpenseClient
      expenses={expenses || []}
      // @ts-expect-error Supabase FK join returns object at runtime but types as array
      completedTrips={completedTrips || []}
      maintenanceLogs={maintenanceLogs || []}
    />
  );
}
