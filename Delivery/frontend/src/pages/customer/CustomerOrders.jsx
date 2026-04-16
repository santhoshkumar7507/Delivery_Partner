import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiShoppingBag, FiSearch } from 'react-icons/fi';
import API from '../../api/axios';

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

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const ACTIVE_STATUSES = [
  'placed',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'picked_up',
  'on_the_way',
];

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

export default function CustomerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/orders/my-orders/');
        setOrders(data.results || data);
      } catch (err) {
        if (err.response?.status !== 401) {
          setError('Failed to load your orders.');
          toast.error('Could not fetch orders.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    switch (activeFilter) {
      case 'active':
        return orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
      case 'delivered':
        return orders.filter((o) => o.status === 'delivered');
      case 'cancelled':
        return orders.filter((o) => o.status === 'cancelled');
      default:
        return orders;
    }
  }, [orders, activeFilter]);

  const tabCounts = useMemo(() => ({
    all: orders.length,
    active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }), [orders]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading your orders...</p>
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
      <div style={styles.header}>
        <h1 style={styles.title}>My Orders</h1>
        <p style={styles.subtitle}>{orders.length} total orders</p>
      </div>

      {/* Filter Tabs */}
      <div style={styles.tabsContainer}>
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            style={{
              ...styles.tab,
              ...(activeFilter === tab.key ? styles.activeTab : {}),
            }}
            onClick={() => setActiveFilter(tab.key)}
          >
            {tab.label}
            <span
              style={{
                ...styles.tabCount,
                ...(activeFilter === tab.key ? styles.activeTabCount : {}),
              }}
            >
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div style={styles.emptyState}>
          <FiShoppingBag size={56} color="#d1d5db" />
          <h3 style={styles.emptyTitle}>
            {activeFilter === 'all' ? 'No orders yet' : `No ${activeFilter} orders`}
          </h3>
          <p style={styles.emptyText}>
            {activeFilter === 'all'
              ? "You haven't placed any orders yet. Start browsing restaurants!"
              : `You don't have any ${activeFilter} orders right now.`}
          </p>
          {activeFilter === 'all' && (
            <button
              style={styles.browseBtn}
              onClick={() => navigate('/restaurants')}
            >
              <FiSearch size={16} />
              Browse Restaurants
            </button>
          )}
        </div>
      ) : (
        <div style={styles.ordersList}>
          {filteredOrders.map((order) => {
            const itemCount =
              order.items?.length || order.order_items?.length || 0;

            return (
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
                <div style={styles.cardRow}>
                  <div style={styles.cardLeft}>
                    <p style={styles.restaurantName}>
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

                <div style={styles.cardDetails}>
                  <span style={styles.detailItem}>
                    {formatDate(order.created_at)}
                  </span>
                  {itemCount > 0 && (
                    <span style={styles.detailItem}>
                      {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div style={styles.cardFooter}>
                  <span style={styles.totalAmount}>
                    ${parseFloat(order.total_amount || order.grand_total || 0).toFixed(2)}
                  </span>
                  <span style={styles.viewDetail}>View Details &rarr;</span>
                </div>
              </div>
            );
          })}
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
    gap: 6,
    padding: '10px 16px',
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
    color: '#ef4444',
    borderBottom: '2px solid #ef4444',
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
    backgroundColor: '#fef2f2',
    color: '#ef4444',
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
    marginBottom: 24,
    maxWidth: 320,
  },
  browseBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 24px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
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
    transition: 'box-shadow 0.2s, border-color 0.2s',
  },
  cardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
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
    padding: '4px 12px',
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
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    fontSize: 13,
    color: '#6b7280',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTop: '1px solid #f3f4f6',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
  },
  viewDetail: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: 500,
  },
};
