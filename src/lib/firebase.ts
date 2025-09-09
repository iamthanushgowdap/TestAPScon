
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "apsconnect-ceraai-companion",
  "appId": "1:702024508379:web:68ab7e886fadd9e45c3dfe",
  "storageBucket": "apsconnect-ceraai-companion.appspot.com",
  "apiKey": "AIzaSyACKMwMIjrnU5ZsKhp53to9BUhMQ1jWVtY",
  "authDomain": "apsconnect-ceraai-companion.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "702024508379"
};

// Initialize Firebase
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
