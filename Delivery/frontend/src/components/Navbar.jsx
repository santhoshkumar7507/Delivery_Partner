import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const roleNavLinks = {
  customer: [
    { to: '/customer/dashboard', label: 'Dashboard' },
    { to: '/restaurants', label: 'Restaurants' },
    { to: '/customer/orders', label: 'My Orders' },
  ],
  vendor: [
    { to: '/vendor/dashboard', label: 'Dashboard' },
    { to: '/vendor/restaurant', label: 'Restaurant' },
    { to: '/vendor/menu', label: 'Menu' },
    { to: '/vendor/orders', label: 'Orders' },
  ],
  delivery_partner: [
    { to: '/delivery/dashboard', label: 'Dashboard' },
    { to: '/delivery/orders', label: 'Deliveries' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/vendors', label: 'Vendors' },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const navLinks = user ? roleNavLinks[user.role] || [] : [];

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand} onClick={() => setMobileOpen(false)}>
          <img src="/logo.png" alt="Delivery Partner Logo" style={styles.logo} />
          <span>Delivery Partner</span>
        </Link>

        {/* Mobile toggle */}
        <button
          style={styles.mobileToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {/* Nav links */}
        <div style={{
          ...styles.navLinks,
          ...(mobileOpen ? styles.navLinksOpen : {}),
        }}>
          {!user ? (
            <>
              <Link
                to="/restaurants"
                style={styles.link}
                onClick={() => setMobileOpen(false)}
              >
                Restaurants
              </Link>
              <Link
                to="/login"
                style={styles.link}
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={styles.registerBtn}
                onClick={() => setMobileOpen(false)}
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={styles.link}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <Link
                to="/notifications"
                style={styles.bellContainer}
                onClick={() => setMobileOpen(false)}
              >
                <FaBell size={18} />
                {unreadCount > 0 && (
                  <span style={styles.badge}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              <div style={styles.userInfo}>
                <FaUser size={14} />
                <span style={styles.userName}>
                  {user.first_name || user.username}
                </span>
              </div>

              <button onClick={handleLogout} style={styles.logoutBtn}>
                <FaSignOutAlt size={14} />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    flexWrap: 'wrap',
  },
  brand: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#E23744',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logo: {
    height: '40px',
    width: '40px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  mobileToggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#333',
    padding: '0.5rem',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  navLinksOpen: {},
  link: {
    color: '#4a4a4a',
    textDecoration: 'none',
    fontSize: '0.925rem',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  registerBtn: {
    backgroundColor: '#E23744',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    fontSize: '0.925rem',
    fontWeight: '600',
  },
  bellContainer: {
    position: 'relative',
    color: '#4a4a4a',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-10px',
    backgroundColor: '#E23744',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: '700',
    borderRadius: '50%',
    minWidth: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#4a4a4a',
    fontSize: '0.9rem',
  },
  userName: {
    fontWeight: '500',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '0.4rem 0.85rem',
    cursor: 'pointer',
    color: '#4a4a4a',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
};
