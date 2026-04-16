import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaSortAmountDown, FaTimes } from 'react-icons/fa';
import API from '../api/axios';
import RestaurantCard from '../components/RestaurantCard';

const CUISINE_TYPES = [
  'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai',
  'Japanese', 'American', 'Continental', 'Fast Food', 'Desserts', 'Beverages',
];

const SORT_OPTIONS = [
  { label: 'Rating', value: '-rating' },
  { label: 'Delivery Fee', value: 'delivery_fee' },
  { label: 'Delivery Time', value: 'estimated_delivery_time' },
];

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    marginBottom: '28px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1c1c1c',
    margin: '0 0 20px 0',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '16px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 44px 12px 16px',
    fontSize: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    outline: 'none',
    background: '#fafafa',
    color: '#1c1c1c',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  searchIcon: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#93959f',
    pointerEvents: 'none',
  },
  filtersRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '12px',
  },
  chip: {
    padding: '7px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #e0e0e0',
    background: '#fff',
    color: '#686b78',
    cursor: 'pointer',
    transition: 'all 0.2s',
    userSelect: 'none',
  },
  chipActive: {
    background: '#e23744',
    color: '#fff',
    border: '1px solid #e23744',
  },
  sortRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  sortLabel: {
    fontSize: '13px',
    color: '#93959f',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontWeight: '500',
  },
  sortBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #e0e0e0',
    background: '#fff',
    color: '#686b78',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sortBtnActive: {
    background: '#1c1c1c',
    color: '#fff',
    border: '1px solid #1c1c1c',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
    gap: '24px',
  },
  skeletonCard: {
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#fff',
    border: '1px solid #f0f0f0',
  },
  skeletonImage: {
    height: '180px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'none',
  },
  skeletonBody: {
    padding: '14px 16px 16px',
  },
  skeletonLine: (width) => ({
    height: '14px',
    borderRadius: '4px',
    background: '#f0f0f0',
    marginBottom: '8px',
    width,
  }),
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#93959f',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1c1c1c',
    margin: '0 0 8px 0',
  },
  emptyText: {
    fontSize: '14px',
    margin: 0,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginTop: '40px',
    paddingBottom: '20px',
  },
  pageBtn: {
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid #e0e0e0',
    background: '#fff',
    color: '#1c1c1c',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '14px',
    color: '#686b78',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#e23744',
  },
  retryBtn: {
    marginTop: '12px',
    padding: '8px 24px',
    borderRadius: '8px',
    border: '1px solid #e23744',
    background: '#e23744',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

function SkeletonCard() {
  return (
    <div style={styles.skeletonCard}>
      <div style={styles.skeletonImage} />
      <div style={styles.skeletonBody}>
        <div style={styles.skeletonLine('70%')} />
        <div style={styles.skeletonLine('40%')} />
        <div style={styles.skeletonLine('90%')} />
      </div>
    </div>
  );
}

export default function RestaurantList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [activeCuisine, setActiveCuisine] = useState(searchParams.get('cuisine_type') || '');
  const [activeSort, setActiveSort] = useState(searchParams.get('ordering') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchInput.trim()) params.search = searchInput.trim();
      if (activeCuisine) params.cuisine_type = activeCuisine;
      if (activeSort) params.ordering = activeSort;
      params.page = page;

      const { data } = await API.get('/restaurants/', { params });

      if (data.results) {
        setRestaurants(data.results);
        setTotalCount(data.count || 0);
      } else if (Array.isArray(data)) {
        setRestaurants(data);
        setTotalCount(data.length);
      } else {
        setRestaurants([]);
        setTotalCount(0);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load restaurants. Please try again.');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [searchInput, activeCuisine, activeSort, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRestaurants();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchRestaurants]);

  useEffect(() => {
    const params = {};
    if (searchInput.trim()) params.search = searchInput.trim();
    if (activeCuisine) params.cuisine_type = activeCuisine;
    if (activeSort) params.ordering = activeSort;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [searchInput, activeCuisine, activeSort, page, setSearchParams]);

  const handleCuisineClick = (cuisine) => {
    setActiveCuisine((prev) => (prev === cuisine ? '' : cuisine));
    setPage(1);
  };

  const handleSortClick = (value) => {
    setActiveSort((prev) => (prev === value ? '' : value));
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Restaurants</h1>

        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search for restaurants or cuisines..."
            value={searchInput}
            onChange={handleSearchChange}
            style={styles.searchInput}
            onFocus={(e) => {
              e.target.style.borderColor = '#e23744';
              e.target.style.boxShadow = '0 0 0 3px rgba(226,55,68,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.boxShadow = 'none';
            }}
          />
          {searchInput ? (
            <button
              onClick={clearSearch}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#93959f',
                padding: '4px',
                display: 'flex',
              }}
            >
              <FaTimes size={16} />
            </button>
          ) : (
            <div style={styles.searchIcon}>
              <FaSearch size={16} />
            </div>
          )}
        </div>

        <div style={styles.filtersRow}>
          {CUISINE_TYPES.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => handleCuisineClick(cuisine)}
              style={{
                ...styles.chip,
                ...(activeCuisine === cuisine ? styles.chipActive : {}),
              }}
            >
              {cuisine}
            </button>
          ))}
        </div>

        <div style={styles.sortRow}>
          <span style={styles.sortLabel}>
            <FaSortAmountDown size={12} /> Sort by:
          </span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSortClick(opt.value)}
              style={{
                ...styles.sortBtn,
                ...(activeSort === opt.value ? styles.sortBtnActive : {}),
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={fetchRestaurants} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {loading && !error && (
        <div style={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && !error && restaurants.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🍽️</div>
          <h3 style={styles.emptyTitle}>No restaurants found</h3>
          <p style={styles.emptyText}>
            {searchInput || activeCuisine
              ? 'Try adjusting your search or filters.'
              : 'No restaurants are available at the moment.'}
          </p>
        </div>
      )}

      {!loading && !error && restaurants.length > 0 && (
        <>
          <div style={styles.grid}>
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>

          {totalCount > pageSize && (
            <div style={styles.pagination}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  ...styles.pageBtn,
                  ...(page <= 1 ? styles.pageBtnDisabled : {}),
                }}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  ...styles.pageBtn,
                  ...(page >= totalPages ? styles.pageBtnDisabled : {}),
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
