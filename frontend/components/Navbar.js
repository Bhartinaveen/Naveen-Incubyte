'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';
import NotificationBell from './NotificationBell';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [userData, setUserData] = useState(null);
    const { count } = useCart();

    useEffect(() => {
        // Hydration fix / Client-side only
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        const storedUser = localStorage.getItem('user');

        setToken(storedToken);
        setRole(storedRole);
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.mobileIcons}>
                <button
                    className={styles.hamburger}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <Link href="/" className={styles.logo}>
                    Sweet Shop
                </Link>
            </div>

            <div className={`${styles.links} ${isMobileMenuOpen ? styles.active : ''}`}>
                <Link href="/">Home</Link>
                <Link href="/cart" className={styles.cartLink}>Cart ({count})</Link>
                <Link href="/orders">Orders</Link>
                {token && ['admin', 'superadmin'].includes(role) && <Link href="/admin/inventory" style={{ color: '#d81b60', fontWeight: 'bold' }}>Admin Panel</Link>}

                {token ? (
                    <div className={styles.profileContainer}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className={styles.profileBtn}
                        >
                            <span>{userData?.username || 'Profile'}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>

                        {showDropdown && (
                            <div className={styles.dropdownMenu}>
                                <div className={styles.dropdownHeader}>
                                    <span className={styles.dropdownName}>{userData?.username || 'User'}</span>
                                    <span className={styles.dropdownEmail}>{userData?.email || ''}</span>
                                </div>
                                <Link href="/profile" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                                    My Profile
                                </Link>
                                <div style={{ borderTop: '1px solid #f3f4f6', margin: '0.5rem 0' }}></div>
                                <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutItem}`}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link href="/login">Login</Link>
                        <Link href="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
