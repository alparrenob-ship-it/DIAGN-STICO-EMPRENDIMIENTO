const LEVELS = {
  4: { code: "DISCOVER", label: "Descubrir", avatar: "🔎", difficulty: "Nivel inicial", color: "#25c2d6" },
  5: { code: "CREATE", label: "Crear", avatar: "💡", difficulty: "Nivel explorador", color: "#6554e8" },
  6: { code: "BUILD", label: "Construir", avatar: "🛠️", difficulty: "Nivel constructor", color: "#ff9d42" },
  7: { code: "SCALE", label: "Escalar", avatar: "🚀", difficulty: "Nivel startup", color: "#ff6689" }
};

const QUESTION_BANK = {
  4: [
    { category: "Necesidades y problemas", question: "En el recreo, varios estudiantes no encuentran dónde colocar las botellas vacías. ¿Qué identificó una persona emprendedora?", options: ["Un problema que puede resolverse", "Un premio para ganar", "Una razón para no hacer nada", "Un producto que ya está terminado"], correct: 0, feedback: "Emprender comienza al observar una necesidad o un problema que afecta a otras personas." },
    { category: "Necesidades y problemas", question: "¿Cuál de estas opciones es una necesidad básica?", options: ["Tomar agua cuando tienes sed", "Comprar el juguete más nuevo", "Cambiar de mochila cada semana", "Tener todos los videojuegos"], correct: 0, feedback: "Una necesidad es algo importante para vivir o estar bien; un deseo es algo que queremos, pero no siempre necesitamos." },
    { category: "Producto y servicio", question: "Sofía elabora separadores de libros y los vende en una feria. ¿Qué ofrece?", options: ["Un producto", "Un servicio", "Un préstamo", "Una deuda"], correct: 0, feedback: "Un producto es un objeto que se crea para satisfacer una necesidad o un deseo." },
    { category: "Producto y servicio", question: "Mateo ayuda a pasear perros y recibe un pago. ¿Qué ofrece?", options: ["Un servicio", "Una materia prima", "Un producto de fábrica", "Una moneda"], correct: 0, feedback: "Un servicio es una actividad que una persona realiza para ayudar o atender a otra." },
    { category: "Cliente y valor", question: "Si diseñas loncheras para estudiantes, ¿quiénes serían tus posibles clientes?", options: ["Las personas que necesitan o comprarían las loncheras", "Solo quienes fabrican lápices", "Únicamente los profesores", "Nadie, porque no hay que preguntar"], correct: 0, feedback: "El cliente es la persona que necesita, elige o compra un producto o servicio." },
    { category: "Cliente y valor", question: "Antes de crear un producto, la mejor decisión es…", options: ["Preguntar a las personas qué necesitan", "Copiar sin preguntar", "Fabricar muchas unidades de inmediato", "Elegir solo lo que me gusta a mí"], correct: 0, feedback: "Escuchar a las personas ayuda a crear algo realmente útil para ellas." },
    { category: "Dinero y ahorro", question: "Una pulsera cuesta $2 en materiales y se vende en $3. ¿Cuánto queda como ganancia simple?", options: ["$1", "$2", "$3", "$5"], correct: 0, feedback: "La ganancia simple se obtiene al restar el costo al precio de venta: $3 − $2 = $1." },
    { category: "Dinero y ahorro", question: "Recibes $5 y decides guardar $2 para una meta futura. ¿Qué estás haciendo?", options: ["Ahorrando", "Gastando todo", "Pidiendo prestado", "Subiendo el precio"], correct: 0, feedback: "Ahorrar es separar una parte del dinero para usarla después en una meta o necesidad." },
    { category: "Creatividad y equipo", question: "Tu primera idea no funciona como esperabas. ¿Qué haría un emprendedor?", options: ["La mejora y vuelve a probar", "Se rinde de inmediato", "Culpa a los demás", "Oculta el problema"], correct: 0, feedback: "Las personas emprendedoras aprenden de los errores, mejoran sus ideas y perseveran." },
    { category: "Creatividad y equipo", question: "En un equipo emprendedor, ¿qué acción ayuda más?", options: ["Escuchar, repartir tareas y colaborar", "Hacer todo sin comunicar", "Competir con el propio equipo", "Ignorar las ideas diferentes"], correct: 0, feedback: "Un equipo funciona mejor cuando escucha, organiza responsabilidades y valora las ideas de todos." }
  ],
  5: [
    { category: "Design Thinking", question: "Un equipo quiere mejorar el recreo escolar. ¿Cuál debería ser su primer paso?", options: ["Observar y escuchar a los estudiantes", "Construir la solución final", "Elegir un precio", "Crear publicidad"], correct: 0, feedback: "Design Thinking inicia con empatizar: observar, escuchar y comprender a las personas." },
    { category: "Design Thinking", question: "Después de conversar con los usuarios, el equipo organiza lo aprendido y expresa el reto con claridad. ¿Qué etapa realiza?", options: ["Definir", "Vender", "Producir", "Ahorrar"], correct: 0, feedback: "Definir consiste en convertir los hallazgos en un problema claro que guíe el proyecto." },
    { category: "Creatividad y prototipo", question: "¿Qué acción representa mejor la etapa de idear?", options: ["Proponer muchas soluciones antes de elegir", "Quedarse con la primera idea", "Calcular únicamente el precio", "Fabricar cien unidades"], correct: 0, feedback: "Idear significa generar varias alternativas creativas y luego seleccionar la más útil y posible." },
    { category: "Creatividad y prototipo", question: "¿Para qué sirve un prototipo?", options: ["Para representar, probar y mejorar una idea", "Para evitar escuchar opiniones", "Para reemplazar al cliente", "Para asegurar ganancias"], correct: 0, feedback: "Un prototipo es una versión sencilla de la solución que permite aprender antes de construir el producto final." },
    { category: "Marca y cliente", question: "¿Qué hace que una marca sea fácil de reconocer?", options: ["Un nombre, identidad y mensaje coherentes", "Cambiar de nombre todos los días", "Copiar exactamente a otra empresa", "No explicar qué ofrece"], correct: 0, feedback: "Una marca comunica quién es el emprendimiento y ayuda a diferenciarlo." },
    { category: "Marca y cliente", question: "Al probar un producto, tres usuarios dicen que la tapa es difícil de abrir. ¿Qué conviene hacer?", options: ["Registrar el comentario y mejorar la tapa", "Ignorar a los usuarios", "Cambiar solo el logotipo", "Venderlo sin probar otra vez"], correct: 0, feedback: "El feedback ayuda a iterar: probar, aprender, mejorar y volver a probar." },
    { category: "Producción y calidad", question: "Para preparar jugo natural, las frutas son…", options: ["Materia prima", "Ganancia", "Publicidad", "Cliente"], correct: 0, feedback: "La materia prima es el material que se transforma para elaborar un producto." },
    { category: "Producción y calidad", question: "¿Qué demuestra calidad en un producto?", options: ["Cumple bien su función y está cuidadosamente elaborado", "Es el más caro sin razón", "Tiene muchos colores", "Se fabricó rápidamente aunque falle"], correct: 0, feedback: "La calidad significa cumplir lo prometido y satisfacer adecuadamente la necesidad del cliente." },
    { category: "Costos y utilidad", question: "Crear una libreta cuesta $4 y se vende en $6. ¿Cuál es la utilidad por unidad?", options: ["$2", "$4", "$6", "$10"], correct: 0, feedback: "La utilidad por unidad es precio de venta menos costo: $6 − $4 = $2." },
    { category: "Tecnología con propósito", question: "¿Cuál es un uso útil de una página web para un emprendimiento?", options: ["Mostrar información clara sobre sus productos", "Publicar datos privados de clientes", "Copiar contenido sin permiso", "Prometer resultados falsos"], correct: 0, feedback: "La tecnología aporta valor cuando informa, conecta o resuelve una necesidad de manera segura y responsable." }
  ],
  6: [
    { category: "Mercado y cliente", question: "Un equipo crea termos reutilizables para deportistas. ¿Qué debe investigar primero sobre su mercado?", options: ["Quién los necesita, qué valora y cuánto estaría dispuesto a pagar", "Solo el color favorito del equipo", "El nombre de una empresa famosa", "Cuántos seguidores tiene el profesor"], correct: 0, feedback: "Conocer al cliente y su contexto permite diseñar una propuesta basada en evidencia." },
    { category: "Mercado y cliente", question: "¿Para qué se analiza a la competencia?", options: ["Para identificar alternativas, aprender y diferenciarse", "Para copiar exactamente su producto", "Para impedir que otros vendan", "Para evitar hablar con clientes"], correct: 0, feedback: "Analizar la competencia ayuda a comprender el mercado y construir una diferencia valiosa." },
    { category: "Propuesta y modelo", question: "¿Cuál es la propuesta de valor más clara?", options: ["Botella resistente que mantiene fría el agua durante la jornada escolar", "Vendemos cosas muy buenas", "Somos los mejores porque sí", "Tenemos muchos colores y nada más"], correct: 0, feedback: "Una propuesta de valor explica qué beneficio ofrece, a quién y por qué resulta diferente o útil." },
    { category: "Propuesta y modelo", question: "En un modelo Canvas, el bloque “segmentos de clientes” responde principalmente a…", options: ["¿Para quién creamos valor?", "¿Qué color tendrá el logo?", "¿Quién decorará el aula?", "¿Cuándo inicia el recreo?"], correct: 0, feedback: "Los segmentos de clientes identifican a los grupos de personas para quienes se diseña la solución." },
    { category: "Finanzas", question: "¿Cuál es un costo variable en un negocio de galletas?", options: ["La harina usada en cada lote", "El permiso anual del negocio", "El diseño inicial del logotipo", "Una mesa comprada una sola vez"], correct: 0, feedback: "Un costo variable cambia según la cantidad producida; al hacer más galletas se necesita más harina." },
    { category: "Finanzas", question: "Un emprendimiento recibe $120 por ventas y gasta $80. ¿Cuál es su utilidad simple?", options: ["$40", "$80", "$120", "$200"], correct: 0, feedback: "La utilidad simple se calcula restando los gastos o costos a los ingresos: $120 − $80 = $40." },
    { category: "Validación y métricas", question: "¿Cuál es una evidencia útil para validar una idea?", options: ["Resultados de pruebas y opiniones de usuarios reales", "La opinión de una sola persona del equipo", "El número de colores del prototipo", "Una suposición sin comprobar"], correct: 0, feedback: "Validar significa comprobar las suposiciones con usuarios, pruebas y datos." },
    { category: "Validación y métricas", question: "De 20 estudiantes que probaron una app, 15 dijeron que la usarían otra vez. ¿Qué métrica aporta este dato?", options: ["Intención de reutilización: 15 de 20", "Costo fijo", "Cantidad de competidores", "Valor de la materia prima"], correct: 0, feedback: "Una métrica convierte una observación en un dato que ayuda a decidir y mejorar." },
    { category: "Tecnología y Web3", question: "¿Cuál describe mejor una blockchain?", options: ["Un registro digital compartido, enlazado y difícil de alterar", "Una red social para publicar fotos", "Un videojuego sin internet", "Una carpeta privada de una sola persona"], correct: 0, feedback: "Blockchain registra información en bloques conectados y distribuidos entre participantes de una red." },
    { category: "Tecnología y Web3", question: "¿Cuándo tiene sentido usar tecnología en un proyecto?", options: ["Cuando mejora la solución o aporta valor al usuario", "Siempre, aunque complique el problema", "Solo para que el proyecto parezca moderno", "Cuando reemplaza toda decisión humana"], correct: 0, feedback: "La tecnología debe responder a una necesidad concreta, no añadirse únicamente por moda." }
  ],
  7: [
    { category: "Oportunidad e innovación", question: "¿Cuál situación representa una oportunidad de innovación?", options: ["Un problema frecuente sin una solución satisfactoria", "Una idea que no beneficia a nadie", "Copiar un producto sin cambios", "Usar tecnología sin propósito"], correct: 0, feedback: "Una oportunidad aparece cuando existe una necesidad relevante y espacio para crear una solución mejor." },
    { category: "Oportunidad e innovación", question: "En SCAMPER, la pregunta “¿qué función podríamos reemplazar?” corresponde a…", options: ["Sustituir", "Combinar", "Eliminar", "Reordenar"], correct: 0, feedback: "SCAMPER impulsa nuevas ideas mediante acciones como sustituir, combinar, adaptar, modificar, proponer otros usos, eliminar y reordenar." },
    { category: "MVP y validación", question: "¿Qué es un MVP?", options: ["La versión mínima funcional para probar la hipótesis principal", "El producto final con todas las funciones", "Una presentación sin prototipo", "Una campaña de publicidad"], correct: 0, feedback: "El MVP permite validar lo esencial con el menor esfuerzo necesario antes de invertir más recursos." },
    { category: "MVP y validación", question: "Una app tuvo 100 registros, pero solo 12 usuarios regresaron la semana siguiente. ¿Qué revela esta métrica?", options: ["Existe baja retención y se debe investigar por qué", "La idea ya está totalmente validada", "El precio es necesariamente correcto", "La blockchain funciona bien"], correct: 0, feedback: "La retención muestra cuántas personas continúan usando la solución; un dato bajo exige investigar y mejorar." },
    { category: "Modelo y escalabilidad", question: "¿Qué hace escalable a un modelo de negocio digital?", options: ["Puede atender a más usuarios sin aumentar los costos al mismo ritmo", "Necesita duplicar todos sus recursos por cada cliente", "Depende de un único comprador", "No mide sus resultados"], correct: 0, feedback: "Escalar implica crecer de manera sostenible, aumentando el impacto o los ingresos con eficiencia." },
    { category: "Modelo y escalabilidad", question: "¿Qué debe comunicar primero un pitch para inversionistas?", options: ["El problema, la solución, la evidencia y el modelo de negocio", "Solo el nombre del equipo", "Una lista de colores de la marca", "Únicamente las herramientas digitales usadas"], correct: 0, feedback: "Un pitch sólido conecta problema, solución, mercado, validación, modelo y equipo con datos claros." },
    { category: "Finanzas estratégicas", question: "Si durante un mes entra menos dinero del que sale, el flujo de caja es…", options: ["Negativo", "Positivo", "Igual a la utilidad anual", "Automáticamente escalable"], correct: 0, feedback: "El flujo de caja es negativo cuando las salidas de dinero superan las entradas durante un periodo." },
    { category: "Finanzas estratégicas", question: "¿Cuál sería una reinversión responsable?", options: ["Usar parte de la utilidad para mejorar el producto basándose en datos", "Gastar toda la utilidad sin plan", "Solicitar deuda sin calcular pagos", "Ocultar los costos del proyecto"], correct: 0, feedback: "Reinvertir responsablemente significa destinar recursos al crecimiento después de analizar necesidades, riesgos y resultados." },
    { category: "Web3 y blockchain", question: "¿Qué ventaja puede aportar blockchain a un proyecto de trazabilidad?", options: ["Registrar el recorrido de un producto de forma verificable", "Garantizar que todo negocio tendrá ganancias", "Eliminar la necesidad de proteger datos", "Convertir cualquier imagen en una empresa"], correct: 0, feedback: "Blockchain puede aportar trazabilidad y verificación, pero debe justificarse según el problema y proteger los datos." },
    { category: "IA y tecnología ética", question: "Un equipo usa IA para recomendar hábitos de estudio. ¿Cuál es la decisión más responsable?", options: ["Proteger datos, revisar resultados y mantener supervisión humana", "Publicar información personal", "Aceptar toda respuesta de la IA como verdadera", "Ocultar que se usa IA"], correct: 0, feedback: "La IA responsable exige privacidad, transparencia, revisión crítica y supervisión humana." }
  ]
};

