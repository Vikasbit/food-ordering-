export const SEED_RESTAURANTS = [
  // 1. DELHI - CONNAUGHT PLACE CLUSTER
  {
    id: 'rest-delhi-cp',
    seller_id: 'seller-delhi-1',
    name: 'BigBites Signature Kitchen — Connaught Place',
    slug: 'bigbites-connaught-place',
    address: 'Block A, Inner Circle, Connaught Place, New Delhi 110001',
    city: 'DELHI',
    lat: 28.6315,
    lng: 77.2167,
    cuisine: 'North Indian · Tandoor · Biryani',
    phone: '+91 11 4567 8900',
    opening_hours: '10:00 AM - 11:30 PM',
    delivery_radius_km: 12,
    status: 'ACTIVE',
    logo_url: '/assets/indian-chef-kitchen.png',
    cover_url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews_count: 1420,
    prep_time_min: 20,
    delivery_fee: 0,
    categories: [
      {
        id: 'cat-curries',
        name: 'SIGNATURE CURRIES',
        items: [
          {
            id: 'item-butter-chicken',
            name: 'Butter Chicken Special',
            description: 'Tender tandoori chicken simmered in rich tomato, cashew & butter gravy with aromatic spices.',
            price: 12.99,
            image_url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
            is_veg: false,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 15
          },
          {
            id: 'item-palak-paneer',
            name: 'Shahi Palak Paneer',
            description: 'Fresh cottage cheese cubes cooked in creamy spinach puree infused with garlic & cumin.',
            price: 10.50,
            image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
            is_veg: true,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 12
          }
        ]
      },
      {
        id: 'cat-chaats',
        name: 'CHAATS & STARTERS',
        items: [
          {
            id: 'item-bhel-puri',
            name: 'Delhi Chaat Platter',
            description: 'Crispy samosa, papdi, tangy tamarind chutney, fresh mint yogurt & pomegranate.',
            price: 6.50,
            image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
            is_veg: true,
            is_bestseller: false,
            is_available: true,
            prep_time_min: 8
          }
        ]
      }
    ]
  },
  {
    id: 'rest-delhi-burger',
    seller_id: 'seller-delhi-2',
    name: 'The Burger Club — Rajiv Chowk',
    slug: 'the-burger-club-rajiv-chowk',
    address: 'Radial Road 3, Rajiv Chowk, Connaught Place, New Delhi 110001',
    city: 'DELHI',
    lat: 28.6335,
    lng: 77.2195,
    cuisine: 'American · Gourmet Burgers · Crispy Fries',
    phone: '+91 11 4112 3344',
    opening_hours: '11:00 AM - 12:00 AM',
    delivery_radius_km: 10,
    status: 'ACTIVE',
    logo_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews_count: 890,
    prep_time_min: 15,
    delivery_fee: 1.99,
    categories: [
      {
        id: 'cat-burgers',
        name: 'GOURMET BURGERS',
        items: [
          {
            id: 'item-beef-burger',
            name: 'Double Smash Cheeseburger',
            description: 'Double grilled patty, melted aged cheddar, caramelized onion relish, secret house sauce.',
            price: 9.99,
            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
            is_veg: false,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 12
          },
          {
            id: 'item-spicy-chick',
            name: 'Spicy Crispy Chicken Burger',
            description: 'Crispy fried chicken breast, spicy habanero mayo, dill pickles, brioche bun.',
            price: 8.99,
            image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
            is_veg: false,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 14
          }
        ]
      }
    ]
  },
  {
    id: 'rest-delhi-biryani',
    seller_id: 'seller-delhi-3',
    name: 'Biryani Blues & Grills — Janpath',
    slug: 'biryani-blues-janpath',
    address: 'Janpath Road, Near Tolstoy Marg, New Delhi 110001',
    city: 'DELHI',
    lat: 28.6270,
    lng: 77.2185,
    cuisine: 'Dum Biryani · Mughlai · Kebabs',
    phone: '+91 11 4987 1122',
    opening_hours: '11:30 AM - 11:00 PM',
    delivery_radius_km: 12,
    status: 'ACTIVE',
    logo_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews_count: 1650,
    prep_time_min: 25,
    delivery_fee: 0,
    categories: [
      {
        id: 'cat-biryani',
        name: 'DUM BIRYANI POTS',
        items: [
          {
            id: 'item-dum-biryani',
            name: 'Hyderabadi Dum Chicken Biryani',
            description: 'Fragrant basmati rice slow-cooked on dum with marinated chicken, saffron, brown onions & raita.',
            price: 11.50,
            image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
            is_veg: false,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 20
          }
        ]
      }
    ]
  },
  {
    id: 'rest-delhi-pizza',
    seller_id: 'seller-delhi-4',
    name: 'Crust & Craft Woodfired Pizza — Barakhamba',
    slug: 'crust-craft-barakhamba',
    address: 'Barakhamba Road, Connaught Place Outer Circle, New Delhi 110001',
    city: 'DELHI',
    lat: 28.6295,
    lng: 77.2260,
    cuisine: 'Italian · Woodfired Pizza · Pasta',
    phone: '+91 11 4333 5566',
    opening_hours: '12:00 PM - 11:30 PM',
    delivery_radius_km: 10,
    status: 'ACTIVE',
    logo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews_count: 730,
    prep_time_min: 20,
    delivery_fee: 1.50,
    categories: [
      {
        id: 'cat-pizza',
        name: 'ARTISAN PIZZAS',
        items: [
          {
            id: 'item-pepperoni',
            name: 'Pepperoni Supreme Pizza',
            description: 'Stone-baked sourdough crust, San Marzano tomato sauce, mozzarella fior di latte, cured pepperoni.',
            price: 12.50,
            image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
            is_veg: false,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 18
          },
          {
            id: 'item-margherita',
            name: 'Classic Margherita Classica',
            description: 'Fresh basil leaves, buffalo mozzarella, extra virgin olive oil, sea salt.',
            price: 10.99,
            image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80',
            is_veg: true,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 15
          }
        ]
      }
    ]
  },

  // 2. PARUL UNIVERSITY / VADODARA CLUSTER (Specifically for Parul University searches)
  {
    id: 'rest-parul-univ-campus',
    seller_id: 'seller-parul-1',
    name: 'BigBites Kitchen — Parul University Campus',
    slug: 'bigbites-parul-university',
    address: 'Parul University Campus, Waghodia Road, Vadodara, Gujarat 391760',
    city: 'VADODARA',
    lat: 22.2887,
    lng: 73.3638,
    cuisine: 'Kathiyawadi · Gujarati Thali · Fast Food',
    phone: '+91 2668 260 300',
    opening_hours: '08:30 AM - 10:30 PM',
    delivery_radius_km: 25,
    status: 'ACTIVE',
    logo_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews_count: 940,
    prep_time_min: 15,
    delivery_fee: 0,
    categories: [
      {
        id: 'cat-student-meals',
        name: 'CAMPUS FAVORITES',
        items: [
          {
            id: 'item-parul-thali',
            name: 'Special Gujarati Kathiyawadi Thali',
            description: 'Sev tameta, ringna no olo, bajra rotla with organic ghee & gur, dal rice, masala chaas.',
            price: 7.50,
            image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
            is_veg: true,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 15
          },
          {
            id: 'item-crispy-wrap',
            name: 'Spicy Paneer Tikka Wrap',
            description: 'Char-grilled paneer, mint chutney, crispy cabbage slaw rolled in fresh flaky laccha paratha.',
            price: 4.99,
            image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
            is_veg: true,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 10
          }
        ]
      }
    ]
  },
  {
    id: 'rest-vadodara-waghodia',
    seller_id: 'seller-parul-2',
    name: 'Taste of Vadodara — Waghodia Road',
    slug: 'taste-of-vadodara',
    address: 'Opp. Parul Institute, Waghodia Road, Vadodara 391760',
    city: 'VADODARA',
    lat: 22.2910,
    lng: 73.3590,
    cuisine: 'Sev Usal · Chaats · Street Snacks',
    phone: '+91 2668 255 122',
    opening_hours: '09:00 AM - 10:00 PM',
    delivery_radius_km: 25,
    status: 'ACTIVE',
    logo_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews_count: 610,
    prep_time_min: 12,
    delivery_fee: 1.00,
    categories: [
      {
        id: 'cat-snacks',
        name: 'VADODARA FAMOUS',
        items: [
          {
            id: 'item-sev-usal',
            name: 'Famous Vadodara Mahakali Sev Usal',
            description: 'Spicy pea curry served hot with crispy sev, spring onions, lemon & fresh butter pav.',
            price: 3.99,
            image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
            is_veg: true,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 8
          }
        ]
      }
    ]
  },
  {
    id: 'rest-vadodara-alkapuri',
    seller_id: 'seller-parul-3',
    name: 'Royal Kathiyawad & Thali — Alkapuri',
    slug: 'royal-kathiyawad-alkapuri',
    address: 'RC Dutt Road, Alkapuri, Vadodara, Gujarat 390007',
    city: 'VADODARA',
    lat: 22.3105,
    lng: 73.1802,
    cuisine: 'Kathiyawadi · Gujarati Thali · North Indian',
    phone: '+91 265 233 4455',
    opening_hours: '11:00 AM - 11:00 PM',
    delivery_radius_km: 25,
    status: 'ACTIVE',
    logo_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews_count: 1240,
    prep_time_min: 18,
    delivery_fee: 0,
    categories: [
      {
        id: 'cat-alkapuri-thali',
        name: 'AUTHENTIC THALIS',
        items: [
          {
            id: 'item-royal-gujarati-thali',
            name: 'Royal Maharaja Gujarati Thali',
            description: 'Grand festive thali with 4 subzis, dal, kadhi, farsaans, rotlis, bajra rotla, shrikhand, and gulab jamun.',
            price: 8.99,
            image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
            is_veg: true,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 15
          }
        ]
      }
    ]
  },
  {
    id: 'rest-vadodara-sayajigunj',
    seller_id: 'seller-parul-4',
    name: 'The Burger Club — Sayajigunj',
    slug: 'burger-club-sayajigunj',
    address: 'Near Railway Station, Sayajigunj, Vadodara 390005',
    city: 'VADODARA',
    lat: 22.3120,
    lng: 73.1890,
    cuisine: 'Gourmet Burgers · Fast Food · Shakes',
    phone: '+91 265 244 5566',
    opening_hours: '11:00 AM - 11:30 PM',
    delivery_radius_km: 25,
    status: 'ACTIVE',
    logo_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews_count: 850,
    prep_time_min: 15,
    delivery_fee: 1.00,
    categories: [
      {
        id: 'cat-burgers',
        name: 'GOURMET BURGERS',
        items: [
          {
            id: 'item-vadodara-burger',
            name: 'Classic BigBites Cheeseburger',
            description: 'Crispy herb patty, melted sharp cheddar, caramelized onions, house relish on brioche.',
            price: 5.50,
            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
            is_veg: true,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 12
          }
        ]
      }
    ]
  },

  // 3. MUMBAI - BANDRA CLUSTER
  {
    id: 'rest-mumbai-bandra',
    seller_id: 'seller-mumbai-1',
    name: 'BigBites Coastal — Bandra West',
    slug: 'bigbites-mumbai-bandra',
    address: 'Hill Road, Near Bandra Station, Bandra West, Mumbai 400050',
    city: 'MUMBAI',
    lat: 19.0596,
    lng: 72.8295,
    cuisine: 'Coastal Indian · Seafood · Street Food',
    phone: '+91 22 2640 1122',
    opening_hours: '11:00 AM - 12:00 AM',
    delivery_radius_km: 12,
    status: 'ACTIVE',
    logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews_count: 1120,
    prep_time_min: 20,
    delivery_fee: 0,
    categories: [
      {
        id: 'cat-mumbai-special',
        name: 'MUMBAI STREET SPECIALS',
        items: [
          {
            id: 'item-bhel-mumbai',
            name: 'Special Chowpatty Sev Bhel Puri',
            description: 'Authentic Chowpatty style bhel loaded with crispy sev, tamarind chutney & spicy garlic kick.',
            price: 4.50,
            image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
            is_veg: true,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 8
          }
        ]
      }
    ]
  }
];
