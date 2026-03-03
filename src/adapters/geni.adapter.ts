import { DeviceAdapter } from "./base.adapter";
import { DeviceData, DeviceStatus } from "../models/device";

interface GeniRawResponse {
    production_status: 'producing' | 'idle' | 'error';
    current_output_w: number;
    daily_yield_kwh: number;
    timestamp_iso: string;
}

export class GeniAdapter implements DeviceAdapter {   
    getBrandName(): string {
        return 'geni';
    }

    fetchDeviceState(deviceId: string): { status: DeviceStatus; data: DeviceData } {
        const raw = this.fetchRawData();

        return {
            status: this.mapStatus(raw.production_status),
            data: {
                deviceId,
                timestamp: raw.timestamp_iso,
                powerW: -1 * raw.current_output_w,                                    // Negative because it's producing power (exporting to grid)  
                energyTodayWh: raw.daily_yield_kwh * 1000,                            // Convert kWh to Wh
            }
        };

    }
    
    // Simulates fetching data from Geni's API
    private fetchRawData(): GeniRawResponse {
        const statuses: GeniRawResponse['production_status'][] = ['producing', 'idle', 'error'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        return {
            production_status: status,
            current_output_w: status === 'producing' ? 500 + Math.random() * 1500 : 0, // Random output if producing
            daily_yield_kwh: Math.random() * 10, // Random daily yield in kWh
            timestamp_iso: new Date().toISOString(),
        };
    }

    // Map Geni's status format to our unified format
    private mapStatus(statusRaw: string): DeviceStatus {
        switch (statusRaw) {
            case 'producing':
                return 'online';
            case 'idle':
                return 'offline';
            default:
                return 'error';
        }
    }
}