const state = { student: "", grade: 4, parallel: "", index: 0, points: 0, lives: 3, streak: 0, correct: 0, answers: [], sound: true, locked: false };

const $ = (selector) => document.querySelector(selector);
const screens = { start: $("#startScreen"), game: $("#gameScreen"), result: $("#resultScreen") };

function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => screen.classList.toggle("is-hidden", key !== name));
  $("#app").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function playTone(type) {
  if (!state.sound) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain); gain.connect(ctx.destination);
    oscillator.frequency.value = type === "correct" ? 620 : 210;
    oscillator.type = type === "correct" ? "sine" : "triangle";
    gain.gain.setValueAtTime(.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .22);
    oscillator.start(); oscillator.stop(ctx.currentTime + .22);
  } catch (_) { /* El juego sigue funcionando si el navegador bloquea el audio. */ }
}

function beginGame(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.student = data.get("studentName").trim();
  state.grade = Number(data.get("grade"));
  state.parallel = data.get("parallel");
  state.index = 0; state.points = 0; state.lives = 3; state.streak = 0; state.correct = 0; state.answers = []; state.locked = false;

  const level = LEVELS[state.grade];
  $("#hudAvatar").textContent = level.avatar;
  $("#hudName").textContent = state.student;
  $("#hudGrade").textContent = `${state.grade}.º ${state.parallel} · ${level.code}`;
  showScreen("game");
  renderQuestion();
}

