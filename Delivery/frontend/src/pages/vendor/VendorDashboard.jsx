import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaStore, FaUtensils, FaClipboardList, FaShoppingBag, FaClock, FaRupeeSign } from 'react-icons/fa';

const BRAND = '#E23744';

const styles = {
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    marginBottom: 32,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1c1c1c',
    margin: 0,
  },
  subtitle: {
    fontSize: 15,
    color: '#696969',
    marginTop: 6,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 20,
    marginBottom: 32,
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '24px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  statIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    color: '#fff',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: 13,
    color: '#696969',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1c1c1c',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    marginBottom: 32,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1c1c1c',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  restaurantInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1c1c1c',
  },
  badge: (active) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: active ? '#e8f5e9' : '#fce4ec',
    color: active ? '#2e7d32' : BRAND,
    marginTop: 6,
  }),
  orderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  orderId: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1c1c1c',
  },
  orderMeta: {
    fontSize: 13,
    color: '#696969',
  },
  statusBadge: (status) => {
    const colors = {
      placed: { bg: '#fff3e0', color: '#e65100' },
      confirmed: { bg: '#e3f2fd', color: '#1565c0' },
      preparing: { bg: '#fce4ec', color: BRAND },
      ready_for_pickup: { bg: '#e8f5e9', color: '#2e7d32' },
      out_for_delivery: { bg: '#ede7f6', color: '#4527a0' },
      delivered: { bg: '#e8f5e9', color: '#1b5e20' },
      cancelled: { bg: '#fafafa', color: '#757575' },
    };
    const c = colors[status] || { bg: '#f5f5f5', color: '#333' };
    return {
      padding: '3px 10px',
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 600,
      background: c.bg,
      color: c.color,
      textTransform: 'capitalize',
    };
  },
  quickLinks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },
  quickLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    textDecoration: 'none',
    color: '#1c1c1c',
    fontSize: 15,
    fontWeight: 500,
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  quickLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: BRAND,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  loading: {
    textAlign: 'center',
    padding: 60,
    fontSize: 16,
    color: '#696969',
  },
  error: {
    textAlign: 'center',
    padding: 40,
    color: BRAND,
    fontSize: 15,
  },
  noRestaurant: {
    textAlign: 'center',
    padding: 40,
  },
  createBtn: {
    display: 'inline-block',
    marginTop: 12,
    padding: '10px 28px',
    background: BRAND,
    color: '#fff',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
  },
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [hasRestaurant, setHasRestaurant] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, restRes] = await Promise.allSettled([
        API.get('/orders/vendor/'),
        API.get('/restaurants/vendor/my-restaurant/'),
      ]);

      if (ordersRes.status === 'fulfilled') {
        const data = ordersRes.value.data;
        setOrders(Array.isArray(data) ? data : data.results || []);
      }

      if (restRes.status === 'fulfilled') {
        setRestaurant(restRes.value.data);
        setHasRestaurant(true);
      } else if (restRes.reason?.response?.status === 404) {
        setHasRestaurant(false);
      }
    } catch (err) {
      setError('Failed to load dashboard data.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === 'placed' || o.status === 'confirmed' || o.status === 'preparing'
  ).length;

  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => {
    const orderDate = o.created_at ? o.created_at.slice(0, 10) : '';
    return orderDate === today;
  });
  const revenueToday = todayOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || o.total || 0), 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5);

  const formatStatus = (s) => (s || '').replace(/_/g, ' ');

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return <div style={styles.loading}>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>{error}</p>
        <button
          onClick={fetchDashboardData}
          style={{ marginTop: 12, padding: '8px 20px', background: BRAND, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.welcome}>
          Welcome back, {user?.first_name || user?.username || 'Vendor'}!
        </h1>
        <p style={styles.subtitle}>Here's an overview of your restaurant business</p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#1565c0' }}>
            <FaShoppingBag />
          </div>
          <div>
            <div style={styles.statLabel}>Total Orders</div>
            <div style={styles.statValue}>{totalOrders}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#e65100' }}>
            <FaClock />
          </div>
          <div>
            <div style={styles.statLabel}>Pending Orders</div>
            <div style={styles.statValue}>{pendingOrders}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#2e7d32' }}>
            <FaRupeeSign />
          </div>
          <div>
            <div style={styles.statLabel}>Revenue Today</div>
            <div style={styles.statValue}>
              {'\u20B9'}{revenueToday.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Card + Recent Orders */}
      <div style={styles.twoCol}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <FaStore style={{ color: BRAND }} /> My Restaurant
          </div>
          {hasRestaurant && restaurant ? (
            <div>
              <div style={styles.restaurantName}>{restaurant.name}</div>
              <div style={{ fontSize: 13, color: '#696969', marginTop: 4 }}>
                {restaurant.cuisine_type && (
                  <span style={{ textTransform: 'capitalize' }}>
                    {restaurant.cuisine_type.replace(/_/g, ' ')}
                  </span>
                )}
                {restaurant.address && <span> &middot; {restaurant.address}</span>}
              </div>
              <div style={styles.badge(restaurant.is_active)}>
                {restaurant.is_active ? 'Active' : 'Inactive'}
              </div>
              <Link
                to="/vendor/restaurant"
                style={{
                  display: 'inline-block',
                  marginTop: 16,
                  padding: '8px 20px',
                  background: BRAND,
                  color: '#fff',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Edit Restaurant
              </Link>
            </div>
          ) : (
            <div style={styles.noRestaurant}>
              <p style={{ color: '#696969', marginBottom: 12 }}>
                You haven't set up your restaurant yet.
              </p>
              <Link to="/vendor/restaurant" style={styles.createBtn}>
                Create Restaurant
              </Link>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <FaClipboardList style={{ color: BRAND }} /> Recent Orders
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ color: '#696969', fontSize: 14 }}>No orders yet.</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} style={styles.orderRow}>
                <div>
                  <div style={styles.orderId}>#{order.id}</div>
                  <div style={styles.orderMeta}>
                    {order.customer_name || order.user?.username || 'Customer'} &middot;{' '}
                    {formatTime(order.created_at)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {'\u20B9'}{parseFloat(order.total_amount || order.total || 0).toFixed(2)}
                  </div>
                  <span style={styles.statusBadge(order.status)}>
                    {formatStatus(order.status)}
                  </span>
                </div>
              </div>
            ))
          )}
          {orders.length > 5 && (
            <Link
              to="/vendor/orders"
              style={{
                display: 'block',
                textAlign: 'center',
                marginTop: 12,
                color: BRAND,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              View All Orders
            </Link>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1c1c1c', marginBottom: 16 }}>
        Quick Actions
      </h3>
      <div style={styles.quickLinks}>
        <Link to="/vendor/restaurant" style={styles.quickLink}>
          <div style={styles.quickLinkIcon}>
            <FaStore />
          </div>
          Manage Restaurant
        </Link>
        <Link to="/vendor/menu" style={styles.quickLink}>
          <div style={styles.quickLinkIcon}>
            <FaUtensils />
          </div>
          Manage Menu
        </Link>
        <Link to="/vendor/orders" style={styles.quickLink}>
          <div style={styles.quickLinkIcon}>
            <FaClipboardList />
          </div>
          View Orders
        </Link>
      </div>
    </div>
  );
}
