// mqttClient.ts
import mqtt, { MqttClient } from 'mqtt';
import * as fs from 'fs';
import { SensorData } from '../models/SensorData';
import { sendDataToFirebase } from '../lib/sensors/firebaseSender'; // Import the function

const client: MqttClient = mqtt.connect('mqtt://192.168.1.100');
const mqttPath: string = 'test/topic';

client.on('connect', () => {
    console.log('Pďż˝ipojeno k MQTT brokeru');
    client.subscribe(mqttPath, (err) => {
        if (!err) {
            console.log(`Pďż˝ihlďż˝eno k tďż˝matu: ${mqttPath}`);
        } else {
            console.error('Chyba pďż˝i pďż˝ihlďż˝enďż˝ k tďż˝matu', err);
        }
    });
});

// Zpracovanďż˝ pďż˝ijatďż˝ch zprďż˝v
client.on('message', (topic: string, message: Buffer) => {
    console.log(`Pďż˝ijata zprďż˝va z ${topic}: ${message.toString()}`);

    try {
        const data: SensorData = JSON.parse(message.toString());
        console.log('Pďż˝ijatďż˝ data:', data);

        // Odeslat data na Firebase
        sendDataToFirebase(data); // Call the function to send data to Firebase

        // Naďż˝tenďż˝ existujďż˝cďż˝ch dat ze souboru
        fs.readFile('sensorData.json', 'utf8', (err, fileData) => {
            let sensorDataArray: SensorData[] = [];

            if (!err && fileData) {
                // Zkontrolujte, zda existujďż˝ nďż˝jakďż˝ pďż˝edchozďż˝ data
                try {
                    sensorDataArray = JSON.parse(fileData);
                } catch (parseError) {
                    console.error('Chyba pďż˝i parsovďż˝nďż˝ existujďż˝cďż˝ch dat:', parseError);
                }
            }

            // Pďż˝idďż˝nďż˝ novďż˝ho objektu do pole
            sensorDataArray.push(data);

            // Uloďż˝enďż˝ aktualizovanďż˝ho pole dat do souboru
            fs.writeFile('sensorData.json', JSON.stringify(sensorDataArray, null, 2), (err) => {
                if (err) {
                    console.error('Chyba pďż˝i uklďż˝dďż˝nďż˝ dat do souboru:', err);
                } else {
                    console.log('Data byla ďż˝spďż˝nďż˝ uloďż˝ena do souboru sensorData.json');
                }
            });
        });

    } catch (error) {
        console.error('Chyba pďż˝i zpracovďż˝nďż˝ zprďż˝vy:', error);
    }
});
