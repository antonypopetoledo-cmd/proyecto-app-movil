import { getApps, getApp, initializeApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAZGtuO1Avc-DHzRu36yBT1DXq78bcZca8",
  authDomain: "lima-go-b561c.firebaseapp.com",
  projectId: "lima-go-b561c",
  storageBucket: "lima-go-b561c.firebasestorage.app",
  messagingSenderId: "444566167342",
  appId: "1:444566167342:web:7b7ae0ed0268f2a0e364bf"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Si Expo recarga el archivo, Auth ya estaba iniciado
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);