// Configuración pública de la app web de Firebase.
// Sustituye estos valores con los de: Firebase Console → Configuración del proyecto → Tus apps.
export const firebaseConfig = {
  apiKey: "REEMPLAZAR_API_KEY",
  authDomain: "REEMPLAZAR_PROJECT_ID.firebaseapp.com",
  projectId: "REEMPLAZAR_PROJECT_ID",
  storageBucket: "REEMPLAZAR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "REEMPLAZAR_MESSAGING_SENDER_ID",
  appId: "REEMPLAZAR_APP_ID"
};

// Cuenta de Google que tendrá permiso de lectura en el dashboard.
// Usa exactamente el mismo correo también en firestore.rules.
export const TEACHER_EMAIL = "REEMPLAZAR_CORREO_DOCENTE";

export const isFirebaseConfigured = () =>
  !Object.values(firebaseConfig).some(value => value.includes("REEMPLAZAR")) &&
  !TEACHER_EMAIL.includes("REEMPLAZAR");
