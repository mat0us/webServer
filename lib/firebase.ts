import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

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

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const realtimeDb = getDatabase(app); // Pro kontroly a stavy
export const firestoreDb = getFirestore(app); // Pro data měření
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

if (typeof window !== 'undefined') {
  import('firebase/auth');
  import('firebase/database');
  import('firebase/firestore');
  import('firebase/analytics');
}
