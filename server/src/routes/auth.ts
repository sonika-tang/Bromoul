
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { adapter } from '../storage/adapter';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid'; // Need to install uuid, or just use Date.now() for MVP

const router = Router();
const SECRET = process.env.JWT_SECRET || 'secret';

const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['farmer', 'buyer'])
});

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

router.post('/register', async (req, res) => {
    try {
        const data = RegisterSchema.parse(req.body);

        // Check key collision (Simple scan)
        const existing = await adapter.findOne('users', u => u.email === data.email);
        if (existing) return res.status(400).json({ error: 'អ៊ីម៉ែលនេះត្រូវបានប្រើប្រាស់រួចហើយ' });

        const hash = await bcrypt.hash(data.password, 10);
        const id = Date.now().toString(); // Simple ID

        const newUser = {
            id,
            name: data.name,
            email: data.email,
            password_hash: hash,
            role: data.role,
            created_at: new Date().toISOString()
        };

        await adapter.set('users', id, newUser);

        const token = jwt.sign({ id, role: newUser.role }, SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id, name: newUser.name, role: newUser.role, email: newUser.email } });
    } catch (err: any) {
        res.status(400).json({ error: err.message || 'ការចុះឈ្មោះបរាជ័យ' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const data = LoginSchema.parse(req.body);

        const user = await adapter.findOne('users', u => u.email === data.email);
        if (!user) return res.status(401).json({ error: 'អ៊ីម៉ែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ' });

        const match = await bcrypt.compare(data.password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'អ៊ីម៉ែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ' });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: { id: user.id, name: user.name, role: user.role, email: user.email }
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
