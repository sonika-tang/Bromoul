
import { db } from './mockDB';

// Simulate Async Delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const AuthService = {
    login: async (email, role) => { // Simplified Login
        await delay();
        // Just find user by role for demo
        const users = await db.query('users', { role });
        const user = users[0]; // Take first user of that role
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
        return user;
    },
    getCurrentUser: () => JSON.parse(localStorage.getItem('user')),
    logout: () => {
        localStorage.removeItem('user');
        window.location.reload();
    }
};

export const ListingService = {
    getAll: async (filters = {}) => {
        await delay();
        let listings = await db.get('listings');
        const users = await db.get('users');
        const crops = await db.get('crops');

        let result = listings.map(l => {
            const crop = crops.find(c => c.id == l.crop_id) || {};
            const user = users.find(u => u.id == l.user_id) || {};
            return {
                ...l,
                crop_name: crop.name_kh || 'Unknown',
                user_name: user.name || 'Unknown',
                profile_picture: user.profile_picture
            };
        });

        if (filters.type) result = result.filter(r => r.type === filters.type);
        if (filters.crop) result = result.filter(r => r.crop_id == filters.crop);

        return result;
    },

    getMyListings: async (userId) => {
        await delay();
        // Re-use logic above or simple filter
        // Ideally we dry this up, but for MVP copy-paste aggregation logic is fine
        let listings = await db.query('listings', { user_id: userId });
        const crops = await db.get('crops');
        return listings.map(l => ({
            ...l,
            crop_name: crops.find(c => c.id == l.crop_id)?.name_kh || 'Unknown'
        }));
    },

    create: async (data) => {
        await delay();
        return await db.create('listings', { ...data, status: 'active' });
    }
};

export const OrderService = {
    // Cart operations are local, Checkout creates Order
    create: async (payload) => {
        await delay();
        // Payload: { buyer_id, items: [{ listing_id, quantity }] }
        // For MVP, 1 order per item or group?
        // Let's create one order entry per listing item for simplicity in tracking
        const results = [];
        for (const item of payload.items) {
            const listing = await db.get('listings', item.listing_id);
            if (!listing) continue;

            const total = (listing.price_riel || 0) * item.quantity + (payload.delivery_option === 'cold' ? 20000 : 5000);

            const order = await db.create('orders', {
                buyer_id: payload.buyer_id,
                seller_id: listing.user_id,
                listing_id: listing.id,
                quantity: item.quantity,
                total_riel: total,
                delivery_status: 'agreed',
                payment_status: 'pending',
                crop_name: (await db.get('crops', listing.crop_id))?.name_kh,
                payment_method: payload.payment_method
            });
            results.push(order);
        }
        return results;
    },

    getMyOrders: async (userId, role) => {
        await delay();
        const orders = await db.get('orders');
        const users = await db.get('users');

        let myOrders = role === 'farmer'
            ? orders.filter(o => o.seller_id === userId)
            : orders.filter(o => o.buyer_id === userId);

        return myOrders.map(o => {
            const partnerId = role === 'farmer' ? o.buyer_id : o.seller_id;
            const partner = users.find(u => u.id === partnerId);
            return {
                ...o,
                buyer_name: role === 'farmer' ? partner?.name : 'Me',
                seller_name: role === 'buyer' ? partner?.name : 'Me'
            };
        });
    },

    updateStatus: async (orderId, status) => {
        await delay();
        return await db.update('orders', orderId, { delivery_status: status });
    }
};

export const RefService = {
    getCrops: async () => {
        return await db.get('crops');
    }
};

export const AnalyticsService = {
    // Generate simple stats on the fly
    getStats: async () => {
        await delay();
        const listings = await db.get('listings');
        const crops = await db.get('crops');

        return crops.map(c => {
            const cropListings = listings.filter(l => l.crop_id === c.id);
            return {
                crop_name: c.name_kh,
                supply: cropListings.filter(l => l.type === 'supply').reduce((a, b) => a + (Number(b.quantity) || 0), 0),
                demand: cropListings.filter(l => l.type === 'demand').reduce((a, b) => a + (Number(b.quantity) || 0), 0)
            };
        });
    }
};

export default { AuthService, ListingService, OrderService, RefService, AnalyticsService };
