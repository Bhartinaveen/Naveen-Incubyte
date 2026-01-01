'use client';
import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../../utils/api';
import styles from './adminOrders.module.css';
import { useRouter } from 'next/navigation';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

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
        if (status === 'shipped') {
            const order = orders.find(o => o._id === id);
            if (!order.deliveryPartner) {
                // Redirect to assignment page
                router.push(`/admin/delivery-partners?assignToOrder=${id}`);
                return;
            }
        }

        await confirmStatusUpdate(id, status);
    };

    const confirmStatusUpdate = async (id, status, partnerId = null) => {
        const res = await updateOrderStatus(id, status, partnerId);
        if (res._id) {
            setOrders(prev => prev.map(o => o._id === id ? { ...o, status: res.status } : o));
        }
    };

    // Pagination Logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className={styles.container}>
            <h1>Admin: Order Management</h1>
            <div className={styles.tableWrapper}>
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
                        {currentOrders.map(order => (
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
                                        <option value="assigned" disabled>Assigned (Waiting)</option>
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

            {/* Pagination Controls */}
            <div className={styles.pagination}>
                <button onClick={prevPage} disabled={currentPage === 1} className={styles.pageBtn}>
                    Previous
                </button>
                <span className={styles.pageInfo}>
                    Page {currentPage} of {totalPages > 0 ? totalPages : 1}
                </span>
                <button onClick={nextPage} disabled={currentPage >= totalPages} className={styles.pageBtn}>
                    Next
                </button>
            </div>
        </div>
    );
}
