
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initSeedData } from './storage/adapter';

// Routes
import authRoutes from './routes/auth';
import listingRoutes from './routes/listings';
import orderRoutes from './routes/orders';
import referenceRoutes from './routes/reference';
import analyticsRoutes from './routes/analytics';
import messageRoutes from './routes/messages';
import paymentRoutes from './routes/payments';
import cartRoutes from './routes/cart';
import deliveryRoutes from './routes/deliveries';

// Load Environment Variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize In-Memory Data
initSeedData();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ref', referenceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/deliveries', deliveryRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Bromoul Backend (Memory MVP) is running' });
});

export { app };
