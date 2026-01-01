'use client';
import { useEffect, useState } from 'react';
import { addReview } from '../../utils/api';
import Link from 'next/link';
import styles from './orders.module.css';

export default function MyOrders() {
    const [orders, setOrders] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Pagination Logic
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / itemsPerPage);

    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Review State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewSweetId, setReviewSweetId] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const getMyOrders = require('../../utils/api').getMyOrders;
                const data = await getMyOrders();
                if (Array.isArray(data)) setOrders(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchOrders();
    }, []);

    const openReviewModal = (sweetId) => {
        setReviewSweetId(sweetId);
        setRating(5);
        setComment('');
        setMessage('');
        setShowReviewModal(true);
    };

    const submitReview = async () => {
        if (!comment) {
            setMessage('Please write a comment');
            return;
        }
        try {
            await addReview(reviewSweetId, rating, comment);
            setMessage('Review submitted successfully!');
            setTimeout(() => {
                setShowReviewModal(false);
                setMessage('');
            }, 1000);
        } catch (err) {
            setMessage('Failed to submit review');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.topHeader}>
                <h1>My Orders</h1>
                <Link href="/" className={styles.backBtn}>
                    ← Back to Shop
                </Link>
            </div>
            {currentOrders.length === 0 ? <p>No orders found.</p> : (
                <div className={styles.list}>
                    {currentOrders.map(order => (
                        <div key={order._id} className={styles.card}>
                            <div className={styles.header}>
                                <span>Order #{order._id.slice(-6)}</span>
                                <span className={`${styles.status} ${styles[order.status]}`}>{order.status}</span>
                            </div>
                            <div className={styles.items}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className={styles.itemRow}>
                                        <div className={styles.itemInfo}>
                                            {item.name} x {item.quantity} - ₹{item.priceAtPurchase * item.quantity}
                                        </div>
                                        {/* Show Rate button for verified testing */}
                                        <button
                                            className={styles.rateBtn}
                                            onClick={() => openReviewModal(item.sweet)}
                                        >
                                            Rate Product
                                        </button>
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

            {showReviewModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Rate Product</h3>
                        <div className={styles.starRating}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    className={star <= rating ? styles.starFilled : styles.starEmpty}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <textarea
                            className={styles.commentInput}
                            placeholder="Write your review..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        {message && <p className={styles.message}>{message}</p>}
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowReviewModal(false)} className={styles.cancelBtn}>Cancel</button>
                            <button onClick={submitReview} className={styles.submitBtn}>Submit Review</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
