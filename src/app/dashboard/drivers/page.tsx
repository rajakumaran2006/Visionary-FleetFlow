import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DriverClient from "./DriverClient";

export const metadata = {
  title: "Driver Profiles - FleetFlow",
  description: "Manage driver performance, safety, and compliance.",
};

export default async function DriversPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the user's role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const isSafetyOfficer = profile?.role?.toLowerCase() === "safety officer";

  // If not Safety Officer, redirect to dashboard root
  if (!isSafetyOfficer) {
    redirect("/dashboard");
  }

  // Fetch drivers
  const { data: drivers, error } = await supabase
    .from("drivers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching drivers:", error);
  }

  return <DriverClient drivers={drivers || []} />;
}
