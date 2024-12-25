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

interface SettingsPageProps {
  sensorData: Device;
  deviceId: string;
}

export default function SettingsPage({
  sensorData,
  deviceId,
}: SettingsPageProps) {
  const handleDeviceUpdate = async (
    deviceKey: DeviceControlKey,
    isChecked: boolean,
    timeMode?: "always" | "time",
    timeFrom?: string,
    timeTo?: string
  ) => {
    try {
      const controlRef = ref(
        realtimeDb,
        `devices/${deviceId}/configuration/control/${deviceKey}`
      );

      const device = sensorData.configuration.control[deviceKey];

      if (isTimeControl(deviceKey)) {
        await set(controlRef, {
          ...device,
          state: isChecked,
          ...(timeMode === "always"
            ? {
                startTime: "00:00",
                endTime: "23:59",
                isAllDay: true,
              }
            : timeFrom && timeTo
            ? {
                startTime: timeFrom,
                endTime: timeTo,
                isAllDay: false,
              }
            : {}),
        });
      } else {
        await set(controlRef, {
          ...device,
          state: isChecked,
        });
      }
    } catch (error) {
      console.error("Chyba při aktualizaci zařízení:", error);
    }
  };

  const handleDelayUpdate = async (
    deviceKey: DeviceControlKey,
    delay: string
  ) => {
    try {
      const controlRef = ref(
        realtimeDb,
        `devices/${deviceId}/configuration/control/${deviceKey}`
      );

      if (isDelayControl(deviceKey)) {
        const device = sensorData.configuration.control[deviceKey];
        await set(controlRef, {
          ...device,
          delay,
        });
      }
    } catch (error) {
      console.error("Chyba při aktualizaci zpoždění:", error);
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
              const device = sensorData.configuration.control[key];
              return (
                <ToggleRow
                  key={key}
                  title={`LED ${index + 1}`}
                  subtitle="Časování"
                  isChecked={device.state}
                  onToggle={(checked, timeMode, timeFrom, timeTo) =>
                    handleDeviceUpdate(key, checked, timeMode, timeFrom, timeTo)
                  }
                  initialTimeMode={device.isAllDay ? "always" : "time"}
                  initialTimeFrom={device.startTime}
                  initialTimeTo={device.endTime}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Čerpadla</h3>
          <div className="space-y-6">
            {/* Hlavní čerpadlo */}
            {timeControlDevices.slice(3).map((key) => {
              const device = sensorData.configuration.control[key];
              return (
                <ToggleRow
                  key={key}
                  title="Hlavní čerpadlo"
                  subtitle="Časování"
                  isChecked={device.state}
                  onToggle={(checked, timeMode, timeFrom, timeTo) =>
                    handleDeviceUpdate(key, checked, timeMode, timeFrom, timeTo)
                  }
                  initialTimeMode={device.isAllDay ? "always" : "time"}
                  initialTimeFrom={device.startTime}
                  initialTimeTo={device.endTime}
                />
              );
            })}

            {/* Peristaltická čerpadla */}
            {delayControlDevices.map((key, index) => {
              const device = sensorData.configuration.control[key];
              return (
                <ToggleRow
                  key={key}
                  title={`Peristaltické čerpadlo ${index + 1}`}
                  subtitle={`Zpoždění: ${device.delay}ms`}
                  isChecked={device.state}
                  onToggle={(checked) => handleDeviceUpdate(key, checked)}
                  showDelay
                  initialDelay={device.delay}
                  onDelayChange={(delay) => handleDelayUpdate(key, delay)}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
