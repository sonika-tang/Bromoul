import { StorageService } from './storageService';

export const CartService = {
  getCart: async () => {
    return await StorageService.read('cart');
  },

  addItem: async (listing, quantity = 1) => {
    const cart = await StorageService.read('cart');
    const existing = cart.find(item => item.id === listing.id);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ ...listing, quantity });
    }
    
    await StorageService.write('cart', cart);
    window.dispatchEvent(new Event('cartUpdated'));
    return cart;
  },

  removeItem: async (listingId) => {
    const cart = await StorageService.read('cart');
    const filtered = cart.filter(item => item.id !== listingId);
    await StorageService.write('cart', filtered);
    window.dispatchEvent(new Event('cartUpdated'));
    return filtered;
  },

  clear: async () => {
    await StorageService.write('cart', []);
    window.dispatchEvent(new Event('cartUpdated'));
  }
};