"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, realtimeDb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { TowerPicker } from "@/components/ui/TowerPicker";
import GraphPage from "./graph/page";
import SettingsPage from "./settings/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Device, DeviceAccess } from "@/lib/types/device";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [userTowers, setUserTowers] = useState<Array<DeviceAccess & { name: string }>>([]);
  const [selectedTower, setSelectedTower] = useState<string>("");
  const [sensorData, setSensorData] = useState<Device | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Load devices for the logged-in user
        const deviceAccessRef = ref(realtimeDb, "deviceAccess");
        const devicesRef = ref(realtimeDb, "devices");

        // Load device access for the user
        onValue(deviceAccessRef, (accessSnapshot) => {
          const accessData = accessSnapshot.val() as Record<string, DeviceAccess>;

          if (accessData) {
            // Load device data after user access
            onValue(devicesRef, (devicesSnapshot) => {
              const devicesData = devicesSnapshot.val() as Record<string, Device>;

              if (devicesData) {
                const userDevices = Object.values(accessData)
                  .filter((device) => device.userId === currentUser.email)
                  .map((device) => ({
                    ...device,
                    name: devicesData[device.deviceId]?.name || device.deviceId,
                  }));

                setUserTowers(userDevices);
                if (userDevices.length > 0) {
                  setSelectedTower(userDevices[0].deviceId);
                }
              }
            });
          }
        });
      } else {
        router.push("/login"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (selectedTower) {
      const deviceRef = ref(realtimeDb, `devices/${selectedTower}`);
      onValue(deviceRef, (snapshot) => {
        const data = snapshot.val() as Device;
        if (data) {
          setSensorData(data);
        }
      });
    }
  }, [selectedTower]);

  const handleTowerChange = (towerId: string) => {
    setSelectedTower(towerId);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/login"); // Redirect to login on sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gradient">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full bg-white shadow-md">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center py-4 px-4 sm:px-0">
          <div className="flex items-center justify-center w-full sm:w-auto">
            <Logo className="w-8 h-8 sm:w-10 sm:h-10 mx-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-green-500">HydroLeaf</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center sm:justify-end mt-4 sm:mt-0">
            <TowerPicker
              towers={userTowers}
              selectedTower={selectedTower}
              onTowerChange={handleTowerChange}
            />
            <Button onClick={handleSignOut} className="w-full sm:w-auto mx-4">Sign Out</Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        <Tabs defaultValue="graph" className="space-y-4">
          <TabsList>
            <TabsTrigger value="graph">Graph</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="graph">
            {selectedTower && <GraphPage deviceId={selectedTower} />}
          </TabsContent>

          <TabsContent value="settings">
            {sensorData && (
              <SettingsPage sensorData={sensorData} deviceId={selectedTower} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
