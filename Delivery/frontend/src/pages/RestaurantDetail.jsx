import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaStar, FaClock, FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaPlus, FaMinus, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const VEG_COLOR = '#0f8a65';
const NONVEG_COLOR = '#e43b4f';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  breadcrumb: {
    fontSize: '13px',
    color: '#93959f',
    marginBottom: '20px',
  },
  breadcrumbLink: {
    color: '#e23744',
    textDecoration: 'none',
  },
  /* Restaurant Header */
  headerCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #f0f0f0',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
  },
  restaurantName: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1c1c1c',
    margin: '0 0 6px 0',
  },
  cuisineText: {
    fontSize: '14px',
    color: '#686b78',
    margin: '0 0 4px 0',
  },
  addressText: {
    fontSize: '13px',
    color: '#93959f',
    margin: '0 0 4px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  description: {
    fontSize: '14px',
    color: '#686b78',
    margin: '12px 0 0 0',
    lineHeight: '1.5',
  },
  ratingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 16px',
    background: '#48c479',
    borderRadius: '8px',
    color: '#fff',
    minWidth: '60px',
  },
  ratingNum: {
    fontSize: '20px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  ratingLabel: {
    fontSize: '11px',
    marginTop: '2px',
    opacity: 0.9,
  },
  metaStrip: {
    display: 'flex',
    gap: '24px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f0f0f0',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#686b78',
  },
  /* Layout */
  layout: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  menuSection: {
    flex: 1,
    minWidth: 0,
  },
  cartSection: {
    width: '360px',
    flexShrink: 0,
    position: 'sticky',
    top: '24px',
  },
  /* Menu */
  menuTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1c1c1c',
    margin: '0 0 16px 0',
  },
  categoryCard: {
    background: '#fff',
    borderRadius: '12px',
    marginBottom: '12px',
    border: '1px solid #f0f0f0',
    overflow: 'hidden',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    cursor: 'pointer',
    userSelect: 'none',
    background: '#fafafa',
    transition: 'background 0.2s',
  },
  categoryName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1c1c1c',
    margin: 0,
  },
  categoryCount: {
    fontSize: '13px',
    color: '#93959f',
    fontWeight: '400',
    marginLeft: '8px',
  },
  menuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px 20px',
    borderTop: '1px solid #f5f5f5',
    gap: '12px',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  vegIndicator: (isVeg) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    border: `2px solid ${isVeg ? VEG_COLOR : NONVEG_COLOR}`,
    borderRadius: '3px',
    marginRight: '8px',
    verticalAlign: 'middle',
    flexShrink: 0,
  }),
  vegDot: (isVeg) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: isVeg ? VEG_COLOR : NONVEG_COLOR,
  }),
  itemName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1c1c1c',
    margin: '0 0 4px 0',
    display: 'flex',
    alignItems: 'center',
  },
  itemDesc: {
    fontSize: '13px',
    color: '#93959f',
    margin: '0 0 6px 0',
    lineHeight: '1.4',
  },
  itemPrice: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1c1c1c',
  },
  addBtn: {
    padding: '6px 24px',
    borderRadius: '8px',
    border: '1px solid #e23744',
    background: '#fff',
    color: '#e23744',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    alignSelf: 'center',
  },
  /* Cart */
  cartCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
  },
  cartTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1c1c1c',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cartEmpty: {
    textAlign: 'center',
    padding: '20px 0',
    color: '#93959f',
    fontSize: '14px',
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f5f5f5',
  },
  cartItemName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1c1c1c',
    flex: 1,
    marginRight: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  qtyBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#e23744',
    fontSize: '12px',
    transition: 'all 0.2s',
  },
  qtyNum: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1c1c1c',
    minWidth: '20px',
    textAlign: 'center',
  },
  cartItemPrice: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#686b78',
    marginLeft: '12px',
    whiteSpace: 'nowrap',
  },
  divider: {
    height: '1px',
    background: '#e0e0e0',
    margin: '12px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#686b78',
    marginBottom: '8px',
  },
  grandTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1c1c1c',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #e0e0e0',
  },
  inputLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1c1c1c',
    marginBottom: '4px',
    display: 'block',
    marginTop: '14px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
    cursor: 'pointer',
  },
  placeOrderBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: '#e23744',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '16px',
    transition: 'background 0.2s',
  },
  placeOrderBtnDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  loginPrompt: {
    background: '#fff8e1',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid #ffe082',
  },
  loginPromptText: {
    fontSize: '14px',
    color: '#686b78',
    margin: '0 0 12px 0',
  },
  loginLink: {
    color: '#e23744',
    fontWeight: '600',
    textDecoration: 'none',
  },
  /* Skeleton */
  skeletonBlock: (w, h) => ({
    width: w,
    height: h,
    borderRadius: '6px',
    background: '#f0f0f0',
    marginBottom: '10px',
  }),
  /* Error */
  errorBox: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  errorText: {
    fontSize: '16px',
    color: '#e23744',
    marginBottom: '12px',
  },
  retryBtn: {
    padding: '8px 24px',
    borderRadius: '8px',
    border: '1px solid #e23744',
    background: '#e23744',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
  },
  /* Mobile cart toggle */
  mobileCartBtn: {
    display: 'none',
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 100,
    padding: '14px 20px',
    borderRadius: '30px',
    border: 'none',
    background: '#e23744',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(226,55,68,0.35)',
    alignItems: 'center',
    gap: '8px',
  },
  cartBadge: {
    background: '#fff',
    color: '#e23744',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    marginLeft: '4px',
  },
};

