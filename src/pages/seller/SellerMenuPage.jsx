import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { marketplaceService } from '../../lib/supabase';
import { storageService } from '../../services/storageService';

export default function SellerMenuPage() {
  const { user } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  
  // Item Form State
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [itemCat, setItemCat] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemVeg, setItemVeg] = useState(true);
  const [itemBestseller, setItemBestseller] = useState(false);
  const [itemPrep, setItemPrep] = useState('15');
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemImage, setItemImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const rest = await marketplaceService.getSellerRestaurant(user.id);
      setRestaurant(rest);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName || !restaurant) return;
    try {
      const updatedRest = { ...restaurant };
      updatedRest.categories = updatedRest.categories || [];
      if (!updatedRest.categories.find(c => c.name.toUpperCase() === newCatName.toUpperCase())) {
        updatedRest.categories.push({ id: `cat-${Date.now()}`, name: newCatName.toUpperCase(), items: [] });
        await marketplaceService.updateSellerRestaurant(restaurant.id, { categories: updatedRest.categories });
        setRestaurant(updatedRest);
      }
      setNewCatName('');
    } catch (err) {
      alert(err.message);
    }
  };

  const openAddItem = (categoryName) => {
    setEditingItem(null);
    setItemCat(categoryName || (restaurant.categories?.[0]?.name || ''));
    setItemName('');
    setItemDesc('');
    setItemPrice('');
    setItemVeg(true);
    setItemBestseller(false);
    setItemPrep('15');
    setItemAvailable(true);
    setItemImage(null);
    setShowItemModal(true);
  };

  const openEditItem = (categoryName, item) => {
    setEditingItem(item);
    setItemCat(categoryName);
    setItemName(item.name);
    setItemDesc(item.description);
    setItemPrice(item.price);
    setItemVeg(item.is_veg);
    setItemBestseller(item.is_bestseller);
    setItemPrep(item.prep_time_min?.toString() || '15');
    setItemAvailable(item.is_available);
    setItemImage(item.image_url || null);
    setShowItemModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !restaurant) return;
    
    setUploadingImage(true);
    try {
      const url = await storageService.uploadFoodImage(file, restaurant.id);
      setItemImage(url);
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!restaurant) return;

    try {
      if (editingItem) {
        // Edit existing
        const updatedRest = { ...restaurant };
        const catIndex = updatedRest.categories.findIndex(c => c.name === itemCat);
        if (catIndex > -1) {
          const itemIndex = updatedRest.categories[catIndex].items.findIndex(i => i.id === editingItem.id);
          if (itemIndex > -1) {
            updatedRest.categories[catIndex].items[itemIndex] = {
              ...editingItem,
              name: itemName,
              description: itemDesc,
              price: Number(itemPrice),
              is_veg: itemVeg,
              is_bestseller: itemBestseller,
              prep_time_min: Number(itemPrep),
              is_available: itemAvailable,
              image_url: itemImage
            };
          }
        }
        await marketplaceService.updateSellerRestaurant(restaurant.id, { categories: updatedRest.categories });
        setRestaurant(updatedRest);
      } else {
        // Add new
        await marketplaceService.addMenuItem(restaurant.id, itemCat, {
          name: itemName,
          description: itemDesc,
          price: itemPrice,
          is_veg: itemVeg,
          is_bestseller: itemBestseller,
          prep_time_min: itemPrep,
          image_url: itemImage
        });
        await loadData();
      }
      setShowItemModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item? This may affect historical orders.')) return;
    await marketplaceService.deleteMenuItem(restaurant.id, itemId);
    await loadData();
  };

  const handleToggleAvailability = async (itemId) => {
    await marketplaceService.toggleMenuItemAvailability(restaurant.id, itemId);
    await loadData();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading menu...</div>;
  if (!restaurant) return <div style={{ padding: '2rem' }}>Please complete restaurant setup first.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--red)', margin: 0 }}>
          MENU MANAGEMENT
        </h1>
        <button onClick={() => openAddItem('')} className="btn-editorial" style={{ backgroundColor: 'var(--black)', color: 'var(--white)', padding: '0.8rem 1.2rem', fontSize: '1rem' }}>
          + ADD FOOD ITEM
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Categories Sidebar */}
        <div style={{ backgroundColor: 'var(--white)', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
          <div style={{ padding: '1rem', borderBottom: 'var(--border-thick)', backgroundColor: 'var(--cream)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>CATEGORIES</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
              {restaurant.categories?.map((cat, idx) => (
                <li key={cat.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>{cat.name}</span>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>{cat.items?.length || 0} items</span>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New Category" required style={{ flex: 1, padding: '0.5rem', border: '1px solid #111' }} />
              <button type="submit" style={{ padding: '0.5rem', background: 'var(--yellow)', border: '1px solid #111', cursor: 'pointer', fontWeight: 'bold' }}>ADD</button>
            </form>
          </div>
        </div>

        {/* Menu Items List */}
        <div>
          {(!restaurant.categories || restaurant.categories.length === 0) ? (
            <div style={{ backgroundColor: 'var(--white)', padding: '3rem', textAlign: 'center', border: 'var(--border-thick)' }}>
              Add a category first to start building your menu!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {restaurant.categories.map(cat => (
                <div key={cat.id}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: '0 0 1rem', borderBottom: '2px solid var(--black)', paddingBottom: '0.5rem' }}>
                    {cat.name}
                  </h2>
                  
                  {(!cat.items || cat.items.length === 0) ? (
                    <p style={{ color: '#666', fontStyle: 'italic', fontSize: '0.9rem' }}>No items in this category.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {cat.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: item.is_available ? 'var(--white)' : '#f5f5f5', border: 'var(--border-thick)', padding: '1rem', opacity: item.is_available ? 1 : 0.7 }}>
                          {item.image_url && (
                            <img src={item.image_url} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid #111' }} />
                          )}
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{item.is_veg ? '🌱' : '🍗'}</span> {item.name}
                              {item.is_bestseller && <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--yellow)', padding: '0.1rem 0.3rem', border: '1px solid #111' }}>BESTSELLER</span>}
                            </h4>
                            <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#555', maxWidth: '400px' }}>{item.description}</p>
                            <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--red)' }}>₹{item.price}</div>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => openEditItem(cat.name, item)} style={{ padding: '0.4rem 0.8rem', background: 'var(--cream)', border: '1px solid #111', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>EDIT</button>
                              <button onClick={() => handleDeleteItem(item.id)} style={{ padding: '0.4rem 0.8rem', background: 'var(--red)', color: 'white', border: '1px solid #111', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>DELETE</button>
                            </div>
                            <button onClick={() => handleToggleAvailability(item.id)} style={{ padding: '0.3rem 0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline', color: item.is_available ? '#666' : 'var(--green)' }}>
                              {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showItemModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--cream)', border: 'var(--border-thick)', padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 1.5rem' }}>{editingItem ? 'EDIT FOOD ITEM' : 'ADD FOOD ITEM'}</h2>
            
            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>CATEGORY</label>
                <select required value={itemCat} onChange={e => setItemCat(e.target.value)} style={{ width: '100%', padding: '0.7rem', border: 'var(--border-thick)' }}>
                  <option value="" disabled>Select Category</option>
                  {restaurant.categories?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>FOOD NAME</label>
                <input type="text" required value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', padding: '0.7rem', border: 'var(--border-thick)' }} />
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>DESCRIPTION</label>
                <textarea value={itemDesc} onChange={e => setItemDesc(e.target.value)} rows="3" style={{ width: '100%', padding: '0.7rem', border: 'var(--border-thick)', resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>PRICE (₹)</label>
                  <input type="number" required value={itemPrice} onChange={e => setItemPrice(e.target.value)} style={{ width: '100%', padding: '0.7rem', border: 'var(--border-thick)' }} />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>PREP TIME (MIN)</label>
                  <input type="number" required value={itemPrep} onChange={e => setItemPrep(e.target.value)} style={{ width: '100%', padding: '0.7rem', border: 'var(--border-thick)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={itemVeg} onChange={e => setItemVeg(e.target.checked)} /> VEGETARIAN 🌱
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={itemBestseller} onChange={e => setItemBestseller(e.target.checked)} /> BESTSELLER ⭐
                </label>
                {editingItem && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={itemAvailable} onChange={e => setItemAvailable(e.target.checked)} /> AVAILABLE
                  </label>
                )}
              </div>

              {/* Image Upload Integration */}
              <div style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed var(--black)', textAlign: 'center', backgroundColor: 'var(--white)' }}>
                <p style={{ margin: '0 0 0.5rem', fontFamily: 'var(--font-display)' }}>FOOD IMAGE</p>
                {itemImage && (
                  <div style={{ marginBottom: '1rem' }}>
                    <img src={itemImage} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #111' }} />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  style={{ padding: '0.5rem 1rem', background: 'var(--cream)', border: '1px solid #111', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  {uploadingImage ? 'UPLOADING...' : 'CHOOSE IMAGE'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowItemModal(false)} style={{ padding: '0.8rem 1.5rem', background: 'transparent', border: '1px solid var(--black)', cursor: 'pointer', fontWeight: 'bold' }}>CANCEL</button>
                <button type="submit" style={{ padding: '0.8rem 1.5rem', background: 'var(--yellow)', border: '1px solid var(--black)', cursor: 'pointer', fontWeight: 'bold' }}>{editingItem ? 'SAVE CHANGES' : 'ADD ITEM'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
