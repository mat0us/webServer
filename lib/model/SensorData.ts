// SensorData.ts
export interface SensorData {
    deviceId: string;
    led1: boolean;
    led2: boolean;
    led3: boolean;
    waterPump: boolean;
    waterLevel: number | null;
    watertemp: number | null;
    outsidetemp: number | null;
    pH: number | null;
    tdc: number | null;
    light: number | null;

    // Přidání indexového podpisu
    [key: string]: boolean | number | null | string; // Typy podle potřeby
}
