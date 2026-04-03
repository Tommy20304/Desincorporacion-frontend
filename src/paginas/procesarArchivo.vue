<script setup>
import { ref } from 'vue';
import { api } from '../stores/apis';
import notificacionError from '../components/notificacionError.vue';
import { controlNotificaciones } from '../stores/clase';

//variables de entorno
let file = ref(null);
const fileInput = ref(null);
const isDragging = ref(false);
const isUploading = ref(false);
const procesar = ref(false);

// funciones para la experiencia del usuario

const validateFile = (selectedFile) => {
  // Validación simple de extensión
  const fileName = selectedFile.name.toLowerCase();
  const isExcel = fileName.endsWith('.xlsx');
  
  if (!isExcel) {
    notificar.activarNotificacionError("Solo se permiten archivos Excel (.xlsx)");
    return false;
  }
  return true;
};

//funciones para cambiar valores
const handleDragOver = () => { isDragging.value = true; };
const handleDragLeave = () => { isDragging.value = false; };

//elimina el archivo si no es compatible
const handleDrop = (e) => {
  isDragging.value = false;
  const droppedFiles = e.dataTransfer.files;
  if (droppedFiles.length > 0) {
    if (validateFile(droppedFiles[0])) {
      file.value = droppedFiles[0];
      clave.value = null;
    }
  }
};

//se elimina el archivo del input
const removeFile = () => {
  file.value = null;
  clave.value = null;
  if (fileInput.value) fileInput.value.value = '';
};

//se coloca el valor en la variable
let colocarValor = (event) => {
    file.value = event.target.files[0] //se accede al archivo que se selecciono
}
let clave = ref(null);
const store = api();
const manejarNotificaciones = controlNotificaciones().manejoNotificacion

const mandarArchivo = async () => {
  if(!file) return;
    const formData = new FormData();
    formData.append("fileExcel", file.value);
    formData.append('marca', clave.value);

    procesar.value = true;

    /*
    await store.mandarArchivo(formData, "comprobar");

    if(store.respuesta.modeloUnico){
      procesar.value = false;
      manejarNotificaciones.activarNotificacionError("Hay modelos que se repiten en otras marcas: "+store.respuesta.modeloUnico);
      return;
    }*/

    try{
      let respuestaPeticion = await fetch("http://localhost:3000/archivo", {
            method: "POST",
            body: formData
      });
      let respuesta = await respuestaPeticion.blob();
       const url = window.URL.createObjectURL(respuesta);
        
      //se descarga el archivo
      const a = document.createElement('a');
      a.href = url;
      a.download = "archivo procesado"; // Nombre del archivo en el cliente
      let principal = document.querySelector(".page-container");
      principal.appendChild(a);
      a.click();
    }catch(e){
        console.log(e);
        alert("hubo errores en el envio");
    }

    procesar.value = false;
}

</script>

<template>
 <div class="page-container">

    <main class="content">
      <div class="upload-card">
        <div class="card-header">
          <h2>Crear Clave de Caja</h2>
          <p>Sube tu archivo con los identificadores de los registros.</p>
        </div>

        <div 
          class="drop-zone" 
          :class="{ 'is-dragging': isDragging, 'has-file': file }"
          @dragover.prevent="handleDragOver" 
          @dragleave.prevent="handleDragLeave" 
          @drop.prevent="handleDrop"
          @click="$refs.fileInput.click()"
        >
          <input 
            type="file" 
            ref="fileInput" 
            class="hidden-input" 
            accept=".xlsx, .xls"
            @change="colocarValor"
          />

          <div v-if="!file" class="placeholder-content">
            <div class="icon-upload">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <p class="primary-text">Arrastra tu archivo Excel aquí</p>
            <p class="secondary-text">o haz clic para explorar (.xlsx)</p>
          </div>

          <div v-else class="file-preview">
            <div class="excel-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
            </div>
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>

            </div>
            <button class="remove-btn" @click.stop="removeFile">✕</button>
          </div>
        </div>

        <input v-if="file" type="text" placeholder="Clave" class="clave" v-model="clave">

        <div class="actions">
          <button 
            class="btn-submit" 
            :disabled="!file || procesar"
            @click="mandarArchivo"
          >
            <span >{{ procesar ? 'Procesando...' : 'Procesar Archivo' }}</span>
          </button>
        </div>
      </div>
    </main>
  </div>
   <notificacionError :activar="manejarNotificaciones.activarError" :texto="manejarNotificaciones.texto"  @cerrar="manejarNotificaciones.activarError = false"/>
 
