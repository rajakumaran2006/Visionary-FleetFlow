"use client";

import { useState } from "react";
import styles from "../dashboard.module.css";
import { createDriver, updateDriver, updateDriverStatus, deleteDriver } from "../actions";

export type Driver = {
  id: string;
  name: string;
  license_number: string;
  license_expiry: string;
  duty_status: string;
  safety_score: number;
  completion_rate: number;
  complaints: number;
  created_at?: string;
};

export default function DriverClient({ drivers }: { drivers: Driver[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [dutyStatus, setDutyStatus] = useState("On Duty");

  const filteredDrivers = drivers.filter((driver) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      driver.name.toLowerCase().includes(q) ||
      driver.license_number.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "All" || driver.duty_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    let badgeClass = styles.statusBadge;
    switch (status) {
      case "On Duty":
        badgeClass += " " + styles.statusReady;
        break;
      case "Off Duty":
        badgeClass += " " + styles.statusDraft;
        break;
      case "Suspended":
        badgeClass += " " + styles.statusRed;
        break;
      default:
        badgeClass += " " + styles.statusDraft;
    }
    return badgeClass;
  };

  const handleStatusChange = async (driverId: string, newStatus: string) => {
    await updateDriverStatus(driverId, newStatus);
  };

  const handleDelete = async (driverId: string) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      await deleteDriver(driverId);
    }
  };

  const resetForm = () => {
    setEditingDriver(null);
    setName("");
    setLicenseNumber("");
    setLicenseExpiry("");
    setDutyStatus("On Duty");
    setFormError(null);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setName(driver.name);
    setLicenseNumber(driver.license_number);
    setLicenseExpiry(driver.license_expiry);
    setDutyStatus(driver.duty_status);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!name.trim() || !licenseNumber.trim() || !licenseExpiry) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("license_number", licenseNumber);
    formData.set("license_expiry", licenseExpiry);
    formData.set("duty_status", dutyStatus);

    let result;
    if (editingDriver) {
      formData.set("id", editingDriver.id);
      result = await updateDriver(formData);
    } else {
      result = await createDriver(formData);
    }

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
          placeholder="Search safety profiles..."
          className={styles.tableSearchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "300px" }}
        />
        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="On Duty">On Duty</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
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

      {/* Drivers Table */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Driver Performance & Safety Profiles</span>
          <div className={styles.tableHeaderActions}>
            <span style={{ fontSize: "0.85rem", color: "#71717a", fontWeight: 500 }}>
              {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>License#</th>
              <th>Expiry</th>
              <th>Completion Rate</th>
              <th>Safety Score</th>
              <th>Complaints</th>
              <th>Duty Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map((driver) => {
              // Safety Lock UI indication
              const isExpired = new Date(driver.license_expiry) < new Date();
              const isSuspended = driver.duty_status === "Suspended";
              const locked = isExpired || isSuspended;

              return (
                <tr key={driver.id} style={{ opacity: locked ? 0.6 : 1 }}>
                  <td style={{ fontWeight: 600 }}>
                    {driver.name}
                    {locked && (
                      <span style={{ color: "red", fontSize: "0.75rem", marginLeft: "0.5rem" }}>
                        (LOCKED)
                      </span>
                    )}
                  </td>
                  <td>{driver.license_number}</td>
                  <td style={{ color: isExpired ? "red" : "inherit" }}>
                    {driver.license_expiry}
                  </td>
                  <td>{driver.completion_rate}%</td>
                  <td>{driver.safety_score}%</td>
                  <td>{driver.complaints}</td>
                  <td>
                    <span className={getStatusBadgeClass(driver.duty_status)}>
                      {driver.duty_status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionBtnGroup}>
                      <select
                        className={styles.actionSelectSmall}
                        value={driver.duty_status}
                        onChange={(e) => handleStatusChange(driver.id, e.target.value)}
                      >
                        <option value="On Duty">On Duty</option>
                        <option value="Off Duty">Off Duty</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                      <button
                        className={styles.iconBtn}
                        onClick={() => handleEdit(driver)}
                        title="Edit driver"
                      >
                        ✎
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        onClick={() => handleDelete(driver.id)}
                        title="Delete driver"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredDrivers.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: "center", color: "#a1a1aa", padding: "2rem" }}
                >
                  {searchQuery || statusFilter !== "All"
                    ? "No drivers match your filters."
                    : "No drivers found. Register your first driver below."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Section */}
      <div className={styles.tripFormSection}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 className={styles.tripFormTitle}>
            {editingDriver ? "Edit Driver Profile" : "Register New Driver"}
          </h3>
          {editingDriver && (
            <button onClick={resetForm} className={styles.clearFilterBtn}>
              Cancel Edit
            </button>
          )}
        </div>

        {formError && <div className={styles.validationError}>{formError}</div>}
        {formSuccess && (
          <div className={styles.validationSuccess}>
            Driver {editingDriver ? "updated" : "created"} successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.tripFormGrid}>
          <div className={styles.tripFormField}>
            <label className={styles.tripFormLabel}>Driver Name:</label>
            <input
              type="text"
              className={styles.tripFormInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className={styles.tripFormField}>
            <label className={styles.tripFormLabel}>License Number:</label>
            <input
              type="text"
              className={styles.tripFormInput}
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="e.g. DL-12345678"
            />
          </div>

          <div className={styles.tripFormField}>
            <label className={styles.tripFormLabel}>License Expiry Date:</label>
            <input
              type="date"
              className={styles.tripFormInput}
              value={licenseExpiry}
              onChange={(e) => setLicenseExpiry(e.target.value)}
            />
          </div>

          <div className={styles.tripFormField}>
            <label className={styles.tripFormLabel}>Duty Status:</label>
            <select
              className={styles.tripFormInput}
              value={dutyStatus}
              onChange={(e) => setDutyStatus(e.target.value)}
            >
              <option value="On Duty">On Duty</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className={styles.tripFormActions}>
            <button
              type="submit"
              className={styles.dispatchBtn}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : editingDriver
                ? "Update Profile"
                : "Register Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
