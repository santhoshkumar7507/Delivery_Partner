import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiShoppingBag,
  FiClock,
  FiDollarSign,
  FiArrowRight,
  FiSearch,
  FiList,
  FiBell,
} from 'react-icons/fi';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const STATUS_COLORS = {
  placed: '#f97316',
  confirmed: '#3b82f6',
  preparing: '#a855f7',
  ready_for_pickup: '#6366f1',
  picked_up: '#14b8a6',
  on_the_way: '#06b6d4',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

const ACTIVE_STATUSES = ['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'on_the_way'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatStatus(status) {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/orders/my-orders/');
        setOrders(data.results || data);
      } catch (err) {
        setError('Failed to load dashboard data.');
        toast.error('Could not fetch your orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || o.grand_total || 0), 0);
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>{error}</p>
        <button style={styles.retryBtn} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <h1 style={styles.welcomeTitle}>
          Welcome back, {user?.first_name || user?.username || 'there'}!
        </h1>
        <p style={styles.welcomeSubtitle}>
          Here&apos;s what&apos;s happening with your orders.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#eff6ff' }}>
            <FiShoppingBag size={24} color="#3b82f6" />
          </div>
          <div>
            <p style={styles.statValue}>{totalOrders}</p>
            <p style={styles.statLabel}>Total Orders</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#fef3c7' }}>
            <FiClock size={24} color="#f59e0b" />
          </div>
          <div>
            <p style={styles.statValue}>{activeOrders}</p>
            <p style={styles.statLabel}>Active Orders</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#d1fae5' }}>
            <FiDollarSign size={24} color="#10b981" />
          </div>
          <div>
            <p style={styles.statValue}>${totalSpent.toFixed(2)}</p>
            <p style={styles.statLabel}>Total Spent</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={styles.quickLinksSection}>
        <h2 style={styles.sectionTitle}>Quick Links</h2>
        <div style={styles.quickLinksGrid}>
          <Link to="/restaurants" style={styles.quickLink}>
            <FiSearch size={20} />
            <span>Browse Restaurants</span>
            <FiArrowRight size={16} />
          </Link>
          <Link to="/customer/orders" style={styles.quickLink}>
            <FiList size={20} />
            <span>My Orders</span>
            <FiArrowRight size={16} />
          </Link>
          <Link to="/notifications" style={styles.quickLink}>
            <FiBell size={20} />
            <span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
            <FiArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={styles.recentSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Orders</h2>
          {orders.length > 5 && (
            <Link to="/customer/orders" style={styles.viewAllLink}>
              View All <FiArrowRight size={14} />
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <FiShoppingBag size={48} color="#d1d5db" />
            <p style={styles.emptyText}>No orders yet</p>
            <Link to="/restaurants" style={styles.browseBtn}>
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                style={styles.orderCard}
                onClick={() => navigate(`/customer/orders/${order.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/customer/orders/${order.id}`);
                }}
              >
                <div style={styles.orderCardTop}>
                  <div>
                    <p style={styles.orderRestaurant}>
                      {order.restaurant_name || order.restaurant?.name || 'Restaurant'}
                    </p>
                    <p style={styles.orderId}>Order #{order.id}</p>
                  </div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: STATUS_COLORS[order.status] || '#6b7280',
                    }}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>
                <div style={styles.orderCardBottom}>
                  <span style={styles.orderDate}>{formatDate(order.created_at)}</span>
                  <span style={styles.orderTotal}>
                    ${parseFloat(order.total_amount || order.grand_total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '32px 16px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #ef4444',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 16,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  retryBtn: {
    padding: '10px 24px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
    marginBottom: 36,
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #f3f4f6',
  },
  statIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    borderRadius: 12,
    flexShrink: 0,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    margin: 0,
    marginTop: 2,
  },
  quickLinksSection: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#111827',
    margin: 0,
    marginBottom: 16,
  },
  quickLinksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
  },
  quickLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    backgroundColor: '#fff',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    textDecoration: 'none',
    color: '#374151',
    fontWeight: 500,
    fontSize: 15,
    transition: 'box-shadow 0.2s, border-color 0.2s',
  },
  recentSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: '#ef4444',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1px solid #f3f4f6',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  browseBtn: {
    padding: '10px 24px',
    backgroundColor: '#ef4444',
    color: '#fff',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  orderCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderRestaurant: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
    margin: 0,
  },
  orderId: {
    fontSize: 13,
    color: '#9ca3af',
    margin: 0,
    marginTop: 2,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 20,
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  orderCardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 13,
    color: '#6b7280',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 700,
    color: '#111827',
  },
};