</template>

<style scoped>
/* Reset básico para el componente */
* {
  box-sizing: border-box;
}

/* Colores Profesionales */
:root {
  --primary-green: #2E7D32;      /* Verde Bosque */
  --light-green: #E8F5E9;        /* Fondo muy suave */
  --accent-green: #4CAF50;       /* Verde botón */
  --hover-green: #1B5E20;        /* Verde oscuro hover */
  --text-dark: #263238;
  --text-gray: #78909C;
  --border-color: #CFD8DC;
}

.page-container {
  min-height: 100vh;
  background-color: #f4f7f4; /* Fondo grisáceo verdoso muy sutil */
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
}


/* Contenido Principal */
.content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.upload-card {
  background: white;
  width: 100%;
  max-width: 500px;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  text-align: center;
}

.card-header h2 {
  color: #263238;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.card-header p {
  color: #78909C;
  font-size: 0.95rem;
  margin-bottom: 2rem;
}

/* Drop Zone */
.drop-zone {
  border: 2px dashed #CFD8DC;
  border-radius: 8px;
  padding: 2.5rem 1rem;
  background-color: #FAFAFA;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.drop-zone:hover, .drop-zone.is-dragging {
  border-color: #4CAF50;
  background-color: #E8F5E9;
  transform: translateY(-2px);
}

.drop-zone.has-file {
  border-style: solid;
  border-color: #2E7D32;
  background-color: #fff;
  padding: 1.5rem;
}

.hidden-input {
  display: none;
}

.icon-upload {
  color: #2E7D32;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.primary-text {
  font-weight: 600;
  color: #37474F;
  margin: 0 0 0.5rem 0;
}

.secondary-text {
  color: #90A4AE;
  font-size: 0.85rem;
  margin: 0;
}

/* Previsualización del archivo */
.file-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.excel-icon {
  background: #E8F5E9;
  padding: 10px;
  border-radius: 8px;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 600;
  color: #2E7D32;
  font-size: 0.95rem;
  word-break: break-all;
}

.file-size {
  font-size: 0.8rem;
  color: #78909C;
}

.remove-btn {
  background: none;
  border: none;
  color: #B0BEC5;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: #ef5350;
}

/* Mensajes y Botones */
.error-message {
  color: #d32f2f;
  font-size: 0.85rem;
  margin-top: 1rem;
  background: #ffebee;
  padding: 0.5rem;
  border-radius: 4px;
}

.actions {
  margin-top: 2rem;
}

.btn-submit {
  width: 100%;
  background-color: #2E7D32;
  color: white;
  border: none;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
}

.btn-submit:hover:not(:disabled) {
  background-color: #1B5E20;
}

.btn-submit:disabled {
  background-color: #B0BEC5;
  cursor: not-allowed;
}

.opciones-adicionales {
  text-align: left;
  margin-bottom: 1.5rem;
}

.link-olvido {
  font-size: 0.8rem;
  color: #42b883;
  text-decoration: none;
  font-family: Arial, Helvetica, sans-serif;
}

.link-olvido:hover {
  text-decoration: underline;
}

/* Barra de Progreso */
.progress-container {
  height: 4px;
  background-color: #E0E0E0;
  border-radius: 2px;
  margin-top: 1rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.2s ease;
}

/* Loader Spinner Simple */
.loader {
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top: 3px solid white;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.clave{
    padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: 0.2s;
  outline: none;
  margin-top: 30px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
