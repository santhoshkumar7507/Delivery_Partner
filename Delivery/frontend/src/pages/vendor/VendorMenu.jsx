import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import {
  FaUtensils,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaStar,
} from 'react-icons/fa';

const BRAND = '#E23744';

const styles = {
  container: {
    maxWidth: 1200,
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
  layout: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: 24,
    alignItems: 'start',
  },
  panel: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f0f0f0',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1c1c1c',
    margin: 0,
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 14px',
    background: BRAND,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  catItem: (selected) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    cursor: 'pointer',
    background: selected ? '#fce4ec' : '#fff',
    borderLeft: selected ? `3px solid ${BRAND}` : '3px solid transparent',
    transition: 'all 0.15s',
  }),
  catName: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1c1c1c',
  },
  catActions: {
    display: 'flex',
    gap: 8,
  },
  iconBtn: (color) => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: color || '#696969',
    fontSize: 14,
    padding: 2,
  }),
  formOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: 14,
    padding: 32,
    width: '90%',
    maxWidth: 520,
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1c1c1c',
    marginBottom: 20,
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
    boxSizing: 'border-box',
    marginBottom: 16,
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    minHeight: 70,
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
  },
  modalActions: {
    display: 'flex',
    gap: 12,
    marginTop: 8,
  },
  primaryBtn: {
    flex: 1,
    padding: '10px 20px',
    background: BRAND,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  cancelBtn: {
    flex: 1,
    padding: '10px 20px',
    background: '#f5f5f5',
    color: '#333',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  itemCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '18px 20px',
    marginBottom: 12,
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  vegDot: (isVeg) => ({
    width: 16,
    height: 16,
    border: `2px solid ${isVeg ? '#2e7d32' : BRAND}`,
    borderRadius: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 3,
  }),
  vegDotInner: (isVeg) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: isVeg ? '#2e7d32' : BRAND,
  }),
  itemName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1c1c1c',
  },
  itemDesc: {
    fontSize: 13,
    color: '#696969',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 700,
    color: '#1c1c1c',
    marginTop: 4,
  },
  bestseller: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 11,
    fontWeight: 600,
    color: '#e65100',
    background: '#fff3e0',
    padding: '2px 8px',
    borderRadius: 10,
    marginTop: 4,
    marginLeft: 8,
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  availableToggle: (available) => ({
    width: 42,
    height: 22,
    borderRadius: 11,
    background: available ? '#2e7d32' : '#ccc',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 0.2s',
  }),
  availableKnob: (available) => ({
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute',
    top: 2,
    left: available ? 22 : 2,
    transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  }),
  empty: {
    textAlign: 'center',
    padding: 40,
    color: '#696969',
    fontSize: 14,
  },
  loading: {
    textAlign: 'center',
    padding: 60,
    fontSize: 16,
    color: '#696969',
  },
};

