'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDeliveryPartners, addDeliveryPartner, terminateDeliveryPartner, updateOrderStatus } from '../../../utils/api';
import styles from './delivery.module.css';

export default function DeliveryPartnersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const assignOrderId = searchParams.get('assignToOrder');

    const [partners, setPartners] = useState([]);
    const [count, setCount] = useState(0);
    const [newName, setNewName] = useState('');
    const [newMobile, setNewMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Pagination Logic
    const indexOfLastPartner = currentPage * itemsPerPage;
    const indexOfFirstPartner = indexOfLastPartner - itemsPerPage;
    const currentPartners = partners.slice(indexOfFirstPartner, indexOfLastPartner);
    const totalPages = Math.ceil(partners.length / itemsPerPage);

    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const data = await getDeliveryPartners();
            if (data?.partners) {
                setPartners(data.partners);
                setCount(data.count);
            }
        } catch (err) {
            console.error("Failed to fetch partners", err);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!newName || !newMobile) return;

        setLoading(true);
        try {
            const res = await addDeliveryPartner(newName, newMobile);
            if (res.uniqueId) {
                setMessage(`Partner Added! Unique ID: ${res.uniqueId}`);
                setNewName('');
                setNewMobile('');
                fetchPartners();
            } else {
                setMessage('Failed to add partner.');
            }
        } catch (err) {
            setMessage('Error adding partner.');
        } finally {
            setLoading(false);
        }
    };

    const handleTerminate = async (id) => {
        if (!confirm('Are you sure you want to terminate this partner? They will no longer be able to log in.')) return;

        try {
            await terminateDeliveryPartner(id);
            fetchPartners();
        } catch (err) {
            alert('Failed to terminate');
        }
    };

    const handleAssignOrder = async (partnerId) => {
        if (!assignOrderId) return;
        if (!confirm('Assign Order #' + assignOrderId + ' to this partner?')) return;

        try {
            // Update order status to 'assigned' with this partner
            const res = await updateOrderStatus(assignOrderId, 'assigned', partnerId);
            if (res && res._id) {
                alert('Order Assigned Successfully!');
                router.push('/admin/orders');
            } else {
                alert('Failed to assign order.');
            }
        } catch (err) {
            console.error(err);
            alert('Error assigning order.');
        }
    };

    return (
        <div className={styles.container}>
            <h1>Delivery Partners Management</h1>

            {assignOrderId && (
                <div className={styles.assignBanner}>
                    <p>Assigning Partner for Order <strong>#{assignOrderId}</strong></p>
                    <button onClick={() => router.push('/admin/orders')} className={styles.cancelAssignBtn}>Cancel Assignment</button>
                </div>
            )}

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <h3>Total Partners Issued</h3>
                    <p className={styles.statNumber}>{count}</p>
                </div>
            </div>

            <div className={styles.section}>
                <h2>Issue New ID</h2>
                <form onSubmit={handleAdd} className={styles.form}>
                    <input
                        type="text"
                        placeholder="Partner Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        className={styles.input}
                    />
                    <input
                        type="text"
                        placeholder="Mobile Number"
                        value={newMobile}
                        onChange={(e) => setNewMobile(e.target.value)}
                        required
                        className={styles.input}
                    />
                    <button type="submit" disabled={loading} className={styles.btn}>
                        {loading ? 'Generating...' : 'Generate Unique ID'}
                    </button>
                </form>
                {message && <p className={styles.message}>{message}</p>}
            </div>

            <div className={styles.section}>
                <h2>Registered Partners</h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Unique ID</th>
                                <th>Mobile</th>
                                <th>Status</th>
                                <th>Joined Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPartners.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center' }}>No partners found.</td>
                                </tr>
                            ) : currentPartners.map(partner => (
                                <tr key={partner._id} className={partner.status === 'terminated' ? styles.terminated : ''}>
                                    <td>{partner.name}</td>
                                    <td><span className={styles.badge}>{partner.uniqueId}</span></td>
                                    <td>{partner.mobile}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[partner.status]}`}>
                                            {partner.status}
                                        </span>
                                    </td>
                                    <td>{new Date(partner.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {assignOrderId ? (
                                            partner.status === 'active' && (
                                                <button
                                                    onClick={() => handleAssignOrder(partner._id)}
                                                    className={styles.assignBtn}
                                                >
                                                    Assign Order
                                                </button>
                                            )
                                        ) : (
                                            partner.status === 'active' && (
                                                <button
                                                    onClick={() => handleTerminate(partner._id)}
                                                    className={styles.terminateBtn}
                                                >
                                                    Terminate
                                                </button>
                                            )
                                        )}
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
        </div>
    );
}
