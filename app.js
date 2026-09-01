import { saveBonusReflection, saveDiagnosticResult } from "./firebase-service.js";

const LEVELS = {
  4: { code: "DISCOVER", label: "Descubrir", avatar: "🔎", difficulty: "Entrepreneur Mindset", color: "#25c2d6", reward: "Moneda Semilla +1", badge: ["🔎", "Detector de oportunidades", "Reconoce necesidades y propone ideas"] },
  5: { code: "CREATE", label: "Crear", avatar: "💡", difficulty: "Innovation Mindset", color: "#6554e8", reward: "Pase de Innovación +1", badge: ["💡", "Creador de soluciones", "Aplica creatividad y Design Thinking"] },
  6: { code: "BUILD", label: "Construir", avatar: "🛠️", difficulty: "Business Mindset", color: "#ff9d42", reward: "Capital Inicial +1", badge: ["🛠️", "Constructor de negocios", "Conecta mercado, valor y finanzas"] },
  7: { code: "SCALE", label: "Escalar", avatar: "🚀", difficulty: "Startup Mindset", color: "#ff6689", reward: "Golden Ticket Series A +1", badge: ["🚀", "Fundador de startup", "Valida, escala y usa tecnología con propósito"] }
};

const SWEET_MISSIONS = { 4: 6, 5: 8, 6: 8, 7: 8 };
const BOSS_AVATARS = { 4: "👾", 5: "🤖", 6: "🐉", 7: "🦠" };

const q = (category, title, options, correct, feedback) => ({ type: "question", category, title, options, correct, feedback });
const collect = (category, title, instruction, items, correct, feedback) => ({ type: "collect", category, title, instruction, items, correct, feedback });
const sequence = (category, title, instruction, items, correct, feedback) => ({ type: "sequence", category, title, instruction, items, correct, feedback });
const sort = (category, title, instruction, groups, items, feedback) => ({ type: "sort", category, title, instruction, groups, items, feedback });
const scenario = (category, title, instruction, steps, feedback) => ({ type: "scenario", category, title, instruction, steps, feedback });

