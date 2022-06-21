// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApbCdYpSAYxqQiYYFEKuAd4r7oS6XwmVM",
  authDomain: "housemarketplace-9456a.firebaseapp.com",
  projectId: "housemarketplace-9456a",
  storageBucket: "housemarketplace-9456a.appspot.com",
  messagingSenderId: "1006502943049",
  appId: "1:1006502943049:web:cf9d61a75f09bedb20a298",
  measurementId: "G-5ND4ZWYDZN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();
const analytics = getAnalytics(app);
