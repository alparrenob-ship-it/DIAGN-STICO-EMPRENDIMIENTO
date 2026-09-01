# Conectar Misión Emprende con Firebase

El sitio ya contiene el envío de resultados, el acceso docente y el dashboard. Solo falta vincularlo a un proyecto Firebase.

## 1. Crear la app y Firestore

1. Entra a [Firebase Console](https://console.firebase.google.com/) y crea un proyecto o selecciona uno existente.
2. En **Configuración del proyecto → Tus apps**, agrega una app **Web**. No actives Firebase Hosting: el sitio seguirá en GitHub Pages.
3. En **Compilación → Firestore Database**, crea la base de datos en modo producción y elige la región más cercana.

## 2. Activar el acceso

En **Compilación → Authentication → Sign-in method** activa:

- **Anónimo**, para que cada estudiante pueda enviar únicamente su resultado.
- **Google**, para que la docente inicie sesión.

En **Authentication → Settings → Authorized domains**, agrega:

`alparrenob-ship-it.github.io`

## 3. Completar la configuración pública

Abre `firebase-config.js` y reemplaza los valores `REEMPLAZAR_...` con el objeto `firebaseConfig` que muestra Firebase. Escribe también el correo exacto de la cuenta Google docente en `TEACHER_EMAIL`.

La configuración web (incluido `apiKey`) puede estar en el repositorio público: la seguridad depende de Authentication y de las reglas. Nunca subas un archivo de cuenta de servicio, una clave privada o una contraseña.

## 4. Publicar las reglas

Abre `firestore.rules`, sustituye `REEMPLAZAR_CORREO_DOCENTE` por el mismo correo docente y copia todo el contenido en **Firestore Database → Rules**. Pulsa **Publish**.

Estas reglas permiten:

- al estudiante crear su propio resultado y añadir después su reflexión;
- a la cuenta docente autorizada leer y descargar todos los resultados;
- a cualquier otra persona, cero acceso de lectura.

## 5. Publicar y comprobar

Sube los dos archivos modificados a la rama `main`. GitHub Pages se actualizará automáticamente. Después:

1. Completa una misión de prueba como estudiante.
2. Abre `docente.html` desde el botón **Docente**.
3. Entra con el correo autorizado y confirma que aparece el resultado.
4. Prueba **Descargar CSV** y **Guardar PDF**.
