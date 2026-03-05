import { DeviceAdapter } from './base.adapter';
import { DeviceData, DeviceStatus } from '../models/device';

// Simulates what Tesla's API might return (their own format)
interface TeslaRawResponse {
  charging_state: 'Charging' | 'Complete' | 'Disconnected' | 'Stopped';
  charge_rate_kw: number;
  battery_level: number;
  energy_added_kwh: number;
  timestamp_unix: number;
}

export class TeslaAdapter implements DeviceAdapter {
  getBrandName(): string {
    return 'tesla';
  }

  fetchDeviceState(deviceId: string): { status: DeviceStatus; data: DeviceData } {
    const raw = this.fetchRawData();

    return {
      status: this.mapStatus(raw.charging_state),
      data: {
        deviceId,
        timestamp: new Date(raw.timestamp_unix).toISOString(),
        powerW: raw.charge_rate_kw * 1000, // Convert kW to W
        energyTodayWh: raw.energy_added_kwh * 1000, // Convert kWh to Wh
        batteryLevelPercent: raw.battery_level,
      },
    };
  }

  // In a real implementation, this would make an HTTP request to Tesla's API.
  // Here we return hardcoded data for demonstration purposes.
  private fetchRawData(): TeslaRawResponse {
    const states: TeslaRawResponse['charging_state'][] = ['Charging', 'Complete', 'Disconnected', 'Stopped'];
    const state = states[Math.floor(Math.random() * states.length)];

    return {
      charging_state: state,
      charge_rate_kw: state === 'Charging' ? 7.2 + Math.random() * 4 : 0, // Random charge rate if charging
      battery_level: Math.floor(20 + Math.random() * 80), // Random battery level between 20% and 100%
      energy_added_kwh: Math.floor(Math.random() * 40), // Random energy added today in kWh
      timestamp_unix: Date.now(),
    };
  }

  // Map Tesla's status format to our unified format
  private mapStatus(statusRaw: string): DeviceStatus {
    switch (statusRaw) {
      case 'Charging':
      case 'Complete':
        return 'online';
      case 'Disconnected':
        return 'offline';
      default:
        return 'error';
    }
  }
}
