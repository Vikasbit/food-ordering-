import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Hero from '../components/Hero';
import FeaturedCategoriesSection from '../components/FeaturedCategoriesSection';
import NewArrivalsSection from '../components/NewArrivalsSection';
import BestSellersSection from '../components/BestSellersSection';
import SpecialOfferBanner from '../components/SpecialOfferBanner';
import TrendingProductsSection from '../components/TrendingProductsSection';
import OrderByCravingSection from '../components/OrderByCravingSection';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import CustomerReviewsSection from '../components/CustomerReviewsSection';
import InstagramGallerySection from '../components/InstagramGallerySection';
import RestaurantDiscoverySection from '../components/RestaurantDiscoverySection';

import DishCustomizerModal from '../components/DishCustomizerModal';
import RestaurantPageModal from '../components/RestaurantPageModal';

import { useCart } from '../context/CartContext';
import { marketplaceService } from '../lib/supabase';
import { calculateDistance } from '../utils/geo';

export default function HomePage() {
  const navigate = useNavigate();
  const { 
    handleAddToCartFromRestaurant, 
    handleAddToCart, 
    deliveryLocation,
    openLocationModal 
  } = useCart();

  const [customizingDish, setCustomizingDish] = useState(null);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const [restaurantPageOpen, setRestaurantPageOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    loadRestaurants();
  }, []);

  // When deliveryLocation or restaurants change: reset any selected restaurant and recalculate nearby
  useEffect(() => {
    // Reset any active selection & popup
    setSelectedRestaurant(null);
    setRestaurantPageOpen(false);

    if (deliveryLocation && restaurants.length > 0) {
      filterRestaurantsByDistance();
    } else if (!deliveryLocation) {
      setFilteredRestaurants(restaurants);
    }
  }, [deliveryLocation, restaurants]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const allRest = await marketplaceService.getAllRestaurants();
      setRestaurants(allRest || []);
    } catch (err) {
      console.error('Failed to load restaurants', err);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurantsByDistance = () => {
    if (!deliveryLocation) {
      setFilteredRestaurants(restaurants);
      return;
    }

    const custLat = Number(deliveryLocation.lat ?? deliveryLocation.latitude);
    const custLng = Number(deliveryLocation.lng ?? deliveryLocation.longitude);

    if (isNaN(custLat) || isNaN(custLng)) {
      console.warn('Invalid delivery location coordinates', deliveryLocation);
      setFilteredRestaurants([]);
      return;
    }
    
    // Strict geographic distance filtering by coordinates
    const nearby = restaurants
      .filter(rest => rest.status === 'ACTIVE' || rest.status === 'PAUSED')
      .map(rest => {
        const rLat = Number(rest.lat ?? rest.latitude);
        const rLng = Number(rest.lng ?? rest.longitude);
        const dist = calculateDistance(custLat, custLng, rLat, rLng);
        return { 
          ...rest, 
          lat: rLat, 
          lng: rLng, 
          distance: dist 
        };
      })
      .filter(rest => rest.distance <= (rest.delivery_radius_km || 20))
      .sort((a, b) => {
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
        if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
        return a.distance - b.distance;
      });

    setFilteredRestaurants(nearby);
  };

  const handleProductAdd = (product) => {
    // If handleAddToCart exists in context or use default cart addition
    if (handleAddToCart) {
      handleAddToCart({
        id: product.id,
        name: product.name,
        price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0,
        image: product.image || product.image_url,
        quantity: 1,
        restaurant_id: product.restaurant_id || 'kitchen-1',
        restaurant_name: product.restaurant_name || 'BIGBITES Express Kitchen'
      });
    } else {
      handleAddToCartFromRestaurant(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image
        },
        {
          id: 'kitchen-1',
          name: 'BIGBITES Express Kitchen'
        }
      );
    }
  };

  const handleOpenCustomize = (product) => {
    setCustomizingDish(product);
    setCustomizerOpen(true);
  };

  // Determine restaurants to display: strictly local when deliveryLocation is active
  const activeNearbyRestaurants = deliveryLocation
    ? filteredRestaurants
    : restaurants.slice(0, 6);

  return (
    <div id="home-view" style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>
      {/* 1. HERO SECTION */}
      <Hero
        onOpenCart={() => navigate('/cart')}
        onOpenOrderTracking={() => navigate('/orders')}
      />

      {/* 2. FEATURED CATEGORIES SECTION */}
      <FeaturedCategoriesSection
        activeCategory={activeCategory}
        onSelectCategory={(catName) => {
          setActiveCategory(catName.toLowerCase());
          const targetEl = document.getElementById('restaurants') || document.getElementById('menu');
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 3. RESTAURANTS NEAR YOU (DISCOVERY & LOCAL MAP) */}
      <RestaurantDiscoverySection 
        restaurants={activeNearbyRestaurants}
        deliveryLocation={deliveryLocation}
        onOpenLocationPicker={openLocationModal}
        onOpenRestaurant={(rest) => {
          if (rest.status === 'ACTIVE') {
            setSelectedRestaurant(rest);
            setRestaurantPageOpen(true);
          } else {
            alert('This restaurant is currently closed.');
          }
        }}
      />

      {/* 4. NEW ARRIVALS & CURATED MENU */}
      <div id="menu">
        <NewArrivalsSection
          onAddToCart={handleProductAdd}
          onOpenCustomize={handleOpenCustomize}
        />
      </div>

      {/* 5. BEST SELLERS SECTION */}
      <BestSellersSection
        onAddToCart={handleProductAdd}
        onOpenCustomize={handleOpenCustomize}
      />

      {/* 6. SPECIAL OFFER EAT50 PROMO BANNER */}
      <SpecialOfferBanner
        onOrderNow={() => {
          const menuEl = document.getElementById('restaurants') || document.getElementById('menu');
          if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 7. TRENDING PRODUCTS SECTION */}
      <div id="trending">
        <TrendingProductsSection
          onAddToCart={handleProductAdd}
          onOpenCustomize={handleOpenCustomize}
        />
      </div>

      {/* 8. ORDER BY CRAVING */}
      <OrderByCravingSection
        onSelectCraving={(craving) => {
          const menuEl = document.getElementById('restaurants') || document.getElementById('menu');
          if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 9. WHY CHOOSE BIGBITES */}
      <WhyChooseUsSection />

      {/* 10. WHAT OUR CUSTOMERS SAY */}
      <CustomerReviewsSection />

      {/* 11. SOCIAL COMMUNITY FEED */}
      <InstagramGallerySection />

      {/* MODALS */}
      <DishCustomizerModal
        isOpen={customizerOpen}
        dish={customizingDish}
        onClose={() => {
          setCustomizerOpen(false);
          setCustomizingDish(null);
        }}
        onAddToCart={(customizedItem) => {
          handleProductAdd(customizedItem);
        }}
      />

      <RestaurantPageModal
        isOpen={restaurantPageOpen}
        onClose={() => setRestaurantPageOpen(false)}
        restaurant={selectedRestaurant}
        onAddToCart={(item) => handleAddToCartFromRestaurant(item, selectedRestaurant)}
      />
    </div>
  );
}
