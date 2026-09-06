import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addressService } from '../lib/supabase';
import LocationSelector from './LocationSelector';

export default function LocationPickerModal({ isOpen, onClose }) {
  const { deliveryLocation, setDeliveryLocation } = useCart();
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    if (isOpen && user?.id) {
      addressService.getAddresses(user.id)
        .then((list) => setSavedAddresses(list || []))
        .catch((e) => console.warn('Saved addresses notice:', e));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleLocationConfirmed = async (locationData) => {
    setDeliveryLocation(locationData);

    // Save to user address book in Supabase if logged in
    if (user?.id) {
      try {
        await addressService.saveAddress(user.id, {
          label: locationData.label || 'Home',
          full_address: locationData.formatted_address || locationData.address,
          latitude: locationData.latitude || locationData.lat,
          longitude: locationData.longitude || locationData.lng,
          google_place_id: locationData.placeId,
          city: locationData.city
        });
      } catch (err) {
        console.warn('Could not auto-save address to account:', err);
      }
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1100,
          backgroundColor: 'rgba(28, 25, 23, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #ECE7DF',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '580px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #EFEAE2'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#FFF7ED',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: 'var(--brand-dark)',
                    margin: 0
                  }}
                >
                  Delivery Address
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#78716C' }}>
                  Choose where you'd like your food delivered
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: '#FAF5EE',
                border: '1px solid #ECE7DF',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#78716C'
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* LocationSelector Component */}
          <LocationSelector
            initialLocation={deliveryLocation}
            onLocationSelected={handleLocationConfirmed}
            onCancel={onClose}
            buttonLabel="Confirm Delivery Location →"
            savedAddresses={savedAddresses}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
