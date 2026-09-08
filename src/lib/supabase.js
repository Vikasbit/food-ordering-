import { createClient } from '@supabase/supabase-js';
import { SEED_RESTAURANTS } from '../data/seedData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-bigbites.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// LocalStorage Persistence Keys for Offline / Mock Engine
const STORAGE_KEYS = {
  USERS: 'bigbites_db_users',
  CURRENT_USER: 'bigbites_auth_user',
  RESTAURANTS: 'bigbites_db_restaurants',
  ORDERS: 'bigbites_db_orders',
  DRIVERS: 'bigbites_db_drivers',
  DRIVER_LOCATIONS: 'bigbites_db_driver_locations',
  ADDRESSES: 'bigbites_db_addresses'
};

// Store version key to automatically refresh client cache when prices or seed data update
export const BIGBITES_STORE_VERSION = 'v7_inr_range_200_500_fixed';

/**
 * Sanitizes restaurant data so every food item price strictly falls within
 * realistic Indian restaurant prices (₹200 to ₹500).
 */
export function sanitizeRestaurantPrices(restaurant) {
  if (!restaurant) return restaurant;
  const categories = (restaurant.categories || []).map(cat => ({
    ...cat,
    items: (cat.items || []).map(item => {
      let price = Number(item.price);
      if (isNaN(price) || price < 200 || price > 500) {
        // Specific checks for known legacy USD or low-rupee mock items
        if (item.name && item.name.includes('Royal Maharaja')) {
          price = 349;
        } else if (price <= 15) {
          // Old USD values like 9.00 -> 349, 10.00 -> 370
          price = Math.round(price * 25 + 124);
        } else if (price < 100) {
          price = Math.round(price * 2.6 + 60);
        } else if (price < 200) {
          price = price + 100;
        }
        // Strictly clamp within ₹200 to ₹500 range (e.g. ₹209 - ₹499)
        price = Math.max(209, Math.min(499, Math.round(price)));
      }
      return {
        ...item,
        price
      };
    })
  }));
  return {
    ...restaurant,
    categories
  };
}

// Initialize Mock Store if empty or outdated
function initializeMockStore() {
  const currentVersion = localStorage.getItem('bigbites_store_version');
  let existingRests = [];
  try {
    existingRests = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS) || '[]');
  } catch (e) {
    existingRests = [];
  }

  // Check if any restaurant item currently has prices below 200 (like old ₹9 or ₹10 entries)
  const hasOutdatedPrices = !existingRests.length || existingRests.some(r =>
    (r.categories || []).some(c =>
      (c.items || []).some(it => Number(it.price) < 200 || Number(it.price) > 500)
    )
  );

  const hasAllRests = existingRests.length >= SEED_RESTAURANTS.length &&
    existingRests.some(r => r.city === 'VADODARA') &&
    existingRests.some(r => r.id === 'rest-vadodara-alkapuri');

  // If cached data has low prices (e.g. ₹9) or outdated version, overwrite with clean 200-500 INR data
  if (!hasAllRests || hasOutdatedPrices || currentVersion !== BIGBITES_STORE_VERSION) {
    const cleanRests = SEED_RESTAURANTS.map(sanitizeRestaurantPrices);
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(cleanRests));
    localStorage.setItem('bigbites_store_version', BIGBITES_STORE_VERSION);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const demoUsers = [
      {
        id: 'user-cust-1',
        email: 'customer@bigbites.com',
        password: 'password123',
        full_name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        role: 'customer'
      },
      {
        id: 'seller-delhi-1',
        email: 'seller@bigbites.com',
        password: 'password123',
        full_name: 'Vikram Singh (Owner)',
        phone: '+91 99887 76655',
        role: 'seller'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
    const demoDrivers = [
      {
        id: 'driver-demo-1',
        name: 'Demo Driver',
        phone: '+91 98765 12345',
        vehicle_type: 'Motorcycle',
        vehicle_number: 'DL-01-AB-1234',
        is_available: true,
        is_active: true
      }
    ];
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(demoDrivers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DRIVER_LOCATIONS)) {
    localStorage.setItem(STORAGE_KEYS.DRIVER_LOCATIONS, JSON.stringify([]));
  }
}

initializeMockStore();

// ========================================================
// UNIFIED AUTHENTICATION & MARKETPLACE DATA SERVICE
// ========================================================

