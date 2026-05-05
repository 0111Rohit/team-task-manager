'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './AppLayout.module.css';

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className={styles.appContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          Team<span>Task</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}>
            Dashboard
          </Link>
          <Link href="/projects" className={`${styles.navItem} ${pathname.startsWith('/projects') ? styles.active : ''}`}>
            Projects
          </Link>
        </nav>
        <div className={styles.bottomNav}>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
