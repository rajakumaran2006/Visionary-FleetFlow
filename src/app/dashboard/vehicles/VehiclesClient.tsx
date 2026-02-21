"use client";

import { useState } from "react";
import styles from "../dashboard.module.css";
import { createVehicle, updateVehicle, deleteVehicle, updateVehicleStatus } from "../actions";

type Vehicle = {
  id: string;
  plate_number: string;
  type: string;
  model: string | null;
  capacity: string | null;
  odometer: number | null;
  status: string;
  region?: string | null;
  roi?: number | null;
  total_cost?: number | null;
};

export default function VehiclesClient({
  initialVehicles,
}: {
  initialVehicles: Vehicle[];
}) {
  const [isNewModalOpen, setNewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVehicles = initialVehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.plate_number.toLowerCase().includes(q) ||
      v.type.toLowerCase().includes(q) ||
      (v.model?.toLowerCase() || "").includes(q) ||
      v.status.toLowerCase().includes(q) ||
      (v.region?.toLowerCase() || "").includes(q)
    );
  });

  const handleCreateVehicle = async (formData: FormData) => {
    setIsSubmitting(true);
    await createVehicle(formData);
    setIsSubmitting(false);
    setNewModalOpen(false);
  };

  const handleUpdateVehicle = async (formData: FormData) => {
    setIsSubmitting(true);
    await updateVehicle(formData);
    setIsSubmitting(false);
    setEditModalOpen(false);
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to remove this vehicle from the fleet?")) return;
    await deleteVehicle(vehicleId);
  };

  const handleStatusChange = async (vehicleId: string, newStatus: string) => {
    await updateVehicleStatus(vehicleId, newStatus);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setEditModalOpen(true);
  };

  const getStatusBadgeClass = (status: string) => {
    let badgeClass = styles.statusBadge;
    switch (status) {
      case "Ready":
        badgeClass += " " + styles.statusReady;
        break;
      case "In Shop":
        badgeClass += " " + styles.statusOrange;
        break;
      case "Retired":
      case "Out of Service":
        badgeClass += " " + styles.statusRed;
        break;
      case "Busy":
        badgeClass += " " + styles.statusOnTrip;
        break;
      default:
        badgeClass += " " + styles.statusPending;
    }
    return badgeClass;
  };

  return (
    <>
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Vehicle Registry (Asset Management)</span>
          <div className={styles.tableHeaderActions}>
            <input
              type="text"
              placeholder="Search vehicles..."
              className={styles.tableSearchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className={styles.addNewBtn}
              onClick={() => setNewModalOpen(true)}
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
              <th>Region</th>
              <th>Capacity</th>
              <th>Odometer</th>
              <th>ROI/Cost</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle, index) => (
              <tr key={vehicle.id}>
                <td style={{ fontWeight: 600, color: "#71717a" }}>{index + 1}</td>
                <td style={{ fontWeight: 600 }}>{vehicle.plate_number}</td>
                <td>{vehicle.model || "—"}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.region || "North"}</td>
                <td>{vehicle.capacity || "—"}</td>
                <td>{vehicle.odometer?.toLocaleString() || "0"}</td>
                <td>
                  <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ color: '#16a34a', fontWeight: 600 }}>ROI: {vehicle.roi?.toFixed(1) || "0.0"}%</div>
                    <div style={{ color: '#71717a' }}>Cost: ₹{( (vehicle.total_cost || 0) / 1000).toFixed(1)}k</div>
                  </div>
                </td>
                <td>
                  <span className={getStatusBadgeClass(vehicle.status)}>
                    {vehicle.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionBtnGroup}>
                    <button
                      className={styles.iconBtn}
                      onClick={() => openEditModal(vehicle)}
                      title="Edit Vehicle"
                    >
                      ✏️
                    </button>
                    <select
                      className={styles.actionSelectSmall}
                      value={vehicle.status}
                      onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                      title="Change Status"
                    >
                      <option value="Ready">Ready</option>
                      <option value="Busy">Busy</option>
                      <option value="In Shop">In Shop</option>
                      <option value="Out of Service">Out of Service</option>
                      <option value="Retired">Retired</option>
                    </select>
                    <button
                      className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      title="Delete Vehicle"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredVehicles.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "#a1a1aa", padding: "2rem" }}>
                  {searchQuery ? "No vehicles match your search." : "No vehicles registered in the fleet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Vehicle Registration Modal */}
      {isNewModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>New Vehicle Registration</h2>
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
                <label className={styles.label}>Type</label>
                <select name="type" className={styles.input} required>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Mini">Mini</option>
                  <option value="Bike">Bike</option>
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
              <input type="hidden" name="status" value="Ready" />

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setNewModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {isEditModalOpen && editingVehicle && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Edit Vehicle</h2>
            <form action={handleUpdateVehicle}>
              <input type="hidden" name="id" value={editingVehicle.id} />
              <div className={styles.formGroup}>
                <label className={styles.label}>License Plate</label>
                <input
                  type="text"
                  name="plate_number"
                  className={styles.input}
                  required
                  defaultValue={editingVehicle.plate_number}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Model</label>
                <input
                  type="text"
                  name="model"
                  className={styles.input}
                  defaultValue={editingVehicle.model || ""}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Type</label>
                <select name="type" className={styles.input} required defaultValue={editingVehicle.type}>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Mini">Mini</option>
                  <option value="Bike">Bike</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Max Payload (Capacity)</label>
                <input
                  type="text"
                  name="capacity"
                  className={styles.input}
                  defaultValue={editingVehicle.capacity || ""}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Odometer</label>
                <input
                  type="number"
                  name="odometer"
                  className={styles.input}
                  defaultValue={editingVehicle.odometer || 0}
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Status</label>
                <select name="status" className={styles.input} required defaultValue={editingVehicle.status}>
                  <option value="Ready">Ready</option>
                  <option value="Busy">Busy</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Out of Service">Out of Service</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Region</label>
                <select name="region" className={styles.input} required defaultValue={editingVehicle.region || "North"}>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="Central">Central</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => { setEditModalOpen(false); setEditingVehicle(null); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
