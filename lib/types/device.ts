export interface DeviceAccess {
  deviceId: string;
  role: string;
  timestamp: string;
  userId: string;
}

interface TimeControl {
  endTime: string;
  startTime: string;
  state: boolean;
  isAllDay?: boolean;
}

interface DelayControl {
  delay: string;
  state: boolean;
}

interface DeviceControl {
  led1: TimeControl;
  led2: TimeControl;
  led3: TimeControl;
  pump: TimeControl;
  peristatic1: DelayControl;
  peristatic2: DelayControl;
  peristatic3: DelayControl;
}

interface DeviceConfiguration {
  alerts: {
    ph: { max: number; min: number };
    tds: { max: number; min: number };
    temperature: { max: number; min: number };
  };
  control: DeviceControl;
}

export interface Device {
  name: string;
  deviceId: string;
  configuration: DeviceConfiguration;
  readings: {
    ambientLight: number;
    humidity: number;
    ph: number;
    tds: number;
    temperature: number;
    waterLevel: number;
    waterTemperature: number;
  };
}

export type DeviceControlKey = keyof DeviceControl;

export const timeControlDevices = ["led1", "led2", "led3", "pump"] as const;
export const delayControlDevices = ["peristatic1", "peristatic2", "peristatic3"] as const;

export type TimeControlKey = typeof timeControlDevices[number];
export type DelayControlKey = typeof delayControlDevices[number];

export function isTimeControl(key: DeviceControlKey): key is TimeControlKey {
  return timeControlDevices.includes(key as TimeControlKey);
}

export function isDelayControl(key: DeviceControlKey): key is DelayControlKey {
  return delayControlDevices.includes(key as DelayControlKey);
} 