const MISSION_BANK = {
  4: [
    q("Necesidades y problemas", "En el recreo no hay dónde colocar botellas vacías. ¿Qué identificó una persona emprendedora?", ["Un problema que puede resolverse", "Un premio para ganar", "Una razón para no actuar", "Un producto terminado"], 0, "Emprender comienza al observar una necesidad o un problema que afecta a otras personas."),
    collect("Necesidades y problemas", "Reto: detective de necesidades", "Selecciona todas las situaciones que representan una necesidad o problema real.", ["Un estudiante no tiene dónde guardar su botella", "Querer el videojuego más nuevo", "Las plantas del aula se secan durante las vacaciones", "Cambiar de mochila cada semana", "Se desperdicia mucha comida en el recreo"], [0, 2, 4], "Las oportunidades aparecen cuando observamos dificultades reales que afectan a otras personas o al entorno."),
    q("Producto y servicio", "Mateo ayuda a pasear perros y recibe un pago. ¿Qué ofrece?", ["Un servicio", "Una materia prima", "Un producto de fábrica", "Una moneda"], 0, "Un servicio es una actividad que una persona realiza para ayudar o atender a otra."),
    sort("Producto y servicio", "Reto: los dos cofres", "Clasifica cada ejemplo como producto o servicio.", ["Producto", "Servicio"], [{ text: "Separador de libros", group: 0 }, { text: "Pasear una mascota", group: 1 }, { text: "Pulsera artesanal", group: 0 }, { text: "Ayudar a ordenar una biblioteca", group: 1 }], "Un producto es un objeto; un servicio es una actividad que resuelve una necesidad."),
    q("Cliente y valor", "Si diseñas loncheras para estudiantes, ¿quiénes serían tus posibles clientes?", ["Quienes necesitan o comprarían las loncheras", "Solo quienes fabrican lápices", "Únicamente los profesores", "Nadie, porque no hay que preguntar"], 0, "El cliente es la persona que necesita, elige o compra un producto o servicio."),
    collect("Cliente y valor", "Reto: encuentra al cliente", "Una botella pequeña y resistente fue creada para llevar agua durante la jornada escolar. Selecciona a sus clientes más probables.", ["Estudiantes", "Familias que preparan la mochila", "Una fábrica de muebles", "Personas que nunca usan botellas", "Docentes que llevan agua al aula"], [0, 1, 4], "El cliente correcto comparte la necesidad que nuestro producto busca resolver."),
    q("Dinero y ahorro", "Una pulsera cuesta $2 en materiales y se vende en $3. ¿Cuánto queda como ganancia simple?", ["$1", "$2", "$3", "$5"], 0, "La ganancia simple se obtiene al restar el costo al precio de venta: $3 − $2 = $1."),
    sort("Dinero y ahorro", "Reto: protege tus monedas", "Decide si cada acción representa ahorro o gasto.", ["Ahorro", "Gasto"], [{ text: "Guardar $2 para comprar materiales", group: 0 }, { text: "Comprar un dulce", group: 1 }, { text: "Separar monedas para una meta", group: 0 }, { text: "Pagar por una cartulina", group: 1 }], "Ahorrar es reservar dinero para una meta; gastar es usarlo para adquirir algo."),
    q("Creatividad y equipo", "Tu primera idea no funciona. ¿Qué haría una persona emprendedora?", ["La mejora y vuelve a probar", "Se rinde de inmediato", "Culpa a los demás", "Oculta el problema"], 0, "Las personas emprendedoras aprenden, mejoran sus ideas y perseveran."),
    scenario("Reto integrador", "Jefe de nivel: prepara el Idea Day", "Toma tres decisiones para presentar una idea útil en la mini feria.", [
      { prompt: "Primero debes elegir una oportunidad.", options: ["Muchos niños pierden sus lápices", "Copiar un producto sin preguntar", "Vender cualquier cosa"], correct: 0 },
      { prompt: "¿Qué solución responde mejor al problema?", options: ["Un organizador de lápices con nombre", "Una pulsera decorativa", "Un afiche sin utilidad"], correct: 0 },
      { prompt: "¿Qué haces antes de producir muchos?", options: ["Muestras un ejemplo y preguntas opiniones", "Fabricas cien de inmediato", "Ignoras al cliente"], correct: 0 }
    ], "Una idea emprendedora conecta un problema real, una solución útil y la opinión de sus clientes.")
  ],
  5: [
    q("Design Thinking", "Un equipo quiere mejorar el recreo escolar. ¿Cuál debería ser su primer paso?", ["Observar y escuchar a los estudiantes", "Construir la solución final", "Elegir un precio", "Crear publicidad"], 0, "Design Thinking inicia con empatizar: observar, escuchar y comprender a las personas."),
    sequence("Design Thinking", "Reto: activa la ruta de innovación", "Toca las fases en el orden correcto.", ["Prototipar", "Empatizar", "Testear", "Idear", "Definir"], ["Empatizar", "Definir", "Idear", "Prototipar", "Testear"], "La ruta es: empatizar, definir, idear, prototipar y testear."),
    q("Creatividad y prototipo", "¿Qué acción representa mejor la etapa de idear?", ["Proponer muchas soluciones antes de elegir", "Quedarse con la primera idea", "Calcular únicamente el precio", "Fabricar cien unidades"], 0, "Idear significa generar varias alternativas y seleccionar la más útil y posible."),
    collect("Empatía", "Reto: entrevista al usuario", "Selecciona todas las preguntas que ayudan a comprender al usuario.", ["¿Qué dificultad tienes?", "¿Cómo te sientes cuando ocurre?", "¿Te gusta mi idea aunque aún no la conoces?", "¿Qué solución utilizas ahora?", "¿Cuánto dinero tengo yo?"], [0, 1, 3], "Una buena entrevista explora experiencias, emociones y soluciones actuales sin inducir respuestas."),
    q("Prototipado", "¿Para qué sirve un prototipo?", ["Para representar, probar y mejorar una idea", "Para evitar escuchar opiniones", "Para reemplazar al cliente", "Para asegurar ganancias"], 0, "Un prototipo permite aprender antes de construir el producto final."),
    sort("Feedback e iteración", "Reto: laboratorio de feedback", "Clasifica las decisiones según ayuden o no a mejorar el prototipo.", ["Ayuda a mejorar", "No ayuda"], [{ text: "Registrar lo que dijo el usuario", group: 0 }, { text: "Ignorar una falla repetida", group: 1 }, { text: "Cambiar una parte y volver a probar", group: 0 }, { text: "Defender la idea sin escuchar", group: 1 }], "El feedback se convierte en aprendizaje cuando se registra, analiza y usa para iterar."),
    q("Marca y cliente", "¿Qué hace que una marca sea fácil de reconocer?", ["Un nombre, identidad y mensaje coherentes", "Cambiar de nombre todos los días", "Copiar exactamente a otra empresa", "No explicar qué ofrece"], 0, "Una marca comunica quién es el emprendimiento y ayuda a diferenciarlo."),
    sequence("Producción y calidad", "Reto: enciende la cadena productiva", "Ordena el proceso para transformar una idea en un producto de calidad.", ["Controlar la calidad", "Conseguir materia prima", "Entregar al cliente", "Transformar los materiales"], ["Conseguir materia prima", "Transformar los materiales", "Controlar la calidad", "Entregar al cliente"], "Producir implica conseguir materiales, transformarlos, verificar la calidad y entregar valor."),
    q("Costos y utilidad", "Crear una libreta cuesta $4 y se vende en $6. ¿Cuál es la utilidad por unidad?", ["$2", "$4", "$6", "$10"], 0, "La utilidad por unidad es precio de venta menos costo: $6 − $4 = $2."),
    scenario("Reto integrador", "Jefe de nivel: rescata el Innovation Lab", "Completa la ruta para transformar un problema en una solución probada.", [
      { prompt: "Los estudiantes pierden sus tareas. ¿Qué haces primero?", options: ["Los entrevistas y observas", "Diseñas una app final", "Creas publicidad"], correct: 0 },
      { prompt: "Descubres que olvidan revisar la agenda. ¿Qué construyes?", options: ["Un prototipo sencillo de recordatorio", "Cien productos", "Un logo sin solución"], correct: 0 },
      { prompt: "Tres usuarios no entienden un botón. ¿Qué haces?", options: ["Lo mejoras y vuelves a probar", "Ignoras el comentario", "Cambias de problema"], correct: 0 }
    ], "Design Thinking convierte la empatía en una solución que se prueba, aprende y mejora.")
  ],
  6: [
    q("Mercado y cliente", "Un equipo crea termos para deportistas. ¿Qué debe investigar primero?", ["Quién los necesita, qué valora y cuánto pagaría", "Solo el color favorito del equipo", "El nombre de una empresa famosa", "Los seguidores del profesor"], 0, "Conocer al cliente y su contexto permite diseñar una propuesta basada en evidencia."),
    collect("Mercado y cliente", "Reto: activa el radar de mercado", "Selecciona los datos que realmente ayudan a conocer el mercado.", ["Necesidades del cliente", "Alternativas de la competencia", "Color favorito del equipo", "Precio que el usuario considera justo", "Número de letras del logotipo"], [0, 1, 3], "El mercado se comprende investigando clientes, alternativas, precios y comportamientos."),
    q("Propuesta de valor", "¿Cuál es la propuesta de valor más clara?", ["Botella resistente que mantiene fría el agua durante la jornada", "Vendemos cosas muy buenas", "Somos los mejores porque sí", "Tenemos muchos colores"], 0, "Una propuesta de valor explica qué beneficio ofrece, a quién y por qué es útil o diferente."),
    sort("Modelo Canvas", "Reto: reconstruye el Canvas", "Ubica cada elemento en el bloque al que pertenece.", ["Segmento de clientes", "Recursos clave"], [{ text: "Estudiantes deportistas", group: 0 }, { text: "Máquina de impresión", group: 1 }, { text: "Familias que compran termos", group: 0 }, { text: "Equipo de diseño", group: 1 }], "El Canvas conecta a las personas para quienes creamos valor con los recursos necesarios para hacerlo."),
    q("Finanzas", "¿Cuál es un costo variable en un negocio de galletas?", ["La harina usada en cada lote", "El permiso anual", "El diseño inicial del logo", "Una mesa comprada una vez"], 0, "Un costo variable cambia según la cantidad producida."),
    sort("Finanzas", "Reto: clasificador financiero", "Clasifica los costos de una pequeña cafetería.", ["Costo fijo", "Costo variable"], [{ text: "Arriendo mensual", group: 0 }, { text: "Fruta para cada batido", group: 1 }, { text: "Internet mensual", group: 0 }, { text: "Vasos usados por venta", group: 1 }], "Los costos fijos se mantienen durante un periodo; los variables cambian con la producción o las ventas."),
    q("Validación y métricas", "¿Cuál es una evidencia útil para validar una idea?", ["Pruebas y opiniones de usuarios reales", "La opinión de una sola persona del equipo", "El número de colores", "Una suposición sin comprobar"], 0, "Validar significa comprobar nuestras suposiciones con usuarios, pruebas y datos."),
    collect("Validación y métricas", "Reto: bóveda de evidencias", "Selecciona todas las evidencias que servirían para decidir si una app funciona.", ["Usuarios que regresan cada semana", "Entrevistas después de probarla", "La intuición del líder", "Cantidad de tareas completadas", "El color preferido del programador"], [0, 1, 3], "Las métricas y el feedback convierten suposiciones en decisiones fundamentadas."),
    q("Tecnología y Web3", "¿Cuál describe mejor una blockchain?", ["Un registro digital compartido, enlazado y difícil de alterar", "Una red social de fotos", "Un videojuego sin internet", "Una carpeta de una sola persona"], 0, "Blockchain registra información en bloques conectados y distribuidos entre participantes de una red."),
    scenario("Reto integrador", "Jefe de nivel: consigue la Seed Round", "Toma decisiones para presentar un negocio listo para recibir inversión.", [
      { prompt: "Las ventas son bajas. ¿Qué analizas primero?", options: ["Cliente, competencia y propuesta de valor", "Solo el logo", "El nombre del equipo"], correct: 0 },
      { prompt: "Tienes $100 de inversión. ¿Qué decisión es responsable?", options: ["Crear y probar un lote pequeño", "Gastar todo en decoración", "Producir sin presupuesto"], correct: 0 },
      { prompt: "¿Qué dato mostrarías al inversionista?", options: ["Resultados de pruebas y costos", "Una promesa sin evidencia", "Solo una animación"], correct: 0 }
    ], "Una inversión se solicita con un mercado comprendido, un modelo claro, finanzas responsables y evidencia.")
  ],
  7: [
    q("Oportunidad e innovación", "¿Cuál situación representa una oportunidad de innovación?", ["Un problema frecuente sin solución satisfactoria", "Una idea que no beneficia a nadie", "Copiar sin cambios", "Usar tecnología sin propósito"], 0, "Una oportunidad aparece cuando existe una necesidad relevante y espacio para crear una solución mejor."),
    collect("Innovación y SCAMPER", "Reto: activa SCAMPER", "Selecciona las acciones que ayudan a transformar creativamente una idea.", ["Sustituir una parte", "Combinar funciones", "Copiar exactamente", "Adaptar a otro usuario", "Ignorar el problema"], [0, 1, 3], "SCAMPER propone sustituir, combinar, adaptar, modificar, dar otros usos, eliminar y reordenar."),
    q("MVP y validación", "¿Qué es un MVP?", ["La versión mínima funcional para probar la hipótesis principal", "El producto final con todas las funciones", "Una presentación sin prototipo", "Una campaña publicitaria"], 0, "El MVP valida lo esencial antes de invertir más recursos."),
    sort("MVP y priorización", "Reto: construye el MVP", "Una app escolar conecta estudiantes con tutorías. Clasifica las funciones.", ["Esencial para probar", "Puede esperar"], [{ text: "Solicitar una tutoría", group: 0 }, { text: "Perfil con veinte avatares", group: 1 }, { text: "Confirmar horario", group: 0 }, { text: "Tienda de accesorios digitales", group: 1 }], "Un MVP incluye solo lo necesario para probar si la solución realmente aporta valor."),
    q("Métricas y datos", "Una app tuvo 100 registros, pero solo 12 usuarios regresaron. ¿Qué revela?", ["Existe baja retención y debemos investigar", "La idea está totalmente validada", "El precio es correcto", "La blockchain funciona"], 0, "La retención muestra cuántas personas continúan usando la solución."),
    collect("Métricas y datos", "Reto: detective de métricas", "Selecciona las métricas que ayudan a saber si una solución genera valor.", ["Usuarios activos", "Retención semanal", "Cantidad de efectos visuales", "Tareas completadas", "Horas invertidas en el logo"], [0, 1, 3], "Las métricas útiles observan comportamiento, uso, permanencia y resultados."),
    q("Modelo y escalabilidad", "¿Qué hace escalable a un modelo digital?", ["Atiende más usuarios sin aumentar costos al mismo ritmo", "Duplica todos sus recursos por cliente", "Depende de un comprador", "No mide resultados"], 0, "Escalar implica crecer de manera sostenible y eficiente."),
    sort("IA y tecnología ética", "Reto: verificador tecnológico", "Clasifica las decisiones sobre IA, datos y blockchain.", ["Uso responsable", "Uso riesgoso"], [{ text: "Proteger datos personales", group: 0 }, { text: "Aceptar toda respuesta de IA", group: 1 }, { text: "Justificar por qué usar blockchain", group: 0 }, { text: "Publicar información privada", group: 1 }], "La tecnología con propósito exige privacidad, pensamiento crítico, transparencia y justificación."),
    q("Web3 y blockchain", "¿Qué ventaja puede aportar blockchain a la trazabilidad?", ["Registrar el recorrido de un producto de forma verificable", "Garantizar ganancias", "Eliminar la protección de datos", "Convertir cualquier imagen en empresa"], 0, "Blockchain puede aportar trazabilidad cuando su uso está justificado y protege los datos."),
    scenario("Reto integrador", "Jefe de nivel: presenta tu Series A", "Completa las decisiones clave de un pitch para inversionistas.", [
      { prompt: "¿Cómo debes iniciar el pitch?", options: ["Con un problema relevante y evidencia", "Con los colores del logo", "Con todas las funciones futuras"], correct: 0 },
      { prompt: "¿Qué demuestra que el MVP genera valor?", options: ["Usuarios, pruebas y métricas", "Una opinión del equipo", "Una promesa"], correct: 0 },
      { prompt: "¿Qué debe explicar la solicitud de inversión?", options: ["Cuánto se necesita, para qué y qué resultado se espera", "Solo que se necesita dinero", "Un gasto sin presupuesto"], correct: 0 }
    ], "Un pitch de inversión conecta problema, solución, validación, modelo escalable y uso claro de los recursos.")
  ]
};

