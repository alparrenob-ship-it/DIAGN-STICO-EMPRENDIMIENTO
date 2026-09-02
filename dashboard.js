import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { collection, getDocs, getFirestore, orderBy, query } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured, TEACHER_EMAIL } from "./firebase-config.js";
import { LOGO_DATA_URL } from "./logo-data.js";

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
    const prizes = [result.bonusUnlocked ? "🎟️ +1" : "", result.sweetUnlocked ? "🍬 Dulce" : ""].filter(Boolean).join(" · ") || "Pendiente";
    row.innerHTML = `<td><strong></strong><small></small></td><td></td><td><strong>${Number(result.correct || 0)}/10</strong><small>${Number(result.keys || 0)}/5 retos</small></td><td><span class="performance-pill"></span></td><td>${Number(result.points || 0).toLocaleString("es-EC")}</td><td class="${result.bonusUnlocked || result.sweetUnlocked ? "bonus-yes" : ""}">${prizes}</td><td>${formatDate(result.createdAt)}</td>`;
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

const excelColors = {
  navy: "111B3F", purple: "5B3FE4", cyan: "19BFD3", white: "FFFFFF",
  ink: "172033", soft: "EEF2FF", line: "D9E1F2", green: "DDF5E8",
  yellow: "FFF0BF", orange: "FFE1C7", red: "FFD9DD", gray: "667085"
};

function styleTitle(sheet, title, subtitle, endColumn) {
  sheet.mergeCells(`A1:${endColumn}1`);
  sheet.getCell("A1").value = title;
  sheet.getCell("A1").font = { name: "Aptos Display", size: 20, bold: true, color: { argb: excelColors.white } };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: excelColors.navy } };
  sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 36;
  sheet.mergeCells(`A2:${endColumn}2`);
  sheet.getCell("A2").value = subtitle;
  sheet.getCell("A2").font = { name: "Aptos", size: 11, italic: true, color: { argb: excelColors.gray } };
  sheet.getRow(2).height = 24;
}

function styleHeader(row) {
  row.height = 30;
  row.eachCell(cell => {
    cell.font = { name: "Aptos", size: 10, bold: true, color: { argb: excelColors.white } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: excelColors.purple } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = { bottom: { style: "medium", color: { argb: excelColors.cyan } } };
  });
}

function performanceFill(performance) {
  return {
    "Dominio destacado": excelColors.green,
    "Logro esperado": excelColors.yellow,
    "En desarrollo": excelColors.orange,
    "Bases por construir": excelColors.red
  }[performance] || excelColors.soft;
}

