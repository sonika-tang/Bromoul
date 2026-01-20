
import { Router } from 'express';
import { adapter } from '../storage/adapter';

const router = Router();

const OrderSchema = {
    // Basic validation manual or just accept body
};

router.get('/buyer/:userId', async (req, res) => {
    const { userId } = req.params;
    const orders = await adapter.find('orders', o => o.buyer_id == userId);
    // Enrich
    const listings = await adapter.getAll('listings');
    const crops = await adapter.getAll('crops');
    const users = await adapter.getAll('users');

    const enriched = orders.map(o => {
        const listing = listings.find(l => l.id == o.listing_id) || {};
        const crop = crops.find(c => c.id == listing.crop_id) || {};
        const seller = users.find(u => u.id == o.seller_id) || {};
        return { ...o, crop_name: crop.name_kh || 'Unknown', seller_name: seller.name || 'Unknown' };
    });
    res.json(enriched);
});

router.get('/seller/:userId', async (req, res) => {
    const { userId } = req.params;
    const orders = await adapter.find('orders', o => o.seller_id == userId);
    // Enrich
    const listings = await adapter.getAll('listings');
    const crops = await adapter.getAll('crops');
    const users = await adapter.getAll('users');

    const enriched = orders.map(o => {
        const listing = listings.find(l => l.id == o.listing_id) || {};
        const crop = crops.find(c => c.id == listing.crop_id) || {};
        const buyer = users.find(u => u.id == o.buyer_id) || {};
        return { ...o, crop_name: crop.name_kh || 'Unknown', buyer_name: buyer.name || 'Unknown' };
    });
    res.json(enriched);
});

router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const results = [];

        for (const item of data.items) {
            const listing = await adapter.get('listings', item.listing_id);
            if (!listing) continue;

            let total = 0;
            if (listing.type === 'supply') {
                total = Number(listing.price_riel) * item.quantity;
            }
            if (data.delivery_option === 'cold') total += 20000; else total += 5000;

            const id = Date.now().toString() + Math.random().toString().slice(2, 5);
            const newOrder = {
                id,
                buyer_id: data.buyer_id,
                seller_id: listing.user_id,
                listing_id: item.listing_id,
                quantity: item.quantity,
                total_riel: total,
                payment_method: data.payment_method,
                delivery_status: 'agreed',
                created_at: new Date().toISOString()
            };

            await adapter.set('orders', id, newOrder);
            results.push(newOrder);

            // Should also emit socket notification here
        }
        res.json(results);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // In Memory update
    const order = await adapter.get('orders', id);
    if (!order) return res.status(404).json({ error: 'Not found' });

    order.delivery_status = status;
    await adapter.set('orders', id, order);

    // Emit notification logic would go here

    res.json(order);
});

export default router;
