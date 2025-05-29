<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

// Definición de tipos para las propiedades de las opciones de commit
type CommitType = 'feat' | 'fix' | 'docs' | 'chore' | 'style' | 'refactor' | 'test' | 'build' | 'ci' | 'perf' | 'revert';

// Variables reactivas para el formulario, con tipos explícitos
const commitType = ref<CommitType | ''>(''); // Puede ser un tipo de commit o una cadena vacía
const commitScope = ref<string>('');
const commitSubject = ref<string>('');
const commitBody = ref<string>('');
const isBreakingChange = ref<boolean>(false);
const breakingChangeDescription = ref<string>('');
const issuesClosed = ref<string>('');

// Opciones para el tipo de commit (Conventional Commits)
const commitTypes: CommitType[] = [
  'feat', 'fix', 'docs', 'chore', 'style', 'refactor', 'test', 'build', 'ci', 'perf', 'revert'
];

// Computed property para generar el mensaje de commit en tiempo real
const generatedCommitMessage = computed<string>(() => {
  let message = '';

  // 1. Tipo y Alcance
  if (commitType.value) {
    message += `${commitType.value}`;
    if (commitScope.value) {
      message += `(${commitScope.value})`;
    }
    message += ': ';
  }

  // 2. Asunto
  if (commitSubject.value) {
    message += commitSubject.value;
  }

  // 3. Cuerpo
  if (commitBody.value) {
    message += `\n\n${commitBody.value}`;
  }

  // 4. Important Change
  if (isBreakingChange.value && breakingChangeDescription.value) {
    message += `\n\nIMPORTANT CHANGE: ${breakingChangeDescription.value}`;
  }

  // 5. Issues cerrados
  if (issuesClosed.value) {
    const issues = issuesClosed.value.split(',').map(issue => issue.trim()).filter(Boolean);
    if (issues.length > 0) {
      const formattedIssues = issues.map(issue => {
        switch (true) {
          case issue.startsWith('Fixes #'):
            return `Fixes #${issue.replace('Fixes #', '')}`;
            break;
          case issue.startsWith('Closes #'):
            return `Closes #${issue.replace('Closes #', '')}`;
            break;
          case issue.startsWith('Fixes '):
            return `Fixes #${issue.replace('Fixes ', '')}`;
            break;
          case issue.startsWith('Closes '):
            return `Closes #${issue.replace('Closes ', '')}`;
            break;
          case (!issue.startsWith('#')):
            return `Closes #${issue}`;
            break;
          default:
            return `Closes ${issue}`;
            break;
        }
      }).join('\n');
      message += `\n\n${formattedIssues}`;
    }
  }

  return message;
});

// Función para copiar al portapapeles
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedCommitMessage.value);
    toast.success('Mensaje de commit copiado al portapapeles!');
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err);
    toast.error('No se pudo copiar el mensaje. Inténtalo manualmente.');
  }
};

// Validación básica del asunto (ej. longitud)
const subjectLength = computed<number>(() => commitSubject.value.length);
const subjectWarning = computed<string>(() => subjectLength.value > 72 ? `¡Asunto demasiado largo! (${subjectLength.value}/72)` : '');
</script>

