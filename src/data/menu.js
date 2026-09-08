export const SIGNATURE_DISHES = [
  {
    id: 'palak-paneer',
    hindiName: 'पालक पनीर',
    name: 'PALAK PANEER',
    category: 'Vegetarian',
    price: '₹290',
    description: 'GRILLED HOMEMADE FRESH CHEESE, CREAMY FRESH SPINACH SAUCE, MUSTARD & SHALLOT CHIPS.',
    image: 'https://www.shutterstock.com/image-photo/vegetarian-palak-paneer-starter-soft-260nw-1948516873.jpg',
    bgColor: 'var(--yellow)',
    cardBoxColor: 'var(--blue)',
    textColor: 'var(--white)',
    tag: 'CHEF CHOICE',
    isVeg: true
  },
  {
    id: 'butter-chicken',
    hindiName: 'बटर चिकन',
    name: 'BUTTER CHICKEN',
    category: 'Chicken',
    price: '₹460',
    description: 'TANDOOR ROASTED GRILLED CHICKEN, SIMMERED IN A VELVET TOMATO SAUCE WITH ALMONDS & CASHEWS.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzs6zoNqsUCjEvKYe-Cu1wqNcCeDqESA16SBy5EGm1nQhmpdj8N06053aK&s=10',
    bgColor: 'var(--green)',
    cardBoxColor: 'var(--orange)',
    textColor: 'var(--white)',
    tag: 'MOST POPULAR',
    isVeg: false
  },
  {
    id: 'bhel-puri',
    hindiName: 'भेल पूरी',
    name: 'BHEL PURI',
    category: 'Chaats',
    price: '₹200',
    description: 'PUFFED RICE, TAMARIND CHUTNEY, RAW MANGO, POMEGRANATE & CRISPY SEV CRUNCH.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    bgColor: 'var(--red)',
    cardBoxColor: 'var(--yellow)',
    textColor: 'var(--black)',
    tag: 'STREET FOOD',
    isVeg: true
  }
];

export const MENU_CATEGORIES = [
  'VEGETARIAN',
  'CHICKEN & MEATS',
  'CHAATS & STARTERS',
  'BREADS & RICE',
  'DESSERTS & DRINKS'
];

