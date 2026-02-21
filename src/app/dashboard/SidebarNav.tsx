"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./dashboard.module.css";

type SidebarNavProps = {
  role: string;
};

export default function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();

  const isDispatcher = role?.toLowerCase() === "dispatcher";
  const isAnalyst = role?.toLowerCase() === "financial analyst";
  const isSafetyOfficer = role?.toLowerCase() === "safety officer";

  return (
    <nav className={styles.nav}>
      <Link 
        href="/dashboard" 
        className={`${styles.navItem} ${pathname === "/dashboard" ? styles.active : ""}`}
      >
        Command Center
      </Link>

      {isSafetyOfficer ? (
        <Link 
          href="/dashboard/drivers" 
          className={`${styles.navItem} ${pathname.includes("/dashboard/drivers") ? styles.active : ""}`}
        >
          Driver Profiles
        </Link>
      ) : isDispatcher ? (
        <Link 
          href="/dashboard/trips" 
          className={`${styles.navItem} ${pathname.includes("/dashboard/trips") ? styles.active : ""}`}
        >
          Trip Dispatcher
        </Link>
      ) : isAnalyst ? (
        <>
          <Link 
            href="/dashboard/expenses" 
            className={`${styles.navItem} ${pathname.includes("/dashboard/expenses") ? styles.active : ""}`}
          >
            Expense & Fuel Logging
          </Link>
          <Link 
            href="/dashboard/analytics" 
            className={`${styles.navItem} ${pathname.includes("/dashboard/analytics") ? styles.active : ""}`}
          >
            Analytics & Reports
          </Link>
        </>
      ) : (
        <>
          <Link 
            href="/dashboard/vehicles" 
            className={`${styles.navItem} ${pathname.includes("/dashboard/vehicles") ? styles.active : ""}`}
          >
            Vehicle Registry
          </Link>
          <Link 
            href="/dashboard/maintenance" 
            className={`${styles.navItem} ${pathname.includes("/dashboard/maintenance") ? styles.active : ""}`}
          >
            Maintenance & Service Logs
          </Link>
        </>
      )}
    </nav>
  );
}
