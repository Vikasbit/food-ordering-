import { KITCHENS_DATABASE } from '../data/kitchens';

/**
 * Calculates Haversine distance in kilometers between two lat/lng pairs
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Calculates estimated travel time in minutes based on distance and average city speed (25 km/h)
 */
export function estimateTravelTimeMin(distanceKm) {
  const avgSpeedKmH = 25;
  const timeHours = distanceKm / avgSpeedKmH;
  return Math.max(5, Math.round(timeHours * 60));
}

/**
 * Evaluates all BigBites kitchens for a user's delivery location
 * Ranks by: 1. Delivery Availability, 2. Travel ETA, 3. Distance, 4. Prep Time
 */
export function findNearestServingKitchen(userLat, userLng) {
  if (!userLat || !userLng) {
    const defaultKitchen = KITCHENS_DATABASE[0];
    return {
      isDeliverable: true,
      selectedKitchen: defaultKitchen,
      distanceKm: 2.4,
      travelTimeMin: 12,
      totalEtaMin: defaultKitchen.basePrepTimeMin + 12 + 3,
      allNearbyKitchens: [defaultKitchen]
    };
  }

  const evaluated = KITCHENS_DATABASE.map((kitchen) => {
    const distanceKm = calculateHaversineDistance(userLat, userLng, kitchen.lat, kitchen.lng);
    const travelTimeMin = estimateTravelTimeMin(distanceKm);
    const totalEtaMin = kitchen.basePrepTimeMin + travelTimeMin + 3; // 3 min buffer
    const inZone = distanceKm <= kitchen.serviceRadiusKm;

    return {
      kitchen,
      distanceKm: parseFloat(distanceKm.toFixed(1)),
      travelTimeMin,
      totalEtaMin,
      inZone,
      isAvailable: kitchen.deliveryAvailable && kitchen.openingStatus === 'OPEN NOW' && inZone
    };
  });

  // Filter deliverable kitchens first
  const deliverable = evaluated
    .filter((e) => e.isAvailable)
    .sort((a, b) => a.totalEtaMin - b.totalEtaMin || a.distanceKm - b.distanceKm);

  if (deliverable.length > 0) {
    const best = deliverable[0];
    return {
      isDeliverable: true,
      selectedKitchen: best.kitchen,
      distanceKm: best.distanceKm,
      travelTimeMin: best.travelTimeMin,
      totalEtaMin: best.totalEtaMin,
      allNearbyKitchens: deliverable.map((d) => ({
        ...d.kitchen,
        distanceKm: d.distanceKm,
        travelTimeMin: d.travelTimeMin,
        totalEtaMin: d.totalEtaMin
      }))
    };
  }

  // If outside all kitchen delivery zones, find the geographically closest one to show distance message
  const sortedByDist = [...evaluated].sort((a, b) => a.distanceKm - b.distanceKm);
  const closest = sortedByDist[0];

  return {
    isDeliverable: false,
    selectedKitchen: closest ? closest.kitchen : KITCHENS_DATABASE[0],
    distanceKm: closest ? closest.distanceKm : 18.5,
    travelTimeMin: closest ? closest.travelTimeMin : 35,
    totalEtaMin: closest ? closest.totalEtaMin : 50,
    allNearbyKitchens: sortedByDist.map((d) => ({
      ...d.kitchen,
      distanceKm: d.distanceKm,
      travelTimeMin: d.travelTimeMin,
      totalEtaMin: d.totalEtaMin
    }))
  };
}

/**
 * Validates whether an address string or location is valid before checkout
 */
export function validateDeliveryAddress(address, userLat, userLng) {
  if (!address || address.trim().length < 5) {
    return { valid: false, message: 'Please provide a valid street address.' };
  }
  const result = findNearestServingKitchen(userLat, userLng);
  if (!result.isDeliverable) {
    return {
      valid: false,
      message: `Sorry, we don't deliver to this address yet (${result.distanceKm} km from nearest hub).`,
      nearestHub: result.selectedKitchen
    };
  }
  return { valid: true, ...result };
}
