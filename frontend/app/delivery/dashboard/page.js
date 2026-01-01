'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDeliveryPartnerMe } from '../../../utils/api';
import styles from './dashboard.module.css';

export default function PartnerDashboard() {
    const router = useRouter();
    const [partner, setPartner] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || role !== 'partner') {
            router.push('/');
            return;
        }

        fetchData();
    }, [router]);

    const fetchData = async () => {
        try {
            const data = await getDeliveryPartnerMe();
            if (data.partner) {
                setPartner(data.partner);
                setOrders(data.orders || []);
            } else {
                // If auth fails despite token existence (e.g. invalid)
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                router.push('/');
            }
        } catch (err) {
            console.error("Dashboard error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user'); // Just in case
        router.push('/');
    };

    if (loading) return <div className={styles.loading}>Loading Dashboard...</div>;
    if (!partner) return null;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>Sweet Delivery</div>
                <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
            </header>

            <div className={styles.content}>
                <div className={styles.profileCard}>
                    <div className={styles.profileHeader}>
                        <div className={styles.avatar}>
                            {partner.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2>{partner.name}</h2>
                            <span className={styles.idBadge}>{partner.uniqueId}</span>
                        </div>
                    </div>
                    <div className={styles.details}>
                        <p><strong>Mobile:</strong> {partner.mobile}</p>
                        <p><strong>Status:</strong> <span className={styles.activeStatus}>{partner.status}</span></p>
                        <p><strong>Joined:</strong> {new Date(partner.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className={styles.ordersSection}>
                    <h3>Assigned Orders (Pending Acceptance)</h3>
                    {orders.filter(o => o.status === 'assigned').length === 0 ? (
                        <p className={styles.noOrders}>No new requests.</p>
                    ) : (
                        <div className={styles.grid}>
                            {orders.filter(o => o.status === 'assigned').map(order => (
                                <div key={order._id} className={`${styles.orderCard} ${styles.requestCard}`}>
                                    <div className={styles.orderHeader}>
                                        <span className={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</span>
                                        <span className={styles.newBadge}>NEW REQUEST</span>
                                    </div>
                                    <div className={styles.customerInfo}>
                                        <h4>Pickup For</h4>
                                        <p>{order.user?.username}</p>
                                        <p className={styles.address}>{order.user?.address}</p>
                                    </div>
                                    <button
                                        className={styles.acceptBtn}
                                        onClick={async () => {
                                            try {
                                                const { acceptOrder } = require('../../../utils/api');
                                                await acceptOrder(order._id);
                                                alert('Order Accepted!');
                                                fetchData(); // Refresh list
                                            } catch (err) {
                                                alert('Failed to accept');
                                            }
                                        }}
                                    >
                                        Accept Delivery
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.ordersSection}>
                    <h3>Active Deliveries ({orders.filter(o => o.status === 'shipped').length})</h3>

                    {orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length === 0 ? (
                        <p className={styles.noOrders}>No active deliveries.</p>
                    ) : (
                        <div className={styles.grid}>
                            {orders.filter(o => o.status === 'shipped' || o.status === 'delivered').map(order => (
                                <div key={order._id} className={styles.orderCard}>
                                    <div className={styles.orderHeader}>
                                        <span className={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</span>
                                        <span className={`${styles.status} ${styles[order.status]}`}>{order.status}</span>
                                    </div>
                                    <div className={styles.customerInfo}>
                                        <h4>Customer</h4>
                                        <p>{order.user?.username}</p>
                                        <p>{order.user?.mobile}</p>
                                        <p className={styles.address}>{order.user?.address}</p>
                                    </div>
                                    <div className={styles.orderItems}>
                                        <h4>Items</h4>
                                        <ul>
                                            {order.items.map((item, idx) => (
                                                <li key={idx}>
                                                    {item.quantity} x {item.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className={styles.totalRow}>
                                        <span>Total:</span>
                                        <span className={styles.amount}>₹{order.totalAmount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
