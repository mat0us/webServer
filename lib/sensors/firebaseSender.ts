// firebaseSender.ts
import { db } from '../firebase'; // Adjust the path as necessary
import { ref, set } from 'firebase/database';
import { SensorData } from '../model/SensorData';

export const sendDataToFirebase = async (data: SensorData) => {
    // Create a valid path using a unique identifier instead of a timestamp
    const sensorId = data.deviceId || 'unknown_sensor'; // Use sensorId or a fallback
    const path = `sensorData/${sensorId}`;

    try {
        // Sending data to Firebase
        await set(ref(db, path), data);
        console.log('Data byla uspesne odeslana na Firebase:', data);
    } catch (error) {
        console.error('Chyba pri odesilani dat na Firebase:', error);
    }
};