const state = { student: "", grade: 4, parallel: "", index: 0, points: 0, keys: 0, streak: 0, maxStreak: 0, correct: 0, mistakes: 0, answers: [], sound: true, locked: false, challenge: null, bonusUnlocked: false, sweetUnlocked: false, resultId: null };
const $ = selector => document.querySelector(selector);
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
    oscillator.frequency.value = type === "correct" ? 620 : type === "unlock" ? 760 : 210;
    oscillator.type = type === "incorrect" ? "triangle" : "sine";
    gain.gain.setValueAtTime(.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .25);
    oscillator.start(); oscillator.stop(ctx.currentTime + .25);
  } catch (_) { /* El juego continúa si el navegador bloquea el audio. */ }
}

function playBeat(step) {
  if (!state.sound) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain); gain.connect(ctx.destination);
    oscillator.frequency.value = 360 + (step * 85);
    gain.gain.setValueAtTime(.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .16);
    oscillator.start(); oscillator.stop(ctx.currentTime + .16);
  } catch (_) { /* El reto también funciona sin audio. */ }
}

function beginGame(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  Object.assign(state, { student: data.get("studentName").trim(), grade: Number(data.get("grade")), parallel: data.get("parallel"), index: 0, points: 0, keys: 0, streak: 0, maxStreak: 0, correct: 0, mistakes: 0, answers: [], locked: false, challenge: null, bonusUnlocked: false, sweetUnlocked: false, resultId: null });
  const level = LEVELS[state.grade];
  $("#hudAvatar").textContent = level.avatar;
  $("#hudName").textContent = state.student;
  $("#hudGrade").textContent = `${state.grade}.º ${state.parallel} · ${level.code}`;
  showScreen("game");
  renderMission();
}

