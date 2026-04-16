import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { FaStore, FaTruck, FaCheckCircle, FaBan, FaFilter } from 'react-icons/fa';

const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1f2937',
    margin: '0 0 24px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  tabs: {
    display: 'flex',
    gap: 0,
    marginBottom: 24,
    borderBottom: '2px solid #e5e7eb',
  },
  tab: {
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'color 0.15s, border-color 0.15s',
  },
  tabActive: {
    color: '#e23744',
    borderBottomColor: '#e23744',
    fontWeight: 600,
  },
  tabCount: {
    background: '#f3f4f6',
    color: '#6b7280',
    fontSize: 12,
    fontWeight: 600,
    padding: '1px 8px',
    borderRadius: 999,
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 17,
    fontWeight: 600,
    color: '#1f2937',
    margin: 0,
  },
  ownerName: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  badgeApproved: {
    background: '#dcfce7',
    color: '#16a34a',
  },
  badgePending: {
    background: '#fee2e2',
    color: '#dc2626',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    color: '#6b7280',
    padding: '4px 0',
  },
  detailLabel: {
    fontWeight: 500,
    color: '#374151',
  },
  approveBtn: {
    padding: '10px 20px',
    background: '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'background 0.15s',
    width: '100%',
  },
  approveBtnDisabled: {
    background: '#9ca3af',
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
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
];

