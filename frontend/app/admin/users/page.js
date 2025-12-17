'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, updateUserRole } from '../../../utils/api';
import styles from './users.module.css';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            const role = localStorage.getItem('role');

            if (role !== 'superadmin') {
                alert('Access Denied');
                router.push('/admin/dashboard'); // or wherever
                return;
            }

            try {
                const data = await getUsers();
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error('Failed to fetch users');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [router]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const updatedUser = await updateUserRole(userId, newRole);

            if (updatedUser._id) {
                setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
                alert(`User role updated to ${newRole}`);
            } else {
                alert('Failed to update role');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating role');
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>User Management</h1>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Current Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
                                <span className={`${styles.badge} ${styles[user.role]}`}>{user.role}</span>
                            </td>
                            <td>
                                {user.role !== 'superadmin' && (
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                )}
                                {user.role === 'superadmin' && <span>(Super Admin)</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
