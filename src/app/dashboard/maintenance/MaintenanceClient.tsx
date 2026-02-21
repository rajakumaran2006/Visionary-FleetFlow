"use client";

import { useState } from "react";
import styles from "../dashboard.module.css";
import { createMaintenanceLog, updateMaintenanceStatus, deleteMaintenanceLog } from "../actions";

type MaintenanceLog = {
  id: string;
  description: string;
  service_type: string;
  status: string;
  cost: number;
  scheduled_date: string | null;
  completed_date: string | null;
  vehicles?: {
    plate_number: string;
  } | null;
};

type Vehicle = {
  id: string;
  plate_number: string;
  type: string;
};

export default function MaintenanceClient({
  logs,
  vehicles,
}: {
  logs: MaintenanceLog[];
  vehicles: Vehicle[];
}) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.description.toLowerCase().includes(q) ||
      log.service_type.toLowerCase().includes(q) ||
      log.status.toLowerCase().includes(q) ||
      (log.vehicles?.plate_number?.toLowerCase() || "").includes(q)
    );
  });

  const handleCreate = async (formData: FormData) => {
    setIsSubmitting(true);
    await createMaintenanceLog(formData);
    setIsSubmitting(false);
    setModalOpen(false);
  };

  const handleStatusChange = async (logId: string, newStatus: string) => {
    await updateMaintenanceStatus(logId, newStatus);
  };

  const handleDelete = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this maintenance record?")) return;
    await deleteMaintenanceLog(logId);
  };

  return (
    <>
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Service & Maintenance Records</span>
          <div className={styles.tableHeaderActions}>
            <input
              type="text"
              placeholder="Search logs..."
              className={styles.tableSearchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className={styles.addNewBtn}
              onClick={() => setModalOpen(true)}
            >
              + New Log Entry
            </button>
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NO</th>
              <th>Vehicle</th>
              <th>Description</th>
              <th>Type</th>
              <th>Cost</th>
              <th>Scheduled</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, index) => {
              const vehiclePlate = log.vehicles?.plate_number || "Unassigned";

              let badgeClass = styles.statusBadge;
              if (log.status === "Completed") {
                badgeClass += " " + styles.statusReady;
              } else if (log.status === "In Progress") {
                badgeClass += " " + styles.statusOnTrip;
              } else {
                badgeClass += " " + styles.statusPending;
              }

              return (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600, color: "#71717a" }}>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{vehiclePlate}</td>
                  <td>{log.description}</td>
                  <td>{log.service_type}</td>
                  <td>${log.cost?.toFixed(2) || "0.00"}</td>
                  <td>{log.scheduled_date || "—"}</td>
                  <td>
                    <span className={badgeClass}>{log.status}</span>
                  </td>
                  <td>
                    <div className={styles.actionBtnGroup}>
                      <select
                        className={styles.actionSelectSmall}
                        value={log.status}
                        onChange={(e) => handleStatusChange(log.id, e.target.value)}
                        title="Change Status"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        onClick={() => handleDelete(log.id)}
                        title="Delete Log"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "#a1a1aa", padding: "2rem" }}>
                  {searchQuery ? "No logs match your search." : "No maintenance records found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Maintenance Log Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>New Maintenance Log</h2>
            <p style={{ fontSize: "0.85rem", color: "#71717a", marginBottom: "1.5rem", marginTop: "-0.75rem" }}>
              Creating a log will automatically set the vehicle&apos;s status to <strong>&quot;In Shop&quot;</strong>.
            </p>
            <form action={handleCreate}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Assign Vehicle</label>
                <select name="vehicle_id" className={styles.input} required>
                  <option value="none">-- Select Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate_number} ({v.type})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <input
                  type="text"
                  name="description"
                  className={styles.input}
                  required
                  placeholder="e.g. Oil change and filter replacement"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Service Type</label>
                <select name="service_type" className={styles.input} required>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Tire Rotation">Tire Rotation</option>
                  <option value="Brake Service">Brake Service</option>
                  <option value="Preventative">Preventative</option>
                  <option value="Reactive">Reactive</option>
                  <option value="Inspection">Inspection</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Estimated Cost ($)</label>
                <input
                  type="number"
                  name="cost"
                  className={styles.input}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Scheduled Date</label>
                <input
                  type="date"
                  name="scheduled_date"
                  className={styles.input}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Create Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
