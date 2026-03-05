import { DeviceData, DeviceStatus } from '../models/device';

// Every adapter must implement this interface
// This is the contract that makes the "unified" part work
export interface DeviceAdapter {
  getBrandName(): string;
  fetchDeviceState(deviceId: string): {
    status: DeviceStatus;
    data: DeviceData;
  };
}
