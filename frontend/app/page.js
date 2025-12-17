'use client';
import { useEffect, useState } from 'react';
import { getSweets, API_URL, getNotifications, markNotificationRead } from '../utils/api';
import Link from 'next/link';
import styles from './page.module.css';
import { useCart } from '../context/CartContext';
import NotificationBell from '../components/NotificationBell';

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
  // showNotifDropdown state moved to component
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

        <div className={styles.mobileIcons}>
          {/* Notification Bell - Mobile Only */}
          {token && (
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={handleMarkRead}
              className={styles.mobileOnly}
            />
          )}

          <button
            className={styles.hamburger}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={`${styles.links} ${isMobileMenuOpen ? styles.active : ''}`}>

          {/* Notification Bell - Desktop Only */}
          {token && (
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={handleMarkRead}
              className={styles.desktopOnly}
            />
          )}

          <Link href="/cart" className={styles.cartLink}>Cart ({count})</Link>
          <Link href="/orders">Orders</Link>
          {role === 'admin' && <Link href="/admin/inventory" style={{ color: '#d81b60', fontWeight: 'bold' }}>Admin Panel</Link>}

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
            <Link href={`/sweets/${sweet._id}`} className={styles.imageLink}>
              <div className={styles.imageContainer}>
                <img
                  src={sweet.image || `https://via.placeholder.com/400?text=${encodeURIComponent(sweet.name)}`}
                  alt={sweet.name}
                  className={styles.cardImage}
                />
              </div>
            </Link>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}><Link href={`/sweets/${sweet._id}`}>{sweet.name}</Link></h3>
              <p className={styles.category}>{sweet.category}</p>
              <div className={styles.priceRow}>
                <p className={styles.price}>₹{sweet.price}</p>
                {sweet.quantity <= 5 && sweet.quantity > 0 && <span className={styles.lowStock}>Only {sweet.quantity} left!</span>}
              </div>

              {sweet.expiryDate && <p className={styles.expiry}>Expires: {new Date(sweet.expiryDate).toLocaleDateString()}</p>}

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
    </div >
  );
}