export const authService = {
  async getCurrentUser() {
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      let { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      
      // Auto-provision profile if missing
      if (!profile) {
        const metadataRole = session.user.user_metadata?.role || 'customer';
        const metadataName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '';
        const metadataPhone = session.user.user_metadata?.phone || '';
        try {
          const { data: createdProfile } = await supabase.from('profiles').upsert([
            {
              id: session.user.id,
              email: session.user.email,
              full_name: metadataName,
              phone: metadataPhone,
              role: metadataRole
            }
          ]).select().maybeSingle();
          if (createdProfile) profile = createdProfile;
        } catch (e) {
          console.warn('Auto-create profile in getCurrentUser:', e);
        }
      }

      return profile || {
        id: session.user.id,
        email: session.user.email,
        role: session.user.user_metadata?.role || 'customer',
        full_name: session.user.user_metadata?.full_name || ''
      };
    }
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  },

  async signUpCustomer({ email, password, fullName, phone }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanFullName = (fullName || '').trim();
    const cleanPhone = (phone || '').trim();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: { full_name: cleanFullName, phone: cleanPhone, role: 'customer' },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      });
      if (error) throw error;
      if (data.user && data.session) {
        try {
          await supabase.from('profiles').upsert([
            { id: data.user.id, email: cleanEmail, full_name: cleanFullName, phone: cleanPhone, role: 'customer' }
          ]);
        } catch (e) {
          console.warn('Profile sync warning:', e);
        }
      }
      return data;
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (users.find((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      password: cleanPassword,
      full_name: cleanFullName,
      phone: cleanPhone,
      role: 'customer'
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return { user: newUser, session: { user: newUser } };
  },

  async signUpSeller({ fullName, ownerName, email, phone, password, restaurantName, address, city, cuisine, openingHours }) {
    const finalName = (fullName || ownerName || 'Seller').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanPhone = (phone || '').trim();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: { full_name: finalName, phone: cleanPhone, role: 'seller' },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      });
      if (error) throw error;

      if (data.user && data.session) {
        try {
          await supabase.from('profiles').upsert([
            { id: data.user.id, email: cleanEmail, full_name: finalName, phone: cleanPhone, role: 'seller' }
          ]);

          if (restaurantName) {
            const newRest = {
              seller_id: data.user.id,
              name: restaurantName,
              slug: restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              address: address || '',
              city: city || 'DELHI',
              lat: 28.6315,
              lng: 77.2167,
              cuisine: cuisine || 'Indian Street Food',
              phone: cleanPhone || '',
              opening_hours: openingHours || '10:00 AM - 11:00 PM',
              delivery_radius_km: 12,
              status: 'active',
              rating: 4.8,
              reviews_count: 1
            };
            await supabase.from('restaurants').insert([newRest]);
          }
        } catch (e) {
          console.warn('Seller restaurant setup warning:', e);
        }
      }
      return data;
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (users.find((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }
    const newSeller = {
      id: `seller-${Date.now()}`,
      email: cleanEmail,
      password: cleanPassword,
      full_name: finalName,
      phone: cleanPhone,
      role: 'seller'
    };
    users.push(newSeller);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newSeller));
    
    return { user: newSeller, session: { user: newSeller } };
  },

  async login({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
          const customErr = new Error('Email not confirmed. Please verify your email inbox or disable "Confirm email" in Supabase.');
          customErr.isEmailNotConfirmed = true;
          throw customErr;
        }
        throw error;
      }

      // Check if profile exists; if not (e.g. account was registered when email confirmation was required), create it now
      let { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      if (!profile) {
        const metadataRole = data.user.user_metadata?.role || 'customer';
        const metadataName = data.user.user_metadata?.full_name || cleanEmail.split('@')[0];
        const metadataPhone = data.user.user_metadata?.phone || '';
        try {
          const { data: createdProfile } = await supabase.from('profiles').upsert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: metadataName,
              phone: metadataPhone,
              role: metadataRole
            }
          ]).select().maybeSingle();
          if (createdProfile) profile = createdProfile;
        } catch (e) {
          console.warn('Auto profile creation on login:', e);
        }
      }

      return profile || {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'customer',
        full_name: data.user.user_metadata?.full_name || ''
      };
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const matched = users.find((u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword);
    if (!matched) {
      throw new Error('Invalid email or password. Please try again.');
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(matched));
    return matched;
  },

  async resendConfirmationEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your email address to resend confirmation link.');
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      });
      if (error) throw error;
      return true;
    }
    return true;
  },

  async logout() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// ========================================================
// RESTAURANTS & MENU SERVICE
// ========================================================

