import { StorageService } from './storageService';

export const OrderService = {
  getAll: async () => {
    return await StorageService.read('orders');
  },

  create: async (cartItems, userId, role, deliveryOption = 'standard') => {
    const orders = await StorageService.read('orders');
    const listings = await StorageService.read('listings');
    
    const newOrders = [];
    for (const item of cartItems) {
      const listing = listings.find(l => l.id === item.id);
      if (!listing) continue;
      
      const deliveryFee = deliveryOption === 'cold' ? 20000 : 5000;
      const total = (listing.price_riel * item.quantity) + deliveryFee;
      
      const order = {
        id: 'o' + Date.now() + Math.random().toString().slice(2, 5),
        buyer_id: role === 'buyer' ? userId : null,
        seller_id: listing.user_id,
        listing_id: listing.id,
        crop_name: listing.crop_name || 'Unknown',
        quantity: item.quantity,
        total_riel: total,
        delivery_status: 'agreed', // Step 1
        delivery_option: deliveryOption,
        created_at: new Date().toISOString()
      };
      
      orders.push(order);
      newOrders.push(order);
    }
    
    await StorageService.write('orders', orders);
    return newOrders;
  },

  updateStatus: async (orderId, status) => {
    const orders = await StorageService.read('orders');
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error('មិនរកឃើញការបញ្ជាទិញ');
    
    order.delivery_status = status;
    order.updated_at = new Date().toISOString();
    await StorageService.write('orders', orders);
    return order;
  }
};