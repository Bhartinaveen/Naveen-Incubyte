'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '../../utils/api';
import styles from './login.module.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login(username, password);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                // Save full user profile to persist details across sessions
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                router.push('/');
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (err) {
            alert(err.message || 'Something went wrong');
            console.error(err);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h1>Login</h1>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
                <div className={styles.registerLink}>
                    Don't have an account?
                    <Link href="/register">Register Now</Link>
                </div>
            </form>
        </div>
    );
}
