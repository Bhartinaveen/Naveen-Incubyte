'use client';
import { useState, useRef, useEffect } from 'react';
import styles from './NotificationBell.module.css';

export default function NotificationBell({ notifications = [], unreadCount = 0, onMarkRead, className = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={`${styles.container} ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.notifBtn}
                aria-label="Notifications"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className={styles.badge}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>Notifications</div>
                    {notifications.length === 0 ? (
                        <div className={styles.emptyState}>No notifications</div>
                    ) : (
                        notifications.map(n => (
                            <div key={n._id} className={`${styles.dropdownItem} ${!n.isRead ? styles.unread : ''}`}>
                                <span className={`${styles.message} ${!n.isRead ? styles.bold : ''}`}>{n.message}</span>
                                <span className={styles.time}>
                                    {new Date(n.createdAt).toLocaleString()}
                                </span>
                                {!n.isRead && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent closing dropdown
                                            onMarkRead(n._id);
                                        }}
                                        className={styles.markReadBtn}
                                    >
                                        Mark as Read
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
