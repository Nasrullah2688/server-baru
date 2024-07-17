import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBeVZY_7LHNx6e18juP523mOD1VRHbJ40k",
  authDomain: "evehand-fd9fa.firebaseapp.com",
  projectId: "evehand-fd9fa",
  storageBucket: "evehand-fd9fa.appspot.com",
  messagingSenderId: "415757293358",
  appId: "1:415757293358:web:5abc66d8a74fe08b510cbf"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);