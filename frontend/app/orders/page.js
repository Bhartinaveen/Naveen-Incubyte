'use client';
import { useEffect, useState } from 'react';
import { getMyOrders } from '../../utils/api';
import styles from './orders.module.css';

export default function MyOrders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getMyOrders();
                if (Array.isArray(data)) setOrders(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className={styles.container}>
            <h1>My Orders</h1>
            {orders.length === 0 ? <p>No orders found.</p> : (
                <div className={styles.list}>
                    {orders.map(order => (
                        <div key={order._id} className={styles.card}>
                            <div className={styles.header}>
                                <span>Order #{order._id.slice(-6)}</span>
                                <span className={`${styles.status} ${styles[order.status]}`}>{order.status}</span>
                            </div>
                            <div className={styles.items}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className={styles.item}>
                                        {item.name} x {item.quantity} - ₹{item.priceAtPurchase * item.quantity}
                                    </div>
                                ))}
                            </div>
                            <div className={styles.footer}>
                                <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                                <span className={styles.total}>Total: ₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
