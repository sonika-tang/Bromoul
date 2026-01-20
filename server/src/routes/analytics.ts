
import { Router } from 'express';
import { adapter } from '../storage/adapter';

const router = Router();

// GET Supply trends by crop
router.get('/supply-trends', async (req, res) => {
    try {
        const { start_date, end_date, crop_id } = req.query;
        
        let events = await adapter.query('analytics_events', { event_type: 'listing_created' });
        
        // Filter by date range if provided
        if (start_date) {
            events = events.filter(e => e.timestamp >= start_date);
        }
        if (end_date) {
            events = events.filter(e => e.timestamp <= end_date);
        }
        
        // Filter by crop if provided
        if (crop_id) {
            events = events.filter(e => e.crop_id === crop_id);
        }
        
        // Get listings to aggregate
        const listings = await adapter.query('listings', { type: 'supply', status: 'active' });
        const crops = await adapter.getAll('crops');
        
        const stats = crops.map(c => {
            const cropListings = listings.filter(l => l.crop_id == c.id);
            const cropEvents = events.filter(e => e.crop_id == c.id && e.listing_type === 'supply');
            
            return {
                id: c.id,
                crop_name: c.name_kh,
                total_quantity: cropListings.reduce((sum, l) => sum + Number(l.quantity || 0), 0),
                listing_count: cropListings.length,
                events_count: cropEvents.length,
                trend: cropEvents.length > 0 ? 'increasing' : 'stable'
            };
        });
        
        res.json(stats);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'កំហុសក្នុងការទាញទិន្នន័យ' });
    }
});

// GET Demand trends by crop
router.get('/demand-trends', async (req, res) => {
    try {
        const { start_date, end_date, crop_id } = req.query;
        
        let events = await adapter.query('analytics_events', { event_type: 'listing_created' });
        
        if (start_date) {
            events = events.filter(e => e.timestamp >= start_date);
        }
        if (end_date) {
            events = events.filter(e => e.timestamp <= end_date);
        }
        
        if (crop_id) {
            events = events.filter(e => e.crop_id === crop_id);
        }
        
        const listings = await adapter.query('listings', { type: 'demand', status: 'active' });
        const crops = await adapter.getAll('crops');
        
        const stats = crops.map(c => {
            const cropListings = listings.filter(l => l.crop_id == c.id);
            const cropEvents = events.filter(e => e.crop_id == c.id && e.listing_type === 'demand');
            
            return {
                id: c.id,
                crop_name: c.name_kh,
                total_quantity: cropListings.reduce((sum, l) => sum + Number(l.quantity || 0), 0),
                listing_count: cropListings.length,
                events_count: cropEvents.length,
                trend: cropEvents.length > 0 ? 'increasing' : 'stable'
            };
        });
        
        res.json(stats);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'កំហុសក្នុងការទាញទិន្នន័យ' });
    }
});

// GET Price distribution
router.get('/price-distribution', async (req, res) => {
    try {
        const listings = await adapter.query('listings', { type: 'supply', status: 'active' });
        const prices = listings
            .filter(l => l.price_riel && l.price_riel > 0)
            .map(l => Number(l.price_riel));

        if (prices.length === 0) {
            return res.json({ labels: [], values: [] });
        }

        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const buckets = 5;
        const step = Math.ceil((max - min + 1) / buckets) || 1000;

        const counts = Array(buckets).fill(0);
        const labels = [];
        for (let i = 0; i < buckets; i++) {
            const start = min + (i * step);
            const end = start + step;
            labels.push(`${start.toLocaleString()}-${end.toLocaleString()} ៛`);
        }
        prices.forEach(p => {
            let idx = Math.floor((p - min) / step);
            if (idx >= buckets) idx = buckets - 1;
            counts[idx]++;
        });
        res.json({ labels, values: counts });
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'កំហុសក្នុងការទាញទិន្នន័យ' });
    }
});

// GET Top sellers
router.get('/top-sellers', async (req, res) => {
    try {
        const orders = await adapter.getAll('orders');
        const users = await adapter.getAll('users');
        
        const sellerStats = {};
        orders.forEach(order => {
            if (!sellerStats[order.seller_id]) {
                sellerStats[order.seller_id] = {
                    seller_id: order.seller_id,
                    total_orders: 0,
                    total_revenue: 0
                };
            }
            sellerStats[order.seller_id].total_orders++;
            sellerStats[order.seller_id].total_revenue += Number(order.total_riel || 0);
        });
        
        const topSellers = Object.values(sellerStats)
            .sort((a, b) => b.total_revenue - a.total_revenue)
            .slice(0, 10)
            .map(stat => {
                const user = users.find(u => u.id === stat.seller_id);
                return {
                    ...stat,
                    seller_name: user?.name || 'Unknown'
                };
            });
        
        res.json(topSellers);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'កំហុសក្នុងការទាញទិន្នន័យ' });
    }
});

// GET Average delivery times
router.get('/delivery-times', async (req, res) => {
    try {
        const orders = await adapter.query('orders', { delivery_status: 'completed' });
        
        const deliveryTimes = orders
            .filter(o => o.created_at && o.updated_at)
            .map(order => {
                const created = new Date(order.created_at);
                const completed = new Date(order.updated_at);
                return Math.floor((completed - created) / (1000 * 60 * 60 * 24)); // days
            });
        
        if (deliveryTimes.length === 0) {
            return res.json({ average_days: 0, count: 0 });
        }
        
        const average = deliveryTimes.reduce((sum, days) => sum + days, 0) / deliveryTimes.length;
        
        res.json({
            average_days: Math.round(average * 10) / 10,
            count: deliveryTimes.length,
            min_days: Math.min(...deliveryTimes),
            max_days: Math.max(...deliveryTimes)
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'កំហុសក្នុងការទាញទិន្នន័យ' });
    }
});

// Legacy endpoints for backward compatibility
router.get('/trends', async (req, res) => {
    try {
        const listings = await adapter.query('listings', { status: 'active' });
        const crops = await adapter.getAll('crops');

        const stats = crops.map(c => {
            const cropListings = listings.filter(l => l.crop_id == c.id);
            return {
                id: c.id,
                crop_name: c.name_kh,
                supply: cropListings.filter(l => l.type === 'supply').reduce((sum, l) => sum + Number(l.quantity || 0), 0),
                demand: cropListings.filter(l => l.type === 'demand').reduce((sum, l) => sum + Number(l.quantity || 0), 0)
            };
        });

        res.json(stats);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'កំហុសក្នុងការទាញទិន្នន័យ' });
    }
});

// Legacy prices endpoint
router.get('/prices', async (req, res) => {
    try {
        const listings = await adapter.query('listings', { type: 'supply', status: 'active' });
        const prices = listings
            .filter(l => l.price_riel && l.price_riel > 0)
            .map(l => Number(l.price_riel));

        if (prices.length === 0) return res.json({ labels: [], values: [] });

        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const buckets = 5;
        const step = Math.ceil((max - min + 1) / buckets) || 1000;

        const counts = Array(buckets).fill(0);
        const labels = [];
        for (let i = 0; i < buckets; i++) {
            const start = min + (i * step);
            const end = start + step;
            labels.push(`${start.toLocaleString()}-${end.toLocaleString()} ៛`);
        }
        prices.forEach(p => {
            let idx = Math.floor((p - min) / step);
            if (idx >= buckets) idx = buckets - 1;
            counts[idx]++;
        });
        res.json({ labels, values: counts });
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'កំហុសក្នុងការទាញទិន្នន័យ' });
    }
});

export default router;