function renderTrail() {
  const trail = $("#missionTrail");
  trail.innerHTML = "";
  MISSION_BANK[state.grade].forEach((mission, index) => {
    const node = document.createElement("div");
    node.className = "mission-node";
    if (mission.type !== "question") node.classList.add("is-challenge");
    if (index < state.index) node.classList.add("is-done");
    if (index === state.index) node.classList.add("is-current");
    node.innerHTML = `<span>${index < state.index ? "✓" : index + 1}</span><small>${mission.type === "question" ? "PREGUNTA" : "RETO"}</small>`;
    trail.appendChild(node);
  });
}

function renderMission() {
  state.locked = false;
  state.challenge = { selected: [], assignments: {}, sequence: [], step: 0, stepAnswers: [] };
  const mission = MISSION_BANK[state.grade][state.index];
  const level = LEVELS[state.grade];
  const progress = (state.index + 1) * 10;
  $("#missionLabel").textContent = `Misión ${state.index + 1} de 10`;
  $("#progressPercent").textContent = `${progress}%`;
  $("#progressBar").style.width = `${progress}%`;
  $(".progress-track").setAttribute("aria-valuenow", String(progress));
  $("#categoryBadge").textContent = mission.type === "question" ? mission.category : `♦ RETO · ${mission.category}`;
  const isPrizeMission = mission.type === "question" && state.index === SWEET_MISSIONS[state.grade];
  $("#difficultyBadge").textContent = isPrizeMission ? "🍬 Pregunta Premio" : level.difficulty;
  $("#prizeBanner").classList.toggle("is-hidden", !isPrizeMission);
  $("#questionText").textContent = mission.title;
  $("#questionHint").textContent = mission.type === "question" ? "Elige la opción que consideres correcta." : mission.instruction;
  updateHud(); renderTrail();
  $("#feedbackBox").classList.add("is-hidden");
  $("#feedbackBox").classList.remove("is-error");
  $("#nextButton").classList.add("is-hidden");
  $("#challengeButton").classList.add("is-hidden");
  $("#answersGrid").innerHTML = "";
  if (mission.type === "question") renderQuestion(mission);
  if (mission.type === "collect") renderCollect(mission);
  if (mission.type === "sequence") renderSequence(mission);
  if (mission.type === "sort") renderSort(mission);
  if (mission.type === "scenario") renderScenario(mission);
}

