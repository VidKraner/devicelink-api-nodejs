import express from 'express';
import { deviceRoutes } from './routes/device.routes';
import { apiKeyAuth } from './middleware/auth.middleware';

const app = express();

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Device routes
app.use('/api/v1/devices', apiKeyAuth, deviceRoutes);

export default app;
