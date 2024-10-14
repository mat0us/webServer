"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ref, set, onValue } from "firebase/database";
import { SensorData } from "@/lib/model/SensorData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LeafIcon, Droplet, Thermometer, Zap } from "lucide-react";
import SensorRowInput from "@/components/ui/SenzorRow";
import ToggleRow from "@/components/ui/ToggleRow";
import { db } from "@/lib/firebase";
import { sendDataToFirebase } from "@/lib/sensors/firebaseSender";

interface ChartData {
  time: string;
  pH: number;
  tdc: number;
  temperature: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [newValues, setNewValues] = useState<{ [key: string]: number | null }>(
    {}
  );
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const router = useRouter();

  const deviceId = "ESP32-1";
  const sensorDataRef = ref(db, `sensorData/${deviceId}`);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        onValue(sensorDataRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setSensorData(data);
            const temperature = data.watertemp ?? 0;
            setChartData((prevData) =>
              [
                ...prevData,
                {
                  time: new Date().toLocaleTimeString(),
                  pH: data.pH ?? 0,
                  tdc: data.tdc ?? 0,
                  temperature,
                },
              ].slice(-10)
            );
          } else {
            console.error("No data found or access denied.");
          }
        });
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const toggleDevice = (deviceKey: string, value: boolean) => {
    const deviceRef = ref(db, `sensorData/${deviceId}`);

    set(deviceRef, {
      ...sensorData,
      [deviceKey]: value,
    })
      .then(() => {
        console.log(`${deviceKey} updated to ${value} in Firebase.`);
        setSensorData((prevData) =>
          prevData ? { ...prevData, [deviceKey]: value } : null
        );
      })
      .catch((error) => {
        console.error("Error updating sensor data:", error);
      });
  };

  const handleInputChange = (key: string, value: string) => {
    const parsedValue = parseFloat(value);
    const newValue = isNaN(parsedValue) ? 0 : parsedValue;

    setNewValues((prev) => ({
      ...prev,
      [key]: value === "" ? null : newValue,
    }));
  };

  const confirmAllValuesChange = () => {
    const deviceRef = ref(db, `sensorData/${deviceId}`);

    if (sensorData) {
      const updatedSensorData = {
        ...sensorData,
        ...newValues,
      };

      set(deviceRef, updatedSensorData)
        .then(() => {
          console.log("Sensor data updated:", updatedSensorData);
          setSensorData(updatedSensorData);
          setNewValues({});
        })
        .catch((error) => {
          console.error("Error updating sensor data:", error);
        });
    } else {
      console.error("Sensor data is not available.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <LeafIcon className="w-10 h-10 text-green-600 mr-2" />
            <h1 className="text-3xl font-bold text-green-800">
              HydroLeaf Dashboard
            </h1>
          </div>
          <Button onClick={handleLogout}>Odhlásit se</Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {sensorData && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">pH</CardTitle>
                  <Droplet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sensorData.pH ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">EC</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sensorData.tdc ?? 0} mS/cm
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Teplota</CardTitle>
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sensorData.outsidetemp ?? 0} °C
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Hladina vody
                  </CardTitle>
                  <Droplet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sensorData.waterLevel ?? 0} cm
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Tabs defaultValue="graph" className="space-y-4">
          <TabsList>
            <TabsTrigger value="graph">Graf</TabsTrigger>
            <TabsTrigger value="settings">Nastavení</TabsTrigger>
          </TabsList>
          <TabsContent value="graph" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historická data</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="pH" stroke="#8884d8" />
                    <Line type="monotone" dataKey="tdc" stroke="#82ca9d" />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ff7300"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Nastavení</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sensorData && (
                    <>
                      <ToggleRow
                        title="LED 1"
                        subtitle=""
                        isChecked={sensorData.led1 ?? false}
                        onToggle={(checked) => toggleDevice("led1", checked)}
                      />
                      <ToggleRow
                        title="LED 2"
                        subtitle=""
                        isChecked={sensorData.led2 ?? false}
                        onToggle={(checked) => toggleDevice("led2", checked)}
                      />
                      <ToggleRow
                        title="LED 3"
                        subtitle=""
                        isChecked={sensorData.led3 ?? false}
                        onToggle={(checked) => toggleDevice("led3", checked)}
                      />
                      <ToggleRow
                        title="Čerpadlo"
                        subtitle=""
                        isChecked={sensorData.waterPump ?? false}
                        onToggle={(checked) =>
                          toggleDevice("waterPump", checked)
                        }
                      />

                      <SensorRowInput
                        title="pH"
                        value={(newValues.pH ?? sensorData.pH ?? 0).toString()}
                        onChange={(value) => handleInputChange("pH", value)}
                      />
                      <SensorRowInput
                        title="EC"
                        value={(
                          newValues.tdc ??
                          sensorData.tdc ??
                          0
                        ).toString()}
                        onChange={(value) => handleInputChange("tdc", value)}
                      />
                      <SensorRowInput
                        title="Teplota"
                        value={(
                          newValues.outsidetemp ??
                          sensorData.outsidetemp ??
                          0
                        ).toString()}
                        onChange={(value) =>
                          handleInputChange("outsidetemp", value)
                        }
                      />
                      <SensorRowInput
                        title="Hladina vody"
                        value={(
                          newValues.waterLevel ??
                          sensorData.waterLevel ??
                          0
                        ).toString()}
                        onChange={(value) =>
                          handleInputChange("waterLevel", value)
                        }
                      />
                    </>
                  )}
                </div>
                <div className="flex justify-center my-2">
                  <Button
                    onClick={confirmAllValuesChange}
                    className="px-10 py-3 text-lg font-bold"
                  >
                    Uložit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