function makeAnswerButton(text, index, handler, letter = true) {
  const button = document.createElement("button");
  button.className = "answer-button"; button.type = "button";
  button.innerHTML = `${letter ? `<span class="answer-letter">${String.fromCharCode(65 + index)}</span>` : ""}<span></span>`;
  button.lastElementChild.textContent = text;
  button.addEventListener("click", handler);
  return button;
}

function renderQuestion(mission) {
  mission.options.forEach((option, index) => $("#answersGrid").appendChild(makeAnswerButton(option, index, () => completeQuestion(index))));
}

function completeQuestion(selectedIndex) {
  if (state.locked) return;
  const mission = MISSION_BANK[state.grade][state.index];
  const correct = selectedIndex === mission.correct;
  [...document.querySelectorAll(".answer-button")].forEach((button, index) => {
    button.disabled = true;
    if (index === mission.correct) button.classList.add("correct");
    if (index === selectedIndex && !correct) button.classList.add("incorrect");
  });
  completeMission(correct);
}

function renderCollect(mission) {
  state.challenge.runnerIndex = 0;
  const game = document.createElement("div");
  game.className = "runner-game";
  game.innerHTML = `<div class="game-title"><span>🐦 KINTI RUN</span><strong id="runnerCounter">1/${mission.items.length}</strong></div><div class="runner-stage"><div class="runner-sky">✦　·　☁️</div><div class="kinti-runner" aria-label="Kinti">🐦</div><div class="runner-item" id="runnerItem"></div><div class="runner-ground"></div></div><p class="runner-instruction">¿Kinti debe recogerlo porque ayuda a cumplir la misión?</p><div class="runner-controls"><button type="button" class="collect-action">✨ Recoger</button><button type="button" class="avoid-action">↗ Saltar</button></div>`;
  $("#answersGrid").appendChild(game);

  const showItem = () => {
    $("#runnerCounter").textContent = `${state.challenge.runnerIndex + 1}/${mission.items.length}`;
    const item = $("#runnerItem");
    item.textContent = mission.items[state.challenge.runnerIndex];
    item.classList.remove("runner-pop");
    void item.offsetWidth;
    item.classList.add("runner-pop");
  };

  const decide = shouldCollect => {
    if (state.locked || state.challenge.transitioning) return;
    state.challenge.transitioning = true;
    game.querySelectorAll("button").forEach(button => { button.disabled = true; });
    if (shouldCollect) state.challenge.selected.push(state.challenge.runnerIndex);
    $(".kinti-runner").classList.add(shouldCollect ? "is-collecting" : "is-jumping");
    setTimeout(() => {
      state.challenge.runnerIndex += 1;
      if (state.challenge.runnerIndex >= mission.items.length) {
        const selected = [...state.challenge.selected].sort((a, b) => a - b);
        const correct = [...mission.correct].sort((a, b) => a - b);
        completeMission(JSON.stringify(selected) === JSON.stringify(correct));
        return;
      }
      $(".kinti-runner").classList.remove("is-collecting", "is-jumping");
      state.challenge.transitioning = false;
      game.querySelectorAll("button").forEach(button => { button.disabled = false; });
      showItem();
    }, 330);
  };
  game.querySelector(".collect-action").addEventListener("click", () => decide(true));
  game.querySelector(".avoid-action").addEventListener("click", () => decide(false));
  showItem();
}

