import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  FaMotorcycle,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaBoxOpen,
  FaTruck,
} from 'react-icons/fa';
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TABS = [
  { key: 'available', label: 'Available Orders', icon: FaBoxOpen },
  { key: 'my', label: 'My Deliveries', icon: FaTruck },
];

export default function DeliveryOrders() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('available');
  const [availableOrders, setAvailableOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const [availableRes, assignedRes] = await Promise.all([
        API.get('/orders/delivery/available/?type=available'),
        API.get('/orders/delivery/available/?type=assigned'),
      ]);
      setAvailableOrders(availableRes.data.results || availableRes.data);
      setAssignedOrders(assignedRes.data.results || assignedRes.data);
      setError(null);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError('Failed to load orders.');
        toast.error('Could not fetch orders.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleAcceptOrder = async (orderId) => {
    try {
      setActionLoading(orderId);
      await API.post(`/orders/delivery/${orderId}/accept/`, { notes: '' });
      toast.success('Order accepted! Head to the restaurant for pickup.');
      fetchOrders();
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to accept order.';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setActionLoading(orderId);
      await API.put(`/orders/delivery/${orderId}/update-status/`, {
        status: newStatus,
        notes: '',
      });
      toast.success(`Order status updated to ${formatStatus(newStatus)}`);
      fetchOrders();
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to update status.';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const getNextAction = (status) => {
    switch (status) {
      case 'ready_for_pickup':
        return { label: 'Pick Up', nextStatus: 'picked_up', color: '#0d9488' };
      case 'picked_up':
        return { label: 'On The Way', nextStatus: 'on_the_way', color: '#0891b2' };
      case 'on_the_way':
        return { label: 'Delivered', nextStatus: 'delivered', color: '#16a34a' };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>{error}</p>
        <button style={styles.retryBtn} onClick={fetchOrders}>
          Retry
        </button>
      </div>
    );
  }

  const activeAssigned = assignedOrders.filter((o) =>
    ACTIVE_STATUSES.includes(o.status)
  );
  const completedAssigned = assignedOrders.filter(
    (o) => o.status === 'delivered'
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Delivery Orders</h1>
        <p style={styles.subtitle}>
          {activeTab === 'available'
            ? `${availableOrders.length} orders available`
            : `${assignedOrders.length} total deliveries`}
        </p>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const count =
            tab.key === 'available'
              ? availableOrders.length
              : assignedOrders.length;
          return (
            <button
              key={tab.key}
              style={{
                ...styles.tab,
                ...(activeTab === tab.key ? styles.activeTab : {}),
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              <TabIcon size={16} />
              {tab.label}
              <span
                style={{
                  ...styles.tabCount,
                  ...(activeTab === tab.key ? styles.activeTabCount : {}),
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Available Orders Tab */}
      {activeTab === 'available' && (
        <div>
          {availableOrders.length === 0 ? (
            <div style={styles.emptyState}>
              <FaBoxOpen size={56} color="#d1d5db" />
              <h3 style={styles.emptyTitle}>No Available Orders</h3>
              <p style={styles.emptyText}>
                There are no orders ready for pickup right now. Check back soon!
              </p>
            </div>
          ) : (
            <div style={styles.ordersList}>
              {availableOrders.map((order) => {
                const itemCount =
                  order.items?.length || order.order_items?.length || 0;
                return (
                  <div key={order.id} style={styles.orderCard}>
                    <div style={styles.cardRow}>
                      <div style={styles.cardLeft}>
                        <p style={styles.restaurantName}>
                          {order.restaurant_name ||
                            order.restaurant?.name ||
                            'Restaurant'}
                        </p>
                        <p style={styles.orderId}>Order #{order.id}</p>
                      </div>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            STATUS_COLORS[order.status] || '#4f46e5',
                        }}
                      >
                        {formatStatus(order.status || 'ready_for_pickup')}
                      </span>
                    </div>

                    <div style={styles.cardDetails}>
                      <div style={styles.detailRow}>
                        <FaMapMarkerAlt size={13} color="#6b7280" />
                        <span style={styles.detailText}>
                          {order.delivery_address ||
                            order.address ||
                            'Delivery address'}
                        </span>
                      </div>
                      <div style={styles.cardMeta}>
                        {itemCount > 0 && (
                          <span style={styles.metaItem}>
                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span style={styles.metaItem}>
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                    </div>

                    <div style={styles.cardFooter}>
                      <span style={styles.totalAmount}>
                        $
                        {parseFloat(
                          order.total_amount || order.grand_total || 0
                        ).toFixed(2)}
                      </span>
                      <button
                        style={styles.acceptBtn}
                        onClick={() => handleAcceptOrder(order.id)}
                        disabled={actionLoading === order.id}
                      >
                        {actionLoading === order.id
                          ? 'Accepting...'
                          : 'Accept'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Deliveries Tab */}
      {activeTab === 'my' && (
        <div>
          {assignedOrders.length === 0 ? (
            <div style={styles.emptyState}>
              <FaTruck size={56} color="#d1d5db" />
              <h3 style={styles.emptyTitle}>No Deliveries Yet</h3>
              <p style={styles.emptyText}>
                You haven&apos;t accepted any deliveries yet. Check the Available
                Orders tab to get started.
              </p>
            </div>
          ) : (
            <div>
              {/* Active Deliveries */}
              {activeAssigned.length > 0 && (
                <div style={styles.subsection}>
                  <h3 style={styles.subsectionTitle}>
                    Active Deliveries ({activeAssigned.length})
                  </h3>
                  <div style={styles.ordersList}>
                    {activeAssigned.map((order) => {
                      const action = getNextAction(order.status);
                      const itemCount =
                        order.items?.length || order.order_items?.length || 0;
                      return (
                        <div
                          key={order.id}
                          style={{
                            ...styles.orderCard,
                            borderLeft: `4px solid ${STATUS_COLORS[order.status] || '#6b7280'}`,
                          }}
                        >
                          <div style={styles.cardRow}>
                            <div style={styles.cardLeft}>
                              <p style={styles.restaurantName}>
                                {order.restaurant_name ||
                                  order.restaurant?.name ||
                                  'Restaurant'}
                              </p>
                              <p style={styles.orderId}>
                                Order #{order.id}
                                {itemCount > 0 &&
                                  ` \u00B7 ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
                              </p>
                            </div>
                            <span
                              style={{
                                ...styles.statusBadge,
                                backgroundColor:
                                  STATUS_COLORS[order.status] || '#6b7280',
                              }}
                            >
                              {formatStatus(order.status)}
                            </span>
                          </div>

                          <div style={styles.cardDetails}>
                            {order.customer_name && (
                              <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Customer:</span>
                                <span style={styles.detailText}>
                                  {order.customer_name}
                                </span>
                              </div>
                            )}
                            <div style={styles.detailRow}>
                              <FaMapMarkerAlt size={13} color="#6b7280" />
                              <span style={styles.detailText}>
                                {order.delivery_address ||
                                  order.address ||
                                  'Delivery address'}
                              </span>
                            </div>
                          </div>

                          <div style={styles.cardFooter}>
                            <span style={styles.totalAmount}>
                              $
                              {parseFloat(
                                order.total_amount || order.grand_total || 0
                              ).toFixed(2)}
                            </span>
                            {action && (
                              <button
                                style={{
                                  ...styles.statusActionBtn,
                                  backgroundColor: action.color,
                                }}
                                onClick={() =>
                                  handleStatusUpdate(order.id, action.nextStatus)
                                }
                                disabled={actionLoading === order.id}
                              >
                                {actionLoading === order.id
                                  ? 'Updating...'
                                  : action.label}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completed Deliveries */}
              {completedAssigned.length > 0 && (
                <div style={styles.subsection}>
                  <h3 style={styles.subsectionTitle}>
                    Completed ({completedAssigned.length})
                  </h3>
                  <div style={styles.ordersList}>
                    {completedAssigned.map((order) => {
                      const itemCount =
                        order.items?.length || order.order_items?.length || 0;
                      return (
                        <div
                          key={order.id}
                          style={{
                            ...styles.orderCard,
                            borderLeft: '4px solid #16a34a',
                            opacity: 0.85,
                          }}
                        >
                          <div style={styles.cardRow}>
                            <div style={styles.cardLeft}>
                              <p style={styles.restaurantName}>
                                {order.restaurant_name ||
                                  order.restaurant?.name ||
                                  'Restaurant'}
                              </p>
                              <p style={styles.orderId}>
                                Order #{order.id}
                                {itemCount > 0 &&
                                  ` \u00B7 ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
                              </p>
                            </div>
                            <div style={styles.completedBadge}>
                              <FaCheckCircle size={16} color="#16a34a" />
                              <span style={styles.completedText}>Delivered</span>
                            </div>
                          </div>

                          <div style={styles.cardDetails}>
                            {order.customer_name && (
                              <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Customer:</span>
                                <span style={styles.detailText}>
                                  {order.customer_name}
                                </span>
                              </div>
                            )}
                            <div style={styles.detailRow}>
                              <FaMapMarkerAlt size={13} color="#6b7280" />
                              <span style={styles.detailText}>
                                {order.delivery_address ||
                                  order.address ||
                                  'Delivery address'}
                              </span>
                            </div>
                          </div>

                          <div style={styles.cardFooter}>
                            <span style={styles.totalAmount}>
                              $
                              {parseFloat(
                                order.total_amount || order.grand_total || 0
                              ).toFixed(2)}
                            </span>
                            <span style={styles.deliveredDate}>
                              {formatDate(order.updated_at || order.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  tabsContainer: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    borderBottom: '2px solid #f3f4f6',
    paddingBottom: 0,
    overflowX: 'auto',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 18px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    transition: 'color 0.2s, border-color 0.2s',
    whiteSpace: 'nowrap',
  },
  activeTab: {
    color: '#4f46e5',
    borderBottom: '2px solid #4f46e5',
  },
  tabCount: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 22,
    height: 22,
    padding: '0 6px',
    borderRadius: 11,
    backgroundColor: '#f3f4f6',
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
  },
  activeTabCount: {
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
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
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#374151',
    margin: 0,
    marginTop: 16,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 8,
    maxWidth: 320,
  },
  subsection: {
    marginBottom: 32,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#374151',
    margin: 0,
    marginBottom: 12,
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
    transition: 'box-shadow 0.2s, border-color 0.2s',
  },
  cardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardLeft: {
    flex: 1,
    minWidth: 0,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  orderId: {
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
    marginLeft: 12,
    flexShrink: 0,
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 14,
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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardMeta: {
    display: 'flex',
    gap: 16,
    marginTop: 4,
  },
  metaItem: {
    fontSize: 13,
    color: '#6b7280',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTop: '1px solid #f3f4f6',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
  },
  acceptBtn: {
    padding: '10px 28px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    transition: 'opacity 0.2s',
  },
  statusActionBtn: {
    padding: '10px 24px',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    transition: 'opacity 0.2s',
  },
  completedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    marginLeft: 12,
  },
  completedText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#16a34a',
  },
  deliveredDate: {
    fontSize: 13,
    color: '#6b7280',
  },
};
