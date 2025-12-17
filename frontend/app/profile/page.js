'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './profile.module.css';
import { updateProfile } from '../../utils/api';


export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        address: '',
        profileImage: ''
    });
    const fileInputRef = useRef(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token) {
            router.push('/login');
            return;
        }

        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setFormData({
                    fullName: parsedUser.fullName || '',
                    email: parsedUser.email || '',
                    mobile: parsedUser.mobile || '',
                    email: parsedUser.email || '',
                    mobile: parsedUser.mobile || '',
                    address: parsedUser.address || '',
                    profileImage: parsedUser.profileImage || ''
                });
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
        setLoading(false);
    }, [router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit check (backend allows 50MB but good to be sane)
                alert("Image too large. Please choose an image under 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profileImage: reader.result }); // Base64
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const updatedUser = await updateProfile(formData);

            // Update local storage and state
            const storeUser = { ...user, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(storeUser));
            setUser(storeUser);
            setMessage('Profile updated successfully!');

            window.dispatchEvent(new Event('storage'));
        } catch (err) {
            console.error("Profile update error:", err);
            setMessage(err.message || 'Failed to update profile.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '5rem' }}>Loading profile...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/" className={styles.backBtn} aria-label="Back to Home">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </Link>
                <div className={styles.avatar} onClick={() => fileInputRef.current.click()} title="Click to upload image">
                    {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" className={styles.avatarImage} />
                    ) : (
                        user?.username ? user.username[0].toUpperCase() : 'U'
                    )}
                    <div className={styles.uploadOverlay}>📷</div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    hidden
                />
                <h1 className={styles.welcome}>{user?.username}</h1>
            </div>

            {message && <div className={styles.successMsg}>{message}</div>}

            <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Enter your full name"
                    />
                </div>


                <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Enter your email"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Mobile Number</label>
                    <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Enter your mobile number"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Address</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Enter your address"
                        rows="3"
                        style={{ resize: 'vertical' }}
                    />
                </div>

                <button type="submit" className={styles.saveBtn}>Save Changes</button>
                <button type="button" onClick={handleLogout} className={styles.logoutBtn}>Log Out</button>
            </form>
        </div>
    );
}