function renderSequence(mission) {
  const rhythm = document.createElement("div");
  rhythm.className = "rhythm-header";
  rhythm.innerHTML = `<span>🎵 RITMO EMPRENDEDOR</span><div>${mission.correct.map((_, index) => `<i data-beat="${index}"></i>`).join("")}</div><small>Construye la secuencia y activa toda la melodía.</small>`;
  $("#answersGrid").appendChild(rhythm);
  const board = document.createElement("div");
  board.className = "sequence-board rhythm-board";
  $("#answersGrid").appendChild(board);
  const confirm = $("#challengeButton");
  mission.items.forEach((item, index) => {
    const button = makeAnswerButton(item, index, () => {
      if (state.locked || state.challenge.sequence.includes(item)) return;
      state.challenge.sequence.push(item); button.disabled = true; button.classList.add("is-selected", "rhythm-hit");
      playBeat(state.challenge.sequence.length);
      rhythm.querySelector(`[data-beat="${state.challenge.sequence.length - 1}"]`).classList.add("is-lit");
      const chip = document.createElement("span");
      chip.className = "sequence-chip"; chip.textContent = `${state.challenge.sequence.length}. ${item}`; board.appendChild(chip);
      confirm.disabled = state.challenge.sequence.length !== mission.correct.length;
    });
    $("#answersGrid").appendChild(button);
  });
  const reset = document.createElement("button");
  reset.className = "secondary-mini"; reset.type = "button"; reset.textContent = "↺ Reiniciar orden";
  reset.addEventListener("click", () => {
    state.challenge.sequence = []; board.innerHTML = "";
    rhythm.querySelectorAll("i").forEach(beat => beat.classList.remove("is-lit"));
    document.querySelectorAll(".answer-button").forEach(button => { button.disabled = false; button.classList.remove("is-selected"); });
    confirm.disabled = true;
  });
  $("#answersGrid").appendChild(reset);
  confirm.textContent = "🎤 Activar la canción"; confirm.disabled = true; confirm.classList.remove("is-hidden");
  confirm.onclick = () => completeMission(JSON.stringify(state.challenge.sequence) === JSON.stringify(mission.correct));
}

function renderSort(mission) {
  state.challenge.sortIndex = 0;
  const game = document.createElement("div");
  game.className = "catch-game";
  game.innerHTML = `<div class="game-title"><span>🪙 ATRAPA Y CLASIFICA</span><strong id="catchCounter">1/${mission.items.length}</strong></div><div class="catch-zone"><div class="falling-card" id="fallingCard"></div></div><div class="catch-bins"></div>`;
  const bins = game.querySelector(".catch-bins");
  mission.groups.forEach((group, groupIndex) => {
    const button = document.createElement("button");
    button.type = "button"; button.innerHTML = `<span>${groupIndex === 0 ? "📦" : "🧰"}</span><strong></strong>`;
    button.querySelector("strong").textContent = group;
    button.addEventListener("click", () => {
      if (state.locked || state.challenge.transitioning) return;
      state.challenge.transitioning = true;
      state.challenge.assignments[state.challenge.sortIndex] = groupIndex;
      state.challenge.sortIndex += 1;
      if (state.challenge.sortIndex >= mission.items.length) {
        completeMission(mission.items.every((item, index) => state.challenge.assignments[index] === item.group));
        return;
      }
      showFallingCard();
      setTimeout(() => { state.challenge.transitioning = false; }, 180);
    });
    bins.appendChild(button);
  });
  $("#answersGrid").appendChild(game);
  const showFallingCard = () => {
    $("#catchCounter").textContent = `${state.challenge.sortIndex + 1}/${mission.items.length}`;
    const card = $("#fallingCard"); card.textContent = mission.items[state.challenge.sortIndex].text;
    card.classList.remove("is-falling"); void card.offsetWidth; card.classList.add("is-falling");
  };
  showFallingCard();
}

function renderScenario(mission) {
  const step = mission.steps[state.challenge.step];
  const grid = $("#answersGrid"); grid.innerHTML = "";
  const bossHealth = Math.round((mission.steps.length - state.challenge.step) / mission.steps.length * 100);
  const battle = document.createElement("div"); battle.className = "boss-battle";
  battle.innerHTML = `<div class="boss-title"><span>⚔️ JEFE FINAL</span><strong>Ronda ${state.challenge.step + 1}/${mission.steps.length}</strong></div><div class="battle-arena"><div class="battle-player"><span>🐦</span><small>Kinti</small></div><div class="battle-flash">VS</div><div class="battle-boss"><span>${BOSS_AVATARS[state.grade]}</span><small>Problema</small></div></div><div class="boss-health"><span style="width:${bossHealth}%"></span></div>`;
  grid.appendChild(battle);
  const heading = document.createElement("div"); heading.className = "scenario-step";
  heading.innerHTML = `<span>${state.challenge.step + 1}</span><h3></h3>`; heading.querySelector("h3").textContent = step.prompt; grid.appendChild(heading);
  step.options.forEach((option, index) => grid.appendChild(makeAnswerButton(option, index, () => {
    if (state.locked || state.challenge.transitioning) return;
    state.challenge.transitioning = true;
    grid.querySelectorAll("button").forEach(button => { button.disabled = true; });
    state.challenge.stepAnswers.push(index);
    playTone(index === step.correct ? "correct" : "incorrect");
    if (state.challenge.step < mission.steps.length - 1) { state.challenge.step += 1; setTimeout(() => { state.challenge.transitioning = false; renderScenario(mission); }, 260); }
    else completeMission(mission.steps.every((item, stepIndex) => state.challenge.stepAnswers[stepIndex] === item.correct));
  })));
}

