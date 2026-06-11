import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Restaurante

export async function getRestaurant(slug) {
  const q = query(collection(db, "restaurants"), where("slug", "==", slug));
  const snap = await getDocs(q);

  if (snap.empty) return null;

  const doc = snap.docs[0]; // el primer documento que coincide
  const data = doc.data();

  return {
    id: doc.id, // 🔹 agregamos el ID
    ...data,
    location: data.location
      ? {
          lat: data.location.latitude,
          lng: data.location.longitude,
        }
      : null,
  };
}

// Productos

// Productos
export async function getProducts(id) {
  const q = query(collection(db, "products"), where("restaurantId", "==", id));
  const snap = await getDocs(q);
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => a.id.localeCompare(b.id)); // más antiguo primero
}