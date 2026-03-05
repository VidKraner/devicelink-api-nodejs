import { Device } from './models/device';

// Simple in-memory store - will be replaced with PostgreSQL later
const devices: Map<string, Device> = new Map();

export const store = {
  getAll: (): Device[] => Array.from(devices.values()),
  getById: (id: string): Device | undefined => devices.get(id),
  save: (device: Device): void => {
    devices.set(device.id, device);
  },
  delete: (id: string): boolean => devices.delete(id),
};
