import { DeviceAdapter } from "./base.adapter";
import { DeviceData, DeviceStatus } from "../models/device";

interface TabRawResponse {
    mode: 'charging' | 'discharging' | 'standby' | 'error';
    power_kw: number;
    state_of_charge_percent: number;
    cycles_today: number;
    timestamp_iso: string;
}

export class TabAdapter implements DeviceAdapter {
    getBrandName(): string {
        return 'tab';
    }

    fetchDeviceState(deviceId: string): { status: DeviceStatus; data: DeviceData } {
        const raw = this.fetchRawData();

        return {
            status: this.mapStatus(raw.mode),
            data: {
                deviceId,
                timestamp: raw.timestamp_iso,
                powerW: raw.power_kw * 1000,                                      // Convert kW to W
                energyTodayWh: raw.power_kw * 1000 * (raw.cycles_today * 0.5),    // Estimate energy based on power and cycles (assuming 30 min per cycle -> Rough estimate: power × cycles × 30min avg per cycle)
                batteryLevelPercent: raw.state_of_charge_percent,
            }
        };
    }

    // Simulates fetching data from Tab's API
    private fetchRawData(): TabRawResponse {
        const modes: TabRawResponse['mode'][] = ['charging', 'discharging', 'standby', 'error'];
        const mode = modes[Math.floor(Math.random() * modes.length)];

        const powerMapped = mode === 'charging' ? 5 + Math.random() * 15 : (mode === 'discharging' ? -5 - Math.random() * 15 : 0);

        return {
            mode,
            power_kw: powerMapped ,                                             // Random power positive when charging and negative when discharging
            state_of_charge_percent: Math.floor(20 + Math.random() * 80),       // Random state of charge between 20% and 100%
            cycles_today: Math.floor(Math.random() * 10),                       // Random number of cycles today
            timestamp_iso: new Date().toISOString(),
        };
    }

    // Map Tab's status format to our unified format
    private mapStatus(statusRaw: string): DeviceStatus {
        switch (statusRaw) {
            case 'charging':
            case 'discharging':
                return 'online';
            case 'standby':
                return 'offline';
            default:
                return 'error';
        }
    }
}