
import { Router } from 'express';
import { adapter } from '../storage/adapter';

const router = Router();

router.get('/conversations/:userId', async (req, res) => {
    const { userId } = req.params;
    const allMsgs = await adapter.getAll('messages');

    // Find unique partners
    const partnerIds = new Set();
    allMsgs.forEach(m => {
        if (m.sender_id == userId) partnerIds.add(m.receiver_id);
        if (m.receiver_id == userId) partnerIds.add(m.sender_id);
    });

    const users = await adapter.getAll('users');
    const partners = users.filter(u => partnerIds.has(u.id));

    res.json(partners);
});

router.get('/:userId/:otherId', async (req, res) => {
    const { userId, otherId } = req.params;
    // Filter messages
    const msgs = await adapter.find('messages', m =>
        (m.sender_id == userId && m.receiver_id == otherId) ||
        (m.sender_id == otherId && m.receiver_id == userId)
    );
    // Sort by date (assuming simple string ISO sort works enough for MVP)
    msgs.sort((a, b) => a.created_at.localeCompare(b.created_at));
    res.json(msgs);
});

router.post('/', async (req, res) => {
    const data = req.body;
    const id = Date.now().toString();
    const newMsg = { ...data, id, created_at: new Date().toISOString() };
    await adapter.set('messages', id, newMsg);
    res.json(newMsg);
});

export default router;
