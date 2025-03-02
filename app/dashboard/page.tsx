"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, realtimeDb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { TowerPicker } from "@/components/ui/TowerPicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Device, DeviceAccess } from "@/lib/types/device";

// Importujeme komponenty místo stránek
import GraphComponent from "./components/Graph";
import SettingsComponent from "./components/Settings";

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
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center py-3 px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center mb-3 sm:mb-0">
            <Logo className="w-8 h-8 sm:w-10 sm:h-10 mr-3" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-500">HydroLeaf</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <TowerPicker
              towers={userTowers}
              selectedTower={selectedTower}
              onTowerChange={handleTowerChange}
            />
            <Button onClick={handleSignOut} className="w-full sm:w-auto mt-3 sm:mt-0">Sign Out</Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-3 sm:p-6 md:p-8">
        <Tabs defaultValue="graph" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="mb-4">
              <TabsTrigger value="graph" className="px-4 py-2">Graph</TabsTrigger>
              <TabsTrigger value="settings" className="px-4 py-2">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="graph" className="mt-4">
            {selectedTower && <GraphComponent deviceId={selectedTower} />}
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            {sensorData && (
              <SettingsComponent sensorData={sensorData} deviceId={selectedTower} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
