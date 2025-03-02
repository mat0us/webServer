import { realtimeDb as db, auth } from "../firebase";
import { ref, onValue, get } from "firebase/database";
import { SensorData } from "../model/SensorData"; // Adjust the import path as necessary
import { onAuthStateChanged } from "firebase/auth";

export const fetchSensorData = (deviceId: string, callback: (data: SensorData | null) => void) => {
  onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed:", user);
    if (user) {
      const userId = user.uid;
      console.log("Authenticated user ID:", userId);

      const sensorDataRef = ref(db, `sensorData/${deviceId}`);
      get(sensorDataRef).then((snapshot) => {
        if (snapshot.exists()) {
          const deviceData = snapshot.val();
          console.log("Fetched device data:", deviceData);

          // Check if the ownerId matches the authenticated user's ID
          if (deviceData.ownerId === userId) {
            console.log("Device belongs to the user. Returning data.");
            callback(deviceData as SensorData); // Cast the data to SensorData
          } else {
            console.error("Access denied: Device does not belong to the user.");
            callback(null);
          }
        } else {
          console.error("Device not found for deviceId:", deviceId);
          callback(null);
        }
      }).catch((error) => {
        console.error("Error fetching sensor data:", error);
        callback(null);
      });
    } else {
      console.error("User is not authenticated.");
      callback(null);
    }
  });
};