async function downloadExcelReport() {
  if (!window.ExcelJS) {
    alert("No se pudo cargar el generador de Excel. Comprueba tu conexión e inténtalo nuevamente.");
    return;
  }
  const button = $("#excelButton");
  button.disabled = true;
  button.textContent = "Preparando Excel…";
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Misión Emprende · Profe Anita";
    workbook.subject = "Evaluación diagnóstica de Emprendimiento";
    workbook.title = "Reporte diagnóstico 4.º a 7.º de EGB";
    workbook.company = "Eight Academy";
    workbook.created = new Date();
    const logoId = workbook.addImage({ base64: LOGO_DATA_URL, extension: "png" });

    const reportDate = new Intl.DateTimeFormat("es-EC", { dateStyle: "long", timeStyle: "short" }).format(new Date());
    const total = filteredResults.length;
    const average = total ? filteredResults.reduce((sum, item) => sum + Number(item.correct || 0), 0) / total : 0;
    const skills = aggregateSkills(filteredResults);
    const gradeLabel = $("#gradeFilter").selectedOptions[0].textContent;
    const parallelLabel = $("#parallelFilter").selectedOptions[0].textContent;
    const performanceLabel = $("#performanceFilter").selectedOptions[0].textContent;

    const summary = workbook.addWorksheet("Resumen pedagógico", { views: [{ showGridLines: false }] });
    styleTitle(summary, "MISIÓN EMPRENDE · REPORTE DIAGNÓSTICO", "Resumen ejecutivo para la toma de decisiones pedagógicas", "H");
    summary.addImage(logoId, { tl: { col: 6.35, row: 0.12 }, ext: { width: 132, height: 57 } });
    summary.columns = [{ width: 23 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 3 }, { width: 24 }, { width: 15 }, { width: 18 }];
    summary.addRow([]);
    summary.addRow(["Fecha de generación", reportDate, "Curso", gradeLabel, "", "Paralelo", parallelLabel]);
    summary.addRow(["Filtro de desempeño", performanceLabel, "Docente autorizada", TEACHER_EMAIL]);
    summary.getRows(4, 2).forEach(row => row.eachCell(cell => { cell.font = { name: "Aptos", size: 10, color: { argb: excelColors.ink } }; cell.alignment = { vertical: "middle", wrapText: true }; }));
    ["A4", "C4", "F4", "A5", "C5"].forEach(ref => { summary.getCell(ref).font = { name: "Aptos", size: 10, bold: true, color: { argb: excelColors.navy } }; });
    summary.addRow([]);
    const metricRow = summary.addRow(["PARTICIPANTES", total, "PROMEDIO / 10", Number(average.toFixed(1)), "", "PRIORIDAD DE REFUERZO", skills[0]?.name || "Sin datos"]);
    metricRow.height = 34;
    metricRow.eachCell(cell => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: excelColors.soft } }; cell.font = { name: "Aptos", size: 11, bold: true, color: { argb: excelColors.navy } }; cell.alignment = { vertical: "middle", wrapText: true }; });
    summary.addRow([]);
    summary.addRow(["PROMEDIO POR CURSO", "Participantes", "Promedio", "Nivel predominante"]);
    styleHeader(summary.getRow(9));
    [4, 5, 6, 7].forEach(grade => {
      const group = filteredResults.filter(item => Number(item.grade) === grade);
      const gradeAverage = group.length ? group.reduce((sum, item) => sum + Number(item.correct || 0), 0) / group.length : 0;
      const level = gradeAverage >= 9 ? "Dominio destacado" : gradeAverage >= 7 ? "Logro esperado" : gradeAverage >= 4 ? "En desarrollo" : "Bases por construir";
      const row = summary.addRow([`${grade}.º EGB`, group.length, Number(gradeAverage.toFixed(1)), group.length ? level : "Sin datos"]);
      row.getCell(4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: performanceFill(level) } };
    });
    summary.addRow([]);
    summary.addRow(["LOGRO POR HABILIDAD", "Aciertos", "Evidencias", "Logro"]);
    styleHeader(summary.getRow(15));
    skills.forEach(skill => {
      const source = filteredResults.flatMap(item => item.skills || []).filter(item => item.category === skill.name);
      const correct = source.reduce((sum, item) => sum + Number(item.correct || 0), 0);
      const evidence = source.reduce((sum, item) => sum + Number(item.total || 0), 0);
      const row = summary.addRow([skill.name, correct, evidence, skill.percentage / 100]);
      row.getCell(4).numFmt = "0%";
    });
    summary.views = [{ state: "frozen", ySplit: 2, showGridLines: false }];

    const results = workbook.addWorksheet("Resultados individuales", { views: [{ state: "frozen", ySplit: 4, xSplit: 1, showGridLines: false }] });
    styleTitle(results, "RESULTADOS INDIVIDUALES", "Evaluación diagnóstica · Los puntos y premios de juego no alteran el resultado sobre 10", "N");
    results.addImage(logoId, { tl: { col: 12.2, row: 0.12 }, ext: { width: 132, height: 57 } });
    results.columns = [
      { width: 26 }, { width: 10 }, { width: 10 }, { width: 14 }, { width: 12 }, { width: 23 }, { width: 38 },
      { width: 15 }, { width: 12 }, { width: 14 }, { width: 34 }, { width: 30 }, { width: 21 }, { width: 18 }
    ];
    results.addRow([]);
    const resultHeader = results.addRow(["Estudiante / código", "Curso", "Paralelo", "Nivel", "Resultado", "Nivel diagnóstico", "Detalle por habilidad", "Puntos de juego", "Bono +1", "Cupón dulce", "Reflexión", "Insignias", "Fecha", "ID de registro"]);
    styleHeader(resultHeader);
    filteredResults.forEach((item, index) => {
      const date = item.createdAt?.toDate ? item.createdAt.toDate() : null;
      const row = results.addRow([
        item.student || "Sin identificación", Number(item.grade), item.parallel || "", item.levelCode || "",
        Number(item.correct || 0), item.performance || "Sin clasificar",
        (item.skills || []).map(skill => `${skill.category}: ${skill.correct}/${skill.total}`).join(" · "),
        Number(item.points || 0), item.bonusUnlocked ? "Sí" : "No", item.sweetUnlocked ? "Sí" : "No",
        item.reflection || "", (item.badges || []).join(" · "), date, item.id || ""
      ]);
      row.height = 34;
      row.eachCell(cell => { cell.font = { name: "Aptos", size: 10, color: { argb: excelColors.ink } }; cell.alignment = { vertical: "middle", wrapText: true }; cell.border = { bottom: { style: "hair", color: { argb: excelColors.line } } }; });
      row.getCell(5).numFmt = '0"/10"';
      row.getCell(6).fill = { type: "pattern", pattern: "solid", fgColor: { argb: performanceFill(item.performance) } };
      row.getCell(13).numFmt = "dd/mm/yyyy hh:mm";
      if (index % 2 === 1) row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F7F9FC" } };
    });
    results.autoFilter = { from: "A4", to: "N4" };

    const rubric = workbook.addWorksheet("Rúbrica diagnóstica", { views: [{ state: "frozen", ySplit: 7, showGridLines: false }] });
    styleTitle(rubric, "RÚBRICA DIAGNÓSTICA · EMPRENDIMIENTO", "Instrumento para interpretar conocimientos previos de 4.º a 7.º de EGB", "D");
    rubric.addImage(logoId, { tl: { col: 2.95, row: 0.12 }, ext: { width: 132, height: 57 } });
    rubric.columns = [{ width: 17 }, { width: 24 }, { width: 58 }, { width: 58 }];
    rubric.addRow([]);
    rubric.addRow(["Propósito", "Identificar conocimientos previos para planificar el acompañamiento; no corresponde a una calificación sumativa."]);
    rubric.mergeCells("B4:D4");
    rubric.addRow(["Estructura", "5 preguntas conceptuales (5 puntos) + 5 retos de aplicación (5 puntos) = 10 puntos diagnósticos."]);
    rubric.mergeCells("B5:D5");
    rubric.addRow(["Importante", "Monedas, rapidez, rachas, llaves, cupón de dulce y Bono +1 son motivadores y no modifican el resultado diagnóstico."]);
    rubric.mergeCells("B6:D6");
    [4, 5, 6].forEach(rowNumber => { rubric.getRow(rowNumber).height = 34; rubric.getRow(rowNumber).eachCell(cell => { cell.alignment = { vertical: "middle", wrapText: true }; cell.font = { name: "Aptos", size: 10, color: { argb: excelColors.ink }, bold: cell.column === 1 }; }); });
    const rubricHeader = rubric.addRow(["Resultado", "Nivel diagnóstico", "Evidencia observada", "Decisión pedagógica sugerida"]);
    styleHeader(rubricHeader);
    [
      ["9–10", "Dominio destacado", "Reconoce conceptos y los aplica con seguridad en situaciones nuevas.", "Proponer profundización, liderazgo y creación."],
      ["7–8", "Logro esperado", "Comprende las bases y aplica la mayoría de los aprendizajes.", "Consolidar conceptos puntuales mediante práctica y validación."],
      ["4–6", "En desarrollo", "Reconoce algunos conceptos, pero necesita apoyo para aplicarlos.", "Trabajar con ejemplos, modelado, equipos y prototipos guiados."],
      ["0–3", "Bases por construir", "Presenta conocimientos iniciales o respuestas todavía intuitivas.", "Iniciar con experiencias concretas, vocabulario esencial y acompañamiento."]
    ].forEach(values => {
      const row = rubric.addRow(values);
      row.height = 44;
      row.eachCell(cell => { cell.alignment = { vertical: "middle", wrapText: true }; cell.font = { name: "Aptos", size: 10, color: { argb: excelColors.ink } }; });
      row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: performanceFill(values[1]) } };
    });
    rubric.addRow([]);
    const focusHeader = rubric.addRow(["Curso", "Trayectoria", "Focos diagnósticos", "Uso pedagógico"]);
    styleHeader(focusHeader);
    [
      ["4.º EGB", "DISCOVER", "Necesidades y problemas; producto y servicio; cliente y valor; dinero, ahorro y actitud emprendedora.", "Reconocer las bases iniciales para construir vocabulario y pensamiento emprendedor."],
      ["5.º EGB", "CREATE", "Design Thinking; empatía y prototipo; feedback y marca; producción, calidad, costos y utilidad.", "Identificar bases nuevas antes de iniciar experiencias de creación."],
      ["6.º EGB", "BUILD", "Mercado y propuesta de valor; Canvas; finanzas; validación, métricas, tecnología y blockchain.", "Comprobar la permanencia de aprendizajes trabajados durante el año anterior."],
      ["7.º EGB", "SCALE", "Innovación y MVP; métricas y escalabilidad; IA ética, Web3, blockchain, pitch e inversión.", "Determinar el nivel de dominio previo antes del trabajo de nivel Hackathon."]
    ].forEach(values => { const row = rubric.addRow(values); row.height = 52; row.eachCell(cell => { cell.alignment = { vertical: "middle", wrapText: true }; cell.font = { name: "Aptos", size: 10, color: { argb: excelColors.ink } }; }); });

    [summary, results, rubric].forEach(sheet => {
      sheet.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } };
      sheet.headerFooter.oddFooter = "&LProfe Anita · Misión Emprende&C&P de &N&RReporte confidencial";
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    link.download = `reporte-diagnostico-emprendimiento-${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  } catch (error) {
    console.error("Error al generar Excel", error);
    alert("No fue posible generar el reporte Excel. Inténtalo nuevamente.");
  } finally {
    button.disabled = false;
    button.textContent = "📊 Descargar reporte Excel";
  }
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
$("#excelButton").addEventListener("click", downloadExcelReport);
$("#pdfButton").addEventListener("click", () => window.print());
