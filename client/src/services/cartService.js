
import api from './api';

export const CartService = {
    getCart: async (userId) => {
        if (!userId) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            userId = user.id;
        }
        if (!userId) return [];
        const res = await api.get(`/cart/${userId}`);
        return res.data;
    },

    addToCart: async (listingId, quantity, userId) => {
        if (!userId) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            userId = user.id;
        }
        const res = await api.post('/cart', {
            user_id: userId,
            listing_id: listingId,
            quantity
        });
        window.dispatchEvent(new Event('cartUpdated'));
        return res.data;
    },

    removeFromCart: async (itemId) => {
        await api.delete(`/cart/${itemId}`);
        window.dispatchEvent(new Event('cartUpdated'));
    },

    checkout: async (userId, deliveryOption, paymentMethod) => {
        const res = await api.post('/cart/checkout', {
            user_id: userId,
            delivery_option: deliveryOption,
            payment_method: paymentMethod
        });
        window.dispatchEvent(new Event('cartUpdated'));
        return res.data;
    }
};
