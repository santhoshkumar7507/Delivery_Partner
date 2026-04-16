import { useState, useEffect, useCallback } from 'react';
import {
  FaBell,
  FaCheckDouble,
  FaCheck,
  FaShoppingBag,
  FaTruck,
  FaStore,
  FaUserCheck,
  FaInfoCircle,
  FaBoxOpen,
  FaTimesCircle,
  FaMotorcycle,
  FaClipboardCheck,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNotifications } from '../context/NotificationContext';

/* Map notification_type -> icon & color */
const TYPE_CONFIG = {
  order_placed: { icon: FaShoppingBag, color: '#3498db' },
  order_confirmed: { icon: FaClipboardCheck, color: '#2ecc71' },
  order_preparing: { icon: FaStore, color: '#e67e22' },
  order_ready: { icon: FaBoxOpen, color: '#27ae60' },
  order_picked_up: { icon: FaMotorcycle, color: '#8e44ad' },
  order_on_the_way: { icon: FaTruck, color: '#2980b9' },
  order_delivered: { icon: FaCheck, color: '#27ae60' },
  order_cancelled: { icon: FaTimesCircle, color: '#e74c3c' },
  new_order: { icon: FaBell, color: '#E23744' },
  delivery_assigned: { icon: FaTruck, color: '#3498db' },
  account_approved: { icon: FaUserCheck, color: '#2ecc71' },
  general: { icon: FaInfoCircle, color: '#696969' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const styles = {
  wrapper: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '32px 20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1c1c1c',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: 0,
  },
  markAllBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    background: '#E23744',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  },
  tab: {
    padding: '8px 20px',
    borderRadius: '24px',
    border: '1.5px solid #e0e0e0',
    background: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a4a4a',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#E23744',
    color: '#fff',
    borderColor: '#E23744',
  },
  card: {
    display: 'flex',
    gap: '16px',
    padding: '18px 20px',
    background: '#fff',
    borderRadius: '12px',
    marginBottom: '12px',
    border: '1px solid #f0f0f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    transition: 'background 0.2s',
    alignItems: 'flex-start',
  },
  cardUnread: {
    background: '#fff8f8',
    borderColor: '#fce4e4',
    boxShadow: '0 1px 8px rgba(226, 55, 68, 0.08)',
  },
  iconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1c1c1c',
    margin: '0 0 4px',
    lineHeight: '1.3',
  },
  cardMessage: {
    fontSize: '14px',
    color: '#696969',
    margin: '0 0 6px',
    lineHeight: '1.45',
  },
  cardTime: {
    fontSize: '12px',
    color: '#9e9e9e',
  },
  readBtn: {
    padding: '6px 12px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '6px',
    background: '#fff',
    fontSize: '12px',
    color: '#696969',
    cursor: 'pointer',
    flexShrink: 0,
    alignSelf: 'center',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s',
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#E23744',
    flexShrink: 0,
    alignSelf: 'center',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#696969',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #f0f0f0',
    borderTop: '3px solid #E23744',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 14px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#9e9e9e',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    opacity: 0.3,
  },
};

export default function NotificationsPage() {
  const {
    notifications,
    fetchNotifications,
    markAsRead,
    markAllRead,
  } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      await fetchNotifications();
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const displayed =
    filter === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div style={styles.wrapper}>
      {/* Spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FaBell color="#E23744" /> Notifications
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: '14px',
                background: '#E23744',
                color: '#fff',
                borderRadius: '12px',
                padding: '2px 10px',
                fontWeight: '600',
              }}
            >
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button style={styles.markAllBtn} onClick={handleMarkAllRead}>
            <FaCheckDouble /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={styles.filterTabs}>
        <button
          style={{
            ...styles.tab,
            ...(filter === 'all' ? styles.tabActive : {}),
          }}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(filter === 'unread' ? styles.tabActive : {}),
          }}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p>Loading notifications...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && displayed.length === 0 && (
        <div style={styles.emptyState}>
          <FaBell style={styles.emptyIcon} />
          <p style={{ fontSize: '16px', marginBottom: '4px' }}>
            {filter === 'unread'
              ? 'No unread notifications'
              : 'No notifications yet'}
          </p>
          <p style={{ fontSize: '14px' }}>
            {filter === 'unread'
              ? 'You\'re all caught up!'
              : 'Notifications about your orders and account will appear here.'}
          </p>
        </div>
      )}

      {/* Notification list */}
      {!loading &&
        displayed.map((notification) => {
          const config =
            TYPE_CONFIG[notification.notification_type] || TYPE_CONFIG.general;
          const Icon = config.icon;
          const isUnread = !notification.is_read;

          return (
            <div
              key={notification.id}
              style={{
                ...styles.card,
                ...(isUnread ? styles.cardUnread : {}),
              }}
            >
              <div
                style={{
                  ...styles.iconWrapper,
                  background: `${config.color}15`,
                }}
              >
                <Icon style={{ fontSize: '20px', color: config.color }} />
              </div>

              <div style={styles.cardBody}>
                <p style={styles.cardTitle}>{notification.title}</p>
                <p style={styles.cardMessage}>{notification.message}</p>
                <span style={styles.cardTime}>
                  {timeAgo(notification.created_at)}
                </span>
              </div>

              {isUnread && (
                <>
                  <button
                    style={styles.readBtn}
                    onClick={() => handleMarkRead(notification.id)}
                    title="Mark as read"
                  >
                    <FaCheck size={10} /> Read
                  </button>
                  <div style={styles.unreadDot} />
                </>
              )}
            </div>
          );
        })}
    </div>
  );
}
