'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSweets, API_URL, getNotifications, markNotificationRead, loginDeliveryPartner } from '../utils/api';
import Link from 'next/link';
import styles from './page.module.css';
import { useCart } from '../context/CartContext';
import NotificationBell from '../components/NotificationBell';

export default function Home() {
  const router = useRouter();
  const [sweets, setSweets] = useState([]);

  // Slider State
  const sliderRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let animationFrameId;
    const scrollSpeed = 0.8; // Slightly faster for visibility

    const animate = () => {
      // Logic: If not paused, scroll. 
      // Note: We check if slice is at the end of the first set
      if (!isPaused) {
        if (slider.scrollLeft >= (slider.scrollWidth / 2)) {
          // Reset to 0 for infinite loop
          slider.scrollLeft = 0;
        } else {
          slider.scrollLeft += scrollSpeed;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

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

  // Partner Login State
  const [showPartnerLogin, setShowPartnerLogin] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [partnerError, setPartnerError] = useState('');

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
          {['admin', 'superadmin'].includes(role) && <Link href="/admin/inventory" style={{ color: '#d81b60', fontWeight: 'bold' }}>Admin Panel</Link>}

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
              <button onClick={() => setShowPartnerLogin(true)} className={styles.partnerLink}>Partner Login</button>
            </>
          )}
        </div>


        {/* Partner Login Modal */}
        {showPartnerLogin && (
          <div className={styles.modalOverlay} onClick={() => setShowPartnerLogin(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button className={styles.closeBtn} onClick={() => setShowPartnerLogin(false)}>×</button>
              <h2>Delivery Partner Login</h2>
              {partnerError && <p className={styles.errorText}>{partnerError}</p>}
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  value={partnerName}
                  onChange={e => setPartnerName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Unique ID</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  value={partnerId}
                  onChange={e => setPartnerId(e.target.value)}
                  placeholder="DP-XXXXX"
                />
              </div>
              <button
                className={styles.modalLoginBtn}
                onClick={async () => {
                  setPartnerError('');
                  if (!partnerName || !partnerId) {
                    setPartnerError('All fields required');
                    return;
                  }
                  try {
                    const res = await loginDeliveryPartner(partnerName, partnerId);
                    if (res.token) {
                      localStorage.setItem('token', res.token);
                      localStorage.setItem('role', 'partner');
                      window.location.href = '/delivery/dashboard';
                    } else {
                      setPartnerError(res.message || 'Login failed');
                    }
                  } catch (err) {
                    setPartnerError('Something went wrong');
                  }
                }}
              >
                Login as Partner
              </button>
            </div>
          </div>
        )}

      </nav>

      <div className={styles.hero}>
        <h1>Welcome to the Sweetest Shop!</h1>
        <p className={styles.heroSubtitle}>Indulge in Premium Handcrafted Delights</p>
        <p className={styles.heroDescription}>
          Discover our exquisite collection of artisanal sweets, crafted with love and the finest ingredients.
          From traditional favorites to innovative creations, every bite is a celebration of flavor and quality.
        </p>
      </div>



      {/* Shop Our Range Section */}
      <div className={styles.shopRangeSection}>
        <h2 className={styles.rangeTitle}>Shop Our Range</h2>
        <div className={styles.sliderWindow}>
          <div
            className={styles.sliderTrack}
            ref={sliderRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
          >
            {[
              { name: 'Chocolate', img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Gummy', img: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Hard Candy', img: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Bakery', img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Classic', img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Dried Fruits', img: 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Gifting', img: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Sugar Free', img: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=1000&auto=format&fit=crop' },
              // Duplicate list for infinite scroll loop
              { name: 'Chocolate', img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Gummy', img: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Hard Candy', img: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Bakery', img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Classic', img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Dried Fruits', img: 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Gifting', img: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1000&auto=format&fit=crop' },
              { name: 'Sugar Free', img: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=1000&auto=format&fit=crop' }
            ].map((cat, index) => (
              <div
                key={`${cat.name.trim()}-${index}`}
                className={styles.rangeCard}
                onClick={() => {
                  const cleanName = cat.name.trim();
                  // Navigate to dedicated category page
                  router.push(`/category/${encodeURIComponent(cleanName)}`);
                }}
              >
                <div className={styles.rangeImageContainer}>
                  <img src={cat.img} alt={cat.name} className={styles.rangeImage} />
                </div>
                <h3 className={styles.rangeCategoryName}>{cat.name.trim()}</h3>
                <p className={styles.rangeProductCount}>
                  {sweets.filter(s => s.category === cat.name.trim()).length > 0
                    ? `${sweets.filter(s => s.category === cat.name.trim()).length} Products`
                    : 'Explore Collection'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid Removed as per user request to move listings to category pages */}


      {/* Festive Bakes Banner */}
      <div className={styles.festiveBanner}>
        <div className={styles.festiveImageSection}>
          <img src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000&auto=format&fit=crop" alt="Festive Sweets Left" className={styles.festiveImg} />
        </div>

        <div className={styles.festiveContent}>
          <h2 className={styles.festiveTitle}>festive</h2>
          <h3 className={styles.festiveSubtitle}>✨ bakes ✨</h3>
          <p className={styles.festiveDesc}>
            From Honey Chews to Almond and Pista Sticks, Choco hazelnut Biscotti, Celebratory Cookies and more, make this joyous season a sweeter one with our bakes!
          </p>
          <button className={styles.festiveBtn} onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCategory('Bakery');
            fetchSweets('', 'Bakery', '', '');
          }}>
            EXPLORE & ORDER AWAY
          </button>
        </div>

        <div className={styles.festiveImageSection}>
          <img src="https://images.unsplash.com/photo-1548848221-0c2e497ed557?q=80&w=1000&auto=format&fit=crop" alt="Festive Sweets Right" className={styles.festiveImg} />
        </div>
      </div>

      {/* Our Story Section */}
      <div className={styles.ourStorySection}>
        <div className={styles.ourStoryImages}>
          <img
            src="https://images.unsplash.com/photo-1514517521153-1be72277b32f?q=80&w=1000&auto=format&fit=crop"
            alt="Sweet Box Gift"
            className={styles.ourStoryMainImg}
          />
          <div className={styles.ourStorySmallImages}>
            <img
              src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1000&auto=format&fit=crop"
              alt="Traditional Sweets"
              className={styles.ourStorySmallImg}
            />
            <img
              src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1000&auto=format&fit=crop"
              alt="Sweet Shop"
              className={styles.ourStorySmallImg}
            />
            <img
              src="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?q=80&w=1000&auto=format&fit=crop"
              alt="Sweet Package"
              className={styles.ourStorySmallImg}
            />
          </div>
        </div>

        <div className={styles.ourStoryContent}>
          <h2 className={styles.ourStoryTitle}>Our Story</h2>
          <p className={styles.ourStoryDesc}>
            Naveen's success stems from its blend of tradition, innovation, and unwavering quality. Its dynamism is fueled by a continuous effort to revamp products and packaging to align with the evolving demographics of India.
          </p>
          <p className={styles.ourStoryDesc}>
            Sweet-Shop is dedicated to authenticity, sourcing ingredients like saffron from Kashmir for Malpua and paneer from Delhi for savory delights, proving that great taste knows no boundaries.
          </p>
        </div>
      </div>
    </div >
  );
}
