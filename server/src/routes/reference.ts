
import { Router } from 'express';
// import { query } from '../db'; // Removing db import
import { adapter } from '../storage/adapter';

const router = Router();

router.get('/crops', async (req, res) => {
    const crops = await adapter.getAll('crops');
    // Sort by id
    crops.sort((a, b) => a.id - b.id);
    res.json(crops);
});

export default router;
