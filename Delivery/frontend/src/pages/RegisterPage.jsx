import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaBuilding,
  FaFileInvoice,
  FaMotorcycle,
  FaIdCard,
  FaUserPlus,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'customer', label: 'Customer' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'delivery_partner', label: 'Delivery Partner' },
];

const VEHICLE_TYPES = [
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'car', label: 'Car' },
];

const ROLE_DASHBOARDS = {
  customer: '/customer/dashboard',
  vendor: '/vendor/dashboard',
  delivery_partner: '/delivery/dashboard',
  admin: '/admin/dashboard',
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'url(https://images.unsplash.com/photo-1526367790999-0150786686a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80) center/cover no-repeat fixed',
    position: 'relative',
    padding: '40px 20px',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(226,55,68,0.4) 100%)',
    backdropFilter: 'blur(4px)',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '560px',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '8px',
  },
  logoText: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#E23744',
    letterSpacing: '-1px',
    margin: 0,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: '15px',
    marginBottom: '32px',
    marginTop: '8px',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  inputGroup: {
    position: 'relative',
    marginBottom: '16px',
    flex: 1,
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#a0a0a0',
    fontSize: '16px',
    pointerEvents: 'none',
    transition: 'color 0.3s ease',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 44px',
    border: '2px solid transparent',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    background: '#f4f4f5',
    color: '#333',
    fontWeight: '500',
  },
  select: {
    width: '100%',
    padding: '14px 16px 14px 44px',
    border: '2px solid transparent',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    background: '#f4f4f5',
    color: '#333',
    fontWeight: '500',
    appearance: 'none',
    cursor: 'pointer',
  },
  sectionLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#E23744',
    marginBottom: '16px',
    marginTop: '16px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: '1px solid currentColor',
    paddingBottom: '4px',
    display: 'inline-block',
  },
  button: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #E23744 0%, #ff5e62 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.3s ease',
    marginTop: '24px',
    boxShadow: '0 8px 20px -6px rgba(226, 55, 68, 0.6)',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
    transform: 'none !important',
  },
  footer: {
    textAlign: 'center',
    marginTop: '32px',
    fontSize: '15px',
    color: '#666',
  },
  link: {
    color: '#E23744',
    fontWeight: '700',
    textDecoration: 'none',
    marginLeft: '4px',
    transition: 'color 0.2s',
  },
};

