import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageSquare, CheckCircle2, ChefHat, Bike, Home, ShieldCheck, MapPin } from 'lucide-react';
import L from 'leaflet';

export default function OrderTrackingModal({ isOpen, onClose, deliveryLocation }) {
  const [currentStep, setCurrentStep] = useState(2); // 0: Placed, 1: Kitchen, 2: Out for Delivery, 3: Delivered
  const [etaMinutes, setEtaMinutes] = useState(24);
  const [progress, setProgress] = useState(0.45); // 0 to 1 along path

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);

  const customerLat = deliveryLocation?.lat || 28.6139;
  const customerLon = deliveryLocation?.lon || 77.2090;
  const restaurantLat = customerLat - 0.018;
  const restaurantLon = customerLon - 0.015;

  // Animate Rider Movement & ETA Countdown
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          setCurrentStep(3);
          setEtaMinutes(0);
          return 1;
        }
        const next = prev + 0.02;
        const remainingMinutes = Math.max(1, Math.round(25 * (1 - next)));
        setEtaMinutes(remainingMinutes);
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (mapContainerRef.current && !mapInstanceRef.current) {
        const midLat = (customerLat + restaurantLat) / 2;
        const midLon = (customerLon + restaurantLon) / 2;

        const map = L.map(mapContainerRef.current, {
          center: [midLat, midLon],
          zoom: 14,
          zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Restaurant Marker
        const restaurantIcon = L.divIcon({
          className: 'resto-pin',
          html: `<div style="background:#FFC400; color:#111; font-weight:900; padding:6px 10px; border:2.5px solid #111; border-radius:4px; font-size:11px; box-shadow:3px 3px 0px #111;">🏪 KITCHEN</div>`,
          iconSize: [90, 32],
          iconAnchor: [45, 32]
        });
        L.marker([restaurantLat, restaurantLon], { icon: restaurantIcon }).addTo(map);

        // Customer Home Marker
        const customerIcon = L.divIcon({
          className: 'customer-pin',
          html: `<div style="background:#F20D0D; color:#FFF; font-weight:900; padding:6px 10px; border:2.5px solid #111; border-radius:4px; font-size:11px; box-shadow:3px 3px 0px #111;">📍 YOU</div>`,
          iconSize: [70, 32],
          iconAnchor: [35, 32]
        });
        L.marker([customerLat, customerLon], { icon: customerIcon }).addTo(map);

        // Route Polyline
        L.polyline(
          [
            [restaurantLat, restaurantLon],
            [customerLat, customerLon]
          ],
          { color: '#F20D0D', weight: 5, dashArray: '8, 8' }
        ).addTo(map);

        // Moving Driver Marker
        const currentDriverLat = restaurantLat + (customerLat - restaurantLat) * progress;
        const currentDriverLon = restaurantLon + (customerLon - restaurantLon) * progress;

        const driverIcon = L.divIcon({
          className: 'driver-pin',
          html: `<div style="background:#159447; color:#FFF; font-weight:900; padding:6px 10px; border:2.5px solid #111; border-radius:4px; font-size:11px; box-shadow:3px 3px 0px #111; display:flex; align-items:center; gap:4px;">🛵 RAJU (RIDER)</div>`,
          iconSize: [120, 32],
          iconAnchor: [60, 32]
        });

        const driverMarker = L.marker([currentDriverLat, currentDriverLon], { icon: driverIcon }).addTo(map);

        mapInstanceRef.current = map;
        driverMarkerRef.current = driverMarker;
      }
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, customerLat, customerLon, restaurantLat, restaurantLon, progress]);

  // Update Driver Marker Position as progress changes
  useEffect(() => {
    if (driverMarkerRef.current) {
      const currentDriverLat = restaurantLat + (customerLat - restaurantLat) * progress;
      const currentDriverLon = restaurantLon + (customerLon - restaurantLon) * progress;
      driverMarkerRef.current.setLatLng([currentDriverLat, currentDriverLon]);
    }
  }, [progress, customerLat, customerLon, restaurantLat, restaurantLon]);

  // Cleanup map when closed
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const STEPS = [
    { label: 'Order Placed', time: 'Just now', icon: CheckCircle2 },
    { label: 'Kitchen Preparing', time: 'In Progress', icon: ChefHat },
    { label: 'Out for Delivery', time: `${etaMinutes} min left`, icon: Bike },
    { label: 'Arrived at Door', time: 'Pending', icon: Home }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-[var(--cream)] border-4 border-black shadow-[10px_10px_0px_#111] overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Banner */}
          <div className="bg-[var(--red)] border-b-4 border-black p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--yellow)] text-black border-2 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#111]">
                🛵
              </div>
              <div>
                <h2 className="font-black text-xl tracking-wide uppercase leading-none">
                  LIVE ORDER TRACKING
                </h2>
                <p className="text-xs font-bold text-[var(--yellow)] mt-1">
                  ORDER #EN-849201 • EST. ARRIVAL: {etaMinutes > 0 ? `${etaMinutes} MINS` : 'DELIVERED!'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white text-black border-2 border-black font-extrabold text-lg shadow-[2px_2px_0px_#111] hover:bg-black hover:text-white transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Live Progress Bar Steps */}
            <div className="bg-white border-3 border-black p-4 shadow-[4px_4px_0px_#111]">
              <div className="grid grid-cols-4 gap-2 relative">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isDone = index < currentStep;
                  return (
                    <div key={index} className="flex flex-col items-center text-center relative z-10">
                      <div
                        className={`w-10 h-10 border-3 border-black flex items-center justify-center font-extrabold mb-1.5 transition-all shadow-[2px_2px_0px_#111] ${
                          isDone
                            ? 'bg-[var(--green)] text-white'
                            : isActive
                            ? 'bg-[var(--yellow)] text-black animate-bounce'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-black uppercase ${isActive ? 'text-[var(--red)] font-extrabold' : 'text-black'}`}>
                        {step.label}
                      </span>
                      <span className="text-[9px] font-bold text-gray-500">{step.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Leaflet Map Container */}
            <div className="relative border-3 border-black shadow-[4px_4px_0px_#111] h-64 w-full overflow-hidden">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
            </div>

            {/* Delivery Rider & Contact Card */}
            <div className="bg-white border-3 border-black p-4 shadow-[4px_4px_0px_#111] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-[var(--yellow)] border-3 border-black shadow-[3px_3px_0px_#111] overflow-hidden flex items-center justify-center font-black text-2xl">
                  👨‍✈️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-base text-black uppercase">RAJU KUMAR</h4>
                    <span className="bg-[var(--green)] text-white font-black text-[10px] px-1.5 py-0.5 border border-black">
                      ⭐ 4.9
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-600">DELIVERY PARTNER • DL 01 AB 1234 (RED SCOOTER)</p>
                  <p className="text-[11px] font-extrabold text-[var(--green)] flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED VACCINATED & TEMPERATURE CHECKED
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full sm:w-auto">
                <a
                  href="tel:+919876543210"
                  className="flex-1 sm:flex-none py-2.5 px-4 bg-[var(--green)] text-white border-3 border-black font-extrabold text-xs uppercase shadow-[3px_3px_0px_#111] hover:bg-black transition-all flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4" /> CALL RIDER
                </a>
                <button
                  onClick={() => alert('Sending SMS to Raju Kumar...')}
                  className="flex-1 sm:flex-none py-2.5 px-4 bg-[var(--yellow)] text-black border-3 border-black font-extrabold text-xs uppercase shadow-[3px_3px_0px_#111] hover:bg-[var(--red)] hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" /> MESSAGE
                </button>
              </div>
            </div>

            {/* Drop-off Address Info */}
            <div className="bg-[var(--yellow)] border-3 border-black p-3 shadow-[3px_3px_0px_#111] flex items-center justify-between">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-black shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black text-black uppercase tracking-wider block">DELIVERING TO:</span>
                  <span className="font-extrabold text-xs text-black leading-tight block">
                    {deliveryLocation?.address || 'Connaught Place, Inner Circle, New Delhi'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Close Button */}
          <div className="bg-white border-t-4 border-black p-3 text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-black text-white font-black text-sm uppercase shadow-[3px_3px_0px_#111] hover:bg-[var(--red)] transition-all"
            >
              KEEP TRACKING IN BACKGROUND →
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