function renderQuestion() {
  state.locked = false;
  const question = QUESTION_BANK[state.grade][state.index];
  const level = LEVELS[state.grade];
  const current = state.index + 1;
  const progress = current * 10;

  $("#missionLabel").textContent = `Misión ${current} de 10`;
  $("#progressPercent").textContent = `${progress}%`;
  $("#progressBar").style.width = `${progress}%`;
  $(".progress-track").setAttribute("aria-valuenow", String(progress));
  $("#categoryBadge").textContent = question.category;
  $("#difficultyBadge").textContent = level.difficulty;
  $("#questionText").textContent = question.question;
  $("#scoreValue").textContent = state.points.toLocaleString("es-EC");
  $("#livesValue").textContent = `${"● ".repeat(state.lives)}${"○ ".repeat(3 - state.lives)}`.trim();
  $("#livesValue").setAttribute("aria-label", `${state.lives} de 3 puntos de energía`);
  $("#streakValue").textContent = `🔥 ${state.streak}`;
  $("#feedbackBox").classList.add("is-hidden");
  $("#feedbackBox").classList.remove("is-error");
  $("#nextButton").classList.add("is-hidden");

  const answers = $("#answersGrid");
  answers.innerHTML = "";
  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.innerHTML = `<span class="answer-letter">${String.fromCharCode(65 + index)}</span><span></span>`;
    button.lastElementChild.textContent = option;
    button.addEventListener("click", () => selectAnswer(index));
    answers.appendChild(button);
  });
}

