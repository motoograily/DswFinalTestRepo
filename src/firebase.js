import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

// Initialize services WITHOUT persistence setup
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;