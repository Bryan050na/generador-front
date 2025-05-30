import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCxHTluDwl1YQD-IDDQeV4tYaqbKRYxhNk",
  authDomain: "diagramainador.firebaseapp.com",
  projectId: "diagramainador",
  storageBucket: "diagramainador.firebasestorage.app",
  messagingSenderId: "278816985303",
  appId: "1:278816985303:web:c8203aa8965eac6c25e092",
  measurementId: "G-DC0W1NRYCY",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
