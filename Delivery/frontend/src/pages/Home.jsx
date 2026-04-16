import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaSearch,
  FaUtensils,
  FaStar,
  FaClock,
  FaMotorcycle,
  FaStore,
  FaTruck,
  FaUserShield,
  FaArrowRight,
} from 'react-icons/fa';
import API from '../api/axios';
import RestaurantCard from '../components/RestaurantCard';

const CUISINE_FILTERS = [
  'All',
  'North Indian',
  'South Indian',
  'Chinese',
  'Italian',
  'Fast Food',
  'Desserts',
  'Beverages',
  'Biryani',
  'Street Food',
];

const styles = {
  /* ---- Hero ---- */
  hero: {
    background: 'linear-gradient(135deg, #E23744 0%, #b72d38 100%)',
    padding: '80px 20px 60px',
    textAlign: 'center',
    color: '#fff',
  },
  heroTitle: {
    fontSize: 'clamp(28px, 5vw, 48px)',
    fontWeight: '800',
    margin: '0 0 12px',
    lineHeight: '1.15',
  },
  heroSub: {
    fontSize: 'clamp(14px, 2.5vw, 18px)',
    opacity: 0.9,
    marginBottom: '32px',
    fontWeight: '400',
  },
  searchBar: {
    display: 'flex',
    maxWidth: '600px',
    margin: '0 auto',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  },
  searchInput: {
    flex: 1,
    padding: '16px 20px',
    border: 'none',
    fontSize: '16px',
    outline: 'none',
  },
  searchBtn: {
    padding: '16px 28px',
    background: '#1c1c1c',
    color: '#fff',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
  },

  /* ---- Section ---- */
  section: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 20px',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1c1c1c',
    marginBottom: '8px',
  },
  sectionSub: {
    fontSize: '15px',
    color: '#696969',
    marginBottom: '32px',
  },

  /* ---- Cuisine chips ---- */
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '32px',
  },
  chip: {
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
  chipActive: {
    background: '#E23744',
    color: '#fff',
    borderColor: '#E23744',
  },

  /* ---- Restaurant grid ---- */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },

  /* ---- CTA cards ---- */
  ctaSection: {
    background: '#fafafa',
    padding: '48px 20px',
  },
  ctaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  ctaCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px 24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #f0f0f0',
    textAlign: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  ctaIcon: {
    fontSize: '40px',
    marginBottom: '16px',
    color: '#E23744',
  },
  ctaTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1c1c1c',
    marginBottom: '8px',
  },
  ctaDesc: {
    fontSize: '14px',
    color: '#696969',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  ctaLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#E23744',
    fontWeight: '600',
    fontSize: '14px',
    textDecoration: 'none',
  },

  /* ---- States ---- */
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#696969',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f0f0f0',
    borderTop: '4px solid #E23744',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#9e9e9e',
    fontSize: '16px',
  },
  errorState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#E23744',
  },
};

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCuisine, setActiveCuisine] = useState('All');

  useEffect(() => {
    let cancelled = false;
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await API.get('/restaurants/featured/');
        if (!cancelled) {
          setRestaurants(data.results || data);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load restaurants. Please try again later.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFeatured();
    return () => { cancelled = true; };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCuisineClick = (cuisine) => {
    setActiveCuisine(cuisine);
    if (cuisine === 'All') return;
    navigate(`/restaurants?search=${encodeURIComponent(cuisine)}`);
  };

  const filteredRestaurants =
    activeCuisine === 'All'
      ? restaurants
      : restaurants.filter((r) =>
          (r.cuisine_type || '').toLowerCase().includes(activeCuisine.toLowerCase())
        );

  const CTA_CARDS = [
    {
      icon: <FaUtensils style={styles.ctaIcon} />,
      title: 'Order Food',
      desc: 'Browse hundreds of restaurants and get your favourite meals delivered fast.',
      link: '/restaurants',
      linkText: 'Browse Restaurants',
    },
    {
      icon: <FaStore style={styles.ctaIcon} />,
      title: 'Add Your Restaurant',
      desc: 'Partner with us and reach thousands of new customers in your city.',
      link: '/register',
      linkText: 'Register as Vendor',
    },
    {
      icon: <FaTruck style={styles.ctaIcon} />,
      title: 'Deliver with Us',
      desc: 'Enjoy flexible hours and competitive pay as a delivery partner.',
      link: '/register',
      linkText: 'Become a Partner',
    },
    {
      icon: <FaUserShield style={styles.ctaIcon} />,
      title: 'Your Account',
      desc: 'Track orders, manage addresses, and view your order history all in one place.',
      link: '/login',
      linkText: 'Sign In',
    },
  ];

  return (
    <div>
      {/* Inline keyframes for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Hero */}
      <section style={styles.hero}>
        <img
          src="/logo.png"
          alt="Delivery Partner Logo"
          style={{
            height: '80px',
            marginBottom: '24px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
            background: '#fff',
            padding: '12px',
            borderRadius: '16px',
          }}
        />
        <h1 style={styles.heroTitle}>Discover the best food & drinks</h1>
        <p style={styles.heroSub}>
          Order from your favourite restaurants and get it delivered to your doorstep
        </p>
        <form onSubmit={handleSearch} style={styles.searchBar}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search for restaurants, cuisines, or dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" style={styles.searchBtn}>
            <FaSearch /> Search
          </button>
        </form>
      </section>

      {/* Featured Restaurants */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Featured Restaurants</h2>
        <p style={styles.sectionSub}>
          Handpicked restaurants loved by people in your area
        </p>

        {/* Cuisine filter chips */}
        <div style={styles.chipRow}>
          {CUISINE_FILTERS.map((cuisine) => (
            <button
              key={cuisine}
              style={{
                ...styles.chip,
                ...(activeCuisine === cuisine ? styles.chipActive : {}),
              }}
              onClick={() => handleCuisineClick(cuisine)}
            >
              {cuisine}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p>Loading restaurants...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={styles.errorState}>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                ...styles.chip,
                ...styles.chipActive,
                marginTop: '12px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredRestaurants.length === 0 && (
          <div style={styles.emptyState}>
            <FaUtensils
              style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}
            />
            <p>No restaurants found. Check back soon!</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filteredRestaurants.length > 0 && (
          <div style={styles.grid}>
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={{ ...styles.section, padding: '0 20px' }}>
          <h2 style={styles.sectionTitle}>Why Delivery Partner?</h2>
          <p style={{ ...styles.sectionSub, marginBottom: '32px' }}>
            From food delivery to restaurant partnerships
          </p>
        </div>
        <div style={styles.ctaGrid}>
          {CTA_CARDS.map((cta) => (
            <div
              key={cta.title}
              style={styles.ctaCard}
              onClick={() => navigate(cta.link)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = styles.ctaCard.boxShadow;
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(cta.link);
              }}
            >
              {cta.icon}
              <div style={styles.ctaTitle}>{cta.title}</div>
              <div style={styles.ctaDesc}>{cta.desc}</div>
              <Link
                to={cta.link}
                style={styles.ctaLink}
                onClick={(e) => e.stopPropagation()}
              >
                {cta.linkText} <FaArrowRight />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer strip */}
      <footer
        style={{
          textAlign: 'center',
          padding: '24px 20px',
          background: '#1c1c1c',
          color: '#999',
          fontSize: '13px',
        }}
      >
        Delivery Partner &mdash; Built with Django & React
      </footer>
    </div>
  );
}
