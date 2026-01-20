
import { Router } from 'express';
import { adapter } from '../storage/adapter';

const router = Router();

// Delivery states: agreed, preparing, ready, delivery_requested, out_for_delivery, delivered, completed

// GET Deliveries for user (by role)
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.query;
        
        let deliveries;
        if (role === 'farmer') {
            deliveries = await adapter.query('orders', { seller_id: userId });
        } else {
            deliveries = await adapter.query('orders', { buyer_id: userId });
        }
        
        // Enrich with listing and user data
        const listings = await adapter.getAll('listings');
        const crops = await adapter.getAll('crops');
        const users = await adapter.getAll('users');
        
        const enriched = deliveries.map(order => {
            const listing = listings.find(l => l.id === order.listing_id) || {};
            const crop = crops.find(c => c.id === listing.crop_id) || {};
            const buyer = users.find(u => u.id === order.buyer_id) || {};
            const seller = users.find(u => u.id === order.seller_id) || {};
            
            return {
                ...order,
                listing: {
                    ...listing,
                    crop_name: crop.name_kh || 'Unknown'
                },
                buyer_name: buyer.name || 'Unknown',
                seller_name: seller.name || 'Unknown'
            };
        });
        
        res.json(enriched);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'កំហុសក្នុងការទាញទិន្នន័យ' });
    }
});

// PATCH Update delivery state
router.patch('/:orderId/state', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { state, user_id } = req.body;
        
        const validStates = ['agreed', 'preparing', 'ready', 'delivery_requested', 'out_for_delivery', 'delivered', 'completed'];
        if (!validStates.includes(state)) {
            return res.status(400).json({ error: 'ស្ថានភាពមិនត្រឹមត្រូវ' });
        }
        
        const order = await adapter.get('orders', orderId);
        if (!order) {
            return res.status(404).json({ error: 'មិនរកឃើញការបញ្ជាទិញ' });
        }
        
        // Validate state transitions
        const currentState = order.delivery_status;
        const stateOrder = ['agreed', 'preparing', 'ready', 'delivery_requested', 'out_for_delivery', 'delivered', 'completed'];
        const currentIndex = stateOrder.indexOf(currentState);
        const newIndex = stateOrder.indexOf(state);
        
        if (newIndex <= currentIndex && state !== 'completed') {
            return res.status(400).json({ error: 'មិនអាចត្រឡប់ទៅស្ថានភាពមុនបានទេ' });
        }
        
        const updated = await adapter.update('orders', orderId, {
            delivery_status: state
        });
        
        // Emit analytics event
        await adapter.create('analytics_events', {
            event_type: 'delivery_state_change',
            order_id: orderId,
            user_id: user_id || order.buyer_id,
            old_state: currentState,
            new_state: state,
            timestamp: new Date().toISOString()
        });
        
        // Emit socket notification if available
        const io = req.app.get('io');
        if (io) {
            const notifyUserId = order.buyer_id === user_id ? order.seller_id : order.buyer_id;
            io.to(`user_${notifyUserId}`).emit('delivery_update', {
                order_id: orderId,
                state,
                message: `ការបញ្ជាទិញ #${orderId} បានផ្លាស់ប្តូរទៅ: ${state}`
            });
        }
        
        res.json(updated);
    } catch (err: any) {
        res.status(400).json({ error: err.message || 'កំហុសក្នុងការធ្វើបច្ចុប្បន្នភាព' });
    }
});

// POST Assign driver (optional)
router.post('/:orderId/assign', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { driver_id, driver_name, driver_phone } = req.body;
        
        const order = await adapter.get('orders', orderId);
        if (!order) {
            return res.status(404).json({ error: 'មិនរកឃើញការបញ្ជាទិញ' });
        }
        
        const updated = await adapter.update('orders', orderId, {
            driver_id,
            driver_name,
            driver_phone
        });
        
        res.json(updated);
    } catch (err: any) {
        res.status(400).json({ error: err.message || 'កំហុសក្នុងការចាត់តាំងអ្នកដឹក' });
    }
});

export default router;
