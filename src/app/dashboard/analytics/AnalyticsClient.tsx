"use client";

import { useMemo, useRef } from "react";
import styles from "../dashboard.module.css";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';
import { Download, FileText, TrendingUp, DollarSign, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Expense = {
  id: string;
  trip_id: string;
  vehicle_id: string;
  fuel_liters: number;
  fuel_cost: number;
  misc_expense: number;
  date: string;
};

type Trip = {
  id: string;
  vehicle_id: string;
  distance_km: number;
  revenue: number;
  status: string;
  created_at?: string;
};

type Vehicle = {
  id: string;
  plate_number: string;
  type: string;
  status: string;
  acquisition_cost: number;
};

type MaintenanceLog = {
  id: string;
  vehicle_id: string;
  cost: number;
  completed_date: string | null;
  status: string;
};

export default function AnalyticsClient({
  expenses,
  trips,
  vehicles,
  maintenanceLogs,
}: {
  expenses: Expense[];
  trips: Trip[];
  vehicles: Vehicle[];
  maintenanceLogs: MaintenanceLog[];
}) {
  const reportRef = useRef<HTMLDivElement>(null);

  // 1. KPI Calculations
  const kpis = useMemo(() => {
    const totalFuelCost = expenses.reduce((sum, exp) => sum + (Number(exp.fuel_cost) || 0), 0);
    const activeVehicles = vehicles.filter(v => v.status === "On Trip").length;
    const utilizationRate = vehicles.length > 0 ? (activeVehicles / vehicles.length) * 100 : 0;
    
    const totalRevenue = trips.reduce((sum, trip) => sum + (Number(trip.revenue) || 0), 0);
    const totalMaintenance = maintenanceLogs.reduce((sum, log) => sum + (Number(log.cost) || 0), 0);
    const totalAcquisitionCost = vehicles.reduce((sum, v) => sum + (Number(v.acquisition_cost) || 0), 0);

    let fleetRoi = 0;
    if (totalAcquisitionCost > 0) {
       fleetRoi = ((totalRevenue - (totalFuelCost + totalMaintenance)) / totalAcquisitionCost) * 100;
    }

    return { totalFuelCost, utilizationRate, fleetRoi, totalRevenue };
  }, [expenses, trips, vehicles, maintenanceLogs]);

  // 2. Monthly Financial Data for Charts/Table
  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const curYear = new Date().getFullYear();
    
    const data = months.map(m => ({
      name: m,
      revenue: 0,
      expenses: 0,
      fuelCost: 0,
      maintenance: 0,
      netProfit: 0,
      efficiency: 0,
      km: 0,
      liters: 0
    }));

    expenses.forEach(e => {
      if (!e.date) return;
      const d = new Date(e.date);
      if (d.getFullYear() === curYear) {
        data[d.getMonth()].fuelCost += Number(e.fuel_cost) || 0;
        data[d.getMonth()].expenses += (Number(e.fuel_cost) || 0) + (Number(e.misc_expense) || 0);
        data[d.getMonth()].liters += Number(e.fuel_liters) || 0;
      }
    });

    maintenanceLogs.forEach(m => {
      if (!m.completed_date) return;
      const d = new Date(m.completed_date);
      if (d.getFullYear() === curYear) {
        data[d.getMonth()].maintenance += Number(m.cost) || 0;
        data[d.getMonth()].expenses += Number(m.cost) || 0;
      }
    });

    trips.forEach(t => {
      const d = t.created_at ? new Date(t.created_at) : new Date();
      if (d.getFullYear() === curYear) {
        data[d.getMonth()].revenue += Number(t.revenue) || 0;
        data[d.getMonth()].km += Number(t.distance_km) || 0;
      }
    });

    data.forEach(d => {
      d.netProfit = d.revenue - d.expenses;
      d.efficiency = d.liters > 0 ? Number((d.km / d.liters).toFixed(2)) : 0;
    });

    return data.filter((d, i) => i <= new Date().getMonth() || d.revenue > 0 || d.expenses > 0);
  }, [expenses, maintenanceLogs, trips]);


  // 3. Top 5 Costliest Vehicles
  const topCostliestVehicles = useMemo(() => {
    const costs: Record<string, { plate: string, cost: number }> = {};
    
    vehicles.forEach(v => costs[v.id] = { plate: v.plate_number, cost: 0 });

    expenses.forEach(e => {
      if (e.vehicle_id && costs[e.vehicle_id]) {
        costs[e.vehicle_id].cost += (Number(e.fuel_cost) || 0) + (Number(e.misc_expense) || 0);
      }
    });

    maintenanceLogs.forEach(m => {
      if (m.vehicle_id && costs[m.vehicle_id]) {
        costs[m.vehicle_id].cost += Number(m.cost) || 0;
      }
    });

    return Object.values(costs)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);
  }, [vehicles, expenses, maintenanceLogs]);

  const exportCSV = () => {
    const headers = ["Month", "Revenue (INR)", "Fuel Cost (INR)", "Maintenance (INR)", "Net Profit (INR)"];
    const rows = monthlyData.map(d => [
      d.name, 
      d.revenue.toFixed(2), 
      d.fuelCost.toFixed(2), 
      d.maintenance.toFixed(2), 
      d.netProfit.toFixed(2)
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleetflow_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("FleetFlow Operational Analytics Report", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Current Year: ${new Date().getFullYear()}`, 14, 35);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Key Performance Indicators", 14, 50);
    
    const kpiData = [
      ["Metric", "Value"],
      ["Total Fuel Cost", formatCurrency(kpis.totalFuelCost)],
      ["Total Revenue", formatCurrency(kpis.totalRevenue)],
      ["Fleet ROI", `${kpis.fleetRoi.toFixed(2)}%`],
      ["Utilization Rate", `${kpis.utilizationRate.toFixed(2)}%`]
    ];

    autoTable(doc, {
      startY: 55,
      head: [kpiData[0]],
      body: kpiData.slice(1),
      theme: 'grid',
      headStyles: { textColor: [255, 255, 255], fillColor: [17, 17, 17] }
    });

    doc.text("Monthly Financial Summary", 14, (doc as any).lastAutoTable.finalY + 15);
    
    const tableData = monthlyData.map(d => [
      d.name,
      formatCurrency(d.revenue),
      formatCurrency(d.fuelCost),
      formatCurrency(d.maintenance),
      formatCurrency(d.netProfit)
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Month", "Revenue", "Fuel Cost", "Maintenance", "Net Profit"]],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [17, 17, 17] }
    });

    doc.save(`fleetflow_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹ ${(val / 1000).toFixed(1)}k`;
    return `₹ ${val.toFixed(0)}`;
  };

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1'];

  return (
    <div ref={reportRef}>
      <div className={styles.filterBar}>
        <div className={styles.headerTitle}>Command Center Analytics</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={styles.primaryBtn} onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} /> Export CSV
          </button>
          <button className={`${styles.primaryBtn}`} onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ef4444' }}>
            <FileText size={14} /> Export PDF
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* KPI Row */}
        <div className={styles.analyticsKpiGrid}>
          <div className={`${styles.analyticsKpiCard} ${styles['border-green']}`}>
            <div>
              <div className={styles.kpiTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={16} color="#16a34a" /> Total Fuel Cost
              </div>
              <div className={styles.kpiValue} style={{ color: '#16a34a', marginTop: '8px' }}>
                {formatCurrency(kpis.totalFuelCost)}
              </div>
            </div>
          </div>
          
          <div className={`${styles.analyticsKpiCard} ${styles['border-blue']}`}>
            <div>
              <div className={styles.kpiTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} color="#0284c7" /> Fleet ROI
              </div>
              <div className={styles.kpiValue} style={{ color: '#0284c7', marginTop: '8px' }}>
                {kpis.fleetRoi.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className={`${styles.analyticsKpiCard} ${styles['border-purple']}`}>
            <div>
              <div className={styles.kpiTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={16} color="#9333ea" /> Utilization Rate
              </div>
              <div className={styles.kpiValue} style={{ color: '#9333ea', marginTop: '8px' }}>
                {kpis.utilizationRate.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className={styles.chartsGrid}>
          {/* Fuel Efficiency Trend */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Fuel Efficiency Trend (km/L)</h3>
            <div className={styles.chartArea}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorEff)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 5 Costliest Vehicles */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Top 5 Costliest Vehicles (INR)</h3>
            <div className={styles.chartArea}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCostliestVehicles} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="plate" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fontWeight: 600}} 
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    formatter={(value) => `₹${Number(value).toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={25}>
                    {topCostliestVehicles.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Financial Summary Table */}
        <div className={styles.tableSection} style={{ marginTop: "2rem" }}>
          <div className={styles.tableHeader}>
            <span className={styles.tableTitle}>Monthly Financial Summary ({new Date().getFullYear()})</span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Fuel Cost</th>
                <th>Maintenance</th>
                <th>Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((d) => (
                <tr key={d.name}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td style={{ color: '#16a34a', fontWeight: 500 }}>{formatCurrency(d.revenue)}</td>
                  <td style={{ color: '#ef4444' }}>{formatCurrency(d.fuelCost)}</td>
                  <td style={{ color: '#ef4444' }}>{formatCurrency(d.maintenance)}</td>
                  <td style={{ fontWeight: 700, color: d.netProfit >= 0 ? '#16a34a' : '#ef4444' }}>
                    {formatCurrency(Math.abs(d.netProfit))}
                    {d.netProfit < 0 ? ' (Loss)' : ''}
                  </td>
                </tr>
              ))}
              {monthlyData.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#a1a1aa", padding: "3rem" }}>
                    No financial data available for the current year.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
