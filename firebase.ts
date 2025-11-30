import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDC2hMcy2l0sxIelqSHZzDGdkEdnY01Ng4",
  authDomain: "adscreen-9e56f.firebaseapp.com",
  projectId: "adscreen-9e56f",
  storageBucket: "adscreen-9e56f.firebasestorage.app",
  messagingSenderId: "10226478940",
  appId: "1:10226478940:web:5734642cbf07b35553db99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);