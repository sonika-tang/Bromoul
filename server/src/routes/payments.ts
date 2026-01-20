
import { Router } from 'express';
import { adapter } from '../storage/adapter';

const router = Router();

router.post('/aba/qr', async (req, res) => {
    try {
        const { order_id, amount_riel } = req.body;
        
        if (!order_id || !amount_riel) {
            return res.status(400).json({ error: 'ទិន្នន័យមិនពេញលេញ' });
        }
        
        const tranId = `ABA_${Date.now()}_${order_id}`;
        // Using public QR generator API for visuals
        const mockQr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ABA_PAYWAY_${tranId}`;

        // Store payment record
        const payment = await adapter.create('payments', {
            order_id,
            tran_id: tranId,
            amount_riel,
            payment_method: 'aba',
            status: 'pending',
            qr_image: mockQr
        });

        res.json({
            status: 0,
            description: 'Success',
            tran_id: tranId,
            qr_image: mockQr,
            amount: amount_riel,
            payment_id: payment.id
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'កំហុសក្នុងការបង្កើត QR' });
    }
});

// Check payment status
router.get('/aba/check-status/:tranId', async (req, res) => {
    try {
        const { tranId } = req.params;
        const payment = await adapter.findOne('payments', p => p.tran_id === tranId);
        
        if (!payment) {
            return res.status(404).json({ error: 'មិនរកឃើញការទូទាត់' });
        }
        
        res.json({
            status: 0,
            payment_status: payment.status === 'paid' ? 'COMPLETED' : 'PENDING',
            tran_id: tranId
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'កំហុសក្នុងការពិនិត្យស្ថានភាព' });
    }
});

router.post('/aba/webhook', async (req, res) => {
    try {
        const { tran_id, order_id, payment_status } = req.body;
        
        if (order_id) {
            const order = await adapter.get('orders', order_id);
            if (order) {
                await adapter.update('orders', order_id, {
                    payment_status: payment_status || 'paid',
                    payment_tran_id: tran_id,
                    payment_confirmed_at: new Date().toISOString()
                });
                
                // Emit analytics event
                await adapter.create('analytics_events', {
                    event_type: 'payment_confirmed',
                    order_id,
                    payment_tran_id: tran_id,
                    timestamp: new Date().toISOString()
                });
                
                // Emit socket notification
                const io = req.app.get('io');
                if (io) {
                    io.to(`user_${order.buyer_id}`).emit('payment_confirmed', {
                        order_id,
                        message: 'ការទូទាត់បានបញ្ជាក់'
                    });
                }
            }
        }
        
        res.json({ status: 200, message: 'ទទួលបានសម្រេច' });
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'កំហុសក្នុងការដំណើរការ webhook' });
    }
});

export default router;
