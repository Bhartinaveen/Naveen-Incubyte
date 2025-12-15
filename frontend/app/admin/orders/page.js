'use client';
import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../../utils/api';
import styles from './adminOrders.module.css';
import { useRouter } from 'next/navigation';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getAllOrders();
                if (data.message === 'Admin access required') {
                    alert('Access Denied');
                    router.push('/');
                } else if (Array.isArray(data)) {
                    setOrders(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        const res = await updateOrderStatus(id, status);
        if (res._id) {
            setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
        }
    };

    return (
        <div className={styles.container}>
            <h1>Admin: Order Management</h1>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>User ID</th>
                        <th>Mobile</th>
                        <th>User</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.user?._id || 'N/A'}</td>
                            <td>{order.user?.mobile || 'N/A'}</td>
                            <td>{order.user?.username || 'Unknown'}</td>
                            <td>₹{order.totalAmount.toFixed(2)}</td>
                            <td>
                                <span className={`${styles.status} ${styles[order.status]}`}>{order.status}</span>
                            </td>
                            <td>
                                <select
                                    className={styles.select}
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
