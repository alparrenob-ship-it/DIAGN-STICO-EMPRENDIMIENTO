import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { collection, getDocs, getFirestore, orderBy, query } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured, TEACHER_EMAIL } from "./firebase-config.js";

const $ = selector => document.querySelector(selector);
let auth;
let db;
let allResults = [];
let filteredResults = [];

function showLogin(message, error = false) {
  $("#loginView").classList.remove("is-hidden");
  $("#dashboardView").classList.add("is-hidden");
  $("#logoutButton").classList.add("is-hidden");
  $("#teacherIdentity").textContent = "";
  $("#loginMessage").textContent = message;
  $("#loginMessage").classList.toggle("is-error", error);
}

function csvSafe(value) {
  const text = String(value ?? "").replaceAll('"', '""');
  return `"${text}"`;
}

function formatDate(timestamp) {
  const date = timestamp?.toDate ? timestamp.toDate() : null;
  return date ? new Intl.DateTimeFormat("es-EC", { dateStyle: "short", timeStyle: "short" }).format(date) : "Pendiente";
}

function applyFilters() {
  const grade = $("#gradeFilter").value;
  const parallel = $("#parallelFilter").value;
  const performance = $("#performanceFilter").value;
  filteredResults = allResults.filter(result =>
    (grade === "all" || String(result.grade) === grade) &&
    (parallel === "all" || result.parallel === parallel) &&
    (performance === "all" || result.performance === performance)
  );
  renderDashboard();
}

function aggregateSkills(results) {
  const skills = new Map();
  results.forEach(result => (result.skills || []).forEach(skill => {
    const current = skills.get(skill.category) || { correct: 0, total: 0 };
    current.correct += Number(skill.correct || 0);
    current.total += Number(skill.total || 0);
    skills.set(skill.category, current);
  }));
  return [...skills.entries()].map(([name, values]) => ({ name, percentage: values.total ? Math.round(values.correct / values.total * 100) : 0 })).sort((a, b) => a.percentage - b.percentage);
}

function renderMetrics() {
  const total = filteredResults.length;
  const average = total ? filteredResults.reduce((sum, item) => sum + Number(item.correct || 0), 0) / total : 0;
  const bonus = total ? filteredResults.filter(item => item.bonusUnlocked).length / total * 100 : 0;
  const skills = aggregateSkills(filteredResults);
  $("#totalStudents").textContent = total;
  $("#averageScore").textContent = `${average.toFixed(1)}/10`;
  $("#bonusRate").textContent = `${Math.round(bonus)}%`;
  $("#reinforcementSkill").textContent = skills[0]?.name || "—";
}

function renderGradeChart() {
  const chart = $("#gradeChart");
  chart.innerHTML = "";
  [4, 5, 6, 7].forEach(grade => {
    const group = filteredResults.filter(item => Number(item.grade) === grade);
    const average = group.length ? group.reduce((sum, item) => sum + Number(item.correct || 0), 0) / group.length : 0;
    const bar = document.createElement("div");
    bar.className = "grade-bar";
    bar.innerHTML = `<strong>${average.toFixed(1)}</strong><div class="bar-track"><i style="height:${average * 10}%"></i></div><small>${grade}.º</small>`;
    chart.appendChild(bar);
  });
}

function renderSkillChart() {
  const chart = $("#skillChart");
  chart.innerHTML = "";
  const skills = aggregateSkills(filteredResults).slice(0, 8);
  if (!skills.length) { chart.innerHTML = '<p class="empty-state">Aún no hay habilidades registradas.</p>'; return; }
  skills.forEach(skill => {
    const row = document.createElement("div");
    row.className = "skill-row";
    row.innerHTML = `<div class="skill-label"><strong></strong><span>${skill.percentage}%</span></div><div class="skill-track"><i style="width:${skill.percentage}%"></i></div>`;
    row.querySelector("strong").textContent = skill.name;
    chart.appendChild(row);
  });
}