function selectAnswer(selectedIndex) {
  if (state.locked) return;
  state.locked = true;
  const question = QUESTION_BANK[state.grade][state.index];
  const isCorrect = selectedIndex === question.correct;
  const buttons = [...document.querySelectorAll(".answer-button")];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.correct) button.classList.add("correct");
    if (index === selectedIndex && !isCorrect) button.classList.add("incorrect");
  });

  if (isCorrect) {
    state.streak += 1;
    state.correct += 1;
    state.points += 100 + Math.min((state.streak - 1) * 20, 60);
  } else {
    state.streak = 0;
    state.lives = Math.max(0, state.lives - 1);
  }

  state.answers.push({ category: question.category, correct: isCorrect });
  $("#scoreValue").textContent = state.points.toLocaleString("es-EC");
  $("#livesValue").textContent = `${"● ".repeat(state.lives)}${"○ ".repeat(3 - state.lives)}`.trim();
  $("#streakValue").textContent = `🔥 ${state.streak}`;

  const feedback = $("#feedbackBox");
  feedback.classList.remove("is-hidden");
  feedback.classList.toggle("is-error", !isCorrect);
  $("#feedbackIcon").textContent = isCorrect ? "✓" : "!";
  $("#feedbackTitle").textContent = isCorrect ? "¡Decisión acertada!" : "Buen intento: esta es la clave";
  $("#feedbackText").textContent = question.feedback;
  const next = $("#nextButton");
  next.classList.remove("is-hidden");
  next.firstChild.textContent = state.index === 9 ? "Ver mi diagnóstico " : "Siguiente misión ";
  playTone(isCorrect ? "correct" : "incorrect");
  next.focus();
}

