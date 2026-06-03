import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyAQ-bk8rp2reJUBj7cQEDvZNNcOcHuRsvc",
  authDomain: "platillo-ce5e1.firebaseapp.com",
  projectId: "platillo-ce5e1",
  storageBucket: "platillo-ce5e1.firebasestorage.app",
  messagingSenderId: "341398055821",
  appId: "1:341398055821:web:21baf6be6ca64d0b092bc4",
  measurementId: "G-XMPC0JW20W"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);