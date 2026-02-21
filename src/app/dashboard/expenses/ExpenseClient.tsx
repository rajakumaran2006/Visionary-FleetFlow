"use client";

import { useState, useMemo } from "react";
import styles from "../dashboard.module.css";
import { createExpense, deleteExpense } from "../actions";

type Vehicle = {
  id: string;
  plate_number: string;
  type: string;
};

type Trip = {
  id: string;
  driver_name: string;
  distance_km: number;
  status: string;
  vehicles: Vehicle | null;
};

type Expense = {
  id: string;
  trip_id: string;
  vehicle_id: string;
  driver_name: string;
  fuel_liters: number;
  fuel_cost: number;
  misc_expense: number;
  date: string;
  created_at: string;
};

type MaintenanceLog = {
  vehicle_id: string;
  cost: number;
};

export default function ExpenseClient({
  expenses,
  completedTrips,
  maintenanceLogs,
}: {
  expenses: Expense[];
  completedTrips: Trip[];
  maintenanceLogs: MaintenanceLog[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [selectedTripId, setSelectedTripId] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [miscExpense, setMiscExpense] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  
  // Set driver automatically when trip is selected
  const selectedTrip = useMemo(
    () => completedTrips.find((t) => t.id === selectedTripId),
    [completedTrips, selectedTripId]
  );

  // Compute Total Operational Cost per vehicle
  const vehicleCosts = useMemo(() => {
    const costs: Record<string, { plate: string; type: string; fuel: number; maintenance: number; total: number }> = {};
    
    // Aggregate fuel costs
    expenses.forEach(exp => {
      if (!exp.vehicle_id) return;
      const trip = completedTrips.find(t => t.id === exp.trip_id);
      const vehicle = trip?.vehicles;
      
      if (vehicle) {
        if (!costs[vehicle.id]) {
          costs[vehicle.id] = { plate: vehicle.plate_number, type: vehicle.type, fuel: 0, maintenance: 0, total: 0 };
        }
        costs[vehicle.id].fuel += Number(exp.fuel_cost) || 0;
        costs[vehicle.id].total += Number(exp.fuel_cost) || 0;
      }
    });

    // Aggregate maintenance costs
    maintenanceLogs.forEach(log => {
      if (!log.vehicle_id) return;
      // We need vehicle details, if not in currently tracked trips, it might be incomplete, 
      // but we try to find it from completed trips for this demo.
      const v = completedTrips.find(t => t.vehicles?.id === log.vehicle_id)?.vehicles;
      if (v || costs[log.vehicle_id]) {
         if (!costs[log.vehicle_id]) {
            costs[log.vehicle_id] = { plate: v?.plate_number || "Unknown", type: v?.type || "Unknown", fuel: 0, maintenance: 0, total: 0 };
         }
         costs[log.vehicle_id].maintenance += Number(log.cost) || 0;
         costs[log.vehicle_id].total += Number(log.cost) || 0;
      }
    });

    return Object.entries(costs).sort((a, b) => b[1].total - a[1].total);
  }, [expenses, completedTrips, maintenanceLogs]);

  // Filter expenses
  const filteredExpenses = expenses.filter((exp) => {
    const q = searchQuery.toLowerCase();
    const tripIdShort = exp.trip_id.substring(0, 8).toLowerCase();
    return (
      tripIdShort.includes(q) ||
      exp.driver_name.toLowerCase().includes(q)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.set("trip_id", selectedTripId);
    formData.set("vehicle_id", selectedTrip.vehicles?.id || "");
    formData.set("driver_name", selectedTrip.driver_name);
    formData.set("fuel_liters", fuelLiters);
    formData.set("fuel_cost", fuelCost);
    formData.set("misc_expense", miscExpense);
    formData.set("date", expenseDate);

    await createExpense(formData);
    
    setIsSubmitting(false);
    setIsModalOpen(false);
    
    // Reset form
    setSelectedTripId("");
    setFuelLiters("");
    setFuelCost("");
    setMiscExpense("");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      await deleteExpense(id);
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000) {
      return `₹ ${(val / 1000).toFixed(1)}k`;
    }
    return `₹ ${val}`;
  };

  return (
    <>
      {/* Top Header & Search */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search by Trip ID, Driver..."
          className={styles.tableSearchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "300px" }}
        />
        <div className={styles.filterGroup}>
          <button 
            className={styles.addNewBtn}
            onClick={() => setIsModalOpen(true)}
            style={{ padding: "0.6rem 1.5rem" }}
          >
            Add an Expense
          </button>
        </div>
      </div>

      {/* Main Grid Layout for Wallet View */}
      <div className={styles.analyticsGrid}>
        
        {/* Left Side: Expense Logs Table */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <span className={styles.tableTitle}>Expense & Fuel Logging</span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Driver</th>
                <th>Distance</th>
                <th>Fuel Expense</th>
                <th>Misc. Expen</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => {
                const trip = completedTrips.find(t => t.id === exp.trip_id);
                const distance = trip?.distance_km || 0;
                const tripIdShort = exp.trip_id.substring(0, 8);
                
                return (
                  <tr key={exp.id}>
                    <td style={{ fontWeight: 600 }}>{tripIdShort}</td>
                    <td>{exp.driver_name}</td>
                    <td>{distance} km</td>
                    <td style={{ fontWeight: 500 }}>{formatCurrency(exp.fuel_cost)}</td>
                    <td style={{ color: "#71717a" }}>{formatCurrency(exp.misc_expense)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles.statusReady}`}>
                        Logged
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        onClick={() => handleDelete(exp.id)}
                        title="Delete expense"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#a1a1aa", padding: "3rem" }}>
                    No expense records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Side: Operational Cost Panel */}
        <div className={styles.costPanel}>
          <h3 className={styles.costPanelTitle}>Total Operational Cost</h3>
          <p className={styles.costPanelDesc}>
            Automated sum of fuel and maintenance costs per vehicle.
          </p>

          <div className={styles.costList}>
            {vehicleCosts.length > 0 ? (
              vehicleCosts.map(([vid, data]) => (
                <div key={vid} className={styles.costItem}>
                  <div className={styles.costItemHeader}>
                    <span className={styles.costItemPlate}>{data.plate}</span>
                    <span className={styles.costItemTotal}>{formatCurrency(data.total)}</span>
                  </div>
                  <div className={styles.costItemBars}>
                    <div 
                      className={styles.fuelBar} 
                      style={{ width: `${(data.fuel / data.total) * 100}%` }}
                      title={`Fuel: ${formatCurrency(data.fuel)}`}
                    ></div>
                    <div 
                      className={styles.maintBar} 
                      style={{ width: `${(data.maintenance / data.total) * 100}%` }}
                      title={`Maintenance: ${formatCurrency(data.maintenance)}`}
                    ></div>
                  </div>
                  <div className={styles.costItemLegend}>
                    <span><span className={styles.dotFuel}></span> Fuel: {formatCurrency(data.fuel)}</span>
                    <span><span className={styles.dotMaint}></span> Maint: {formatCurrency(data.maintenance)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "#a1a1aa", padding: "2rem" }}>
                No operational costs tracked yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* New Expense Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>New Expense</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Select Completed Trip</label>
                <select 
                  className={styles.input} 
                  required
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                >
                  <option value="">-- Choose a trip --</option>
                  {completedTrips.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id.substring(0,8)} - {t.driver_name} ({t.vehicles?.plate_number})
                    </option>
                  ))}
                </select>
                {completedTrips.length === 0 && (
                  <span className={styles.fieldErrorHint} style={{ marginTop: "4px" }}>
                    No completed trips available to log expenses for.
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Driver Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={selectedTrip?.driver_name || ""}
                  disabled
                  placeholder="Auto-filled from trip"
                  style={{ backgroundColor: "#f4f4f5" }}
                />
              </div>

              <div className={styles.tripFormGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Fuel Liters (L)</label>
                  <input
                    type="number"
                    className={styles.input}
                    required
                    min="0"
                    step="0.1"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    placeholder="e.g. 50"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Fuel Cost (₹)</label>
                  <input
                    type="number"
                    className={styles.input}
                    required
                    min="0"
                    step="0.01"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    placeholder="e.g. 4500"
                  />
                </div>
              </div>

              <div className={styles.tripFormGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Misc Expense (₹)</label>
                  <input
                    type="number"
                    className={styles.input}
                    min="0"
                    step="0.01"
                    value={miscExpense}
                    onChange={(e) => setMiscExpense(e.target.value)}
                    placeholder="Tolls, food, etc."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Date</label>
                  <input
                    type="date"
                    className={styles.input}
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isSubmitting || !selectedTripId}
                >
                  {isSubmitting ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
