import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // Import pro Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyBcowRCZPE4oTfox2Be5EhT9or2wwvNEeI",
  authDomain: "hydroleaf-1105.firebaseapp.com",
  databaseURL: "https://hydroleaf-1105-default-rtdb.firebaseio.com",
  projectId: "hydroleaf-1105",
  storageBucket: "hydroleaf-1105.appspot.com",
  messagingSenderId: "397504893555",
  appId: "1:397504893555:web:c311fe869dcea8eb7a1006",
  measurementId: "G-LD251K7ZMB"
};

// Inicializace Firebase aplikace
const app = initializeApp(firebaseConfig);

// Získání instancí pro autentizaci a databázi
export const auth = getAuth(app); // Exportování autentizace
export const db = getDatabase(app); // Exportování instance Realtime Database