export default function AdminVendors() {
  const [activeTab, setActiveTab] = useState('vendors');
  const [vendors, setVendors] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [approvingId, setApprovingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vendorsRes, partnersRes] = await Promise.all([
        API.get('/auth/vendors/'),
        API.get('/auth/delivery-partners/'),
      ]);
      const v = Array.isArray(vendorsRes.data) ? vendorsRes.data : vendorsRes.data.results || [];
      const p = Array.isArray(partnersRes.data) ? partnersRes.data : partnersRes.data.results || [];
      setVendors(v);
      setPartners(p);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApproveVendor = async (id) => {
    setApprovingId(`vendor-${id}`);
    try {
      await API.post(`/auth/vendors/${id}/approve/`);
      toast.success('Vendor approved successfully!');
      setVendors(prev => prev.map(v => v.id === id ? { ...v, is_approved: true } : v));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to approve vendor.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleApprovePartner = async (id) => {
    setApprovingId(`partner-${id}`);
    try {
      await API.post(`/auth/delivery-partners/${id}/approve/`);
      toast.success('Delivery partner approved successfully!');
      setPartners(prev => prev.map(p => p.id === id ? { ...p, is_approved: true } : p));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to approve delivery partner.');
    } finally {
      setApprovingId(null);
    }
  };

  const filterItems = (items) => {
    if (filter === 'pending') return items.filter(i => !i.is_approved);
    if (filter === 'approved') return items.filter(i => i.is_approved);
    return items;
  };

  const filteredVendors = filterItems(vendors);
  const filteredPartners = filterItems(partners);
  const pendingVendorCount = vendors.filter(v => !v.is_approved).length;
  const pendingPartnerCount = partners.filter(p => !p.is_approved).length;

  if (loading) {
    return <div style={styles.loading}>Loading vendor data...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}><FaStore color="#8b5cf6" /> Vendor & Partner Management</h1>

      {error && <div style={styles.error}>{error}</div>}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'vendors' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('vendors')}
        >
          <FaStore /> Vendors
          <span style={styles.tabCount}>{vendors.length}</span>
          {pendingVendorCount > 0 && (
            <span style={{ ...styles.tabCount, background: '#fee2e2', color: '#dc2626' }}>{pendingVendorCount} pending</span>
          )}
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'partners' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('partners')}
        >
          <FaTruck /> Delivery Partners
          <span style={styles.tabCount}>{partners.length}</span>
          {pendingPartnerCount > 0 && (
            <span style={{ ...styles.tabCount, background: '#fee2e2', color: '#dc2626' }}>{pendingPartnerCount} pending</span>
          )}
        </button>
      </div>

      {/* Filter */}
      <div style={styles.filterRow}>
        <FaFilter color="#9ca3af" />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={styles.select}>
          {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          Showing {activeTab === 'vendors' ? filteredVendors.length : filteredPartners.length} of{' '}
          {activeTab === 'vendors' ? vendors.length : partners.length}
        </span>
      </div>

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        filteredVendors.length === 0 ? (
          <div style={styles.emptyState}>No vendors found matching this filter.</div>
        ) : (
          <div style={styles.grid}>
            {filteredVendors.map(vendor => (
              <div key={vendor.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.companyName}>{vendor.company_name || `Vendor #${vendor.id}`}</h3>
                    <p style={styles.ownerName}>
                      Owner: {vendor.user?.first_name
                        ? `${vendor.user.first_name} ${vendor.user.last_name || ''}`
                        : vendor.user?.username || `User #${vendor.user_id || vendor.user}`}
                    </p>
                  </div>
                  <span style={{
                    ...styles.badge,
                    ...(vendor.is_approved ? styles.badgeApproved : styles.badgePending),
                  }}>
                    {vendor.is_approved ? <><FaCheckCircle /> Approved</> : <><FaBan /> Pending</>}
                  </span>
                </div>

                <div>
                  {vendor.gst_number && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>GST Number</span>
                      <span>{vendor.gst_number}</span>
                    </div>
                  )}
                  {vendor.pan_number && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>PAN Number</span>
                      <span>{vendor.pan_number}</span>
                    </div>
                  )}
                  {vendor.business_address && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Address</span>
                      <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {vendor.business_address}
                      </span>
                    </div>
                  )}
                  {vendor.phone_number && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Phone</span>
                      <span>{vendor.phone_number}</span>
                    </div>
                  )}
                </div>

                {!vendor.is_approved && (
                  <button
                    style={{
                      ...styles.approveBtn,
                      ...(approvingId === `vendor-${vendor.id}` ? styles.approveBtnDisabled : {}),
                    }}
                    onClick={() => handleApproveVendor(vendor.id)}
                    disabled={approvingId === `vendor-${vendor.id}`}
                  >
                    <FaCheckCircle />
                    {approvingId === `vendor-${vendor.id}` ? 'Approving...' : 'Approve Vendor'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Delivery Partners Tab */}
      {activeTab === 'partners' && (
        filteredPartners.length === 0 ? (
          <div style={styles.emptyState}>No delivery partners found matching this filter.</div>
        ) : (
          <div style={styles.grid}>
            {filteredPartners.map(partner => (
              <div key={partner.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.companyName}>
                      {partner.user?.first_name
                        ? `${partner.user.first_name} ${partner.user.last_name || ''}`
                        : partner.user?.username || `Partner #${partner.id}`}
                    </h3>
                    <p style={styles.ownerName}>
                      {partner.user?.email || ''}
                    </p>
                  </div>
                  <span style={{
                    ...styles.badge,
                    ...(partner.is_approved ? styles.badgeApproved : styles.badgePending),
                  }}>
                    {partner.is_approved ? <><FaCheckCircle /> Approved</> : <><FaBan /> Pending</>}
                  </span>
                </div>

                <div>
                  {partner.vehicle_type && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Vehicle Type</span>
                      <span style={{ textTransform: 'capitalize' }}>{partner.vehicle_type.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                  {partner.vehicle_number && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Vehicle Number</span>
                      <span>{partner.vehicle_number}</span>
                    </div>
                  )}
                  {partner.license_number && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>License Number</span>
                      <span>{partner.license_number}</span>
                    </div>
                  )}
                  {partner.phone_number && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Phone</span>
                      <span>{partner.phone_number}</span>
                    </div>
                  )}
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Available</span>
                    <span style={{
                      ...styles.badge,
                      ...(partner.is_available ? { background: '#dcfce7', color: '#16a34a' } : { background: '#f3f4f6', color: '#6b7280' }),
                    }}>
                      {partner.is_available ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {!partner.is_approved && (
                  <button
                    style={{
                      ...styles.approveBtn,
                      ...(approvingId === `partner-${partner.id}` ? styles.approveBtnDisabled : {}),
                    }}
                    onClick={() => handleApprovePartner(partner.id)}
                    disabled={approvingId === `partner-${partner.id}`}
                  >
                    <FaCheckCircle />
                    {approvingId === `partner-${partner.id}` ? 'Approving...' : 'Approve Partner'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
