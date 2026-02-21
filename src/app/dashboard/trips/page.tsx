import { createClient } from "@/utils/supabase/server";
import TripDispatcherClient from "./TripDispatcherClient";

export default async function TripsPage() {
  const supabase = await createClient();

  const [
    { data: trips },
    { data: availableVehicles },
    { data: drivers },
  ] = await Promise.all([
    // All trips with vehicle info
    supabase
      .from("trips")
      .select(`
        id,
        driver_name,
        driver_id,
        status,
        origin,
        destination,
        cargo_weight,
        estimated_fuel_cost,
        created_at,
        vehicles (
          id,
          plate_number,
          type,
          capacity
        ),
        drivers (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false }),

    // Available vehicles for trip creation
    supabase
      .from("vehicles")
      .select("id, plate_number, type, status, capacity")
      .eq("status", "Ready"),

    // Available drivers
    supabase
      .from("drivers")
      .select("id, name, license_expiry, duty_status")
      .order("name", { ascending: true }),
  ]);

  return (
    <TripDispatcherClient
      // @ts-expect-error Supabase FK join returns object at runtime but types as array
      trips={trips || []}
      availableVehicles={availableVehicles || []}
      drivers={drivers || []}
    />
  );
}
