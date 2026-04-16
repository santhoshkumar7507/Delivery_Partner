import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaUsers, FaStore, FaTruck, FaClipboardList, FaRupeeSign, FaClock, FaChartBar } from 'react-icons/fa';

const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1f2937',
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    transition: 'transform 0.15s, box-shadow 0.15s',
    cursor: 'default',
  },
  statIcon: {
    width: 48,
    height: 48,
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
    color: '#6b7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1f2937',
  },
  sectionGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 24,
    marginBottom: 32,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#1f2937',
    marginTop: 0,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '2px solid #e5e7eb',
    color: '#6b7280',
    fontWeight: 600,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #f3f4f6',
    color: '#374151',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },
  quickLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  quickLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 10,
    textDecoration: 'none',
    color: '#1f2937',
    fontWeight: 500,
    fontSize: 15,
    transition: 'background 0.15s',
    border: '1px solid #e5e7eb',
  },
  pendingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  pendingCount: {
    background: '#fef3c7',
    color: '#b45309',
    fontWeight: 700,
    fontSize: 13,
    padding: '2px 10px',
    borderRadius: 999,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    fontSize: 16,
    color: '#6b7280',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
};

const STATUS_COLORS = {
  placed: '#f97316',
  confirmed: '#3b82f6',
  preparing: '#8b5cf6',
  ready_for_pickup: '#4f46e5',
  picked_up: '#0d9488',
  on_the_way: '#0891b2',
  delivered: '#16a34a',
  cancelled: '#ef4444',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalDeliveryPartners: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVendors: 0,
    pendingPartners: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, vendorsRes, partnersRes, ordersRes] = await Promise.all([
        API.get('/auth/users/'),
        API.get('/auth/vendors/'),
        API.get('/auth/delivery-partners/'),
        API.get('/orders/admin/all/'),
      ]);

      const users = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.results || [];
      const vendors = Array.isArray(vendorsRes.data) ? vendorsRes.data : vendorsRes.data.results || [];
      const partners = Array.isArray(partnersRes.data) ? partnersRes.data : partnersRes.data.results || [];
      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.results || [];

      const pendingVendors = vendors.filter(v => !v.is_approved).length;
      const pendingPartners = partners.filter(p => !p.is_approved).length;
      const totalRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || o.total || 0), 0);

      setStats({
        totalUsers: usersRes.data.count ?? users.length,
        totalVendors: vendorsRes.data.count ?? vendors.length,
        totalDeliveryPartners: partnersRes.data.count ?? partners.length,
        totalOrders: ordersRes.data.count ?? orders.length,
        totalRevenue,
        pendingVendors,
        pendingPartners,
      });

      const sorted = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentOrders(sorted.slice(0, 10));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <FaUsers />, color: '#3b82f6' },
    { label: 'Total Vendors', value: stats.totalVendors, icon: <FaStore />, color: '#8b5cf6' },
    { label: 'Delivery Partners', value: stats.totalDeliveryPartners, icon: <FaTruck />, color: '#0d9488' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <FaClipboardList />, color: '#f97316' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: <FaRupeeSign />, color: '#16a34a' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>Welcome back, {user?.first_name || user?.username || 'Admin'}</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        {statCards.map((s, i) => (
          <div key={i} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: s.color }}>{s.icon}</div>
            <div>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statValue}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={styles.sectionGrid}>
        {/* Recent Orders */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}><FaClipboardList color="#6b7280" /> Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 14 }}>No orders found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Restaurant</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => (
                    <tr key={order.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={styles.td}>#{order.id}</td>
                      <td style={styles.td}>{order.customer_name || order.customer?.username || `User #${order.customer}`}</td>
                      <td style={styles.td}>{order.restaurant_name || order.restaurant?.name || `Restaurant #${order.restaurant}`}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: `${STATUS_COLORS[order.status] || '#6b7280'}20`,
                          color: STATUS_COLORS[order.status] || '#6b7280',
                        }}>
                          {(order.status || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={styles.td}>₹{parseFloat(order.total_amount || order.total || 0).toFixed(2)}</td>
                      <td style={styles.td}>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Link to="/admin/orders" style={{ color: '#e23744', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>
              View all orders &rarr;
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Pending Approvals */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}><FaClock color="#f59e0b" /> Pending Approvals</h3>
            <div style={styles.pendingItem}>
              <span style={{ fontSize: 14, color: '#374151' }}>Vendor Approvals</span>
              <span style={styles.pendingCount}>{stats.pendingVendors}</span>
            </div>
            <div style={{ ...styles.pendingItem, borderBottom: 'none' }}>
              <span style={{ fontSize: 14, color: '#374151' }}>Delivery Partner Approvals</span>
              <span style={styles.pendingCount}>{stats.pendingPartners}</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <Link to="/admin/vendors" style={{ color: '#e23744', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>
                Review approvals &rarr;
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}><FaChartBar color="#6b7280" /> Quick Links</h3>
            <div style={styles.quickLinks}>
              <Link to="/admin/users" style={styles.quickLink}>
                <FaUsers color="#3b82f6" /> Manage Users
              </Link>
              <Link to="/admin/vendors" style={styles.quickLink}>
                <FaStore color="#8b5cf6" /> Manage Vendors
              </Link>
              <Link to="/admin/orders" style={styles.quickLink}>
                <FaClipboardList color="#f97316" /> View Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
