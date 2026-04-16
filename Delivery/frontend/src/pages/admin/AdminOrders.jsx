import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import { FaClipboardList, FaSearch, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

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

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'on_the_way', label: 'On the Way' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_COLORS = {
  paid: { bg: '#dcfce7', color: '#16a34a' },
  pending: { bg: '#fef3c7', color: '#b45309' },
  failed: { bg: '#fee2e2', color: '#dc2626' },
  refunded: { bg: '#dbeafe', color: '#1d4ed8' },
  cod: { bg: '#f3e8ff', color: '#7c3aed' },
};

const PAGE_SIZE = 15;

const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1f2937',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  controls: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    color: '#9ca3af',
    fontSize: 14,
    pointerEvents: 'none',
  },
  searchInput: {
    padding: '10px 12px 10px 36px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    width: 240,
    outline: 'none',
  },
  select: {
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    background: '#fff',
    color: '#374151',
    cursor: 'pointer',
    outline: 'none',
  },
  sortBtn: {
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 13,
    background: '#fff',
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 500,
  },
  sortBtnActive: {
    background: '#eef2ff',
    borderColor: '#818cf8',
    color: '#4f46e5',
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '2px solid #e5e7eb',
    color: '#6b7280',
    fontWeight: 600,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: '#f9fafb',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    color: '#374151',
    whiteSpace: 'nowrap',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  paymentBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: 14,
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  expandedRow: {
    background: '#f9fafb',
  },
  expandedCell: {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
  },
  expandedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    fontSize: 13,
  },
  expandedLabel: {
    fontWeight: 600,
    color: '#6b7280',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 2,
  },
  expandedValue: {
    color: '#1f2937',
    fontWeight: 500,
  },
  itemsList: {
    margin: '8px 0 0 0',
    padding: 0,
    listStyle: 'none',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    fontSize: 13,
    borderBottom: '1px dashed #e5e7eb',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderTop: '1px solid #e5e7eb',
    fontSize: 14,
    color: '#6b7280',
  },
  pageBtn: {
    padding: '8px 14px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#374151',
    fontWeight: 500,
  },
  pageBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
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
  emptyState: {
    textAlign: 'center',
    padding: '48px 16px',
    color: '#9ca3af',
    fontSize: 15,
  },
  resultCount: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) {
        params.restaurant = search.trim();
        params.customer = search.trim();
      }

      const orderingMap = {
        date: 'created_at',
        amount: 'total_amount',
      };
      const orderField = orderingMap[sortField] || 'created_at';
      params.ordering = sortDir === 'desc' ? `-${orderField}` : orderField;

      params.page = page;
      params.page_size = PAGE_SIZE;

      const { data } = await API.get('/orders/admin/all/', { params });

      if (Array.isArray(data)) {
        setOrders(data);
        setTotalCount(data.length);
      } else {
        setOrders(data.results || []);
        setTotalCount(data.count || 0);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, sortField, sortDir, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (val) => {
    return `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusStyle = (status) => {
    const color = STATUS_COLORS[status] || '#6b7280';
    return {
      ...styles.statusBadge,
      background: `${color}18`,
      color,
    };
  };

  const getPaymentStyle = (status) => {
    const s = PAYMENT_COLORS[status] || PAYMENT_COLORS.pending;
    return {
      ...styles.paymentBadge,
      background: s.bg,
      color: s.color,
    };
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'desc' ? <FaSortAmountDown size={10} /> : <FaSortAmountUp size={10} />;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}><FaClipboardList color="#f97316" /> Order Management</h1>
        <div style={styles.controls}>
          <div style={styles.searchWrapper}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search customer or restaurant..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.select}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            style={{ ...styles.sortBtn, ...(sortField === 'date' ? styles.sortBtnActive : {}) }}
            onClick={() => toggleSort('date')}
          >
            Date <SortIcon field="date" />
          </button>
          <button
            style={{ ...styles.sortBtn, ...(sortField === 'amount' ? styles.sortBtnActive : {}) }}
            onClick={() => toggleSort('amount')}
          >
            Amount <SortIcon field="amount" />
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.resultCount}>
        {totalCount} order{totalCount !== 1 ? 's' : ''} found
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.loading}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={styles.emptyState}>No orders found matching your criteria.</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: 40 }}></th>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Restaurant</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('amount')}>
                      Total <SortIcon field="amount" />
                    </th>
                    <th style={styles.th}>Payment</th>
                    <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('date')}>
                      Date <SortIcon field="date" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => {
                    const isExpanded = expandedId === order.id;
                    return (
                      <>
                        <tr
                          key={order.id}
                          style={{
                            background: idx % 2 === 0 ? '#fff' : '#f9fafb',
                            cursor: 'pointer',
                          }}
                          onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        >
                          <td style={styles.td}>
                            <button style={styles.expandBtn}>
                              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                          </td>
                          <td style={{ ...styles.td, fontWeight: 600 }}>#{order.id}</td>
                          <td style={styles.td}>
                            {order.customer_name || order.customer?.username || order.customer?.first_name || `User #${order.customer}`}
                          </td>
                          <td style={styles.td}>
                            {order.restaurant_name || order.restaurant?.name || `Restaurant #${order.restaurant}`}
                          </td>
                          <td style={styles.td}>
                            <span style={getStatusStyle(order.status)}>
                              {(order.status || '').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ ...styles.td, fontWeight: 500 }}>
                            {formatCurrency(order.total_amount || order.total)}
                          </td>
                          <td style={styles.td}>
                            <span style={getPaymentStyle(order.payment_status)}>
                              {order.payment_status || 'pending'}
                            </span>
                          </td>
                          <td style={styles.td}>{formatDate(order.created_at)}</td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${order.id}-detail`} style={styles.expandedRow}>
                            <td colSpan={8} style={styles.expandedCell}>
                              <div style={styles.expandedGrid}>
                                <div>
                                  <div style={styles.expandedLabel}>Customer Details</div>
                                  <div style={styles.expandedValue}>
                                    {order.customer_name || order.customer?.username || `User #${order.customer}`}
                                  </div>
                                  {order.customer?.email && (
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>{order.customer.email}</div>
                                  )}
                                </div>
                                <div>
                                  <div style={styles.expandedLabel}>Delivery Address</div>
                                  <div style={{ ...styles.expandedValue, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                    {order.delivery_address || order.address || '-'}
                                  </div>
                                </div>
                                <div>
                                  <div style={styles.expandedLabel}>Payment Method</div>
                                  <div style={styles.expandedValue}>
                                    {(order.payment_method || 'N/A').replace(/_/g, ' ')}
                                  </div>
                                </div>
                                <div>
                                  <div style={styles.expandedLabel}>Delivery Partner</div>
                                  <div style={styles.expandedValue}>
                                    {order.delivery_partner_name || order.delivery_partner?.username || (order.delivery_partner ? `Partner #${order.delivery_partner}` : 'Not assigned')}
                                  </div>
                                </div>
                              </div>

                              {/* Order Items */}
                              {order.items && order.items.length > 0 && (
                                <div style={{ marginTop: 16 }}>
                                  <div style={styles.expandedLabel}>Order Items</div>
                                  <ul style={styles.itemsList}>
                                    {order.items.map((item, i) => (
                                      <li key={i} style={styles.itemRow}>
                                        <span>
                                          {item.menu_item_name || item.name || `Item #${item.menu_item || item.id}`}
                                          {' '}
                                          <span style={{ color: '#9ca3af' }}>x{item.quantity}</span>
                                        </span>
                                        <span style={{ fontWeight: 500 }}>
                                          {formatCurrency(item.subtotal || (item.price * item.quantity))}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '8px 0 0',
                                    fontWeight: 700,
                                    fontSize: 14,
                                    color: '#1f2937',
                                    borderTop: '2px solid #e5e7eb',
                                    marginTop: 4,
                                  }}>
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total_amount || order.total)}</span>
                                  </div>
                                </div>
                              )}

                              {order.special_instructions && (
                                <div style={{ marginTop: 12 }}>
                                  <div style={styles.expandedLabel}>Special Instructions</div>
                                  <div style={{ ...styles.expandedValue, fontStyle: 'italic', whiteSpace: 'normal' }}>
                                    {order.special_instructions}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={styles.pagination}>
              <span>Page {page} of {totalPages} ({totalCount} total)</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{ ...styles.pageBtn, ...(page <= 1 ? styles.pageBtnDisabled : {}) }}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <FaChevronLeft size={12} /> Previous
                </button>
                <button
                  style={{ ...styles.pageBtn, ...(page >= totalPages ? styles.pageBtnDisabled : {}) }}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next <FaChevronRight size={12} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
