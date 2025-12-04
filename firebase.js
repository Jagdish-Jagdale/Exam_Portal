// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAz8UZ1CFfkzMLcDiNqcWoTmJZBaSLW-m8",
  authDomain: "exam-portal-d203a.firebaseapp.com",
  projectId: "exam-portal-d203a",
  storageBucket: "exam-portal-d203a.firebasestorage.app",
  messagingSenderId: "923774765368",
  appId: "1:923774765368:web:b740107df9d46366ba99cd"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);