'use client';
import { useEffect, useState } from 'react';
import { getSweets, addSweet, deleteSweet, updateSweet } from '../../../utils/api';
import styles from './inventory.module.css';

export default function Inventory() {
    const [sweets, setSweets] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', category: '', price: '', costPrice: '', originalPrice: '', quantity: '',
        description: '', image: '', expiryDate: '', batchNumber: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const data = await getSweets();
        setSweets(data);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this sweet?')) return;
        const res = await deleteSweet(id);
        if (res.message === 'Sweet deleted') {
            fetchData();
        } else {
            alert('Failed to delete');
        }
    };

    const handleEdit = (sweet) => {
        setFormData({
            name: sweet.name,
            category: sweet.category,
            price: sweet.price,
            costPrice: sweet.costPrice || '',
            originalPrice: sweet.originalPrice || '',
            quantity: sweet.quantity,
            description: sweet.description || '',
            image: sweet.image || '',
            expiryDate: sweet.expiryDate ? new Date(sweet.expiryDate).toISOString().split('T')[0] : '',
            batchNumber: sweet.batchNumber || ''
        });
        setEditingId(sweet._id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        let res;
        if (editingId) {
            res = await updateSweet(editingId, formData);
        } else {
            res = await addSweet(formData);
        }

        if (res._id) {
            alert(editingId ? 'Product Updated!' : 'Product Added!');
            setShowAddForm(false);
            setEditingId(null);
            setFormData({
                name: '', category: '', price: '', costPrice: '', originalPrice: '', quantity: '',
                description: '', image: '', expiryDate: '', batchNumber: ''
            });
            fetchData();
        } else {
            alert('Error saving product');
        }
    };

    const checkExpiry = (date) => {
        if (!date) return 'safe';
        const expiry = new Date(date);
        const now = new Date();
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'expired';
        if (diffDays < 7) return 'warning';
        return 'safe';
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSweets = sweets.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sweets.length / itemsPerPage);

    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Admin: Inventory Management</h1>
                <button className={styles.addBtn} onClick={() => {
                    setShowAddForm(!showAddForm);
                    setEditingId(null);
                    setFormData({
                        name: '', category: '', price: '', costPrice: '', originalPrice: '', quantity: '',
                        description: '', image: '', expiryDate: '', batchNumber: ''
                    });
                }}>
                    {showAddForm ? 'Cancel' : '+ Add New Product'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAdd} className={styles.addForm}>
                    <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                    <div className={styles.formGrid}>
                        <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            required
                            style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="" disabled>Select Category</option>
                            {['Chocolate', 'Gummy', 'Hard Candy', 'Bakery', 'Classic', 'Dried Fruits', 'Gifting', 'Sugar Free'].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <input type="number" placeholder="MRP / Original Price (₹)" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} />
                        <input type="number" placeholder="Sale Price (₹)" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                        <input type="number" placeholder="Cost Price (₹)" value={formData.costPrice} onChange={e => setFormData({ ...formData, costPrice: e.target.value })} required />
                        <input type="number" placeholder="Quantity" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
                        <input placeholder="Image URL (Optional)" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                        <input placeholder="Batch Number" value={formData.batchNumber} onChange={e => setFormData({ ...formData, batchNumber: e.target.value })} />
                        <div className={styles.dateGroup}>
                            <label>Expiry Date:</label>
                            <input type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
                        </div>
                    </div>
                    <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={styles.textarea} />
                    <button type="submit" className={styles.submitBtn}>{editingId ? 'Update Product' : 'Create Product'}</button>
                </form>
            )}

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSweets.map(sweet => {
                            const status = checkExpiry(sweet.expiryDate);
                            return (
                                <tr key={sweet._id} className={styles[status]}>
                                    <td>{sweet.name}</td>
                                    <td>{sweet.category}</td>
                                    <td>₹{sweet.price}</td>
                                    <td>{sweet.quantity}</td>
                                    <td>{sweet.expiryDate ? new Date(sweet.expiryDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        {status === 'expired' && <span className={styles.badgeExpired}>Expired</span>}
                                        {status === 'warning' && <span className={styles.badgeWarning}>Expiring Soon</span>}
                                        {status === 'safe' && <span className={styles.badgeSafe}>Ok</span>}
                                    </td>
                                    <td>
                                        <button className={styles.editBtn} onClick={() => handleEdit(sweet)} style={{ marginRight: '0.5rem', background: '#e0f2fe', color: '#0ea5e9', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '600' }}>Edit</button>
                                        <button className={styles.deleteBtn} onClick={() => handleDelete(sweet._id)}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className={styles.pagination}>
                <button onClick={prevPage} disabled={currentPage === 1} className={styles.pageBtn}>
                    Previous
                </button>
                <span className={styles.pageInfo}>
                    Page {currentPage} of {totalPages > 0 ? totalPages : 1}
                </span>
                <button onClick={nextPage} disabled={currentPage >= totalPages} className={styles.pageBtn}>
                    Next
                </button>
            </div>
        </div>
    );
}