function completeMission(isCorrect) {
  if (state.locked) return;
  state.locked = true;
  const mission = MISSION_BANK[state.grade][state.index];
  document.querySelectorAll("#answersGrid button, #challengeButton").forEach(button => button.disabled = true);
  if (isCorrect) {
    state.streak += 1; state.maxStreak = Math.max(state.maxStreak, state.streak); state.correct += 1;
    state.points += (mission.type === "question" ? 100 : 160) + Math.min((state.streak - 1) * 20, 60);
  } else { state.streak = 0; state.mistakes += 1; }
  const isPrizeMission = mission.type === "question" && state.index === SWEET_MISSIONS[state.grade];
  if (isPrizeMission && isCorrect) state.sweetUnlocked = true;
  if (mission.type !== "question") state.keys += 1;
  state.answers.push({ category: mission.category, correct: isCorrect, type: mission.type });
  updateHud();
  const feedback = $("#feedbackBox"); feedback.classList.remove("is-hidden"); feedback.classList.toggle("is-error", !isCorrect);
  $("#feedbackIcon").textContent = isCorrect ? "✓" : "!";
  $("#feedbackTitle").textContent = isPrizeMission && isCorrect ? "🍬 ¡Cupón de dulce desbloqueado!" : isPrizeMission ? "El dulce se escapó, pero ganaste una pista" : isCorrect ? (mission.type === "question" ? "¡Decisión acertada!" : "¡Reto conquistado!") : "Buen intento: descubriste una pista";
  $("#feedbackText").textContent = isPrizeMission && isCorrect ? `${mission.feedback} Presenta tu cupón final a Profe Anita.` : mission.feedback;
  const next = $("#nextButton"); next.classList.remove("is-hidden");
  next.firstChild.textContent = state.index === 9 ? "Ver mi diagnóstico " : "Siguiente misión ";
  playTone(isCorrect ? "correct" : "incorrect"); next.focus();
}

function updateHud() {
  $("#scoreValue").textContent = state.points.toLocaleString("es-EC");
  $("#keysValue").textContent = `🔑 ${state.keys}/5`;
  $("#streakValue").textContent = `🔥 ${state.streak}`;
}

function nextMission() {
  if (!state.locked) return;
  if (state.index < 9) { state.index += 1; renderMission(); } else renderResults();
}

function getOverallLevel(score) {
  if (score >= 9) return { label: "Dominio destacado", message: "Demuestras bases sólidas para asumir retos de mayor complejidad y aplicar tus conocimientos en proyectos.", trophy: "🏆" };
  if (score >= 7) return { label: "Logro esperado", message: "Tienes buenas bases. El siguiente paso es reforzar algunos conceptos mediante retos prácticos y validación.", trophy: "🌟" };
  if (score >= 4) return { label: "En desarrollo", message: "Ya reconoces ideas importantes. Practicaremos los conceptos con ejemplos, equipos y prototipos.", trophy: "🧭" };
  return { label: "Bases por construir", message: "Este es tu punto de partida. Comenzaremos con experiencias sencillas para desarrollar cada habilidad paso a paso.", trophy: "🌱" };
}

function getBadges(includeBonus = false) {
  const level = LEVELS[state.grade];
  const badges = [{ icon: "🧭", name: "Explorador persistente", text: "Completó las 10 misiones" }, { icon: level.badge[0], name: level.badge[1], text: level.badge[2] }];
  if (state.mistakes > 0) badges.push({ icon: "🔥", name: "Mente resiliente", text: "Continuó aprendiendo después de equivocarse" });
  if (state.maxStreak >= 3) badges.push({ icon: "⚡", name: "Racha maestra", text: `Alcanzó ${state.maxStreak} aciertos consecutivos` });
  if (state.correct >= 9) badges.push({ icon: "🏆", name: "Dominio emprendedor", text: "Demostró dominio destacado" });
  if (state.sweetUnlocked) badges.push({ icon: "🍬", name: "Pregunta Premio", text: "Cupón de dulce pendiente de validación docente" });
  if (includeBonus) badges.push({ icon: "🎟️", name: "Bono desbloqueado", text: level.reward });
  return badges;
}

function renderBadges(includeBonus = false) {
  const shelf = $("#badgeShelf"); shelf.innerHTML = "";
  getBadges(includeBonus).forEach(badge => {
    const item = document.createElement("div"); item.className = "earned-badge";
    item.innerHTML = `<span></span><strong></strong><small></small>`;
    item.querySelector("span").textContent = badge.icon; item.querySelector("strong").textContent = badge.name; item.querySelector("small").textContent = badge.text;
    shelf.appendChild(item);
  });
}

