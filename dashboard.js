import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { collection, getDocs, getFirestore, orderBy, query } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured, TEACHER_EMAIL } from "./firebase-config.js";
import { EIGHT_ACADEMY_LOGO_DATA_URL, EIGHT_ACADEMY_TAGLINE_DATA_URL } from "./eight-logo-data.js?v=20260908-2";
import { INSTITUTIONAL_TEMPLATE_BASE64 } from "./institutional-template-data.js?v=20260908-2";

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
  navy: "1F1F1F", purple: "D9D9D9", cyan: "7F7F7F", white: "FFFFFF",
  ink: "111111", soft: "F2F2F2", line: "595959", green: "93C47D",
  blue: "C9DAF8", yellow: "FFF200", orange: "F6B26B", red: "E06666", gray: "666666"
};

function styleTitle(sheet, title, subtitle, endColumn) {
  sheet.mergeCells(`C1:${endColumn}1`);
  sheet.getCell("C1").value = "Unidad Educativa Particular “Eight Academy”";
  sheet.getCell("C1").font = { name: "Arial", size: 15, bold: true, italic: true, color: { argb: excelColors.ink } };
  sheet.getCell("C1").alignment = { vertical: "middle", horizontal: "center" };
  sheet.getCell("C1").border = { bottom: { style: "thin", color: { argb: excelColors.line } } };
  sheet.getRow(1).height = 58;
  sheet.mergeCells(`A2:${endColumn}2`);
  sheet.getCell("A2").value = `INFORME DE EVALUACIÓN DIAGNÓSTICA · ${title}`;
  sheet.getCell("A2").font = { name: "Arial", size: 10, bold: true, color: { argb: excelColors.ink } };
  sheet.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: excelColors.purple } };
  sheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  sheet.getCell("A2").border = { top: { style: "thin", color: { argb: excelColors.line } }, bottom: { style: "thin", color: { argb: excelColors.line } } };
  sheet.getRow(2).height = 25;
  sheet.headerFooter.oddHeader = `&C${subtitle}`;
}

function styleHeader(row) {
  row.height = 30;
  row.eachCell(cell => {
    cell.font = { name: "Arial", size: 9, bold: true, color: { argb: excelColors.ink } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: excelColors.purple } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = { top: { style: "thin", color: { argb: excelColors.line } }, left: { style: "thin", color: { argb: excelColors.line } }, bottom: { style: "thin", color: { argb: excelColors.line } }, right: { style: "thin", color: { argb: excelColors.line } } };
  });
}

