// Configuración pública de la app web de Firebase.
// Sustituye estos valores con los de: Firebase Console → Configuración del proyecto → Tus apps.
export const firebaseConfig = {
  apiKey: "AIzaSyCppYxsRXhffrYNbw-76_qEaREQZtRKYRI",
  authDomain: "mision-emprende-diagn.firebaseapp.com",
  projectId: "mision-emprende-diagn",
  storageBucket: "mision-emprende-diagn.firebasestorage.app",
  messagingSenderId: "397240214514",
  appId: "1:397240214514:web:8e6379fb707fea1453816b"
};

// Cuenta de Google que tendrá permiso de lectura en el dashboard.
// Usa exactamente el mismo correo también en firestore.rules.
export const TEACHER_EMAIL = "alparrenob@eightacademy.edu.ec";

export const isFirebaseConfigured = () =>
  !Object.values(firebaseConfig).some(value => value.includes("REEMPLAZAR")) &&
  !TEACHER_EMAIL.includes("REEMPLAZAR");
