"use client";

import { useState } from "react";
import styles from "./dashboard.module.css";
import { createVehicle, createTrip, updateTripStatus } from "./actions";

type Vehicle = {
  id: string;
  plate_number: string;
  type: string;
  status: string;
  model?: string | null;
  capacity?: string | null;
  odometer?: number | null;
};

type Trip = {
  id: string;
  driver_name: string;
  status: string;
  created_at?: string;
  vehicles?: {
    plate_number: string;
    type: string;
  } | null;
};

type Driver = {
  id: string;
  name: string;
  license_expiry: string;
  duty_status: string;
};

export default function DashboardClient({
  activeTrips,
  availableVehicles,
  allVehicles,
  drivers,
}: {
  activeTrips: Trip[];
  availableVehicles: Vehicle[];
  allVehicles: Vehicle[];
  drivers: Driver[];
}) {
  const [isVehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [isTripModalOpen, setTripModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("none");
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateVehicle = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    const result = await createVehicle(formData);
    setIsSubmitting(false);
    
    if (result?.error) {
      setError(result.error);
    } else {
      setVehicleModalOpen(false);
    }
  };

  const handleCreateTrip = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    const selectedDriver = drivers?.find(d => d.id === selectedDriverId);
    if (selectedDriver) {
      formData.set("driver_name", selectedDriver.name);
    }
    const result = await createTrip(formData);
    setIsSubmitting(false);
    
    if (result?.error) {
      setError(result.error);
    } else {
      setTripModalOpen(false);
      setSelectedDriverId("none");
    }
  };

  const handleStatusChange = async (tripId: string, newStatus: string) => {
    await updateTripStatus(tripId, newStatus);
  };

  // Filter trips
  const filteredTrips = activeTrips.filter((trip) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      trip.driver_name.toLowerCase().includes(q) ||
      (trip.vehicles?.plate_number?.toLowerCase() || "").includes(q) ||
      trip.status.toLowerCase().includes(q);

    const matchesType =
      typeFilter === "All" || trip.vehicles?.type === typeFilter;

    const matchesStatus =
      statusFilter === "All" || trip.status === statusFilter;

    // @ts-expect-error region property might not be in the initial types but exists in DB
    const matchesRegion = regionFilter === "All" || trip.region === regionFilter;

    return matchesSearch && matchesType && matchesStatus && matchesRegion;
  });

  // Filter fleet vehicles
  const filteredFleet = allVehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      v.plate_number.toLowerCase().includes(q) ||
      v.type.toLowerCase().includes(q) ||
      (v.model?.toLowerCase() || "").includes(q);

    const matchesType = typeFilter === "All" || v.type === typeFilter;
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    
    // @ts-expect-error region property might not be in the initial types but exists in DB
    const matchesRegion = regionFilter === "All" || v.region === regionFilter;

    return matchesSearch && matchesType && matchesStatus && matchesRegion;
  });

  const getStatusBadgeClass = (status: string) => {
    let badgeClass = styles.statusBadge;
    switch (status) {
      case "On Trip":
        badgeClass += " " + styles.statusOnTrip;
        break;
      case "Pending":
        badgeClass += " " + styles.statusPending;
        break;
      case "Completed":
      case "Ready":
        badgeClass += " " + styles.statusReady;
        break;
      case "In Shop":
        badgeClass += " " + styles.statusOrange;
        break;
      case "Busy":
        badgeClass += " " + styles.statusOnTrip;
        break;
      case "Out of Service":
      case "Retired":
      case "Cancelled":
        badgeClass += " " + styles.statusRed;
        break;
      case "Draft":
        badgeClass += " " + styles.statusPending;
        break;
      default:
        badgeClass += " " + styles.statusPending;
    }
    return badgeClass;
  };

  return (
    <>
      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search trips, vehicles, drivers..."
          className={styles.tableSearchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "280px" }}
        />
        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Mini">Mini</option>
            <option value="Bike">Bike</option>
          </select>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="On Trip">On Trip</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Ready">Ready</option>
            <option value="In Shop">In Shop</option>
            <option value="Out of Service">Out of Service</option>
          </select>
          <select
            className={styles.filterSelect}
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="All">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Central">Central</option>
          </select>
          {(typeFilter !== "All" || statusFilter !== "All" || regionFilter !== "All" || searchQuery) && (
            <button
              className={styles.clearFilterBtn}
              onClick={() => {
                setTypeFilter("All");
                setStatusFilter("All");
                setRegionFilter("All");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Trips Table */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Active Trips Overview</span>
          <div className={styles.tableHeaderActions}>
            <button
              className={styles.addNewBtn}
              onClick={() => setTripModalOpen(true)}
            >
              + New Trip
            </button>
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NO</th>
              <th>Trip ID</th>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map((trip, index) => {
              const vehicleCode = trip.vehicles?.plate_number || "Unassigned";
              const vehicleType = trip.vehicles?.type || "—";
              const tripIdShort = trip.id.substring(0, 8);

              return (
                <tr key={trip.id}>
                  <td style={{ fontWeight: 600, color: "#71717a" }}>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{tripIdShort}</td>
                  <td>{vehicleCode}</td>
                  <td>{vehicleType}</td>
                  <td>{trip.driver_name}</td>
                  <td>
                    <span className={getStatusBadgeClass(trip.status)}>
                      {trip.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className={styles.actionSelectSmall}
                      value={trip.status}
                      onChange={(e) => handleStatusChange(trip.id, e.target.value)}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Pending">Pending</option>
                      <option value="On Trip">On Trip</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              );
            })}

            {filteredTrips.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#a1a1aa", padding: "2rem" }}>
                  {searchQuery || typeFilter !== "All" || statusFilter !== "All"
                    ? "No trips match your filters."
                    : "No active trips found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Fleet Overview Table */}
      <div className={styles.tableSection} style={{ marginTop: "1.5rem" }}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Fleet Overview</span>
          <div className={styles.tableHeaderActions}>
            <button
              className={styles.addNewBtn}
              onClick={() => setVehicleModalOpen(true)}
            >
              + New Vehicle
            </button>
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NO</th>
              <th>Plate</th>
              <th>Model</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Odometer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredFleet.map((vehicle, index) => (
              <tr key={vehicle.id}>
                <td style={{ fontWeight: 600, color: "#71717a" }}>{index + 1}</td>
                <td style={{ fontWeight: 600 }}>{vehicle.plate_number}</td>
                <td>{vehicle.model || "—"}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.capacity || "—"}</td>
                <td>{vehicle.odometer?.toLocaleString() || "0"}</td>
                <td>
                  <span className={getStatusBadgeClass(vehicle.status)}>
                    {vehicle.status}
                  </span>
                </td>
              </tr>
            ))}

            {filteredFleet.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#a1a1aa", padding: "2rem" }}>
                  {searchQuery || typeFilter !== "All" || statusFilter !== "All"
                    ? "No vehicles match your filters."
                    : "No vehicles registered."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Vehicle Modal */}
      {isVehicleModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>New Vehicle Registration</h2>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <form action={handleCreateVehicle}>
              <div className={styles.formGroup}>
                <label className={styles.label}>License Plate</label>
                <input
                  type="text"
                  name="plate_number"
                  className={styles.input}
                  required
                  placeholder="e.g. TRK-005"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Model</label>
                <input
                  type="text"
                  name="model"
                  className={styles.input}
                  placeholder="e.g. 2024"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Vehicle Type</label>
                <select name="type" className={styles.input} required>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Mini">Mini</option>
                  <option value="Bike">Bike</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Region</label>
                <select name="region" className={styles.input} required>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="Central">Central</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Max Payload (Capacity)</label>
                <input
                  type="text"
                  name="capacity"
                  className={styles.input}
                  placeholder="e.g. 5 tons"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Initial Odometer</label>
                <input
                  type="number"
                  name="odometer"
                  className={styles.input}
                  placeholder="e.g. 50000"
                  min="0"
                />
              </div>
              <input type="hidden" name="status" value="Ready" />

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setVehicleModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Trip Modal */}
      {isTripModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Create New Trip</h2>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <form action={handleCreateTrip}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Select Driver</label>
                <select 
                  name="driver_id" 
                  className={styles.input} 
                  required
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                >
                  <option value="none">-- Leave Unassigned --</option>
                  {drivers?.map((d) => {
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
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Assign Vehicle</label>
                <select name="vehicle_id" className={styles.input} required>
                  <option value="none">-- Leave Unassigned (Pending) --</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate_number} ({v.type})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Initial Status</label>
                <select name="status" className={styles.input} required>
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="On Trip">On Trip</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Region</label>
                <select name="region" className={styles.input} required>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="Central">Central</option>
                </select>
              </div>
              <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Origin</label>
                  <input type="text" name="origin" className={styles.input} placeholder="e.g. Mumbai" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Destination</label>
                  <input type="text" name="destination" className={styles.input} placeholder="e.g. Pune" />
                </div>
              </div>
              <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Cargo Weight (kg)</label>
                  <input type="number" name="cargo_weight" className={styles.input} placeholder="e.g. 450" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Distance (km)</label>
                  <input type="number" name="distance_km" className={styles.input} placeholder="e.g. 150" />
                </div>
              </div>
              <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Revenue (INR)</label>
                  <input type="number" name="revenue" className={styles.input} placeholder="e.g. 5000" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Fuel Cost Est.</label>
                  <input type="number" name="estimated_fuel_cost" className={styles.input} placeholder="e.g. 1200" />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setTripModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
