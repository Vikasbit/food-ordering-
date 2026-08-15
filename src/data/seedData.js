export const SEED_RESTAURANTS = [
  {
    id: 'rest-delhi-cp',
    seller_id: 'seller-delhi-1',
    name: 'EATnaked — Connaught Place',
    slug: 'eatnaked-connaught-place',
    address: 'Block A, Inner Circle, Connaught Place, New Delhi 110001',
    city: 'DELHI',
    lat: 28.6315,
    lng: 77.2167,
    cuisine: 'North Indian · Tandoor · Thalis',
    phone: '+91 11 4567 8900',
    opening_hours: '10:00 AM - 11:30 PM',
    delivery_radius_km: 12,
    status: 'active',
    logo_url: '/assets/indian-chef-kitchen.png',
    cover_url: '/assets/butter-chicken-real.png',
    rating: 4.8,
    reviews_count: 1420,
    categories: [
      {
        id: 'cat-curries',
        name: 'SIGNATURE CURRIES',
        items: [
          {
            id: 'item-butter-chicken',
            name: 'BUTTER CHICKEN SPECIAL',
            description: 'Tender tandoori chicken simmered in rich tomato, cashew & butter gravy with aromatic spices.',
            price: 340,
            image_url: '/assets/butter-chicken-real.png',
            is_veg: false,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 15
          },
          {
            id: 'item-palak-paneer',
            name: 'SHAHI PALAK PANEER',
            description: 'Fresh cottage cheese cubes cooked in creamy spinach puree infused with garlic & cumin.',
            price: 290,
            image_url: '/assets/palak-paneer-real.png',
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
            name: 'MUMBAI BHEL PURI',
            description: 'Crispy puffed rice tossed with tangy tamarind chutney, fresh coriander, onions & pomegranate.',
            price: 160,
            image_url: '/assets/bhel-puri-real.png',
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
    id: 'rest-gurgaon-cybercity',
    seller_id: 'seller-gurgaon-1',
    name: 'EATnaked — Gurgaon / Cyber City',
    slug: 'eatnaked-cyber-city',
    address: 'DLF Cyber City, Phase 2, Gurugram, Haryana 122002',
    city: 'GURGAON',
    lat: 28.4950,
    lng: 77.0890,
    cuisine: 'Healthy Bowls · Tandoor Grills · Biryani',
    phone: '+91 124 455 6677',
    opening_hours: '09:00 AM - 11:00 PM',
    delivery_radius_km: 15,
    status: 'active',
    logo_url: '/assets/salad-bowl.png',
    cover_url: '/assets/meal-chicken.png',
    rating: 4.9,
    reviews_count: 1350,
    categories: [
      {
        id: 'cat-bowls',
        name: 'HEALTHY HIGH-PROTEIN BOWLS',
        items: [
          {
            id: 'item-chicken-bowl',
            name: 'GRILLED TANDOORI CHICKEN BOWL',
            description: 'Spiced chicken breast served with quinoa, roasted veggies & mint yogurt dip.',
            price: 320,
            image_url: '/assets/meal-chicken.png',
            is_veg: false,
            is_bestseller: true,
            is_available: true,
            prep_time_min: 12
          },
          {
            id: 'item-oats-bowl',
            name: 'MASALA OATS KICHADI BOWL',
            description: 'Rolled oats slow-cooked with ghee, vegetables & roasted peanuts.',
            price: 210,
            image_url: '/assets/meal-oats.png',
            is_veg: true,
            is_bestseller: false,
            is_available: true,
            prep_time_min: 10
          }
        ]
      }
    ]
  },
  {
    id: 'rest-mumbai-bandra',
    seller_id: 'seller-mumbai-1',
    name: 'EATnaked — Mumbai Bandra',
    slug: 'eatnaked-mumbai-bandra',
    address: 'Hill Road, Bandra West, Mumbai, Maharashtra 400050',
    city: 'MUMBAI',
    lat: 19.0596,
    lng: 72.8295,
    cuisine: 'Coastal Indian · Chaat · Street Food',
    phone: '+91 22 2640 1122',
    opening_hours: '11:00 AM - 12:00 AM',
    delivery_radius_km: 12,
    status: 'active',
    logo_url: '/assets/bhel-puri-real.png',
    cover_url: '/assets/salad-bowl.png',
    rating: 4.8,
    reviews_count: 1120,
    categories: [
      {
        id: 'cat-mumbai-special',
        name: 'MUMBAI STREET SPECIALS',
        items: [
          {
            id: 'item-bhel-mumbai',
            name: 'SPECIAL SEV BHEL PURI',
            description: 'Authentic Chowpatty style bhel loaded with crispy sev & spicy garlic chutney.',
            price: 170,
            image_url: '/assets/bhel-puri-real.png',
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