function styleSectionBand(sheet, rowNumber, title, endColumn) {
  sheet.mergeCells(`A${rowNumber}:${endColumn}${rowNumber}`);
  const cell = sheet.getCell(`A${rowNumber}`);
  cell.value = title;
  cell.font = { name: "Arial", size: 10, bold: true, color: { argb: excelColors.ink } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: excelColors.purple } };
  cell.alignment = { vertical: "middle", horizontal: "left" };
  cell.border = { top: { style: "thin", color: { argb: excelColors.line } }, bottom: { style: "thin", color: { argb: excelColors.line } } };
  sheet.getRow(rowNumber).height = 22;
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
    const templateBytes = Uint8Array.from(atob(INSTITUTIONAL_TEMPLATE_BASE64), character => character.charCodeAt(0));
    await workbook.xlsx.load(templateBytes.buffer);
    workbook.creator = "Misión Emprende · Profe Anita";
    workbook.subject = "Evaluación diagnóstica de Emprendimiento";
    workbook.title = "Reporte diagnóstico 4.º a 7.º de EGB";
    workbook.company = "Eight Academy";
    workbook.created = new Date();
    const logoId = workbook.addImage({ base64: EIGHT_ACADEMY_LOGO_DATA_URL, extension: "png" });
    const taglineId = workbook.addImage({ base64: EIGHT_ACADEMY_TAGLINE_DATA_URL, extension: "png" });

    const reportDate = new Intl.DateTimeFormat("es-EC", { dateStyle: "long", timeStyle: "short" }).format(new Date());
    const total = filteredResults.length;
    const average = total ? filteredResults.reduce((sum, item) => sum + Number(item.correct || 0), 0) / total : 0;
    const skills = aggregateSkills(filteredResults);
    const gradeLabel = $("#gradeFilter").selectedOptions[0].textContent;
    const parallelLabel = $("#parallelFilter").selectedOptions[0].textContent;
    const performanceLabel = $("#performanceFilter").selectedOptions[0].textContent;

    const summary = workbook.worksheets[0];
    summary.name = "Resumen pedagógico";
    summary.views = [{ showGridLines: false }];
    summary.getCell("B4").value = "Lcda. Anita Parreño";
    summary.getCell("F4").value = "Emprendimiento";
    summary.getCell("J4").value = "Emprendimiento Innovador";
    summary.getCell("B5").value = "Evaluación diagnóstica";
    summary.getCell("F5").value = "Saberes previos por niveles";
    summary.getCell("J5").value = "Emprendimiento";
    summary.getCell("B6").value = gradeLabel;
    summary.getCell("F6").value = "Diagnóstico inicial";
    summary.getCell("J6").value = reportDate;
    summary.getCell("A8").value = "Identificar conocimientos previos y habilidades de aplicación en emprendimiento para planificar el acompañamiento pedagógico de 4.º a 7.º de EGB mediante una experiencia gamificada.";

    const applicationGroups = [...new Map(filteredResults.map(item => [`${item.grade}|${item.parallel || "—"}`, { grade: Number(item.grade), parallel: item.parallel || "—" }])).values()]
      .sort((a, b) => a.grade - b.grade || a.parallel.localeCompare(b.parallel));
    for (let rowNumber = 11; rowNumber <= 24; rowNumber += 1) {
      ["A", "C", "E", "G", "I", "K"].forEach(column => { summary.getCell(`${column}${rowNumber}`).value = ""; });
    }
    (applicationGroups.length ? applicationGroups : [{ grade: null, parallel: "—" }]).slice(0, 14).forEach((groupInfo, index) => {
      const group = groupInfo.grade === null ? [] : filteredResults.filter(item => Number(item.grade) === groupInfo.grade && (item.parallel || "—") === groupInfo.parallel);
      const groupAverage = group.length ? group.reduce((sum, item) => sum + Number(item.correct || 0), 0) / group.length : 0;
      const level = groupAverage >= 9 ? "Dominio destacado" : groupAverage >= 7 ? "Logro esperado" : groupAverage >= 4 ? "En desarrollo" : "Bases por construir";
      const rowNumber = 11 + index;
      summary.getCell(`A${rowNumber}`).value = groupInfo.grade ? `${groupInfo.grade}.º` : "Sin datos";
      summary.getCell(`C${rowNumber}`).value = groupInfo.parallel;
      summary.getCell(`E${rowNumber}`).value = "";
      summary.getCell(`G${rowNumber}`).value = group.length;
      summary.getCell(`I${rowNumber}`).value = "";
      summary.getCell(`K${rowNumber}`).value = group.length ? `Promedio: ${groupAverage.toFixed(1)}/10 · ${level}` : "Sin registros";
    });
    const scoreBands = [
      { row: 29, count: filteredResults.filter(item => Number(item.correct || 0) >= 8).length, recommendation: "Mantener retos de profundización y liderazgo.", plan: "Proyectos abiertos, mentoría entre pares y aplicación en contextos nuevos." },
      { row: 30, count: filteredResults.filter(item => Number(item.correct || 0) >= 5 && Number(item.correct || 0) <= 7).length, recommendation: "Consolidar los conceptos que presentan dificultad.", plan: "Práctica guiada, ejemplos y retroalimentación focalizada." },
      { row: 31, count: filteredResults.filter(item => Number(item.correct || 0) <= 4).length, recommendation: "Fortalecer vocabulario y conocimientos esenciales.", plan: "Experiencias concretas, apoyos visuales y acompañamiento cercano." }
    ];
    summary.getCell("B26").value = gradeLabel;
    summary.getCell("D26").value = parallelLabel;
    summary.getCell("B27").value = "Emprendimiento Innovador";
    scoreBands.forEach(band => {
      summary.getCell(`D${band.row}`).value = band.count;
      summary.getCell(`E${band.row}`).value = total ? band.count / total : 0;
      summary.getCell(`E${band.row}`).numFmt = "0%";
      summary.getCell(`F${band.row}`).value = band.recommendation;
      summary.getCell(`I${band.row}`).value = band.plan;
    });
    summary.getCell("D32").value = total;
    summary.getCell("E32").value = total ? 1 : 0;
    summary.getCell("E32").numFmt = "0%";

    const challengeBands = [
      { row: 37, count: filteredResults.filter(item => Number(item.keys || 0) >= 4).length, label: "ESPERADO (Resuelve los retos de aplicación) 4-5" },
      { row: 38, count: filteredResults.filter(item => Number(item.keys || 0) >= 2 && Number(item.keys || 0) <= 3).length, label: "EN PROCESO (Resuelve algunos retos con apoyo) 2-3" },
      { row: 39, count: filteredResults.filter(item => Number(item.keys || 0) <= 1).length, label: "REQUIERE APOYO (Necesita guía en los retos) 0-1" }
    ];
    summary.getCell("B34").value = gradeLabel;
    summary.getCell("D34").value = parallelLabel;
    summary.getCell("B35").value = "Emprendimiento Innovador · Retos de aplicación";
    challengeBands.forEach(band => {
      summary.getCell(`A${band.row}`).value = band.label;
      summary.getCell(`D${band.row}`).value = band.count;
      summary.getCell(`E${band.row}`).value = total ? band.count / total : 0;
      summary.getCell(`E${band.row}`).numFmt = "0%";
      summary.getCell(`F${band.row}`).value = band.row === 37 ? "Continuar con desafíos autónomos." : band.row === 38 ? "Modelar estrategias de resolución." : "Acompañar cada reto paso a paso.";
      summary.getCell(`I${band.row}`).value = band.row === 37 ? "Transferir aprendizajes a proyectos nuevos." : band.row === 38 ? "Repetir retos con ejemplos cercanos." : "Usar apoyos visuales y trabajo cooperativo.";
    });
    summary.getCell("D40").value = total;
    summary.getCell("E40").value = total ? 1 : 0;
    summary.getCell("E40").numFmt = "0%";
    summary.getCell("A43").value = `Promedio general: ${average.toFixed(1)}/10. Prioridad de refuerzo: ${skills[0]?.name || "Sin datos"}. El puntaje de juego, insignias, llaves y premios no modifican el resultado diagnóstico.`;
    summary.getCell("C49").value = "Lcda. Anita Parreño";
    summary.getCell("C50").value = reportDate;

    const results = workbook.addWorksheet("Resultados individuales", { views: [{ state: "frozen", ySplit: 4, xSplit: 1, showGridLines: false }] });
    styleTitle(results, "RESULTADOS INDIVIDUALES", "Evaluación diagnóstica · Los puntos y premios de juego no alteran el resultado sobre 10", "N");
    results.addImage(logoId, { tl: { col: 0.1, row: 0.08 }, ext: { width: 224, height: 60 } });
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
    rubric.addImage(logoId, { tl: { col: 0.1, row: 0.08 }, ext: { width: 224, height: 60 } });
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
