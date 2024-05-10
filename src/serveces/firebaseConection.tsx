import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBChVSoIUd5q-VzsWBxqstUz8xdnUHqOrw",
  authDomain: "carros-a6d25.firebaseapp.com",
  projectId: "carros-a6d25",
  storageBucket: "carros-a6d25.appspot.com",
  messagingSenderId: "862143900882",
  appId: "1:862143900882:web:89a617da6c8262ab2e510b"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export {
  db,
  auth,
  storage
};
