import { StorageService } from './storageService';

export const ListingService = {
  getAll: async (filters = {}) => {
    return await StorageService.query('listings', filters);
  },

  getByType: async (type) => {
    return await StorageService.query('listings', { type });
  },

  create: async (data) => {
    const listings = await StorageService.read('listings');
    const newListing = {
      id: 'l' + Date.now(),
      ...data,
      status: 'active',
      created_at: new Date().toISOString()
    };
    listings.push(newListing);
    await StorageService.write('listings', listings);
    return newListing;
  },

  update: async (id, updates) => {
    const listings = await StorageService.read('listings');
    const idx = listings.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('មិនរកឃើញការបញ្ជាក់');
    listings[idx] = { ...listings[idx], ...updates, updated_at: new Date().toISOString() };
    await StorageService.write('listings', listings);
    return listings[idx];
  },

  delete: async (id) => {
    const listings = await StorageService.read('listings');
    const filtered = listings.filter(l => l.id !== id);
    await StorageService.write('listings', filtered);
  }
};