export const MENU_ITEMS = {
  VEGETARIAN: [
    {
      name: 'Palak Paneer',
      hindiName: 'पालक पनीर',
      desc: 'Cottage cheese cubes simmered in spiced spinach puree with garlic and cream.',
      price: '₹290',
      isVeg: true,
      image: 'https://www.shutterstock.com/image-photo/vegetarian-palak-paneer-starter-soft-260nw-1948516873.jpg'
    },
    {
      name: 'Dal Makhani',
      hindiName: 'दाल मखनी',
      desc: 'Slow-cooked black lentils simmered overnight with butter, cream, and aromatic spices.',
      price: '₹350',
      isVeg: true,
      image: 'https://www.seriouseats.com/thmb/nWB-o2wU8jHWQnKeEYiesp7jvDo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/20241121-SEA-DalMakhani-QiAi-Hero1-39-0a75d58ae8c24d2fa2d108b84d487d28.jpg'
    },
    {
      name: 'Smoky Baingan Bharta',
      hindiName: 'बैंगन भरता',
      desc: 'Fire-roasted eggplant mashed with mustard oil, green chillies, onions, and coriander.',
      price: '₹300',
      isVeg: true,
      image: 'https://myfoodstory.com/wp-content/uploads/2021/09/easy-baingan-bharta-smoky-eggplant-stir-fry-4.jpg'
    }
  ],

  'CHICKEN & MEATS': [
    {
      name: 'Delhi Butter Chicken',
      hindiName: 'दिल्ली बटर चिकन',
      desc: 'Tandoori chicken tikka cooked in rich tomato gravy infused with fenugreek and butter.',
      price: '₹340',
      isVeg: false,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzs6zoNqsUCjEvKYe-Cu1wqNcCeDqESA16SBy5EGm1nQhmpdj8N06053aK&s=10'
    },
    {
      name: 'Chicken Chettinad',
      hindiName: 'चिकन चेट्टीनाड',
      desc: 'Spicy Tamil Nadu style chicken cooked with roasted coconut, black pepper, and curry leaves.',
      price: '₹500',
      isVeg: false,
      image: 'https://glebekitchen.com/wp-content/uploads/2022/06/chettinadchickencurryscenetop.jpg'
    },
    {
      name: 'Kadai Chicken',
      hindiName: 'कड़ाई चिकन',
      desc: 'Succulent chicken stir-fried with bell peppers, tomatoes, and coarsely ground spices.',
      price: '₹470',
      isVeg: false,
      image: 'https://www.cookwithkushi.com/wp-content/uploads/2024/09/chicken_karahi_kadai_murgh_recipe.jpg'
    }
  ],

  'CHAATS & STARTERS': [
    {
      name: 'Samosa Chaat',
      hindiName: 'समोसा चाट',
      desc: 'Crushed potato samosa topped with spiced chickpea ragda, yogurt, and chutneys.',
      price: '₹210',
      isVeg: true,
      image: 'https://cdn.mygingergarlickitchen.com/images/800px/800px-samosa-chaat-4.jpg'
    },
    {
      name: 'Amritsari Fish Fry',
      hindiName: 'अमृतसरी फिश फ्राई',
      desc: 'Crispy carom-seed spiced batter fried river fish served with mint chutney.',
      price: '₹470',
      isVeg: false,
      image: 'https://myfoodstory.com/wp-content/uploads/2024/11/Amritsari-Fish-Fry-Air-Fryer-1.jpg'
    },
    {
      name: 'Pani Puri Bombs',
      hindiName: 'पानी पूरी',
      desc: 'Crispy hollow puris filled with spiced potato mash and spicy mint tamarind water.',
      price: '₹200',
      isVeg: true,
      image: 'https://www.ohmyveg.co.uk/wp-content/uploads/2023/07/Dahi-Puri-1-768x1024.jpg'
    },
    {
      name: 'Dahi Bhalla',
      hindiName: 'दही भल्ला',
      desc: 'Soft lentil dumplings soaked in sweet curd, sprinkled with roasted cumin and pomegranate.',
      price: '₹230',
      isVeg: true,
      image: 'https://www.teaforturmeric.com/wp-content/uploads/2022/04/Dahi-Bhalla-11-728x1092.jpg'
    },
    {
      name: 'Aloo Tikki Ragda',
      hindiName: 'आलू टिक्की रगड़ा',
      desc: 'Golden pan-fried potato patties served over white pea gravy with spicy sweet chutneys.',
      price: '₹200',
      isVeg: true,
      image: 'https://www.jcookingodyssey.com/wp-content/uploads/2025/12/Aloo-Tikki.jpg'
    }
  ],

  'BREADS & RICE': [
    {
      name: 'Garlic Butter Naan',
      hindiName: 'गार्लिक बटर नान',
      desc: 'Tandoor-baked flatbread brushed with garlic butter and fresh coriander.',
      price: '₹120',
      isVeg: true,
      image: 'https://www.swankyrecipes.com/wp-content/uploads/2021/03/Buttery-Garlic-Naan.jpg'
    },
    {
      name: 'Laccha Paratha',
      hindiName: 'लच्छा पराठा',
      desc: 'Multi-layered crispy whole wheat bread baked in clay tandoor oven.',
      price: '₹100',
      isVeg: true,
      image: 'https://i2.wp.com/www.vegrecipesofindia.com/wp-content/uploads/2010/06/lachha-paratha.jpg'
    },
    {
      name: 'Cheese Chili Naan',
      hindiName: 'चीज़ मिर्ची नान',
      desc: 'Soft naan stuffed with molten mozzarella, green chillies, and oregano.',
      price: '₹90',
      isVeg: true,
      image: 'https://cdn.tischwelt.de/chameleon/mediapool/thumbs/a/9d/chili_cheese_naan_2_1000x600-ID390377-af3892cb585ec1585ffbef97f18069a5.webp'
    },
    {
      name: 'Dum Chicken Biryani',
      hindiName: 'दम चिकन बिरयानी',
      desc: 'Aromatic basmati rice layered with marinated chicken, saffron, and fried onions in earthen clay pot.',
      price: '₹520',
      isVeg: false,
      image: 'https://img.magnific.com/premium-photo/dum-handi-chicken-biryani-is-prepared-earthen-clay-pot-called-haandi-popular-indian-non-vegetarian-food_466689-52384.jpg?semt=ais_test_b&w=740&q=80'
    },
    {
      name: 'Jeera Rice',
      hindiName: 'जीरा राइस',
      desc: 'Fragrant basmati rice tempered with ghee, cumin seeds, and green cardamom.',
      price: '₹250',
      isVeg: true,
      image: 'https://cdn.create.vista.com/api/media/small/391548594/stock-photo-cumin-rice-jeera-rice-popular-indian-main-course-item-made'
    }
  ],

  'DESSERTS & DRINKS': [
    {
      name: 'Gulab Jamun',
      hindiName: 'गुलाब जामुन',
      desc: 'Warm milk-solid dumplings soaked in cardamom and rose water sugar syrup.',
      price: '₹150',
      isVeg: true,
      image: 'https://img.magnific.com/premium-photo/gulab-jamun-bowl-copper-antique-bowl-with-spoon-indian-dessert-sweet-dish_926199-2408784.jpg?semt=ais_hybrid&w=740&q=80'
    },
    {
      name: 'Mango Kulfi',
      hindiName: 'मैंगो कुल्फी',
      desc: 'Traditional Indian frozen dessert made with Alphonso mango pulp and thickened milk.',
      price: '₹180',
      isVeg: true,
      image: 'https://www.cookshideout.com/wp-content/uploads/2010/09/Mango-Kulfi4S.jpg'
    },
    {
      name: 'Mango Lassi',
      hindiName: 'मैंगो लस्सी',
      desc: 'Chilled creamy yogurt drink blended with fresh mangoes and cardamom.',
      price: '₹130',
      isVeg: true,
      image: 'https://thumbs.dreamstime.com/b/mango-lassi-cardamom-29546849.jpg'
    },
    {
      name: 'Masala Chai',
      hindiName: 'मसाला चाय',
      desc: 'Traditional Indian spiced tea brewed with ginger, cardamom, cloves, and whole milk.',
      price: '₹80',
      isVeg: true,
      image: 'https://i.pinimg.com/originals/d2/f4/4e/d2f44e914953834cd4784f8497f8bee6.jpg'
    }
  ]
};

