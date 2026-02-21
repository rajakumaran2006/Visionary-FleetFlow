import Link from "next/link";
import styles from "./auth.module.css";
import React from "react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      {/* Left Pane - Forms */}
      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}></div>
            <span>FleetFlow</span>
          </Link>
          {children}
        </div>
      </div>

      {/* Right Pane - Visuals / Promo */}
      <div className={styles.promoSide}>
        <div className={styles.largeIcon}>
          <div className={styles.triangle}>
            <div className={styles.triangleInner}></div>
          </div>
        </div>
        <div className={styles.promoContent}>
          <div className={styles.promoLogo}>FleetFlow</div>
          <h1 className={styles.promoTitle}>Welcome to FleetFlow</h1>
          <p className={styles.promoDesc}>
            FleetFlow empowers fleet managers and logistics teams with real-time vehicle tracking,
            route optimization, and maintenance scheduling — all in one powerful dashboard.
            <br /><br />
            Trusted by 500+ fleet operators worldwide
          </p>

          <div className={styles.promoCard}>
            <h2 className={styles.promoCardTitle}>Streamline your fleet operations today</h2>
            <p className={styles.promoCardDesc}>
              Monitor vehicles, optimize routes, and reduce costs with our all-in-one fleet management platform.
            </p>
            <div className={styles.avatarGroup}>
              <div className={styles.avatar}></div>
              <div className={styles.avatar}></div>
              <div className={styles.avatar}></div>
              <div className={styles.avatarPlus}>+2</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
