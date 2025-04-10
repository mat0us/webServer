"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { firestoreDb } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  Timestamp,
} from "firebase/firestore";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { startOfDay, subDays, subWeeks, subMonths } from "date-fns";

interface SensorData {
  ambientLight: number;
  humidity: number;
  ph: number;
  tds: number;
  temperature: number;
  waterLevel: number;
  waterTemperature: number;
}

interface DataPoint extends SensorData {
  timestamp: Date;
  time: string;
}

type TimeRange = "day" | "week" | "month" | "all";

// Přidáme typy pro popisky časových rozsahů
const timeRangeLabels: Record<TimeRange, string> = {
  day: "Den",
  week: "Týden",
  month: "Měsíc",
  all: "Vše",
};

interface GraphComponentProps {
  deviceId: string;
}

function GraphComponent({ deviceId }: GraphComponentProps) {
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("day");
  const [allData, setAllData] = useState<DataPoint[]>([]);

  const filterDataByTimeRange = (data: DataPoint[], range: TimeRange) => {
    if (data.length === 0) return [];

    // Najdeme nejnovější datum v datech
    const latestDate = new Date(
      Math.max(...data.map((item) => item.timestamp.getTime()))
    );
    let filterDate = latestDate;

    switch (range) {
      case "day":
        filterDate = subDays(latestDate, 1);
        break;
      case "week":
        filterDate = subWeeks(latestDate, 1);
        break;
      case "month":
        filterDate = subMonths(latestDate, 1);
        break;
      case "all":
        return data;
    }

    console.log("Filtrování dat:", {
      latestDate,
      filterDate,
      totalPoints: data.length,
    });

    const filteredData = data.filter((item) => item.timestamp >= filterDate);

    console.log("Výsledek filtrování:", {
      filteredPoints: filteredData.length,
      firstDate: filteredData[0]?.timestamp,
      lastDate: filteredData[filteredData.length - 1]?.timestamp,
    });

    return filteredData;
  };

  const formatTimeByRange = (date: Date, range: TimeRange) => {
    switch (range) {
      case "day":
        return format(date, "HH:mm", { locale: cs });
      case "week":
        return format(date, "E HH:mm", { locale: cs });
      case "month":
      case "all":
        return format(date, "d.M. HH:mm", { locale: cs });
    }
  };

  useEffect(() => {
    if (!deviceId) return;

    setLoading(true);
    setError(null);

    const recordsRef = collection(firestoreDb, "devices", deviceId, "records");
    console.log("Připojuji se k Firestore kolekci:", recordsRef.path);

    const recordsQuery = query(recordsRef);

    const unsubscribe = onSnapshot(recordsQuery, (snapshot) => {
      try {
        console.log("Počet dokumentů:", snapshot.docs.length);
        console.log(
          "Dokumenty:",
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
        );

        const readings = snapshot.docs.map((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate() || new Date(doc.id);

          const reading = {
            ambientLight: data.ambientLight || 0,
            humidity: data.humidity || 0,
            ph: data.ph || 0,
            tds: data.tds || 0,
            temperature: data.temperature || 0,
            waterLevel: data.waterLevel || 0,
            waterTemperature: data.waterTemperature || 0,
            timestamp,
            time: formatTimeByRange(timestamp, timeRange),
          } as DataPoint;

          console.log("Zpracovaný záznam:", {
            id: doc.id,
            original: data,
            processed: reading,
          });

          return reading;
        });

        // Seřadíme data podle času
        const sortedReadings = readings.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        console.log("Seřazená data:", {
          count: sortedReadings.length,
          first: sortedReadings[0],
          last: sortedReadings[sortedReadings.length - 1],
        });

        if (sortedReadings.length > 0) {
          setCurrentData(sortedReadings[sortedReadings.length - 1]);
          setAllData(sortedReadings);

          // Filtrujeme a formátujeme data pro graf
          const filteredData = filterDataByTimeRange(sortedReadings, timeRange);
          console.log("Filtrovaná data:", {
            timeRange,
            count: filteredData.length,
            first: filteredData[0],
            last: filteredData[filteredData.length - 1],
          });

          const formattedData = filteredData.map((item) => ({
            ...item,
            time: formatTimeByRange(item.timestamp, timeRange),
          }));

          console.log("Formátovaná data pro graf:", {
            count: formattedData.length,
            first: formattedData[0],
            last: formattedData[formattedData.length - 1],
          });

          setChartData(formattedData);
        }

        setLoading(false);
      } catch (err) {
        console.error("Chyba při načítání dat:", err);
        console.error("Stack:", err instanceof Error ? err.stack : undefined);
        setError("Nepodařilo se načíst data");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [deviceId, timeRange]);

  useEffect(() => {
    console.log("Aktuální data:", currentData);
    console.log("Data v grafu:", chartData);
    console.log("Všechna data:", allData);
  }, [currentData, chartData, allData]);

  const handleTimeRangeChange = (range: TimeRange) => {
    setChartLoading(true);
    setTimeRange(range);

    setTimeout(() => {
      setChartLoading(false);
    }, 300);
  };

  return (
    <div className="space-y-4">
      {/* Karty s aktuálními hodnotami */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/10 backdrop-blur-lg">
              <CardContent className="p-4">
                <div className="h-16 animate-pulse bg-gray-200/20 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        currentData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-lg">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">VLHKOST</div>
                <div className="text-2xl font-bold">
                  {currentData.humidity.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">EC</div>
                <div className="text-2xl font-bold">
                  {currentData.tds.toFixed(0)} ppm
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Teplota okolí
                </div>
                <div className="text-2xl font-bold">
                  {currentData.temperature.toFixed(1)} °C
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  OSVĚTLENÍ
                </div>
                <div className="text-2xl font-bold">
                  {currentData.ambientLight.toFixed(0)} lux
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Graf */}
      {(chartData.length > 0 || loading) && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <CardTitle>Historická data</CardTitle>
            <div className="w-full sm:w-auto grid grid-cols-2 sm:flex gap-2">
              {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  className="w-full sm:w-20"
                  onClick={() => handleTimeRangeChange(range)}
                  disabled={loading || chartLoading}
                >
                  {timeRangeLabels[range]}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[600px] h-[350px]">
                {loading || chartLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100/5">
                    <div className="animate-pulse-scale">
                      <Logo size={48} className="text-green-500/50" />
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 12 }} width={40} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#8884d8"
                        name="Vlhkost"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="tds"
                        stroke="#82ca9d"
                        name="EC"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#ff7300"
                        name="Teplota okolí"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="ambientLight"
                        stroke="#0088FE"
                        name="Osvětlení"
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

// Toto je hlavní exportovaná stránka, která bude kompatibilní s Next.js
export default function Page() {
  return null;
}
