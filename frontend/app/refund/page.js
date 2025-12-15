import styles from '../legal.module.css';

export default function RefundPolicy() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Refund & Cancellation</h1>

            <div className={styles.section}>
                <h2 className={styles.heading}>Cancellation Policy</h2>
                <p className={styles.text}>
                    We understand that plans change. You can cancel your order within <strong>2 hours</strong> of placing it for a full refund.
                    After this period, the order may have already been processed or dispatched.
                </p>
                <p className={styles.text}>
                    To cancel an order, please visit your Orders page or contact our support team immediately.
                </p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.heading}>Returns</h2>
                <p className={styles.text}>
                    Due to the perishable nature of our products (sweets and bakery items), we generally do not accept returns.
                    However, your satisfaction is our priority.
                </p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.heading}>Refunds</h2>
                <p className={styles.text}>
                    You ARE eligible for a refund if:
                </p>
                <ul className={styles.list}>
                    <li>The product arrived damaged or spoiled.</li>
                    <li>You received the wrong item.</li>
                    <li>The package was lost in transit.</li>
                </ul>
                <p className={styles.text}>
                    Please contact us within 24 hours of delivery with photos of the issue. Refunds will be processed to your original payment method within 5-7 business days.
                </p>
            </div>

            <div className={styles.updated}>Last updated: December 14, 2025</div>
        </div>
    );
}
