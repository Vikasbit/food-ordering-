import { useState, useEffect } from 'react';
import GoogleMapsView from './GoogleMapsView';
import { realtimeTracker } from '../services/realtimeTracker';
import { findNearestServingKitchen } from '../services/deliveryZoneService';

export default function OrderTrackingModal({
  isOpen,
  onClose,
  deliveryLocation,
  cartItems = []
}) {
  const orderId = 'EAT-' + Math.floor(100000 + Math.random() * 900000);
  
  const [orderStatus, setOrderStatus] = useState('ORDER_CONFIRMED');
  const [statusMessage, setStatusMessage] = useState('Order received! Kitchen is confirming details.');
  const [driverState, setDriverState] = useState(null);
  const [etaMinutes, setEtaMinutes] = useState(25);
  const [isSimulating, setIsSimulating] = useState(false);

  const nearest = findNearestServingKitchen(deliveryLocation?.lat, deliveryLocation?.lng);
  const kitchenLoc = nearest.selectedKitchen;

  const customerLoc = {
    lat: deliveryLocation?.lat || 28.6315,
    lng: deliveryLocation?.lng || 77.2167,
    label: deliveryLocation?.label || 'HOME',
    address: deliveryLocation?.address || 'Connaught Place, New Delhi'
  };

  useEffect(() => {
    if (!isOpen) return;

    // Subscribe to order status events
    const unsubStatus = realtimeTracker.subscribe(orderId, 'order_status_changed', (payload) => {
      setOrderStatus(payload.status);
      if (payload.message) setStatusMessage(payload.message);
    });

    // Subscribe to live driver updates
    const unsubDriver = realtimeTracker.subscribe(orderId, 'driver_location_updated', (payload) => {
      setDriverState(payload);
      if (payload.etaMinutes) setEtaMinutes(payload.etaMinutes);
    });

    return () => {
      unsubStatus();
      unsubDriver();
      realtimeTracker.stopDevSimulator(orderId);
    };
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const handleStartSimulator = () => {
    setIsSimulating(true);
    realtimeTracker.startDevSimulator(orderId, kitchenLoc, customerLoc, (updatedDriver) => {
      setDriverState(updatedDriver);
    });
  };

  const getStatusStepIndex = () => {
    const steps = [
      'ORDER_CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'DRIVER_ASSIGNED',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'ARRIVING',
      'DELIVERED'
    ];
    return Math.max(0, steps.indexOf(orderStatus));
  };

  const currentStepIdx = getStatusStepIndex();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--cream)',
          border: 'var(--border-thick)',
          boxShadow: '12px 12px 0px var(--black)',
          width: '100%',
          maxWidth: '1050px',
          height: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '4px'
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            backgroundColor: 'var(--red)',
            color: 'var(--white)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 'var(--border-thick)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🛵</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>
                  TRACKING ORDER #{orderId}
                </h3>
                <span
                  style={{
                    backgroundColor: 'var(--yellow)',
                    color: 'var(--black)',
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-display)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px'
                  }}
                >
                  LIVE GPS
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                {statusMessage}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Dev Simulator Trigger */}
            <button
              onClick={handleStartSimulator}
              disabled={isSimulating}
              style={{
                backgroundColor: 'var(--black)',
                color: 'var(--yellow)',
                border: '2px solid var(--yellow)',
                padding: '0.4rem 0.8rem',
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {isSimulating ? '▶ SIMULATOR RUNNING' : '⚡ DEV SIMULATE RIDER'}
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--white)',
                fontSize: '1.6rem',
                cursor: 'pointer',
                fontWeight: 900
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Status Timeline Bar */}
        <div
          style={{
            backgroundColor: 'var(--black)',
            color: 'var(--white)',
            padding: '0.8rem 1.5rem',
            borderBottom: 'var(--border-thick)',
            overflowX: 'auto'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: '600px',
              position: 'relative'
            }}
          >
            {[
              { id: 'ORDER_CONFIRMED', label: 'CONFIRMED', icon: '📝' },
              { id: 'PREPARING', label: 'PREPARING', icon: '🍳' },
              { id: 'DRIVER_ASSIGNED', label: 'RIDER ASSIGNED', icon: '🛵' },
              { id: 'OUT_FOR_DELIVERY', label: 'ON THE WAY', icon: '⚡' },
              { id: 'DELIVERED', label: 'DELIVERED', icon: '🎉' }
            ].map((step, idx) => {
              const isCompleted = currentStepIdx >= idx * 1.5;
              return (
                <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? 'var(--yellow)' : '#333',
                      color: isCompleted ? 'var(--black)' : '#888',
                      border: '2px solid var(--white)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 900,
                      marginBottom: '0.3rem'
                    }}
                  >
                    {step.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-display)',
                      color: isCompleted ? 'var(--yellow)' : '#888'
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Body: Split Map & Details Drawer */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }} className="tracking-body-container">
          
          {/* Left Column (Details Sheet): Rider Info & Order Summary */}
          <div
            style={{
              width: '380px',
              backgroundColor: 'var(--cream)',
              borderRight: 'var(--border-thick)',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
              overflowY: 'auto'
            }}
            className="tracking-details-panel"
          >
            {/* Big ETA Card */}
            <div
              style={{
                backgroundColor: 'var(--yellow)',
                border: 'var(--border-thick)',
                boxShadow: '4px 4px 0px var(--black)',
                padding: '1.2rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: 'var(--black)' }}>
                ESTIMATED ARRIVAL TIME
              </span>
              <h1 style={{ margin: '0.2rem 0', fontSize: '2.8rem', color: 'var(--red)', lineHeight: 1 }}>
                ~{etaMinutes} MIN
              </h1>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--black)' }}>
                {driverState ? `${driverState.distanceRemainingKm || 2.1} km away` : 'Kitchen preparing fresh order'}
              </p>
            </div>

            {/* Rider Card */}
            <div
              style={{
                backgroundColor: 'var(--white)',
                border: 'var(--border-thick)',
                boxShadow: '4px 4px 0px var(--black)',
                padding: '1.2rem',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--red)',
                    color: 'var(--white)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    border: '2px solid var(--black)'
                  }}
                >
                  👨‍✈️
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>
                    {driverState?.driverName || 'Rahul Sharma'}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--black)' }}>
                    <span>⭐ 4.9 Rating</span>
                    <span>• Verified Rider</span>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', opacity: 0.8 }}>
                    {driverState?.driverVehicle || 'Honda Activa 6G • DL 01 AB 1234'}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${driverState?.driverPhone || '+919876543210'}`}
                className="btn-editorial"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--green)',
                  color: 'var(--white)',
                  textAlign: 'center',
                  padding: '0.7rem',
                  fontSize: '0.85rem',
                  textDecoration: 'none'
                }}
              >
                📞 CALL DRIVER ({driverState?.driverPhone || '+91 98765 43210'})
              </a>
            </div>

            {/* Order Items & Kitchen Info */}
            <div
              style={{
                backgroundColor: 'var(--white)',
                border: 'var(--border-thick)',
                padding: '1rem'
              }}
            >
              <h5 style={{ margin: '0 0 0.6rem', fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--red)' }}>
                DELIVERING FROM: {kitchenLoc.name}
              </h5>
              <p style={{ margin: '0 0 1rem', fontSize: '0.75rem', opacity: 0.8 }}>
                📍 {customerLoc.address}
              </p>

              <h5 style={{ margin: '0 0 0.6rem', fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>
                ORDER ITEMS ({cartItems.length}):
              </h5>
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                {cartItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span style={{ fontWeight: 800 }}>{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Google Maps Interactive Live View */}
          <div style={{ flex: 1, position: 'relative' }}>
            <GoogleMapsView
              customerLocation={customerLoc}
              kitchenLocation={kitchenLoc}
              driverLocation={driverState}
              showRoute={true}
              interactive={true}
              height="100%"
            />
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .tracking-body-container {
            flex-direction: column-reverse !important;
          }
          .tracking-details-panel {
            width: 100% !important;
            height: 50% !important;
            border-right: none !important;
            border-top: var(--border-thick) !important;
          }
        }
      `}</style>
    </div>
  );
}
