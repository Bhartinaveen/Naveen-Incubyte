'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../../utils/api';
import styles from '../login/login.module.css'; // Reusing login styles

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    // Role selection removed - defaults to user
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await register(username, password, email, 'user');
            if (data.message === 'User registered successfully') {
                router.push('/login');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (err) {
            alert(err.message || 'Something went wrong');
            console.error(err);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h1>Register</h1>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
