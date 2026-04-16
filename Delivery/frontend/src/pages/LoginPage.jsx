import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaLock, FaUser, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

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
    padding: '20px',
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
    maxWidth: '420px',
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
    marginBottom: '40px',
    marginTop: '8px',
  },
  inputGroup: {
    position: 'relative',
    marginBottom: '24px',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#a0a0a0',
    fontSize: '18px',
    pointerEvents: 'none',
    transition: 'color 0.3s ease',
  },
  input: {
    width: '100%',
    padding: '16px 16px 16px 48px',
    border: '2px solid transparent',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    background: '#f4f4f5',
    color: '#333',
    fontWeight: '500',
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
    marginTop: '16px',
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

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login, loading } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
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

    if (!formData.username.trim() || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const loggedInUser = await login(formData.username, formData.password);
      toast.success('Login successful! Welcome back.');
      const dest = ROLE_DASHBOARDS[loggedInUser?.role] || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.';
      // Highlight: Handle standard wrong credentials politely
      if (message.toLowerCase().includes('no active account') || message.toLowerCase().includes('invalid')) {
         toast.error("Invalid username or password.");
      } else {
         toast.error(message);
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
          <div style={{ marginTop: '16px', fontSize: '18px', fontWeight: '600' }}>Authenticating...</div>
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
          <p style={styles.subtitle}>Sign in to your account</p>

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <input
                className="custom-input"
                style={styles.input}
                type="text"
                name="username"
                placeholder="Username (e.g. ssksanthoshkumar1433@gmail.com)"
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
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <FaLock style={styles.inputIcon} className="input-icon" />
            </div>

            <button
              type="submit"
              className="hover-btn"
              style={{
                ...styles.button,
                ...(submitting ? styles.buttonDisabled : {}),
              }}
              disabled={submitting}
            >
              <FaSignInAlt />
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={styles.footer}>
            Don&apos;t have an account?
            <Link to="/register" style={styles.link} onMouseOver={(e)=>e.target.style.color='#c62828'} onMouseOut={(e)=>e.target.style.color='#E23744'}>
              Create account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

