'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, updateUserRole, deleteUser } from '../../../utils/api';
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

    const handleDeleteUser = async (userId) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId);
                setUsers(users.filter(u => u._id !== userId));
                alert('User deleted successfully');
            } catch (err) {
                console.error(err);
                alert('Failed to delete user');
            }
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // Calculate current users
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                    {currentUsers.map(user => (
                        <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
                                <span className={`${styles.badge} ${styles[user.role]}`}>{user.role}</span>
                            </td>
                            <td>
                                {user.role !== 'superadmin' && (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className={styles.select}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className={styles.deleteBtn}
                                            style={{
                                                backgroundColor: '#ff4d4d',
                                                color: 'white',
                                                border: 'none',
                                                padding: '5px 10px',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                                {user.role === 'superadmin' && <span>(Super Admin)</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={styles.pagination} style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                    Previous
                </button>
                <span style={{ padding: '8px' }}>Page {currentPage}</span>
                <button
                    onClick={() => setCurrentPage(prev => (indexOfLastUser < users.length ? prev + 1 : prev))}
                    disabled={indexOfLastUser >= users.length}
                    style={{ padding: '8px 16px', cursor: indexOfLastUser >= users.length ? 'not-allowed' : 'pointer' }}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
