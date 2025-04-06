// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase only if it hasn't been initialized
let app;
let analytics;
let database;

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  database = getDatabase(app);
  console.log('Firebase initialized with database URL:', firebaseConfig.databaseURL);
}

export { app, analytics, database };