export default function VendorMenu() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '' });

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    is_veg: false,
    is_bestseller: false,
    preparation_time: '',
    category: '',
    is_available: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([
        API.get('/restaurants/vendor/categories/'),
        API.get('/restaurants/vendor/menu-items/'),
      ]);
      const cats = Array.isArray(catRes.data) ? catRes.data : catRes.data.results || [];
      const itms = Array.isArray(itemRes.data) ? itemRes.data : itemRes.data.results || [];
      setCategories(cats);
      setItems(itms);
      if (cats.length > 0 && !selectedCat) {
        setSelectedCat(cats[0].id);
      }
    } catch (err) {
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  // ---- Category CRUD ----
  const openAddCategory = () => {
    setEditingCat(null);
    setCatForm({ name: '', description: '' });
    setShowCatModal(true);
  };

  const openEditCategory = (cat) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, description: cat.description || '' });
    setShowCatModal(true);
  };

  const handleCatSubmit = async () => {
    if (!catForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      if (editingCat) {
        const { data } = await API.put(
          `/restaurants/vendor/categories/${editingCat.id}/`,
          catForm
        );
        setCategories((prev) => prev.map((c) => (c.id === editingCat.id ? data : c)));
        toast.success('Category updated');
      } else {
        const { data } = await API.post('/restaurants/vendor/categories/', catForm);
        setCategories((prev) => [...prev, data]);
        if (!selectedCat) setSelectedCat(data.id);
        toast.success('Category added');
      }
      setShowCatModal(false);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (typeof err.response?.data === 'object'
          ? Object.values(err.response.data).flat().join(', ')
          : 'Failed to save category');
      toast.error(msg);
    }
  };

  const deleteCategory = async (catId) => {
    if (!window.confirm('Delete this category? All items in it may also be deleted.')) return;
    try {
      await API.delete(`/restaurants/vendor/categories/${catId}/`);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      setItems((prev) => prev.filter((i) => i.category !== catId));
      if (selectedCat === catId) {
        const remaining = categories.filter((c) => c.id !== catId);
        setSelectedCat(remaining.length > 0 ? remaining[0].id : null);
      }
      toast.success('Category deleted');
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  // ---- Menu Item CRUD ----
  const openAddItem = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      description: '',
      price: '',
      is_veg: false,
      is_bestseller: false,
      preparation_time: '',
      category: selectedCat || (categories.length > 0 ? categories[0].id : ''),
      is_available: true,
    });
    setShowItemModal(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      is_veg: item.is_veg || false,
      is_bestseller: item.is_bestseller || false,
      preparation_time: item.preparation_time || '',
      category: item.category,
      is_available: item.is_available !== undefined ? item.is_available : true,
    });
    setShowItemModal(true);
  };

  const handleItemSubmit = async () => {
    if (!itemForm.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (!itemForm.price || parseFloat(itemForm.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!itemForm.category) {
      toast.error('Please select a category');
      return;
    }
    try {
      const payload = {
        ...itemForm,
        price: parseFloat(itemForm.price),
        preparation_time: itemForm.preparation_time || 15,
      };
      if (editingItem) {
        const { data } = await API.put(
          `/restaurants/vendor/menu-items/${editingItem.id}/`,
          payload
        );
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data : i)));
        toast.success('Item updated');
      } else {
        const { data } = await API.post('/restaurants/vendor/menu-items/', payload);
        setItems((prev) => [...prev, data]);
        toast.success('Item added');
      }
      setShowItemModal(false);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (typeof err.response?.data === 'object'
          ? Object.values(err.response.data).flat().join(', ')
          : 'Failed to save item');
      toast.error(msg);
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await API.delete(`/restaurants/vendor/menu-items/${itemId}/`);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success('Item deleted');
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const toggleAvailable = async (item) => {
    try {
      const { data } = await API.put(`/restaurants/vendor/menu-items/${item.id}/`, {
        ...item,
        is_available: !item.is_available,
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? data : i)));
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  const filteredItems = items.filter((i) => i.category === selectedCat);

  if (loading) {
    return <div style={styles.loading}>Loading menu...</div>;
  }

  return (
    <div style={styles.container}>
      <button style={styles.backLink} onClick={() => navigate('/vendor')}>
        <FaArrowLeft /> Back to Dashboard
      </button>

      <div style={styles.header}>
        <FaUtensils style={{ fontSize: 26, color: BRAND }} />
        <h1 style={styles.title}>Menu Management</h1>
      </div>

      <div style={styles.layout}>
        {/* Left: Categories */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Categories</h3>
            <button style={styles.addBtn} onClick={openAddCategory}>
              <FaPlus /> Add
            </button>
          </div>
          {categories.length === 0 ? (
            <div style={styles.empty}>No categories yet. Add one to get started.</div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                style={styles.catItem(selectedCat === cat.id)}
                onClick={() => setSelectedCat(cat.id)}
              >
                <div>
                  <div style={styles.catName}>{cat.name}</div>
                  {cat.description && (
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                      {cat.description}
                    </div>
                  )}
                </div>
                <div style={styles.catActions}>
                  <button
                    style={styles.iconBtn('#1565c0')}
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditCategory(cat);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    style={styles.iconBtn(BRAND)}
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(cat.id);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Menu Items */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#1c1c1c',
                margin: 0,
              }}
            >
              {selectedCat
                ? `Items in "${categories.find((c) => c.id === selectedCat)?.name || ''}"`
                : 'Select a Category'}
            </h3>
            {selectedCat && (
              <button style={styles.addBtn} onClick={openAddItem}>
                <FaPlus /> Add Item
              </button>
            )}
          </div>

          {!selectedCat ? (
            <div style={{ ...styles.panel, ...styles.empty }}>
              Select a category to view menu items
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ ...styles.panel, ...styles.empty }}>
              No items in this category.{' '}
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: BRAND,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: 14,
                }}
                onClick={openAddItem}
              >
                Add one
              </button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} style={styles.itemCard}>
                <div style={styles.itemLeft}>
                  <div style={styles.vegDot(item.is_veg)}>
                    <div style={styles.vegDotInner(item.is_veg)} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={styles.itemName}>{item.name}</span>
                      {item.is_bestseller && (
                        <span style={styles.bestseller}>
                          <FaStar /> Bestseller
                        </span>
                      )}
                    </div>
                    {item.description && <div style={styles.itemDesc}>{item.description}</div>}
                    <div style={styles.itemPrice}>
                      {'\u20B9'}{parseFloat(item.price).toFixed(2)}
                    </div>
                    {item.preparation_time && (
                      <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                        Prep: {item.preparation_time} min
                      </div>
                    )}
                  </div>
                </div>
                <div style={styles.itemRight}>
                  <div
                    style={styles.availableToggle(item.is_available !== false)}
                    onClick={() => toggleAvailable(item)}
                    title={item.is_available !== false ? 'Available' : 'Unavailable'}
                  >
                    <div style={styles.availableKnob(item.is_available !== false)} />
                  </div>
                  <button
                    style={styles.iconBtn('#1565c0')}
                    title="Edit"
                    onClick={() => openEditItem(item)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    style={styles.iconBtn(BRAND)}
                    title="Delete"
                    onClick={() => deleteItem(item.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div style={styles.formOverlay} onClick={() => setShowCatModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingCat ? 'Edit Category' : 'Add Category'}
            </h2>
            <label style={styles.label}>Category Name *</label>
            <input
              style={styles.input}
              type="text"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              placeholder="e.g. Starters, Main Course..."
              autoFocus
            />
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              placeholder="Optional description"
            />
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowCatModal(false)}>
                <FaTimes style={{ marginRight: 4 }} /> Cancel
              </button>
              <button style={styles.primaryBtn} onClick={handleCatSubmit}>
                <FaCheck style={{ marginRight: 4 }} /> {editingCat ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div style={styles.formOverlay} onClick={() => setShowItemModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>

            <label style={styles.label}>Item Name *</label>
            <input
              style={styles.input}
              type="text"
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              placeholder="e.g. Paneer Tikka"
              autoFocus
            />

            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              placeholder="Describe the dish..."
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={styles.label}>Price ({'\u20B9'}) *</label>
                <input
                  style={styles.input}
                  type="number"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label style={styles.label}>Preparation Time (mins)</label>
                <input
                  style={styles.input}
                  type="number"
                  value={itemForm.preparation_time}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, preparation_time: e.target.value })
                  }
                  placeholder="15"
                  min="1"
                />
              </div>
            </div>

            <label style={styles.label}>Category *</label>
            <select
              style={styles.select}
              value={itemForm.category}
              onChange={(e) => setItemForm({ ...itemForm, category: parseInt(e.target.value) })}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div style={styles.checkboxRow}>
              <input
                type="checkbox"
                id="is_veg"
                checked={itemForm.is_veg}
                onChange={(e) => setItemForm({ ...itemForm, is_veg: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: '#2e7d32' }}
              />
              <label htmlFor="is_veg" style={{ cursor: 'pointer' }}>
                Vegetarian
              </label>
            </div>

            <div style={styles.checkboxRow}>
              <input
                type="checkbox"
                id="is_bestseller"
                checked={itemForm.is_bestseller}
                onChange={(e) =>
                  setItemForm({ ...itemForm, is_bestseller: e.target.checked })
                }
                style={{ width: 16, height: 16, accentColor: '#e65100' }}
              />
              <label htmlFor="is_bestseller" style={{ cursor: 'pointer' }}>
                Bestseller
              </label>
            </div>

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowItemModal(false)}>
                <FaTimes style={{ marginRight: 4 }} /> Cancel
              </button>
              <button style={styles.primaryBtn} onClick={handleItemSubmit}>
                <FaCheck style={{ marginRight: 4 }} /> {editingItem ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