/* Inject a responsive style tag for mobile layout */
const RESPONSIVE_CSS = `
  @media (max-width: 800px) {
    .rd-layout { flex-direction: column !important; }
    .rd-cart-section { width: 100% !important; position: static !important; }
    .rd-mobile-cart-btn { display: flex !important; }
  }
`;

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rd-responsive-css')) return;
  const style = document.createElement('style');
  style.id = 'rd-responsive-css';
  style.textContent = RESPONSIVE_CSS;
  document.head.appendChild(style);
}

function MenuCategory({ category, cart, onAddItem }) {
  const [expanded, setExpanded] = useState(true);
  const items = category.menu_items || category.items || [];

  return (
    <div style={styles.categoryCard}>
      <div
        style={styles.categoryHeader}
        onClick={() => setExpanded((p) => !p)}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f2f2f2')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#fafafa')}
      >
        <h3 style={styles.categoryName}>
          {category.name}
          <span style={styles.categoryCount}>({items.length})</span>
        </h3>
        {expanded ? <FaChevronUp size={14} color="#93959f" /> : <FaChevronDown size={14} color="#93959f" />}
      </div>
      {expanded && items.map((item) => {
        const isVeg = item.is_veg != null ? item.is_veg : true;
        const inCart = cart.find((c) => c.menu_item === item.id);
        return (
          <div key={item.id} style={styles.menuItem}>
            <div style={styles.itemInfo}>
              <p style={styles.itemName}>
                <span style={styles.vegIndicator(isVeg)}>
                  <span style={styles.vegDot(isVeg)} />
                </span>
                {item.name}
              </p>
              {item.description && (
                <p style={styles.itemDesc}>{item.description}</p>
              )}
              <span style={styles.itemPrice}>
                ₹{parseFloat(item.price).toFixed(2)}
              </span>
            </div>
            <button
              style={styles.addBtn}
              onClick={() => onAddItem(item)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e23744';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = '#e23744';
              }}
            >
              {inCart ? `Added (${inCart.quantity})` : 'Add'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function CartSidebar({
  cart,
  restaurant,
  onUpdateQty,
  onRemoveItem,
  deliveryAddress,
  setDeliveryAddress,
  paymentMethod,
  setPaymentMethod,
  onPlaceOrder,
  ordering,
  user,
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = restaurant?.delivery_fee ? parseFloat(restaurant.delivery_fee) : 0;
  const grandTotal = subtotal + deliveryFee;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isCustomer = user?.role === 'customer';

  if (!user) {
    return (
      <div style={styles.loginPrompt}>
        <p style={styles.loginPromptText}>
          Please log in to add items and place an order.
        </p>
        <Link to="/login" style={styles.loginLink}>
          Login to order
        </Link>
      </div>
    );
  }

  if (!isCustomer) {
    return (
      <div style={styles.loginPrompt}>
        <p style={styles.loginPromptText}>
          Only customers can place orders. Please log in with a customer account.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.cartCard}>
      <h3 style={styles.cartTitle}>
        <FaShoppingCart size={18} /> Your Order
        {totalItems > 0 && (
          <span style={styles.cartBadge}>{totalItems}</span>
        )}
      </h3>

      {cart.length === 0 ? (
        <p style={styles.cartEmpty}>Your cart is empty. Add items from the menu.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.menu_item} style={styles.cartItem}>
              <span style={styles.cartItemName}>{item.name}</span>
              <div style={styles.qtyControls}>
                {item.quantity === 1 ? (
                  <button
                    style={styles.qtyBtn}
                    onClick={() => onRemoveItem(item.menu_item)}
                    title="Remove item"
                  >
                    <FaTrash size={10} />
                  </button>
                ) : (
                  <button
                    style={styles.qtyBtn}
                    onClick={() => onUpdateQty(item.menu_item, -1)}
                  >
                    <FaMinus size={10} />
                  </button>
                )}
                <span style={styles.qtyNum}>{item.quantity}</span>
                <button
                  style={styles.qtyBtn}
                  onClick={() => onUpdateQty(item.menu_item, 1)}
                >
                  <FaPlus size={10} />
                </button>
              </div>
              <span style={styles.cartItemPrice}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}

          <div style={styles.divider} />
          <div style={styles.totalRow}>
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={styles.totalRow}>
            <span>Delivery Fee</span>
            <span>{deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'Free'}</span>
          </div>
          <div style={styles.grandTotal}>
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>

          <label style={styles.inputLabel}>
            Delivery Address <span style={{ color: '#e23744' }}>*</span>
          </label>
          <input
            style={styles.input}
            placeholder="Enter your delivery address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = '#e23744')}
            onBlur={(e) => {
              if (!deliveryAddress.trim()) {
                e.target.style.borderColor = '#e23744';
              } else {
                e.target.style.borderColor = '#e0e0e0';
              }
            }}
          />

          <label style={styles.inputLabel}>Payment Method</label>
          <select
            style={styles.select}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cod">Cash on Delivery</option>
            <option value="online">Online Payment</option>
          </select>

          <button
            style={{
              ...styles.placeOrderBtn,
              ...(ordering ? styles.placeOrderBtnDisabled : {}),
            }}
            disabled={ordering}
            onClick={() => {
              if (!deliveryAddress.trim()) {
                toast.error('Please enter a delivery address to place your order.');
                return;
              }
              onPlaceOrder();
            }}
            onMouseEnter={(e) => {
              if (!ordering) {
                e.currentTarget.style.background = '#c5303b';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(226, 55, 68, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!ordering) {
                e.currentTarget.style.background = '#e23744';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {ordering ? 'Placing Order...' : `Place Order  -  ₹${grandTotal.toFixed(2)}`}
          </button>
        </>
      )}
    </div>
  );
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.address || user?.customer_profile?.default_address || ''
  );
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    if (user && !deliveryAddress) {
      setDeliveryAddress(user.address || user.customer_profile?.default_address || '');
    }
  }, [user]);

  useEffect(() => {
    injectStyles();
  }, []);

  const fetchRestaurant = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get(`/restaurants/${id}/`);
      setRestaurant(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load restaurant details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const categories = useMemo(() => {
    if (!restaurant) return [];
    return restaurant.categories || restaurant.menu_categories || [];
  }, [restaurant]);

  const addItem = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menu_item === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menu_item === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          menu_item: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: 1,
        },
      ];
    });
  }, []);

  const updateQty = useCallback((menuItemId, delta) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menu_item === menuItemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setCart((prev) => prev.filter((c) => c.menu_item !== menuItemId));
  }, []);

  const placeOrder = async () => {
    if (cart.length === 0 || !deliveryAddress.trim()) return;
    setOrdering(true);
    try {
      const payload = {
        items: cart.map(({ menu_item, quantity }) => ({ menu_item, quantity })),
        delivery_address: deliveryAddress.trim(),
        payment_method: paymentMethod,
      };
      const { data } = await API.post('/orders/place/', payload);
      toast.success('Order placed successfully!');
      setCart([]);
      setDeliveryAddress('');
      const orderId = data.id || data.order_id;
      if (orderId) {
        navigate(`/orders/${orderId}`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to place order. Please try again.';
      toast.error(msg);
    } finally {
      setOrdering(false);
    }
  };

  const totalCartItems = cart.reduce((sum, c) => sum + c.quantity, 0);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.headerCard}>
          <div style={styles.skeletonBlock('60%', '28px')} />
          <div style={styles.skeletonBlock('30%', '16px')} />
          <div style={styles.skeletonBlock('45%', '16px')} />
          <div style={{ ...styles.metaStrip, borderTop: 'none', paddingTop: 0 }}>
            <div style={styles.skeletonBlock('80px', '14px')} />
            <div style={styles.skeletonBlock('80px', '14px')} />
          </div>
        </div>
        <div style={styles.skeletonBlock('40%', '22px')} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ ...styles.categoryCard, padding: '16px 20px', marginBottom: '12px' }}>
            <div style={styles.skeletonBlock('50%', '16px')} />
            <div style={styles.skeletonBlock('100%', '50px')} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={fetchRestaurant} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  const displayRating = restaurant.rating != null
    ? parseFloat(restaurant.rating).toFixed(1)
    : '--';

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/restaurants" style={styles.breadcrumbLink}>
          Restaurants
        </Link>
        {' / '}
        <span style={{ color: '#1c1c1c' }}>{restaurant.name}</span>
      </div>

      {/* Header */}
      <div style={styles.headerCard}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.restaurantName}>{restaurant.name}</h1>
            {restaurant.cuisine_type && (
              <p style={styles.cuisineText}>{restaurant.cuisine_type}</p>
            )}
            {restaurant.address && (
              <p style={styles.addressText}>
                <FaMapMarkerAlt size={12} /> {restaurant.address}
              </p>
            )}
          </div>
          <div style={styles.ratingBox}>
            <span style={styles.ratingNum}>
              <FaStar size={14} /> {displayRating}
            </span>
            <span style={styles.ratingLabel}>Rating</span>
          </div>
        </div>
        {restaurant.description && (
          <p style={styles.description}>{restaurant.description}</p>
        )}
        <div style={styles.metaStrip}>
          {restaurant.estimated_delivery_time && (
            <div style={styles.metaItem}>
              <FaClock size={14} color="#686b78" />
              {restaurant.estimated_delivery_time} min delivery
            </div>
          )}
          {restaurant.delivery_fee != null && (
            <div style={styles.metaItem}>
              ₹{parseFloat(restaurant.delivery_fee).toFixed(2)} delivery fee
            </div>
          )}
          {restaurant.opening_time && restaurant.closing_time && (
            <div style={styles.metaItem}>
              {restaurant.opening_time} - {restaurant.closing_time}
            </div>
          )}
        </div>
      </div>

      {/* Menu + Cart layout */}
      <div style={styles.layout} className="rd-layout">
        <div style={styles.menuSection}>
          <h2 style={styles.menuTitle}>Menu</h2>
          {categories.length === 0 ? (
            <p style={{ color: '#93959f', fontSize: '14px' }}>
              No menu items available at the moment.
            </p>
          ) : (
            categories.map((category) => (
              <MenuCategory
                key={category.id || category.name}
                category={category}
                cart={cart}
                onAddItem={addItem}
              />
            ))
          )}
        </div>

        <div style={styles.cartSection} className="rd-cart-section">
          <CartSidebar
            cart={cart}
            restaurant={restaurant}
            onUpdateQty={updateQty}
            onRemoveItem={removeItem}
            deliveryAddress={deliveryAddress}
            setDeliveryAddress={setDeliveryAddress}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            onPlaceOrder={placeOrder}
            ordering={ordering}
            user={user}
          />
        </div>
      </div>

      {/* Mobile floating cart button */}
      {user && user.role === 'customer' && totalCartItems > 0 && (
        <button
          className="rd-mobile-cart-btn"
          style={styles.mobileCartBtn}
          onClick={() => {
            const el = document.querySelector('.rd-cart-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <FaShoppingCart size={16} />
          View Cart
          <span style={styles.cartBadge}>{totalCartItems}</span>
        </button>
      )}
    </div>
  );
}