export const INDIAN_LOCATIONS = [
  {
    city: 'DELHI',
    languageName: 'HINDI',
    greeting: 'आइये खाएं',
    phonetic: 'Aaiye Khaen',
    restaurant: 'Connaught Place Flagship Kitchen',
    address: 'Connaught Place, Inner Circle, New Delhi 110001',
    phone: '+91 11 4151 8800',
    hours: '11:00 AM – 11:00 PM'
  },
  {
    city: 'MUMBAI',
    languageName: 'MARATHI',
    greeting: 'या जेवायला',
    phonetic: 'Yaa Jevaylaa',
    restaurant: 'Bandra Coastal & Curry House',
    address: 'Bandra Reclamation, Bandra West, Mumbai 400050',
    phone: '+91 22 2640 1122',
    hours: '11:30 AM – 1:00 AM'
  },
  {
    city: 'LUCKNOW',
    languageName: 'LUCKNOWI AWADHI',
    greeting: 'तशरीफ़ लाइये',
    phonetic: 'Tashreef Laaiye',
    restaurant: 'Hazratganj Awadhi Dawat Hall',
    address: 'Hazratganj Main Road, Lucknow 226001',
    phone: '+91 522 220 9988',
    hours: '12:00 PM – 11:30 PM'
  },
  {
    city: 'BIHAR',
    languageName: 'BHOJPURI',
    greeting: 'चलऽ खाए खातिर',
    phonetic: 'Chala Khae Khatir',
    restaurant: 'Patna Junction Litti Chokha Express',
    address: 'Dak Bungla Chauraha, Patna 800001',
    phone: '+91 612 250 4433',
    hours: '11:00 AM – 11:00 PM'
  },
  {
    city: 'NEPAL',
    languageName: 'NEPALI',
    greeting: 'आउनुहोस् खाऔँ',
    phonetic: 'Aanuhos Khaon',
    restaurant: 'Kathmandu Himalayan Kitchen & Spice Bar',
    address: 'Thamel Chowk, Kathmandu 44600',
    phone: '+977 1 470 1122',
    hours: '11:30 AM – 10:30 PM'
  },
  {
    city: 'BENGALURU',
    languageName: 'KANNADA',
    greeting: 'ಬನ್ನಿ ಊಟ ಮಾಡಿ',
    phonetic: 'Banni Oota Maadi',
    restaurant: 'Indiranagar Spice Craft Kitchen',
    address: '100 Feet Road, Indiranagar, Bengaluru 560038',
    phone: '+91 80 4123 7788',
    hours: '12:00 PM – 11:00 PM'
  },
  {
    city: 'KOLKATA',
    languageName: 'BENGALI',
    greeting: 'আসুন খাবেন',
    phonetic: 'Asun Khaben',
    restaurant: 'Park Street Kati Roll & Curry Hub',
    address: '18 Park Street, Kolkata 700071',
    phone: '+91 33 2229 4455',
    hours: '12:00 PM – 11:30 PM'
  }
];
