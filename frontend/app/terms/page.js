import styles from '../legal.module.css';

export default function TermsAndConditions() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Terms and Conditions</h1>

            <div className={styles.section}>
                <h2 className={styles.heading}>1. Introduction</h2>
                <p className={styles.text}>
                    Welcome to Sweet Shop! These Terms and Conditions outline the rules and regulations for the use of our website and the purchase of our products. By accessing this website we assume you accept these terms and conditions.
                </p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.heading}>2. Ordering and Payments</h2>
                <p className={styles.text}>
                    When you place an order with us, you are agreeing to purchase the items at the price stated. All prices are in Indian Rupees (₹) and are inclusive of applicable taxes.
                </p>
                <ul className={styles.list}>
                    <li>Orders are subject to availability.</li>
                    <li>We reserve the right to refuse any order.</li>
                    <li>Payment must be made in full before shipment.</li>
                </ul>
            </div>

            <div className={styles.section}>
                <h2 className={styles.heading}>3. Shipping and Delivery</h2>
                <p className={styles.text}>
                    We aim to deliver your sweets fresh and on time. Delivery times are estimates and start from the date of shipping, rather than the date of order.
                </p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.heading}>4. User Conduct</h2>
                <p className={styles.text}>
                    You agree not to use our website for any unlawful purpose or in any way that interrupts or damages our services.
                </p>
            </div>

            <div className={styles.updated}>Last updated: December 14, 2025</div>
        </div>
    );
}
