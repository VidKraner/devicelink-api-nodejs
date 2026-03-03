// Supported device types
export type DeviceType = 'ev_charger' | 'solar_inverter' | 'battery_storage';

// Supported brands
export type DeviceBrand = 'tesla' | 'geni' | 'tab';

// Device connection status
export type DeviceStatus = 'online' | 'offline' | 'error';

// This is the UNIFIED format - no matter the brand, the API always returns data in this structure. 
// The internal logic will handle the mapping from brand-specific formats to this unified format.
export interface Device {
    id: string;                     // Unique identifier for the device
    type: DeviceType;               // Type of the device
    brand: DeviceBrand;             // Brand of the device
    model: string;                  // Model name/number
    status: DeviceStatus;           // Current connection status
    lastSeen: string;               // ISO Timestamp of the last time the device was seen online
}

export interface DeviceData {
    deviceId: string;               // ID of the device this data belongs to
    timestamp: string;              // ISO Timestamp of when the data was recorded
    powerW: number;                 // Current power in watts (positive = consuming, negative = producing)
    energyTodayWh: number;          // Energy produced/consumed today in watt-hours
    batteryLevelPercent?: number;   // Optional battery level percentage (batteries and EVs)
}

export interface RegisterDeviceRequest {
    type: DeviceType;               // Type of the device
    brand: DeviceBrand;             // Brand of the device
    model: string;                  // Model name/number
}