export const marketplaceService = {
  async createSellerRestaurant(restData) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('restaurants').insert([restData]).select().single();
      if (error) throw error;
      return data;
    }

    const restaurants = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS) || '[]');
    
    // Check if seller already has one
    if (restaurants.find(r => r.seller_id === restData.seller_id)) {
      throw new Error('You already have a restaurant set up.');
    }

    const newRestaurant = {
      id: `rest-${Date.now()}`,
      ...restData,
      rating: 0,
      reviews_count: 0,
      categories: [],
      logo_url: null,
      cover_url: null
    };
    restaurants.push(newRestaurant);
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
    return newRestaurant;
  },

  async getAllRestaurants() {
    let list = [];
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('restaurants').select('*, menu_categories(*, menu_items(*))').eq('status', 'active');
      if (!error && data && data.length > 0) list = data;
    }
    if (!list || !list.length) {
      try {
        list = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS) || '[]');
      } catch (e) {
        list = [];
      }
    }
    if (!list || !list.length) {
      list = SEED_RESTAURANTS;
    }
    // Always sanitize each restaurant so no item is ever below ₹200 or above ₹500
    const sanitized = list.map(sanitizeRestaurantPrices);
    return sanitized;
  },

  async getRestaurantById(id) {
    const all = await this.getAllRestaurants();
    const found = all.find((r) => r.id === id || r.slug === id) || all[0];
    return sanitizeRestaurantPrices(found);
  },

  async getSellerRestaurant(sellerId) {
    const all = await this.getAllRestaurants();
    const found = all.find((r) => r.seller_id === sellerId) || null;
    return sanitizeRestaurantPrices(found);
  },

  async updateSellerRestaurant(restaurantId, updatedFields) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS) || '[]');
    const index = all.findIndex((r) => r.id === restaurantId);
    if (index !== -1) {
      all[index] = { ...all[index], ...updatedFields };
      localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(all));
      return all[index];
    }
    return null;
  },

  async addMenuItem(restaurantId, categoryName, itemData) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS) || '[]');
    const restIndex = all.findIndex((r) => r.id === restaurantId);
    if (restIndex !== -1) {
      let categories = all[restIndex].categories || [];
      let catIndex = categories.findIndex((c) => c.name.toUpperCase() === categoryName.toUpperCase());
      
      if (catIndex === -1) {
        categories.push({ id: `cat-${Date.now()}`, name: categoryName.toUpperCase(), items: [] });
        catIndex = categories.length - 1;
      }

      const newItem = {
        id: `item-${Date.now()}`,
        name: itemData.name,
        description: itemData.description || '',
        price: Number(itemData.price),
        image_url: itemData.image_url || '/assets/meal-chicken.png',
        is_veg: Boolean(itemData.is_veg),
        is_bestseller: Boolean(itemData.is_bestseller),
        is_available: true,
        prep_time_min: Number(itemData.prep_time_min) || 15
      };

      categories[catIndex].items.push(newItem);
      all[restIndex].categories = categories;
      localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(all));
      return newItem;
    }
    return null;
  },

  async toggleMenuItemAvailability(restaurantId, itemId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS) || '[]');
    const rest = all.find((r) => r.id === restaurantId);
    if (rest && rest.categories) {
      for (const cat of rest.categories) {
        const item = cat.items.find((i) => i.id === itemId);
        if (item) {
          item.is_available = !item.is_available;
          localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(all));
          return item;
        }
      }
    }
    return null;
  },

  async deleteMenuItem(restaurantId, itemId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS) || '[]');
    const rest = all.find((r) => r.id === restaurantId);
    if (rest && rest.categories) {
      for (const cat of rest.categories) {
        cat.items = cat.items.filter((i) => i.id !== itemId);
      }
      localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(all));
      return true;
    }
    return false;
  }
};

// ========================================================
// ORDERS & REALTIME SERVICE
// ========================================================

