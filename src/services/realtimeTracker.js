/**
 * Realtime Event Emitter & Driver GPS Interpolation Service
 */

class RealtimeTrackerService {
  constructor() {
    this.listeners = new Map();
    this.simulators = new Map();
  }

  // Subscribe to order events (order:{orderId})
  subscribe(orderId, eventName, callback) {
    const channelKey = `order:${orderId}:${eventName}`;
    if (!this.listeners.has(channelKey)) {
      this.listeners.set(channelKey, new Set());
    }
    this.listeners.get(channelKey).add(callback);

    // Return unsubscribe function
    return () => {
      if (this.listeners.has(channelKey)) {
        this.listeners.get(channelKey).delete(callback);
      }
    };
  }

  // Broadcast event to subscribers
  emit(orderId, eventName, payload) {
    const channelKey = `order:${orderId}:${eventName}`;
    if (this.listeners.has(channelKey)) {
      this.listeners.get(channelKey).forEach((callback) => {
        try {
          callback(payload);
        } catch (e) {
          console.error(`Error in listener for ${channelKey}:`, e);
        }
      });
    }
  }

  /**
   * Smoothly interpolates lat, lng, and heading between old coordinates and new coordinates
   * @param {Object} from { lat, lng, heading }
   * @param {Object} to { lat, lng, heading }
   * @param {number} durationMs Duration of interpolation animation (e.g., 3000ms)
   * @param {Function} onStep Callback called on each animation frame with { lat, lng, heading }
   */
  interpolateDriverPosition(from, to, durationMs = 3000, onStep) {
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Smooth easing (easeOutCubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const lat = from.lat + (to.lat - from.lat) * easeProgress;
      const lng = from.lng + (to.lng - from.lng) * easeProgress;

      // Heading rotation interpolation
      let dHeading = (to.heading - from.heading) % 360;
      if (dHeading > 180) dHeading -= 360;
      if (dHeading < -180) dHeading += 360;
      const heading = (from.heading + dHeading * easeProgress + 360) % 360;

      if (onStep) {
        onStep({ lat, lng, heading, progress });
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * DEV-ONLY Simulator Mode:
   * Moves a simulated delivery driver along route polylines from Kitchen Hub to Customer Address
   */
  startDevSimulator(orderId, kitchenLoc, customerLoc, onUpdate) {
    this.stopDevSimulator(orderId);

    const steps = [
      { status: 'ORDER_CONFIRMED', text: 'Order confirmed by kitchen', delay: 1000 },
      { status: 'PREPARING', text: 'Chef preparing fresh meal', delay: 4000 },
      { status: 'READY_FOR_PICKUP', text: 'Meal packed & ready', delay: 8000 },
      { status: 'DRIVER_ASSIGNED', text: 'Driver Rahul assigned', delay: 11000 },
      { status: 'PICKED_UP', text: 'Driver picked up food from kitchen', delay: 15000 },
      { status: 'OUT_FOR_DELIVERY', text: 'On the way to your delivery address', delay: 18000 }
    ];

    // Generate 10 waypoint steps along line between kitchen and customer
    const waypointsCount = 12;
    const waypoints = [];
    for (let i = 0; i <= waypointsCount; i++) {
      const ratio = i / waypointsCount;
      const lat = kitchenLoc.lat + (customerLoc.lat - kitchenLoc.lat) * ratio;
      const lng = kitchenLoc.lng + (customerLoc.lng - kitchenLoc.lng) * ratio;
      
      // Calculate heading direction angle
      const dLng = customerLoc.lng - kitchenLoc.lng;
      const dLat = customerLoc.lat - kitchenLoc.lat;
      const heading = (Math.atan2(dLng, dLat) * 180) / Math.PI;

      waypoints.push({ lat, lng, heading: (heading + 360) % 360 });
    }

    let currentWaypointIdx = 0;
    let statusIndex = 0;

    // Dispatch initial status
    this.emit(orderId, 'order_status_changed', { status: steps[0].status, message: steps[0].text });

    const statusTimer = setInterval(() => {
      statusIndex++;
      if (statusIndex < steps.length) {
        const step = steps[statusIndex];
        this.emit(orderId, 'order_status_changed', { status: step.status, message: step.text });
      }
    }, 4000);

    const movementTimer = setInterval(() => {
      if (currentWaypointIdx < waypoints.length) {
        const currentPos = waypoints[currentWaypointIdx];
        const distRemainingKm = parseFloat(
          (
            Math.hypot(
              customerLoc.lat - currentPos.lat,
              customerLoc.lng - currentPos.lng
            ) * 111
          ).toFixed(1)
        );

        const etaMin = Math.max(1, Math.round(distRemainingKm * 2.5 + 1));

        const driverPayload = {
          driverId: 'drv-789',
          driverName: 'Rahul Sharma',
          driverPhone: '+919876543210',
          driverRating: 4.9,
          driverVehicle: 'Honda Activa 6G (White) - DL 01 AB 1234',
          orderId,
          latitude: currentPos.lat,
          longitude: currentPos.lng,
          heading: currentPos.heading,
          speedKmH: 28,
          distanceRemainingKm: distRemainingKm,
          etaMinutes: etaMin,
          timestamp: Date.now()
        };

        this.emit(orderId, 'driver_location_updated', driverPayload);
        this.emit(orderId, 'eta_updated', { etaMinutes: etaMin, distanceRemainingKm: distRemainingKm });
        if (onUpdate) onUpdate(driverPayload);

        currentWaypointIdx++;
      } else {
        // Reached destination!
        this.emit(orderId, 'order_status_changed', { status: 'DELIVERED', message: 'Order delivered safely!' });
        this.emit(orderId, 'delivery_completed', { orderId, timestamp: Date.now() });
        this.stopDevSimulator(orderId);
      }
    }, 3500);

    this.simulators.set(orderId, { statusTimer, movementTimer });
  }

  stopDevSimulator(orderId) {
    if (this.simulators.has(orderId)) {
      const { statusTimer, movementTimer } = this.simulators.get(orderId);
      clearInterval(statusTimer);
      clearInterval(movementTimer);
      this.simulators.delete(orderId);
    }
  }
}

export const realtimeTracker = new RealtimeTrackerService();
