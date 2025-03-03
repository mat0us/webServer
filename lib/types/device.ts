export interface DeviceAccess {
  deviceId: string;
  role: string;
  timestamp: string;
  userId: string;
}

interface TimeRange {
  start: string;
  end: string;
  isPeriodic?: boolean;
  periodicity?: number; // in minutes
}

interface TimeControl {
  state: boolean;
  name?: string;
  timeRanges?: TimeRange[];
}

interface DelayControl {
  delay: string;
  state: boolean;
  name?: string;
}

interface DeviceControl {
  led1: TimeControl;
  led2: TimeControl;
  led3: TimeControl;
  pump: TimeControl;
  peristatic1: DelayControl;
  peristatic2: DelayControl;
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
export type TimeControlKey = "led1" | "led2" | "led3" | "pump";
export type DelayControlKey = "peristatic1" | "peristatic2";

export const timeControlDevices = ["led1", "led2", "led3", "pump"] as const;
export const delayControlDevices = ["peristatic1", "peristatic2"] as const;

export function isTimeControl(key: DeviceControlKey): key is TimeControlKey {
  return timeControlDevices.includes(key as TimeControlKey);
}

export function isDelayControl(key: DeviceControlKey): key is DelayControlKey {
  return delayControlDevices.includes(key as DelayControlKey);
}