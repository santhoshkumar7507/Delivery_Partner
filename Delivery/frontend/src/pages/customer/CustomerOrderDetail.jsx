import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiMapPin,
  FiUser,
  FiPhone,
  FiXCircle,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiPackage,
} from 'react-icons/fi';
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

const STATUS_SEQUENCE = [
  'placed',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'picked_up',
  'on_the_way',
  'delivered',
];

const STATUS_ICONS = {
  placed: FiClock,
  confirmed: FiCheckCircle,
  preparing: FiPackage,
  ready_for_pickup: FiPackage,
  picked_up: FiTruck,
  on_the_way: FiTruck,
  delivered: FiCheckCircle,
  cancelled: FiXCircle,
};

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

export default function CustomerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/orders/my-orders/${id}/`);
        setOrder(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Order not found.');
        } else {
          setError('Failed to load order details.');
        }
        toast.error('Could not fetch order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancelling(true);
      await API.post(`/orders/${id}/cancel/`);
      setOrder((prev) => ({ ...prev, status: 'cancelled' }));
      toast.success('Order cancelled successfully.');
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to cancel order.';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>{error}</p>
        <button
          style={styles.backBtn}
          onClick={() => navigate('/customer/orders')}
        >
          <FiArrowLeft size={16} /> Back to Orders
        </button>
      </div>
    );
  }

  if (!order) return null;

  const items = order.items || order.order_items || [];
  const subtotal = items.reduce(
    (sum, item) =>
      sum + parseFloat(item.price || item.unit_price || 0) * (item.quantity || item.qty || 1),
    0
  );
  const deliveryFee = parseFloat(order.delivery_fee || 0);
  const grandTotal = parseFloat(order.total_amount || order.grand_total || subtotal + deliveryFee);

  const currentStatusIndex = STATUS_SEQUENCE.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const statusHistory = order.status_history || order.status_updates || [];
  const deliveryPartner = order.delivery_partner || order.delivery_person || null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <button
          style={styles.backLink}
          onClick={() => navigate('/customer/orders')}
        >
          <FiArrowLeft size={18} /> Back to Orders
        </button>
      </div>

      <div style={styles.titleRow}>
        <div>
          <h1 style={styles.title}>Order #{order.id}</h1>
          <p style={styles.restaurantName}>
            {order.restaurant_name || order.restaurant?.name || 'Restaurant'}
          </p>
        </div>
        <span
          style={{
            ...styles.statusBadgeLarge,
            backgroundColor: STATUS_COLORS[order.status] || '#6b7280',
          }}
        >
          {formatStatus(order.status)}
        </span>
      </div>

      {/* Status Timeline */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Order Progress</h2>
        {isCancelled ? (
          <div style={styles.cancelledBanner}>
            <FiXCircle size={24} color="#ef4444" />
            <div>
              <p style={styles.cancelledText}>This order has been cancelled</p>
              {statusHistory.length > 0 && (
                <p style={styles.cancelledDate}>
                  {formatDate(
                    statusHistory.find((s) => s.status === 'cancelled')?.timestamp ||
                      statusHistory[statusHistory.length - 1]?.timestamp
                  )}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div style={styles.timeline}>
            {STATUS_SEQUENCE.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const Icon = STATUS_ICONS[status] || FiClock;
              const historyEntry = statusHistory.find((h) => h.status === status);

              return (
                <div key={status} style={styles.timelineStep}>
                  <div style={styles.timelineIndicator}>
                    <div
                      style={{
                        ...styles.timelineDot,
                        backgroundColor: isCompleted
                          ? STATUS_COLORS[status]
                          : '#e5e7eb',
                        ...(isCurrent ? { boxShadow: `0 0 0 4px ${STATUS_COLORS[status]}33` } : {}),
                      }}
                    >
                      <Icon size={14} color={isCompleted ? '#fff' : '#9ca3af'} />
                    </div>
                    {index < STATUS_SEQUENCE.length - 1 && (
                      <div
                        style={{
                          ...styles.timelineLine,
                          backgroundColor:
                            index < currentStatusIndex ? STATUS_COLORS[STATUS_SEQUENCE[index + 1]] : '#e5e7eb',
                        }}
                      />
                    )}
                  </div>
                  <div style={styles.timelineContent}>
                    <p
                      style={{
                        ...styles.timelineLabel,
                        color: isCompleted ? '#111827' : '#9ca3af',
                        fontWeight: isCurrent ? 700 : 500,
                      }}
                    >
                      {formatStatus(status)}
                    </p>
                    {historyEntry?.timestamp && (
                      <p style={styles.timelineDate}>
                        {formatDate(historyEntry.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Order Items</h2>
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={{ ...styles.tableCell, flex: 3 }}>Item</span>
            <span style={{ ...styles.tableCell, flex: 1, textAlign: 'center' }}>Qty</span>
            <span style={{ ...styles.tableCell, flex: 1, textAlign: 'right' }}>Price</span>
            <span style={{ ...styles.tableCell, flex: 1, textAlign: 'right' }}>Subtotal</span>
          </div>
          {items.map((item, idx) => {
            const qty = item.quantity || item.qty || 1;
            const price = parseFloat(item.price || item.unit_price || 0);
            const itemSubtotal = qty * price;

            return (
              <div key={item.id || idx} style={styles.tableRow}>
                <span style={{ ...styles.tableCell, flex: 3, fontWeight: 500 }}>
                  {item.name || item.item_name || item.menu_item_name || `Item ${idx + 1}`}
                </span>
                <span style={{ ...styles.tableCell, flex: 1, textAlign: 'center', color: '#6b7280' }}>
                  {qty}
                </span>
                <span style={{ ...styles.tableCell, flex: 1, textAlign: 'right', color: '#6b7280' }}>
                  ${price.toFixed(2)}
                </span>
                <span style={{ ...styles.tableCell, flex: 1, textAlign: 'right', fontWeight: 600 }}>
                  ${itemSubtotal.toFixed(2)}
                </span>
              </div>
            );
          })}
          {items.length === 0 && (
            <div style={styles.tableRow}>
              <span style={{ ...styles.tableCell, flex: 1, color: '#9ca3af', textAlign: 'center' }}>
                No items information available
              </span>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div style={styles.priceBreakdown}>
          <div style={styles.priceRow}>
            <span style={styles.priceLabel}>Subtotal</span>
            <span style={styles.priceValue}>${subtotal.toFixed(2)}</span>
          </div>
          <div style={styles.priceRow}>
            <span style={styles.priceLabel}>Delivery Fee</span>
            <span style={styles.priceValue}>${deliveryFee.toFixed(2)}</span>
          </div>
          <div style={styles.priceDivider} />
          <div style={styles.priceRow}>
            <span style={styles.grandTotalLabel}>Grand Total</span>
            <span style={styles.grandTotalValue}>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      {(order.delivery_address || order.address) && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Delivery Address</h2>
          <div style={styles.addressRow}>
            <FiMapPin size={18} color="#6b7280" />
            <p style={styles.addressText}>
              {order.delivery_address || order.address}
            </p>
          </div>
        </div>
      )}

      {/* Delivery Partner */}
      {deliveryPartner && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Delivery Partner</h2>
          <div style={styles.partnerInfo}>
            <div style={styles.partnerAvatar}>
              <FiUser size={24} color="#6b7280" />
            </div>
            <div>
              <p style={styles.partnerName}>
                {deliveryPartner.name ||
                  deliveryPartner.full_name ||
                  `${deliveryPartner.first_name || ''} ${deliveryPartner.last_name || ''}`.trim() ||
                  'Assigned Partner'}
              </p>
              {(deliveryPartner.phone || deliveryPartner.phone_number) && (
                <p style={styles.partnerPhone}>
                  <FiPhone size={14} />
                  {deliveryPartner.phone || deliveryPartner.phone_number}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Button */}
      {order.status === 'placed' && (
        <div style={styles.actionsSection}>
          <button
            style={styles.cancelBtn}
            onClick={handleCancel}
            disabled={cancelling}
          >
            <FiXCircle size={18} />
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 800,
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
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
  },
  headerRow: {
    marginBottom: 16,
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    padding: 0,
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  restaurantName: {
    fontSize: 16,
    color: '#6b7280',
    margin: 0,
    marginTop: 4,
  },
  statusBadgeLarge: {
    display: 'inline-block',
    padding: '6px 18px',
    borderRadius: 24,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    padding: 24,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#111827',
    margin: 0,
    marginBottom: 20,
  },
  cancelledBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    border: '1px solid #fecaca',
  },
  cancelledText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#991b1b',
    margin: 0,
  },
  cancelledDate: {
    fontSize: 13,
    color: '#b91c1c',
    margin: 0,
    marginTop: 2,
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  timelineStep: {
    display: 'flex',
    gap: 16,
    minHeight: 56,
  },
  timelineIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 32,
    flexShrink: 0,
  },
  timelineDot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: '50%',
    flexShrink: 0,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginTop: 4,
    marginBottom: 4,
  },
  timelineContent: {
    paddingBottom: 16,
    flex: 1,
    paddingTop: 5,
  },
  timelineLabel: {
    fontSize: 14,
    margin: 0,
  },
  timelineDate: {
    fontSize: 12,
    color: '#9ca3af',
    margin: 0,
    marginTop: 2,
  },
  table: {
    border: '1px solid #f3f4f6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #f3f4f6',
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableRow: {
    display: 'flex',
    padding: '14px 16px',
    borderBottom: '1px solid #f9fafb',
    fontSize: 14,
    color: '#111827',
    alignItems: 'center',
  },
  tableCell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  priceBreakdown: {
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px solid #f3f4f6',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: 500,
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    margin: '12px 0',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 700,
    color: '#111827',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111827',
  },
  addressRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    margin: 0,
    lineHeight: 1.6,
  },
  partnerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  partnerAvatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    flexShrink: 0,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#111827',
    margin: 0,
  },
  partnerPhone: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#6b7280',
    margin: 0,
    marginTop: 4,
  },
  actionsSection: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0 32px',
  },
  cancelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 32px',
    backgroundColor: '#fff',
    color: '#ef4444',
    border: '2px solid #ef4444',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    transition: 'background-color 0.2s',
  },
};
