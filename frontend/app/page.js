'use client';
import { useEffect, useState } from 'react';
import { getSweets, API_URL, getNotifications, markNotificationRead } from '../utils/api';
import Link from 'next/link';
import styles from './page.module.css';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [sweets, setSweets] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState(null);
  const { addToCart, count } = useCart();

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    fetchSweets();
    const storedRole = localStorage.getItem('role');
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    setRole(storedRole);
    setToken(storedToken);
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  // Poll for notifications
  useEffect(() => {
    if (token) {
      const fetchNotifs = async () => {
        try {
          const data = await getNotifications();
          if (Array.isArray(data)) setNotifications(data);
        } catch (err) {
          console.error("Failed to fetch notifications", err);
        }
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const fetchSweets = async (query = search, cat = category, min = minPrice, max = maxPrice) => {
    try {
      let url = `${API_URL}/sweets/search?query=${query}`;
      if (cat !== 'All') url += `&category=${cat}`;
      if (min) url += `&minPrice=${min}`;
      if (max) url += `&maxPrice=${max}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch sweets: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setSweets(data);
      } else {
        console.error("API Error: Expected array but got:", data);
        setSweets([]);
      }
    } catch (err) {
      console.error("Fetch sweets error:", err);
      setSweets([]); // Safe fallback
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setRole(null);
    window.location.reload(); // Refresh to ensure state is clean
  };

  return (
    <div className={styles.main}>
      <nav className={styles.nav}>
        <div className={styles.logo}>Sweet Shop</div>
        <div className={styles.links}>
          <Link href="/cart" className={styles.cartLink}>Cart ({count})</Link>
          <Link href="/orders">Orders</Link>
          {role === 'admin' && <Link href="/admin/inventory" style={{ color: '#d81b60', fontWeight: 'bold' }}>Admin Panel</Link>}

          {/* Notification Bell */}
          {token && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: '#333' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-5px', right: '-5px',
                    background: 'red', color: 'white',
                    borderRadius: '50%', padding: '2px 5px', fontSize: '10px'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifDropdown && (
                <div className={styles.dropdownMenu} style={{ right: 0, width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                  <div className={styles.dropdownHeader}>Notifications</div>
                  {notifications.length === 0 ? (
                    <div className={styles.dropdownItem}>No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} className={styles.dropdownItem} style={{
                        background: n.isRead ? 'white' : '#f0f9ff',
                        borderBottom: '1px solid #eee',
                        padding: '10px',
                        fontSize: '14px',
                        display: 'flex', flexDirection: 'column'
                      }}>
                        <span style={{ fontWeight: n.isRead ? 'normal' : 'bold' }}>{n.message}</span>
                        <span style={{ fontSize: '10px', color: '#888', marginTop: '5px' }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkRead(n._id)}
                            style={{ marginTop: '5px', fontSize: '10px', color: 'blue', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {token ? (
            <div className={styles.profileContainer}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={styles.profileBtn}
              >
                <span>Profile</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {showDropdown && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownName}>{userData?.username || 'User'}</span>
                    <span className={styles.dropdownEmail}>{userData?.email || ''}</span>
                  </div>

                  <Link href="/profile" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                    My Profile
                  </Link>


                  <div className={styles.dropdownDivider}></div>

                  <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutItem}`}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>
      </nav>

      <div className={styles.hero}>
        <h1>Welcome to the Sweetest Shop!</h1>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search for sweets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button onClick={() => fetchSweets(search)} className={styles.searchBtn}>Search</button>
        </div>

        <div className={styles.filters}>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={styles.filterSelect}>
            <option value="All">All Categories</option>
            <option value="Chocolate">Chocolate</option>
            <option value="Gummy">Gummy</option>
            <option value="Hard Candy">Hard Candy</option>
            <option value="Bakery">Bakery</option>
            <option value="Classic">Classic</option>
          </select>
          <div className={styles.priceGroup}>
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className={styles.priceInput}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className={styles.priceInput}
            />
          </div>
          <button onClick={() => fetchSweets(search)} className={styles.filterBtn}>Apply Filters</button>
          <button onClick={() => {
            setSearch('');
            setCategory('All');
            setMinPrice('');
            setMaxPrice('');
            fetchSweets('', 'All', '', '');
          }} className={styles.clearBtn}>Clear</button>
        </div>
      </div>

      <div className={styles.grid}>
        {sweets.map(sweet => (
          <div key={sweet._id} className={styles.card}>
            <Link href={`/sweets/${sweet._id}`}>
              <div className={styles.imagePlaceholder} style={{ height: '200px', background: '#eee', borderRadius: '10px 10px 0 0', overflow: 'hidden' }}>
                <img
                  src={sweet.image || `https://via.placeholder.com/400?text=${encodeURIComponent(sweet.name)}`}
                  alt={sweet.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </Link>
            <div style={{ padding: '1rem' }}>
              <h3><Link href={`/sweets/${sweet._id}`}>{sweet.name}</Link></h3>
              <p className={styles.category}>{sweet.category}</p>
              <p className={styles.price}>₹{sweet.price}</p>
              {sweet.expiryDate && <p className={styles.expiry}>Expires: {new Date(sweet.expiryDate).toLocaleDateString()}</p>}
              <p className={styles.stock}>Stock: {sweet.quantity}</p>
              <button
                onClick={() => addToCart(sweet)}
                disabled={sweet.quantity <= 0}
                className={styles.buyBtn}
              >
                {sweet.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
