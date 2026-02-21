"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function createVehicle(formData: FormData) {
  const supabase = await createClient();
  const plate_number = formData.get("plate_number") as string;
  const type = formData.get("type") as string;
  const status = formData.get("status") as string;
  const model = formData.get("model") as string;
  const capacity = formData.get("capacity") as string;
  const region = formData.get("region") as string || "North";
  const odometer = parseInt(formData.get("odometer") as string) || 0;

  const { error } = await supabase
    .from("vehicles")
    .insert([{ plate_number, type, status, model, capacity, odometer, region }]);

  if (error) {
    console.error("Error creating vehicle:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vehicles");
  return { success: true };
}

export async function updateVehicle(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const plate_number = formData.get("plate_number") as string;
  const type = formData.get("type") as string;
  const status = formData.get("status") as string;
  const model = formData.get("model") as string;
  const capacity = formData.get("capacity") as string;
  const region = formData.get("region") as string;
  const odometer = parseInt(formData.get("odometer") as string) || 0;

  const { error } = await supabase
    .from("vehicles")
    .update({ plate_number, type, status, model, capacity, odometer, region })
    .eq("id", id);

  if (error) {
    console.error("Error updating vehicle:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vehicles");
  return { success: true };
}

export async function deleteVehicle(vehicleId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", vehicleId);

  if (error) {
    console.error("Error deleting vehicle:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vehicles");
  return { success: true };
}

export async function updateVehicleStatus(vehicleId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vehicles")
    .update({ status })
    .eq("id", vehicleId);

  if (error) {
    console.error("Error updating vehicle status:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vehicles");
  return { success: true };
}

export async function createTrip(formData: FormData) {
  const supabase = await createClient();
  const driver_name = formData.get("driver_name") as string;
  const driver_id_str = formData.get("driver_id") as string;
  const vehicle_id_str = formData.get("vehicle_id") as string;
  const status = formData.get("status") as string || "Draft";
  const origin = formData.get("origin") as string || "";
  const destination = formData.get("destination") as string || "";
  const region = formData.get("region") as string || "North";
  const cargo_weight = parseFloat(formData.get("cargo_weight") as string) || 0;
  const distance_km = parseFloat(formData.get("distance_km") as string) || 0;
  const revenue = parseFloat(formData.get("revenue") as string) || 0;
  const estimated_fuel_cost = parseFloat(formData.get("estimated_fuel_cost") as string) || 0;

  const vehicle_id = vehicle_id_str === "none" ? null : vehicle_id_str;
  const driver_id = driver_id_str === "none" || !driver_id_str ? null : driver_id_str;

  // 1. Server-side safety check: Driver Compliance
  if (driver_id) {
    const { data: driver } = await supabase
      .from("drivers")
      .select("license_expiry, duty_status")
      .eq("id", driver_id)
      .single();

    if (driver) {
      if (new Date(driver.license_expiry) < new Date()) {
        return { error: "Assignment Blocked: Driver license has expired." };
      }
      if (driver.duty_status !== "On Duty") {
        return { error: `Assignment Blocked: Driver is currently ${driver.duty_status}.` };
      }
    }
  }

  // 2. Server-side cargo weight validation
  if (vehicle_id && cargo_weight > 0) {
    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("capacity")
      .eq("id", vehicle_id)
      .single();

    if (vehicle?.capacity) {
      const maxCapacity = parseFloat(vehicle.capacity.replace(/[^0-9.]/g, ""));
      if (!isNaN(maxCapacity) && maxCapacity > 0 && cargo_weight > maxCapacity) {
        return {
          error: `Too heavy! Cargo weight (${cargo_weight} kg) exceeds vehicle max capacity of ${maxCapacity} kg.`,
        };
      }
    }
  }

  const { error } = await supabase
    .from("trips")
    .insert([{
      driver_name,
      driver_id,
      vehicle_id,
      status,
      origin,
      destination,
      region,
      cargo_weight,
      distance_km,
      revenue,
      estimated_fuel_cost,
    }]);

  if (error) {
    console.error("Error creating trip:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/trips");
  return { success: true };
}

export async function updateTripStatus(tripId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trips")
    .update({ status })
    .eq("id", tripId);

  if (error) {
    console.error("Error updating trip status:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/trips");
  return { success: true };
}

export async function deleteTrip(tripId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId);

  if (error) {
    console.error("Error deleting trip:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/trips");
  return { success: true };
}

export async function createMaintenanceLog(formData: FormData) {
  const supabase = await createClient();
  const vehicle_id = formData.get("vehicle_id") as string;
  const description = formData.get("description") as string;
  const service_type = formData.get("service_type") as string;
  const cost = parseFloat(formData.get("cost") as string) || 0;
  const scheduled_date = formData.get("scheduled_date") as string;

  const resolvedVehicleId = vehicle_id === "none" ? null : vehicle_id;

  // Insert the maintenance log
  const { error } = await supabase
    .from("maintenance_logs")
    .insert([{
      vehicle_id: resolvedVehicleId,
      description,
      service_type,
      status: "Scheduled",
      cost,
      scheduled_date: scheduled_date || null
    }]);

  if (error) {
    console.error("Error creating maintenance log:", error);
    return { error: error.message };
  }

  // Auto-set the vehicle status to "In Shop" when a maintenance log is created
  if (resolvedVehicleId) {
    const { error: vehicleError } = await supabase
      .from("vehicles")
      .update({ status: "In Shop" })
      .eq("id", resolvedVehicleId);

    if (vehicleError) {
      console.error("Error updating vehicle status to In Shop:", vehicleError);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vehicles");
  revalidatePath("/dashboard/maintenance");
  return { success: true };
}

export async function updateMaintenanceStatus(logId: string, status: string) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = { status };
  if (status === "Completed") {
    updateData.completed_date = new Date().toISOString().split("T")[0];
  }

  const { error } = await supabase
    .from("maintenance_logs")
    .update(updateData)
    .eq("id", logId);

  if (error) {
    console.error("Error updating maintenance status:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/maintenance");
  return { success: true };
}

export async function deleteMaintenanceLog(logId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("maintenance_logs")
    .delete()
    .eq("id", logId);

  if (error) {
    console.error("Error deleting maintenance log:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/maintenance");
  return { success: true };
}

export async function createExpense(formData: FormData) {
  const supabase = await createClient();
  const trip_id = formData.get("trip_id") as string;
  const vehicle_id_str = formData.get("vehicle_id") as string;
  const driver_name = formData.get("driver_name") as string;
  const fuel_liters = parseFloat(formData.get("fuel_liters") as string) || 0;
  const fuel_cost = parseFloat(formData.get("fuel_cost") as string) || 0;
  const misc_expense = parseFloat(formData.get("misc_expense") as string) || 0;
  const date = formData.get("date") as string;
  
  const vehicle_id = vehicle_id_str === "none" || !vehicle_id_str ? null : vehicle_id_str;

  const { error } = await supabase
    .from("expenses")
    .insert([{
      trip_id,
      vehicle_id,
      driver_name,
      fuel_liters,
      fuel_cost,
      misc_expense,
      date: date || undefined
    }]);

  if (error) {
    console.error("Error creating expense:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/analytics");
  return { success: true };
}

export async function deleteExpense(expenseId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) {
    console.error("Error deleting expense:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/analytics");
  return { success: true };
}

// -------------------------------------------------------------
// DRIVERS SERVER ACTIONS
// -------------------------------------------------------------

export async function createDriver(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const license_number = formData.get("license_number") as string;
  const license_expiry = formData.get("license_expiry") as string;
  const duty_status = formData.get("duty_status") as string;

  const { error } = await supabase
    .from("drivers")
    .insert([{
      name,
      license_number,
      license_expiry,
      duty_status,
      safety_score: 100,
      completion_rate: 100,
      complaints: 0
    }]);

  if (error) {
    console.error("Error creating driver:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/drivers");
  revalidatePath("/dashboard/trips");
  return { success: true };
}

export async function updateDriver(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const license_number = formData.get("license_number") as string;
  const license_expiry = formData.get("license_expiry") as string;
  const duty_status = formData.get("duty_status") as string;

  const { error } = await supabase
    .from("drivers")
    .update({ 
      name, 
      license_number, 
      license_expiry, 
      duty_status 
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating driver:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/drivers");
  revalidatePath("/dashboard/trips");
  return { success: true };
}

export async function updateDriverStatus(driverId: string, duty_status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("drivers")
    .update({ duty_status })
    .eq("id", driverId);

  if (error) {
    console.error("Error updating driver status:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/drivers");
  revalidatePath("/dashboard/trips");
  return { success: true };
}

export async function deleteDriver(driverId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("drivers")
    .delete()
    .eq("id", driverId);

  if (error) {
    console.error("Error deleting driver:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/drivers");
  revalidatePath("/dashboard/trips");
  return { success: true };
}
