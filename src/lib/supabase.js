import { createClient } from '@supabase/supabase-js';
import { SEED_RESTAURANTS } from '../data/seedData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-eatnaked.supabase.co';
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
  USERS: 'eatnaked_db_users',
  CURRENT_USER: 'eatnaked_auth_user',
  RESTAURANTS: 'eatnaked_db_restaurants',
  ORDERS: 'eatnaked_db_orders'
};

// Initialize Mock Store if empty
function initializeMockStore() {
  if (!localStorage.getItem(STORAGE_KEYS.RESTAURANTS)) {
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(SEED_RESTAURANTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const demoUsers = [
      {
        id: 'user-cust-1',
        email: 'customer@eatnaked.com',
        password: 'password123',
        full_name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        role: 'customer'
      },
      {
        id: 'seller-delhi-1',
        email: 'seller@eatnaked.com',
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
}

initializeMockStore();

// ========================================================
// UNIFIED AUTHENTICATION & MARKETPLACE DATA SERVICE
// ========================================================

export const authService = {
  async getCurrentUser() {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      return profile || { id: user.id, email: user.email, role: 'customer' };
    }
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  },

  async signUpCustomer({ email, password, fullName, phone }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone, role: 'customer' } }
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from('profiles').insert([
          { id: data.user.id, email, full_name: fullName, phone, role: 'customer' }
        ]);
      }
      return data;
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      full_name: fullName,
      phone,
      role: 'customer'
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return { user: newUser };
  },

  async signUpSeller({ ownerName, email, phone, password, restaurantName, address, city, cuisine, openingHours }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: ownerName, phone, role: 'seller' } }
      });
      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').insert([
          { id: data.user.id, email, full_name: ownerName, phone, role: 'seller' }
        ]);

        const newRest = {
          seller_id: data.user.id,
          name: restaurantName,
          slug: restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          address,
          city: city || 'DELHI',
          lat: 28.6315,
          lng: 77.2167,
          cuisine,
          phone,
          opening_hours: openingHours || '10:00 AM - 11:00 PM',
          delivery_radius_km: 12,
          status: 'active',
          rating: 4.8,
          reviews_count: 1
        };
        await supabase.from('restaurants').insert([newRest]);
      }
      return data;
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('A seller account with this email already exists.');
    }

    const newSeller = {
      id: `seller-${Date.now()}`,
      email,
      password,
      full_name: ownerName,
      phone,
      role: 'seller'
    };
    users.push(newSeller);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Create Restaurant Record
    const restaurants = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS) || '[]');
    const newRestaurant = {
      id: `rest-${Date.now()}`,
      seller_id: newSeller.id,
      name: restaurantName,
      slug: restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      address,
      city: city || 'DELHI',
      lat: 28.6315,
      lng: 77.2167,
      cuisine,
      phone,
      opening_hours: openingHours || '10:00 AM - 11:00 PM',
      delivery_radius_km: 12,
      status: 'active',
      logo_url: '/assets/indian-chef-kitchen.png',
      cover_url: '/assets/butter-chicken-real.png',
      rating: 4.9,
      reviews_count: 1,
      categories: [
        {
          id: `cat-main-${Date.now()}`,
          name: 'MAIN DISHES',
          items: [
            {
              id: `item-signature-${Date.now()}`,
              name: `${restaurantName} Special Curry`,
              description: 'Freshly prepared signature dish with secret house spices.',
              price: 280,
              image_url: '/assets/butter-chicken-real.png',
              is_veg: true,
              is_bestseller: true,
              is_available: true,
              prep_time_min: 15
            }
          ]
        }
      ]
    };
    restaurants.push(newRestaurant);
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newSeller));
    return { user: newSeller, restaurant: newRestaurant };
  },

  async login({ email, password }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      return profile || data.user;
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!matched) {
      throw new Error('Invalid email or password. Please try again.');
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(matched));
    return matched;
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
  async getAllRestaurants() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('restaurants').select('*, menu_categories(*, menu_items(*))').eq('status', 'active');
      if (!error && data && data.length > 0) return data;
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS) || '[]');
  },

  async getRestaurantById(id) {
    const all = await this.getAllRestaurants();
    return all.find((r) => r.id === id || r.slug === id) || all[0];
  },

  async getSellerRestaurant(sellerId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESTAURANTS) || '[]');
    return all.find((r) => r.seller_id === sellerId) || all[0];
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
  async createOrder(orderPayload) {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const newOrder = {
      id: `ord-${Date.now()}`,
      order_number: `EAT-${Math.floor(100000 + Math.random() * 900000)}`,
      customer_id: orderPayload.customer_id || 'cust-anon',
      restaurant_id: orderPayload.restaurant_id,
      restaurant_name: orderPayload.restaurant_name,
      delivery_address: orderPayload.delivery_address,
      delivery_lat: orderPayload.delivery_lat,
      delivery_lng: orderPayload.delivery_lng,
      items: orderPayload.items,
      subtotal: orderPayload.subtotal,
      gst_tax: orderPayload.gst_tax,
      delivery_fee: orderPayload.delivery_fee,
      discount_amount: orderPayload.discount_amount || 0,
      grand_total: orderPayload.grand_total,
      coupon_code: orderPayload.coupon_code || null,
      status: 'PENDING',
      payment_method: orderPayload.payment_method || 'UPI_QR',
      payment_status: 'PAID',
      driver_name: 'Rahul Sharma (4.9 ★)',
      driver_phone: '+91 98765 12345',
      estimated_delivery_min: 24,
      created_at: new Date().toISOString()
    };

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  },

  async getCustomerOrders(customerId) {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    return orders;
  },

  async getSellerOrders(sellerRestaurantId) {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    return orders;
  },

  async updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const index = orders.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      orders[index].status = newStatus;
      orders[index].updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return orders[index];
    }
    return null;
  }
};
