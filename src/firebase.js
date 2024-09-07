import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAlrKe9MDKp_a13DUkbMR6UAyGUsy5tbfs",
    authDomain: "townpass-eb953.firebaseapp.com",
    projectId: "townpass-eb953",
    storageBucket: "townpass-eb953.appspot.com",
    messagingSenderId: "932582215192",
    appId: "1:932582215192:web:b38f83f9a70f5539763d6d",
    measurementId: "G-9W5RDWYBN1"
  };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics };