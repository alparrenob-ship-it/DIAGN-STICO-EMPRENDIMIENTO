import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { addDoc, collection, doc, getFirestore, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

let services;

function getServices() {
  if (!isFirebaseConfigured()) return null;
  if (!services) {
    const app = initializeApp(firebaseConfig);
    services = { auth: getAuth(app), db: getFirestore(app) };
  }
  return services;
}

async function ensureStudentSession(auth) {
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export async function saveDiagnosticResult(result) {
  const current = getServices();
  if (!current) return { configured: false, id: null };
  const user = await ensureStudentSession(current.auth);
  const reference = await addDoc(collection(current.db, "diagnosticResults"), {
    ...result,
    ownerUid: user.uid,
    bonusUnlocked: false,
    reflection: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    schemaVersion: 1
  });
  return { configured: true, id: reference.id };
}

export async function saveBonusReflection(resultId, reflection) {
  const current = getServices();
  if (!current || !resultId) return { configured: false };
  await updateDoc(doc(current.db, "diagnosticResults", resultId), {
    reflection,
    bonusUnlocked: true,
    updatedAt: serverTimestamp()
  });
  return { configured: true };
}
