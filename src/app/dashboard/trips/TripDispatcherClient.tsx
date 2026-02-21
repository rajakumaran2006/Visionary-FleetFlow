"use client";

import { useState } from "react";
import styles from "../dashboard.module.css";
import { createTrip, updateTripStatus, deleteTrip } from "../actions";

type Vehicle = {
  id: string;
  plate_number: string;
  type: string;
  status: string;
  capacity?: string | null;
};

type Trip = {
  id: string;
  driver_name: string;
  status: string;
  origin?: string | null;
  destination?: string | null;
  cargo_weight?: number | null;
  estimated_fuel_cost?: number | null;
  created_at?: string;
  driver_id?: string | null;
  vehicles?: {
    id: string;
    plate_number: string;
    type: string;
    capacity?: string | null;
  } | null;
  drivers?: {
    id: string;
    name: string;
  } | null;
};

type Driver = {
  id: string;
  name: string;
  license_expiry: string;
  duty_status: string;
};

export default function TripDispatcherClient({
  trips,
  availableVehicles,
  drivers
}: {
  trips: Trip[];
  availableVehicles: Vehicle[];
  drivers: Driver[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Form fields
  const [selectedVehicleId, setSelectedVehicleId] = useState("none");
  const [cargoWeight, setCargoWeight] = useState("");
  const [driverId, setDriverId] = useState("none");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [fuelCost, setFuelCost] = useState("");

  // Get selected vehicle capacity for client-side validation
  const selectedVehicle = availableVehicles.find(v => v.id === selectedVehicleId);
  const maxCapacity = selectedVehicle?.capacity
    ? parseFloat(selectedVehicle.capacity.replace(/[^0-9.]/g, ""))
    : null;
  const isOverweight =
    maxCapacity !== null &&
    !isNaN(maxCapacity) &&
    maxCapacity > 0 &&
    parseFloat(cargoWeight) > maxCapacity;

  const filteredTrips = trips.filter((trip) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      trip.driver_name.toLowerCase().includes(q) ||
      (trip.origin?.toLowerCase() || "").includes(q) ||
      (trip.destination?.toLowerCase() || "").includes(q) ||
      (trip.vehicles?.type?.toLowerCase() || "").includes(q) ||
      (trip.vehicles?.plate_number?.toLowerCase() || "").includes(q) ||
      trip.status.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "All" || trip.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    let badgeClass = styles.statusBadge;
    switch (status) {
      case "Draft":
        badgeClass += " " + styles.statusDraft;
        break;
      case "Dispatched":
        badgeClass += " " + styles.statusDispatched;
        break;
      case "On Way":
      case "On Trip":
        badgeClass += " " + styles.statusOnTrip;
        break;
      case "Completed":
        badgeClass += " " + styles.statusReady;
        break;
      case "Cancelled":
        badgeClass += " " + styles.statusRed;
        break;
      case "Pending":
        badgeClass += " " + styles.statusPending;
        break;
      default:
        badgeClass += " " + styles.statusDraft;
    }
    return badgeClass;
  };

  const handleStatusChange = async (tripId: string, newStatus: string) => {
    await updateTripStatus(tripId, newStatus);
  };

  const handleDelete = async (tripId: string) => {
    if (confirm("Are you sure you want to delete this trip?")) {
      await deleteTrip(tripId);
    }
  };

  const resetForm = () => {
    setSelectedVehicleId("none");
    setCargoWeight("");
    setDriverId("none");
    setOrigin("");
    setDestination("");
    setFuelCost("");
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    // Client-side validation
    if (selectedVehicleId === "none") {
      setFormError("Please select a vehicle.");
      return;
    }
    if (driverId === "none") {
      setFormError("Please select a driver from the list.");
      return;
    }
    if (!origin.trim()) {
      setFormError("Please enter an origin address.");
      return;
    }
    if (!destination.trim()) {
      setFormError("Please enter a destination.");
      return;
    }
    if (isOverweight) {
      setFormError(
        `Too heavy! Cargo weight (${cargoWeight} kg) exceeds vehicle max capacity of ${maxCapacity} kg.`
      );
      return;
    }

    setIsSubmitting(true);

    const selectedDriver = drivers.find(d => d.id === driverId);
    
    const formData = new FormData();
    formData.set("vehicle_id", selectedVehicleId);
    formData.set("driver_id", driverId);
    formData.set("driver_name", selectedDriver ? selectedDriver.name : "Unknown Driver");
    formData.set("origin", origin);
    formData.set("destination", destination);
    formData.set("cargo_weight", cargoWeight || "0");
    formData.set("estimated_fuel_cost", fuelCost || "0");
    formData.set("status", "Draft");

    const result = await createTrip(formData);

    if (result?.error) {
      setFormError(result.error);
    } else {
      setFormSuccess(true);
      resetForm();
      setTimeout(() => setFormSuccess(false), 3000);
    }

    setIsSubmitting(false);
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search trips, vehicles, drivers, routes..."
          className={styles.tableSearchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "320px" }}
        />
        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Dispatched">Dispatched</option>
            <option value="On Way">On Way</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          {(statusFilter !== "All" || searchQuery) && (
            <button
              className={styles.clearFilterBtn}
              onClick={() => {
                setStatusFilter("All");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Trip Table */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Trip Dispatcher & Management</span>
          <div className={styles.tableHeaderActions}>
            <span style={{ fontSize: "0.85rem", color: "#71717a", fontWeight: 500 }}>
              {filteredTrips.length} trip{filteredTrips.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NO</th>
              <th>Fleet Type</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Driver</th>
              <th>Cargo (kg)</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map((trip, index) => (
              <tr key={trip.id}>
                <td style={{ fontWeight: 600, color: "#71717a" }}>{index + 1}</td>
                <td style={{ fontWeight: 600 }}>
                  {trip.vehicles?.type || "—"}{" "}
                  <span style={{ color: "#a1a1aa", fontWeight: 400, fontSize: "0.8rem" }}>
                    {trip.vehicles?.plate_number || ""}
                  </span>
                </td>
                <td>{trip.origin || "—"}</td>
                <td>{trip.destination || "—"}</td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{trip.drivers?.name || trip.driver_name}</span>
                  </div>
                </td>
                <td>{trip.cargo_weight || "—"}</td>
                <td>
                  <span className={getStatusBadgeClass(trip.status)}>
                    {trip.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionBtnGroup}>
                    <select
                      className={styles.actionSelectSmall}
                      value={trip.status}
                      onChange={(e) => handleStatusChange(trip.id, e.target.value)}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="On Way">On Way</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button
                      className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                      onClick={() => handleDelete(trip.id)}
                      title="Delete trip"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredTrips.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: "center", color: "#a1a1aa", padding: "2rem" }}
                >
                  {searchQuery || statusFilter !== "All"
                    ? "No trips match your filters."
                    : "No trips found. Create your first trip below."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Trip Form - Always visible below the table */}
      <div className={styles.tripFormSection}>
        <h3 className={styles.tripFormTitle}>New Trip Form</h3>

        {formError && (
          <div className={styles.validationError}>{formError}</div>
        )}
        {formSuccess && (
          <div className={styles.validationSuccess}>
            Trip created successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.tripFormGrid}>
          <div className={styles.tripFormField}>
            <label className={styles.tripFormLabel}>Select Vehicle:</label>
            <select
              className={styles.tripFormInput}
              value={selectedVehicleId}
              onChange={(e) => {
                setSelectedVehicleId(e.target.value);
                setFormError(null);
              }}
            >
              <option value="none">-- Select a vehicle --</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate_number} — {v.type}
                  {v.capacity ? ` (Max: ${v.capacity})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.tripFormField}>
            <label className={styles.tripFormLabel}>Cargo Weight (Kg):</label>
            <input
              type="number"
              className={`${styles.tripFormInput} ${isOverweight ? styles.tripFormInputError : ""}`}
              value={cargoWeight}
              onChange={(e) => {
                setCargoWeight(e.target.value);
                setFormError(null);
              }}
              placeholder="e.g. 2000"
              min="0"
              step="any"
            />
            {isOverweight && (
              <span className={styles.fieldErrorHint}>
                Exceeds max capacity of {maxCapacity} kg!
              </span>
            )}
          </div>

          <div className={styles.tripFormField}>
            <label className={styles.tripFormLabel}>Select Driver:</label>
            <select
              className={styles.tripFormInput}
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
            >
              <option value="none">-- Select a driver --</option>
              {drivers.map((d) => {
                const isExpired = new Date(d.license_expiry) < new Date();
                const isSuspended = d.duty_status !== "On Duty";
                const isLocked = isExpired || isSuspended;

                let lockedReason = "";
                if (isExpired) lockedReason = "(License Expired)";
                else if (isSuspended) lockedReason = `(${d.duty_status})`;

                return (
                  <option key={d.id} value={d.id} disabled={isLocked}>
                    {d.name} {lockedReason}
                  </option>
                );
              })}
            </select>
            {driverId !== "none" && (
              <span className={styles.fieldHint} style={{ color: "#10b981", fontSize: "0.80rem" }}>
                ✓ Driver verified (Active & On Duty)
              </span>
            )}
          </div>

          <div className={styles.tripFormField}>
            <label className={styles.tripFormLabel}>Origin Address:</label>
            <input
              type="text"
              className={styles.tripFormInput}
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Mumbai"
            />
          </div>

          <div className={styles.tripFormField}>
            <label className={styles.tripFormLabel}>Destination:</label>
            <input
              type="text"
              className={styles.tripFormInput}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Pune"
            />
          </div>

          <div className={styles.tripFormField}>
            <label className={styles.tripFormLabel}>Estimated Fuel Cost:</label>
            <input
              type="number"
              className={styles.tripFormInput}
              value={fuelCost}
              onChange={(e) => setFuelCost(e.target.value)}
              placeholder="e.g. 5000"
              min="0"
              step="any"
            />
          </div>

          <div className={styles.tripFormActions}>
            <button
              type="submit"
              className={styles.dispatchBtn}
              disabled={isSubmitting || isOverweight}
            >
              {isSubmitting ? "Creating..." : "Confirm & Dispatch Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
