'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSweetById, getReviews, addReview } from '../../../utils/api';
import { useCart } from '../../../context/CartContext';
import Link from 'next/link';
import styles from './details.module.css';

export default function SweetDetails() {
    const { id } = useParams(); // Use useParams for App Router
    const [sweet, setSweet] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const { addToCart } = useCart();

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        const sweetData = await getSweetById(id);
        setSweet(sweetData);
        const reviewData = await getReviews(id);
        setReviews(reviewData);
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        try {
            const res = await addReview(id, rating, comment);
            if (res._id) {
                setComment('');
                setRating(5);
                fetchData(); // Refresh reviews
            } else {
                alert('Failed to add review (Login required)');
            }
        } catch (err) {
            alert('Error adding review');
        }
    };

    if (!sweet) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backBtn} aria-label="Back to Home">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
            </Link>
            <div className={styles.product}>
                <div className={styles.imageWrapper}>
                    {/* Placeholder image logic */}
                    <img
                        src={sweet.image || `https://via.placeholder.com/400?text=${encodeURIComponent(sweet.name)}`}
                        alt={sweet.name}
                        className={styles.image}
                    />
                </div>
                <div className={styles.info}>
                    <h1>{sweet.name}</h1>
                    <p className={styles.category}>{sweet.category}</p>
                    <p className={styles.price}>₹{sweet.price}</p>
                    <p className={styles.description}>{sweet.description || 'No description available.'}</p>
                    <p className={styles.stock}>Stock: {sweet.quantity}</p>
                    <button
                        onClick={() => addToCart(sweet)}
                        disabled={sweet.quantity <= 0}
                        className={styles.buyBtn}
                    >
                        {sweet.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    {sweet.expiryDate && <p className={styles.expiry}>Expiry: {new Date(sweet.expiryDate).toLocaleDateString()}</p>}
                </div>
            </div>

            <div className={styles.reviews}>
                <h2>Customer Reviews</h2>

                <form onSubmit={handleAddReview} className={styles.reviewForm}>
                    <h3>Write a Review</h3>
                    <div className={styles.formGroup}>
                        <label>Rating:</label>
                        <select value={rating} onChange={e => setRating(Number(e.target.value))}>
                            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                        </select>
                    </div>
                    <textarea
                        placeholder="Share your thoughts..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        required
                    />
                    <button type="submit">Submit Review</button>
                </form>

                <div className={styles.reviewList}>
                    {reviews.map(review => (
                        <div key={review._id} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <span className={styles.username}>{review.username}</span>
                                <span className={styles.rating}>{'★'.repeat(review.rating)}</span>
                            </div>
                            <p className={styles.comment}>{review.comment}</p>
                            <span className={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                    ))}
                    {reviews.length === 0 && <p className={styles.noReviews}>No reviews yet. Be the first!</p>}
                </div>
            </div>
        </div>
    );
}
