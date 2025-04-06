import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgQvwB6J8qIlws_V-4Ro8ZBu0ssZOBA9Q",
  authDomain: "tickease-2454.firebaseapp.com",
  projectId: "tickease-2454",
  storageBucket: "tickease-2454.firebasestorage.app",
  messagingSenderId: "218774688655",
  appId: "1:218774688655:web:30286c4d8624d6ba33f1fa",
  measurementId: "G-QEB19BMS29",
  databaseURL: "https://tickease-2454-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };