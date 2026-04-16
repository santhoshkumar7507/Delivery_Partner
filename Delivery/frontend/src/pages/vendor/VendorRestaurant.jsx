import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { FaStore, FaSave, FaArrowLeft } from 'react-icons/fa';

const BRAND = '#E23744';

const CUISINE_CHOICES = [
  { value: 'indian', label: 'Indian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'italian', label: 'Italian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'thai', label: 'Thai' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'american', label: 'American' },
  { value: 'continental', label: 'Continental' },
  { value: 'fast_food', label: 'Fast Food' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'beverages', label: 'Beverages' },
];

const initialForm = {
  name: '',
  description: '',
  address: '',
  phone: '',
  cuisine_type: 'indian',
  opening_time: '09:00',
  closing_time: '22:00',
  min_order_amount: '',
  delivery_fee: '',
  estimated_delivery_time: '',
  is_active: true,
};

const styles = {
  container: {
    maxWidth: 800,
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
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1c1c1c',
    margin: 0,
  },
  form: {
    background: '#fff',
    borderRadius: 12,
    padding: 32,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px 24px',
  },
  fieldFull: {
    gridColumn: '1 / -1',
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#333',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    minHeight: 80,
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  toggleSwitch: (active) => ({
    width: 48,
    height: 26,
    borderRadius: 13,
    background: active ? BRAND : '#ccc',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 0.2s',
    flexShrink: 0,
  }),
  toggleKnob: (active) => ({
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute',
    top: 2,
    left: active ? 24 : 2,
    transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  }),
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 32px',
    background: BRAND,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 28,
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  loading: {
    textAlign: 'center',
    padding: 60,
    fontSize: 16,
    color: '#696969',
  },
};

export default function VendorRestaurant() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/restaurants/vendor/my-restaurant/');
      setForm({
        name: data.name || '',
        description: data.description || '',
        address: data.address || '',
        phone: data.phone || '',
        cuisine_type: data.cuisine_type || 'indian',
        opening_time: data.opening_time || '09:00',
        closing_time: data.closing_time || '22:00',
        min_order_amount: data.min_order_amount || '',
        delivery_fee: data.delivery_fee || '',
        estimated_delivery_time: data.estimated_delivery_time || '',
        is_active: data.is_active !== undefined ? data.is_active : true,
      });
      setIsEdit(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setIsEdit(false);
        setForm(initialForm);
      } else {
        toast.error('Failed to load restaurant data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleToggleActive = () => {
    setForm((prev) => ({ ...prev, is_active: !prev.is_active }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Restaurant name is required');
      return;
    }
    if (!form.address.trim()) {
      toast.error('Address is required');
      return;
    }
    if (!form.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        min_order_amount: form.min_order_amount || 0,
        delivery_fee: form.delivery_fee || 0,
        estimated_delivery_time: form.estimated_delivery_time || 30,
      };

      if (isEdit) {
        await API.put('/restaurants/vendor/my-restaurant/', payload);
        toast.success('Restaurant updated successfully!');
      } else {
        await API.post('/restaurants/vendor/my-restaurant/', payload);
        toast.success('Restaurant created successfully!');
        setIsEdit(true);
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (typeof err.response?.data === 'object'
          ? Object.values(err.response.data).flat().join(', ')
          : 'Something went wrong');
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading restaurant...</div>;
  }

  return (
    <div style={styles.container}>
      <button style={styles.backLink} onClick={() => navigate('/vendor')}>
        <FaArrowLeft /> Back to Dashboard
      </button>

      <div style={styles.header}>
        <FaStore style={{ fontSize: 28, color: BRAND }} />
        <h1 style={styles.title}>{isEdit ? 'Edit Restaurant' : 'Create Restaurant'}</h1>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.fieldGrid}>
          {/* Name */}
          <div style={styles.fieldFull}>
            <label style={styles.label}>Restaurant Name *</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter restaurant name"
              onFocus={(e) => (e.target.style.borderColor = BRAND)}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </div>

          {/* Description */}
          <div style={styles.fieldFull}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your restaurant..."
              onFocus={(e) => (e.target.style.borderColor = BRAND)}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </div>

          {/* Address */}
          <div style={styles.fieldFull}>
            <label style={styles.label}>Address *</label>
            <input
              style={styles.input}
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Full restaurant address"
              onFocus={(e) => (e.target.style.borderColor = BRAND)}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={styles.label}>Phone *</label>
            <input
              style={styles.input}
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
              onFocus={(e) => (e.target.style.borderColor = BRAND)}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </div>

          {/* Cuisine Type */}
          <div>
            <label style={styles.label}>Cuisine Type</label>
            <select
              style={styles.select}
              name="cuisine_type"
              value={form.cuisine_type}
              onChange={handleChange}
            >
              {CUISINE_CHOICES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Opening Time */}
          <div>
            <label style={styles.label}>Opening Time</label>
            <input
              style={styles.input}
              type="time"
              name="opening_time"
              value={form.opening_time}
              onChange={handleChange}
            />
          </div>

          {/* Closing Time */}
          <div>
            <label style={styles.label}>Closing Time</label>
            <input
              style={styles.input}
              type="time"
              name="closing_time"
              value={form.closing_time}
              onChange={handleChange}
            />
          </div>

          {/* Min Order Amount */}
          <div>
            <label style={styles.label}>Minimum Order Amount ({'\u20B9'})</label>
            <input
              style={styles.input}
              type="number"
              name="min_order_amount"
              value={form.min_order_amount}
              onChange={handleChange}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          {/* Delivery Fee */}
          <div>
            <label style={styles.label}>Delivery Fee ({'\u20B9'})</label>
            <input
              style={styles.input}
              type="number"
              name="delivery_fee"
              value={form.delivery_fee}
              onChange={handleChange}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          {/* Estimated Delivery Time */}
          <div>
            <label style={styles.label}>Estimated Delivery Time (mins)</label>
            <input
              style={styles.input}
              type="number"
              name="estimated_delivery_time"
              value={form.estimated_delivery_time}
              onChange={handleChange}
              placeholder="30"
              min="1"
            />
          </div>

          {/* Active Toggle */}
          <div>
            <label style={styles.label}>Restaurant Status</label>
            <div style={styles.toggleRow}>
              <div style={styles.toggleSwitch(form.is_active)} onClick={handleToggleActive}>
                <div style={styles.toggleKnob(form.is_active)} />
              </div>
              <span style={{ fontSize: 14, color: form.is_active ? '#2e7d32' : '#696969', fontWeight: 500 }}>
                {form.is_active ? 'Active - Accepting Orders' : 'Inactive - Not Accepting Orders'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          style={{
            ...styles.submitBtn,
            ...(submitting ? styles.submitBtnDisabled : {}),
          }}
          disabled={submitting}
        >
          <FaSave />
          {submitting ? 'Saving...' : isEdit ? 'Update Restaurant' : 'Create Restaurant'}
        </button>
      </form>
    </div>
  );
}
