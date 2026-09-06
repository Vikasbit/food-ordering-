import React, { useState, useEffect, useRef } from 'react';
import { orderService, driverService } from '../../lib/supabase';
import GoogleMapsView from '../../components/GoogleMapsView';

export default function DriverSimulatorPage() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  
  const [activeOrder, setActiveOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  
  // Real GPS watch state (Requirement 8)
  const [isWatchingRealGps, setIsWatchingRealGps] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const watchIdRef = useRef(null);
  const lastGpsSentRef = useRef(0);

  // Simulation mode
  const [simulationActive, setSimulationActive] = useState(false);
  const simInterval = useRef(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (selectedOrderId) {
      const order = orders.find(o => o.id === selectedOrderId);
      setActiveOrder(order || null);
    } else {
      setActiveOrder(null);
    }
  }, [selectedOrderId, orders]);

  async function fetchData() {
    const allOrders = JSON.parse(localStorage.getItem('bigbites_db_orders') || '[]');
    const activeDelivOrders = allOrders.filter(o => 
      ['PENDING', 'ACCEPTED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DRIVER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes((o.status || '').toUpperCase().replace(/\s+/g, '_'))
    );
    setOrders(activeDelivOrders);
    
    const driversList = JSON.parse(localStorage.getItem('bigbites_db_drivers') || '[]');
    setDrivers(driversList);
  }

  const handleAssign = async () => {
    if (!selectedOrderId || !selectedDriverId) return alert('Please select both order and driver');
    try {
      await orderService.assignDriver(selectedOrderId, selectedDriverId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!activeOrder) return;
    try {
      if (status === 'DELIVERED') {
        if (isWatchingRealGps && watchIdRef.current) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          setIsWatchingRealGps(false);
        }
        await orderService.completeDelivery(activeOrder.id);
      } else {
        await orderService.updateOrderStatus(activeOrder.id, status);
      }
      
      if (status === 'PICKED_UP' || status === 'OUT_FOR_DELIVERY') {
        const rLat = activeOrder.restaurant_lat || 28.6315;
        const rLng = activeOrder.restaurant_lng || 77.2167;
        await driverService.updateDriverLocation(activeOrder.id, activeOrder.driver_id || 'driver-1', rLat, rLng, 0);
        setDriverLocation({ latitude: rLat, longitude: rLng });
      }
      
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // 8. REAL DRIVER GPS TRACKING using navigator.geolocation.watchPosition() (Requirement 8)
  const toggleRealGpsWatch = () => {
    if (isWatchingRealGps) {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      setIsWatchingRealGps(false);
    } else {
      if (!navigator.geolocation) {
        setGpsError('Geolocation is not supported by your browser/device.');
        return;
      }
      if (!activeOrder) {
        setGpsError('Please select an active delivery order first.');
        return;
      }

      setGpsError('');
      setIsWatchingRealGps(true);

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const now = Date.now();
          // Throttling: Send database updates at most once every 2.5 seconds (Requirement 8)
          if (now - lastGpsSentRef.current >= 2500) {
            lastGpsSentRef.current = now;
            const { latitude, longitude, heading, speed } = pos.coords;

            await driverService.updateDriverLocation(
              activeOrder.id,
              activeOrder.driver_id || 'driver-1',
              latitude,
              longitude,
              heading || 0
            );

            setDriverLocation({
              latitude,
              longitude,
              heading: heading || 0,
              speed: speed || 0
            });
          }
        },
        (err) => {
          setGpsError(`GPS Error: ${err.message}`);
          setIsWatchingRealGps(false);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    }
  };

  // Step-by-step simulator movement
  const toggleSimulation = () => {
    if (simulationActive) {
      clearInterval(simInterval.current);
      setSimulationActive(false);
    } else {
      startSimulation();
    }
  };

  const startSimulation = () => {
    if (!activeOrder) {
      return alert('Select an active order first.');
    }
    
    setSimulationActive(true);
    
    const startLat = activeOrder.restaurant_lat || 28.6315;
    const startLng = activeOrder.restaurant_lng || 77.2167;
    const endLat = activeOrder.delivery_latitude || activeOrder.delivery_lat || 28.6380;
    const endLng = activeOrder.delivery_longitude || activeOrder.delivery_lng || 77.2250;
    
    let currentLat = driverLocation?.latitude || startLat;
    let currentLng = driverLocation?.longitude || startLng;
    
    const totalSteps = 25;
    let step = 0;
    
    const dLat = (endLat - startLat) / totalSteps;
    const dLng = (endLng - startLng) / totalSteps;

    simInterval.current = setInterval(async () => {
      step++;
      currentLat += dLat;
      currentLng += dLng;
      
      const heading = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);
      
      await driverService.updateDriverLocation(
        activeOrder.id,
        activeOrder.driver_id || 'driver-1',
        currentLat,
        currentLng,
        heading
      );

      setDriverLocation({ latitude: currentLat, longitude: currentLng, heading });
      
      if (step >= totalSteps) {
        clearInterval(simInterval.current);
        setSimulationActive(false);
      }
    }, 1800);
  };

  return (
    <div style={{ padding: '2.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
          🛵 DRIVER &amp; GPS TRACKING DASHBOARD
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--brand-dark)', margin: '0.4rem 0 0.2rem', fontWeight: 700 }}>
          Realtime Delivery Driver Interface
        </h1>
        <p style={{ color: '#78716C', margin: 0, fontSize: '0.92rem' }}>
          Supports live GPS hardware location streaming (`navigator.geolocation.watchPosition()`) &amp; automated dispatch simulations.
        </p>
      </div>

      {gpsError && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '0.85rem 1.25rem', borderRadius: '14px', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.88rem' }}>
          ⚠️ {gpsError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '2rem' }} className="driver-grid">
        
        {/* Controls Column */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: '24px', border: '1px solid #ECE7DF', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: '0 0 1rem', color: 'var(--brand-dark)' }}>
            1. Active Delivery Assignment
          </h3>

          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-dark)', display: 'block', marginBottom: '0.4rem' }}>
            Select Order to Deliver:
          </label>
          <select
            value={selectedOrderId} 
            onChange={e => setSelectedOrderId(e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #ECE7DF', marginBottom: '1.25rem', fontSize: '0.9rem', outline: 'none', backgroundColor: '#FAF5EE' }}
          >
            <option value="">-- Choose an active order --</option>
            {orders.map(o => (
              <option key={o.id} value={o.id}>
                #{o.id} ({o.status}) — {o.restaurant_name || 'Kitchen'}
              </option>
            ))}
          </select>

          {activeOrder && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Assign driver if needed */}
              {(!activeOrder.driver_id || activeOrder.status === 'READY_FOR_PICKUP' || activeOrder.status === 'PENDING') && (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-dark)', display: 'block', marginBottom: '0.4rem' }}>
                    Assign Rider:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={selectedDriverId}
                      onChange={e => setSelectedDriverId(e.target.value)}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #ECE7DF', fontSize: '0.85rem' }}
                    >
                      <option value="">-- Choose available driver --</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.vehicle_type || 'Scooter'})</option>
                      ))}
                    </select>
                    <button type="button" onClick={handleAssign} className="btn-primary" style={{ padding: '0.75rem 1.25rem', fontSize: '0.85rem' }}>
                      Assign
                    </button>
                  </div>
                </div>
              )}

              {/* Status Progression Controls */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.6rem', color: 'var(--brand-dark)' }}>
                  Delivery Status Control
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('PREPARING')}
                    className="btn-outline"
                    style={{ padding: '0.65rem 1rem', justifyContent: 'flex-start', fontSize: '0.85rem' }}
                  >
                    🍳 1. Kitchen Preparing Order
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('READY_FOR_PICKUP')}
                    className="btn-outline"
                    style={{ padding: '0.65rem 1rem', justifyContent: 'flex-start', fontSize: '0.85rem' }}
                  >
                    📦 2. Mark Ready for Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('OUT_FOR_DELIVERY')}
                    className="btn-outline"
                    style={{ padding: '0.65rem 1rem', justifyContent: 'flex-start', fontSize: '0.85rem', backgroundColor: '#FFF7ED', borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)', fontWeight: 700 }}
                  >
                    🛵 3. Start Delivery (Out for Delivery)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate('DELIVERED')}
                    className="btn-outline"
                    style={{ padding: '0.65rem 1rem', justifyContent: 'flex-start', fontSize: '0.85rem', backgroundColor: '#F0FDF4', borderColor: '#16A34A', color: '#166534', fontWeight: 700 }}
                  >
                    🎉 4. Mark Delivered (Stops Tracking)
                  </button>
                </div>
              </div>

              {/* GPS Broadcasting Controls */}
              <div style={{ borderTop: '1px solid #EFEAE2', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.6rem', color: 'var(--brand-dark)' }}>
                  Realtime Driver GPS Stream
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={toggleRealGpsWatch}
                    className="btn-primary"
                    style={{
                      padding: '0.85rem',
                      backgroundColor: isWatchingRealGps ? '#DC2626' : '#16A34A',
                      fontSize: '0.9rem'
                    }}
                  >
                    {isWatchingRealGps ? '⏹️ Stop Real Device GPS Watch' : '🎯 Start Live Device GPS Stream'}
                  </button>

                  <button
                    type="button"
                    onClick={toggleSimulation}
                    className="btn-outline"
                    style={{ padding: '0.85rem', fontSize: '0.9rem' }}
                  >
                    {simulationActive ? '⏸️ Pause GPS Movement' : '🚀 Simulate Smooth GPS Journey'}
                  </button>
                </div>

                {driverLocation && (
                  <div style={{ marginTop: '0.85rem', padding: '0.75rem', backgroundColor: '#FAF5EE', borderRadius: '12px', fontSize: '0.78rem', color: '#57534E' }}>
                    <strong>Last Broadcast:</strong> Lat {driverLocation.latitude?.toFixed(4)}, Lng {driverLocation.longitude?.toFixed(4)} (Heading: {driverLocation.heading || 0}°)
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Map Preview Column */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: '24px', border: '1px solid #ECE7DF', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: '0 0 1rem', color: 'var(--brand-dark)' }}>
            Live Radar &amp; Route Preview
          </h3>

          <div style={{ flex: 1, minHeight: '440px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #ECE7DF' }}>
            {activeOrder ? (
              <GoogleMapsView
                customerLocation={{
                  lat: activeOrder.delivery_latitude || activeOrder.delivery_lat || 28.6380,
                  lng: activeOrder.delivery_longitude || activeOrder.delivery_lng || 77.2250,
                  address: activeOrder.delivery_address || 'Customer Delivery Address'
                }}
                kitchenLocation={{
                  lat: activeOrder.restaurant_lat || 28.6315,
                  lng: activeOrder.restaurant_lng || 77.2167,
                  name: activeOrder.restaurant_name || 'Kitchen Hub'
                }}
                driverLocation={driverLocation}
                showRoute={true}
                interactive={true}
                height="100%"
                minHeight="440px"
              />
            ) : (
              <div style={{ height: '100%', minHeight: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF5EE', color: '#78716C', fontSize: '0.95rem' }}>
                Select an order on the left to preview live map route &amp; markers.
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 860px) {
          .driver-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
