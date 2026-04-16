import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaMotorcycle,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaBoxOpen,
  FaTruck,
  FaToggleOn,
  FaToggleOff,
} from 'react-icons/fa';
import { FiArrowRight, FiDollarSign } from 'react-icons/fi';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  ready_for_pickup: '#4f46e5',
  picked_up: '#0d9488',
  on_the_way: '#0891b2',
  delivered: '#16a34a',
};

const ACTIVE_STATUSES = ['ready_for_pickup', 'picked_up', 'on_the_way'];

function formatStatus(status) {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DeliveryDashboard() {
  const { user } = useAuth();

  const [availableOrders, setAvailableOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [availableRes, assignedRes, profileRes] = await Promise.all([
        API.get('/orders/delivery/available/?type=available'),
        API.get('/orders/delivery/available/?type=assigned'),
        API.get('/auth/profile/'),
      ]);
      setAvailableOrders(availableRes.data.results || availableRes.data);
      setAssignedOrders(assignedRes.data.results || assignedRes.data);
      setProfile(profileRes.data);
      setIsAvailable(
        profileRes.data?.delivery_partner_profile?.is_available ?? false
      );
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data.');
      toast.error('Could not fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleAvailability = async () => {
    try {
      setTogglingAvailability(true);
      const newAvailability = !isAvailable;
      await API.put('/auth/profile/', {
        delivery_partner_profile: {
          is_available: newAvailability,
          vehicle_type: profile?.delivery_partner_profile?.vehicle_type || '',
          vehicle_number: profile?.delivery_partner_profile?.vehicle_number || '',
        },
      });
      setIsAvailable(newAvailability);
      toast.success(
        newAvailability ? 'You are now available for deliveries!' : 'You are now offline.'
      );
    } catch (err) {
      toast.error('Failed to update availability.');
    } finally {
      setTogglingAvailability(false);
    }
  };

  const activeDelivery = assignedOrders.find((o) =>
    ACTIVE_STATUSES.includes(o.status)
  );

  const completedToday = assignedOrders.filter((o) => {
    if (o.status !== 'delivered') return false;
    const today = new Date().toDateString();
    const orderDate = new Date(o.updated_at || o.created_at).toDateString();
    return today === orderDate;
  });

  const totalEarnings = assignedOrders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + parseFloat(o.delivery_fee || 0), 0);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/delivery/${orderId}/update-status/`, {
        status: newStatus,
        notes: '',
      });
      toast.success(`Order status updated to ${formatStatus(newStatus)}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update order status.');
    }
  };

  const getNextAction = (status) => {
    switch (status) {
      case 'ready_for_pickup':
        return { label: 'Pick Up Order', nextStatus: 'picked_up', color: '#0d9488' };
      case 'picked_up':
        return { label: 'On The Way', nextStatus: 'on_the_way', color: '#0891b2' };
      case 'on_the_way':
        return { label: 'Mark Delivered', nextStatus: 'delivered', color: '#16a34a' };
      default:
        return null;
    }
  };

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
        <button style={styles.retryBtn} onClick={fetchData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <div style={styles.welcomeRow}>
          <div>
            <h1 style={styles.welcomeTitle}>
              Welcome back, {user?.first_name || user?.username || 'Partner'}!
            </h1>
            <p style={styles.welcomeSubtitle}>
              Here&apos;s your delivery overview for today.
            </p>
          </div>
          <div style={styles.availabilityToggle}>
            <span style={styles.availabilityLabel}>
              {isAvailable ? 'Online' : 'Offline'}
            </span>
            <button
              style={styles.toggleBtn}
              onClick={toggleAvailability}
              disabled={togglingAvailability}
              title={isAvailable ? 'Go offline' : 'Go online'}
            >
              {isAvailable ? (
                <FaToggleOn size={40} color="#16a34a" />
              ) : (
                <FaToggleOff size={40} color="#9ca3af" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#eef2ff' }}>
            <FaTruck size={22} color="#4f46e5" />
          </div>
          <div>
            <p style={styles.statValue}>
              {assignedOrders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length}
            </p>
            <p style={styles.statLabel}>Active Deliveries</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#dcfce7' }}>
            <FaCheckCircle size={22} color="#16a34a" />
          </div>
          <div>
            <p style={styles.statValue}>{completedToday.length}</p>
            <p style={styles.statLabel}>Completed Today</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#fef3c7' }}>
            <FiDollarSign size={22} color="#f59e0b" />
          </div>
          <div>
            <p style={styles.statValue}>${totalEarnings.toFixed(2)}</p>
            <p style={styles.statLabel}>Total Earnings</p>
          </div>
        </div>
      </div>

      {/* Active Delivery Card */}
      {activeDelivery && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Current Delivery</h2>
          <div style={styles.activeDeliveryCard}>
            <div style={styles.activeDeliveryHeader}>
              <div style={styles.activeDeliveryInfo}>
                <p style={styles.activeRestaurant}>
                  {activeDelivery.restaurant_name || activeDelivery.restaurant?.name || 'Restaurant'}
                </p>
                <p style={styles.activeOrderId}>Order #{activeDelivery.id}</p>
              </div>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: STATUS_COLORS[activeDelivery.status] || '#6b7280',
                }}
              >
                {formatStatus(activeDelivery.status)}
              </span>
            </div>

            <div style={styles.activeDeliveryDetails}>
              <div style={styles.detailRow}>
                <FaMapMarkerAlt size={14} color="#6b7280" />
                <span style={styles.detailText}>
                  {activeDelivery.delivery_address || activeDelivery.address || 'Delivery address'}
                </span>
              </div>
              {activeDelivery.customer_name && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Customer:</span>
                  <span style={styles.detailText}>{activeDelivery.customer_name}</span>
                </div>
              )}
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Total:</span>
                <span style={styles.detailAmount}>
                  ${parseFloat(activeDelivery.total_amount || activeDelivery.grand_total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {(() => {
              const action = getNextAction(activeDelivery.status);
              if (!action) return null;
              return (
                <button
                  style={{ ...styles.actionBtn, backgroundColor: action.color }}
                  onClick={() => handleStatusUpdate(activeDelivery.id, action.nextStatus)}
                >
                  {action.label}
                </button>
              );
            })()}
          </div>
        </div>
      )}

      {/* Available Orders */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Available Orders</h2>
          <Link to="/delivery/orders" style={styles.viewAllLink}>
            View All <FiArrowRight size={14} />
          </Link>
        </div>

        {!isAvailable ? (
          <div style={styles.offlineNotice}>
            <FaMotorcycle size={32} color="#9ca3af" />
            <p style={styles.offlineText}>
              You are currently offline. Toggle your availability to see available orders.
            </p>
          </div>
        ) : availableOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <FaBoxOpen size={48} color="#d1d5db" />
            <p style={styles.emptyText}>No orders available for pickup right now.</p>
            <p style={styles.emptySubtext}>New orders will appear here automatically.</p>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {availableOrders.slice(0, 3).map((order) => {
              const itemCount = order.items?.length || order.order_items?.length || 0;
              return (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderCardTop}>
                    <div>
                      <p style={styles.orderRestaurant}>
                        {order.restaurant_name || order.restaurant?.name || 'Restaurant'}
                      </p>
                      <p style={styles.orderMeta}>
                        Order #{order.id} {itemCount > 0 && `\u00B7 ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <span style={styles.orderAmount}>
                      ${parseFloat(order.total_amount || order.grand_total || 0).toFixed(2)}
                    </span>
                  </div>
                  <div style={styles.orderCardAddress}>
                    <FaMapMarkerAlt size={12} color="#6b7280" />
                    <span style={styles.addressText}>
                      {order.delivery_address || order.address || 'Delivery address'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Links</h2>
        <div style={styles.quickLinksGrid}>
          <Link to="/delivery/orders" style={styles.quickLink}>
            <FaBoxOpen size={20} color="#4f46e5" />
            <span>My Deliveries</span>
            <FiArrowRight size={16} />
          </Link>
          <Link to="/profile" style={styles.quickLink}>
            <FaMotorcycle size={20} color="#0d9488" />
            <span>Profile</span>
            <FiArrowRight size={16} />
          </Link>
        </div>
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
    borderTop: '4px solid #4f46e5',
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
    backgroundColor: '#4f46e5',
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
  welcomeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
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
  availabilityToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  availabilityLabel: {
    fontSize: 15,
    fontWeight: 600,
    color: '#374151',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
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
  section: {
    marginBottom: 36,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#111827',
    margin: 0,
    marginBottom: 16,
  },
  viewAllLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: '#4f46e5',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
  },
  activeDeliveryCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 14,
    border: '2px solid #4f46e5',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)',
  },
  activeDeliveryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activeDeliveryInfo: {
    flex: 1,
  },
  activeRestaurant: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  activeOrderId: {
    fontSize: 13,
    color: '#9ca3af',
    margin: 0,
    marginTop: 2,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '5px 14px',
    borderRadius: 20,
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  activeDeliveryDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
    padding: '16px 0',
    borderTop: '1px solid #f3f4f6',
    borderBottom: '1px solid #f3f4f6',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: 500,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
  },
  detailAmount: {
    fontSize: 16,
    fontWeight: 700,
    color: '#111827',
  },
  actionBtn: {
    width: '100%',
    padding: '14px 24px',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    transition: 'opacity 0.2s',
  },
  offlineNotice: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    border: '1px dashed #d1d5db',
    textAlign: 'center',
  },
  offlineText: {
    color: '#6b7280',
    fontSize: 15,
    marginTop: 12,
    maxWidth: 320,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1px solid #f3f4f6',
    textAlign: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#9ca3af',
    fontSize: 13,
    margin: 0,
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
    transition: 'box-shadow 0.2s',
  },
  orderCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderRestaurant: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
    margin: 0,
  },
  orderMeta: {
    fontSize: 13,
    color: '#9ca3af',
    margin: 0,
    marginTop: 2,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
    flexShrink: 0,
  },
  orderCardAddress: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    fontSize: 13,
    color: '#6b7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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
};
