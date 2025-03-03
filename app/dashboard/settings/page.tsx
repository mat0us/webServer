"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ToggleRow from "@/components/ui/ToggleRow";
import {
  Device,
  DeviceControlKey,
  timeControlDevices,
  delayControlDevices,
  isTimeControl,
  isDelayControl,
} from "@/lib/types/device";
import { ref, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { useEffect } from "react";

interface TimeRange {
  start: string;
  end: string;
  isPeriodic?: boolean;
  periodicity?: number; // in minutes
}

interface SettingsComponentProps {
  sensorData: Device;
  deviceId: string;
}

function SettingsComponent({
  sensorData,
  deviceId,
}: SettingsComponentProps) {
  const getDefaultDevice = (key: DeviceControlKey) => {
    if (isTimeControl(key)) {
      return {
        state: false,
        timeRanges: []
      };
    } else {
      return {
        state: false,
        delay: "10" // 10 seconds default for all peristaltic pumps
      };
    }
  };

  useEffect(() => {
    const initializeDevices = async () => {
      try {
        for (const key of delayControlDevices) {
          const device = sensorData.configuration.control[key];
          if (!device) {
            const controlRef = ref(
              realtimeDb,
              `devices/${deviceId}/configuration/control/${key}`
            );
            await set(controlRef, getDefaultDevice(key));
          }
        }
      } catch (error) {
        console.error("Chyba při inicializaci zařízení:", error);
      }
    };

    initializeDevices();
  }, [deviceId, sensorData]);

  const handleDeviceUpdate = async (
    deviceKey: DeviceControlKey,
    isChecked: boolean,
    timeRanges?: TimeRange[]
  ) => {
    try {
      const controlRef = ref(
        realtimeDb,
        `devices/${deviceId}/configuration/control/${deviceKey}`
      );

      const device = sensorData.configuration.control[deviceKey] || getDefaultDevice(deviceKey);

      if (isTimeControl(deviceKey)) {
        await set(controlRef, {
          ...device,
          state: isChecked,
          timeRanges: timeRanges || [],
        });
      } else if (isDelayControl(deviceKey)) {
        await set(controlRef, {
          ...device,
          state: isChecked,
        });
      }
    } catch (error) {
      console.error("Chyba při aktualizaci zařízení:", error);
    }
  };

  const handleTimeRangeAdd = async (deviceKey: DeviceControlKey, range: TimeRange | TimeRange[]) => {
    try {
      if (!isTimeControl(deviceKey)) return;
      
      const device = sensorData.configuration.control[deviceKey] || getDefaultDevice(deviceKey);
      const currentRanges = device.timeRanges || [];
      const controlRef = ref(
        realtimeDb,
        `devices/${deviceId}/configuration/control/${deviceKey}`
      );

      // Handle both single range and array of ranges
      const newRanges = Array.isArray(range) 
        ? [...currentRanges, ...range]
        : [...currentRanges, range];

      await set(controlRef, {
        ...device,
        timeRanges: newRanges,
      });
    } catch (error) {
      console.error("Chyba při přidání časového intervalu:", error);
    }
  };

  const handleTimeRangeDelete = async (deviceKey: DeviceControlKey, index: number) => {
    try {
      if (!isTimeControl(deviceKey)) return;
      
      const device = sensorData.configuration.control[deviceKey] || getDefaultDevice(deviceKey);
      const currentRanges = [...(device.timeRanges || [])];
      currentRanges.splice(index, 1);
      
      const controlRef = ref(
        realtimeDb,
        `devices/${deviceId}/configuration/control/${deviceKey}`
      );

      await set(controlRef, {
        ...device,
        timeRanges: currentRanges,
      });
    } catch (error) {
      console.error("Chyba při smazání časového intervalu:", error);
    }
  };

  const handleTimeRangeDeleteAll = async (deviceKey: DeviceControlKey) => {
    try {
      if (!isTimeControl(deviceKey)) return;
      
      const device = sensorData.configuration.control[deviceKey] || getDefaultDevice(deviceKey);
      const controlRef = ref(
        realtimeDb,
        `devices/${deviceId}/configuration/control/${deviceKey}`
      );

      await set(controlRef, {
        ...device,
        timeRanges: [],
      });
    } catch (error) {
      console.error("Chyba při smazání všech časových intervalů:", error);
    }
  };

  const handleRunTimeChange = async (deviceKey: DeviceControlKey, seconds: number) => {
    try {
      if (!isDelayControl(deviceKey)) return;

      const controlRef = ref(
        realtimeDb,
        `devices/${deviceId}/configuration/control/${deviceKey}`
      );

      const device = sensorData.configuration.control[deviceKey] || getDefaultDevice(deviceKey);
      await set(controlRef, {
        ...device,
        delay: seconds.toString()
      });
    } catch (error) {
      console.error("Chyba při aktualizaci doby běhu:", error);
    }
  };

  const handleConfirm = async (deviceKey: DeviceControlKey) => {
    try {
      const device = sensorData.configuration.control[deviceKey] || getDefaultDevice(deviceKey);
      const controlRef = ref(
        realtimeDb,
        `devices/${deviceId}/configuration/control/${deviceKey}`
      );
      await set(controlRef, device);
    } catch (error) {
      console.error("Chyba při potvrzení nastavení:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nastavení zařízení</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">LED osvětlení</h3>
          <div className="space-y-6">
            {timeControlDevices.slice(0, 3).map((key, index) => {
              const device = sensorData.configuration.control[key] || getDefaultDevice(key);
              return (
                <ToggleRow
                  key={key}
                  title={`LED ${index + 1}`}
                  mode="timeRange"
                  isChecked={device.state}
                  timeRanges={device.timeRanges || []}
                  onToggle={(checked, ranges) =>
                    handleDeviceUpdate(key, checked, ranges)
                  }
                  onTimeRangeAdd={(range) => handleTimeRangeAdd(key, range)}
                  onTimeRangeDelete={(index) => handleTimeRangeDelete(key, index)}
                  onTimeRangeDeleteAll={() => handleTimeRangeDeleteAll(key)}
                  onConfirm={() => handleConfirm(key)}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hlavní pumpa</h3>
          <div className="space-y-6">
            {timeControlDevices.slice(3, 4).map((key) => {
              const device = sensorData.configuration.control[key] || getDefaultDevice(key);
              return (
                <ToggleRow
                  key={key}
                  title="Hlavní pumpa"
                  mode="timeRange"
                  isChecked={device.state}
                  timeRanges={device.timeRanges || []}
                  onToggle={(checked, ranges) =>
                    handleDeviceUpdate(key, checked, ranges)
                  }
                  onTimeRangeAdd={(range) => handleTimeRangeAdd(key, range)}
                  onTimeRangeDelete={(index) => handleTimeRangeDelete(key, index)}
                  onTimeRangeDeleteAll={() => handleTimeRangeDeleteAll(key)}
                  onConfirm={() => handleConfirm(key)}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Peristaltická pumpa</h3>
          <div className="space-y-6">
            {delayControlDevices.map((key, index) => {
              const device = sensorData.configuration.control[key] || getDefaultDevice(key);
              return (
                <ToggleRow
                  key={key}
                  title={`Peristaltická pumpa ${index + 1}`}
                  mode="peristaltic"
                  isChecked={device.state}
                  runTime={parseInt(device.delay)}
                  onRunTimeChange={(seconds) => handleRunTimeChange(key, seconds)}
                  onToggle={(checked) => handleDeviceUpdate(key, checked)}
                  onConfirm={() => handleConfirm(key)}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Toto je hlavní exportovaná stránka, která bude kompatibilní s Next.js
export default function Page() {
  return null;
}
