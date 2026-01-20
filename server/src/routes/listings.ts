
import { Router } from 'express';
import { adapter } from '../storage/adapter';
import { z } from 'zod';

const router = Router();

// GET All Listings
router.get('/', async (req, res) => {
    try {
        const { type, crop_id } = req.query;

        // 1. Get Listings
        let listings = await adapter.getAll('listings');

        // 2. Filter
        if (type) listings = listings.filter(l => l.type === type);
        if (crop_id) listings = listings.filter(l => l.crop_id == crop_id);

        // 3. Join logic (Manual in Memory)
        // Need Crop Name and User Name
        const crops = await adapter.getAll('crops');
        const users = await adapter.getAll('users');

        const enriched = listings.map(l => {
            const crop = crops.find(c => c.id == l.crop_id) || {};
            const user = users.find(u => u.id == l.user_id) || {};
            return {
                ...l,
                crop_name: crop.name_kh || 'Unknown',
                user_name: user.name || 'Unknown',
                profile_picture: user.profile_picture
            };
        });

        res.json(enriched);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET Mine
router.get('/mine/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const listings = await adapter.find('listings', l => l.user_id == userId);
        const crops = await adapter.getAll('crops');

        const enriched = listings.map(l => ({
            ...l,
            crop_name: crops.find(c => c.id == l.crop_id)?.name_kh || 'Unknown'
        }));

        res.json(enriched);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const newListing = await adapter.create('listings', {
            ...data,
            status: 'active'
        });

        // Emit analytics event
        await adapter.create('analytics_events', {
            event_type: 'listing_created',
            user_id: data.user_id,
            listing_id: newListing.id,
            listing_type: data.type,
            crop_id: data.crop_id,
            timestamp: new Date().toISOString()
        });

        res.json(newListing);
    } catch (err: any) {
        res.status(400).json({ error: err.message || 'កំហុសក្នុងការបង្កើតការបញ្ជាក់' });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const existing = await adapter.get('listings', id);
        if (!existing) {
            return res.status(404).json({ error: 'មិនរកឃើញការបញ្ជាក់' });
        }
        
        const updated = await adapter.update('listings', id, data);
        
        // Emit analytics event
        await adapter.create('analytics_events', {
            event_type: 'listing_updated',
            user_id: existing.user_id,
            listing_id: id,
            timestamp: new Date().toISOString()
        });
        
        res.json(updated);
    } catch (err: any) {
        res.status(400).json({ error: err.message || 'កំហុសក្នុងការធ្វើបច្ចុប្បន្នភាព' });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const existing = await adapter.get('listings', id);
        if (!existing) {
            return res.status(404).json({ error: 'មិនរកឃើញការបញ្ជាក់' });
        }
        
        await adapter.delete('listings', id);
        
        // Emit analytics event
        await adapter.create('analytics_events', {
            event_type: 'listing_deleted',
            user_id: existing.user_id,
            listing_id: id,
            timestamp: new Date().toISOString()
        });
        
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: err.message || 'កំហុសក្នុងការលុប' });
    }
});

export default router;
