'use client';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './cart.module.css';

export default function Cart() {
    const { cart, removeFromCart, clearCart, total } = useCart();
    const router = useRouter();

    const handleCheckout = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to checkout');
            router.push('/login');
            return;
        }

        try {
            const items = cart.map(item => ({ sweetId: item._id, quantity: item.quantity }));
            const res = await createOrder(items);
            if (res._id) {
                alert('Order placed successfully!');
                clearCart();
                router.push('/orders');
            } else {
                console.error('Checkout failed:', res);
                alert(res.message || 'Checkout failed. Check console for details.');
            }
        } catch (err) {
            alert('Error during checkout');
        }
    };

    if (cart.length === 0) {
        return (
            <div className={styles.empty}>
                <h1>Your cart is empty</h1>
                <Link href="/">Go Shopping</Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1>Your Cart</h1>
            <div className={styles.items}>
                {cart.map(item => (
                    <div key={item._id} className={styles.item}>
                        <div className={styles.details}>
                            <h3>{item.name}</h3>
                            <p>₹{item.price} x {item.quantity}</p>
                        </div>
                        <div className={styles.actions}>
                            <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromCart(item._id)}>Remove</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.summary}>
                <h2>Total: ₹{total.toFixed(2)}</h2>
                <div className={styles.btns}>
                    <button onClick={clearCart} className={styles.clear}>Clear Cart</button>
                    <button onClick={handleCheckout} className={styles.checkout}>Checkout</button>
                </div>
            </div>
        </div>
    );
}
