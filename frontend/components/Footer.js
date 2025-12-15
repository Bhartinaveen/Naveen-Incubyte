import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Brand Section */}
                <div className={styles.section}>
                    <h3>Sweet Shop</h3>
                    <p>
                        Indulge in the finest selection of handcrafted sweets and treats.
                        Making life sweeter, one bite at a time.
                    </p>
                    <div className={styles.socialLinks}>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="Twitter">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                            </svg>
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} title="YouTube">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className={styles.section}>
                    <h3>Quick Links</h3>
                    <ul className={styles.linksList}>
                        <li><Link href="/" className={styles.link}>Home</Link></li>
                        <li><Link href="/cart" className={styles.link}>My Cart</Link></li>
                        <li><Link href="/orders" className={styles.link}>Orders</Link></li>
                        <li><Link href="/login" className={styles.link}>Login</Link></li>
                    </ul>
                </div>

                {/* Legal Links */}
                <div className={styles.section}>
                    <h3>Policy</h3>
                    <ul className={styles.linksList}>
                        <li><Link href="/terms" className={styles.link}>Terms & Conditions</Link></li>
                        <li><Link href="/refund" className={styles.link}>Refund Policy</Link></li>
                        <li><Link href="/contact" className={styles.link}>Contact Us</Link></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className={styles.section}>
                    <h3>Contact Us</h3>
                    <ul className={styles.linksList}>
                        <li style={{ color: '#9ca3af' }}>123 Candy Lane, Sweet City</li>
                        <li><a href="mailto:hello@sweetshop.com" className={styles.link}>hello@sweetshop.com</a></li>
                        <li style={{ color: '#9ca3af' }}>+1 (555) 123-4567</li>
                    </ul>
                </div>
            </div>

            <div className={styles.copyright}>
                &copy; {new Date().getFullYear()} Sweet Shop. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
