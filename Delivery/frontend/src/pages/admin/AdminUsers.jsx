import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import { FaUsers, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
    width: 260,
    outline: 'none',
    transition: 'border-color 0.15s',
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
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    color: '#374151',
    whiteSpace: 'nowrap',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
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
    transition: 'background 0.15s',
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

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'customer', label: 'Customer' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'delivery_partner', label: 'Delivery Partner' },
  { value: 'admin', label: 'Admin' },
];

const ROLE_COLORS = {
  customer: { bg: '#dbeafe', color: '#1d4ed8' },
  vendor: { bg: '#ede9fe', color: '#6d28d9' },
  delivery_partner: { bg: '#ccfbf1', color: '#0d9488' },
  admin: { bg: '#fee2e2', color: '#dc2626' },
};

const PAGE_SIZE = 15;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (activeFilter !== '') params.is_active = activeFilter;
      params.page = page;
      params.page_size = PAGE_SIZE;

      const { data } = await API.get('/auth/users/', { params });
      if (Array.isArray(data)) {
        setUsers(data);
        setTotalCount(data.length);
      } else {
        setUsers(data.results || []);
        setTotalCount(data.count || 0);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, activeFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}><FaUsers color="#3b82f6" /> User Management</h1>
        <div style={styles.controls}>
          <div style={styles.searchWrapper}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={styles.select}>
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)} style={styles.select}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.resultCount}>
        {totalCount} user{totalCount !== 1 ? 's' : ''} found
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.loading}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={styles.emptyState}>No users found matching your criteria.</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Verified</th>
                    <th style={styles.th}>Active</th>
                    <th style={styles.th}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => {
                    const roleStyle = ROLE_COLORS[u.role] || { bg: '#f3f4f6', color: '#374151' };
                    return (
                      <tr key={u.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                        <td style={styles.td}>{u.id}</td>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{u.username}</td>
                        <td style={styles.td}>{u.email || '-'}</td>
                        <td style={styles.td}>
                          {[u.first_name, u.last_name].filter(Boolean).join(' ') || '-'}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: roleStyle.bg,
                            color: roleStyle.color,
                          }}>
                            {(u.role || '').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: u.is_email_verified || u.is_verified ? '#dcfce7' : '#fef3c7',
                            color: u.is_email_verified || u.is_verified ? '#16a34a' : '#b45309',
                          }}>
                            {u.is_email_verified || u.is_verified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: u.is_active ? '#dcfce7' : '#fee2e2',
                            color: u.is_active ? '#16a34a' : '#dc2626',
                          }}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={styles.td}>{formatDate(u.date_joined || u.created_at)}</td>
                      </tr>
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
