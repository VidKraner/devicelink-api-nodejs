import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../store';
import { RegisterDeviceRequest, Device, DeviceStatus, DeviceData } from '../models/device';
import { TeslaAdapter } from '../adapters/tesla.adapter';
import { GeniAdapter } from '../adapters/geni.adapter';
import { TabAdapter } from '../adapters/tab.adapter';
import { DeviceAdapter } from '../adapters/base.adapter';

const router = Router();

// Map brands to their adapters
const adapters: Record<string, DeviceAdapter> = {
  tesla: new TeslaAdapter(),
  geni: new GeniAdapter(),
  tab: new TabAdapter(),
};

// POST /api/v1/devices - Register a new device
router.post('/', (req, res) => {
  const { brand, type, model } = req.body as RegisterDeviceRequest;

  if (!brand || !type || !model) {
    res.status(400).json({ error: 'Missing required fields: brand, type, model' });
    return;
  }

  if (!adapters[brand]) {
    res.status(400).json({ error: `Unsupported brand: ${brand}` });
    return;
  }

  const device: Device = {
    id: uuidv4(),
    type,
    brand,
    model,
    status: 'online',
    lastSeen: new Date().toISOString(),
  };

  store.save(device);
  res.status(201).json(device);
});

// GET /api/v1/devices - List all registered devices
router.get('/', (_req, res) => {
  res.json(store.getAll());
});

// GET /api/v1/devices/:id - Get device details
router.get('/:id', (req, res) => {
  const device = store.getById(req.params.id);
  if (!device) {
    res.status(404).json({ error: 'Device not found' });
    return;
  }
  res.json(device);
});

// GET /api/v1/devices/:id/data - Get real-time data from device
router.get('/:id/data', (req, res) => {
  const result = getDeviceState(req.params.id);
  if ('error' in result) {
    res.status(result.code).json({ error: result.error });
    return;
  }

  res.json({ data: result.state.data });
});

// GET /api/v1/devices/:id/status - Get device status
router.get('/:id/status', (req, res) => {
  const result = getDeviceState(req.params.id);
  if ('error' in result) {
    res.status(result.code).json({ error: result.error });
    return;
  }

  res.json({ status: result.state.status });
});

// Helper to get fresh device state
function getDeviceState(deviceId: string):
  | { error: string; code: number }
  | {
      device: Device;
      state: {
        status: DeviceStatus;
        data: DeviceData;
      };
    } {
  const device = store.getById(deviceId);
  if (!device) return { error: 'Device not found', code: 404 };

  const adapter = adapters[device.brand];
  if (!adapter) return { error: `No adapter for brand: ${device.brand}`, code: 500 };

  const state = adapter.fetchDeviceState(device.id);

  device.status = state.status;
  device.lastSeen = new Date().toISOString();
  store.save(device);

  return { device, state };
}

export { router as deviceRoutes };
