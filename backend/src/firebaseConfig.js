// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0xyj5-mN4csI2HhInfB5DDZxVTVROOks",
  authDomain: "talenthunt-cff66.firebaseapp.com",
  projectId: "talenthunt-cff66",
  storageBucket: "talenthunt-cff66.firebasestorage.app",
  messagingSenderId: "1058614373553",
  appId: "1:1058614373553:web:0dc35db886ac0aaa294690",
  measurementId: "G-1NR4KQEDQF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const analytics = getAnalytics(app);

export { auth, provider, signInWithPopup, analytics };