function renderTable() {
  const body = $("#resultsBody");
  body.innerHTML = "";
  $("#visibleCount").textContent = `${filteredResults.length} ${filteredResults.length === 1 ? "registro" : "registros"}`;
  $("#emptyState").classList.toggle("is-hidden", filteredResults.length > 0);
  filteredResults.forEach(result => {
    const row = document.createElement("tr");
    row.innerHTML = `<td><strong></strong><small></small></td><td></td><td><strong>${Number(result.correct || 0)}/10</strong><small>${Number(result.keys || 0)}/5 retos</small></td><td><span class="performance-pill"></span></td><td>${Number(result.points || 0).toLocaleString("es-EC")}</td><td class="${result.bonusUnlocked ? "bonus-yes" : ""}">${result.bonusUnlocked ? "✓ +1" : "Pendiente"}</td><td>${formatDate(result.createdAt)}</td>`;
    row.children[0].querySelector("strong").textContent = result.student || "Sin identificación";
    row.children[0].querySelector("small").textContent = (result.badges || []).join(" · ") || "Sin insignias";
    row.children[1].textContent = `${result.grade}.º ${result.parallel} · ${result.levelCode}`;
    row.querySelector(".performance-pill").textContent = result.performance || "Sin clasificar";
    body.appendChild(row);
  });
}

function renderDashboard() { renderMetrics(); renderGradeChart(); renderSkillChart(); renderTable(); }

async function loadResults() {
  const snapshot = await getDocs(query(collection(db, "diagnosticResults"), orderBy("createdAt", "desc")));
  allResults = snapshot.docs.map(document => ({ id: document.id, ...document.data() }));
  applyFilters();
}

async function login() {
  $("#loginMessage").textContent = "Verificando tu cuenta…";
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const credential = await signInWithPopup(auth, provider);
    if ((credential.user.email || "").toLowerCase() !== TEACHER_EMAIL.toLowerCase()) {
      await signOut(auth);
      showLogin("Esta cuenta no está autorizada como docente.", true);
    }
  } catch (error) {
    console.error("Error de acceso docente", error);
    showLogin(error.code === "auth/popup-closed-by-user" ? "Inicio de sesión cancelado." : "No se pudo iniciar sesión. Revisa la configuración de Firebase.", true);
  }
}

function downloadCsv() {
  const headers = ["Estudiante o código", "Curso", "Paralelo", "Nivel", "Correctas", "Total", "Puntos", "Desempeño", "Bono +1", "Reflexión", "Insignias", "Fecha"];
  const rows = filteredResults.map(item => [item.student, item.grade, item.parallel, item.levelCode, item.correct, item.total, item.points, item.performance, item.bonusUnlocked ? "Sí" : "No", item.reflection || "", (item.badges || []).join(" | "), formatDate(item.createdAt)]);
  const csv = "\ufeff" + [headers, ...rows].map(row => row.map(csvSafe).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `diagnostico-emprendimiento-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

if (!isFirebaseConfigured()) {
  $("#loginButton").disabled = true;
  showLogin("El panel ya está construido. Falta añadir la configuración de Firebase para habilitar el acceso.", true);
} else {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  onAuthStateChanged(auth, async user => {
    if (!user || (user.email || "").toLowerCase() !== TEACHER_EMAIL.toLowerCase()) {
      showLogin("Solo la cuenta docente autorizada puede consultar los datos.");
      return;
    }
    $("#loginView").classList.add("is-hidden");
    $("#dashboardView").classList.remove("is-hidden");
    $("#logoutButton").classList.remove("is-hidden");
    $("#teacherIdentity").textContent = user.email;
    try { await loadResults(); } catch (error) { console.error(error); alert("No fue posible cargar los resultados. Verifica las reglas de Firestore."); }
  });
}

$("#loginButton").addEventListener("click", login);
$("#logoutButton").addEventListener("click", () => signOut(auth));
[$("#gradeFilter"), $("#parallelFilter"), $("#performanceFilter")].forEach(filter => filter.addEventListener("change", applyFilters));
$("#clearFilters").addEventListener("click", () => { $("#gradeFilter").value = "all"; $("#parallelFilter").value = "all"; $("#performanceFilter").value = "all"; applyFilters(); });
$("#csvButton").addEventListener("click", downloadCsv);
$("#pdfButton").addEventListener("click", () => window.print());
