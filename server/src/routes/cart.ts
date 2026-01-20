
import { Router } from 'express';
import { adapter } from '../storage/adapter';

const router = Router();

// GET Cart for user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const cartItems = await adapter.query('cart_items', { user_id: userId });
        
        // Enrich with listing and crop data
        const listings = await adapter.getAll('listings');
        const crops = await adapter.getAll('crops');
        const users = await adapter.getAll('users');
        
        const enriched = cartItems.map(item => {
            const listing = listings.find(l => l.id === item.listing_id) || {};
            const crop = crops.find(c => c.id === listing.crop_id) || {};
            const seller = users.find(u => u.id === listing.user_id) || {};
            return {
                ...item,
                listing: {
                    ...listing,
                    crop_name: crop.name_kh || 'Unknown',
                    seller_name: seller.name || 'Unknown'
                }
            };
        });
        
        res.json(enriched);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'កំហុសក្នុងការទាញទិន្នន័យ' });
    }
});

// POST Add to Cart
router.post('/', async (req, res) => {
    try {
        const { user_id, listing_id, quantity } = req.body;
        
        if (!user_id || !listing_id || !quantity) {
            return res.status(400).json({ error: 'ទិន្នន័យមិនពេញលេញ' });
        }
        
        const listing = await adapter.get('listings', listing_id);
        if (!listing) {
            return res.status(404).json({ error: 'មិនរកឃើញការបញ្ជាក់' });
        }
        
        // Check if item already in cart
        const existing = await adapter.findOne('cart_items', item => 
            item.user_id === user_id && item.listing_id === listing_id
        );
        
        if (existing) {
            // Update quantity
            const updated = await adapter.update('cart_items', existing.id, {
                quantity: existing.quantity + quantity
            });
            return res.json(updated);
        }
        
        // Create new cart item
        const newItem = await adapter.create('cart_items', {
            user_id,
            listing_id,
            quantity,
            delivery_option: 'standard'
        });
        
        // Emit analytics event
        await adapter.create('analytics_events', {
            event_type: 'cart_add',
            user_id,
            listing_id,
            quantity,
            timestamp: new Date().toISOString()
        });
        
        res.json(newItem);
    } catch (err: any) {
        res.status(400).json({ error: err.message || 'កំហុសក្នុងការបន្ថែមទៅកន្ត្រក់' });
    }
});

// DELETE Remove from Cart
router.delete('/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        await adapter.delete('cart_items', itemId);
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: err.message || 'កំហុសក្នុងការលុប' });
    }
});

// POST Checkout (creates order from cart)
router.post('/checkout', async (req, res) => {
    try {
        const { user_id, delivery_option, payment_method } = req.body;
        
        const cartItems = await adapter.query('cart_items', { user_id });
        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'កន្ត្រក់ទទេ' });
        }
        
        const listings = await adapter.getAll('listings');
        const orders = [];
        
        for (const item of cartItems) {
            const listing = listings.find(l => l.id === item.listing_id);
            if (!listing) continue;
            
            let total = 0;
            if (listing.type === 'supply') {
                total = Number(listing.price_riel) * item.quantity;
            }
            
            // Add delivery cost
            if (delivery_option === 'cold') {
                total += 20000;
            } else {
                total += 5000;
            }
            
            const order = await adapter.create('orders', {
                buyer_id: user_id,
                seller_id: listing.user_id,
                listing_id: item.listing_id,
                quantity: item.quantity,
                total_riel: total,
                payment_method: payment_method || 'aba',
                delivery_option: delivery_option || 'standard',
                delivery_status: 'agreed',
                payment_status: 'pending'
            });
            
            orders.push(order);
            
            // Delete cart item
            await adapter.delete('cart_items', item.id);
            
            // Emit analytics event
            await adapter.create('analytics_events', {
                event_type: 'order_created',
                user_id,
                order_id: order.id,
                listing_id: item.listing_id,
                total_riel: total,
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({ orders, total: orders.reduce((sum, o) => sum + o.total_riel, 0) });
    } catch (err: any) {
        res.status(400).json({ error: err.message || 'កំហុសក្នុងការទូទាត់' });
    }
});

export default router;
