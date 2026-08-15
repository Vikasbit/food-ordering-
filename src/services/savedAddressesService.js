const SAVED_ADDRESSES_KEY = 'eatnaked_saved_addresses';

export const DEFAULT_SAVED_ADDRESSES = [
  {
    id: 'addr-home',
    label: 'HOME',
    address: 'Connaught Place, Inner Circle, New Delhi 110001',
    lat: 28.6315,
    lng: 77.2167,
    flatNo: 'Flat 402, Block A',
    landmark: 'Near Odeon Cinema',
    instructions: 'Ring doorbell twice. Leave at security desk if unavailable.',
    isDefault: true
  },
  {
    id: 'addr-work',
    label: 'WORK',
    address: 'DLF Cyber City, Building 10, Tower B, Gurugram, Haryana 122002',
    lat: 28.4950,
    lng: 77.0890,
    flatNo: '5th Floor, Suite 508',
    landmark: 'Opposite IndusInd Bank ATM',
    instructions: 'Call on arrival. Deliver at reception lobby.',
    isDefault: false
  }
];

export function getSavedAddresses() {
  try {
    const raw = localStorage.getItem(SAVED_ADDRESSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading saved addresses:', e);
  }
  return DEFAULT_SAVED_ADDRESSES;
}

export function saveAddress(addressObj) {
  const current = getSavedAddresses();
  const existingIndex = current.findIndex((a) => a.id === addressObj.id);
  
  let updated;
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = { ...updated[existingIndex], ...addressObj };
  } else {
    const newId = `addr-${Date.now()}`;
    updated = [{ ...addressObj, id: newId }, ...current];
  }

  try {
    localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving address:', e);
  }
  return updated;
}

export function deleteSavedAddress(id) {
  const current = getSavedAddresses();
  const filtered = current.filter((a) => a.id !== id);
  try {
    localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Error deleting address:', e);
  }
  return filtered;
}
