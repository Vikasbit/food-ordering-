import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import IntroSection from '../components/IntroSection';
import RestaurantDiscoverySection from '../components/RestaurantDiscoverySection';
import BigTypeSection from '../components/BigTypeSection';
import JourneySection from '../components/JourneySection';
import IngredientsSection from '../components/IngredientsSection';
import StorySection from '../components/StorySection';
import KitchenSection from '../components/KitchenSection';
import CommunitySection from '../components/CommunitySection';
import LocationsSection from '../components/LocationsSection';
import CTASection from '../components/CTASection';

import RestaurantPageModal from '../components/RestaurantPageModal';

import { useCart } from '../context/CartContext';
import { marketplaceService } from '../lib/supabase';
import { calculateDistance } from '../utils/geo';

export default function HomePage() {
  const navigate = useNavigate();
  const { handleAddToCartFromRestaurant, deliveryLocation } = useCart();

  const [restaurantPageOpen, setRestaurantPageOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (deliveryLocation && restaurants.length > 0) {
      filterRestaurantsByDistance();
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
    const { lat, lng } = deliveryLocation;
    
    // Filter active/paused EATnaked restaurants within delivery radius
    const nearby = restaurants
      .filter(rest => rest.status === 'ACTIVE' || rest.status === 'PAUSED')
      .map(rest => {
        const dist = calculateDistance(lat, lng, rest.lat, rest.lng);
        return { ...rest, distance: dist };
      })
      .filter(rest => rest.distance <= (rest.delivery_radius_km || 10))
      .sort((a, b) => {
        // Sort ACTIVE first, then by distance
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
        if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
        return a.distance - b.distance;
      });

    setFilteredRestaurants(nearby);
  };

  return (
    <>
      <Hero
        onOpenCart={() => navigate('/cart')}
        onOpenOrderTracking={() => navigate('/orders')}
      />
      
      {!deliveryLocation ? (
        <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: 'var(--yellow)', borderTop: 'var(--border-thick)', borderBottom: 'var(--border-thick)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', margin: '0 0 1rem', color: 'var(--black)' }}>
            HUNGRY?
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Set your delivery location at the top of the page to see EATnaked partner kitchens delivering hot, fresh food to your area right now.
          </p>
        </div>
      ) : (
        <RestaurantDiscoverySection 
          restaurants={filteredRestaurants}
          deliveryLocation={deliveryLocation}
          onOpenRestaurant={(rest) => {
            if (rest.status === 'ACTIVE') {
              setSelectedRestaurant(rest);
              setRestaurantPageOpen(true);
            } else {
              alert('This restaurant is currently paused and cannot accept orders.');
            }
          }}
        />
      )}

      <IntroSection />
      
      <BigTypeSection />
      <JourneySection />
      <IngredientsSection />
      <StorySection />
      <KitchenSection />
      <CommunitySection />
      <LocationsSection />
      <CTASection />

      <RestaurantPageModal
        isOpen={restaurantPageOpen}
        onClose={() => setRestaurantPageOpen(false)}
        restaurant={selectedRestaurant}
        onAddToCart={(item) => handleAddToCartFromRestaurant(item, selectedRestaurant)}
      />
    </>
  );
}