const INITIAL_FORM = {
  username: '',
  email: '',
  password: '',
  password2: '',
  first_name: '',
  last_name: '',
  phone: '',
  role: 'customer',
  company_name: '',
  gst_number: '',
  vehicle_type: 'motorcycle',
  vehicle_number: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, register, loading } = useAuth();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const dest = ROLE_DASHBOARDS[user.role] || '/';
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, email, password, password2, role } = formData;

    if (!username.trim() || !email.trim() || !password || !password2) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password !== password2) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    const payload = {
      username: username.trim(),
      email: email.trim(),
      password,
      password2,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone.trim(),
      role,
    };

    if (role === 'vendor') {
      payload.vendor_profile = {
        company_name: formData.company_name.trim(),
        gst_number: formData.gst_number.trim(),
      };
    } else if (role === 'delivery_partner') {
      payload.delivery_partner_profile = {
        vehicle_type: formData.vehicle_type,
        vehicle_number: formData.vehicle_number.trim(),
      };
    }

    setSubmitting(true);
    try {
      const registeredUser = await register(payload);
      toast.success('Account created successfully!');
      const dest = ROLE_DASHBOARDS[registeredUser?.role || role] || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const firstError = Array.isArray(data[firstKey])
          ? data[firstKey][0]
          : data[firstKey];
        toast.error(`${firstKey}: ${firstError}`);
      } else {
        toast.error(err?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.overlay} />
        <div style={{ zIndex: 1, textAlign: 'center', color: '#fff' }}>
          <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff', margin: '0 auto' }}></div>
          <div style={{ marginTop: '16px', fontSize: '18px', fontWeight: '600' }}>Starting...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .custom-input:focus {
            background: #fff !important;
            border-color: #E23744 !important;
            box-shadow: 0 0 0 4px rgba(226, 55, 68, 0.1) !important;
          }
          .custom-input:focus + .input-icon, .custom-input:not(:placeholder-shown) + .input-icon {
            color: #E23744 !important;
          }
          .hover-btn:not(:disabled):hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px -8px rgba(226, 55, 68, 0.8) !important;
          }
          .hover-btn:not(:disabled):active {
            transform: translateY(0);
          }
        `}
      </style>
      <div style={styles.wrapper}>
        <div style={styles.overlay} />
        <div style={styles.card}>
          <div style={styles.logo}>
            <img src="/logo.png" alt="Delivery Partner Logo" style={{ height: '64px', marginBottom: '16px' }} />
            <h1 style={styles.logoText}>Delivery Partner</h1>
          </div>
          <p style={styles.subtitle}>Create your account to get started</p>

          <form onSubmit={handleSubmit}>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <input
                  className="custom-input"
                  style={styles.input}
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
                <FaUser style={styles.inputIcon} className="input-icon" />
              </div>
              <div style={styles.inputGroup}>
                <input
                  className="custom-input"
                  style={styles.input}
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
                <FaUser style={styles.inputIcon} className="input-icon" />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <input
                className="custom-input"
                style={styles.input}
                type="text"
                name="username"
                placeholder="Username (used for login) *"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
              />
              <FaUser style={styles.inputIcon} className="input-icon" />
            </div>

            <div style={styles.inputGroup}>
              <input
                className="custom-input"
                style={styles.input}
                type="email"
                name="email"
                placeholder="Email address *"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
              <FaEnvelope style={styles.inputIcon} className="input-icon" />
            </div>

            <div style={styles.inputGroup}>
              <input
                className="custom-input"
                style={styles.input}
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
              />
              <FaPhone style={styles.inputIcon} className="input-icon" />
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <input
                  className="custom-input"
                  style={styles.input}
                  type="password"
                  name="password"
                  placeholder="Password *"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <FaLock style={styles.inputIcon} className="input-icon" />
              </div>
              <div style={styles.inputGroup}>
                <input
                  className="custom-input"
                  style={styles.input}
                  type="password"
                  name="password2"
                  placeholder="Confirm password *"
                  value={formData.password2}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <FaLock style={styles.inputIcon} className="input-icon" />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <select
                className="custom-input"
                style={styles.select}
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <FaIdCard style={styles.inputIcon} className="input-icon" />
            </div>

            {formData.role === 'vendor' && (
              <>
                <div style={styles.sectionLabel}>Vendor Details</div>
                <div style={styles.inputGroup}>
                  <input
                    className="custom-input"
                    style={styles.input}
                    type="text"
                    name="company_name"
                    placeholder="Company / Restaurant name"
                    value={formData.company_name}
                    onChange={handleChange}
                  />
                  <FaBuilding style={styles.inputIcon} className="input-icon" />
                </div>
                <div style={styles.inputGroup}>
                  <input
                    className="custom-input"
                    style={styles.input}
                    type="text"
                    name="gst_number"
                    placeholder="GST number"
                    value={formData.gst_number}
                    onChange={handleChange}
                  />
                  <FaFileInvoice style={styles.inputIcon} className="input-icon" />
                </div>
              </>
            )}

            {formData.role === 'delivery_partner' && (
              <>
                <div style={styles.sectionLabel}>Vehicle Details</div>
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <select
                      className="custom-input"
                      style={styles.select}
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onChange={handleChange}
                    >
                      {VEHICLE_TYPES.map((v) => (
                        <option key={v.value} value={v.value}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                    <FaMotorcycle style={styles.inputIcon} className="input-icon" />
                  </div>
                  <div style={styles.inputGroup}>
                    <input
                      className="custom-input"
                      style={styles.input}
                      type="text"
                      name="vehicle_number"
                      placeholder="Vehicle number"
                      value={formData.vehicle_number}
                      onChange={handleChange}
                    />
                    <FaIdCard style={styles.inputIcon} className="input-icon" />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="hover-btn"
              style={{
                ...styles.button,
                ...(submitting ? styles.buttonDisabled : {}),
              }}
              disabled={submitting}
            >
              <FaUserPlus />
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={styles.footer}>
            Already have an account?
            <Link to="/login" style={styles.link} onMouseOver={(e)=>e.target.style.color='#c62828'} onMouseOut={(e)=>e.target.style.color='#E23744'}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