export const orderService = {
  // Phase 4 Checkout Service handles order creation.
  
  async getCustomerOrders(customerId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    return orders.filter(o => o.customer_id === customerId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getOrderById(orderId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (error) throw error;
      return data;
    }
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    return orders.find(o => o.id === orderId) || null;
  },

  async getSellerOrders(sellerRestaurantId) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').select('*').eq('restaurant_id', sellerRestaurantId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    
    // Strict RLS equivalent for mock: only return orders matching the restaurant ID
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    return orders
      .filter((o) => o.restaurant_id === sellerRestaurantId && o.payment_status === 'CAPTURED')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async updateOrderStatus(orderId, newStatus, reason = null) {
    if (isSupabaseConfigured) {
      const payload = { status: newStatus };
      if (newStatus === 'ACCEPTED') payload.accepted_at = new Date().toISOString();
      if (newStatus === 'PREPARING') payload.preparing_at = new Date().toISOString();
      if (newStatus === 'READY_FOR_PICKUP') payload.ready_at = new Date().toISOString();
      if (newStatus === 'CANCELLED') {
        payload.rejected_at = new Date().toISOString();
        payload.rejection_reason = reason;
      }
      
      const { data, error } = await supabase.from('orders').update(payload).eq('id', orderId).select().single();
      if (error) throw error;
      return data;
    }

    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const index = orders.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      const order = orders[index];
      
      // Strict state machine validation
      const validTransitions = {
        'PENDING': ['ACCEPTED', 'CANCELLED'],
        'ACCEPTED': ['PREPARING', 'CANCELLED'],
        'PREPARING': ['READY_FOR_PICKUP', 'CANCELLED'],
        'READY_FOR_PICKUP': ['DRIVER_ASSIGNED', 'CANCELLED'],
        'DRIVER_ASSIGNED': ['PICKED_UP', 'CANCELLED'],
        'PICKED_UP': ['OUT_FOR_DELIVERY', 'CANCELLED'],
        'OUT_FOR_DELIVERY': ['DELIVERED', 'CANCELLED'],
        'DELIVERED': []
      };
      
      if (!validTransitions[order.status]?.includes(newStatus)) {
        throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
      }

      order.status = newStatus;
      order.updated_at = new Date().toISOString();
      
      // Store timestamps
      if (newStatus === 'ACCEPTED') order.accepted_at = new Date().toISOString();
      if (newStatus === 'PREPARING') order.preparing_at = new Date().toISOString();
      if (newStatus === 'READY_FOR_PICKUP') order.ready_at = new Date().toISOString();
      if (newStatus === 'DRIVER_ASSIGNED') order.assigned_at = new Date().toISOString();
      if (newStatus === 'PICKED_UP') order.picked_up_at = new Date().toISOString();
      if (newStatus === 'OUT_FOR_DELIVERY') order.out_for_delivery_at = new Date().toISOString();
      if (newStatus === 'DELIVERED') order.delivered_at = new Date().toISOString();
      if (newStatus === 'CANCELLED') {
        order.rejected_at = new Date().toISOString();
        order.rejection_reason = reason;
      }

      orders[index] = order;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      
      // Fire a custom local event to simulate realtime in the same window (edge case)
      window.dispatchEvent(new Event('mock_realtime_order_update'));
      
      return order;
    }
    throw new Error('Order not found');
  },

  async assignDriver(orderId, driverId) {
    if (isSupabaseConfigured) {
       // ... handle real supabase assignment
       return;
    }
    
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIVERS) || '[]');
    const orderIndex = orders.findIndex(o => o.id === orderId);
    const driverIndex = drivers.findIndex(d => d.id === driverId);
    
    if (orderIndex === -1) throw new Error('Order not found');
    if (driverIndex === -1) throw new Error('Driver not found');
    if (!drivers[driverIndex].is_available) throw new Error('Driver is not available');
    if (orders[orderIndex].status !== 'READY_FOR_PICKUP') throw new Error('Order is not ready for pickup');
    
    // Assign
    orders[orderIndex].driver_id = driverId;
    orders[orderIndex].driver_name = drivers[driverIndex].name;
    orders[orderIndex].driver_phone = drivers[driverIndex].phone;
    drivers[driverIndex].is_available = false;
    
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    
    await this.updateOrderStatus(orderId, 'DRIVER_ASSIGNED');
    return orders[orderIndex];
  },
  
  async completeDelivery(orderId) {
     const order = await this.updateOrderStatus(orderId, 'DELIVERED');
     if (order && order.driver_id) {
       const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIVERS) || '[]');
       const driverIndex = drivers.findIndex(d => d.id === order.driver_id);
       if (driverIndex !== -1) {
         drivers[driverIndex].is_available = true;
         localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
       }
     }
     return order;
  },

  // REALTIME SUBSCRIPTIONS (Cross-tab support via Storage Events)
  subscribeToOrder(orderId, callback) {
    if (isSupabaseConfigured) {
      const channel = supabase.channel(`public:orders:id=eq.${orderId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, (payload) => {
          callback(payload.new);
        }).subscribe();
      return () => supabase.removeChannel(channel);
    }
    
    // Mock Realtime
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.ORDERS || e.type === 'mock_realtime_order_update') {
        const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) callback(updatedOrder);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mock_realtime_order_update', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mock_realtime_order_update', handleStorageChange);
    };
  },

  subscribeToRestaurantOrders(restaurantId, callback) {
    if (isSupabaseConfigured) {
      const channel = supabase.channel(`public:orders:restaurant_id=eq.${restaurantId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` }, (payload) => {
          callback(payload.new);
        }).subscribe();
      return () => supabase.removeChannel(channel);
    }
    
    // Mock Realtime
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.ORDERS || e.type === 'mock_realtime_order_update') {
        // Just trigger callback to refresh the list
        callback();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mock_realtime_order_update', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mock_realtime_order_update', handleStorageChange);
    };
  }
};

// ========================================================
// DRIVER & LOCATION SERVICE (PHASE 6)
// ========================================================

export const driverService = {
  async getAvailableDrivers() {
    if (isSupabaseConfigured) {
      // return supabase logic
      return [];
    }
    const drivers = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIVERS) || '[]');
    return drivers.filter(d => d.is_active && d.is_available);
  },

  async updateDriverLocation(orderId, driverId, lat, lng, heading = 0) {
    if (isSupabaseConfigured) {
       // Real supabase
       return;
    }
    
    const locations = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIVER_LOCATIONS) || '[]');
    const newLocation = {
      order_id: orderId,
      driver_id: driverId,
      latitude: lat,
      longitude: lng,
      heading,
      recorded_at: new Date().toISOString()
    };
    
    // For MVP, just keep the latest location per order to save space
    const filtered = locations.filter(l => l.order_id !== orderId);
    filtered.push(newLocation);
    
    localStorage.setItem(STORAGE_KEYS.DRIVER_LOCATIONS, JSON.stringify(filtered));
    
    // Dispatch event for realtime cross-tab simulation
    const event = new CustomEvent('mock_realtime_location_update', { detail: newLocation });
    window.dispatchEvent(event);
    
    return newLocation;
  },

  subscribeToDriverLocation(orderId, callback) {
    if (isSupabaseConfigured) {
      // Supabase realtime location tracking
      return () => {};
    }
    
    // Mock Realtime
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.DRIVER_LOCATIONS) {
        const locations = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIVER_LOCATIONS) || '[]');
        const loc = locations.find(l => l.order_id === orderId);
        if (loc) callback(loc);
      }
    };
    
    const handleLocalEvent = (e) => {
      if (e.detail && e.detail.order_id === orderId) {
        callback(e.detail);
      }
    }
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mock_realtime_location_update', handleLocalEvent);
    
    // Initial fetch
    const locations = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIVER_LOCATIONS) || '[]');
    const loc = locations.find(l => l.order_id === orderId);
    if (loc) callback(loc);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mock_realtime_location_update', handleLocalEvent);
    };
  }
};

// ========================================================
// SAVED ADDRESSES SERVICE (GOOGLE MAPS ADDRESS BOOK)
// ========================================================

export const addressService = {
  async getAddresses(userId) {
    if (!userId) return [];
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADDRESSES) || '[]');
    return all.filter((a) => a.user_id === userId);
  },

  async saveAddress(userId, addressData) {
    if (!userId || !addressData) return null;
    const newAddress = {
      id: addressData.id || `addr-${Date.now()}`,
      user_id: userId,
      label: addressData.label || 'Home',
      full_address: addressData.full_address || addressData.address || '',
      latitude: addressData.latitude ?? addressData.lat,
      longitude: addressData.longitude ?? addressData.lng,
      google_place_id: addressData.google_place_id || addressData.place_id || null,
      city: addressData.city || '',
      state: addressData.state || '',
      postal_code: addressData.postal_code || '',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('addresses').upsert([newAddress]).select().single();
      if (!error && data) return data;
    }

    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADDRESSES) || '[]');
    // Avoid duplicate address for same user within 20 meters
    const existingIndex = all.findIndex(
      (a) =>
        a.user_id === userId &&
        (a.id === newAddress.id ||
          (Math.abs(a.latitude - newAddress.latitude) < 0.0002 && Math.abs(a.longitude - newAddress.longitude) < 0.0002))
    );

    if (existingIndex > -1) {
      all[existingIndex] = { ...all[existingIndex], ...newAddress };
    } else {
      all.push(newAddress);
    }

    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(all));
    return newAddress;
  },

  async deleteAddress(id) {
    if (isSupabaseConfigured) {
      await supabase.from('addresses').delete().eq('id', id);
    }
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADDRESSES) || '[]');
    const filtered = all.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(filtered));
  }
};

