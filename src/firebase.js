import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCND4NKjR6cXV5kHF0xO5YTeAN9quA7gy0",
  authDomain: "hotel-bookings-11ff4.firebaseapp.com",
  projectId: "hotel-bookings-11ff4",
  storageBucket: "hotel-bookings-11ff4.firebasestorage.app",
  messagingSenderId: "607884698871",
  appId: "1:607884698871:web:6ab7c7fed608bd560f1ff2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with persistent storage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;
