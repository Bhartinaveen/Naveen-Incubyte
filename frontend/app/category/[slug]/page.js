'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Correct import for App Router
import Link from 'next/link';
import styles from '../../page.module.css'; // Reusing existing styles
import { getSweets, API_URL } from '../../../utils/api';
import NotificationBell from '../../../components/NotificationBell';
import { useCart } from '../../../context/CartContext';

export default function CategoryPage() {
    const params = useParams();
    const { slug } = params;
    const decodedCategory = decodeURIComponent(slug);
    const [sweets, setSweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { addToCart, count } = useCart();

    useEffect(() => {
        const fetchCategorySweets = async () => {
            setLoading(true);
            try {
                // Fetch only for this category
                const url = `${API_URL}/sweets/search?category=${encodeURIComponent(decodedCategory)}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                console.log('Category Page Sweets Data:', data);
                if (data.length > 0) {
                    console.log('First Sweet Debug:', {
                        name: data[0].name,
                        price: data[0].price,
                        originalPrice: data[0].originalPrice,
                        priceType: typeof data[0].price,
                        originalPriceType: typeof data[0].originalPrice,
                        comparison: data[0].originalPrice > data[0].price
                    });
                }
                setSweets(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategorySweets();
    }, [decodedCategory]);

    return (
        <div className={styles.main}>
            {/* Reuse Navbar styling or structure if possible, or just a simple header for now. 
           Ideally we extracted Navbar to a component, but for now copying structure or relying on layout if global. 
           Wait, there is no global layout navbar mentioned in page.js, it's defined IN page.js. 
           I will add a simple Back button and header.
       */}

            <nav className={styles.nav}>
                <div className={styles.logo}>SweetShop</div>
                <div className={styles.links}>
                    <Link href="/">Home</Link>
                    <Link href="/cart" className={styles.cartLink}>Cart ({count})</Link>
                </div>
            </nav>

            <div className={styles.container} style={{ marginTop: '2rem', padding: '2rem' }}>
                <button onClick={() => router.back()} className={styles.filterBtn} style={{ marginBottom: '2rem' }}>
                    ← Back
                </button>

                <h1 className={styles.rangeTitle}>{decodedCategory} Collection</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : sweets.length > 0 ? (
                    <div className={styles.grid}>
                        {sweets.map(sweet => (
                            <div key={sweet._id} className={styles.card}>
                                <Link href={`/sweets/${sweet._id}`} className={styles.imageLink}>
                                    <img
                                        src={sweet.image || '/placeholder.png'}
                                        alt={sweet.name}
                                        className={styles.cardImage}
                                    />
                                </Link>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.cardTitle}>{sweet.name}</h3>
                                    <span className={styles.category}>{sweet.category}</span>
                                    <div className={styles.priceRow} style={{ alignItems: 'baseline' }}>
                                        <span className={styles.price}>₹{sweet.price}</span>
                                        {sweet.originalPrice > sweet.price && (
                                            <>
                                                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem', marginLeft: '0.5rem' }}>₹{sweet.originalPrice}</span>
                                                <span style={{ color: '#22c55e', fontSize: '0.9rem', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                                                    ({Math.round(((sweet.originalPrice - sweet.price) / sweet.originalPrice) * 100)}% OFF)
                                                </span>
                                            </>
                                        )}
                                        {sweet.quantity <= 5 && sweet.quantity > 0 && <span className={styles.lowStock} style={{ fontSize: '0.8rem', color: '#ef4444', marginLeft: 'auto' }}>Only {sweet.quantity} left!</span>}
                                    </div>

                                    <div className={styles.ratingRow} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', margin: '0.5rem 0' }}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <span key={i} style={{ color: i < Math.round(sweet.averageRating || 0) ? '#fbbf24' : '#e5e7eb', fontSize: '1.2rem' }}>★</span>
                                        ))}
                                        <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem' }}>({sweet.reviewCount || 0})</span>
                                    </div>

                                    <button
                                        onClick={() => addToCart(sweet)}
                                        className={styles.buyBtn}
                                        disabled={sweet.quantity <= 0}
                                    >
                                        {sweet.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <h2>No items found in {decodedCategory}</h2>
                        <p>Check back later!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