<template>
  <div class="container">
    <h1>Generador de Mensajes de Commit</h1>
    <p>Sigue la convención de <a
        href="https://dev.azure.com/DTGTCTest/GDT/_wiki/wikis/estandarizacion/225/convencion_de_commit"
        target="_blank">Canales Electronicos</a></p>

    <div class="form-grid-container">
      <div class="form-section">
        <label for="commitType">Tipo de Commit:</label>
        <select id="commitType" v-model="commitType" required>
          <option value="">Selecciona un tipo</option>
          <option v-for="type in commitTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>

      <div class="form-section">
        <label for="commitScope">Alcance (Scope - opcional):</label>
        <input type="text" id="commitScope" v-model="commitScope" placeholder="ej. auth, ui, api, checkout" required>
      </div>

      <div class="form-section full-width-2">
        <label for="commitSubject">Asunto (Subject - requerido):</label>
        <input type="text" id="commitSubject" v-model="commitSubject" maxlength="49" required>
        <p class="warning" v-if="subjectWarning">{{ subjectWarning }}</p>
      </div>

      <div class="form-section full-width">
        <label for="commitBody">Cuerpo (Body - opcional):</label>
        <textarea id="commitBody" v-model="commitBody" rows="1" maxlength="79"
          placeholder="Descripción más detallada del cambio..."></textarea>
      </div>

      <div class="form-section checkbox-group full-width">
        <input type="checkbox" id="isBreakingChange" v-model="isBreakingChange">
        <label for="isBreakingChange">¿Es un cambio importante (Important Change)?</label>
        <textarea v-if="isBreakingChange" v-model="breakingChangeDescription" rows="2"
          placeholder="Describe el cambio importante..." required></textarea>
      </div>

      <div class="form-section full-width">
        <label for="issuesClosed">Issues cerrados/referenciados (ej. #123, #456):</label>
        <input type="text" id="issuesClosed" v-model="issuesClosed"
          placeholder="ejemplo: Closes #123, #456 y/o Fixes #123, #456">
      </div>

    </div>

    <div class="output-section full-width">
      <h2>Mensaje de Commit Generado:</h2>
      <pre class="generated-message"
        :class="{ 'invalid': !commitType || !commitSubject }">{{ generatedCommitMessage || 'Completa los campos para generar el mensaje...' }}</pre>
      <button @click="copyToClipboard" :disabled="!commitType || !commitSubject">Copiar al Portapapeles</button>
      <p v-if="!commitType || !commitSubject" class="note">Selecciona un tipo y escribe el asunto para generar el
        mensaje.</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  width: 100%;
  margin: 40px auto;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
  color: #333;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

p {
  text-align: center;
  margin-bottom: 25px;
  color: #666;
}

a {
  color: #42b983;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* --- Nuevo estilo para el contenedor de 2 columnas --- */
.form-grid-container {
  display: grid;
  /* Define 3 columnas de igual tamaño con un espacio de 20px */
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20px;
  /* Espacio entre las celdas de la cuadrícula */
  margin-bottom: 20px;
}

/* Estilo para los elementos que deben ocupar toda la fila */
.form-section.full-width {
  grid-column: 1 / -1;
  /* Ocupa desde la primera columna hasta la última */
}

/* Estilo para los elementos que deben ocupar 2 columnas */
.form-section.full-width-2 {
  grid-column: 3 / -1;
  /* Ocupa desde la tercera columna hasta la última */
}

/* Estilo para los elementos que deben ocupar 2 columnas */
.form-section.full-width-3 {
  grid-column: 2 / -1;
  /* Ocupa desde la segunda columna hasta la última */
}

/* Ajuste para los form-section que ahora están dentro del grid */
.form-section {
  margin-bottom: 0;
  /* Ya no necesitamos el margin-bottom aquí, lo maneja el gap del grid */
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

input[type="text"],
textarea,
select {
  width: 100%;
  /* Asegura que ocupen todo el espacio de su columna */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
}

input[type="text"]:focus,
textarea:focus,
select:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

textarea {
  resize: vertical;
}

.checkbox-group {
  display: flex;
  align-items: center;
  /* margin-bottom: 20px; */
  /* Eliminado, ya se maneja con el gap del grid */
}

.checkbox-group input[type="checkbox"] {
  margin-right: 10px;
  transform: scale(1.2);
}

.checkbox-group label {
  margin-bottom: 0;
}

.output-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #e8f5e9;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
}

.output-section h2 {
  font-size: 1.3rem;
  color: #2e7d32;
  margin-top: 0;
  margin-bottom: 15px;
}

.generated-message {
  white-space: pre-wrap;
  background-color: #fff;
  border: 1px dashed #a5d6a7;
  padding: 15px;
  border-radius: 5px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.95rem;
  color: #333;
  min-height: 100px;
  overflow-x: auto;
}

.generated-message.invalid {
  color: #999;
  font-style: italic;
}

button {
  display: block;
  width: 100%;
  padding: 12px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px;
}

button:hover:not(:disabled) {
  background-color: #36a26d;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.warning {
  color: #d32f2f;
  font-size: 0.85rem;
  margin-top: 5px;
  font-weight: bold;
}

.note {
  color: #777;
  font-size: 0.85rem;
  text-align: center;
  margin-top: 10px;
}
</style>