function nextQuestion() {
  if (!state.locked) return;
  if (state.index < 9) {
    state.index += 1;
    renderQuestion();
    $("#questionText").focus?.();
  } else {
    renderResults();
  }
}

function getOverallLevel(score) {
  if (score >= 9) return { label: "Dominio destacado", message: "Demuestras bases sólidas para asumir retos de mayor complejidad y aplicar tus conocimientos en proyectos." , trophy: "🏆" };
  if (score >= 7) return { label: "Logro esperado", message: "Tienes buenas bases. El siguiente paso es reforzar algunos conceptos mediante retos prácticos y validación." , trophy: "🌟" };
  if (score >= 4) return { label: "En desarrollo", message: "Ya reconoces varias ideas importantes. Practicaremos los conceptos con ejemplos, equipos y prototipos." , trophy: "🧭" };
  return { label: "Bases por construir", message: "Este es tu punto de partida. Comenzaremos con experiencias sencillas para desarrollar cada habilidad paso a paso." , trophy: "🌱" };
}

function renderResults() {
  const level = LEVELS[state.grade];
  const overall = getOverallLevel(state.correct);
  $("#resultTrophy").textContent = overall.trophy;
  $("#resultTitle").textContent = `¡Misión ${level.code} completada!`;
  $("#resultSummary").textContent = `${state.student}, terminaste las 10 misiones del nivel ${level.label}.`;
  $("#finalCorrect").textContent = state.correct;
  $("#scoreRing").style.background = `conic-gradient(${level.color} ${state.correct * 10}%, #dfe5f4 0)`;
  $("#resultLevel").textContent = overall.label;
  $("#recommendationText").textContent = overall.message;
  $("#resultName").textContent = state.student;
  $("#resultCourse").textContent = `${state.grade}.º ${state.parallel}`;
  $("#finalPoints").textContent = state.points.toLocaleString("es-EC");

  const grouped = {};
  state.answers.forEach(answer => {
    if (!grouped[answer.category]) grouped[answer.category] = { correct: 0, total: 0 };
    grouped[answer.category].total += 1;
    if (answer.correct) grouped[answer.category].correct += 1;
  });

  const list = $("#skillsList");
  list.innerHTML = "";
  Object.entries(grouped).forEach(([category, result]) => {
    const percentage = Math.round(result.correct / result.total * 100);
    const status = percentage === 100 ? "Fortaleza" : percentage >= 50 ? "En desarrollo" : "Reforzar";
    const row = document.createElement("div");
    row.className = "skill-row";
    row.innerHTML = `<div><strong></strong><span></span></div><div class="skill-track"><i></i></div>`;
    row.querySelector("strong").textContent = category;
    row.querySelector("span").textContent = `${result.correct}/${result.total} · ${status}`;
    row.querySelector("i").style.width = `${percentage}%`;
    list.appendChild(row);
  });

  showScreen("result");
  playTone("correct");
}

function resetGame() {
  $("#playerForm").reset();
  showScreen("start");
  $("#studentName").focus();
}

$("#playerForm").addEventListener("submit", beginGame);
$("#nextButton").addEventListener("click", nextQuestion);
$("#restartButton").addEventListener("click", resetGame);
$("#printButton").addEventListener("click", () => window.print());
$("[data-action='home']").addEventListener("click", (event) => { event.preventDefault(); resetGame(); });
$("#soundButton").addEventListener("click", (event) => {
  state.sound = !state.sound;
  event.currentTarget.textContent = state.sound ? "🔊" : "🔇";
  event.currentTarget.setAttribute("aria-label", state.sound ? "Desactivar sonidos" : "Activar sonidos");
});
