'use client';

import Link from "next/link";
import styles from "./page.module.css";
import dynamic from "next/dynamic";

const FleetScene = dynamic(() => import("./components/FleetScene"), {
  ssr: false,
  loading: () => (
    <div className={styles.sceneLoader}>
      <div className={styles.loaderPulse} />
    </div>
  ),
});

// SVG Icons
const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 9H12" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.arrowIcon}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const RouteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
    <circle cx="18" cy="5" r="3" />
  </svg>
);

export default function Home() {
  return (
    <div className={styles.landingLayout}>
      {/* Background effects */}
      <div className={styles.bgGrid} />
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />

      {/* Navbar */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navLogo}>
          <div className={styles.logoIcon}>
            <div className={styles.logoTriangle} />
          </div>
          <span>FleetFlow</span>
        </Link>
        <div className={styles.navActions}>
          <Link href="/login" className={styles.navLink}>
            Log In
          </Link>
          <Link href="/register" className={styles.navButton}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main split content */}
      <main className={styles.mainContent}>
        {/* Left side - Hero text */}
        <div className={styles.leftPanel}>
          <div className={styles.badge}>
            <ActivityIcon />
            <span>Next-Gen Fleet Management</span>
          </div>

          <h1 className={styles.title}>
            Welcome to
            <br />
            <span className={styles.titleAccent}>FLEET FLOW</span>
          </h1>

          <p className={styles.description}>
            Real-time vehicle tracking, intelligent maintenance scheduling, and
            powerful analytics — all in one dashboard built for modern fleet
            managers.
          </p>

          <div className={styles.ctaGroup}>
            <Link href="/register" className={styles.primaryButton}>
              Get Started
              <ArrowRightIcon />
            </Link>
            <Link href="/login" className={styles.secondaryButton}>
              Log in
            </Link>
          </div>

          {/* Feature pills */}
          <div className={styles.featurePills}>
            <div className={styles.pill}>
              <MapPinIcon />
              <span>Live Tracking</span>
            </div>
            <div className={styles.pill}>
              <TruckIcon />
              <span>Fleet Analytics</span>
            </div>
            <div className={styles.pill}>
              <RouteIcon />
              <span>Route Planning</span>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Fleet Managers</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>17k+</span>
              <span className={styles.statLabel}>Vehicles Tracked</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>99.9%</span>
              <span className={styles.statLabel}>Uptime</span>
            </div>
          </div>
        </div>

        {/* Right side - 3D Scene */}
        <div className={styles.rightPanel}>
          <div className={styles.sceneContainer}>
            <FleetScene />
          </div>

          {/* Floating info cards with SVG icons */}
          <div className={`${styles.floatingCard} ${styles.card1}`}>
            <div className={styles.cardIconWrap}>
              <MapPinIcon />
            </div>
            <div>
              <div className={styles.cardLabel}>Live Tracking</div>
              <div className={styles.cardValue}>23 vehicles en route</div>
            </div>
          </div>
          <div className={`${styles.floatingCard} ${styles.card2}`}>
            <div className={styles.cardIconWrap}>
              <ShieldCheckIcon />
            </div>
            <div>
              <div className={styles.cardLabel}>Fleet Status</div>
              <div className={styles.cardValue}>98% operational</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
