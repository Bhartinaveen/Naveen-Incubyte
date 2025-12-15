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
        if (role !== 'admin') {
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
                <nav>
                    <Link href="/admin/inventory">Inventory</Link>
                    <li><a href="/admin/orders" className={styles.link}>Orders</a></li>
                    <li><a href="/admin/analytics" className={styles.link}>Analytics</a></li>
                    <li><a href="/" className={styles.link}>Back to Store</a></li>
                </nav>
            </aside>
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}
