'use client';
import styles from './contact.module.css';

export default function Contact() {
    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Get in Touch</h1>

            <div className={styles.contentWrapper}>
                {/* Contact Info */}
                <div className={styles.infoCard}>
                    <div className={styles.infoItem}>
                        <div className={styles.icon}>📍</div>
                        <div>
                            <div className={styles.infoTitle}>Visit Us</div>
                            <p className={styles.infoText}>
                                123 Candy Lane<br />
                                Sweet City, SC 12345
                            </p>
                        </div>
                    </div>

                    <div className={styles.infoItem}>
                        <div className={styles.icon}>📞</div>
                        <div>
                            <div className={styles.infoTitle}>Call Us</div>
                            <p className={styles.infoText}>
                                +1 (555) 123-4567<br />
                                Mon-Fri: 9am - 6pm
                            </p>
                        </div>
                    </div>

                    <div className={styles.infoItem}>
                        <div className={styles.icon}>✉️</div>
                        <div>
                            <div className={styles.infoTitle}>Email Us</div>
                            <p className={styles.infoText}>
                                hello@sweetshop.com<br />
                                support@sweetshop.com
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <form className={styles.formCard} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Your Name</label>
                        <input type="text" className={styles.input} required placeholder="John Doe" />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input type="email" className={styles.input} required placeholder="john@example.com" />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Message</label>
                        <textarea className={styles.textarea} required placeholder="How can we make your day sweeter?"></textarea>
                    </div>

                    <button type="submit" className={styles.submitBtn}>Send Message</button>
                </form>
            </div>
        </div>
    );
}