function renderResults() {
  const level = LEVELS[state.grade]; const overall = getOverallLevel(state.correct);
  $("#resultTrophy").textContent = overall.trophy;
  $("#resultTitle").textContent = `¡Misión ${level.code} completada!`;
  $("#resultSummary").textContent = `${state.student}, conquistaste las 10 misiones y reuniste las 5 llaves.`;
  $("#finalCorrect").textContent = state.correct;
  $("#scoreRing").style.background = `conic-gradient(${level.color} ${state.correct * 10}%, #dfe5f4 0)`;
  $("#resultLevel").textContent = overall.label; $("#recommendationText").textContent = overall.message;
  $("#resultName").textContent = state.student; $("#resultCourse").textContent = `${state.grade}.º ${state.parallel}`; $("#finalPoints").textContent = state.points.toLocaleString("es-EC");
  $("#sweetReward").classList.toggle("is-hidden", !state.sweetUnlocked);
  $("#bonusName").textContent = level.reward; $("#reflectionInput").value = "";
  $("#bonusCard").classList.add("is-locked"); $("#bonusCard").classList.remove("is-unlocked"); $("#bonusIcon").textContent = "🔒";
  $("#bonusDescription").textContent = "Completa tu reflexión para desbloquear un punto adicional en la primera prueba de unidad.";
  const grouped = {};
  state.answers.forEach(answer => { if (!grouped[answer.category]) grouped[answer.category] = { correct: 0, total: 0 }; grouped[answer.category].total += 1; if (answer.correct) grouped[answer.category].correct += 1; });
  const list = $("#skillsList"); list.innerHTML = "";
  Object.entries(grouped).forEach(([category, result]) => {
    const percentage = Math.round(result.correct / result.total * 100);
    const status = percentage === 100 ? "Fortaleza" : percentage >= 50 ? "En desarrollo" : "Reforzar";
    const row = document.createElement("div"); row.className = "skill-row";
    row.innerHTML = `<div><strong></strong><span></span></div><div class="skill-track"><i></i></div>`;
    row.querySelector("strong").textContent = category; row.querySelector("span").textContent = `${result.correct}/${result.total} · ${status}`; row.querySelector("i").style.width = `${percentage}%`; list.appendChild(row);
  });
  renderBadges(); showScreen("result"); playTone("correct");
  persistResult(grouped);
}

async function persistResult(grouped) {
  const sync = $("#syncStatus");
  sync.className = "sync-status";
  sync.textContent = "Enviando el resultado al panel docente…";
  const skills = Object.entries(grouped).map(([category, result]) => ({ category, correct: result.correct, total: result.total }));
  try {
    const response = await saveDiagnosticResult({
      student: state.student,
      grade: state.grade,
      parallel: state.parallel,
      levelCode: LEVELS[state.grade].code,
      correct: state.correct,
      total: 10,
      points: state.points,
      keys: state.keys,
      maxStreak: state.maxStreak,
      performance: getOverallLevel(state.correct).label,
      sweetUnlocked: state.sweetUnlocked,
      skills,
      badges: getBadges().map(badge => badge.name)
    });
    if (!response.configured) {
      sync.classList.add("is-warning");
      sync.textContent = "Resultado visible en este dispositivo. La conexión docente está pendiente de configurar.";
      return;
    }
    state.resultId = response.id;
    sync.classList.add("is-success");
    sync.textContent = "✓ Resultado enviado de forma segura al panel docente.";
  } catch (error) {
    console.error("No se pudo enviar el resultado", error);
    sync.classList.add("is-warning");
    sync.textContent = "No se pudo enviar ahora. Conserva este reporte o avisa a tu docente.";
  }
}

async function unlockBonus() {
  const reflection = $("#reflectionInput").value.trim();
  if (reflection.length < 20) {
    $("#reflectionInput").focus(); $("#reflectionInput").setCustomValidity("Escribe una reflexión de al menos 20 caracteres."); $("#reflectionInput").reportValidity(); return;
  }
  $("#reflectionInput").setCustomValidity(""); state.bonusUnlocked = true;
  const card = $("#bonusCard"); card.classList.remove("is-locked"); card.classList.add("is-unlocked");
  $("#bonusIcon").textContent = "🎟️";
  $("#bonusDescription").textContent = `${state.student} obtuvo este beneficio por completar las 10 misiones y reflexionar sobre su aprendizaje.`;
  renderBadges(true); playTone("unlock");
  if (state.resultId) {
    try {
      await saveBonusReflection(state.resultId, reflection);
      $("#syncStatus").className = "sync-status is-success";
      $("#syncStatus").textContent = "✓ Resultado y Bono +1 actualizados en el panel docente.";
    } catch (error) {
      console.error("No se pudo actualizar el bono", error);
      $("#syncStatus").className = "sync-status is-warning";
      $("#syncStatus").textContent = "El bono está visible aquí, pero no se pudo actualizar en el panel.";
    }
  }
}

function resetGame() { $("#playerForm").reset(); showScreen("start"); $("#studentName").focus(); }
$("#playerForm").addEventListener("submit", beginGame);
$("#nextButton").addEventListener("click", nextMission);
$("#restartButton").addEventListener("click", resetGame);
$("#printButton").addEventListener("click", () => window.print());
$("#unlockBonusButton").addEventListener("click", unlockBonus);
$("#reflectionInput").addEventListener("input", event => event.currentTarget.setCustomValidity(""));
$("[data-action='home']").addEventListener("click", event => { event.preventDefault(); resetGame(); });
$("#soundButton").addEventListener("click", event => { state.sound = !state.sound; event.currentTarget.textContent = state.sound ? "🔊" : "🔇"; event.currentTarget.setAttribute("aria-label", state.sound ? "Desactivar sonidos" : "Activar sonidos"); });
