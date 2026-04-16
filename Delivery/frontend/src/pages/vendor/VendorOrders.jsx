import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import {
  FaClipboardList,
  FaCheck,
  FaFire,
  FaBoxOpen,
  FaArrowLeft,
  FaSyncAlt,
} from 'react-icons/fa';

const BRAND = '#E23744';

const STATUS_COLORS = {
  placed: { bg: '#fff3e0', color: '#e65100', label: 'New' },
  confirmed: { bg: '#e3f2fd', color: '#1565c0', label: 'Confirmed' },
  preparing: { bg: '#fce4ec', color: BRAND, label: 'Preparing' },
  ready_for_pickup: { bg: '#e8f5e9', color: '#2e7d32', label: 'Ready' },
  out_for_delivery: { bg: '#ede7f6', color: '#4527a0', label: 'Out for Delivery' },
  delivered: { bg: '#e8f5e9', color: '#1b5e20', label: 'Delivered' },
  cancelled: { bg: '#fafafa', color: '#757575', label: 'Cancelled' },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'placed', label: 'New' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready_for_pickup', label: 'Ready' },
];

const styles = {
  container: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: '32px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#696969',
    textDecoration: 'none',
    fontSize: 14,
    marginBottom: 20,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1c1c1c',
    margin: 0,
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: '#fff',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    color: '#333',
  },
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  tab: (active) => ({
    padding: '8px 20px',
    borderRadius: 24,
    border: active ? `2px solid ${BRAND}` : '2px solid #eee',
    background: active ? '#fce4ec' : '#fff',
    color: active ? BRAND : '#696969',
    fontWeight: active ? 600 : 500,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  orderCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 16,
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1c1c1c',
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: (status) => {
    const s = STATUS_COLORS[status] || { bg: '#f5f5f5', color: '#333', label: status };
    return {
      display: 'inline-block',
      padding: '4px 14px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
    };
  },
  customerInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  itemsList: {
    fontSize: 13,
    color: '#696969',
    lineHeight: 1.6,
    marginBottom: 12,
    padding: '10px 14px',
    background: '#fafafa',
    borderRadius: 8,
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTop: '1px solid #f0f0f0',
  },
  total: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1c1c1c',
  },
  actionBtn: (bg) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 20px',
    background: bg || BRAND,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  }),
  actionBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  empty: {
    textAlign: 'center',
    padding: 60,
    color: '#696969',
    fontSize: 15,
  },
  loading: {
    textAlign: 'center',
    padding: 60,
    fontSize: 16,
    color: '#696969',
  },
  autoRefresh: {
    fontSize: 12,
    color: '#999',
    marginLeft: 12,
  },
};

export default function VendorOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const intervalRef = useRef(null);

  const fetchOrders = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await API.get('/orders/vendor/');
      const list = Array.isArray(data) ? data : data.results || [];
      setOrders(list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)));
    } catch (err) {
      if (showLoading && err.response?.status !== 401) toast.error('Failed to load orders');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(true);
    intervalRef.current = setInterval(() => fetchOrders(false), 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await API.put(`/orders/vendor/${orderId}/update-status/`, {
        status: newStatus,
        notes: '',
      });
      toast.success(`Order #${orderId} ${statusLabel(newStatus)}`);
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to update status';
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const statusLabel = (status) => {
    return STATUS_COLORS[status]?.label || status;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatItems = (order) => {
    if (order.items && Array.isArray(order.items)) {
      return order.items
        .map(
          (item) =>
            `${item.menu_item_name || item.name || 'Item'} x${item.quantity}`
        )
        .join(', ');
    }
    if (order.order_items && Array.isArray(order.order_items)) {
      return order.order_items
        .map(
          (item) =>
            `${item.menu_item_name || item.name || 'Item'} x${item.quantity}`
        )
        .join(', ');
    }
    return 'No items info';
  };

  const getActionButton = (order) => {
    const isUpdating = updatingId === order.id;

    switch (order.status) {
      case 'placed':
        return (
          <button
            style={{
              ...styles.actionBtn('#1565c0'),
              ...(isUpdating ? styles.actionBtnDisabled : {}),
            }}
            disabled={isUpdating}
            onClick={() => updateStatus(order.id, 'confirmed')}
          >
            <FaCheck /> {isUpdating ? 'Updating...' : 'Confirm'}
          </button>
        );
      case 'confirmed':
        return (
          <button
            style={{
              ...styles.actionBtn('#e65100'),
              ...(isUpdating ? styles.actionBtnDisabled : {}),
            }}
            disabled={isUpdating}
            onClick={() => updateStatus(order.id, 'preparing')}
          >
            <FaFire /> {isUpdating ? 'Updating...' : 'Start Preparing'}
          </button>
        );
      case 'preparing':
        return (
          <button
            style={{
              ...styles.actionBtn('#2e7d32'),
              ...(isUpdating ? styles.actionBtnDisabled : {}),
            }}
            disabled={isUpdating}
            onClick={() => updateStatus(order.id, 'ready_for_pickup')}
          >
            <FaBoxOpen /> {isUpdating ? 'Updating...' : 'Ready for Pickup'}
          </button>
        );
      default:
        return null;
    }
  };

  const filteredOrders =
    activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab);

  if (loading) {
    return <div style={styles.loading}>Loading orders...</div>;
  }

  return (
    <div style={styles.container}>
      <button style={styles.backLink} onClick={() => navigate('/vendor')}>
        <FaArrowLeft /> Back to Dashboard
      </button>

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <FaClipboardList style={{ fontSize: 26, color: BRAND }} />
          <h1 style={styles.title}>Orders</h1>
          <span style={styles.autoRefresh}>High Frequency Auto-refresh (5s)</span>
        </div>
        <button style={styles.refreshBtn} onClick={() => fetchOrders(true)}>
          <FaSyncAlt /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={styles.tabs}>
        {TABS.map((tab) => {
          const count =
            tab.key === 'all'
              ? orders.length
              : orders.filter((o) => o.status === tab.key).length;
          return (
            <button
              key={tab.key}
              style={styles.tab(activeTab === tab.key)}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div style={styles.empty}>
          <FaClipboardList style={{ fontSize: 40, color: '#ddd', marginBottom: 12 }} />
          <div>No orders found{activeTab !== 'all' ? ` with status "${statusLabel(activeTab)}"` : ''}.</div>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <div style={styles.orderHeader}>
              <div>
                <div style={styles.orderId}>Order #{order.id}</div>
                <div style={styles.orderTime}>{formatTime(order.created_at)}</div>
              </div>
              <span style={styles.statusBadge(order.status)}>
                {statusLabel(order.status)}
              </span>
            </div>

            <div style={styles.customerInfo}>
              <strong>Customer:</strong>{' '}
              {order.customer_name || order.user?.username || order.user?.first_name || 'N/A'}
              {order.delivery_address && (
                <span style={{ color: '#999', marginLeft: 8 }}>
                  | {order.delivery_address}
                </span>
              )}
            </div>

            <div style={styles.itemsList}>{formatItems(order)}</div>

            <div style={styles.orderFooter}>
              <div style={styles.total}>
                {'\u20B9'}{parseFloat(order.total_amount || order.total || 0).toFixed(2)}
              </div>
              {getActionButton(order)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
