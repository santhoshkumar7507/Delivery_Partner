import { useNavigate } from 'react-router-dom';
import { FaStar, FaClock, FaMotorcycle } from 'react-icons/fa';

const GRADIENTS = [
  'linear-gradient(135deg, #e74c3c, #c0392b)',
  'linear-gradient(135deg, #e67e22, #d35400)',
  'linear-gradient(135deg, #2ecc71, #27ae60)',
  'linear-gradient(135deg, #3498db, #2980b9)',
  'linear-gradient(135deg, #9b59b6, #8e44ad)',
  'linear-gradient(135deg, #1abc9c, #16a085)',
  'linear-gradient(135deg, #f39c12, #e67e22)',
  'linear-gradient(135deg, #e74c3c, #9b59b6)',
];

function getGradient(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
  imagePlaceholder: {
    height: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  letter: {
    fontSize: '64px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    userSelect: 'none',
  },
  body: {
    padding: '14px 16px 16px',
  },
  name: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1c1c1c',
    margin: '0 0 6px 0',
    lineHeight: '1.3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cuisineBadge: {
    display: 'inline-block',
    background: '#f8f8f8',
    color: '#686b78',
    fontSize: '12px',
    fontWeight: '500',
    padding: '3px 10px',
    borderRadius: '12px',
    marginBottom: '10px',
    border: '1px solid #efefef',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    fontSize: '13px',
    color: '#686b78',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  ratingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    background: '#48c479',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
  },
};

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  const {
    id,
    name = 'Restaurant',
    cuisine_type = '',
    rating,
    delivery_fee,
    estimated_delivery_time,
    image,
  } = restaurant;

  const displayRating = rating != null ? parseFloat(rating).toFixed(1) : '--';
  const displayFee = delivery_fee != null ? `₹${delivery_fee}` : 'Free';
  const displayTime = estimated_delivery_time ? `${estimated_delivery_time} min` : '--';

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/restaurants/${id}`)}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, {
          transform: styles.cardHover.transform,
          boxShadow: styles.cardHover.boxShadow,
        });
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = styles.card.boxShadow;
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/restaurants/${id}`);
      }}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          style={{
            width: '100%',
            height: '180px',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            ...styles.imagePlaceholder,
            background: getGradient(name),
          }}
        >
          <span style={styles.letter}>{name.charAt(0)}</span>
        </div>
      )}
      <div style={styles.body}>
        <h3 style={styles.name}>{name}</h3>
        {cuisine_type && (
          <span style={styles.cuisineBadge}>{cuisine_type}</span>
        )}
        <div style={styles.metaRow}>
          <span style={styles.ratingBadge}>
            <FaStar size={10} /> {displayRating}
          </span>
          <span style={styles.metaItem}>
            <FaMotorcycle size={14} /> {displayFee}
          </span>
          <span style={styles.metaItem}>
            <FaClock size={12} /> {displayTime}
          </span>
        </div>
      </div>
    </div>
  );
}
