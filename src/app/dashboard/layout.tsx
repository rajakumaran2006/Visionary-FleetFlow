import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import styles from "./dashboard.module.css";
import SidebarNav from "./SidebarNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Verify Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Fetch local user role
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  let displayName = profile?.full_name || user.user_metadata?.full_name;
  if (!displayName) {
    // Fallback: If no name is provided, take the username from the email (e.g. "raja" from "raja@gmail.com")
    displayName = user.email ? user.email.split("@")[0] : "Fleet Member";
  }

  const displayRole = profile?.role || user.user_metadata?.role || "Fleet Manager";

  const handleLogout = async () => {
    "use server";
    const sb = await createClient();
    await sb.auth.signOut();
    redirect("/login");
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}></div>
          FleetFlow
        </div>
        
        <SidebarNav role={displayRole} />

        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userRole}>{displayRole}</span>
          </div>
        </div>
        
        <form action={handleLogout}>
          <button type="submit" className={styles.logoutBtn}>
            Sign Out
          </button>
        </form>
      </aside>

      {/* Main Container */}
      <main className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.headerTitle}>Command Center</span>
          </div>
          
          <div className={styles.topbarActions}>
            <div className={styles.topbarFilters}>
              <input 
                type="text" 
                placeholder="Search vehicles, trips..." 
                className={styles.searchBar} 
              />
            </div>
             {/* Actions moved to table header */}
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
