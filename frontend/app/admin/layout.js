'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './adminLayout.module.css';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (!['admin', 'superadmin'].includes(role)) {
            router.push('/login'); // Redirect to login if not admin
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#666'
            }}>
                Verifying Admin Access...
            </div>
        );
    }

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <h2>Admin</h2>
                <ul className={styles.sidebarList}>
                    <li><Link href="/admin/inventory" className={styles.link}>Inventory</Link></li>
                    <li><Link href="/admin/orders" className={styles.link}>Orders</Link></li>
                    {typeof window !== 'undefined' && localStorage.getItem('role') === 'superadmin' && (
                        <li><Link href="/admin/users" className={styles.link}>Users</Link></li>
                    )}
                    <li><Link href="/admin/analytics" className={styles.link}>Analytics</Link></li>
                    <li><Link href="/admin/delivery-partners" className={styles.link}>Delivery Partners</Link></li>
                    <li><Link href="/" className={styles.link}>Back to Store</Link></li>
                </ul>
            </aside>
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}
