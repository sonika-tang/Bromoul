import { StorageService } from './storageService';

export const seedMockData = async () => {
  const existing = await StorageService.read('users');
  if (existing.length > 0) return; // Already seeded

  const users = [
    { id: 'f1', name: 'សុខា កសិករ', role: 'farmer', email: 'sokha@farm.com' },
    { id: 'b1', name: 'វិចិត្រ អ្នកទិញ', role: 'buyer', email: 'dara@mart.com' }
  ];
  await StorageService.write('users', users);

  const crops = [
    { id: 'c1', name_kh: 'ស្វាយ', category: 'ផ្លែឈើ' },
    { id: 'c2', name_kh: 'ចេក', category: 'ផ្លែឈើ' },
    { id: 'c3', name_kh: 'ល្ពៅ', category: 'បន្លែ' },
  ];
  await StorageService.write('crops', crops);

  const listings = [
    { id: 'l1', user_id: 'f1', crop_id: 'c1', type: 'supply', quantity: 500, unit: 'kg', price_riel: 3000, status: 'active' },
    { id: 'l2', user_id: 'f1', crop_id: 'c2', type: 'supply', quantity: 2000, unit: 'kg', price_riel: 1200, status: 'active' },
    { id: 'l3', user_id: 'b1', crop_id: 'c3', type: 'demand', quantity: 1000, unit: 'kg', price_riel: 1300, duration: '30 days', status: 'active' }
  ];
  await StorageService.write('listings', listings);

  await StorageService.write('cart', []);
  await StorageService.write('orders', []);
  await StorageService.write('messages', []);

  console.log('Mock data seeded to localStorage');
};